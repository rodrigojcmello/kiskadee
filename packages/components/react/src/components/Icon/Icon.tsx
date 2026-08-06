import { Icon as HeadlessIcon } from '@kiskadee/react-headless';
import { forwardRef, useMemo } from 'react';
import { useResolvedIconGlyph } from '../../shared/contexts/IconFamilyContext.tsx';
import { useKiskadee } from '../../shared/contexts/KiskadeeContext.tsx';
import { useComponentClassMap } from '../../shared/contexts/useComponentClassMap.ts';
import { resolveIconClassNames } from './Icon.class-names.ts';
import type { IconClassesMap, IconProps } from './Icon.types.ts';
import { IconGlyph } from './IconGlyph.tsx';

declare const process: { env: { NODE_ENV?: string } };

export type {
  DirectIconContentProps,
  IconClassesMap,
  IconElementName,
  IconProps,
  IconVisualProps,
  NamedIconContentProps
} from './Icon.types.ts';

export const Icon = forwardRef<HTMLSpanElement, IconProps>(function Icon(
  { classNames = {}, scale, intent, surfaceContext, name, fallback, children, ...headlessProps },
  ref
) {
  const { classesMap } = useKiskadee();
  const resolvedNamedGlyph = useResolvedIconGlyph(name);
  const iconClassesMap = useComponentClassMap(
    'icon',
    classesMap.icon as IconClassesMap | undefined
  );
  const resolvedClassNames = useMemo(
    () =>
      resolveIconClassNames({
        e1: iconClassesMap?.e1,
        classNames,
        scale,
        intent,
        surfaceContext
      }),
    [classNames, iconClassesMap?.e1, intent, scale, surfaceContext]
  );

  if (name !== undefined && !resolvedNamedGlyph.glyph && fallback === undefined) {
    if (process.env.NODE_ENV !== 'production') {
      console.error(
        resolvedNamedGlyph.hasProvider
          ? `[kiskadee/icons] Icon "${name}" is not mapped by family "${
              resolvedNamedGlyph.familyId ?? 'unknown'
            }".`
          : `[kiskadee/icons] Icon "${name}" requires an IconFamilyProvider or an explicit fallback.`
      );
    }
    return null;
  }

  const content = name !== undefined ? <IconGlyph name={name} fallback={fallback} /> : children;

  return (
    <HeadlessIcon {...headlessProps} ref={ref} classNames={resolvedClassNames}>
      {content}
    </HeadlessIcon>
  );
});

export default Icon;
