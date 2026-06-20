# Code review — Switch (AF + motion)

Revisão do código não commitado (working tree) em 2026-06-19. Escopo: as mudanças
de Activation Feedback (AF) one-shot no `pointerdown`, geometria estável cacheada,
remoção dos fallbacks de CSS e o drag manual do thumb via `dragControls`.

As mudanças de comportamento estão coerentes e bem implementadas. Confirmado que
`dragControls.start(event.nativeEvent, { distanceThreshold, snapToCursor })` é uma
API válida no `motion@12.40.0` (`start(event: React.PointerEvent | PointerEvent,
options?: DragControlOptions)` e `distanceThreshold?: number` existem) — então o
ajuste de velocidade clique no thumb vs label não tem bug.

Arquivos revisados:

- `packages/components/react/src/components/Switch/Switch.tsx`
- `packages/components/react/src/components/Switch/effects/activation-feedback/SwitchActivationFeedback.controller.ts`
- `packages/components/react/src/components/Switch/effects/motion/SwitchRuntimeMotion.effect.tsx`
- `packages/components/react/src/hooks/effects/activation-feedback/useActivationFeedbackHalo.ts`
- `packages/components/react/src/hooks/effects/activation-feedback/ActivationFeedbackHalo.structural.scss`
- `packages/web-builder/src/phase-4-convert-style-keys-to-css-rules/effects/transformActivationFeedbackKeyToCss/transformActivationFeedbackKeyToCss.ts`

---

## 🔴 Bug — teste do gerador de CSS ficou desatualizado (vai falhar)

**Arquivo:** `packages/web-builder/.../transformActivationFeedbackKeyToCss/transformActivationFeedbackKeyToCss.test.ts` (linhas 83 e 86)

O teste não foi atualizado junto com o gerador. As asserções ainda esperam os
fallbacks removidos:

```
linha 83: '--k-af-layer-width: calc(var(--k-af-host-width, var(--k-af-end-size)) + (8px * 2));'
linha 86: '--k-af-layer-radius: var(--k-af-outline-radius, calc(var(--k-af-host-radius, 0px) + 8px));'
```

O gerador agora emite `calc(var(--k-af-host-width) + (8px * 2))` e
`calc(var(--k-af-host-radius) + 8px)`. **Duas asserções vão quebrar.** A validação
foi feita com `run build`, que não roda os testes — por isso passou batido.

**Ação:** atualizar as expectativas do teste e, idealmente, adicionar um caso
cobrindo "host vars ausentes" para documentar o novo contrato.

---

## 🟡 Reuso/Altitude — detecção de "reduced thumb" duplicada e frágil

**Arquivo:** `SwitchActivationFeedback.controller.ts` (`resolveSwitchActivationFeedbackStaticGeometry`, linhas 68-106)

Reimplementa lógica que já existe em
`packages/components/react/src/components/Switch/effects/motion/SwitchRuntimeMotion.geometry.ts`:

- **`parsePixelValue`** (controller linha 63) é **idêntico** ao de `geometry.ts`
  linha 16 — copy-paste verbatim.
- A heurística de reduced-thumb — classe mágica `'k-swt-e3b-a'` +
  `width < trackContentHeight - 0.5` — está duplicada
  (`calculateSwitchRuntimeMotionGeometry`, linhas 38-39). Se a classe for renomeada
  ou o épsilon mudar, há dois lugares para atualizar e eles vão divergir
  silenciosamente (a AF cai para a geometria errada sem erro).

**Ação:** extrair a detecção/medição para `geometry.ts` (ou helper compartilhado) e
consumir nos dois caminhos. Bônus de altitude: o ideal seria o Switch passar o
estado reduced explicitamente em vez de o controller re-detectar via classe +
`getBoundingClientRect`.

---

## 🟡 Simplificação — opções mortas em `finish`

**Arquivo:** `useActivationFeedbackHalo.ts` (linhas 271-310)

`finish` ganhou `{ includeFadeDelay?, includeRuntimeDuration? }`, mas o único
chamador restante é `trigger`, que sempre passa `{ includeRuntimeDuration: false }`
e nunca passa `includeFadeDelay` (`finalizePointerFeedback` foi removido):

- `includeFadeDelay` é **sempre `true`** → o branch `? runtimeConfig.fadeDelayMs : 0`
  é morto.
- `includeRuntimeDuration` é **sempre `false`** → `remainingDurationMs` é sempre `0`.

**Ação:** colapsar para `remainingMs = minHoldMs` e
`fadeDelayMs = runtimeConfig.fadeDelayMs`, sem o objeto de opções. Reduz a chance de
um futuro consumidor estático esquecer de passar `includeRuntimeDuration: false` e
segurar a AF pela duração inteira.

---

## 🟡 Simplificação — ternários triplos repetidos 3×

**Arquivo:** `SwitchActivationFeedback.controller.ts` (linhas 246-263)

`onPointerDown` / `onPointerUp` / `onPointerCancel` repetem o mesmo padrão
`radial ? a : usesStaticRuntime ? b : c`.

**Ação:** um helper tipo `pickHandler(radialFn, staticFn, fallbackFn)` elimina a
tripla repetição e o risco de atualizar só 2 dos 3 ao adicionar um runtime novo.

---

## 🟢 Reuso — idioma de layout-effect SSR-safe duplicado

**Arquivo:** `useActivationFeedbackHalo.ts` (linhas 65-66)

`useActivationFeedbackLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect`
é cópia exata de `SwitchRuntimeMotion.controller.ts:53`.

**Ação:** extrair um `useIsomorphicLayoutEffect` compartilhado.

---

## 🟢 Eficiência — medição dupla no sync de geometria

**Arquivo:** `useActivationFeedbackHalo.ts` (linhas 375-380)

No layout effect, `syncGeometry()` é chamado síncrono **e** `scheduleGeometrySync()`
(rAF) na mesma execução — duas passadas de `getBoundingClientRect` +
`getComputedStyle` (e `resolveStaticGeometry` ainda mede thumb + track). Se a segunda
passada via rAF é só para "assentar" o layout, ok; hoje parece redundância pura no
caminho de montagem / mudança de `geometryKey`.

**Ação:** avaliar manter só uma das passadas, ou documentar por que ambas são
necessárias.

---

## Notas (não-bloqueantes)

- **Contrato rígido de CSS vars:** remover os fallbacks de `--k-af-host-*` é
  intencional (está no doc) e o mesmo hook é usado pelo **Button**
  (`ButtonActivationFeedback.controller.ts:209`). Como o próprio hook escreve essas
  vars no layout effect quando `enabled`, o Button continua coberto em CSR. O único
  gap teórico é SSR/pré-hidratação, mas a layer só aparece quando `isActive`, então
  não há regressão visual prática. Vale ter o teste novo (ponto 🔴) documentando isso.
- **`pointercancel` / `pointerup`** agora são wrappers finos que só liberam o pointer
  capture — coerente com o one-shot, sem regressão (a AF não é mais cancelada no
  release, comportamento desejado).

---

## Prioridade

1. **Obrigatório antes do commit:** corrigir o teste (🔴).
2. **Maior valor de manutenção:** deduplicar `parsePixelValue` e a detecção de
   reduced-thumb (🟡).
3. **Higiene:** opções mortas em `finish`, ternários triplos, idioma SSR, medição
   dupla.
