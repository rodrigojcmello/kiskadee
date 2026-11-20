import type { ComponentName } from '@kiskadee/core';

export const surfaceStatuses = {
  fix: { label: 'Fix pending', symbol: '⚠' },
  decision: { label: 'Visual decision', symbol: '◇' },
  partial: { label: 'Partial', symbol: '◐' },
  verified: { label: 'Verified', symbol: '✓' },
  unreviewed: { label: 'Awaiting review', symbol: '?' }
} as const;

type SurfaceAuditRow = {
  label: string;
  status: keyof typeof surfaceStatuses;
  summary: string;
  details?: string[];
};

// Cross-preset findings from docs/reviews/surface-context-coverage.md.
// Update the affected rows when a fix or design decision is verified.
const components: Record<ComponentName, SurfaceAuditRow> = {
  accordion: {
    label: 'Accordion',
    status: 'fix',
    summary: 'The Fluent panel divider can retain the outer vivid context.',
    details: [
      'Open a Medium accordion on a vivid surface in Fluent Light. The frame produces a subtle surface, but the divider still uses the vivid recipe.',
      'The header and panel already delegate their surfaces to CardAction and Container.'
    ]
  },
  badge: {
    label: 'Badge',
    status: 'decision',
    summary: 'Check the icon inside a filled Badge.Mark.',
    details: [
      'In Carbon, Fluent Microsoft, iOS 27 and Material, a Neutral High mark in Light can place an independent icon on a dark fill while the icon inherits a subtle context.',
      'Text badges and dots already consume the surrounding surface. Full-bleed marks use the supplied artwork.'
    ]
  },
  bottomSheet: {
    label: 'BottomSheet',
    status: 'decision',
    summary: 'Panel verified. Review Carbon item highlights.',
    details: [
      'All 18 panel backgrounds checked resolve to onSubtle at rest.',
      'Decide whether a child in a Carbon item should switch palettes during hover or press.'
    ]
  },
  button: {
    label: 'Button',
    status: 'partial',
    summary: 'Verified in Fluent Microsoft. Other presets need review.',
    details: [
      'All 1,080 Fluent Microsoft cases matched. Inline badges receive the button surface; external badges receive the surrounding surface.',
      'Review Carbon selection and disabled states, iOS 27 fills and Material High in Dark. Some translucent fills need reference backgrounds. Fluent Kiskadee also uses gradients and dynamic colors.'
    ]
  },
  card: {
    label: 'Card',
    status: 'partial',
    summary: 'Fluent Microsoft is verified. Review CardAction states.',
    details: [
      'Card uses the Container surface at rest. The Fluent calculation also covers CardAction states.',
      'Compare disabled Carbon actions, iOS 27 Primary Highest in Dark and Darker, and the selected Elegant card.'
    ]
  },
  chip: {
    label: 'Chip',
    status: 'decision',
    summary: 'Compare the primary action and Remove separately.',
    details: [
      'In Fluent Light on vivid, a Primary Medium chip paints a pale blue fill while its inline badge still receives onVivid.',
      'Remove paints its own background. Check its icon in Fluent, Carbon and Material; translucent Material fills need reference backgrounds.'
    ]
  },
  container: {
    label: 'Container',
    status: 'partial',
    summary: 'Fluent Microsoft is verified. Review dark fills in Carbon and iOS 27.',
    details: [
      'Compare Carbon Neutral High in Dark and iOS 27 Primary Highest in Dark and Darker.',
      'Choose canonical backgrounds per preset and theme before migrating translucent recipes.'
    ]
  },
  dropdown: {
    label: 'Dropdown',
    status: 'decision',
    summary: 'Panel verified. Review Carbon item highlights.',
    details: [
      'All 20 panel backgrounds checked resolve to onSubtle at rest.',
      'A Carbon item can cross the vivid threshold during hover or press. Decide how a nested badge should render.'
    ]
  },
  icon: { label: 'Icon', status: 'verified', summary: 'The glyph uses the surrounding surface.' },
  layout: {
    label: 'Layout',
    status: 'verified',
    summary: 'Children inherit the surrounding surface.'
  },
  progress: {
    label: 'Progress',
    status: 'verified',
    summary: 'The track and indicator have no independent content slots.'
  },
  select: {
    label: 'Select',
    status: 'fix',
    summary: 'An option can inherit a vivid context on a white popup.',
    details: [
      'Fix the styled list first. It uses the Dropdown panel but bypasses the provider that supplies its subtle context.',
      'Review rich values in the closed Fluent control separately. Sandbox translucent triggers still need reference backgrounds.'
    ]
  },
  separator: {
    label: 'Separator',
    status: 'verified',
    summary: 'The line consumes the surrounding surface.'
  },
  slider: {
    label: 'Slider',
    status: 'decision',
    summary: 'Review the thumb icon and the value tooltip.',
    details: [
      'Identify the fill behind a custom thumb icon. In Fluent Light, a custom tooltip value can inherit onSubtle over a dark fill.',
      'The same value formatter can also render outside the tooltip on the surrounding surface.'
    ]
  },
  switch: {
    label: 'Switch',
    status: 'decision',
    summary: 'Review custom icons inside the Fluent thumb.',
    details: [
      'In Fluent Light the Neutral Medium thumb changes from dark at rest to white when selected. The outer label stays on the surrounding surface.'
    ]
  },
  tabs: {
    label: 'Tabs',
    status: 'decision',
    summary: 'Review the fill behind selected Material tabs.',
    details: [
      'Check Box, Segmented and Bridge separately. A Box indicator can fill the selected tab behind a custom badge. The content panel inherits its own surrounding surface.'
    ]
  },
  text: {
    label: 'Text',
    status: 'verified',
    summary: 'Inline content shares the surrounding surface.'
  },
  textField: {
    label: 'TextField',
    status: 'fix',
    summary: 'Fluent can paint Medium when High is requested and pass the wrong context.',
    details: [
      'Align the context fallback with the painted control. In Fluent Light on vivid, a Borderless High field paints a subtle fill but its Lowest end slot can still receive onVivid.',
      'The authored Fluent emphasis matched across all 300 control and 600 region cases. Some Material fills need reference backgrounds.'
    ]
  }
};

export const componentRows = Object.values(components).sort((a, b) =>
  a.label.localeCompare(b.label, 'en')
);
