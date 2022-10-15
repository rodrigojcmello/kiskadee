import type { FC, PropsWithChildren } from 'react';
import type { TextProps } from './Text.types';

// @ts-ignore
export const Text: FC<PropsWithChildren<TextProps>> = ({ children }) => {
  // const [schema] = useKiskadee();
  //
  // const style: ButtonStyleProps = {
  //   theme: {
  //     name: schema.name,
  //     version: schema.version,
  //     author: schema.author,
  //     option: schema.theme,
  //   },
  //   schema: schema.component.text,
  // };
  //
  // const text = useMemo(() => {
  //   return new TextStyle(style);
  // }, [style]);
  //
  // const textContainer = text.element().container;
  //
  // return (
  //   <button
  //     data-test-id={'k-text'}
  //     className={[textContainer.color].join(' ').trim()}
  //   >
  //     {children}
  //   </button>
  // );
};
