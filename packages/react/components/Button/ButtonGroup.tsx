import type { FC, PropsWithChildren } from 'react';
import type { ButtonGroupProps } from './ButtonGroup.types';
import { useKiskadee } from '../../schema';

export const ButtonGroup: FC<PropsWithChildren<ButtonGroupProps>> = ({
  size,
  type,
  variant,
  orientation = 'horizontal',
  children,
}) => {
  const [schema] = useKiskadee();

  // const style: KiskadeeStyleTypes = {
  //   size,
  //   schema,
  //   type,
  //   variant,
  // };
  //
  // const buttonGroup = useMemo(() => {
  //   return new ButtonGroupClass(style);
  // }, [style]);

  // const container = buttonGroup.elementGroup();

  return <div className={['button-group'].join(',')}>{children}</div>;
};
