import type { FC, PropsWithChildren } from 'react';
import { useMemo } from 'react';
import type { ButtonGroupProps } from './ButtonGroup.types';
import { useKiskadee } from '../../schema';
import type {
  ComponentSchema,
  KiskadeeStyleType,
  ComponentOptions,
} from '../../utils';
import { ButtonGroupClass } from './ButtonGroup.class';

export const ButtonGroup: FC<PropsWithChildren<ButtonGroupProps>> = ({
  size,
  type,
  variant,
  orientation = 'horizontal',
  children,
}) => {
  const [schema] = useKiskadee();

  const style: KiskadeeStyleType = {
    size,
    componentSchema: schema?.component?.button?.elements as ComponentSchema,
    componentOptions: schema?.component?.button?.options as ComponentOptions,
    type,
    variant,
    info: {
      name: schema.name,
      version: schema.version,
      author: schema.author,
      themeMode: schema.themeMode,
    },
  };

  const buttonGroup = useMemo(() => {
    return new ButtonGroupClass(style);
  }, [style]);

  const container = buttonGroup.elementGroup();

  return (
    <div className={['button-group', container.base].join(' ').trim()}>
      {children}
    </div>
  );
};
