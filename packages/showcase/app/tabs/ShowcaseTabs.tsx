'use client';

import { KTabs } from '@kiskadee/react-components';

const loremByValue: Record<string, string> = {
  home: `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer posuere erat a ante venenatis dapibus posuere velit aliquet. Donec sed odio dui. Cras mattis consectetur purus sit amet fermentum. Maecenas faucibus mollis interdum. Vestibulum id ligula porta felis euismod semper.`,
  locations: `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean lacinia bibendum nulla sed consectetur. Curabitur blandit tempus porttitor. Praesent commodo cursus magna, vel scelerisque nisl consectetur et. Nulla vitae elit libero, a pharetra augue. Integer posuere erat a ante venenatis dapibus posuere velit aliquet.`,
  forms: `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed posuere consectetur est at lobortis. Nullam id dolor id nibh ultricies vehicula ut id elit. Etiam porta sem malesuada magna mollis euismod. Donec ullamcorper nulla non metus auctor fringilla. Morbi leo risus, porta ac consectetur ac, vestibulum at eros.`,
  services: `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus sagittis lacus vel augue laoreet rutrum faucibus dolor auctor. Integer posuere erat a ante venenatis dapibus posuere velit aliquet. Duis mollis, est non commodo luctus, nisi erat porttitor ligula, eget lacinia odio sem nec elit. Donec ullamcorper nulla non metus auctor fringilla.`,
  'single-letter': `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer posuere erat a ante venenatis dapibus posuere velit aliquet. Donec sed odio dui. Cras mattis consectetur purus sit amet fermentum. Maecenas faucibus mollis interdum. Vestibulum id ligula porta felis euismod semper.`,
  'fifteen-letters': `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean lacinia bibendum nulla sed consectetur. Curabitur blandit tempus porttitor. Praesent commodo cursus magna, vel scelerisque nisl consectetur et. Nulla vitae elit libero, a pharetra augue. Integer posuere erat a ante venenatis dapibus posuere velit aliquet.`
};

const tabItems = [
  { value: 'home', label: 'Home' },
  { value: 'locations', label: 'Locations' },
  { value: 'forms', label: 'Forms' },
  { value: 'services', label: 'Services' },
  { value: 'single-letter', label: 'A' },
  { value: 'fifteen-letters', label: 'ABCDEFGHIJKLMNO' }
] as const;

function TabsExample({
  title,
  indicatorShape
}: {
  title: string;
  indicatorShape?: 'square' | 'rounded' | 'roundedClip';
}) {
  return (
    <div>
      <h3>{title}</h3>
      <KTabs.Root
        defaultValue="locations"
        indicatorPosition="bottom"
        indicatorShape={indicatorShape}
        activationMode="manual"
      >
        <KTabs.Bar>
          {tabItems.map((tab) => (
            <KTabs.Tab key={tab.value} value={tab.value} label={tab.label} />
          ))}
          <KTabs.Indicator />
        </KTabs.Bar>

        {tabItems.map((tab) => (
          <KTabs.Content key={tab.value} value={tab.value}>
            {loremByValue[tab.value]}
          </KTabs.Content>
        ))}
      </KTabs.Root>
    </div>
  );
}

export default function ShowcaseTabs() {
  return (
    <section style={{ marginTop: 106 }}>
      <h2>Tabs</h2>

      <TabsExample title="Indicator: square (default)" />
      <TabsExample title="Indicator: rounded" indicatorShape="rounded" />
      <TabsExample title="Indicator: rounded clip" indicatorShape="roundedClip" />
    </section>
  );
}
