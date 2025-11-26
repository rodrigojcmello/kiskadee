'use client';

import dynamic from 'next/dynamic';
import type { SVGProps } from 'react';

// Define dynamic imports statically to avoid recreating components on every render
const icons = {
  ChevronDown: dynamic(() =>
    import('./icons/IconChevronDown').then((mod) => mod.IconChevronDown)
  ),
  Moon: dynamic(() => import('./icons/IconMoon').then((mod) => mod.IconMoon)),
  MoonStars: dynamic(() =>
    import('./icons/IconMoonStars').then((mod) => mod.IconMoonStars)
  ),
  SunMax: dynamic(() => import('./icons/IconSunMax').then((mod) => mod.IconSunMax))
};

export type IconName = keyof typeof icons;

interface IconProps extends SVGProps<SVGSVGElement> {
  name: IconName;
}

export const Icon = ({ name, ...props }: IconProps) => {
  const IconComponent = icons[name];

  if (!IconComponent) {
    console.warn(`Icon "${name}" not found`);
    return null;
  }

  return <IconComponent {...props} />;
};
