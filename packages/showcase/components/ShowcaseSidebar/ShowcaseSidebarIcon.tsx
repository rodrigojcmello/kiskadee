import Image from 'next/image';
import style from './ShowcaseSidebar.module.scss';

const iconSources = {
  accordion: '/showcase-icons/accordion.svg',
  badge: '/showcase-icons/badge.svg',
  button: '/showcase-icons/button.svg',
  'brand-buttons': '/showcase-icons/brand-buttons.svg',
  'bottom-sheet': '/showcase-icons/bottom-sheet.svg',
  card: '/showcase-icons/card.svg',
  chip: '/showcase-icons/chip.svg',
  dropdown: '/showcase-icons/dropdown.svg',
  icons: '/showcase-icons/icons.svg',
  layout: '/showcase-icons/layout.svg',
  progress: '/showcase-icons/progress.svg',
  select: '/showcase-icons/select.svg',
  separator: '/showcase-icons/separator.svg',
  slider: '/showcase-icons/slider.svg',
  tabs: '/showcase-icons/tabs.svg',
  switch: '/showcase-icons/switch.svg',
  'text-field': '/showcase-icons/text-field.svg'
} as const;

export default function ShowcaseSidebarIcon({
  name,
  active
}: {
  name: keyof typeof iconSources;
  active: boolean;
}) {
  const source = iconSources[name];

  return (
    <>
      {active ? null : (
        <Image
          className={style.inactiveIcon}
          src={source.replace('.svg', '-inactive.svg')}
          alt=""
          width={20}
          height={20}
          aria-hidden="true"
          draggable={false}
          unoptimized
        />
      )}
      <Image
        className={active ? undefined : style.hoverIcon}
        src={source}
        alt=""
        width={20}
        height={20}
        aria-hidden="true"
        draggable={false}
        loading="eager"
        unoptimized
      />
    </>
  );
}
