import { validateSchemaComponentContracts, validateSchemaPresenceContract } from '@kiskadee/core';
import { validateSchemaContoursContract } from '@kiskadee/core/contour-contract';
import { validateSchemaForegroundsContract } from '@kiskadee/core/foreground-contract';
import { validateSchemaIconSizesContract } from '@kiskadee/core/icon-size-contract';
import { validateSchemaSeparatorsContract } from '@kiskadee/core/separator-contract';
import { describe, expect, it } from 'vitest';
import { schemas } from './test-schemas.ts';

const validators = {
  components: validateSchemaComponentContracts,
  icons: validateSchemaIconSizesContract,
  foregrounds: validateSchemaForegroundsContract,
  contours: validateSchemaContoursContract,
  separators: validateSchemaSeparatorsContract,
  presence: validateSchemaPresenceContract
};

describe.each(schemas)('$prefix schema contracts', (schema) => {
  it.each(Object.entries(validators))('%s respects the shared contract', (_name, validate) => {
    expect(() => validate(schema)).not.toThrow();
  });
});
