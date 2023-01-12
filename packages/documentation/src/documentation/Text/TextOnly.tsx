import type { FC } from 'react';
import { Text } from '@kiskadee/react/components/Text';

export const TextOnly: FC = () => {
  return (
    <div>
      <h1>text only</h1>
      <Text
        tag={'h1'}
        colorHex={{ light: 'green', dark: 'blue' }}
        weight={700}
        italic={true}
      >
        Hello
      </Text>
    </div>
  );
};
