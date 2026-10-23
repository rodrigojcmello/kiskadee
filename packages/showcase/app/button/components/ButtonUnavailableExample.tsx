import { FamilyResolvedIcon, Icon } from '@kiskadee/react-components/icon';
import { Text } from '@kiskadee/react-components/text';
import { useShowcaseTextProfiles } from '@/utils/showcase-text-profiles';
import s from '../Button.module.scss';

export function ButtonUnavailableExample({ description }: { description: string }) {
  const profiles = useShowcaseTextProfiles();

  return (
    <Text
      as="div"
      profile={profiles.caption}
      foreground="neutral"
      emphasis="low"
      className={s.missingState}
      title={description}
      data-button-unavailable
    >
      <Icon label={description} foreground="inherit">
        <FamilyResolvedIcon name="ban" />
      </Icon>
      <Text as="span" profile={profiles.caption} foreground="inherit" aria-hidden="true">
        Not published
      </Text>
    </Text>
  );
}
