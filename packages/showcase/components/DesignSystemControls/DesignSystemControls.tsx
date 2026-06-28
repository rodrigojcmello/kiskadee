'use client';
import { useKiskadee, useShowcase } from '@kiskadee/react-components';
import { Select } from '@/k-components';
import { playWowTransition } from '@/utils/playWowTransition';
import styles from './DesignSystemControls.module.scss';

export default function DesignSystemControls() {
  const { designSystem, setDesignSystem } = useKiskadee();
  const { designSystemKeys, designSystemList } = useShowcase();

  const displayNameByKey = new Map<string, string>(
    designSystemList.map((entry) => [entry.key, entry.displayName])
  );

  const designSystemOptions = designSystemKeys.map((key) => ({
    value: key,
    label: displayNameByKey.get(key) ?? key
  }));

  return (
    <div className={styles.container}>
      <div className={styles.group}>
        <Select
          className={styles.select}
          label="Design System"
          width="100%"
          minWidth={0}
          maxWidth={340}
          options={designSystemOptions}
          value={designSystem}
          onValueChange={(value) => {
            playWowTransition();
            setDesignSystem(value);
          }}
        />
      </div>
    </div>
  );
}
