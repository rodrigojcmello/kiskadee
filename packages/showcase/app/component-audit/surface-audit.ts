import type { ComponentName } from '@kiskadee/core';

export const surfaceStatuses = {
  derived: { label: 'Derived', symbol: '✓' },
  delegated: { label: 'Delegated', symbol: '↳' },
  inherited: { label: 'Inherited', symbol: '↳' },
  partial: { label: 'Partial', symbol: '◐' },
  unreviewed: { label: 'Awaiting review', symbol: '?' }
} as const;

type SurfaceAuditRow = {
  label: string;
  status: keyof typeof surfaceStatuses;
  summary: string;
  details?: string[];
};

// All supported preset branches are audited in docs/reviews/surface-context-coverage.md.
const components: Record<ComponentName, SurfaceAuditRow> = {
  accordion: {
    label: 'Accordion',
    status: 'delegated',
    summary: 'Card, CardAction and Container publish the frame, header and panel surfaces.',
    details: [
      'In Fluent Light the divider follows the Card frame. A subtle frame uses Low on either page background.'
    ]
  },
  badge: {
    label: 'Badge',
    status: 'derived',
    summary: 'A contained Mark supplies the surface behind its icon.',
    details: ['Full-bleed artwork, text badges and dots retain their existing host context.']
  },
  bottomSheet: {
    label: 'BottomSheet',
    status: 'derived',
    summary: 'The dialog and each painted option row supply a surface.',
    details: [
      'The portal establishes the initial subtle context. The scrim sits outside the dialog.'
    ]
  },
  button: {
    label: 'Button',
    status: 'derived',
    summary:
      'Button fills determine the content surface in all active presets, including Fluent 2 Microsoft.',
    details: [
      'Inline badges receive the button surface; external badges receive the surrounding surface.',
      'Fluent 2 Kiskadee is a legacy preset kept for its gradient button example. Its 14 unresolved recipes are excluded from the active status.'
    ]
  },
  card: {
    label: 'Card',
    status: 'derived',
    summary: 'Rest comes from Container. CardAction classifies its own interaction fills.'
  },
  chip: {
    label: 'Chip',
    status: 'derived',
    summary: 'Content and Select share a surface. Remove owns a separate surface.',
    details: [
      'In Fluent Light the selected Primary Medium chip supplies onSubtle over white and blue cards. A transparent Lowest chip at rest inherits the card surface.'
    ]
  },
  container: {
    label: 'Container',
    status: 'derived',
    summary: 'The Rest fill determines the surface received by children.'
  },
  dropdown: {
    label: 'Dropdown',
    status: 'derived',
    summary: 'Each option receives the panel surface and can publish its own fill.',
    details: [
      'An unpainted inline panel inherits its surroundings. Portaled Dropdown.Content establishes an independent overlay boundary.'
    ]
  },
  icon: { label: 'Icon', status: 'inherited', summary: 'The glyph uses the surrounding surface.' },
  layout: {
    label: 'Layout',
    status: 'inherited',
    summary: 'Children inherit the surrounding surface.'
  },
  progress: {
    label: 'Progress',
    status: 'inherited',
    summary: 'The track and indicator have no independent content slots.'
  },
  select: {
    label: 'Select',
    status: 'derived',
    summary:
      'The closed value follows the control and trigger. The open list delegates to Dropdown.'
  },
  separator: {
    label: 'Separator',
    status: 'inherited',
    summary: 'The decorative line consumes the surrounding surface.'
  },
  slider: {
    label: 'Slider',
    status: 'derived',
    summary: 'The thumb icon and value tooltip use their respective fills.',
    details: ['External labels and value summaries stay on the host surface.']
  },
  switch: {
    label: 'Switch',
    status: 'derived',
    summary:
      'Thumb icons follow the thumb fill over the track. The external label stays on the host surface.'
  },
  tabs: {
    label: 'Tabs',
    status: 'derived',
    summary: 'The selected tab and its bar each publish a surface.',
    details: [
      'Box and Segmented account for the indicator behind the selected tab. Bridge uses its selected shell. Line and Dot indicators cover only part of a tab. The content panel inherits the surrounding surface.'
    ]
  },
  text: {
    label: 'Text',
    status: 'inherited',
    summary: 'Inline content shares the surrounding surface.'
  },
  textField: {
    label: 'TextField',
    status: 'derived',
    summary: 'The control, Start and End each supply the surface behind their content.',
    details: [
      'The shell uses its effective paint recipe. A translucent region uses the local shell background. A connected sibling action stays on the surrounding surface.'
    ]
  }
};

export const componentRows = Object.values(components).sort((a, b) =>
  a.label.localeCompare(b.label, 'en')
);
