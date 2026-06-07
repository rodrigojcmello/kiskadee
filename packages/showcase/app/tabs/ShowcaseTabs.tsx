import { TabsShowcasePageShell } from './ShowcaseTabs.shared';

export default function ShowcaseTabs() {
  return (
    <TabsShowcasePageShell title="Tabs">
      <p style={{ marginTop: 0, maxWidth: 720 }}>
        Choose one variant from the menu above to inspect each implementation in its own route, with
        only the controls that are relevant for that variant.
      </p>
    </TabsShowcasePageShell>
  );
}
