# Abreviações e Terminologia Técnica

Este documento padroniza abreviações usadas nos comentários, revisões e decisões de arquitetura do Kiskadee.

## Siglas canônicas

1. `AF` — **Activation Feedback**

   Feedback visual/transição de interação acionável. No Kiskadee, está concentrado em `Button` e presets de runtime/componentes interativos.

2. `SEP` — **Style Emission Policy**

   Define como uma `style key` é materializada na saída de runtime/classe (ex.: `direct`, `token`, `mirrored`).

3. `SUP` — **Structural Utility Projection**

   Mecanismo canônico de build-time para projetar utility atômica já emitida por um elemento/slot para outro elemento estrutural que precisa usá-la.

4. `DOM`

   **Document Object Model**

   Estrutura de nós HTML usada pelo runtime.

5. `RTE`

   **Rich Text Editor**

   Casos de composição de controles de texto com grupos, menus e ações.

6. `API`

   **Application Programming Interface**

   Contratos públicos entre pacotes/consumidores (propriedades, tipos, slots, etc.).

7. `SRP` — **Single Responsibility Principle**

   Cada componente mantém propriedade clara de semântica e estrutura (ex.: `Dropdown` visual x `Menu` semântica).

## Uso e comunicação

- Prefira a sigla completa na primeira menção de uma conversa/documento e, em seguida, a sigla.
- Evite inventar novas siglas sem registrar aqui.
- Quando uma sigla tiver mais de um significado potencial no projeto, registre o mapeamento com contexto no texto.

## Convenção entre SEP e SUP

- `SEP` é sobre **como** uma `style key` vira CSS/variables.
- `SUP` é sobre **onde** a referência de classe já emitida será consumida estruturalmente.
- `AF` é comportamento visual interativo e deve ser tratado como propriedade de interação, não como regra de propriedade estrutural.

