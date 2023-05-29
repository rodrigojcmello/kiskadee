import type { FC, PropsWithChildren } from 'react';
import {
  useWeight,
  useItalic,
  useColor,
  useTextAlign,
  useTransition,
  useMargin,
  useFontSize,
  useLineHeight,
} from '../../hooks';
import type { TextProps } from './Text.types';

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
