import type { FC } from 'react';
import { Text } from '@kiskadee/react/components/Text';

export const TextOnly: FC = () => {
  return (
    <div>
      <h1>text only</h1>
      <Text
        tag={'h1'}
        colorHex={{ light: 'red', dark: 'green' }}
        weight={100}
        italic={true}
      >
        Hello2
      </Text>
      <Text
        tag={'h2'}
        colorHex={{ light: 'blue', dark: 'pink' }}
        weight={100}
        italic={false}
      >
        Hi2345
      </Text>
      <Text
        tag={'p'}
        colorHex={{ light: 'blue', dark: 'orange' }}
        weight={400}
        italic={false}
        textAlign={'center'}
        size={16}
        sizeResponsive={{ medium1: 14 }}
        lineHeight={20}
        lineHeightResponsive={{ medium1: 16 }}
        margin={{ top: 10, bottom: 10 }}
        marginResponsive={{
          medium1: { top: 20, bottom: 20 },
        }}
      >
        Test responsive
      </Text>
    </div>
  );
};
