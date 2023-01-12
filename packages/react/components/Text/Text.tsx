import type { FC, PropsWithChildren } from 'react';
import type { TextProps } from './Text.types';
import { useKiskadee } from '../../schema';
import { TextStyle } from './Text.style';

// @ts-ignore
export const Text: FC<PropsWithChildren<TextProps>> = ({
  children,
  tag,
  colorHex,
  weight,
  italic,
}) => {
  const [schema] = useKiskadee();

  // const style: ButtonStyleProps = {
  //   info: {
  //     name: schema.name,
  //     version: schema.version,
  //     author: schema.author,
  //     themeMode: schema.themeMode,
  //   },
  //   componentSchema: schema?.component?.text?.elements,
  // };

  const text = TextStyle;

  const Tag = tag || 'span';

  return (
    <Tag
      className={[
        text.color(colorHex?.light, colorHex?.dark),
        text.weight(weight),
        text.italic(italic),
      ]
        .join(' ')
        .trim()}
    >
      {children}
    </Tag>
  );
};
