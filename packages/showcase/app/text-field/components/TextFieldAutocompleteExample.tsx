'use client';

import {
  Dropdown,
  Text,
  TextFieldStandardOutline,
  useKiskadee,
  useShowcase
} from '@kiskadee/react-components';
import type { AutocompleteInputRenderProps } from '@kiskadee/react-headless/autocomplete';
import { Autocomplete } from '@kiskadee/react-headless/autocomplete';
import type { Ref } from 'react';
import { useMemo, useState } from 'react';
import { useShowcaseTextProfiles } from '@/utils/showcase-text-profiles';
import styles from './TextFieldAutocompleteExample.module.scss';

type SearchOption = {
  value: string;
  textValue: string;
  description: string;
  icon: 'home' | 'rocket' | 'settings' | 'trash';
  disabled?: boolean;
};

const SEARCH_OPTIONS: SearchOption[] = [
  {
    value: 'dashboard',
    textValue: 'Dashboard',
    description: 'Overview of recent work and activity.',
    icon: 'home'
  },
  {
    value: 'launch-plan',
    textValue: 'Launch plan',
    description: 'Milestones, owners and release readiness.',
    icon: 'rocket'
  },
  {
    value: 'workspace-settings',
    textValue: 'Workspace settings',
    description: 'Members, permissions and integrations.',
    icon: 'settings'
  },
  {
    value: 'archived-project',
    textValue: 'Archived project',
    description: 'This result is unavailable in the current workspace.',
    icon: 'trash',
    disabled: true
  }
];

function StyledAutocomplete({ rich }: { rich: boolean }) {
  const [query, setQuery] = useState('');
  const [selectedValue, setSelectedValue] = useState<string>();
  const filteredOptions = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase();
    if (!normalizedQuery) return SEARCH_OPTIONS;
    return SEARCH_OPTIONS.filter((option) =>
      `${option.textValue} ${option.description}`.toLocaleLowerCase().includes(normalizedQuery)
    );
  }, [query]);

  return (
    <Dropdown.VisualProvider>
      <Autocomplete.Root
        options={filteredOptions}
        value={selectedValue}
        onValueChange={setSelectedValue}
        inputValue={query}
        onInputValueChange={setQuery}
      >
        <Autocomplete.Input
          render={(inputProps) => {
            const { ref, value, disabled, id, ...nativeInputProps }: AutocompleteInputRenderProps =
              inputProps;
            return (
              <TextFieldStandardOutline
                id={id}
                inputRef={ref as Ref<HTMLInputElement>}
                label={rich ? 'Search workspace' : 'Go to'}
                placeholder={rich ? 'Try “launch” or “settings”' : 'Start typing'}
                value={value}
                disabled={disabled}
                inputProps={nativeInputProps}
              />
            );
          }}
        />
        <Dropdown.Presence>
          {({ forceMount, render }) => (
            <Autocomplete.Content
              className={styles.positioner}
              width="anchor"
              forceMount={forceMount}
              render={render}
            >
              <Dropdown.Surface>
                <Dropdown.Items>
                  <Dropdown.Group>
                    {filteredOptions.length === 0 ? (
                      <Autocomplete.Empty className={styles.empty}>
                        No matching results.
                      </Autocomplete.Empty>
                    ) : (
                      filteredOptions.map((option) => (
                        <Autocomplete.Option
                          key={option.value}
                          value={option.value}
                          textValue={option.textValue}
                          disabled={option.disabled}
                          render={(optionProps, state) => {
                            const { ref, children, ...itemProps } = optionProps;
                            return (
                              <Dropdown.Item
                                {...itemProps}
                                ref={ref}
                                disabled={state.disabled}
                                selected={state.active || state.selected}
                              >
                                {rich ? <Dropdown.Icon name={option.icon} /> : null}
                                <Dropdown.Label>{option.textValue}</Dropdown.Label>
                                {rich ? (
                                  <Dropdown.Description>{option.description}</Dropdown.Description>
                                ) : null}
                                {children}
                              </Dropdown.Item>
                            );
                          }}
                        />
                      ))
                    )}
                  </Dropdown.Group>
                </Dropdown.Items>
              </Dropdown.Surface>
            </Autocomplete.Content>
          )}
        </Dropdown.Presence>
      </Autocomplete.Root>
    </Dropdown.VisualProvider>
  );
}

export function TextFieldAutocompleteExample() {
  const { designSystem } = useKiskadee();
  const { manifest } = useShowcase();
  const textProfiles = useShowcaseTextProfiles();
  const available = Boolean(
    designSystem === 'material-design-3-google' &&
      manifest?.components?.dropdown &&
      manifest.components.textField
  );

  return (
    <section className={styles.section} aria-labelledby="text-field-autocomplete-title">
      <Text as="h3" id="text-field-autocomplete-title" profile={textProfiles.sectionTitle}>
        Autocomplete
      </Text>
      <Text as="p" profile={textProfiles.body} className={styles.description}>
        Headless combobox behavior keeps focus on a real Material TextField while the active
        Dropdown renders its suggestions.
      </Text>
      {available ? (
        <div className={styles.grid}>
          <article className={styles.card}>
            <Text as="h4" profile={textProfiles.subsectionTitle}>
              Compact
            </Text>
            <StyledAutocomplete rich={false} />
          </article>
          <article className={styles.card}>
            <Text as="h4" profile={textProfiles.subsectionTitle}>
              Rich results
            </Text>
            <StyledAutocomplete rich />
          </article>
        </div>
      ) : (
        <div className={styles.unavailable}>
          <Text as="p" profile={textProfiles.body}>
            Switch to Material 3 Google to inspect the TextField and Dropdown composition.
          </Text>
        </div>
      )}
    </section>
  );
}
