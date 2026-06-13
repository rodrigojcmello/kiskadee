# Code review — Switch motion / thumbShrink / Fluent border-width

Revisão do diff não commitado que corrigiu a interação entre o efeito **thumb shrink**, o **motion
ligado/desligado** e o preset **Fluent 2 Microsoft** (um dos poucos com `borderWidth` no container do
switch). O conjunto desses três fatores gerava gaps de alinhamento.

Data da revisão: 2026-06-12.

## Veredito geral

O código está **correto e coerente** — nenhum bug encontrado.

- Testes passam: web-builder identity `26/26`, motion geometry `2/2`.
- Os arquivos do diff não geram erro de `tsc` (os erros do typecheck são pré-existentes, em
  `scripts/` e no teste `Switch.class-names.test.ts` com `x5`, fora deste diff).
- A mudança `boxWidthEmission: 'mirrored'` no web-builder espelha exatamente o padrão já existente de
  `borderWidth` nos três pontos certos (tipo, `transformScaleKeyToCss`, identity + canonical).
- A consolidação do SCSS é uma melhoria real.

Mesmo assim, restaram alguns resíduos das iterações. Nenhum quebra nada, mas são candidatos a
limpeza.

## Lixo / redundância encontrada

### 1. `hasTransitioningThumbShrinkRef` é 100% redundante — **achado principal**

Arquivo: `packages/components/react/src/components/Switch/effects/motion/SwitchRuntimeMotion.controller.ts:65,82,88,93,99`

O ref é sempre setado (`= true`, linha 82) junto com `thumbShrinkTrackClassNameRef.current = trackClassName`,
e sempre limpo (`= false`) junto com `thumbShrinkTrackClassNameRef.current = null` (linhas 73-74,
87-88, 98-99). O invariante
`hasTransitioningThumbShrinkRef.current === (thumbShrinkTrackClassNameRef.current !== null)`
se mantém em todos os caminhos. Logo, na linha 93 dá para trocar por:

```ts
alignReducedThumb:
  hasThumbShrinkClass || (thumbShrinkTrackClassNameRef.current !== null && isReducedThumb)
```

e remover o ref inteiro. É exatamente o tipo de estado paralelo que sobra de iteração.

### 2. `thumbRef` no tipo `SwitchRuntimeMotionThumbProps` não é mais lido pelo componente

Arquivo: `packages/components/react/src/components/Switch/effects/motion/SwitchRuntimeMotion.effect.tsx:37`

`SwitchRuntimeMotionThumb` agora consome `thumbRefCallback` (não desestrutura `thumbRef`). O `thumbRef`
continua chegando via spread só por causa de `{...motionController.thumbProps}` e segue sendo
necessário **fora** do componente (activation-feedback `hostRef` e o ref do thumb estático em
`Switch.tsx:207,262`). Então o ref em si não é morto — mas mantê-lo no tipo do componente que não o
usa é enganoso. Idem `trackRefCallback`, que chega no spread mas é ligado direto no `Track`
(`Switch.tsx:286`), não pelo componente.

### 3. `getComputedStyle(track)` + `clientHeight` calculados duas vezes por sync

Arquivo: `packages/components/react/src/components/Switch/effects/motion/SwitchRuntimeMotion.geometry.ts`

`isSwitchRuntimeMotionReducedThumb` e `calculateSwitchRuntimeMotionGeometry` recomputam
`getComputedStyle(trackElement)`, `paddingBlockStart/End` e `trackContentHeight`. No
`syncThumbTranslation` as duas são chamadas em sequência (controller:79,91) → dois `getComputedStyle`
(força reflow) no mesmo frame. Micro-redundância; dá para a `calculate` expor o `isReduced` ou
compartilhar o cálculo.

## Pontos de atenção (não bloqueiam)

### 4. Cobertura de teste do branch novo é zero

Arquivo: `packages/components/react/src/components/Switch/effects/motion/SwitchRuntimeMotion.geometry.test.ts:32`

O teste chama `calculate` **sem options**, e com `thumbWidth=30 > trackContentHeight=29` o caminho
antigo (`Math.max`) e o novo (`thumbWidth`) dão **o mesmo resultado** (84). Então `alignReducedThumb`
e toda a lógica de `thumbShrink` em transição foram validadas só no browser. Dado que esse foi
justamente o ponto que custou ~10 iterações, vale adicionar um caso com thumb reduzido
(`offsetWidth < trackContentHeight`) cobrindo `alignReducedThumb: true` vs `false`.

### 5. `thumbX.set()` durante o render

Arquivo: `packages/components/react/src/components/Switch/effects/motion/SwitchRuntimeMotion.effect.tsx:153-160`

Escrever motion value em tempo de render é tolerável (motion values são store externo) e o guard
`hasSynchronizedInitialGeometryRef` garante uma vez só. É proposital (evita flash no primeiro paint
após o remount via `key`), mas sobrepõe o branch `hasInitializedTranslation` do effect (`232-243`),
que também faz `thumbX.set(selectedTarget)`. As duas escritas são idempotentes, então é
"cinto + suspensório" — funciona, mas é a parte mais sutil de manter.

### 6. ResizeObserver perdeu o debounce de rAF

Arquivo: `packages/components/react/src/components/Switch/effects/motion/SwitchRuntimeMotion.controller.ts:135`

Antes o observer chamava `scheduleThumbTranslationSync` (via `requestAnimationFrame`); agora chama
`syncThumbTranslation` direto. Como as escritas (`--k-swt-ti/ty/tx`, inset/transform) não alteram o
tamanho dos elementos observados, não deve gerar loop de ResizeObserver — mas a chamada síncrona
dentro do callback é mais arriscada que a versão agendada. Vale confirmar que não aparece o warning
*"ResizeObserver loop completed with undelivered notifications"* em toggles rápidos.

## O que está bem feito

- Padrão **callback ref + `useState`** para reanexar o `ResizeObserver` ao novo nó após o remount
  por `key` — é a forma correta; o ref puro não dispararia reattach.
- Consolidação do SCSS: a regra genérica por `--k-bxw` (`Switch.structural.scss:129`) substitui a
  regra específica de shrink (que dependia de `--k-swt-thh`/`--k-bdw`) e **não regride o thumb
  normal** (centro continua em `pis`). Boa generalização.
- web-builder consistente e testado; docs e `component-style-emission-overrides.md` atualizados
  junto.

## Recomendação

Antes de commitar, o mínimo de alto valor:

1. **#1** — remover `hasTransitioningThumbShrinkRef` (confiança alta, sem risco).
2. **#4** — adicionar teste do branch de thumb reduzido.

Os itens #2, #3, #5 e #6 são opcionais / refino.
