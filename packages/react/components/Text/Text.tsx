import type { FC, PropsWithChildren } from 'react';
import type { TextProps } from './Text.types';
import { useWeight } from '../../hooks/useWeight';
import { useItalic } from '../../hooks/useItalic';
import { useColor } from '../../hooks/useColor';
import { useTextAlign } from '../../hooks/useTextAlign';
import { useFontSize } from '../../hooks/size/useFontSize';

// @ts-ignore
export const Text: FC<PropsWithChildren<TextProps>> = ({
  children,
  tag,
  colorHex,
  weight,
  italic,
  textAlign,
  size,
  sizeResponsive,
}) => {
  const weightClass = useWeight(weight);
  const italicClass = useItalic(italic);
  const colorClass = useColor(colorHex?.light, colorHex?.dark);
  const textAlignClass = useTextAlign(textAlign);
  const fontSizeClass = useFontSize(size, sizeResponsive);

  const Tag = tag || 'span';

  return (
    <Tag
      className={[
        ...colorClass,
        ...fontSizeClass,
        weightClass,
        italicClass,
        textAlignClass,
      ]
        .join(' ')
        .trim()}
    >
      {children}
    </Tag>
  );
};
