'use client';

import type { ComponentEmphasis, ComponentSize, RadiusMode } from '@kiskadee/core';
import { Button } from '@kiskadee/react-components/button';
import { FamilyResolvedIcon } from '@kiskadee/react-components/icon';
import { Text } from '@kiskadee/react-components/text';
import {
  TextFieldAction,
  TextFieldFloatingInside,
  TextFieldFloatingNotched,
  TextFieldIcon,
  TextFieldStandardBorderless,
  TextFieldStandardOutline,
  TextFieldStandardUnderline,
  TextFieldText,
  useTextFieldArtifactConfig
} from '@kiskadee/react-components/text-field';
import type { ReactNode } from 'react';
import { useState } from 'react';
import { ShowcaseExampleCard } from '@/components/ShowcaseBackground/ShowcaseExampleCard';
import { ShowcaseSelectControl } from '@/components/ShowcaseControls';
import { useShowcaseTextProfiles } from '@/utils/showcase-text-profiles';
import styles from './TextFieldContentExamples.module.scss';

const fields = {
  'standard-outline': TextFieldStandardOutline,
  'standard-underline': TextFieldStandardUnderline,
  'standard-borderless': TextFieldStandardBorderless,
  'floating-notched': TextFieldFloatingNotched,
  'floating-inside': TextFieldFloatingInside
};

type Mode = keyof typeof fields;
type Direction = 'ltr' | 'rtl';
type FieldState = 'neutral' | 'error' | 'warning' | 'disabled' | 'readonly';

const modes: Array<{ value: Mode; label: string }> = [
  { value: 'standard-outline', label: 'Standard / Outline' },
  { value: 'standard-underline', label: 'Standard / Underline' },
  { value: 'standard-borderless', label: 'Standard / Borderless' },
  { value: 'floating-notched', label: 'Floating / Notched' },
  { value: 'floating-inside', label: 'Floating / Inside' }
];

const directions = [
  { value: 'ltr', label: 'LTR' },
  { value: 'rtl', label: 'RTL' }
];

type Props = {
  radius: RadiusMode;
  emphasis: ComponentEmphasis;
  customSurface: boolean;
  surfaceClassName: string;
};

function ContentExample({
  children,
  customSurface,
  surfaceClassName,
  title
}: Pick<Props, 'customSurface' | 'surfaceClassName'> & { children: ReactNode; title: string }) {
  const textProfiles = useShowcaseTextProfiles();
  const Surface = customSurface ? 'article' : ShowcaseExampleCard;

  return (
    <Surface className={`${styles.card} ${surfaceClassName}`}>
      <Text as="h4" profile={textProfiles.subsectionTitle}>
        {title}
      </Text>
      {children}
    </Surface>
  );
}

export function TextFieldContentExamples({
  radius,
  emphasis,
  customSurface,
  surfaceClassName
}: Props) {
  const { textFieldClassesMap } = useTextFieldArtifactConfig();
  const textProfiles = useShowcaseTextProfiles();
  const [mode, setMode] = useState<Mode>('standard-outline');
  const [direction, setDirection] = useState<Direction>('ltr');
  const [fieldDirection, setFieldDirection] = useState<'inherit' | Direction>('inherit');
  const [inputDirection, setInputDirection] = useState<'auto' | 'inherit' | Direction>('auto');
  const [fieldSize, setFieldSize] = useState<ComponentSize>('md');
  const [state, setState] = useState<FieldState>('neutral');
  const [search, setSearch] = useState('Fluent 2 / \u0645\u0631\u062d\u0628\u0627 (2026)');
  const [message, setMessage] = useState('Hello');
  const [connectedQuery, setConnectedQuery] = useState('Fluent 2');
  const [messageFeedback, setMessageFeedback] = useState('');
  const [compositionFeedback, setCompositionFeedback] = useState('');
  const [comparisonFeedback, setComparisonFeedback] = useState('');
  const [connectedFeedback, setConnectedFeedback] = useState('');
  const [stableActionFeedback, setStableActionFeedback] = useState('');
  const [showStableAction, setShowStableAction] = useState(true);
  const [stableValue, setStableValue] = useState('');
  const [actionSide, setActionSide] = useState<'start' | 'end'>('end');
  const [startRegionEmphasis, setStartRegionEmphasis] = useState<'lowest' | 'medium'>('medium');
  const [endRegionEmphasis, setEndRegionEmphasis] = useState<'lowest' | 'medium'>('lowest');

  const supportedModes = modes.filter(({ value }) => {
    const [variant, fieldMode] = value.split('-');
    const classes =
      variant === 'standard'
        ? textFieldClassesMap?.standard?.[fieldMode as 'outline' | 'underline' | 'borderless']
        : textFieldClassesMap?.floating?.[fieldMode as 'notched' | 'inside'];
    return Boolean(classes?.e8 && classes?.e9 && classes?.e10);
  });
  const activeMode =
    supportedModes.find(({ value }) => value === mode)?.value ?? supportedModes[0]?.value;
  if (!activeMode) return null;

  const Field = fields[activeMode];
  const floating = activeMode.startsWith('floating-');
  const size = floating && fieldSize === 'sm' ? 'md' : fieldSize;
  const internalActionSize: ComponentSize = size === 'lg' ? 'md' : 'sm';
  const connectedActionSize: ComponentSize = floating ? (size === 'lg' ? 'lg2' : 'lg') : size;
  const disabled = state === 'disabled';
  const readOnly = state === 'readonly';
  const validationStatus = state === 'error' || state === 'warning' ? state : undefined;
  const common = {
    size,
    radius,
    emphasis,
    disabled,
    readOnly,
    validationStatus,
    dir: fieldDirection === 'inherit' ? undefined : fieldDirection
  };
  const inputDir = inputDirection === 'inherit' ? undefined : inputDirection;
  const effectiveDirection = fieldDirection === 'inherit' ? direction : fieldDirection;
  const currencyStart = effectiveDirection === 'rtl' ? 'BRL' : 'R$';
  const currencyEnd = effectiveDirection === 'rtl' ? 'R$' : 'BRL';
  const card = { customSurface, surfaceClassName };

  return (
    <section
      className={styles.section}
      aria-labelledby="text-field-content-title"
      data-text-field-content-examples
    >
      <Text as="h3" id="text-field-content-title" profile={textProfiles.sectionTitle}>
        Internal content
      </Text>
      <Text as="p" profile={textProfiles.body}>
        Passive icons and text share the field. Actions use the existing Button. Change the ancestor
        direction without remounting the fields; content direction stays independent.
      </Text>
      <Text as="p" profile={textProfiles.body}>
        Internal examples use Button Small in a Medium field and Button Medium in a Large field. A
        Small Standard field cannot contain the smallest native Button at its original height; that
        pairing intentionally demonstrates oversized content.
      </Text>
      <ShowcaseExampleCard contentClassName={styles.controls}>
        <ShowcaseSelectControl
          label="Content mode"
          value={activeMode}
          options={supportedModes}
          onValueChange={(value) => setMode(value as Mode)}
        />
        <ShowcaseSelectControl
          label="Ancestor direction"
          value={direction}
          options={directions}
          onValueChange={(value) => setDirection(value as Direction)}
        />
        <ShowcaseSelectControl
          label="Field direction"
          value={fieldDirection}
          options={[{ value: 'inherit', label: 'Inherit ancestor' }, ...directions]}
          onValueChange={(value) => setFieldDirection(value as typeof fieldDirection)}
        />
        <ShowcaseSelectControl
          label="Text direction"
          value={inputDirection}
          options={[
            { value: 'auto', label: 'Auto (text)' },
            { value: 'inherit', label: 'Inherit field' },
            ...directions
          ]}
          onValueChange={(value) => setInputDirection(value as typeof inputDirection)}
        />
        <ShowcaseSelectControl
          label="Content field size"
          value={size}
          options={[
            ...(!floating ? [{ value: 'sm', label: 'Small' }] : []),
            { value: 'md', label: 'Medium' },
            { value: 'lg', label: 'Large' }
          ]}
          onValueChange={(value) => setFieldSize(value as ComponentSize)}
        />
        <ShowcaseSelectControl
          label="Content field state"
          value={state}
          options={[
            { value: 'neutral', label: 'Neutral' },
            { value: 'error', label: 'Error intent' },
            { value: 'warning', label: 'Warning intent' },
            { value: 'disabled', label: 'Disabled' },
            { value: 'readonly', label: 'Read-only' }
          ]}
          onValueChange={(value) => setState(value as FieldState)}
        />
      </ShowcaseExampleCard>
      <div className={styles.grid} dir={direction} data-content-direction={direction}>
        <ContentExample {...card} title="Search / automatic text direction">
          <Field
            {...common}
            id="content-search"
            label="Search"
            value={search}
            onValueChange={setSearch}
            placeholder="Search mixed-language text"
            inputProps={{ dir: inputDir }}
            startContent={
              <TextFieldIcon>
                <FamilyResolvedIcon name="search" />
              </TextFieldIcon>
            }
            clearAction={{
              icon: <FamilyResolvedIcon name="close" />,
              label: 'Clear search',
              clearedAnnouncement: 'Search cleared.',
              size: internalActionSize
            }}
          />
        </ContentExample>
        <ContentExample {...card} title="Email / LTR value in either interface direction">
          <Field
            {...common}
            id="content-email"
            label="Email address"
            defaultValue="ada@example.com"
            inputProps={{ type: 'email', dir: 'ltr', autoComplete: 'email' }}
            startContent={
              <TextFieldIcon>
                <FamilyResolvedIcon name="mail" />
              </TextFieldIcon>
            }
            endContent={
              <TextFieldText dir="ltr" aria-hidden="true">
                @
              </TextFieldText>
            }
          />
        </ContentExample>
        <ContentExample {...card} title="Currency / isolated prefix and suffix">
          <Field
            {...common}
            id="content-currency"
            label="Amount in Brazilian reais"
            defaultValue="1.234,56"
            inputProps={{ dir: 'ltr', inputMode: 'decimal' }}
            startContent={
              <TextFieldText dir="ltr" aria-hidden="true">
                {currencyStart}
              </TextFieldText>
            }
            endContent={
              <TextFieldText dir="ltr" aria-hidden="true">
                {currencyEnd}
              </TextFieldText>
            }
          />
          <Text as="p" profile={textProfiles.body}>
            The consumer chooses regions for the pt-BR currency convention: R$ stays to the left of
            the LTR value in either interface direction. Prefix and suffix are separate from the
            submitted value.
          </Text>
        </ContentExample>
        <ContentExample {...card} title="Password / reveal remains available in read-only">
          <Field
            {...common}
            id="content-password"
            label="Password"
            defaultValue="Fluent-2-example"
            inputProps={{
              type: 'password',
              dir: inputDir,
              autoComplete: 'off'
            }}
            startContent={
              <TextFieldIcon>
                <FamilyResolvedIcon name="lock" />
              </TextFieldIcon>
            }
            visibilityToggle={{
              presentation: 'text',
              showText: 'Show',
              hideText: 'Hide',
              showLabel: 'Show password',
              hideLabel: 'Hide password',
              size: internalActionSize
            }}
          />
          <Field
            {...common}
            id="content-password-icon"
            label="Password with icon"
            defaultValue="Another-example"
            inputProps={{ type: 'password', dir: inputDir, autoComplete: 'off' }}
            startContent={
              <TextFieldIcon>
                <FamilyResolvedIcon name="lock" />
              </TextFieldIcon>
            }
            visibilityToggle={{
              presentation: 'icon',
              showIcon: <FamilyResolvedIcon name="eye" />,
              hideIcon: <FamilyResolvedIcon name="eye-off" />,
              showLabel: 'Show password',
              hideLabel: 'Hide password',
              size: internalActionSize
            }}
          />
        </ContentExample>
        <ContentExample {...card} title="Passive regions / full-height surfaces">
          <div className={styles.controls}>
            <ShowcaseSelectControl
              label="Start region emphasis"
              value={startRegionEmphasis}
              options={[
                { value: 'lowest', label: 'Lowest' },
                { value: 'medium', label: 'Medium' }
              ]}
              onValueChange={(value) => setStartRegionEmphasis(value as 'lowest' | 'medium')}
            />
            <ShowcaseSelectControl
              label="End region emphasis"
              value={endRegionEmphasis}
              options={[
                { value: 'lowest', label: 'Lowest' },
                { value: 'medium', label: 'Medium' }
              ]}
              onValueChange={(value) => setEndRegionEmphasis(value as 'lowest' | 'medium')}
            />
          </div>
          <Field
            {...common}
            id="content-passive-emphasis"
            label="Secure payment reference"
            defaultValue="PAY-0012"
            inputProps={{ dir: 'ltr' }}
            startContentEmphasis={startRegionEmphasis}
            endContentEmphasis={endRegionEmphasis}
            startContent={
              <>
                <TextFieldIcon>
                  <FamilyResolvedIcon name="cart" />
                </TextFieldIcon>
                <TextFieldText dir="ltr" aria-hidden="true">
                  Ref.
                </TextFieldText>
              </>
            }
            endContent={
              <>
                <TextFieldText dir="ltr" aria-hidden="true">
                  ID
                </TextFieldText>
                <TextFieldIcon>
                  <FamilyResolvedIcon name="lock" />
                </TextFieldIcon>
              </>
            }
          />
          <Field
            {...common}
            id="content-passive-emphasis-end"
            label="Email reference"
            defaultValue="ada@example.com"
            inputProps={{ type: 'email', dir: 'ltr' }}
            startContentEmphasis="lowest"
            endContentEmphasis="medium"
            startContent={
              <TextFieldIcon>
                <FamilyResolvedIcon name="mail" />
              </TextFieldIcon>
            }
            endContent={
              <>
                <TextFieldText dir="ltr" aria-hidden="true">
                  ID
                </TextFieldText>
                <TextFieldIcon>
                  <FamilyResolvedIcon name="lock" />
                </TextFieldIcon>
              </>
            }
          />
          <Text as="p" profile={textProfiles.body}>
            Medium belongs to the entire lateral region, with one shared surface and separator.
            Passive icons and text keep their geometry. Lowest leaves the region plain.
          </Text>
        </ContentExample>
        <ContentExample {...card} title="Free composition / mixed passive content and actions">
          <Field
            {...common}
            id="content-free-composition"
            label="Secure reference"
            defaultValue="REF-0012"
            inputProps={{ dir: 'ltr' }}
            startContentEmphasis="medium"
            startContent={
              <>
                <TextFieldIcon>
                  <FamilyResolvedIcon name="lock" />
                </TextFieldIcon>
                <TextFieldText aria-hidden="true">Ref.</TextFieldText>
              </>
            }
            endContent={({ disabled }) => (
              <>
                <TextFieldText dir="ltr" aria-hidden="true">
                  ID
                </TextFieldText>
                <Button
                  type="button"
                  size={internalActionSize}
                  radius={radius}
                  emphasis="lowest"
                  disabled={disabled}
                  aria-label="Reference details"
                  onClick={() => setCompositionFeedback('Reference details action activated.')}
                >
                  <Button.Icon>
                    <FamilyResolvedIcon name="chevron-end" />
                  </Button.Icon>
                </Button>
              </>
            )}
          />
          <Text as="p" profile={textProfiles.body}>
            Mixed regions keep normal composition and native Button dimensions. This example has no
            optical spacing guarantee for individual children.
          </Text>
          <Text as="p" profile={textProfiles.body} className={styles.feedback} role="status">
            {compositionFeedback}
          </Text>
        </ContentExample>
        <ContentExample {...card} title="Message / independent action emphasis">
          <form
            className={styles.message}
            onSubmit={(event) => {
              event.preventDefault();
              if (!disabled && !readOnly && message.trim()) setMessageFeedback(`Sent: ${message}`);
            }}
          >
            <Field
              {...common}
              id="content-message"
              label="Message"
              value={message}
              onValueChange={setMessage}
              inputProps={{ dir: inputDir }}
              startContent={({ disabled, readOnly }) => (
                <TextFieldAction>
                  <Button
                    type="button"
                    size={internalActionSize}
                    radius={radius}
                    emphasis="lowest"
                    aria-label="Attach file"
                    disabled={disabled || readOnly}
                    onClick={() =>
                      setMessageFeedback(
                        'Attach action activated. This example does not upload files.'
                      )
                    }
                  >
                    <Button.Icon>
                      <FamilyResolvedIcon name="plus" />
                    </Button.Icon>
                  </Button>
                </TextFieldAction>
              )}
              endContent={({ disabled, readOnly }) => (
                <>
                  <Button
                    type="button"
                    size={internalActionSize}
                    radius={radius}
                    emphasis="lowest"
                    disabled={disabled || !message}
                    onClick={() => {
                      if (!navigator.clipboard) {
                        setMessageFeedback('Copy was unavailable. Select the message to copy it.');
                        return;
                      }
                      void navigator.clipboard.writeText(message).then(
                        () => setMessageFeedback('Message copied.'),
                        () =>
                          setMessageFeedback('Copy was unavailable. Select the message to copy it.')
                      );
                    }}
                  >
                    <Button.Label>Copy</Button.Label>
                  </Button>
                  <Button
                    type="submit"
                    size={internalActionSize}
                    radius={radius}
                    intent="primary"
                    emphasis="high"
                    aria-label="Send message"
                    disabled={disabled || readOnly || !message.trim()}
                  >
                    <Button.Icon>
                      <FamilyResolvedIcon name="send" />
                    </Button.Icon>
                  </Button>
                </>
              )}
            />
          </form>
          <Text as="p" profile={textProfiles.body} className={styles.feedback} role="status">
            {messageFeedback}
          </Text>
        </ContentExample>
        <ContentExample {...card} title="Connected end action / native Button">
          <form
            className={styles.message}
            onSubmit={(event) => {
              event.preventDefault();
              if (!disabled && !readOnly && connectedQuery.trim()) {
                setConnectedFeedback(`Search submitted: ${connectedQuery}`);
              }
            }}
          >
            <Field
              {...common}
              id="content-connected"
              label="Connected search"
              value={connectedQuery}
              onValueChange={setConnectedQuery}
              inputProps={{ dir: inputDir }}
              connectedEndAction={({ disabled, readOnly, className }) => (
                <Button
                  className={className}
                  type="submit"
                  size={connectedActionSize}
                  radius={radius}
                  intent="primary"
                  emphasis="high"
                  aria-label="Run connected search"
                  disabled={disabled || readOnly || !connectedQuery.trim()}
                >
                  <Button.Icon>
                    <FamilyResolvedIcon name="search" />
                  </Button.Icon>
                  <Button.Label>Search</Button.Label>
                </Button>
              )}
            />
          </form>
          <Text as="p" profile={textProfiles.body}>
            The action sits at logical end, outside the input control. Standard pairs equal size
            names; Floating Medium uses Button Large and Floating Large uses Button Large 2. The
            native Button is not stretched, so these pairings do not promise equal heights.
          </Text>
          <Text as="p" profile={textProfiles.body} className={styles.feedback} role="status">
            {connectedFeedback}
          </Text>
        </ContentExample>
        <ContentExample {...card} title="Medium field / optional Small internal Button">
          <ShowcaseSelectControl
            label="Optional Small action"
            value={showStableAction ? 'visible' : 'hidden'}
            options={[
              { value: 'visible', label: 'Show action' },
              { value: 'hidden', label: 'Hide action' }
            ]}
            onValueChange={(value) => setShowStableAction(value === 'visible')}
          />
          <Field
            {...common}
            id="content-stable-action"
            size="md"
            label="Height stability"
            placeholder="Type to compare empty and filled states"
            value={stableValue}
            onValueChange={setStableValue}
            inputProps={{ dir: inputDir }}
            endContent={
              showStableAction
                ? ({ disabled, readOnly }) => (
                    <TextFieldAction>
                      <Button
                        type="button"
                        size="sm"
                        radius={radius}
                        emphasis="lowest"
                        aria-label="Optional internal action"
                        disabled={disabled || readOnly}
                        onClick={() => setStableActionFeedback('Internal action activated.')}
                      >
                        <Button.Icon>
                          <FamilyResolvedIcon name="plus" />
                        </Button.Icon>
                      </Button>
                    </TextFieldAction>
                  )
                : undefined
            }
          />
          <Text as="p" profile={textProfiles.body}>
            Toggle the Small Button while keeping this Medium field mounted. A fitting action
            preserves the input-only control height in empty, filled, and focused states.
          </Text>
          <Text as="p" profile={textProfiles.body} className={styles.feedback} role="status">
            {stableActionFeedback}
          </Text>
        </ContentExample>
        <ContentExample {...card} title="Single lateral action / fitting and oversized sizes">
          <ShowcaseSelectControl
            label="Single action side"
            value={actionSide}
            options={[
              { value: 'start', label: 'Logical start' },
              { value: 'end', label: 'Logical end' }
            ]}
            onValueChange={(value) => setActionSide(value as 'start' | 'end')}
          />
          <div className={styles.fields} data-content-size-comparison>
            {(['sm', 'md'] as const).map((buttonSize) => {
              const renderAction = ({
                disabled,
                readOnly
              }: {
                disabled: boolean;
                readOnly: boolean;
              }) => (
                <TextFieldAction>
                  <Button
                    type="button"
                    size={buttonSize}
                    radius={radius}
                    emphasis="lowest"
                    aria-label={`Compare ${buttonSize} Button`}
                    disabled={disabled || readOnly}
                    onClick={() =>
                      setComparisonFeedback(
                        `${buttonSize === 'sm' ? 'Small' : 'Medium'} Button activated.`
                      )
                    }
                  >
                    <Button.Icon>
                      <FamilyResolvedIcon name="plus" />
                    </Button.Icon>
                  </Button>
                </TextFieldAction>
              );
              return (
                <Field
                  {...common}
                  key={buttonSize}
                  id={`content-button-${buttonSize}`}
                  size="md"
                  label={`Medium field / ${buttonSize === 'sm' ? 'Small' : 'Medium'} Button`}
                  defaultValue="Compare geometry"
                  inputProps={{ dir: inputDir }}
                  startContent={actionSide === 'start' ? renderAction : undefined}
                  endContent={actionSide === 'end' ? renderAction : undefined}
                />
              );
            })}
          </div>
          <Text as="p" profile={textProfiles.body}>
            Compare the native Small and Medium Buttons inside the same Medium field. Their
            dimensions come from the active preset. Oversized content can increase the field's
            height; the field does not add its input padding around the Button or resize it.
          </Text>
          <Text as="p" profile={textProfiles.body} className={styles.feedback} role="status">
            {comparisonFeedback}
          </Text>
        </ContentExample>
      </div>
    </section>
  );
}
