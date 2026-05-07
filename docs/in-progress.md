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

Estamos antes da etapa 4.

Etapas ja feitas:

- Etapa 1 concluida: o modelo de projected states foi formalizado. `filled` foi adicionado como estado
  projetavel (`-v`) e estados foram separados de metaclasses.
- Etapa 2 concluida: auditoria por componente confirmou que TextField e o melhor piloto. Button esta
  mais perto do padrao, mas ainda tem alguns estados de label que devem virar `ref`. Tabs funciona,
  mas label/icon ainda recebem `selected` diretamente.
- Etapa 3 concluida: o schema do TextField foi migrado para usar `ref` nos estados dependentes. Os
  estados `hover`, `focus`, `disabled` e `readOnly` dos slots dependentes agora emitem `==state`, nao
  `--state`.

Validacoes rodadas na etapa 3:

- `pnpm --filter @kiskadee/presets exec tsc --noEmit -p tsconfig.json`
- `pnpm exec biome check packages/presets/src/presets/material-3-google/components/text-field.schema.ts`
- `pnpm --filter @kiskadee/web-builder exec vitest run src/phase-1-convert-schema-to-style-keys/colors/convertElementColorsToStyleKeys.test.ts src/utils/buildStyleKey/buildStyleKey.test.ts`
- `pnpm --filter @kiskadee/web-builder run build`

Observacao: os comandos passaram, com o aviso conhecido de engine porque o repo espera Node `>=24` e
o ambiente estava em Node `v22.22.1`.

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

A proxima etapa e a etapa 4, mas ela deve ser executada com uma decisao explicita: nao basta mover
classes para `e1`; TextField deve ser o piloto da regra de projection.

Antes de implementar, confirmar:

- se o headless continua expondo `data-*` semanticos durante a migracao;
- quais estados o styled TextField deve projetar como classes Kiskadee em `e1`;
- se `filled` entra ja na projection runtime ou fica apenas preparado pelo modelo ate o ajuste Sass;
- como evitar que `focused` seja mantido de forma duplicada entre headless e styled runtime.

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
