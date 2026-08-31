import { validateBadgeComponentContract } from '../components/badge.ts';
import { validateBottomSheetComponentContract } from '../components/bottom-sheet.ts';
import { validateButtonComponentContract } from '../components/button.ts';
import { validateCardComponentContract } from '../components/card.ts';
import { validateChipComponentContract } from '../components/chip.ts';
import { validateDropdownComponentContract } from '../components/dropdown.ts';
import { validateIconComponentContract } from '../components/icon.ts';
import { validateProgressComponentContract } from '../components/progress.ts';
import { validateSeparatorComponentContract } from '../components/separator.ts';
import { validateSliderComponentContract } from '../components/slider.zod.ts';
import { validateSwitchComponentContract } from '../components/switch.zod.ts';
import { validateTabsComponentContract } from '../components/tabs.zod.ts';
import { validateTextComponentContract } from '../components/text.ts';
import { validateTextFieldComponentContract } from '../components/text-field.zod.ts';

/**
 * Build-time validation for component contracts with strict, element-aware rules.
 *
 * Incremental scope:
 * - bottomSheet
 * - button
 * - card
 * - dropdown
 * - icon
 * - progress
 * - separator
 * - slider
 * - switch
 * - tabs
 * - text
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

  if (byName.badge !== undefined) {
    const issues = validateBadgeComponentContract(byName.badge, 'components.badge');
    if (issues.length > 0) {
      throw new Error(
        `Invalid component contract for badge. Review element/property mapping.\n${issues.join('\n')}`
      );
    }
  }

  if (byName.bottomSheet !== undefined) {
    const issues = validateBottomSheetComponentContract(
      byName.bottomSheet,
      'components.bottomSheet'
    );
    if (issues.length > 0) {
      throw new Error(
        `Invalid component contract for bottomSheet. Review element/property mapping.\n${issues.join('\n')}`
      );
    }
  }

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

  if (byName.chip !== undefined) {
    const issues = validateChipComponentContract(byName.chip, 'components.chip');
    if (issues.length > 0) {
      throw new Error(
        `Invalid component contract for chip. Review element/property mapping.\n${issues.join('\n')}`
      );
    }
  }

  if (byName.dropdown !== undefined) {
    const issues = validateDropdownComponentContract(byName.dropdown, 'components.dropdown');
    if (issues.length > 0) {
      throw new Error(
        `Invalid component contract for dropdown. Review element/property mapping.\n${issues.join('\n')}`
      );
    }
  }

  if (byName.icon !== undefined) {
    const issues = validateIconComponentContract(byName.icon, 'components.icon');
    if (issues.length > 0) {
      throw new Error(
        `Invalid component contract for icon. Review element/property mapping.\n${issues.join('\n')}`
      );
    }
  }

  if (byName.progress !== undefined) {
    const issues = validateProgressComponentContract(byName.progress, 'components.progress');
    if (issues.length > 0) {
      throw new Error(
        `Invalid component contract for progress. Review element/property mapping.\n${issues.join('\n')}`
      );
    }
  }

  if (byName.separator !== undefined) {
    const issues = validateSeparatorComponentContract(byName.separator, 'components.separator');
    if (issues.length > 0) {
      throw new Error(
        `Invalid component contract for separator. Review element/property mapping.\n${issues.join('\n')}`
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

  if (byName.text !== undefined) {
    const issues = validateTextComponentContract(byName.text, 'components.text');
    if (issues.length > 0) {
      throw new Error(
        `Invalid component contract for text. Review element/property mapping.\n${issues.join('\n')}`
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
