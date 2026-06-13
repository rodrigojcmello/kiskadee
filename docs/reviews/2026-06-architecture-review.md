# Kiskadee — Análise de Arquitetura (Junho/2026)

> **Para quem é este documento:** o mantenedor (Rodrigo) e a IA que executará os ajustes.
> Cada item de ação segue o formato **O que / Por quê / Onde / Como / Critério de aceite**,
> para que possa ser executado sem contexto adicional além deste repositório.
>
> **Veredito antecipado:** a arquitetura **não deve ser jogada fora**. Ela é coerente,
> bem documentada e o modelo de pré-compilação está correto. O "excesso de runtime" que
> motivou esta análise é menor do que parece — está concentrado em 2 pontos específicos
> (motion das Tabs e geometria do Switch), não no modelo em si. Os problemas mais graves
> não são de runtime: são **custo de autoria de presets** e **ausência de distribuição**.

---

## 1. Visão geral medida (evidências)

Números levantados em 2026-06-12 (LOC aproximado, excluindo testes salvo indicação):

| Pacote | LOC src | LOC testes | Observação |
|---|---|---|---|
| `packages/core` | ~4.800 | ~30 | Contratos/types do schema |
| `packages/presets` | ~12.500 | ~560 | 7 presets; M3 Google sozinho = ~4.500 |
| `packages/web-builder` | ~6.700 | ~4.700 | Pipeline de 8 fases; ratio teste:código 41% |
| `packages/runtime` | ~340 | ~215 | Cor dinâmica + classes de plataforma |
| `packages/headless/react` | ~2.900 | ~560 | 6 componentes headless |
| `packages/components/react` | ~5.000 (TS) + ~3.000 (SCSS) + ~1.400 (hooks/effects) | ~330 | Button, Switch, Tabs, TextField, SmoothText |

Artefatos gerados (`packages/web-builder/build/`):

| Design System | Total bruto | CSS gzip | JSON gzip |
|---|---|---|---|
| carbon-1-ibm | ~100 KB | ~1,2 KB | ~4,2 KB |
| fluent-2-microsoft | ~108 KB | ~1,5 KB | ~4,8 KB |
| ios-26-apple | ~120 KB | ~1,7 KB | ~5,7 KB |
| material-design-3-google | ~664 KB | ~6,7 KB | ~24 KB |

Leitura: **o CSS entregue ao usuário final é minúsculo** (1–7 KB gzip por DS). A dedupe por
contagem de uso + minificação base-26 de nomes de classe funciona muito bem. O peso do
Material 3 vem da proliferação de paletas (75+ famílias de cor × 2 modos), não de ineficiência.

---

## 2. Pontos fortes (mantenha — e proteja nos refactors)

Estes são os ativos da arquitetura. Qualquer refactor que enfraqueça um deles é regressão.

1. **Taxonomia do schema (palettes / scales / decorations / effects + options vs elements + variant vs mode).**
   É o diferencial conceitual do projeto. A separação permite trocar identidade visual sem tocar
   em comportamento, e o par `variant`/`mode` evita explosão de API. Documentada em
   `SCHEMA-BUILD-RUNTIME-RULES.md` com registros de decisão (contexto/decisão/razão/consequência) —
   formato raro até em projetos grandes.

2. **Pipeline de build em 8 fases (`packages/web-builder/src/run-build.ts`).**
   Fases isoladas, determinísticas (mesma entrada → mesma saída), zero TODOs em código de
   produção, 41% de ratio de teste. A dedupe por identidade de style key + encurtamento
   base-26 entrega CSS final com 5–15% do tamanho bruto após gzip.

3. **Resultado de runtime "disciplinado" no caminho de estilo.**
   Apesar do receio de "muito runtime": cores, estados, ênfases, raios, sombras e até o
   activation feedback (ripple/halo) são **pré-compilados em CSS + CSS variables**. O runtime
   só compõe classes já geradas. Resolução de classe é ~1–2 ms por componente, memoizada,
   sem rede por render (cache de Promise por chave DS+tema+segmento). Isso está alinhado com
   a regra "runtime compõe, não inventa design" — e o código cumpre a regra.

4. **Soluções web específicas de alta qualidade:**
   - Compensação borda/padding via `max(0px, calc(var(--k-pd*) - var(--k-bdw)))` — resolve
     a divergência de box model entre web e plataformas nativas sem o autor do preset perceber.
   - Branch duplo de seletores (pseudo nativo `:hover` + projetado `.-h.-a` com gate `.-a`) —
     permite forçar estados em showcase/preview estático sem JS hacky.
   - Segmento/tema como arquivos CSS separados → carregamento seletivo.

5. **Camada headless com semântica nativa.**
   `<button>`, `<input type="checkbox">`, roles ARIA corretos, keyboard nativo. Dependência
   única e leve (`@floating-ui/react`). É a fundação certa para a promessa multiplataforma.

6. **Cultura de documentação e decisão.**
   `docs/rejected/` (com critérios de "revisitar quando..."), `docs/proposals/`,
   `docs/technical-debt/`, skills para agentes de IA. Isso é exatamente o que torna o projeto
   "AI-friendly" — uma IA consegue trabalhar aqui sem inventar arquitetura.

7. **`packages/runtime` é exemplar:** ~340 LOC, zero dependências, custo único de boot ~7 ms.
   Não há nada a cortar aqui.

---

## 3. Resposta direta à pergunta: "há runtime demais?"

**Não no modelo — sim em dois pontos de implementação.**

O modelo (pré-compilar tudo, runtime só compõe) está correto e é raro de ver tão bem executado.
O custo de runtime real, medido por inspeção de código:

| Fonte de custo | Custo | Veredito |
|---|---|---|
| Resolução de class maps (todos componentes) | ~1–2 ms por mount, memoizado | OK, não mexer |
| Boot do runtime (cor dinâmica + plataforma) | ~7 ms uma vez | OK, não mexer |
| Activation feedback do Button (ripple/halo) | CSS + timeouts, <1 ms | OK — é o jeito certo |
| **Framer Motion (`motion` v12) nas Tabs** | ~100–120 KB min (~30–40 KB gzip) no bundle | **Exagero. Maior custo único do projeto.** |
| **Loop de geometria do Switch** (`getComputedStyle` por frame de animação) | 5–10 ms por transição | **Exagero pontual. Corrigível sem perder a transição.** |

Ou seja: as transições **não exigem** o runtime que existe hoje. Elas exigem *medição de DOM
uma vez por transição* + *CSS/WAAPI para animar*. O preço que você achou que estava pagando
("runtime é o custo das transições") na verdade é o preço de **uma dependência** e de
**um loop de medição**, ambos substituíveis. Ver ações A1 e A2.

Um terceiro custo, menos visível: **duplicação de runtime entre componentes** (resolvers e
hooks de artifact-config quase idênticos em Button/Switch/TextField/Tabs). Não pesa no bundle
hoje, mas pesa em manutenção e vai escalar mal para 20+ componentes. Ver ação A3.

---

## 4. Pontos fracos e ações (priorizadas)

Prioridades: **P0** = fazer antes de qualquer release público; **P1** = alto retorno, fazer em
seguida; **P2** = melhoria contínua.

### A1 (P0) — Remover/isolar o Framer Motion das Tabs

- **O que:** eliminar a dependência `motion` (Framer Motion) de `packages/components/react`,
  ou no mínimo torná-la opt-in com import lazy.
- **Por quê:** é o maior custo de bundle do projeto (~30–40 KB gzip), usado apenas para o
  indicador das Tabs. Contradiz a tese central do framework ("web é sensível a bundle").
  O CSS gerado de um DS inteiro pesa 1–7 KB gzip — a lib de animação pesa 5–20× isso.
- **Onde:** `packages/components/react/.../Tabs/*/Tabs.*.motion.tsx` (box, line, dot, etc.),
  `resolveSpringConfig()`, `package.json` do pacote.
- **Como (em ordem de preferência):**
  1. **Técnica FLIP + CSS transition/WAAPI:** medir rect do tab ativo anterior e do novo
     (2 leituras de DOM por troca de aba, não por frame), aplicar `transform: translateX/scaleX`
     com `transition` ou `element.animate()` (WAAPI já suporta spring-like via
     `linear()` easing — gerar a curva `linear()` a partir dos presets snappy/gentle no build).
  2. Se algum efeito (ex.: stretch+bounce do `line`) exigir física real, manter um micro-spring
     próprio (~1 KB; integração semi-implícita de mola é ~30 linhas) em vez da lib inteira.
  3. Alternativa mínima se 1–2 forem inviáveis no curto prazo: `LazyMotion` + `domAnimation`
     com `import()` dinâmico, para tirar o custo do bundle inicial.
- **Critério de aceite:** `motion` fora de `dependencies` (ou carregado só sob demanda);
  showcase das Tabs visualmente equivalente (gravar antes/depois); bundle do pacote
  `@kiskadee/react-components` reduzido em ≥25 KB gzip.

### A2 (P1) — Tirar `getComputedStyle` do loop de animação do Switch

- **O que:** medir a geometria do Switch **uma vez por transição** (ou por resize), cachear,
  e dirigir a animação só com CSS variables/transform.
- **Por quê:** hoje `calculateSwitchRuntimeMotionGeometry()` lê `getComputedStyle` +
  `offsetWidth`/`clientHeight` dentro do `requestAnimationFrame` (~60 fps), causando potencial
  layout thrashing (5–10 ms/frame em hardware modesto). A leitura por frame só seria necessária
  se a geometria mudasse durante a transição — não muda.
- **Onde:** `packages/components/react/.../Switch/effects/motion/` (geometry.ts, controller).
- **Como:** medir no início da transição e em `ResizeObserver`; escrever as CSS vars uma vez;
  deixar o CSS `transition` interpolar. O doc `docs/rejected/switch-motion-geometry-artifact.md`
  já decidiu (corretamente) não levar geometria para o build — a solução é cachear no runtime,
  não pré-compilar.
- **Critério de aceite:** zero leituras de layout dentro de callbacks de RAF durante a
  transição do Switch; comportamento visual idêntico, incluindo thumb-shrink e ícones.

### A3 (P1) — Extrair resolver e artifact-config genéricos

- **O que:** criar utilitários compartilhados: `resolveElementClasses()` (núcleo da resolução
  elemento → intent → ênfase → escala → estado) e uma factory
  `createComponentArtifactConfig(componentName, opts)` para os hooks de carga/merge de artefatos.
- **Por quê:** `resolveButtonClassNames` (~160 LOC), `resolveSwitchClassNames` (~250 LOC),
  equivalentes de TextField/Tabs, e 4 hooks `use<X>ArtifactConfig` (~80–120 LOC cada) repetem
  o mesmo padrão. Com 4 componentes já são ~800 LOC duplicadas; com a meta de 20 componentes
  isso vira o principal custo marginal de cada componente novo. Reduzir o custo marginal de
  um componente é a métrica que importa para o roadmap.
- **Onde:** `packages/components/react/` (hooks e `*.classNames.ts` de cada componente);
  considerar um diretório `shared/class-resolution/`.
- **Como:** extrair o caso comum; manter extensões específicas (ex.: `activationMotion` do
  Switch, `variant` das Tabs) como callbacks/patches sobre o resultado genérico. Fazer um
  componente por PR, com snapshot de classes resolvidas antes/depois para garantir equivalência.
- **Critério de aceite:** novo componente visual precisa de <50 LOC de plumbing de resolução;
  os 4 componentes atuais consomem o utilitário; testes de snapshot de class-resolution passam.

### A4 (P1) — Reduzir o custo de autoria de presets (camada de authoring)

- **O que:** criar uma camada de autoria de presets de nível mais alto (builder/factories com
  defaults e herança explícita) + validação executável do schema completo.
- **Por quê:** este é **o maior risco estratégico da arquitetura**. Evidências:
  `text-field.schema.ts` do M3 = ~1.370 LOC; `button.schema.ts` = ~530 LOC; M3 inteiro =
  ~4.500 LOC autorados à mão. A matriz intent × ênfase × estado × tema × segmento é exponencial
  e hoje é preenchida manualmente. Consequência direta: cobertura incompleta (textField existe
  só no M3; tabs em 2 de 7 presets). E a tese de produto ("uma IA popula o schema a partir do
  Figma") depende de o alvo ser compacto e validável — hoje uma IA gerando 1.370 linhas tem
  superfície enorme para alucinar.
- **Onde:** novo módulo em `packages/presets/src/authoring/` (ou pacote próprio);
  validação em `packages/core` (já existem contratos por componente em
  `core/src/utils/validateComponentContracts.ts` — generalizar).
- **Como:**
  1. Builders com defaults: o autor declara apenas deltas (`rest` + o que muda em hover/pressed),
     e o builder expande a matriz completa. Os helpers existentes (`buildBySegment`,
     `segmentFactory.mergeThemePalettes`, `createPresetColorGetter`) são o embrião — promover
     a API oficial de autoria, documentada.
  2. Validação runtime (zod já é dependência do core): comando `pnpm validate-presets` que
     valida todos os presets contra os contratos e falha o build com mensagens apontando o
     caminho exato do erro (`components.button.elements.e1.palettes...`). Mensagens de erro
     boas são o que torna o loop de uma IA autora viável.
  3. Resolver o TODO de `s:all` (`core/src/breakpoints.ts`) nessa mesma camada: autor escreve
     um valor, o builder expande para breakpoints.
- **Critério de aceite:** reescrever 1 componente de 1 preset (ex.: button do Carbon) na nova
  API com ≤40% das LOC atuais e saída de artefatos byte-idêntica; `validate-presets` roda no
  pre-commit; guia "como autorar um preset" em `packages/presets/docs/`.

### A5 (P0) — Tornar o projeto distribuível

- **O que:** pipeline de publicação: remover `private: true` dos pacotes consumíveis, versões
  semver (changesets), CI (GitHub Actions: biome + vitest + build + publish), e **artefatos
  pré-compilados publicados** (npm `@kiskadee/artifacts-<ds>` ou CDN), além de guia de
  instalação para consumidor externo (Next.js e Vite no mínimo).
- **Por quê:** hoje um terceiro **não consegue usar o Kiskadee de nenhuma forma** — todos os
  pacotes são privados, não há CI, não há docs de consumo, e usar um DS exige rodar o
  web-builder dentro do monorepo. Toda a tese de negócio (adoção, estrelas, IA recomendando
  o framework) é bloqueada por isso. Não é dívida técnica; é a fundação do produto.
- **Onde:** `package.json` de `@kiskadee/react-components`, `@kiskadee/react-headless`,
  `@kiskadee/runtime`, `@kiskadee/core`; novo `.github/workflows/`; novo `INSTALL.md`/
  `GETTING-STARTED.md`; decidir empacotamento dos artefatos de build.
- **Como:** os `exports` maps de components/headless já estão corretos (dist + types + css);
  o que falta é orquestração. Ordem sugerida: CI rodando biome+test+build → changesets →
  publicar headless+components+runtime+core → empacotar artefatos por DS → guia de consumo.
  A dívida registrada em `docs/technical-debt/shared-react-package-build-scripts.md`
  (scripts de build duplicados entre headless e components) deve ser resolvida aqui, antes
  que a duplicação vire divergência publicada.
- **Critério de aceite:** `npm create vite` + `npm i @kiskadee/react-components` + seguir o
  guia = botão Material 3 renderizando, sem clonar o monorepo.

### A6 (P2) — Modularizar os hotspots do web-builder

- **O que:** quebrar `publishMetadata.ts` (fase 7, ~720 LOC) em módulos por artefato;
  extrair os special-cases da fase 5 (~523 LOC: bucket `w` das Tabs, larguras responsivas do
  TextField, thumb-shrink do Switch) para um registro declarativo de "extrações por componente";
  consolidar type guards repetidos (`isRecord`, `isElementMap`, ...) em util compartilhado;
  escrita atômica de artefatos (tmp dir + rename) para nunca deixar `build/` inconsistente.
- **Por quê:** o builder é o pacote mais saudável do repo, mas esses dois arquivos concentram
  o risco. Cada componente novo hoje adiciona if/else na fase 5 — com 20 componentes isso
  não escala. Um registro declarativo (`componentArtifactRules`) mantém a fase genérica.
- **Onde:** `packages/web-builder/src/phase-5-generate-class-names-map/`,
  `phase-7-publish-metadata/`, `phase-6-persist-build-artifacts/`.
- **Critério de aceite:** nenhum arquivo de fase >400 LOC; adicionar bucket novo de artefato
  não toca o core da fase 5; build interrompido no meio não corrompe `build/`.

### A7 (P2) — Cobertura de testes na camada visual

- **O que:** elevar testes de `packages/components/react` (hoje ~330 LOC de teste para ~6.400
  de src, ~5%) — prioridade: snapshot de resolução de classes por componente × intent ×
  ênfase × estado, e testes dos controllers de efeito (feedback radial, motion).
- **Por quê:** é a camada com mais lógica condicional e menos testes; é também a que a IA
  executora vai refatorar (A1–A3) — os testes precisam existir **antes** desses refactors
  para servirem de rede de proteção.
- **Critério de aceite:** A1–A3 executados com testes de equivalência passando antes/depois.

### A8 (P2) — Higiene de schema/core

- **O que:** resolver os TODOs abertos do core: duplicação de chave emitida em
  `material-3-google/components/button.schema.ts` ("key emitted twice"), decisões pendentes de
  `textAlign`/`textLineType` em `decorations.types.ts`, validação de effects das Tabs
  (`tabs.zod.shared.ts`), e remover/arquivar os ~80 LOC comentados do segmento `modern` em
  `material-3-kiskadee` (mover a intenção para `docs/proposals/`).
- **Por quê:** são pequenos, mas a chave duplicada pode indicar bug silencioso de geração, e
  código comentado em preset confunde qualquer autor (humano ou IA) que use o preset como
  referência de autoria.

---

## 5. Riscos arquiteturais de médio prazo (sem ação imediata, mas monitorar)

1. **A promessa multiplataforma ainda é uma hipótese.** Só existe o builder web. A taxonomia
   do schema *parece* platform-agnostic, mas isso só será provado quando um segundo builder
   (Flutter, React Native ou iOS) consumir o mesmo preset. Recomendação: antes de escalar para
   20 componentes web, fazer um **spike de 1 componente (Button) em 1 segunda plataforma** —
   é o teste mais barato da tese central e vai revelar o que no schema é "web vazado"
   (ex.: breakpoints em px, pseudo-estados nomeados como CSS).
2. **Interop com o padrão W3C Design Tokens (DTCG).** O ecossistema (Tokens Studio, Style
   Dictionary, Figma Variables) converge para o formato DTCG. O schema do Kiskadee é mais
   expressivo (estados, ênfase, segmentos), mas precisará de um **importador DTCG → schema**
   para não exigir migração manual de quem já tem tokens. Tratar como feature de adoção,
   não como ameaça.
3. **Crescimento do JSON de class maps.** O modelo atual (JSON por componente × paleta) é
   saudável, mas o Material já gera ~350 KB brutos de JSON. Se o número de presets×componentes
   crescer 5×, avaliar formato mais denso (arrays posicionais) — só com medição, como o
   próprio repo já pratica em `SCHEMA-BUILD-RUNTIME-RULES.md` §5.0.

---

## 6. Ordem de execução sugerida para a IA executora

1. **A7** (testes de equivalência de resolução de classes) — rede de proteção primeiro.
2. **A1** (Framer Motion) e **A2** (Switch geometry) — os dois "exageros de runtime" reais.
3. **A3** (resolver genérico) — reduz custo marginal antes de criar componentes novos.
4. **A5** (distribuição) — pode andar em paralelo com 2–3; é pré-requisito do negócio.
5. **A4** (authoring layer) — maior esforço, maior retorno estratégico.
6. **A6, A8** — contínuos, em PRs pequenos.

Regras para todos os PRs: preservar os invariantes da seção 2; saída de artefatos deve ser
comparada byte a byte quando o refactor não muda semântica; cada decisão estrutural nova vira
registro em `SCHEMA-BUILD-RUNTIME-RULES.md` no formato contexto/decisão/razão/consequência.

---

## 7. Conclusão

O Kiskadee tem um problema raro: a engenharia está **à frente** do produto. O núcleo difícil
(normalizar design systems em dados, compilar para CSS mínimo, compor em runtime sem inventar
design) está resolvido com qualidade acima da média — incluindo coisas que bibliotecas grandes
não têm, como compensação de box model cross-platform e estados projetados para preview.

O que falta não é reescrever: é (1) cortar os dois exageros de runtime pontuais, (2) baratear
violentamente a autoria de presets — porque é aí que a tese de IA se conecta — e (3) tornar o
projeto instalável pelo mundo exterior. Nessa ordem de esforço, o projeto sai de "framework
interno impressionante" para "produto adotável".
