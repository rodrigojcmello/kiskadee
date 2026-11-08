import type { InspectionDataset, JsonValue } from '../src/model/inspection.ts';
import { extractInspectionModel, type InspectionTarget } from './extract.ts';

export interface InspectionConfiguration extends InspectionTarget {
  referenceAdapter?: () => unknown | Promise<unknown>;
  secondaryLabelField?: string;
}

/** The adapter is explicitly trusted local Node code; it is never sent to the browser. */
export async function prepareDataset(config: InspectionConfiguration): Promise<InspectionDataset> {
  const model = extractInspectionModel(config);
  const reference = config.referenceAdapter ? await config.referenceAdapter() : undefined;
  if (reference !== undefined) assertJsonValue(reference);
  return {
    model,
    ...(reference !== undefined ? { reference } : {}),
    ...(config.secondaryLabelField ? { secondaryLabelField: config.secondaryLabelField } : {})
  };
}

export function assertJsonValue(
  value: unknown,
  ancestors = new Set<object>()
): asserts value is JsonValue {
  if (value === null || typeof value === 'string' || typeof value === 'boolean') return;
  if (typeof value === 'number' && Number.isFinite(value)) return;
  if (typeof value !== 'object' || !value)
    throw new Error('The reference must contain only JSON values.');
  if (ancestors.has(value)) throw new Error('The JSON reference contains a circular value.');
  const prototype = Object.getPrototypeOf(value);
  if (!Array.isArray(value) && prototype !== Object.prototype && prototype !== null) {
    throw new Error('The JSON reference must contain plain objects.');
  }
  if (Object.getOwnPropertySymbols(value).length)
    throw new Error('The JSON reference contains symbol keys.');
  ancestors.add(value);
  for (const item of Array.isArray(value) ? value : Object.values(value))
    assertJsonValue(item, ancestors);
  ancestors.delete(value);
}
