# Code Review — Switch (AF + Motion)

**Branch:** `fix/switch/af-effect`
**Data:** 2026-06-19
**Escopo:** Activation Feedback (AF) one-shot no `pointerdown`, geometria estável cacheada, remoção dos fallbacks de CSS e drag manual do thumb via `dragControls`.

**Arquivos revisados:**

- `packages/components/react/src/components/Switch/Switch.tsx`
- `packages/components/react/src/components/Switch/effects/activation-feedback/SwitchActivationFeedback.controller.ts`
- `packages/components/react/src/components/Switch/effects/motion/SwitchRuntimeMotion.effect.tsx`
- `packages/components/react/src/hooks/effects/activation-feedback/useActivationFeedbackHalo.ts`
- `packages/components/react/src/hooks/effects/activation-feedback/ActivationFeedbackHalo.structural.scss`
- `packages/web-builder/src/phase-4-convert-style-keys-to-css-rules/effects/transformActivationFeedbackKeyToCss/transformActivationFeedbackKeyToCss.ts`

**Resultado geral:** As mudanças de comportamento estão coerentes e bem implementadas. Confirmado que `dragControls.start(event.nativeEvent, { distanceThreshold, snapToCursor })` é uma API válida no `motion@12.40.0` — o ajuste de velocidade clique no thumb vs label não tem bug.

---

## Prioridade de ação

| # | Severidade | Item |
|---|-----------|------|
| 1 | 🔴 Bug | Teste do gerador de CSS desatualizado — vai quebrar |
| 2 | 🟡 Manutenção | Detecção de "reduced thumb" duplicada e frágil |
| 3 | 🟡 Simplificação | Opções mortas em `finish` |
| 4 | 🟡 Simplificação | Ternários triplos repetidos 3× |
| 5 | 🟢 Higiene | Idioma de layout-effect SSR-safe duplicado |
| 6 | 🟢 Eficiência | Medição dupla no sync de geometria |

---

## 🔴 Bug — Teste do gerador de CSS desatualizado

**Arquivo:** `packages/web-builder/.../transformActivationFeedbackKeyToCss/transformActivationFeedbackKeyToCss.test.ts`
**Linhas:** 83 e 86

O teste não foi atualizado junto com o gerador. As asserções ainda esperam os fallbacks removidos:

```
// linha 83 — esperado atual (errado):
'--k-af-layer-width: calc(var(--k-af-host-width, var(--k-af-end-size)) + (8px * 2));'

// linha 86 — esperado atual (errado):
'--k-af-layer-radius: var(--k-af-outline-radius, calc(var(--k-af-host-radius, 0px) + 8px));'
```

O gerador agora emite `calc(var(--k-af-host-width) + (8px * 2))` e `calc(var(--k-af-host-radius) + 8px)` — **duas asserções vão quebrar.** A validação foi feita com `run build`, que não roda os testes, por isso passou batido.

**Ação obrigatória antes do commit:** atualizar as expectativas do teste e, idealmente, adicionar um caso cobrindo "host vars ausentes" para documentar o novo contrato.

---

## 🟡 Manutenção — Detecção de "reduced thumb" duplicada e frágil

**Arquivo:** `SwitchActivationFeedback.controller.ts` — `resolveSwitchActivationFeedbackStaticGeometry` (linhas 68–106)

Reimplementa lógica que já existe em `packages/components/react/src/components/Switch/effects/motion/SwitchRuntimeMotion.geometry.ts`:

- **`parsePixelValue`** (controller linha 63) é **idêntico** ao de `geometry.ts` linha 16 — copy-paste verbatim.
- A heurística de reduced-thumb — classe mágica `'k-swt-e3b-a'` + `width < trackContentHeight - 0.5` — está duplicada em `calculateSwitchRuntimeMotionGeometry` (linhas 38–39). Se a classe for renomeada ou o épsilon mudar, há dois lugares para atualizar e eles vão divergir silenciosamente (a AF cai para a geometria errada sem erro).

**Ação:** extrair a detecção/medição para `geometry.ts` (ou helper compartilhado) e consumir nos dois caminhos. O ideal seria o Switch passar o estado reduced explicitamente em vez de o controller re-detectar via classe + `getBoundingClientRect`.

---

## 🟡 Simplificação — Opções mortas em `finish`

**Arquivo:** `useActivationFeedbackHalo.ts` (linhas 271–310)

`finish` ganhou `{ includeFadeDelay?, includeRuntimeDuration? }`, mas o único chamador restante é `trigger`, que sempre passa `{ includeRuntimeDuration: false }` e nunca passa `includeFadeDelay` (`finalizePointerFeedback` foi removido):

- `includeFadeDelay` é **sempre `true`** → o branch `? runtimeConfig.fadeDelayMs : 0` é código morto.
- `includeRuntimeDuration` é **sempre `false`** → `remainingDurationMs` é sempre `0`.

**Ação:** colapsar para `remainingMs = minHoldMs` e `fadeDelayMs = runtimeConfig.fadeDelayMs`, sem o objeto de opções. Reduz a chance de um futuro consumidor esquecer de passar `includeRuntimeDuration: false` e segurar a AF pela duração inteira.

---

## 🟡 Simplificação — Ternários triplos repetidos 3×

**Arquivo:** `SwitchActivationFeedback.controller.ts` (linhas 246–263)

`onPointerDown` / `onPointerUp` / `onPointerCancel` repetem o mesmo padrão `radial ? a : usesStaticRuntime ? b : c`.

**Ação:** um helper tipo `pickHandler(radialFn, staticFn, fallbackFn)` elimina a tripla repetição e o risco de atualizar só 2 dos 3 ao adicionar um runtime novo.

---

## 🟢 Higiene — Idioma de layout-effect SSR-safe duplicado

**Arquivo:** `useActivationFeedbackHalo.ts` (linhas 65–66)

`useActivationFeedbackLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect` é cópia exata de `SwitchRuntimeMotion.controller.ts:53`.

**Ação:** extrair um `useIsomorphicLayoutEffect` compartilhado.

---

## 🟢 Eficiência — Medição dupla no sync de geometria

**Arquivo:** `useActivationFeedbackHalo.ts` (linhas 375–380)

No layout effect, `syncGeometry()` é chamado síncrono **e** `scheduleGeometrySync()` (rAF) na mesma execução — duas passadas de `getBoundingClientRect` + `getComputedStyle` (e `resolveStaticGeometry` ainda mede thumb + track). Se a segunda passada via rAF é só para "assentar" o layout, ok; hoje parece redundância pura no caminho de montagem / mudança de `geometryKey`.

**Ação:** avaliar manter só uma das passadas, ou documentar por que ambas são necessárias.

---

## Notas

- **Contrato rígido de CSS vars:** remover os fallbacks de `--k-af-host-*` é intencional e o mesmo hook é usado pelo Button (`ButtonActivationFeedback.controller.ts:209`). Como o próprio hook escreve essas vars no layout effect quando `enabled`, o Button continua coberto em CSR. O único gap teórico é SSR/pré-hidratação, mas a layer só aparece quando `isActive`, então não há regressão visual prática. Vale ter o teste novo (item 🔴) documentando isso.
- **`pointercancel` / `pointerup`** agora são wrappers finos que só liberam o pointer capture — coerente com o one-shot, sem regressão (a AF não é mais cancelada no release, comportamento desejado).
- **`applyCachedStaticGeometryVars` (linha 218):** retorna `true` quando `host` é `null`, fazendo `applyStaticFeedback` ter sucesso silenciosamente sem escrever nenhuma CSS var. Isso permite que `start()` defina `isActive = true` sem geometria aplicada, potencialmente renderizando a AF layer com tamanho zero. Considerar retornar `false` quando `host` é null.
- **Guard removido no `transitionend` (linha 346):** remover o guard `event.target !== host` faz com que eventos `transitionend` que borbulham da nova camada `x5` (que transiciona `width`, `height` e `border-radius`) disparem `syncGeometry()` redundantemente junto com os eventos do próprio host. Considerar restaurar o guard ou filtrar por `event.target === host || event.target === host.querySelector('.k-swt-x5-a')`.
