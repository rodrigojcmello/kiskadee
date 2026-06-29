import { validateButtonComponentContract } from '../components/button.ts';
import { validateCardComponentContract } from '../components/card.ts';
import { validateSliderComponentContract } from '../components/slider.zod.ts';
import { validateSwitchComponentContract } from '../components/switch.zod.ts';
import { validateTabsComponentContract } from '../components/tabs.zod.ts';
import { validateTextFieldComponentContract } from '../components/text-field.zod.ts';

/**
 * Build-time validation for component contracts with strict, element-aware rules.
 *
 * Incremental scope:
 * - button
 * - card
 * - slider
 * - switch
 * - tabs
 * - textField
 *
 * Other components remain unchecked for now.
 */
export function validateSchemaComponentContracts(schemaLike: {
  components?: Record<string, unknown>;
}): void {
  const components = schemaLike?.components;
  if (!components || typeof components !== 'object') return;

  const byName = components as Record<string, unknown>;

  if (byName.button !== undefined) {
    const issues = validateButtonComponentContract(byName.button, 'components.button');
    if (issues.length > 0) {
      throw new Error(
        `Invalid component contract for button. Review element/property mapping.\n${issues.join('\n')}`
      );
    }
  }

  if (byName.card !== undefined) {
    const issues = validateCardComponentContract(byName.card, 'components.card');
    if (issues.length > 0) {
      throw new Error(
        `Invalid component contract for card. Review element/property mapping.\n${issues.join('\n')}`
      );
    }
  }

  if (byName.slider !== undefined) {
    const issues = validateSliderComponentContract(byName.slider, 'components.slider');
    if (issues.length > 0) {
      throw new Error(
        `Invalid component contract for slider. Review element/property mapping.\n${issues.join('\n')}`
      );
    }
  }

  if (byName.switch !== undefined) {
    const issues = validateSwitchComponentContract(byName.switch, 'components.switch');
    if (issues.length > 0) {
      throw new Error(
        `Invalid component contract for switch. Review element/property mapping.\n${issues.join('\n')}`
      );
    }
  }

  if (byName.tabs !== undefined) {
    const issues = validateTabsComponentContract(byName.tabs, 'components.tabs');
    if (issues.length > 0) {
      throw new Error(
        `Invalid component contract for tabs. Review element/property mapping.\n${issues.join('\n')}`
      );
    }
  }

  if (byName.textField !== undefined) {
    const issues = validateTextFieldComponentContract(byName.textField, 'components.textField');
    if (issues.length > 0) {
      throw new Error(
        `Invalid component contract for textField. Review element/property mapping.\n${issues.join('\n')}`
      );
    }
  }
}
