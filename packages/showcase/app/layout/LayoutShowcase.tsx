'use client';

import type { CardSurfaceIntent, ComponentEmphasis, ComponentSize } from '@kiskadee/core';
import { Card, type CardProps } from '@kiskadee/react-components/card';
import { Container, type ContainerProps } from '@kiskadee/react-components/container';
import { Layout, type LayoutProps } from '@kiskadee/react-components/layout';
import {
  resolveContentSurfaceContext,
  useComponentMetadata,
  useKiskadee
} from '@kiskadee/react-components/resources';
import { Separator, type SeparatorProps } from '@kiskadee/react-components/separator';
import { Text } from '@kiskadee/react-components/text';
import { type ReactNode, useState } from 'react';
import { ShowcaseGlobalSemanticControls } from '@/components/DesignSystemControls/ShowcaseGlobalControls';
import { ShowcaseExampleCard } from '@/components/ShowcaseBackground/ShowcaseExampleCard';
import {
  ShowcaseBooleanControl,
  ShowcaseControlGroup,
  ShowcaseRouteControls,
  ShowcaseSelectControl
} from '@/components/ShowcaseControls';
import { useShowcaseBackground } from '@/hooks/use-showcase-background';
import { useShowcaseMetadata } from '@/hooks/use-showcase-metadata';
import {
  getManifestComponentState,
  supportsManifestSurfaceContext
} from '@/utils/manifest-surface-context';
import { useShowcaseTextProfiles } from '@/utils/showcase-text-profiles';
import styles from './Layout.module.scss';

const spacingSteps = [
  { size: 'sm5', pixels: 2 },
  { size: 'sm4', pixels: 4 },
  { size: 'sm3', pixels: 6 },
  { size: 'sm2', pixels: 8 },
  { size: 'sm', pixels: 12 },
  { size: 'md', pixels: 16 },
  { size: 'lg', pixels: 24 },
  { size: 'lg2', pixels: 32 },
  { size: 'lg3', pixels: 40 },
  { size: 'lg4', pixels: 48 },
  { size: 'lg5', pixels: 64 }
] as const satisfies readonly { size: ComponentSize; pixels: number }[];

const spacingOptions = [
  { value: 'none', label: 'None' },
  ...spacingSteps.map(({ size, pixels }) => ({ value: size, label: `${size} · ${pixels} px` }))
];
const columnOptions = Array.from({ length: 12 }, (_, index) => ({
  value: String(index + 1),
  label: String(index + 1)
}));
const responsiveColumns = { 'bp:all': 1, 'bp:md:2': 2, 'bp:lg:1': 3 } as const;
const playgroundLabels = ['Alpha', 'Bravo', 'Charlie', 'Delta'] as const;
const responsiveLabels = ['01', '02', '03', '04', '05', '06'] as const;

type SpacingChoice = ComponentSize | 'none';
type SpacingMode = 'all' | 'axes' | 'sides';
type SpacingState = {
  mode: SpacingMode;
  all: SpacingChoice;
  block: SpacingChoice;
  inline: SpacingChoice;
  blockStart: SpacingChoice;
  blockEnd: SpacingChoice;
  inlineStart: SpacingChoice;
  inlineEnd: SpacingChoice;
};

const initialPadding: SpacingState = {
  mode: 'all',
  all: 'md',
  block: 'sm',
  inline: 'lg',
  blockStart: 'sm5',
  blockEnd: 'lg',
  inlineStart: 'md',
  inlineEnd: 'lg2'
};
const initialMargin: SpacingState = { ...initialPadding, all: 'none' };
const spacingModeOptions = [
  { value: 'all', label: 'All sides' },
  { value: 'axes', label: 'Block / inline' },
  { value: 'sides', label: 'Individual sides' }
];
const displayOptions = [
  { value: 'block', label: 'Block' },
  { value: 'flex', label: 'Flex' },
  { value: 'grid', label: 'Grid' }
];
const directionOptions = [
  { value: 'row', label: 'Row' },
  { value: 'row-reverse', label: 'Row reverse' },
  { value: 'column', label: 'Column' },
  { value: 'column-reverse', label: 'Column reverse' }
];
const alignOptions = ['start', 'center', 'end', 'stretch', 'baseline'].map((value) => ({
  value,
  label: value.charAt(0).toUpperCase() + value.slice(1)
}));
const justifyOptions = ['start', 'center', 'end', 'between', 'around', 'evenly'].map((value) => ({
  value,
  label: value.charAt(0).toUpperCase() + value.slice(1)
}));

function spacingValue(value: SpacingChoice): ComponentSize | false {
  return value === 'none' ? false : value;
}

function resolveSpacing(state: SpacingState): LayoutProps['padding'] {
  if (state.mode === 'all') return spacingValue(state.all);
  if (state.mode === 'axes') {
    return { block: spacingValue(state.block), inline: spacingValue(state.inline) };
  }
  return {
    blockStart: spacingValue(state.blockStart),
    blockEnd: spacingValue(state.blockEnd),
    inlineStart: spacingValue(state.inlineStart),
    inlineEnd: spacingValue(state.inlineEnd)
  };
}

function formatConfiguration(configuration: Record<string, unknown>): string {
  return Object.entries(configuration)
    .map(([key, value]) => `${key}: ${JSON.stringify(value)}`)
    .join('\n');
}

function SpacingControls({
  title,
  state,
  onChange
}: {
  title: string;
  state: SpacingState;
  onChange: (state: SpacingState) => void;
}) {
  const fields =
    state.mode === 'all'
      ? ([['all', 'Size']] as const)
      : state.mode === 'axes'
        ? ([
            ['block', 'Block'],
            ['inline', 'Inline']
          ] as const)
        : ([
            ['blockStart', 'Block start'],
            ['blockEnd', 'Block end'],
            ['inlineStart', 'Inline start'],
            ['inlineEnd', 'Inline end']
          ] as const);

  return (
    <ShowcaseControlGroup title={title}>
      <ShowcaseSelectControl
        label="Apply to"
        value={state.mode}
        options={spacingModeOptions}
        onValueChange={(value) => onChange({ ...state, mode: value as SpacingMode })}
      />
      {fields.map(([field, label]) => (
        <ShowcaseSelectControl
          key={field}
          label={label}
          value={state[field]}
          options={spacingOptions}
          onValueChange={(value) => onChange({ ...state, [field]: value as SpacingChoice })}
        />
      ))}
    </ShowcaseControlGroup>
  );
}

function ExampleSlot({
  surface,
  label,
  compact = false
}: {
  surface: CardProps;
  label: string;
  compact?: boolean;
}) {
  const textProfiles = useShowcaseTextProfiles();

  return (
    <Card
      {...surface}
      border
      clipContent
      shadow={false}
      className={compact ? `${styles.slot} ${styles.compactSlot}` : styles.slot}
    >
      <Layout padding={compact ? false : { block: 'sm', inline: 'md' }}>
        <Text
          as="span"
          profile={compact ? textProfiles.caption : textProfiles.bodyStrong}
          className={styles.slotText}
        >
          {label}
        </Text>
      </Layout>
    </Card>
  );
}

function ExampleFrame({
  children,
  configuration,
  codeSurface,
  divider
}: {
  children: ReactNode;
  configuration: Record<string, unknown>;
  codeSurface?: ContainerProps;
  divider?: SeparatorProps;
}) {
  const textProfiles = useShowcaseTextProfiles();
  const snippet = (
    <Layout padding="md">
      <Text as="pre" profile={textProfiles.body} className={styles.code}>
        <code className="k-font-code">{formatConfiguration(configuration)}</code>
      </Text>
    </Layout>
  );

  return (
    <ShowcaseExampleCard padding={false} border clipContent shadow={false} className={styles.stage}>
      {children}
      {divider ? <Separator {...divider} /> : null}
      {codeSurface ? (
        <Container {...codeSurface} data-layout-code className={styles.codePanel}>
          {snippet}
        </Container>
      ) : (
        snippet
      )}
    </ShowcaseExampleCard>
  );
}

function SpacingComparison({ surface }: { surface: CardProps }) {
  const textProfiles = useShowcaseTextProfiles();

  return (
    <div className={styles.comparisonWindow}>
      <table className={styles.comparisonTable} aria-label="Layout spacing sizes">
        <colgroup>
          <col className={styles.sizeColumn} />
          <col />
          <col />
          <col />
        </colgroup>
        <thead>
          <tr>
            {['Size', 'Padding', 'Margin', 'Gap'].map((label) => (
              <th key={label} scope="col">
                <Layout margin={{ blockEnd: 'sm2' }}>
                  <Text as="span" profile={textProfiles.bodyStrong}>
                    {label}
                  </Text>
                </Layout>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {spacingSteps.map(({ size, pixels }) => (
            <tr key={size} data-size={size}>
              <th scope="row">
                <Text as="span" profile={textProfiles.caption} className={styles.measure}>
                  {size} · {pixels} px
                </Text>
              </th>
              <td>
                <Layout margin={{ block: 'sm2', inlineEnd: 'md' }}>
                  <ShowcaseExampleCard
                    border
                    padding={false}
                    clipContent
                    shadow={false}
                    className={styles.comparisonStage}
                  >
                    <Layout data-layout-scenario={`padding-${size}`} padding={size} display="flex">
                      <ExampleSlot surface={surface} label="A" compact />
                    </Layout>
                  </ShowcaseExampleCard>
                </Layout>
              </td>
              <td>
                <Layout margin={{ block: 'sm2', inlineEnd: 'md' }}>
                  <ShowcaseExampleCard
                    border
                    padding={false}
                    clipContent
                    shadow={false}
                    className={styles.comparisonStage}
                  >
                    <Layout data-layout-scenario={`margin-${size}`} margin={size} display="flex">
                      <ExampleSlot surface={surface} label="A" compact />
                    </Layout>
                  </ShowcaseExampleCard>
                </Layout>
              </td>
              <td>
                <Layout margin={{ block: 'sm2' }}>
                  <ShowcaseExampleCard
                    border
                    padding={false}
                    clipContent
                    shadow={false}
                    className={styles.comparisonStage}
                  >
                    <Layout
                      data-layout-scenario={`gap-${size}`}
                      padding={size}
                      gap={size}
                      display="flex"
                    >
                      <ExampleSlot surface={surface} label="A" compact />
                      <ExampleSlot surface={surface} label="B" compact />
                    </Layout>
                  </ShowcaseExampleCard>
                </Layout>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function LayoutShowcase() {
  const { manifest } = useShowcaseMetadata(['layout', 'card', 'container', 'separator', 'text']);
  const cardMetadata = useComponentMetadata('card');
  const containerMetadata = useComponentMetadata('container');
  const { segment, theme } = useKiskadee();
  const background = useShowcaseBackground();
  const textProfiles = useShowcaseTextProfiles();
  const [padding, setPadding] = useState<SpacingState>(initialPadding);
  const [margin, setMargin] = useState<SpacingState>(initialMargin);
  const [rowGap, setRowGap] = useState<SpacingChoice>('sm');
  const [columnGap, setColumnGap] = useState<SpacingChoice>('sm');
  const [display, setDisplay] = useState<NonNullable<LayoutProps['display']>>('flex');
  const [direction, setDirection] = useState<NonNullable<LayoutProps['direction']>>('row');
  const [wrap, setWrap] = useState(true);
  const [align, setAlign] = useState<NonNullable<LayoutProps['align']>>('start');
  const [justify, setJustify] = useState<NonNullable<LayoutProps['justify']>>('start');
  const [columns, setColumns] = useState(3);
  const [useResponsiveColumns, setUseResponsiveColumns] = useState(false);
  const activeSegment = String(segment ?? 'default');
  const surfaceContext = supportsManifestSurfaceContext(
    manifest?.components?.card,
    activeSegment,
    theme,
    background.surfaceContext
  )
    ? background.surfaceContext
    : 'onSubtle';
  const [stageIntent, stageEmphasis] = (background.cardSurface?.key ?? '').split('.') as [
    CardSurfaceIntent | undefined,
    ComponentEmphasis | undefined
  ];
  const stageOutput =
    stageIntent && stageEmphasis
      ? resolveContentSurfaceContext({
          map: cardMetadata?.contentSurfaceContext,
          segment: activeSegment,
          theme,
          consumedSurfaceContext: surfaceContext,
          intent: stageIntent,
          emphasis: stageEmphasis
        })
      : surfaceContext;
  const nestedState = getManifestComponentState(
    manifest?.components?.card,
    activeSegment,
    theme,
    stageOutput
  );
  const slotEmphasis = (['medium', 'lowest', 'low', 'high', 'highest'] as const).find(
    (emphasis) =>
      nestedState?.neutral?.[emphasis]?.rest &&
      (stageIntent !== 'neutral' || emphasis !== stageEmphasis)
  );
  const slotIntent: CardSurfaceIntent = slotEmphasis ? 'neutral' : 'primary';
  const fallbackEmphasis = (['medium', 'high', 'low', 'highest', 'lowest'] as const).find(
    (emphasis) => nestedState?.primary?.[emphasis]?.rest
  );
  const resolvedSlotEmphasis: ComponentEmphasis | undefined = slotEmphasis ?? fallbackEmphasis;
  const available = Boolean(
    manifest?.components?.layout &&
      manifest?.components?.card &&
      background.cardSurface &&
      stageEmphasis &&
      resolvedSlotEmphasis
  );
  const slotSurface: CardProps = {
    intent: slotIntent,
    emphasis: resolvedSlotEmphasis,
    surfaceContext: stageOutput
  };
  const codeIntent = stageIntent?.startsWith('primary')
    ? 'primaryComplementary'
    : 'neutralComplementary';
  const codeState = getManifestComponentState(
    manifest?.components?.container,
    activeSegment,
    theme,
    stageOutput
  );
  const codeEmphases = [stageEmphasis, 'medium', 'low', 'lowest', 'high', 'highest'] as const;
  const codeCandidates = [
    ...codeEmphases.map((emphasis) => ({ intent: codeIntent, emphasis }) as const),
    ...(['neutral', 'primary'] as const).flatMap((intent) =>
      (['medium', 'lowest', 'low', 'high', 'highest'] as const)
        .filter((emphasis) => intent !== stageIntent || emphasis !== stageEmphasis)
        .map((emphasis) => ({ intent, emphasis }))
    )
  ];
  const codeSelection = codeCandidates.find(({ intent, emphasis }) => {
    if (!emphasis || !codeState?.[intent]?.[emphasis]?.rest) return false;
    const codeOutput = resolveContentSurfaceContext({
      map: containerMetadata?.contentSurfaceContext,
      segment: activeSegment,
      theme,
      consumedSurfaceContext: stageOutput,
      intent,
      emphasis
    });
    return supportsManifestSurfaceContext(
      manifest?.components?.text,
      activeSegment,
      theme,
      codeOutput
    );
  });
  const codeSurface: ContainerProps | undefined = codeSelection
    ? { ...codeSelection, surfaceContext: stageOutput }
    : undefined;
  const separatorState = getManifestComponentState(
    manifest?.components?.separator,
    activeSegment,
    theme,
    stageOutput
  );
  const separatorIntent =
    stageIntent?.startsWith('primary') && separatorState?.primary?.medium?.rest
      ? 'primary'
      : 'neutral';
  const separatorEmphases: readonly ComponentEmphasis[] =
    separatorIntent === 'primary' && stageEmphasis === 'highest'
      ? ['medium', 'low', 'lowest', 'high', 'highest']
      : ['low', 'medium', 'lowest', 'high', 'highest'];
  const separatorEmphasis = separatorEmphases.find(
    (emphasis) => separatorState?.[separatorIntent]?.[emphasis]?.rest
  );
  const divider: SeparatorProps | undefined = separatorEmphasis
    ? { intent: separatorIntent, emphasis: separatorEmphasis, surfaceContext: stageOutput }
    : undefined;
  const playgroundPadding = resolveSpacing(padding);
  const playgroundMargin = resolveSpacing(margin);
  const playgroundGap = { row: spacingValue(rowGap), column: spacingValue(columnGap) };
  const playgroundColumns = useResponsiveColumns
    ? responsiveColumns
    : (columns as NonNullable<LayoutProps['columns']>);

  return (
    <main className={styles.page}>
      <ShowcaseRouteControls
        id="layout"
        eyebrow="Layout"
        title="Playground"
        isAvailable={available}
        showGlobalControls={false}
      >
        <ShowcaseControlGroup title="Semantic">
          <ShowcaseGlobalSemanticControls />
        </ShowcaseControlGroup>
        <ShowcaseControlGroup title="Flow">
          <ShowcaseSelectControl
            label="Display"
            value={display}
            options={displayOptions}
            onValueChange={(value) => setDisplay(value as NonNullable<LayoutProps['display']>)}
          />
          {display === 'flex' ? (
            <>
              <ShowcaseSelectControl
                label="Direction"
                value={direction}
                options={directionOptions}
                onValueChange={(value) =>
                  setDirection(value as NonNullable<LayoutProps['direction']>)
                }
              />
              <ShowcaseBooleanControl checked={wrap} label="Wrap" onCheckedChange={setWrap} />
            </>
          ) : null}
          {display === 'grid' ? (
            <>
              <ShowcaseBooleanControl
                checked={useResponsiveColumns}
                label="Responsive columns"
                description="1 / 2 / 3 at all / md:2 / lg:1"
                onCheckedChange={setUseResponsiveColumns}
              />
              <ShowcaseSelectControl
                label="Columns"
                value={String(columns)}
                options={columnOptions}
                disabled={useResponsiveColumns}
                onValueChange={(value) => setColumns(Number(value))}
              />
            </>
          ) : null}
          <ShowcaseSelectControl
            label="Align items"
            value={align}
            options={alignOptions}
            disabled={display === 'block'}
            onValueChange={(value) => setAlign(value as NonNullable<LayoutProps['align']>)}
          />
          <ShowcaseSelectControl
            label="Justify content"
            value={justify}
            options={justifyOptions}
            disabled={display === 'block'}
            onValueChange={(value) => setJustify(value as NonNullable<LayoutProps['justify']>)}
          />
        </ShowcaseControlGroup>
        <SpacingControls title="Padding" state={padding} onChange={setPadding} />
        <SpacingControls title="Margin" state={margin} onChange={setMargin} />
        <ShowcaseControlGroup title="Gap">
          <ShowcaseSelectControl
            label="Row"
            value={rowGap}
            options={spacingOptions}
            disabled={display === 'block'}
            onValueChange={(value) => setRowGap(value as SpacingChoice)}
          />
          <ShowcaseSelectControl
            label="Column"
            value={columnGap}
            options={spacingOptions}
            disabled={display === 'block'}
            onValueChange={(value) => setColumnGap(value as SpacingChoice)}
          />
        </ShowcaseControlGroup>
      </ShowcaseRouteControls>

      <Layout display="flex" direction="column" gap="lg2">
        <Layout display="flex" direction="column" gap="sm2">
          <Text as="h2" profile={textProfiles.pageTitle}>
            Layout
          </Text>
          <Text as="p" profile={textProfiles.body}>
            Compose spacing and flow independently. Padding stays inside the frame, margin sits
            outside it, and gap separates its children. Cards define the boundaries of each example.
          </Text>
        </Layout>

        {!available ? (
          <Text as="p" profile={textProfiles.body}>
            Layout examples are unavailable for the active preset, theme and surface.
          </Text>
        ) : (
          <>
            <section className={styles.section} aria-labelledby="layout-playground-title">
              <Layout display="flex" direction="column" gap="sm">
                <Text as="h3" id="layout-playground-title" profile={textProfiles.sectionTitle}>
                  Playground
                </Text>
                <Text as="p" profile={textProfiles.body}>
                  Use the side panel to change each spacing axis, switch flow, and arrange the same
                  four slots. Explicit sizes stay the same when toolbar density changes.
                </Text>
                <ExampleFrame
                  codeSurface={codeSurface}
                  divider={divider}
                  configuration={{
                    display,
                    padding: playgroundPadding,
                    margin: playgroundMargin,
                    gap: playgroundGap,
                    ...(display === 'flex' ? { direction, wrap } : {}),
                    ...(display === 'grid' ? { columns: playgroundColumns } : {}),
                    align,
                    justify
                  }}
                >
                  <div className={styles.playgroundWindow}>
                    <Layout
                      data-layout-scenario="playground"
                      padding={playgroundPadding}
                      margin={playgroundMargin}
                      gap={playgroundGap}
                      display={display}
                      direction={direction}
                      wrap={wrap}
                      align={align}
                      justify={justify}
                      columns={playgroundColumns}
                      classNames={{ e2: styles.playgroundFlow }}
                    >
                      {playgroundLabels.map((label) => (
                        <ExampleSlot key={label} surface={slotSurface} label={label} />
                      ))}
                    </Layout>
                  </div>
                </ExampleFrame>
              </Layout>
            </section>

            <section className={styles.section} aria-labelledby="layout-scale-title">
              <Layout display="flex" direction="column" gap="sm">
                <Text as="h3" id="layout-scale-title" profile={textProfiles.sectionTitle}>
                  Spacing scale
                </Text>
                <Text as="p" profile={textProfiles.body}>
                  Compare the same spacing around each item and between items. Gap examples also use
                  matching padding around the pair.
                </Text>
                <SpacingComparison surface={slotSurface} />
              </Layout>
            </section>

            <section className={styles.section} aria-labelledby="layout-edges-title">
              <Layout display="flex" direction="column" gap="sm">
                <Text as="h3" id="layout-edges-title" profile={textProfiles.sectionTitle}>
                  Axes and individual sides
                </Text>
                <Text as="p" profile={textProfiles.body}>
                  Block and inline select an axis. Individual logical sides can override it, and
                  false removes that side's space.
                </Text>
                <Layout display="grid" columns={{ 'bp:all': 1, 'bp:lg:1': 2 }} gap="md">
                  <Layout display="flex" direction="column" gap="sm2">
                    <Text as="h4" profile={textProfiles.subsectionTitle}>
                      Block / inline
                    </Text>
                    <ExampleFrame
                      codeSurface={codeSurface}
                      divider={divider}
                      configuration={{ padding: { block: 'sm', inline: 'lg' } }}
                    >
                      <Layout
                        data-layout-scenario="padding-axes"
                        padding={{ block: 'sm', inline: 'lg' }}
                        display="flex"
                      >
                        <ExampleSlot surface={slotSurface} label="Content" />
                      </Layout>
                    </ExampleFrame>
                  </Layout>
                  <Layout display="flex" direction="column" gap="sm2">
                    <Text as="h4" profile={textProfiles.subsectionTitle}>
                      Side overrides
                    </Text>
                    <ExampleFrame
                      codeSurface={codeSurface}
                      divider={divider}
                      configuration={{
                        padding: { block: 'sm', inline: 'lg', blockStart: 'sm5', inlineEnd: false }
                      }}
                    >
                      <Layout
                        data-layout-scenario="padding-sides"
                        padding={{
                          block: 'sm',
                          inline: 'lg',
                          blockStart: 'sm5',
                          inlineEnd: false
                        }}
                        display="flex"
                      >
                        <ExampleSlot surface={slotSurface} label="Content" />
                      </Layout>
                    </ExampleFrame>
                  </Layout>
                </Layout>
              </Layout>
            </section>

            <section className={styles.section} aria-labelledby="layout-responsive-title">
              <Layout display="flex" direction="column" gap="sm">
                <Text as="h3" id="layout-responsive-title" profile={textProfiles.sectionTitle}>
                  Responsive grid
                </Text>
                <Text as="p" profile={textProfiles.body}>
                  Resize the viewport to move from one to two to three equal columns. Breakpoint
                  thresholds come from the active preset; spacing remains explicit.
                </Text>
                <ExampleFrame
                  codeSurface={codeSurface}
                  divider={divider}
                  configuration={{
                    display: 'grid',
                    columns: responsiveColumns,
                    padding: 'md',
                    gap: { row: 'sm', column: 'md' }
                  }}
                >
                  <Layout
                    data-layout-scenario="responsive-grid"
                    display="grid"
                    columns={responsiveColumns}
                    padding="md"
                    gap={{ row: 'sm', column: 'md' }}
                  >
                    {responsiveLabels.map((label) => (
                      <ExampleSlot key={label} surface={slotSurface} label={label} />
                    ))}
                  </Layout>
                </ExampleFrame>
              </Layout>
            </section>

            <section className={styles.section} aria-labelledby="layout-default-title">
              <Layout display="flex" direction="column" gap="sm">
                <Text as="h3" id="layout-default-title" profile={textProfiles.sectionTitle}>
                  Spacing is opt-in
                </Text>
                <Text as="p" profile={textProfiles.body}>
                  Without spacing settings, the items touch each other and the frame. Adding padding
                  creates an inset; adding gap separates the items.
                </Text>
                <Layout display="grid" columns={{ 'bp:all': 1, 'bp:lg:1': 2 }} gap="md">
                  <Layout display="flex" direction="column" gap="sm2">
                    <Text as="h4" profile={textProfiles.subsectionTitle}>
                      No spacing
                    </Text>
                    <ExampleFrame
                      codeSurface={codeSurface}
                      divider={divider}
                      configuration={{ padding: false, margin: false, gap: false }}
                    >
                      <Layout data-layout-scenario="defaults">
                        <ExampleSlot surface={slotSurface} label="First" />
                        <ExampleSlot surface={slotSurface} label="Second" />
                      </Layout>
                    </ExampleFrame>
                  </Layout>
                  <Layout display="flex" direction="column" gap="sm2">
                    <Text as="h4" profile={textProfiles.subsectionTitle}>
                      Padding + gap
                    </Text>
                    <ExampleFrame
                      codeSurface={codeSurface}
                      divider={divider}
                      configuration={{
                        display: 'flex',
                        direction: 'column',
                        padding: 'md',
                        gap: 'md'
                      }}
                    >
                      <Layout
                        data-layout-scenario="explicit-spacing"
                        display="flex"
                        direction="column"
                        padding="md"
                        gap="md"
                      >
                        <ExampleSlot surface={slotSurface} label="First" />
                        <ExampleSlot surface={slotSurface} label="Second" />
                      </Layout>
                    </ExampleFrame>
                  </Layout>
                </Layout>
              </Layout>
            </section>
          </>
        )}
      </Layout>
    </main>
  );
}
