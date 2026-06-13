# Observações sobre a análise de arquitetura de junho/2026

Fonte comentada: `docs/reviews/2026-06-architecture-review.md`.

Este arquivo não tenta reproduzir o review original. Ele registra minha avaliação sobre cada item
relevante do documento, com foco em pertinência, prioridade e ajustes que eu faria antes de abrir
atividades no Linear.

Legenda:

- **Procede**: concordo com o item e considero que ele deve virar plano ou regra.
- **Procede com ajuste**: a direção é correta, mas a premissa, prioridade ou critério de aceite
  precisa ser corrigido.
- **Não procede como está**: eu não abriria a atividade com essa formulação.
- **Monitorar**: faz sentido acompanhar, mas não justifica ação imediata.

## Resumo executivo

Minha leitura geral: o review está correto no diagnóstico macro. O Kiskadee não tem um problema de
"runtime demais" no modelo; ele tem alguns pontos de custo específicos e, principalmente, gargalos
de produto: autoria de presets, publicação/distribuição e validação de consumo externo.

Os ajustes importantes antes de transformar isso em backlog:

1. **A1 precisa ser reescrita**. `motion/react` não é usado apenas nas Tabs; o Switch motion também
   importa `motion/react`. O item continua pertinente, mas deve virar uma auditoria/redução da
   dependência de motion no pacote inteiro, não uma remoção isolada das Tabs.
2. **A2 está provavelmente incorreta como diagnóstico**. O código atual do Switch não faz
   `getComputedStyle` em todo frame da transição comum; ele mede no layout effect, no
   `ResizeObserver` e em um RAF agendado por resize. Eu pediria a outra IA a evidência exata antes
   de abrir um P1.
3. **A5 é o P0 mais concreto para produto**. Sem CI, pacote publicável, guia de consumo e decisão de
   empacotamento dos artefatos, o projeto continua difícil de validar fora do monorepo.
4. **A4 é o maior risco estrutural de escala**. A quantidade de schema autorado manualmente no M3 é
   real. Só que já existe validação de contratos no build; a ação deve focar em authoring builders,
   defaults/herança explícita e mensagens melhores, não em "adicionar validação do zero".
5. **A3 e A6 são boas, mas precisam preservar a decisão recente de artifacts por componente**.
   Reduzir duplicação não pode voltar para um contexto global pesado nem para uma fase central que
   conhece todos os componentes.

## 1. Visão geral medida

**Veredito:** procede com ajuste.

Os números são bons como leitura direcional, mas eu não usaria os valores exatos como critério de
aceite sem uma medição reprodutível no próprio repo. No checkout atual, por exemplo, os artefatos
top-level do Material 3 Google estão um pouco diferentes do texto do review: o CSS top-level gzip
fica em torno de 9,6 KB, e o JSON top-level gzip em torno de 19,6 KB. A conclusão continua igual:
o CSS entregue é pequeno e o peso bruto vem muito mais da matriz de tokens/paletas do que de
ineficiência óbvia.

Para Linear, eu abriria antes uma tarefa pequena de **baseline de métricas**:

- comando único para medir CSS/JSON bruto e gzip por design system;
- comando único para medir bundle real em Vite e Next;
- registro do resultado em `docs/reviews/` ou `packages/web-builder/docs/`.

Isso evita que A1/A5 usem números aproximados como se fossem contrato.

## 2. Pontos fortes

### Taxonomia do schema

**Veredito:** procede.

Essa é a parte mais valiosa da arquitetura. A separação entre palettes, scales, decorations,
effects, options, elements, variant e mode está alinhada com `PROJECT-PURPOSE.md` e
`SCHEMA-BUILD-RUNTIME-RULES.md`. Eu protegeria isso explicitamente nos issues de refactor: qualquer
atividade que simplifique código mas misture token semântico, geometria e comportamento deve ser
recusada.

### Pipeline de build em fases

**Veredito:** procede.

A divisão por fases é correta. Eu só evitaria tratar "arquivo grande" como problema por si só.
`publishMetadata.ts` e a fase 5 são hotspots reais, mas o plano deve focar em reduzir conhecimento
de componentes dentro das fases centrais, não em atingir um limite arbitrário de LOC.

### Runtime disciplinado no caminho de estilo

**Veredito:** procede.

O modelo "runtime compõe classes já geradas" está preservado. Os hooks por componente e os
artifacts/component class maps reforçam a direção certa: carregar somente o que a página usa, sem
transformar `global.kiskadee.json` em um catálogo crescente de metadados de todos os componentes.

### Soluções web específicas

**Veredito:** procede.

Compensação de borda/padding, estados projetados e CSS por segmento/tema são diferenciais reais. Eu
não mexeria nisso dentro de tarefas de "limpeza" a menos que exista bug mensurado.

### Camada headless

**Veredito:** procede.

A separação entre headless e visual está correta. A única ressalva é que a promessa
multiplataforma ainda precisa de uma segunda plataforma para ser provada; isso aparece depois como
risco de médio prazo.

### Cultura de documentação e decisão

**Veredito:** procede.

Isso é ativo do projeto. Para o plano de integração, eu manteria a regra: cada decisão estrutural
que muda fronteira entre schema, builder, runtime ou components deve ir para o doc durável certo,
não apenas para um handoff temporário.

### `packages/runtime`

**Veredito:** procede.

Não vejo motivo para cortar o runtime atual. Ele é pequeno, tem responsabilidade clara e não parece
ser o gargalo.

## 3. Pergunta: há runtime demais?

**Veredito:** procede com ajuste.

Concordo com a resposta principal: o modelo não tem runtime demais. A preocupação correta é custo
pontual de implementação.

Mas eu corrigiria duas premissas:

- `motion/react` também aparece no Switch motion, não só nas Tabs.
- O loop de geometria do Switch não parece ser "por frame de animação" no código atual. A geometria
  é calculada dentro de `syncThumbTranslation`, chamada no layout effect, no `ResizeObserver` e em
  um RAF agendado por resize. O RAF existe, mas não como loop contínuo da transição.

Então eu separaria:

- **Motion dependency cost:** problema real, precisa de medição de bundle e estratégia para Tabs e
  Switch.
- **Switch geometry cost:** possível problema, mas precisa de prova. Como está escrito, eu não
  abriria P1.

## A1 - Remover/isolar o Framer Motion das Tabs

**Veredito:** procede com ajuste.

A preocupação é pertinente: `@kiskadee/react-components` depende diretamente de `motion`, e o
subpath `motion/react` reexporta `framer-motion`. Para uma biblioteca de design system, isso pode
virar o maior custo de bundle se o consumidor cair no caminho motion.

O problema é que o item está estreito e parcialmente incorreto:

- Tabs já usam lazy enhancer por variante.
- Switch também lazy-loads `SwitchRuntimeMotion.effect.tsx`, que importa `animate`, `motion` e
  `useMotionValue` de `motion/react`.
- Portanto, remover motion das Tabs não remove a dependência do pacote nem encerra o custo.

Eu abriria o Linear como:

**Auditar e reduzir a dependência `motion/react` em `@kiskadee/react-components`.**

Escopo recomendado:

- criar baseline Vite/Next com Button, Tabs estático, Tabs motion, Switch `motion={false}` e Switch
  default;
- testar troca de Tabs para CSS/WAAPI/FLIP sem mudar API;
- avaliar se Switch precisa continuar em `motion/react`, trocar para `motion/react-mini`/`react-m`,
  micro-spring próprio, ou manter temporariamente por causa de drag;
- só depois decidir se `motion` sai de `dependencies`.

Prioridade: **P0 se a próxima etapa for release público**, porque afeta percepção de pacote. Caso
contrário, **P1**.

Pergunta útil para a outra IA: qual comando ela usou para chegar em 30-40 KB gzip, e se esse número
incluiu o caminho motion do Switch.

## A2 - Tirar `getComputedStyle` do loop de animação do Switch

**Veredito:** não procede como está.

Eu não encontrei o loop descrito. O código atual calcula geometria em
`calculateSwitchRuntimeMotionGeometry()`, mas o controller agenda sincronização em momentos
discretos:

- layout effect inicial ou mudança de `geometryKey`;
- `ResizeObserver` no track/thumb;
- `window.resize` com um RAF para evitar sincronização direta no evento.

Isso não é a mesma coisa que ler `getComputedStyle` a cada frame da transição. O thumb em si é
movido por `motion` via motion value/spring; a leitura de geometria alimenta `thumbTranslation` e
CSS vars.

Eu substituiria por uma tarefa menor:

**Instrumentar e simplificar sincronização de geometria do Switch motion.**

Aceite que eu considero correto:

- prova de quantas vezes `calculateSwitchRuntimeMotionGeometry()` roda em toggle, drag e resize;
- se houver redundância, reduzir chamadas sem quebrar `thumbShrink`, RTL e resize;
- manter a decisão de não mover geometria para artifact, salvo medição forte em contrário.

Prioridade: **P2 por enquanto**. Pode virar P1 se a outra IA trouxer evidência de um loop real ou
se uma medição em página com muitos Switches mostrar custo relevante.

Pergunta útil para a outra IA: quais linhas mostram `getComputedStyle` sendo chamado em um RAF
contínuo durante a transição?

## A3 - Extrair resolver e artifact-config genéricos

**Veredito:** procede com ajuste.

Há duplicação real. No checkout atual, os arquivos de resolução/hook somam perto de 1.800 linhas
entre Button, Switch, TextField e Tabs. A direção de reduzir plumbing por componente novo é boa.

O cuidado: essa extração não pode desfazer a arquitetura recente de hooks/artifacts por componente.
A decisão validada foi carregar metadados e class maps localmente por componente, com cache
compartilhado pequeno. Então eu dividiria A3 em duas linhas:

1. **Factory de artifact-config hook:** mais segura e provavelmente mais barata. Padroniza cache,
   merge core/palette, fallback de compatibilidade e retenção durante troca de manifest.
2. **Resolver genérico de class names:** fazer com mais cautela. Button, Switch, Tabs e TextField
   têm topologias bem diferentes; uma abstração agressiva pode virar DSL interna difícil de manter.

Prioridade: **P1 antes de uma nova leva de componentes**, mas eu não colocaria antes de A5 se o
objetivo imediato for tornar o projeto consumível.

## A4 - Reduzir o custo de autoria de presets

**Veredito:** procede fortemente.

Esse é provavelmente o maior risco de escala do modelo. Os números conferem: Material 3 Google tem
aproximadamente 4.466 linhas TypeScript no preset, com TextField em 1.370 linhas e Button em 530. A
matriz manual de intent, emphasis, state, theme, segment e size não escala bem para dezenas de
componentes e vários design systems.

Ajuste de formulação: o repo já valida contratos de componentes no `runBuild()` via
`validateSchemaComponentContracts()`. Então a tarefa não deve ser "adicionar validação" de forma
genérica; deve ser:

- criar API oficial de autoria com defaults, deltas e expansão explícita;
- melhorar mensagens de erro para autoria humana/IA;
- criar comando dedicado de validação se isso melhorar o loop de authoring;
- provar byte-identidade dos artefatos para um componente/preset migrado.

Eu manteria `s:all` como subitem relacionado, mas não necessariamente na mesma PR grande. Ele pode
ser um refinamento da API de authoring depois do primeiro spike.

Prioridade: **P1 alto**, possivelmente **P0 estratégico** se a próxima fase for escalar presets com
IA.

## A5 - Tornar o projeto distribuível

**Veredito:** procede fortemente.

Este é o P0 mais objetivo. Hoje `@kiskadee/core`, `@kiskadee/react-headless` e
`@kiskadee/react-components` estão privados; `@kiskadee/runtime` não está privado, mas também aponta
para `src` e não tem pipeline de publicação. Não há `.github/workflows`, e não há guia de consumo
externo. O review está correto: sem isso, o projeto continua validado como monorepo interno, não
como produto adotável.

Eu só dividiria melhor:

1. **CI e smoke de consumo externo**: build, typecheck, tests existentes e um app mínimo Vite/Next
   consumindo pacote local.
2. **Modelo de pacote**: decidir quais pacotes são públicos, quais continuam internos, e como
   artefatos de design system entram no consumo.
3. **Publicação/versão**: changesets ou alternativa semver.
4. **Docs de instalação**: guia mínimo que renderiza um Button Material 3 sem clonar o monorepo.

Não faria "remover `private: true`" como primeira PR isolada; isso deve vir depois de CI e do smoke
de consumo.

Prioridade: **P0** para qualquer plano de release.

## A6 - Modularizar hotspots do web-builder

**Veredito:** procede, mas P2.

O problema é real e já existe documentação local em `packages/web-builder/docs/technical-debt/`.
`publishMetadata.ts` tem 720 linhas, e a fase 5 tem 523. O ponto mais importante não é tamanho: é
que metadados e special-cases por componente não devem continuar crescendo dentro das fases
centrais.

Eu ajustaria o critério:

- não usaria "nenhum arquivo >400 LOC" como meta primária;
- usaria "adicionar novo componente com metadata não exige editar o miolo da fase central";
- alinharia a solução com um registro estático de component builder modules;
- manteria o pipeline genérico de style keys, class maps e CSS fora dos módulos de componente.

Escrita atômica de artefatos é uma melhoria válida, mas eu separaria. Como `runBuild()` limpa o
diretório antes de gerar, escrita atômica pode ser importante para robustez, mas não é o mesmo
problema arquitetural de modularização.

Prioridade: **P2**, ou **P1 quando o próximo componente exigir nova metadata/global artifact**.

## A7 - Cobertura de testes na camada visual

**Veredito:** procede com ajuste.

A lacuna de testes existe: no pacote visual, os testes atuais estão concentrados no Switch. Para
refactors como A1 e A3, testes de equivalência de class resolution e comportamento de motion seriam
uma rede importante.

Mas, para este repo, há uma regra operacional: não adicionar/modificar unit tests a menos que o
usuário peça explicitamente. Portanto, no Linear eu escreveria os testes como parte explícita de
cada issue de refactor, não como uma permissão implícita.

Eu não abriria A7 como "aumentar cobertura" genérico. Abriria assim:

- snapshots/fixtures de class resolution antes de A3;
- teste de loader/lazy boundary antes de A1;
- testes específicos de geometria somente se A2 for confirmado.

Prioridade: **condicional**. Alta dentro de A1/A3; baixa como iniciativa isolada.

## A8 - Higiene de schema/core

**Veredito:** procede.

Os pontos existem:

- TODO de chave duplicada no Button Material 3;
- TODOs em `decorations.types.ts`;
- TODO de validação de effects nas Tabs;
- código comentado do segmento `modern` no Material 3 Kiskadee;
- TODO de `s:all`.

Eu não agruparia tudo em uma única atividade grande. Abriria pequenos tickets:

1. investigar chave duplicada do Button Material 3;
2. decidir/arquivar `textAlign` e `textLineType`;
3. validar effects das Tabs;
4. mover/limpar bloco comentado de `modern`;
5. tratar `s:all` junto da camada de authoring, se fizer sentido.

Prioridade: **P2**, exceto a chave duplicada, que eu marcaria como **P1 pequeno** porque pode
indicar emissão silenciosamente errada.

## Risco - Promessa multiplataforma ainda e hipótese

**Veredito:** procede.

O repo tem apenas builder web. A taxonomia foi desenhada para ser platform-agnostic, e há várias
decisões documentadas nessa direção, mas a tese só fica provada quando um segundo renderer consumir
o mesmo preset.

Eu concordo com um spike de Button em segunda plataforma, mas não colocaria antes de A5 se o foco
imediato for produto web publicável. Melhor ordem:

- publicar/validar consumo web;
- estabilizar authoring;
- fazer spike pequeno de segunda plataforma antes de acelerar para muitos componentes web.

Prioridade: **P2 estratégico**, sobe para **P1** se a narrativa de negócio for cross-platform no
curto prazo.

## Risco - Interop DTCG

**Veredito:** procede como feature de adoção.

Eu concordo que DTCG não deve substituir o schema do Kiskadee. O Kiskadee é mais expressivo para
estado, ênfase, segmento e componente. O valor é criar uma ponte de entrada: DTCG para schema
Kiskadee, com perdas/decisões explícitas.

Não abriria isso antes de ter pacote consumível e guia de instalação. Sem distribuição, importador
DTCG vira demonstração interna.

Prioridade: **P2**, ou **P1 comercial** se houver demanda concreta de importar tokens existentes.

## Risco - Crescimento do JSON de class maps

**Veredito:** monitorar.

O risco existe, mas o projeto já tomou a decisão correta de component-scoped class maps e loading
sob demanda. Isso reduz bastante a urgência de trocar formato JSON por arrays posicionais.

Eu não abriria tarefa agora. Abriria apenas monitoramento:

- tamanho bruto/gzip por artifact;
- quantidade de artifacts carregados por rota Showcase;
- threshold para revisitar formato denso.

Prioridade: **Monitorar**.

## Ordem sugerida de execução

**Veredito:** procede com ajuste relevante.

Eu não seguiria a ordem do review literalmente.

Minha ordem recomendada:

1. **Baseline de métricas**: artefatos, bundle Vite/Next, caminhos com/sem motion.
2. **A5 - distribuição/CI/smoke de consumo**: P0 de produto.
3. **A1 - estratégia para `motion/react`**: P0/P1 dependendo do baseline e do release.
4. **A4 - authoring layer spike**: P1 alto para escala de presets e autoria por IA.
5. **A3 - shared artifact-config e class resolution incremental**: P1 antes de nova leva de
   componentes.
6. **A8 - higiene pequena e independente**: puxar em paralelo, com tickets pequenos.
7. **A6 - component builder modules**: fazer quando houver novo componente/metadata ou quando tocar
   o builder por outro motivo.
8. **A2 - Switch geometry**: somente depois de esclarecida a evidência; por enquanto é auditoria,
   não refactor P1.
9. **Riscos multiplataforma/DTCG/JSON**: planejar como trilha de adoção, não como bloqueio imediato.

A7 não fica como etapa própria nessa lista porque eu trataria testes como critério explícito dentro
dos refactors que precisam deles.

## Conclusão

Eu usaria o review original como base, mas não como backlog direto. Ele acerta o diagnóstico
estratégico e vários hotspots, porém A1 e A2 precisam ser corrigidos antes de virar Linear.

Para planejamento, minha separação seria:

- **Release/adoção:** baseline, A5, A1.
- **Escala de autoria:** A4, depois DTCG se houver demanda.
- **Escala de componentes:** A3, A6, e parte dos riscos de class-map JSON.
- **Higiene:** A8 em tickets pequenos.
- **Auditoria antes de agir:** A2.

As duas perguntas que eu faria para a outra IA, se a janela ainda estiver aberta:

1. Qual foi a medição exata de bundle usada para A1, e ela considerou o import de `motion/react` no
   Switch?
2. Qual trecho exato demonstra `getComputedStyle` rodando por frame durante a transição do Switch?
