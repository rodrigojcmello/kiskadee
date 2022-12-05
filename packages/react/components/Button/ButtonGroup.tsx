import type { FC, PropsWithChildren } from 'react';
import { Children, useMemo } from 'react';
import type {
  ButtonGroupProps,
  ButtonGroupStyleProps,
} from './ButtonGroup.types';
import { useKiskadee } from '../../schema';
import type { ComponentSchema, ComponentOptions } from '../../utils';
import { ButtonGroupClass } from './ButtonGroup.class';

export const ButtonGroup: FC<PropsWithChildren<ButtonGroupProps>> = ({
  size,
  type,
  variant,
  orientation = 'horizontal',
  children,
  borderRadius,
}) => {
  const [schema] = useKiskadee();

  const style: ButtonGroupStyleProps = {
    size,
    componentSchema: schema?.component?.button?.elements as ComponentSchema,
    componentOptions: schema?.component?.button?.options as ComponentOptions,
    borderRadius,
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
  const common = buttonGroup.common();

  return (
    <div
      className={[
        'button-group',
        container.radius,
        container.base,
        common.transition,
      ]
        .join(' ')
        .trim()}
    >
      {Children.map(children, (child) => {
        return <span>{child}</span>;
      })}
    </div>
  );
};
