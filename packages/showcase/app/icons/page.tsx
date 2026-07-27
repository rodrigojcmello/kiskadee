import * as KiskadeeIcons from '@kiskadee/icons/kiskadee';
import * as SocialIcons from '@kiskadee/icons/social';
import type { ComponentType, SVGProps } from 'react';
import s from './Icons.module.scss';

type IconComponent = ComponentType<SVGProps<SVGSVGElement>>;

type IconEntry = {
  component: IconComponent;
  name: string;
};

type IconFamily = {
  entries: IconEntry[];
  name: string;
};

function getIconEntries(iconNamespace: object): IconEntry[] {
  return Object.entries(iconNamespace)
    .filter(
      (entry): entry is [string, IconComponent] =>
        entry[0].endsWith('Icon') && typeof entry[1] === 'function'
    )
    .map(([name, component]) => ({ component, name }))
    .sort((first, second) => first.name.localeCompare(second.name));
}

const iconFamilies: IconFamily[] = [
  {
    name: 'Kiskadee',
    entries: getIconEntries(KiskadeeIcons)
  },
  {
    name: 'Social',
    entries: getIconEntries(SocialIcons)
  }
];

export default function IconsPage() {
  return (
    <main className={s.page}>
      <header className={s.header}>
        <h1 className={s.title}>Icons</h1>
        <p className={s.summary}>
          Runtime gallery of the icon families exported by <code>@kiskadee/icons</code>. New icon
          component exports are discovered automatically.
        </p>
      </header>

      {iconFamilies.map((family) => (
        <section key={family.name} className={s.family} aria-labelledby={`${family.name}-icons`}>
          <div className={s.familyHeader}>
            <h2 id={`${family.name}-icons`} className={s.familyTitle}>
              {family.name}
            </h2>
            <p className={s.familyCount}>
              {family.entries.length} {family.entries.length === 1 ? 'icon' : 'icons'}
            </p>
          </div>

          <div className={s.grid}>
            {family.entries.map(({ component: Icon, name }) => (
              <article key={name} className={s.item}>
                <Icon className={s.icon} />
                <code className={s.iconName}>{name}</code>
              </article>
            ))}
          </div>
        </section>
      ))}
    </main>
  );
}
