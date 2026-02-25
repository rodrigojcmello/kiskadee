'use client';

import { SmoothText, Tabs, useShowcase } from '@kiskadee/react-components';

export default function TabsDemo() {
  const { fontName } = useShowcase();

  return (
    <section style={{ marginTop: 106 }}>
      <h2>Tabs</h2>

      <div>
        <Tabs.Root defaultValue="locations" indicatorPosition="bottom" activationMode={'manual'}>
          <Tabs.Bar>
            <Tabs.Tab
              value="home"
              label={
                <SmoothText fontName={fontName} align="left">
                  Home
                </SmoothText>
              }
            />
            <Tabs.Tab
              value="locations"
              label={
                <SmoothText fontName={fontName} align="left">
                  Locations
                </SmoothText>
              }
            />
            <Tabs.Tab
              value="forms"
              label={
                <SmoothText fontName={fontName} align="left">
                  Forms
                </SmoothText>
              }
            />
            <Tabs.Tab
              value="services"
              label={
                <SmoothText fontName={fontName} align="left">
                  Services
                </SmoothText>
              }
            />
            <Tabs.Tab
              value="single-letter"
              label={
                <SmoothText fontName={fontName} align="left">
                  A
                </SmoothText>
              }
            />
            <Tabs.Tab
              value="fifteen-letters"
              label={
                <SmoothText fontName={fontName} align="left">
                  ABCDEFGHIJKLMNO
                </SmoothText>
              }
            />
            <Tabs.Indicator />
          </Tabs.Bar>

          <Tabs.Content value="home">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer posuere erat a ante
            venenatis dapibus posuere velit aliquet. Donec sed odio dui. Cras mattis consectetur
            purus sit amet fermentum. Maecenas faucibus mollis interdum. Vestibulum id ligula porta
            felis euismod semper.
          </Tabs.Content>

          <Tabs.Content value="locations">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean lacinia bibendum nulla
            sed consectetur. Curabitur blandit tempus porttitor. Praesent commodo cursus magna, vel
            scelerisque nisl consectetur et. Nulla vitae elit libero, a pharetra augue. Integer
            posuere erat a ante venenatis dapibus posuere velit aliquet.
          </Tabs.Content>

          <Tabs.Content value="forms">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed posuere consectetur est at
            lobortis. Nullam id dolor id nibh ultricies vehicula ut id elit. Etiam porta sem
            malesuada magna mollis euismod. Donec ullamcorper nulla non metus auctor fringilla.
            Morbi leo risus, porta ac consectetur ac, vestibulum at eros.
          </Tabs.Content>

          <Tabs.Content value="services">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus sagittis lacus vel
            augue laoreet rutrum faucibus dolor auctor. Integer posuere erat a ante venenatis
            dapibus posuere velit aliquet. Duis mollis, est non commodo luctus, nisi erat porttitor
            ligula, eget lacinia odio sem nec elit. Donec ullamcorper nulla non metus auctor
            fringilla.
          </Tabs.Content>

          <Tabs.Content value="single-letter">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer posuere erat a ante
            venenatis dapibus posuere velit aliquet. Donec sed odio dui. Cras mattis consectetur
            purus sit amet fermentum. Maecenas faucibus mollis interdum. Vestibulum id ligula porta
            felis euismod semper.
          </Tabs.Content>

          <Tabs.Content value="fifteen-letters">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean lacinia bibendum nulla
            sed consectetur. Curabitur blandit tempus porttitor. Praesent commodo cursus magna, vel
            scelerisque nisl consectetur et. Nulla vitae elit libero, a pharetra augue. Integer
            posuere erat a ante venenatis dapibus posuere velit aliquet.
          </Tabs.Content>
        </Tabs.Root>
      </div>
    </section>
  );
}
