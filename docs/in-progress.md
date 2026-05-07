# Interaction State Projection

## Objetivo

Registrar o contexto e o plano da migracao do modelo de estados de interacao do Kiskadee, para que
o trabalho continue recuperavel mesmo se uma sessao de IA travar.

Este arquivo e o handoff ativo de uma demanda em andamento. O repo usa um nome fixo:
`docs/in-progress.md`. Enquanto ele existir e tiver conteudo, agentes devem le-lo antes de continuar
trabalho e atualiza-lo depois de qualquer implementacao relacionada, registrando status, decisoes,
arquivos alterados e validacoes executadas. Se o arquivo nao existir ou estiver vazio, isso indica
que nao ha demanda ativa registrada; o usuario pode apagar o arquivo ou seu conteudo manualmente para
iniciar uma nova demanda/contexto.

A demanda nasceu da revisao de `packages/web-builder/docs/interaction-state-model.md` como novo
padrao para separar:

- estado nativo/semantico do DOM;
- helpers `data-*` expostos por headless primitives;
- classes projetadas Kiskadee, como `.-h`, `.-f`, `.-s`, `.-d`, `.-r` e `.-v`;
- metaclasses de seletor/efeito, como `.-a`, `.-i` e `.-e`.

## Motivacao

O problema principal e que alguns componentes ainda espalham estado visual por varios slots. Isso
faz filhos receberem classes de estado como se fossem donos do estado, quando na verdade eles apenas
reagem ao estado do componente ou de um item pai.

O novo modelo diferencia duas situacoes:

- `property--state__value`: estado inline. O proprio elemento e o dono do estado.
- `property==state__value`: estado por referencia. O filho muda porque um ancestor/scope owner esta
  em determinado estado.

Para componentes compostos, o state scope owner padrao deve ser `e1`, salvo quando um wrapper menor e
mais estavel for claramente o dono do estado. Para itens repetidos, como Tabs, o owner e o item/trigger
da aba, nao a colecao inteira.

## Decisao Arquitetural

O desenho desejado para projection e:

- o headless continua independente do CSS Kiskadee;
- o headless conhece seus slots internos (`e1`, `e2`, `e3`, etc.) porque isso ja faz parte do contrato
  de `classNames`;
- o headless calcula ou expoe o estado composto real quando isso e necessario para semantica e
  acessibilidade, como `focused`, `filled`, `disabled`, `readOnly` e `invalid`;
- `components/react` decide como projetar esses estados para o vocabulario visual Kiskadee;
- o target de projection usa os mesmos slots (`e1`, `e2`, `e3`, etc.);
- `target: 'e1'` deve ser o default para componentes compostos;
- o target indica onde o estado sera projetado, nao onde o estado nasce;
- nao comecar com array de targets, para evitar voltar ao padrao antigo de espalhar estado por varios
  slots;
- nao colocar `stateActivator` hardcoded dentro de `react-headless`.

Exemplo conceitual para TextField:

- foco real nasce no input (`e4`);
- estado visual do campo e projetado no root (`e1`);
- CSS estrutural deve mirar descendentes a partir do scope owner, por exemplo
  `.k-txf-e1.-f.-a .k-txf-e2`.

## Status Atual

Estamos antes da etapa 5.

Etapas ja feitas:

- Etapa 1 concluida: o modelo de projected states foi formalizado. `filled` foi adicionado como estado
  projetavel (`-v`) e estados foram separados de metaclasses.
- Etapa 2 concluida: auditoria por componente confirmou que TextField e o melhor piloto. Button esta
  mais perto do padrao, mas ainda tem alguns estados de label que devem virar `ref`. Tabs funciona,
  mas label/icon ainda recebem `selected` diretamente.
- Etapa 3 concluida: o schema do TextField foi migrado para usar `ref` nos estados dependentes. Os
  estados `hover`, `focus`, `disabled` e `readOnly` dos slots dependentes agora emitem `==state`, nao
  `--state`.
- Etapa 4 concluida: o runtime do TextField foi ajustado para projetar estado no `e1`. O hook
  `useStateProjection` foi criado em `packages/headless/react`, sem dependencia de Kiskadee CSS, e o
  TextField headless passou a usa-lo tanto para `data-*` quanto para projection configuravel por
  slot. `components/react` agora fornece a configuracao Kiskadee (`-f`, `-v`, `-d`, `-r`, `-a`, `-i`)
  e deixou de duplicar o estado `focused`.

Validacoes rodadas na etapa 3:

- `pnpm --filter @kiskadee/presets exec tsc --noEmit -p tsconfig.json`
- `pnpm exec biome check packages/presets/src/presets/material-3-google/components/text-field.schema.ts`
- `pnpm --filter @kiskadee/web-builder exec vitest run src/phase-1-convert-schema-to-style-keys/colors/convertElementColorsToStyleKeys.test.ts src/utils/buildStyleKey/buildStyleKey.test.ts`
- `pnpm --filter @kiskadee/web-builder run build`

Observacao: os comandos passaram, com o aviso conhecido de engine porque o repo espera Node `>=24` e
o ambiente estava em Node `v22.22.1`.

Validacoes rodadas na etapa 4:

- `pnpm --filter @kiskadee/react-headless exec tsc --noEmit -p tsconfig.json`
- `pnpm --filter @kiskadee/react-headless run build`
- `pnpm --filter @kiskadee/react-components exec tsc --noEmit -p tsconfig.json`
- `pnpm --filter @kiskadee/react-headless exec vitest run src/text-field/HeadlessTextField.test.tsx`
- `pnpm --filter @kiskadee/react-components run build`
- `pnpm exec biome check packages/headless/react/src/state-projection/useStateProjection.ts packages/headless/react/src/text-field/HeadlessTextField.tsx packages/headless/react/src/index.ts packages/components/react/src/TextField/TextField.class-names.ts packages/components/react/src/TextField/TextField.runtime.tsx packages/components/react/src/TextField/TextField.types.ts`
- `git diff --check`

Observacao: os comandos passaram, com o mesmo aviso conhecido de engine (`Node v22.22.1` no ambiente,
repo esperando `>=24`).

## Plano De Execucao

1. Formalizar projected states: adicionar `filled`/`-v` e separar/clarificar tipos de estado vs
   metaclasses.
2. Auditar schema por componente: TextField primeiro, depois Button/Tabs.
3. Migrar TextField schema: filhos dependentes do campo passam a usar `ref`/`==`.
4. Ajustar runtime TextField: projetar estado no `e1` e remover state classes dos filhos.
5. Ajustar Sass estrutural TextField: usar `e1` como state scope owner e remover seletores `data-*`
   duplicados quando nao forem parte de contrato publico necessario.
6. Criar/adaptar projection hook: default `target: 'e1'`, usando slot names `e1`/`e2`/`e3` e evitando
   array de targets no primeiro desenho.
7. Revisar Button: corrigir estados de label/icon que devem depender de `e1`.
8. Revisar Tabs: alinhar label/icon selected com o tab item/trigger como scope owner.
9. Atualizar docs finais/migracao: registrar excecoes e decisoes encontradas.

## Proxima Etapa

A proxima etapa e a etapa 5: ajustar o Sass estrutural do TextField para usar `e1` como state scope
owner e remover seletores duplicados baseados em `data-*` quando eles nao forem parte de contrato
publico necessario.

Antes de mexer em Sass estrutural, ler `STRUCTURAL-CSS.md`.

Decisoes ja tomadas na etapa 4:

- `data-*` semanticos continuam expostos pelo headless durante a migracao.
- `focused`, `filled`, `disabled` e `readOnly` sao projetados como classes Kiskadee em `e1`.
- `filled` entrou na projection runtime agora, como `-v`.
- `focused` e calculado apenas pelo headless; `components/react` nao mantem mais estado local
  duplicado.
- `hover` nao foi forcado por JS/classe nesta etapa. O padrao continua preservando pseudo-seletor
  nativo quando possivel; para TextField, `-i` fica em `e1` para permitir seletores descendentes.
- A etapa 6 deixa de ser "criar do zero" e passa a ser revisar/adaptar o hook depois que o piloto
  TextField passar pelo Sass estrutural.

Arquivos alterados na etapa 4:

- `packages/headless/react/src/state-projection/useStateProjection.ts`
- `packages/headless/react/src/text-field/HeadlessTextField.tsx`
- `packages/headless/react/src/index.ts`
- `packages/components/react/src/TextField/TextField.class-names.ts`
- `packages/components/react/src/TextField/TextField.runtime.tsx`
- `packages/components/react/src/TextField/TextField.types.ts`

Documentacao de conceito adicionada apos a etapa 4:

- `packages/headless/react/docs/concepts/interaction-state-projection-hook.md`
- `packages/headless/react/docs/concepts/README.md`
- `packages/headless/react/README.md`

Documentacao de debito tecnico mantida apenas para o que e debito real:

- `packages/headless/react/docs/technical-debt/README.md`
- `packages/headless/react/docs/technical-debt/source-structure-split.md`
- `packages/web-builder/docs/technical-debt/README.md`
- `packages/web-builder/README.md`

## Arquivos Relevantes

- `packages/web-builder/docs/interaction-state-model.md`
- `packages/presets/src/presets/material-3-google/components/text-field.schema.ts`
- `packages/components/react/src/TextField/TextField.runtime.tsx`
- `packages/components/react/src/TextField/TextField.class-names.ts`
- `packages/headless/react/src/text-field/HeadlessTextField.tsx`
- `packages/components/react/src/TextField/*.structural.scss`
- `packages/presets/src/presets/material-3-google/components/button.schema.ts`
- `packages/presets/src/presets/material-3-google/components/tabs/*.schema.ts`

## Cuidados

- Nao mover `stateActivator` para `react-headless`.
- Nao reintroduzir state classes em filhos dependentes.
- Nao comecar com projection para varios targets sem necessidade concreta.
- Antes de mexer em Sass estrutural em `packages/components/react`, ler `STRUCTURAL-CSS.md`.
- Manter cada etapa pequena e validada; TextField e o piloto antes de Button/Tabs.
