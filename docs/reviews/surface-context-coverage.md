# Auditoria de superfícies dos componentes

## Resultado da migração · 21 de novembro de 2026

O pré-build publica uma saída por região no companion v2 de cada preset. A Web entrega o recorte v5 por componente, segmento e tema. O runtime consulta a receita efetiva e fornece ao filho um único contexto. A classificação abrange os estados estáveis suportados por cada componente. Hover, Focus e Pressed continuam sendo estados de pintura interativa.

| Componente | Carbon | Elegant | FK | FM | iOS 18 | iOS 27 | M3 | S0 | S2 | S3 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Accordion | — | — | — | D | — | — | — | — | — | — |
| Badge | C | — | — | C | — | C | C | — | — | — |
| BottomSheet | C | — | — | C | — | C | C | — | — | — |
| Button | C | C | P | C | — | C | C | — | — | — |
| Card | C | C | — | C | — | C | C | C | C | C |
| Chip | C | — | — | C | — | — | C | — | — | — |
| Container | C | C | — | C | — | C | C | C | C | C |
| Dropdown | C | — | — | C | — | C | C | C | — | — |
| Icon | H | — | — | H | — | H | H | — | — | — |
| Layout | H | H | — | H | — | H | H | H | H | H |
| Progress | H | — | — | H | — | H | H | — | — | — |
| Select | — | — | — | C | — | — | — | C | — | — |
| Separator | H | — | — | H | — | H | H | — | — | — |
| Slider | C | — | — | C | — | C | C | C | C | C |
| Switch | C | C | — | C | C | C | C | C | C | C |
| Tabs | — | — | — | — | — | — | C | — | — | — |
| Text | H | — | — | H | — | H | H | — | — | — |
| TextField | — | — | — | C | — | — | C | — | — | — |

**C** = cálculo portátil por região; **P** = cálculo com exceções identificadas; **D** = delegação às superfícies da composição; **H** = herança/consumo do ambiente; **—** = componente ausente. FK = Fluent Kiskadee; FM = Fluent Microsoft; M3 = Material Google; S0/S2/S3 = Sandbox. A tabela cobre 84 combinações existentes e 96 ausentes. Uma célula registra o mecanismo validado, e não uma aprovação visual de cada cor.

- **Paridade e mudança.** Nas 5.039 coordenadas de Button, Container e Card/CardAction da auditoria inicial, 4.671 mantêm a saída, 354 passam a outra paleta e 14 são parciais. Button concentra 265 das mudanças, Container 6 e Card/CardAction 83. Os 1.624 resultados desses produtores no Fluent Microsoft coincidem com a base. As cores de origem e as receitas de interação dos dez presets foram comparadas com a revisão anterior; a mudança é no contexto entregue ao filho.
- **Demais regiões.** Em 5.492 consultas adicionais de estado estável, 4.185 resultados coincidiram e 1.307 mudaram de contexto. A comparação usou as receitas autoradas, a entrada recebida e a coordenada da camada anterior onde aplicável. Inclui, por exemplo, as duas ações irmãs de Chip, o ícone contido em Badge.Mark, o gatilho de Select e os slots de Tabs. As contagens são de coordenadas e regiões; uma mesma composição pode envolver mais de uma consulta.
- **Exceções atuais.** Somente o Button Fluent Kiskadee tem coordenadas indeterminadas: seis com gradiente misto, seis com cor dependente do runtime e duas translúcidas sem fundo canônico. O companion lista o caminho de cada receita e o motivo. O pré-build conserva a saída anterior ou a herança para essas entradas. [Diagnósticos no arquivo do preset](../../packages/presets/src/presets/fluent-2-kiskadee/generated/surface-contexts.json)
- **Onde o filho recebe o contexto.** Chip Content/Select e Remove são irmãos; cada um publica sua própria pintura. TextField Start/End resolvem a pintura sobre o controle e publicam a saída para os filhos. Dropdown e BottomSheet distinguem o painel de cada linha; Select fechado distingue controle e trigger. Badge.Mark contained, Switch, Slider e Tabs publicam para o conteúdo realmente coberto pela tinta. A arte full-bleed, o Badge externo ao Button, labels externos e o painel de conteúdo das Tabs conservam seu ambiente.
- **Como verificar.** Rode `pnpm --filter @kiskadee/surface-builder check` para conferir os dez companions registrados. Veja o estado por componente na rota `/component-audit`. A geração Web e a fusão de metadata foram comparadas com os arquivos portáteis, inclusive as exceções indexadas pela pintura do pai. [Surface Builder](../../packages/surface-builder/README.md) · [Publicação Web](../../packages/web-builder/docs/definitions/component-resources.md#palette-surface-configuration)
- **Validação de plataforma.** Os 282 descritores de paleta Web v5 foram confrontados com as saídas regionais portáteis. No Chrome foram verificados o Badge do Copilot sobre branco/azul, a passagem de contexto de campos e overlays, Badge.Mark, thumb de Switch, tooltip de Slider e aba selecionada do Material. As oito fixtures de Switch do iOS/Android foram preservadas byte a byte; a diferença preexistente entre a projeção nativa e as fixtures é a mesma da base. A verificação nativa aqui cobre dados e exportadores.

## Levantamento anterior à migração

O registro a seguir preserva os valores de referência, exemplos e recomendações da revisão inicial. A situação atual consta na matriz acima.

**20 de novembro de 2026 · revisão `93fdcbd8` · 18 componentes × 10 presets.**

**Atualizações posteriores ao levantamento.** Os dados abaixo descrevem a revisão auditada.

- A lista do Select recebe `onSubtle` quando o painel do Dropdown tem preenchimento confirmado. Uma lista sem pintura de fundo conserva o contexto recebido. A decisão sobre conteúdo rico no controle fechado continua pendente. [Contrato da lista](../../packages/components/react/docs/definitions/select.md#open-list-and-independent-dropdown-presentation)
- A divisória do Accordion já usa a superfície publicada pelo Card. No Fluent Light, a mesma moldura Medium usa a divisória Low tanto sobre uma página sutil quanto sobre uma página vívida. [Contrato do Accordion](../../packages/components/react/docs/definitions/accordion/accordion-contract.md)
- O TextField já usa a intenção e a ênfase efetivas da receita do controle ao consultar sua saída de superfície. No Fluent Light sobre vívido, Borderless High e Medium produzem o mesmo contexto sutil para um Badge na região Lowest. A comparação dos preenchimentos translúcidos do Material ainda depende das referências de fundo. [Contrato do conteúdo do TextField](../../packages/components/react/docs/definitions/text-field/text-field-content.md#region-surfaces-and-passive-geometry)

Os dez presets distribuem o arquivo portátil. O cálculo pelo contraste está habilitado em **Button e Container do Fluent 2 Microsoft** e nas pinturas interativas do **CardAction** desse preset. Card recebe do Container o resultado em repouso. A primeira correção indicada pela auditoria está no **Select**: o painel reutilizado do Dropdown já tem uma política adequada, mas a composição da lista não passa pelo Provider que a aplica.

| Decisão | Evidência |
| --- | --- |
| Manter o reset dos painéis padrão | Os 20 fundos de Dropdown e os 18 de BottomSheet produzem `onSubtle` em repouso. |
| Corrigir propagação e fallback antes de ampliar o Schema | O Select pode levar o contexto do acionador ao portal. No TextField Fluent, pedir High pode pintar Medium e fornecer aos filhos o contexto do ancestral. |
| Comparar as mudanças com o design pretendido antes de migrar | Entre Button, Container e Card/CardAction, 234 das 5.039 coordenadas examinadas mudariam de contexto; 856 ficaram indeterminadas. As 1.624 coordenadas desses produtores no Fluent Microsoft coincidiram. |

## Cobertura por componente e preset

A presença foi conferida nas exportações do Schema: **84 combinações presentes e 96 ausentes**. As saídas publicadas foram conferidas nos dez arquivos `generated/surface-contexts.json`. A tabela usa os [18 nomes da página Component audit](../../packages/showcase/app/component-audit/page.tsx). FK = Fluent 2 Kiskadee, FM = Fluent 2 Microsoft, M3 = Material Design 3 Google e S0/S2/S3 = Sandbox 0/2/3.

| Componente | Carbon | Elegant | FK | FM | iOS 18 | iOS 27 | M3 | S0 | S2 | S3 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Accordion | — | — | — | D | — | — | — | — | — | — |
| Badge | H | — | — | H | — | H | H | — | — | — |
| BottomSheet | F | — | — | F | — | F | F | — | — | — |
| Button | M | H | H | C | — | H | M | — | — | — |
| Card | D+M | D | — | D+C | — | D+M | D+M | D+M | D+M | D+M |
| Chip | M/H | — | — | M/H | — | — | M/H | — | — | — |
| Container | M | M | — | C | — | M | M | M | M | M |
| Dropdown | F | — | — | F | — | F | F | F | — | — |
| Icon | H | — | — | H | — | H | H | — | — | — |
| Layout | H | H | — | H | — | H | H | H | H | H |
| Progress | H | — | — | H | — | H | H | — | — | — |
| Select | — | — | — | D/H | — | — | — | D/H | — | — |
| Separator | H | — | — | H | — | H | H | — | — | — |
| Slider | H | — | — | H | — | H | H | H | H | H |
| Switch | H | H | — | H | H | H | H | H | H | H |
| Tabs | — | — | — | — | — | — | H | — | — | — |
| Text | H | — | — | H | — | H | H | — | — | — |
| TextField | — | — | — | M | — | — | H | — | — | — |

- **C** = cálculo a partir da pintura. **M** = mapa declarado. **D** = delegação. Em Card, D é o repouso do Container; a segunda letra identifica as saídas de estado próprias quando existem.
- **F** = painel publica um contexto fixo no React. **H** = o contexto do ambiente chega aos filhos ou a peça apenas consome esse contexto. H também cobre o fallback de um resolvedor sem mapa. **—** = sem declaração do componente naquele preset.
- **M/H** no Chip separa a ação principal da ação Remove. **D/H** no Select separa a pintura delegada da lista e o contexto herdado pelos slots. A entrada **M** em TextField cobre o controle e as regiões do Fluent; **H** em Material indica controle presente sem mapa. A matriz registra a origem do contexto, e não a oferta de todas as variantes/slots em cada preset.

O arquivo do Fluent Kiskadee tem `components: {}` e seu Schema declara Button. O do iOS 18 também tem `components: {}` e seu Schema declara Switch. São dois exemplos em que olhar apenas o JSON gerado esconderia a diferença entre **componente presente sem mapa** e **componente ausente**. [Carregamento dos presets](../../packages/surface-builder/src/load-presets.ts) · [Contrato do arquivo portátil](../../packages/surface-builder/src/artifact.ts)

## Como interpretar as comparações

1. Identificar a camada que pinta o fundo imediatamente atrás do filho. Resolver a receita do segmento, tema, modo, superfície consumida, variante de cor, intenção e ênfase que o componente realmente usa.
2. Resolver o contexto publicado para o mesmo cenário. Em mapas esparsos aplicar o fallback do estado para Rest; em Alternative aplicar a herança por receita. Resolver `inherit` para a superfície recebida antes de comparar. Respeitar as exceções de composição, como o Badge externo do Button.
3. Ausência de pintura ou alfa zero preserva o fundo. Uma cor opaca pode ser classificada diretamente. Para alfa parcial, compor sobre a camada opaca local quando conhecida ou sobre a referência canônica do ambiente naquele segmento/tema. Registrar como indeterminado quando faltar essa informação. O corte é **≥ 3:1** contra branco em Light ou preto em Dark e Darker. Abaixo dele, o resultado é `onSubtle`. Esse cálculo seleciona a paleta do filho; legibilidade de texto exige outra medição.
4. As contagens abaixo são de coordenadas, agrupadas por produtor/região. Cada tabela indica os estados e fallbacks incluídos. O estado visual de Hover, Focus ou Pressed pode alterar uma cor sem ser uma chave do mapa de contexto. Essas diferenças aparecem separadamente quando são relevantes.

O Schema fornece a receita, o pré-build publica o mapa portátil, e o Web Builder empacota o recorte de componente e paleta. O React resolve o valor e envolve o filho no Provider. As observações sobre aparência abaixo são comparações de pintura e de código, sem medição por screenshot ou execução de um renderer nativo. [Regra do pré-build](../../packages/surface-builder/src/derive.ts) · [Publicação Web](../../packages/web-builder/docs/definitions/component-resources.md#palette-surface-configuration) · [Resolução no React](../../packages/components/react/docs/definitions/surface-context.md)

## Painéis e composição de Select

**Painel independente.** Dropdown resolve `e1` e BottomSheet resolve `e2` em Standard/Neutral/Medium/Rest pela entrada padrão `onSubtle`. Em BottomSheet, `e1` é a película por trás do diálogo. A regra documentada redefine o contexto dos filhos do painel para `onSubtle`, inclusive quando o acionador está em um card vívido. No código, o Provider envolve `Dropdown.Content` e o conteúdo de `BottomSheet` dentro de `e2`. [Contrato dos portais](../../packages/components/react/docs/definitions/surface-context.md#component-boundaries) · [Dropdown e sua superfície](../../packages/components/react/src/components/Dropdown/Dropdown.tsx) · [BottomSheet e seu diálogo](../../packages/components/react/src/components/BottomSheet/BottomSheet.tsx)

| Preset | Segmentos × temas efetivamente publicados | Rest do painel em Light / Dark / Darker | Resultado nos painéis |
| --- | --- | --- | --- |
| Carbon | default × 3 | `#f6f6f6` / `#383838` / `#272727` | Dropdown e BottomSheet: sutil |
| Fluent Microsoft | default, teams × 3 | `#ffffff` / `#1d1d1d` / `#141414` | Ambos: sutil |
| iOS 27 | default × 3 | `#ffffff` / `#1c1c1e` / `#1c1c1e` | Ambos: sutil |
| Material | default, dynamic, purple × 2 | `#ffffff` / `#1d1d1d` / ausente | Ambos: sutil |
| Sandbox 0 | default × 2 | `#f6f6f6` / `#0e0e0e` / ausente | Dropdown: sutil. BottomSheet ausente. |

Os 20 fundos de Dropdown e 18 de BottomSheet são opacos e medem de 1,00:1 a 1,79:1 contra a referência do tema. Os cinco outros presets não declaram esses painéis. **Manter** o contexto do painel em repouso. Uma verificação de paridade em builds futuros poderia detectar um novo preset que ultrapasse 3:1.

**Linha de opção.** Dropdown `e2` e BottomSheet `e7` podem pintar uma segunda superfície debaixo de ícones, labels e conteúdo fornecido pelo aplicativo. Os itens selecionam suas próprias classes por intenção/estado e fornecem intenção aos slots, enquanto componentes independentes continuam recebendo a superfície do painel. Para a simulação, os estados translúcidos das linhas foram compostos sobre o próprio painel opaco, que é conhecido. A opção de exibir preenchimento selecionado do Dropdown foi respeitada. Em repouso, Selected Rest e Disabled, as receitas comparadas retêm classificação sutil. Carbon tem exceções **transitórias**:

| Receita em Carbon/default/Standard/Medium | Atual → calculado sobre o painel | Quem percebe |
| --- | --- | --- |
| Light, destructive Hover ou Selected Hover, `#da1e28` (5,00:1); Pressed ou Selected Pressed, `#78000c` (11,64:1) | `onSubtle` → `onVivid` | Um Badge inserido no item de Dropdown ou de BottomSheet continua na paleta sutil. |
| Dark, neutral Pressed `#727272` (4,37:1) ou Selected Hover `#626262` (3,44:1); Dark e Darker, destructive Hover ou Selected Hover `#d82129` (4,17:1) | `onSubtle` → `onVivid` | Mesmo efeito para um componente independente dentro da linha. |

O contrato atual de superfície produzida não acompanha Hover/Pressed. **Submeter a diferença visual** antes de propor mudanças na propagação durante interações transitórias. Os slots de texto e ícone com cores autoradas por estado podem continuar legíveis. [Receitas de Dropdown Carbon](../../packages/presets/src/presets/carbon-ibm/components/dropdown.schema.ts) · [Receitas de BottomSheet Carbon](../../packages/presets/src/presets/carbon-ibm/components/bottom-sheet.schema.ts)

**Select.** Somente Fluent Microsoft e Sandbox 0 declaram Select. Há duas fronteiras distintas. [SelectControl e SelectList](../../packages/components/react/src/components/Select/Select.tsx) · [Contrato do label ReactNode](../../packages/headless/react/src/components/select/Select.tsx)

| Região | Exemplo e consequência | Ação |
| --- | --- | --- |
| Lista com recursos de Dropdown carregados | Em Fluent/default/Light, com ancestral `onVivid`, `SelectList` combina `HeadlessSelect.Content`, `Dropdown.VisualProvider` e `Dropdown.Surface` e não passa por `Dropdown.Content`. O painel branco é `onSubtle` (1,00:1), mas um Badge passado como `option.label` herda `onVivid` no portal. Em Sandbox/default/Light, a mesma composição pinta `#f6f6f6` (1,08:1). | **Corrigir a delegação** ao dono da superfície usando a política já existente, com verificação para o Dropdown direto, o Select e as composições semelhantes de [ButtonMenu](../../packages/components/react/src/components/ButtonMenu/ButtonMenu.tsx). Nenhuma mudança de Schema é necessária para esse caso. No fallback Headless, o painel visual não é garantido. |
| Controle fechado e valor selecionado | Em Fluent/default ou teams/Light/`onVivid`, o preenchimento do controle `e3` Outline é `#fbfbfb` (1,03:1), o trigger `e4` é transparente e o Badge usado como valor ou placeholder herda `onVivid`. O resultado pelo fundo é `onSubtle`. No Borderless ocorre o mesmo, `#f2f2f2` (1,12:1). Em Dark/Darker, estes modos também têm Rest sutil. No Underline Fluent ambos os preenchimentos são transparentes em repouso e preservam o contexto. A prop `surfaceContext` escolhe classes do controle, sem fornecer contexto a esses descendentes. | **Submeter a diferença visual** para os slots ricos e avaliar derivação por modo/região, preservando Underline. |
| Controle fechado em Sandbox 0 | Em Light e Dark, `e3` Outline usa `#ffffff8f`, em Underline/Borderless usa `#fffffff5`. O trigger Outline também tem preenchimento translúcido. Faltam os marcadores canônicos para compor o fundo sutil e o vívido desse preset. | **Definir referências de fundo** antes de classificar estes casos pelo contrato de composição canônica. |

## Chip e TextField

A simulação estática usa o Schema resolvido de cada preset e compara o contexto que chega ao descendente com o resultado da regra de contraste. `inherit` resolve para o contexto recebido; estados omitidos usam Rest. A contagem é por segmento, tema, contexto de entrada, intenção, ênfase, estado aplicável e região. Inclui as receitas Standard presentes (não há Alternative nessas pinturas) e exclui overrides do aplicativo. Uma diferença indica troca da paleta usada pelo descendente, não um defeito visual automaticamente comprovado.

### Chip

`e1` organiza os slots. A pintura em `e2` pertence a Content/Select, onde o React publica o mapa para o conteúdo, inclusive Badge. Remove é uma ação irmã com fundo próprio em `e5`; seu conteúdo, por exemplo um ícone personalizado que consulta o contexto, hoje recebe o contexto ancestral. Esses dois pontos de pintura precisam de avaliações independentes. A simulação de Remove assume contexto explícito ausente ou igual ao ambiente. [React: Content, Select e Remove](../../packages/components/react/src/components/Chip/Chip.tsx) · [Fluent: paletas e mapas](../../packages/presets/src/presets/fluent-2-microsoft/components/chip.schema.ts)

| Preset | e2: iguais / mudam / indeterminados | e5: iguais / mudam / indeterminados |
| --- | ---: | ---: |
| Carbon IBM | 96 / 48 / 0 | 66 / 30 / 0 |
| Fluent Microsoft | 228 / 60 / 0 | 144 / 48 / 0 |
| Material Google | 141 / 51 / 96 | 72 / 24 / 96 |

Cada combinação de e2 cobre Rest, Selected e Disabled; e5 cobre Rest e Disabled. Os 48 casos divergentes do e2 Carbon distribuem-se em 10 Rest, 32 Selected e 6 Disabled; os 60 do Fluent, em 12, 36 e 12; os 51 determinados do Material, em 15, 36 e zero. No Material, os 96 indeterminados por região têm pintura parcialmente transparente e carecem da referência canônica do Container. A cor de um pixel capturado ou um fundo branco arbitrário não substituem essa escolha do preset.

**Exemplo para decisão visual.** No Fluent Microsoft, segmento default, Light, onVivid, Primary Medium Rest, e2 pinta `#c1deff`. Hoje o Badge recebe onVivid por herança. A cor é opaca e mede 1,39:1 contra branco; na derivação ele receberia onSubtle. Já em Remove, Primary High Rest sobre onSubtle, `#0059a1` passaria a publicar onVivid para o seu conteúdo. O rótulo e o ícone próprios possuem receitas de cor que podem ser resolvidas pelo Chip; a troca de contexto afeta os consumidores que consultam o Provider. Comparar um Badge e um ícone que realmente o consultem.

### TextField

Há dois produtores sequenciais no Fluent: o controle `e3` e a região `e8` de cada extremidade. Start e End podem escolher ênfases diferentes. Lowest acompanha o controle; Medium possui um painel próprio. O React resolve primeiro o contexto do controle, depois o da região, e publica o segundo para seus filhos. O rótulo externo e a mensagem não estão nesse Provider. No Material há TextField com cinco modos e pintura em e3; o preset não declara mapas nem o elemento e8. As regiões herdam o contexto. [Fluent: elementos e modos](../../packages/presets/src/presets/fluent-2-microsoft/components/text-field.schema.ts) · [Material: elementos e modos](../../packages/presets/src/presets/material-3-google/components/text-field.schema.ts) · [React: resolução dos slots](../../packages/components/react/src/components/TextField/TextField.runtime.tsx)

| Preset e coordenadas | e3: iguais / mudam / indeterminados | Região: iguais / mudam / indeterminados |
| --- | ---: | ---: |
| Fluent, ênfase autorada | 300 / 0 / 0 | 600 / 0 / 0 |
| Fluent, quatro ênfases públicas que caem em Medium | 840 / 360 / 0 | 2.040 / 360 / 0 |
| Material, ênfase autorada | 216 / 0 / 84 | 432 / 0 / 168 |
| Material, quatro ênfases públicas que caem em Medium | 864 / 0 / 336 | 1.728 / 0 / 672 |

Cenários por modo e ambiente: Rest neutral/error/warning e Disabled/ReadOnly neutral, a intenção efetivamente usada nesses terminais. ReadOnly tem pintura própria quando declarada, mas hoje o contexto usa Rest. Para cada cenário de controle, a região é contada uma vez por ênfase (Lowest/Medium); Start e End usam o mesmo resolvedor. Nos casos Material, as contagens da região refletem a herança direta do controle. As cores translúcidas sem fundo canônico são indeterminadas. A comparação cobre os estados estáveis; Hover/Focus/Pressed não são chaves de contexto produzido.

**Diferença concreta na API atual.** TextField aceita Highest, High, Medium, Low e Lowest. Quando falta uma receita da ênfase solicitada, o resolvedor de classes pode escolher Medium; o resolvedor de contexto conserva a superfície recebida. No Fluent, Light/onVivid, Standard Borderless Neutral High Rest, o controle usa o fundo de Medium `#f2f2f2` (1,12:1 contra branco), mas um filho numa região Lowest continua recebendo onVivid. A simulação o classificaria onSubtle. As 360 diferenças regionais no Fluent ocorrem em Lowest; o painel Medium já fornece sua própria superfície. Decidir a equivalência entre a receita visual efetiva e o contexto antes de migrar este componente. [Ênfases na API](../../packages/components/react/src/components/TextField/TextField.types.ts) · [Fallback de classes](../../packages/components/react/src/components/TextField/TextField.class-names.ts) · [Fallback de contexto](../../packages/components/react/src/shared/contexts/SurfaceContext.tsx)

**Decisões propostas.** Validar visualmente os casos Chip que trocam de contexto, inclusive o conteúdo independente de Remove. Para TextField, distinguir a equivalência em Medium do problema de fallback nas demais ênfases. Para Material, identificar por segmento/tema os fundos canônicos antes de concluir sobre preenchimentos com alfa. A etapa de migração precisaria de uma proposta de contrato para endereçar o produtor e2/e3/e8, a composição das regiões e eventualmente e5. O derivador atual trabalha com e1 de Button, Container e Card. [Regra atual do Surface Builder](../../packages/surface-builder/src/derive.ts)

<details>
<summary>Coordenadas que mudariam a paleta no Chip e no TextField</summary>

Uma linha agrupa combinações com a mesma transição. A pintura exemplifica a primeira coordenada de cada lista. S = `onSubtle`, V = `onVivid`. Em Chip, o filho de e2 é o conteúdo primário (por exemplo, Badge) e o de e5 é o ícone de Remove. Em TextField, e3 descreve a saída intermediária do controle e e8 a saída recebida pelo conteúdo de Start/End; a ênfase da região é a última da coluna. Inclui os fallbacks públicos. Os totais das duas regiões não medem ocorrências independentes de uma falha visual.

| Preset · região | Variante/modo · segmento | Tema · entrada | Intenção · ênfase(s) | Estado | Atual → calculado | Pintura de exemplo | Casos |
| --- | --- | --- | --- | --- | --- | --- | ---: |
| Carbon · chip · e5 | default | light, dark, darker · S | neutral, primary · high | rest | S → V | #3d3d3d | 6 |
| Carbon · chip · e5 | default | light, dark, darker · V | neutral, primary · high, medium, low | disabled | V → S | #f6f6f6 | 18 |
| Carbon · chip · e2 | default | light · V | neutral, primary · medium | rest | V → S | #e0e0e0 | 2 |
| Carbon · chip · e5 | default | light · V | neutral, primary · medium | rest | V → S | #e0e0e0 | 2 |
| Carbon · chip · e2 | default | light, dark, darker · V | neutral, primary · lowest | disabled | S → V | #00000000 | 6 |
| Carbon · chip · e2 | default | dark, darker · S, V | neutral · high | rest | S → V | #fbfbfb | 4 |
| Carbon · chip · e2 | default | dark, darker · S, V | neutral, primary · high, medium, low, lowest | selected | S → V | #fbfbfb | 32 |
| Carbon · chip · e2 | default | dark, darker · S | primary · medium | rest | S → V | #004cd6 | 2 |
| Carbon · chip · e5 | default | dark, darker · S | primary · medium | rest | S → V | #004cd6 | 2 |
| Carbon · chip · e2 | default | dark, darker · V | neutral · medium | rest | V → S | #4f4f4f | 2 |
| Carbon · chip · e5 | default | dark, darker · V | neutral · medium | rest | V → S | #4f4f4f | 2 |
| Fluent Microsoft · chip · e5 | default, teams | light, dark, darker · S | neutral, primary · high | rest | S → V | #585858 | 12 |
| Fluent Microsoft · chip · e5 | default, teams | light, dark, darker · V | neutral, primary · high, medium | disabled | V → S | #f2f2f2 | 24 |
| Fluent Microsoft · chip · e2 | default, teams | light, dark, darker · V | neutral, primary · medium | rest, disabled | V → S | #dbdbdb | 24 |
| Fluent Microsoft · chip · e2 | default, teams | light, dark, darker · V | neutral, primary · medium, low, lowest | selected | V → S | #bababa | 36 |
| Fluent Microsoft · chip · e5 | default, teams | light, dark, darker · V | neutral, primary · medium | rest | V → S | #dbdbdb | 12 |
| Fluent Microsoft · textField · e3 | standard · borderless · default, teams | light, darker, dark · V | neutral, error, warning · highest, high, low, lowest | rest | V → S | #f2f2f2 | 72 |
| Fluent Microsoft · textField · e8 | standard · borderless · default, teams | light, darker, dark · V | neutral, error, warning · highest, high, low, lowest · lowest | rest | V → S | #ffffff00 | 72 |
| Fluent Microsoft · textField · e3 | standard · borderless · default, teams | light, darker, dark · V | neutral · highest, high, low, lowest | disabled, readOnly | V → S | #f2f2f2 | 48 |
| Fluent Microsoft · textField · e8 | standard · borderless · default, teams | light, darker, dark · V | neutral · highest, high, low, lowest · lowest | disabled, readOnly | V → S | #ffffff00 | 48 |
| Fluent Microsoft · textField · e3 | floating · notched, inside · default, teams | light, darker, dark · V | neutral, error, warning · highest, high, low, lowest | rest | V → S | #ffffff | 144 |
| Fluent Microsoft · textField · e8 | floating · notched, inside · default, teams | light, darker, dark · V | neutral, error, warning · highest, high, low, lowest · lowest | rest | V → S | #ffffff00 | 144 |
| Fluent Microsoft · textField · e3 | floating · notched, inside · default, teams | light, darker, dark · V | neutral · highest, high, low, lowest | disabled, readOnly | V → S | #ffffff | 96 |
| Fluent Microsoft · textField · e8 | floating · notched, inside · default, teams | light, darker, dark · V | neutral · highest, high, low, lowest · lowest | disabled, readOnly | V → S | #ffffff00 | 96 |
| Material · chip · e5 | default, dynamic, purple | light, dark · S | neutral, primary · high | rest | S → V | #010101 | 12 |
| Material · chip · e5 | default, dynamic, purple | light · V | neutral, primary · high, medium | rest | V → S | #ededed | 12 |
| Material · chip · e2 | default, dynamic, purple | dark · S | neutral · high | rest | S → V | #fbfbfb | 3 |
| Material · chip · e2 | default, dynamic, purple | dark · S | neutral · high, medium, low, lowest | selected | S → V | #ebebeb | 12 |
| Material · chip · e2 | default, dynamic, purple | dark · V | neutral, primary · high, medium | rest | S → V | #ededed | 12 |
| Material · chip · e2 | default, dynamic, purple | dark · V | neutral, primary · high, medium, low, lowest | selected | S → V | #f2f2f2 | 24 |

</details>

## Button, Container e Card/CardAction

O corpo destes três componentes é `e1.boxColor`. Para reproduzir a comparação, carregar os presets com `loadSurfacePresets`, ler o JSON adjacente, aplicar `materializeSurfaceContexts` e expandir `e1` com `collectAlternativePaletteScopes` e `resolveElementPaletteSources`. Isso recompõe a pintura Rest do Card a partir do Container antes da medição. Percorrer as receitas presentes por segmento, tema, entrada, variante, intenção e ênfase. No Button, ausente o fundo mas presente outra propriedade da receita, considerar o fundo transparente. Comparar somente Alternative publicável para a coordenada, conforme `buildColorVariantCapabilities`. [Materialização](../../packages/surface-builder/src/artifact.ts) · [Pintura por variante](../../packages/surface-builder/src/palettes/resolveElementPaletteSources.ts) · [Cobertura de variantes](../../packages/web-builder/src/component-artifacts/colorVariantCapabilities.ts)

Para cada coordenada, resolver a pintura de `rest`, `selected.rest`, `pending` e `disabled`, com fallback para Rest. No lado do contexto, resolver o mapa da variante, aplicar a mesma precedência do React e converter mapa ausente ou `inherit` na entrada efetiva. Container e Card complementar admitem apenas Rest. O Rest de Card e CardAction é contado uma vez. Para seleção Medium/High do Button com projeção disponível, o React seleciona **a receita High/Rest da intenção e variante efetivas**; essas folhas já entram na contagem. Hover, Focus e Pressed não selecionam outra saída para descendentes. Os números medem coordenadas de receita, não instâncias visuais do Showcase, combinações de props de composição, BrandPacks ou cores de texto. [Regra do pré-build](../../packages/surface-builder/src/derive.ts) · [Seleção de pintura](../../packages/components/react/src/components/Button/Button.selection.ts) · [Precedência do Provider](../../packages/components/react/src/shared/contexts/SurfaceContext.tsx)

| Corpo | Mesmo contexto efetivo | Mudaria o contexto | Indeterminado |
| --- | ---: | ---: | ---: |
| Button | 1.840 | 145 | 855 |
| Container | 465 | 6 | 0 |
| Card / CardAction | 1.644 | 83 | 1 |
| **Total** | **3.949** | **234** | **856** |

No Fluent 2 Microsoft as **1.624 coordenadas** coincidem: 1.080 de Button, 140 de Container e 404 de Card/CardAction. Os três Sandboxes coincidem em 40 de Container e 160 de Card por preset. No iOS 18 estes três componentes estão ausentes. No Material, Container e Card coincidem nas 600 coordenadas apuradas; migrar dependeria ainda de marcar os fundos canônicos exigidos pelo derivador. `referenceFor` identifica a pintura usada para compor transparência; ela pode produzir `onSubtle` mesmo quando serve de referência para `onVivid` em Dark.

**Onde mudaria a paleta do filho.** A tabela agrupa todas as 234 diferenças determináveis. Cada linha contém as coordenadas que fazem aquela transição e um exemplo de preenchimento. Listas na mesma linha formam um produto cartesiano; a cor e a razão exemplificam a **primeira opção** de cada lista. S = `onSubtle`, V = `onVivid`. Todas as linhas usam Standard e segmento `default`, salvo indicação. Em Container ou Card, o filho de referência é um Button colocado dentro do corpo. Em Button, é um descendente que consome contexto, como um Badge inline quando o preset suporta a relação. Elegant e Fluent 2 Kiskadee não têm o slot de Badge inline; nesses dois, a mudança seria observável com um filho que lê o contexto, sem presumir suporte a Badge.

| Preset · dono | Tema · entrada | Intenção · ênfase | Estado | Atual → cálculo | Exemplo · razão | Casos |
| --- | --- | --- | --- | --- | --- | ---: |
| Carbon · Button | dark, darker · S | primary, neutral · high | selected | V → S | `#0048cb` · 2,79:1 | 4 |
| Carbon · Button | dark, darker · S | neutral · low | selected | V → S | `#4f4f4f` · 2,56:1 | 2 |
| Carbon · Button | dark · S | primary, neutral, destructive, positive · high, medium | disabled | S → V | `#727272` · 4,37:1 | 8 |
| Carbon · Button | dark, darker · V | primary, neutral, destructive, positive · high | rest | S → V | `#ffffff` · 21,00:1 | 8 |
| Carbon · Button | dark, darker · S | primary · low | selected | S → V | `#fbfbfb` · 20,29:1 | 2 |
| Carbon · Card | dark, darker · S, V | primary · highest | selected | V → S | `#0048cb` · 2,79:1 | 4 |
| Carbon · Card | light, dark, darker · S, V | primary, neutral · high, medium, low, lowest | disabled | S → V | `#8c8c8c` · 3,36:1 | 48 |
| Carbon · Card | light, dark, darker · S, V | primary · highest | disabled | S → V | `#8c8c8c` · 3,36:1 | 6 |
| Carbon · Card | dark · S, V | neutral · high | rest, pending | S → V | `#727272` · 4,37:1 | 4 |
| Carbon · Card | darker · S, V | neutral · high | selected | S → V | `#727272` · 4,37:1 | 2 |
| Carbon · Card | dark · S, V | neutral · medium | selected | S → V | `#727272` · 4,37:1 | 2 |
| Carbon · Container | dark · S, V | neutral · high | rest | S → V | `#727272` · 4,37:1 | 2 |
| Elegant · Button | light · S | primary · high | rest, pending | S → V | `#0091ff` · 3,23:1 | 2 |
| Elegant · Card | light · S | neutral · medium | selected | S → V | `#0091ff` · 3,23:1 | 1 |
| Fluent Kiskadee · Button | light, dark · S | primary · high | rest, selected, pending | S → V | `#0f6cbd` · 5,38:1 | 6 |
| iOS 27 · Button | light · V | primary, neutral, destructive, positive · high, medium | rest, pending | V → S | `#ffffff` · 1,00:1 | 16 |
| iOS 27 · Button | light · V | primary, neutral, destructive, positive · medium | selected | V → S | `#dbebff` · 1,21:1 | 4 |
| iOS 27 · Button | dark, darker · S | positive · high | rest, selected, pending | S → V | `#00a23d` · 6,24:1 | 6 |
| iOS 27 · Button | light, dark, darker · S | primary, neutral, destructive · high | rest, selected, pending | S → V | `#0088ff` · 3,52:1 | 27 |
| iOS 27 · Card | dark, darker · S, V | primary · highest | rest, selected, pending, disabled | V → S | `#004588` · 2,21:1 | 16 |
| iOS 27 · Container | dark, darker · S, V | primary · highest | rest | V → S | `#004588` · 2,21:1 | 4 |
| Material · Button | default, dynamic, purple · dark · S, V | primary, neutral, support, destructive, positive · high | rest, selected | S → V | `#4f90ff` · 6,77:1 | 60 |

**Onde falta referência.** Em 843 coordenadas translúcidas falta o marcador canônico para o **contexto de entrada** no segmento e tema correspondentes. São 141 de Button Carbon, duas de Button Elegant, uma de CardAction Elegant, três de Button Fluent Kiskadee, 156 de Button iOS 27 e 540 de Button Material. Carbon e iOS 27 precisam dos dois fundos em `default` nos três temas; Material precisa de ambos nos segmentos `default`, `purple` e `dynamic` em Light e Dark. Os casos de Elegant usam `default.light.onSubtle`; os de Fluent Kiskadee usam `onSubtle` em Dark nos seus três segmentos. Fixar primeiro a referência oficial de cada dono do catálogo. Há mais 13 resultados de Button Fluent Kiskadee sem classificação pelo algoritmo atual: sete receitas efetivas com gradiente em `modern` e seis com cor CSS dependente da instância em `dynamic`. Esse preset sequer declara Container. Preservar a herança nesses ramos até decidir como representar fundo de referência, gradiente e valor dinâmico. [Receitas do Button Fluent Kiskadee](../../packages/presets/src/presets/fluent-2-kiskadee/fluent-2-kiskadee.schema.ts) · [Cores dinâmicas](../../packages/presets/src/presets/dynamic.color.ts)

**Traço Button → Badge.** No Fluent Microsoft / default / Light, um Button Primary High Standard sobre S pinta `#0064b4` em Rest (6,03:1 sobre branco) e publica V. Selected usa `#0d477e` e também publica V; Pending usa `#0064b499` (2,74:1 após composição) e publica S; Disabled usa `#0000000d` (1,12:1) e publica S. O build Web compacta esse mapa por paleta. O React resolve a coordenada de pintura e envolve o conteúdo no Provider. `Button.Badge placement="inline-end"` conserva esse contexto; `Badge` o consulta ao selecionar suas classes. Na colocação externa, `Button.Badge` reinstala o contexto ambiente recebido pelo Button. Nesse mesmo Rest o Badge externo recebe S, porque ocupa outra região. [Mapa completo](../../packages/presets/src/presets/fluent-2-microsoft/generated/surface-contexts.json) · [Publicação Web](../../packages/web-builder/src/component-artifacts/publishComponentResources.ts) · [Button e relação de Badge](../../packages/components/react/src/components/Button/Button.tsx) · [Consumo pelo Badge](../../packages/components/react/src/components/Badge/Badge.tsx) · [Composição Showcase](../../packages/showcase/app/badge/BadgeShowcase.tsx)

**Decisão de migração.** Manter a derivação Fluent. Nos demais presets, levar as transições determináveis à decisão visual, principalmente o Disabled de CardAction Carbon, o Primary Highest escuro do iOS e as intenções High do Button Material em Dark. Uma diferença demonstra que o filho trocaria de receita; confirmar a aparência pretendida antes de substituir um mapa manual. Os casos que hoje apenas herdam no Button de Elegant, iOS 27 ou Fluent Kiskadee também merecem decisão explícita.

## Composições, slots e elementos que apenas consomem o contexto

O formato do filho importa. Um SVG que usa `currentColor` pode receber a cor correta do slot mesmo quando um `Icon`, `Badge` ou `Text` independente, no mesmo lugar, selecionaria a paleta do ancestral. Os exemplos abaixo consideram filhos que consultam Surface Context, sem override do aplicativo.

| Componente e região | Quem pinta e quem recebe o contexto hoje | Ação |
| --- | --- | --- |
| Accordion · moldura | No Fluent Microsoft, Light, `Accordion.Item` usa Card Neutral. Em default e teams, inclusive sobre V, as quatro ênfases permitidas produzem S. Em Medium, a cor é `#f2f2f2`. | Manter a delegação ao Card. |
| Accordion · cabeçalho | CardAction recebe explicitamente o contexto guardado pela raiz do Accordion. Resolve a superfície para os filhos do cabeçalho; o ícone próprio solicita foreground herdado. | Manter CardAction como dono. Revisar o override da raiz se ele mascarar uma mudança de superfície da moldura. |
| Accordion · painel e divisória | O conteúdo do painel está em Container Neutral e recebe sua saída S. A divisória é irmã do Container, dentro da moldura. Quando o Accordion começa em V, ela recebe explicitamente V e Medium, embora esteja sobre o Card Medium `#f2f2f2` (1,12:1 → S). As cores de repouso atuais do Container Neutral coincidem nas duas entradas. | Rever o contexto e a ênfase da divisória. Comparar o painel aberto sobre V e S. A correção pode usar o Provider do Card já presente. [Composição](../../packages/components/react/src/components/Accordion/Accordion.tsx) · [Temas e ênfases suportados](../../packages/presets/src/presets/fluent-2-microsoft/components/accordion.schema.ts) |
| Badge · texto e Dot | O texto aceita string/número. Dot tem preenchimento próprio e não contém conteúdo independente. Ambos já escolhem classes pela superfície recebida. | Manter. A relação Button.Badge determina a entrada, conforme a colocação. |
| Badge.Mark · contained | `e5` pinta a cápsula e `e4` estiliza o ícone fornecido. Em default/Light/S/Neutral High Rest, o filho herda S; pelo fundo receberia V nos quatro presets: Carbon `#3d3d3d` (10,86:1), Fluent `#252525` (15,33:1), iOS 27 `#1c1c1e` (17,01:1) e Material `#010101` (20,87:1). | Submeter a composição com um ícone independente. Manter o tratamento já autorado para glifos que herdam a cor do slot. |
| Badge.Mark · full-bleed | A arte fornecida cobre a área do Mark; o tratamento de separação pode acrescentar uma base atrás da arte. O componente não sabe a cor da imagem. | Manter a semântica atual da arte. [Badge React](../../packages/components/react/src/components/Badge/Badge.tsx) · [Contrato de Badge.Mark](../../docs/definitions/badge-chip-contract.md) |
| Switch · rótulo e texto ao lado do controle | Os nós de label e controlText ficam fora da thumb. O contexto ambiente segue disponível aos elementos fornecidos. | Manter. |
| Switch · thumb | Track `e2` e thumb `e3` têm preenchimentos distintos. Os ícones rest/selected são filhos da thumb quando o slot existe. Em Fluent/default/Light/S/Standard/Base/Neutral Medium Rest, `e3=#616161` (6,19:1). Um ícone com foreground próprio recebe S; a superfície local resultaria em V. Selecionado, o mesmo polegar passa a branco, que resulta em S. | Submeter apenas o slot de ícone. O fundo do track sozinho daria a resposta errada. [Switch](../../packages/components/react/src/components/Switch/Switch.tsx) |
| Slider · labels, marcas e texto de apoio | O campo posiciona labels, ícones das extremidades e marcas. Track e faixa ativa são peças de pintura. Nem todo nó interno ao track está visualmente sobre ele. | Manter a herança nos textos externos e distinguir interior do polegar de rótulos posicionados fora dele. |
| Slider · polegar | O polegar e seu miolo têm receitas próprias (`e10/e11` no Fluent). `thumbIcon` aceita um nó. A geometria própria do modo com ícone pode mudar qual camada está atrás desse nó. | Rever o slot com um ícone que consulta contexto. Identificar a camada visível antes de escolher a receita para a derivação. |
| Slider · balão de valor | No Fluent/default/Light/S/Standard/Base/Neutral Medium, ao habilitar o tooltip, `e14=#252525` (15,33:1). Um Text fornecido por `formatValue` recebe S sobre esse fundo V; o resumo do valor fora do balão pode reutilizar o mesmo formatter. | Avaliar o **balão** separadamente do resumo. [Slider](../../packages/components/react/src/components/Slider/Slider.tsx) · [ValueIndicator no Headless](../../packages/headless/react/src/components/slider/HeadlessSlider.tsx) |
| Tabs · barra e tab | No Material, `e1` pinta a barra quando aplicável, `e2` o trigger. Em Box, o indicador `e5` pode ocupar a área da tab selecionada. Em default/Light/S/Neutral Medium Selected Rest, `e2` é transparente sobre o indicador `#0b57d0` (6,39:1). Um Badge customizado no slot recebe S, onde o cálculo daria V. Em Line/Dot, a marca de seleção cobre só parte da tab. A resolução das classes de Tabs também omite a entrada de Surface Context e usa o default sutil. | Submeter Box/Segmented e a pintura da shell de Bridge separadamente; escolher a superfície pela geometria e estado de cada variante. Verificar o consumo de V antes de generalizar uma saída para Tabs. [Slots de Tabs](../../packages/components/react/src/components/Tabs/Tabs.parts.tsx) · [Resolvedor de classes](../../packages/components/react/src/components/Tabs/Tabs.class-names.ts) · [Receitas de Box](../../packages/presets/src/presets/material-3-google/components/tabs/tabs.box.schema.ts) |
| Tabs · painel | Content envolve a árvore do consumidor; a implementação comum e a de Bridge aplicam a classe estrutural de painel. O conteúdo herda a superfície do ancestral. | Manter a herança; o indicador da barra não está atrás do painel. |
| Layout | A raiz e o wrapper interno cuidam de geometria. Os filhos continuam na superfície recebida. | Manter. [Layout](../../packages/components/react/src/components/Layout/Layout.tsx) |
| Text | Resolve tipografia e foreground para o nó de texto; filhos inline continuam sobre o fundo do ancestral. | Manter. [Text](../../packages/components/react/src/components/Text/Text.tsx) |
| Icon | Resolve o foreground do glifo, sem pintar uma região de composição. | Manter. [Icon](../../packages/components/react/src/components/Icon/Icon.tsx) |
| Separator | Pinta a linha decorativa em `e1`. Ela consome contexto e não oferece uma região para conteúdo. | Manter. [Separator](../../packages/components/react/src/components/Separator/Separator.tsx) |
| Progress | Track e Indicator são as duas peças internas montadas por Progress. A barra pintada não recebe um slot de composição independente. | Manter. [Progress](../../packages/components/react/src/components/Progress/Progress.tsx) |

## Ordem recomendada e decisões de contrato

1. **Corrigir a propagação usando contratos existentes.** Começar pelo popup estilizado do Select. Verificar a divisória do Accordion em Light/onVivid e alinhar o fallback de ênfase do TextField com a receita que efetivamente pinta seu controle. Os três cenários têm entrada, filho e resultado esperado identificados. Validar com um consumidor independente dentro da região e outro fora dela.
2. **Validar mudanças visuais que já podem ser medidas.** Priorizar Chip Fluent (Content/Select e Remove), CardAction Carbon Disabled, Card/Container iOS 27 Primary Highest em Dark/Darker e Button Material High em Dark. Escolher por grupo se a saída seguirá a derivação ou preservará uma convenção do preset. Conferir essas escolhas em um filho real e registrar a decisão com o preset.
3. **Definir os fundos de referência por preset e completar as comparações com alfa.** Usar o catálogo de Container por segmento e tema, com um fundo opaco para cada entrada. Nenhuma ênfase universal identifica automaticamente esses fundos. Nos presets sem Container ou sem catálogo, a escolha de uma referência portátil precisa de refinamento. Gradientes e cores resolvidas em runtime exigem decisão própria.
4. **Ampliar a derivação com paridade demonstrada.** Priorizar candidatos sem mudança de saída e com referências disponíveis. Para os demais, migrar somente os grupos aprovados. Manter a composição delegada no Accordion, o reset dos painéis que permanecerem sutis e a herança nos componentes de texto, ícone e geometria. Fazer uma rodada separada para os slots locais de Badge.Mark, Select fechado, Slider, Switch e Tabs.

**Proposta para aprovação futura.** Button e Container já aceitam `{ derive: { element: 'e1', property: 'boxColor' } }`. O campo atual de Chip aceita um mapa. Para automatizar sua região primária, a menor extensão seria aceitar também `{ derive: { element: 'e2', property: 'boxColor' } }` em `chip.contentSurfaceContext`. A saída continuaria sendo o mapa portátil de Chip. Remove precisaria de uma saída independente caso seja aprovada a contextualização do ícone.

No TextField, cada modo já possui dois campos opcionais de mapa. Para automatizá-los, a proposta é admitir a mesma forma derivada com `e3.boxColor` para `contentSurfaceContext` e `e8.boxColor` para `contentRegionSurfaceContext`. A simulação de e8 precisa do **fundo local de e3**, incluindo a ênfase escolhida para o controle. Hoje a classe que pinta e8 também recebe o contexto **de saída** da região. Antes da implementação, separar no contrato a entrada da pintura e a saída para o filho; verificar se dois fundos reais de e3 que produzem o mesmo contexto exigiriam saídas diferentes de e8. Se isso ocorrer, a chave atual do mapa regional é insuficiente. A ação conectada como irmã do controle também deve ficar fora dos Providers de Start/End.

Select fechado e os demais slots candidatos só justificam novos campos após validar a intenção visual. Para cores transitórias de itens Carbon, decidir primeiro se os filhos devem mudar de paleta durante Hover/Pressed. Qualquer proposta estrutural deverá mostrar o antes/depois em Core/Presets, o mapa portátil emitido e o consumo pelos publicadores Web e nativos. A presente auditoria registra essas opções para decisão. [Contrato de Chip](../../packages/core/src/components/chip.ts) · [Contrato de TextField](../../packages/core/src/components/text-field.ts) · [Responsabilidades entre pacotes](../definitions/project-governance.md)

## Verificação

- `pnpm --filter @kiskadee/surface-builder check` confirmou os **dez** mapas versionados contra a derivação atual.
- Passaram **114 testes em seis arquivos**: derivação do contexto do Button no Surface Builder e testes React de Button.Badge, Card, Accordion, Select e conteúdo de TextField. O teste de Badge verifica separadamente a colocação inline, a externa e o override explícito. [Teste de composição](../../packages/components/react/src/components/Button/Button.badge.test.tsx)
- As contagens comparam valores efetivos do Schema e dos mapas com o caminho de resolução do React. Os exemplos adicionais de Slider, Switch, Badge.Mark e Tabs são casos concretos para decisão, sem extrapolação para todas as geometrias e modos. Os testes existentes não constituem aceite visual dessas mudanças.
