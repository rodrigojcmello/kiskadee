import { validateButtonComponentContract } from '../components/button';
import { validateTabsComponentContract } from '../components/tabs.zod';
import { validateTextFieldComponentContract } from '../components/text-field.zod';

/**
 * Build-time validation for component contracts with strict, element-aware rules.
 *
 * Incremental scope:
 * - button
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
