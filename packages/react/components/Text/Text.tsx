import type { FC, PropsWithChildren } from 'react';
import type { TextProps } from './Text.types';
import { useWeight } from '../../hooks/useWeight';
import { useItalic } from '../../hooks/useItalic';
import { useColor } from '../../hooks/useColor';

// @ts-ignore
export const Text: FC<PropsWithChildren<TextProps>> = ({
  children,
  tag,
  colorHex,
  weight,
  italic,
}) => {
  const weightClass = useWeight(weight);
  const italicClass = useItalic(italic);
  const colorClass = useColor(colorHex?.light, colorHex?.dark);

  const Tag = tag || 'span';

  return (
    <Tag className={[...colorClass, weightClass, italicClass].join(' ').trim()}>
      {children}
    </Tag>
  );
};
