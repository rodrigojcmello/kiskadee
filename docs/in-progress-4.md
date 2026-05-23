# Plano de integração da escala tonal nos presets

Status: planejamento. A implementação principal ainda não começou neste handoff.

Limpeza prévia concluída:

- Removido o experimento abandonado `packages/presets/src/tools/generate-fast-color-scale.ts`.
- Removidos o script `generate:fast-color-scale` e a dependência `@microsoft/fast-colors` de
  `packages/presets`.
- Removidas as entradas da FAST em `pnpm-lock.yaml`.
- Marcado o gerador FAST como aposentado nas notas de débito técnico do tonal-scale lab.
- Validação: buscadas referências antigas ao script/FAST e executado `git diff --check` nos arquivos
  afetados.

## Objetivo

Levar o trabalho de escala tonal do lab para o pipeline real dos presets sem perder o contrato
semântico estável do qual os schemas dependem.

A arquitetura desejada é:

- `packages/tonal-scale-lab` fica responsável pelas receitas experimentais e geradas de escala
  tonal.
- Os presets passam a consumir artefatos de cor gerados, em vez de manter cada arquivo de escala
  manualmente.
- O Kiskadee expõe uma distribuição tonal oficial:
  `0..10`, depois `12, 14, 16, 18, 20, 22, 24, 26, 28, 30`, depois `35..100` de `5` em `5`.
- Os schemas de componentes usam âncoras tonais e mapeamentos de estado, em vez de hardcodar cada
  estado de interação diretamente para números tonais sem relação clara.

## Decisões duráveis

- `K<n>` significa um slot tonal do Kiskadee. Não é o nome de uma família de cor.
- A âncora vivid padrão atual é `vividRest = K55`.
- Estados vivid devem derivar da âncora vivid por uma receita pequena e fixa, inicialmente `hover =
  +5`, `focus = +0` e `pressed = +10`.
- Estados subtle geralmente devem usar slots explícitos, inicialmente `rest = K1`, `hover = K2`,
  `focus = K2` e `pressed = K3`.
- Âncoras por papel, como `vividRest`, são preferíveis a âncoras por família de cor, como
  `primaryVivid`, `greenLikeVivid` ou `redLikeVivid`.
- Overrides por cor, segmento ou semântica são permitidos, mas devem ser exceções explícitas, não o
  modelo padrão.
- Controles do lab como saturação e gamma são ferramentas de descoberta. Presets devem consumir
  tonal profiles nomeados e congelados.

## Fase 1 - Limite do gerador

- [ ] Decidir se o gerador de produção vive dentro de `packages/tonal-scale-lab` ou se o lab exporta
  um pacote/script compartilhado consumido por `packages/presets`.
- [ ] Desenhar o formato dos artefatos gerados para arquivos de cor dos presets.
  A ideia deve ser similar a `packages/presets/src/tools/generate-material-color-artifacts.ts`, mas
  baseada no modelo de tonal profiles do Kiskadee.
- [ ] Definir entradas do gerador:
  hex de origem, id do tonal profile, id da distribuição de escala, alvo de segmento/tema, override
  opcional de âncora por cor e caminho de saída.
- [ ] Definir saídas do gerador:
  buckets `subtle` e `vivid` seguindo a distribuição oficial do Kiskadee, mais comentários de
  metadata registrando cor de origem, profile, âncora e modo de contraste.
- [ ] Manter `generate-material-color-artifacts.ts` intacto até o novo gerador conseguir reproduzir
  um caminho de preset de ponta a ponta.

## Fase 2 - Distribuição tonal oficial do Kiskadee

- [ ] Atualizar os tipos de tons do core e o snapping tonal para a distribuição oficial do Kiskadee.
  Ponto de partida conhecido: `packages/core/src/utils/color.ts` ainda resolve tons subtle como
  `0..15, 20, 25, 30`.
- [ ] Atualizar a geração do runtime para a distribuição oficial.
  Ponto de partida conhecido: `packages/runtime/src/generator.ts` ainda emite a faixa soft antiga.
- [ ] Procurar artefatos gerados, helpers do showcase, testes e docs que assumem a distribuição
  subtle antiga.
- [ ] Regenerar ou atualizar artefatos afetados somente depois de atualizar o contrato de
  distribuição na origem.

## Fase 3 - Piloto no Fluent

- [ ] Usar `packages/presets/src/presets/fluent-2-kiskadee` como primeiro piloto de produção.
- [ ] Gerar uma família de cor do Fluent a partir da receita do tonal-scale lab e comparar com os
  arquivos atuais, sejam eles manuais ou gerados.
- [ ] Manter o piloto inicial pequeno: um segmento, um tema e uma família de cor antes de expandir.
- [ ] Confirmar que a escala gerada funciona com a resolução `color(...)` existente e com a saída do
  web-builder.
- [ ] Depois que os arquivos de cor funcionarem, atualizar o schema de botão do Fluent para testar
  state mapping baseado em âncora no uso vivid.

## Fase 4 - Âncoras tonais e state mapping

- [ ] Adicionar um helper pequeno ou uma abstração local ao schema para âncoras tonais.
  A primeira versão pode ficar próxima do código dos presets e não precisa virar API pública
  imediatamente.
- [ ] Codificar as âncoras padrão:
  `vividRest = 55` e slots explícitos para estados subtle.
- [ ] Codificar uma receita vivid mínima:
  `rest = vividRest`, `hover = vividRest + 5`, `focus = vividRest`, `pressed = vividRest + 10`.
- [ ] Aplicar o helper primeiro no botão do Fluent, depois avaliar se outros componentes do Fluent
  devem migrar no mesmo passo.
- [ ] Preservar exceções específicas de design systems quando Fluent ou Material diferirem
  intencionalmente da receita padrão.

## Fase 5 - Modelo de overrides

- [ ] Desenhar o formato de override para cores que precisem de âncoras personalizadas.
  Escopos candidatos: família de cor, segmento, tema, papel semântico ou intenção de componente.
- [ ] Manter overrides explícitos e locais o bastante para serem auditáveis.
- [ ] Evitar uma âncora padrão por nome de cor de Layer 1, Layer 2 ou Layer 3.
- [ ] Documentar quando um override é aceitável, por exemplo cores luminosas cuja identidade vivid é
  danificada pela âncora padrão.

## Fase 6 - Rollout nos presets

- [ ] Depois do Fluent funcionar, replicar a abordagem de gerador e âncoras para os demais presets do
  Kiskadee.
- [ ] Decidir separadamente se presets oficiais de terceiros, como Material Google, devem preservar
  o comportamento oficial da origem ou adotar as âncoras tonais do Kiskadee.
- [ ] Atualizar docs dos presets para que cada preset declare seu tonal profile, distribuição de
  escala, âncoras e overrides conhecidos.
- [ ] Regenerar registries do showcase ou artefatos derivados depois que os presets de origem
  mudarem.

## Checklist de validação

- [ ] Rodar typecheck nos pacotes afetados.
- [ ] Rodar testes focados para resolução de cor e metadata tonal do web-builder.
- [ ] Buildar `@kiskadee/web-builder` depois de mudanças em schema ou artefatos de cor.
- [ ] Buildar ou rodar o showcase depois de mudanças em artefatos gerados dos presets.
- [ ] Inspecionar visualmente pelo menos os estados do botão Fluent antes de expandir para outros
  presets.

## Perguntas em aberto

- `packages/tonal-scale-lab` deve continuar sendo um app interno com scripts, ou virar um pacote
  reutilizável que `packages/presets` consegue importar?
- Os arquivos de escala gerados devem guardar apenas valores HSLA, ou também metadata gerada sobre
  hex de origem, tom de âncora e alvo de contraste?
- Âncoras tonais devem virar parte do tipo de schema no core, ou continuar como helpers locais dos
  presets até o modelo estabilizar?
- O primeiro modelo de override deve ser rígido até que ponto: apenas por família de cor, ou por
  família de cor mais segmento/tema?
- Material Google deve continuar preso ao gerador oficial do Material mesmo depois que presets
  Kiskadee adotarem âncoras tonais do Kiskadee?
