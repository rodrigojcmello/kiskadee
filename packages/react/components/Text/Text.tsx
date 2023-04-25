import type { FC, PropsWithChildren } from 'react';
import type { TextProps } from './Text.types';
import { useWeight } from '../../hooks/useWeight';
import { useItalic } from '../../hooks/useItalic';
import { useColor } from '../../hooks/useColor';
import { useTextAlign } from '../../hooks/useTextAlign';
import { useFontSize } from '../../hooks/responsive/useFontSize';
import { useTransition } from '../../hooks/useTransition';
import { useLineHeight } from '../../hooks/responsive/useLineHeight';
import { useMargin } from '../../hooks/responsive/useMargin';

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
  lineHeight,
  lineHeightResponsive,
  margin,
  marginResponsive,
}) => {
  const weightClass = useWeight(weight);
  const italicClass = useItalic(italic);
  const colorClass = useColor({ light: colorHex?.light, dark: colorHex?.dark });
  const textAlignClass = useTextAlign(textAlign);
  const fontSizeClass = useFontSize(size, sizeResponsive);
  const lineHeightClass = useLineHeight(lineHeight, lineHeightResponsive);
  const transitionClass = useTransition('linear', 0.2);
  const marginClass = useMargin(margin, marginResponsive);
  // useTextCore
  // useTextReset

  const Tag = tag || 'span';

  return (
    <Tag
      className={[
        ...colorClass,
        ...fontSizeClass,
        ...lineHeightClass,
        ...transitionClass,
        ...marginClass,
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
