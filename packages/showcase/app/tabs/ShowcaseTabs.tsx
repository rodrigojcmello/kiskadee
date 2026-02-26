'use client';

import { KTabs } from '@kiskadee/react-components';

export default function ShowcaseTabs() {
  return (
    <section style={{ marginTop: 106 }}>
      <h2>Tabs</h2>

      <div>
        <KTabs.Root defaultValue="locations" indicatorPosition="bottom" activationMode={'manual'}>
          <KTabs.Bar>
            <KTabs.Tab value="home" label="Home" />
            <KTabs.Tab value="locations" label="Locations" />
            <KTabs.Tab value="forms" label="Forms" />
            <KTabs.Tab value="services" label="Services" />
            <KTabs.Tab value="single-letter" label="A" />
            <KTabs.Tab value="fifteen-letters" label="ABCDEFGHIJKLMNO" />
            <KTabs.Indicator />
          </KTabs.Bar>

          <KTabs.Content value="home">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer posuere erat a ante
            venenatis dapibus posuere velit aliquet. Donec sed odio dui. Cras mattis consectetur
            purus sit amet fermentum. Maecenas faucibus mollis interdum. Vestibulum id ligula porta
            felis euismod semper.
          </KTabs.Content>

          <KTabs.Content value="locations">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean lacinia bibendum nulla
            sed consectetur. Curabitur blandit tempus porttitor. Praesent commodo cursus magna, vel
            scelerisque nisl consectetur et. Nulla vitae elit libero, a pharetra augue. Integer
            posuere erat a ante venenatis dapibus posuere velit aliquet.
          </KTabs.Content>

          <KTabs.Content value="forms">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed posuere consectetur est at
            lobortis. Nullam id dolor id nibh ultricies vehicula ut id elit. Etiam porta sem
            malesuada magna mollis euismod. Donec ullamcorper nulla non metus auctor fringilla.
            Morbi leo risus, porta ac consectetur ac, vestibulum at eros.
          </KTabs.Content>

          <KTabs.Content value="services">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus sagittis lacus vel
            augue laoreet rutrum faucibus dolor auctor. Integer posuere erat a ante venenatis
            dapibus posuere velit aliquet. Duis mollis, est non commodo luctus, nisi erat porttitor
            ligula, eget lacinia odio sem nec elit. Donec ullamcorper nulla non metus auctor
            fringilla.
          </KTabs.Content>

          <KTabs.Content value="single-letter">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer posuere erat a ante
            venenatis dapibus posuere velit aliquet. Donec sed odio dui. Cras mattis consectetur
            purus sit amet fermentum. Maecenas faucibus mollis interdum. Vestibulum id ligula porta
            felis euismod semper.
          </KTabs.Content>

          <KTabs.Content value="fifteen-letters">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean lacinia bibendum nulla
            sed consectetur. Curabitur blandit tempus porttitor. Praesent commodo cursus magna, vel
            scelerisque nisl consectetur et. Nulla vitae elit libero, a pharetra augue. Integer
            posuere erat a ante venenatis dapibus posuere velit aliquet.
          </KTabs.Content>
        </KTabs.Root>
      </div>
    </section>
  );
}
