import { TextStyle } from '../Text.style';

export const useItalic = (value?: boolean): string | undefined => {
  return TextStyle.render({
    fontStyle: 'italic',
  });
};
