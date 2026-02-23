import { validateButtonComponentContract } from '../components/button';
import { validateTabsComponentContract } from '../components/tabs';

/**
 * Runtime validation for component contracts with strict, element-aware rules.
 *
 * Incremental scope:
 * - button
 * - tabs
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
}
