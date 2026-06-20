# Resposta ao code review — Switch AF + motion

Contexto: os ajustes recentes tentaram corrigir o AF virando uma bolinha dentro do thumb, mover o feedback visual para `pointerdown`, tornar o AF one-shot, preservar um pequeno hold para taps leves e alinhar a velocidade de clique no thumb com clique no label. A avaliação abaixo separa bug real, manutenção útil e higiene opcional.

## 1. Teste do gerador de CSS desatualizado

Pertinente. Esse é o ponto mais objetivo do review.

O gerador foi alterado de propósito para remover fallbacks desenháveis de `--k-af-host-width`, `--k-af-host-height` e `--k-af-host-radius`, mas o teste ainda espera o contrato antigo com fallback. A build passou porque `run build` não executa esse teste. Eu não atualizei testes antes porque a regra do repo diz para não adicionar ou modificar unit tests sem pedido explícito, mas tecnicamente o review está correto: antes de commit, esse teste deve acompanhar a nova saída.

Eu ajustaria as expectativas existentes. Sobre adicionar um novo caso de "host vars ausentes", eu acho útil se for um teste de geração documentando que o CSS emitido não possui fallback; não tentaria testar comportamento visual de ausência de var nesse nível.

## 2. Detecção de reduced thumb duplicada e frágil

Parcialmente pertinente.

A duplicação de `parsePixelValue` e do limiar `0.5` é real. Também é verdade que a classe `k-swt-e3b-a` aparecer em dois lugares aumenta o risco de drift. O motivo de eu ter feito assim foi manter o AF independente do motion: o AF precisa saber qual host visual usar mesmo quando o runtime de motion está desligado, e a geometria de motion calcula translação, enquanto a geometria do AF calcula o box estável do halo/outline.

Eu ajustaria com cuidado: extrairia helpers pequenos e semânticos para `SwitchRuntimeMotion.geometry.ts` ou para um arquivo neutro de geometria do Switch, por exemplo `parsePixelValue`, `getSwitchTrackContentHeight` e `isSwitchReducedThumb`. Eu evitaria simplesmente reutilizar `calculateSwitchRuntimeMotionGeometry` dentro do AF, porque isso acoplaria o halo a uma função cujo contrato principal é movimento/translação.

## 3. Opções mortas em `finish`

Pertinente.

As opções nasceram no meio da transição entre "pointer lifecycle controla o fim" e "AF é one-shot". Depois que removemos `finalizePointerFeedback`, sobrou um único caminho que sempre quer: ignorar `durationMs`, respeitar `fadeDelayMs` e aplicar `minPointerHoldMs`. Nesse estado final, o objeto `{ includeFadeDelay, includeRuntimeDuration }` ficou mais genérico do que o hook realmente precisa.

Eu simplificaria. Isso reduz uma armadilha futura: alguém chamar `finish()` sem lembrar que, no Switch, não queremos que o tempo de runtime segure o AF durante drag/press.

## 4. Ternários triplos em handlers de pointer

Pouco pertinente.

Existe repetição, mas ela é pequena e explícita. Um helper `pickHandler` deixaria o retorno mais compacto, porém também esconderia uma decisão importante: radial, static runtime ou fallback externo. Eu só mexeria se formos tocar nesse controller por outro motivo ou se um terceiro runtime aparecer. Não vejo isso como ajuste prioritário.

## 5. `useIsomorphicLayoutEffect` duplicado

Pertinente como higiene, não como bug.

A duplicação é real. Um hook compartilhado evitaria repetir o idioma `typeof window === 'undefined' ? useEffect : useLayoutEffect`. Ainda assim, é uma melhoria pequena e transversal. Eu não misturaria isso numa correção crítica de Switch a menos que o arquivo compartilhado já exista ou a mudança seja muito contida.

## 6. Medição dupla no sync de geometria

Pertinente para documentar; eu não removeria sem validar no browser.

A medição síncrona no layout effect é intencional porque agora as vars de geometria são obrigatórias: depois do commit, quero que o host já tenha `--k-af-host-*` antes de uma interação rápida. O `requestAnimationFrame` existe para pegar o layout assentado depois de classe, transição, fonte/render e possíveis diferenças de medição do primeiro frame. Isso é especialmente relevante porque o bug original aparecia em clique rápido.

Concordo que parece redundante lendo o código. Eu documentaria o motivo ou refinaria depois com evidência de browser. Remover uma das passadas sem prova pode reabrir exatamente o tipo de intermitência que estávamos tentando eliminar.

## Notas não bloqueantes

Concordo com as duas notas do review.

O contrato rígido de CSS vars é intencional e alinhado ao `STRUCTURAL-CSS.md`: variável obrigatória precisa existir no escopo dono; fallback visual no consumo mascarava bug e desenhava a bolinha. Também concordo que `pointerup` e `pointercancel` virarem wrappers finos é coerente com o AF one-shot; eles não devem mais controlar o tempo visual do efeito.

## Minha prioridade sugerida

1. Corrigir o teste do web-builder antes do commit.
2. Simplificar `finish`, porque o código atual carrega uma generalidade que não representa mais o comportamento desejado.
3. Extrair helpers pequenos de geometria do Switch, sem acoplar AF ao cálculo completo de motion.
4. Documentar a dupla medição síncrona + rAF, ou só otimizar isso depois de validação visual.
5. Deixar `pickHandler` e `useIsomorphicLayoutEffect` compartilhado como higiene opcional, não como bloqueadores.
