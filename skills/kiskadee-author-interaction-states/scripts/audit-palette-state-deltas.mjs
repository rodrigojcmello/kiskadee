import { readFile } from 'node:fs/promises';

const STATE_NAMES = new Set(['disabled', 'filled', 'focus', 'hover', 'pressed', 'readOnly']);

const [schemaPath, componentName, stateName = 'focus'] = process.argv.slice(2);

if (!schemaPath || !componentName || !STATE_NAMES.has(stateName)) {
  console.error(
    'Usage: node audit-palette-state-deltas.mjs <schema-json> <component> ' +
      '<disabled|filled|focus|hover|pressed|readOnly>'
  );
  process.exit(2);
}

const schema = JSON.parse(await readFile(schemaPath, 'utf8'));
const component = schema.components?.[componentName];

if (!component) {
  console.error(`Component "${componentName}" was not found in ${schemaPath}.`);
  process.exit(2);
}

const duplicatePaths = [];

function hasOwn(value, key) {
  return Object.hasOwn(value, key);
}

function isObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function isEqual(left, right) {
  return JSON.stringify(left) === JSON.stringify(right);
}

function visit(value, path, insidePalettes = false) {
  if (!isObject(value)) {
    return;
  }

  if (
    insidePalettes &&
    hasOwn(value, 'rest') &&
    hasOwn(value, stateName) &&
    isEqual(value.rest, value[stateName])
  ) {
    duplicatePaths.push(path.join('.'));
  }

  for (const [key, child] of Object.entries(value)) {
    visit(child, [...path, key], insidePalettes || key === 'palettes');
  }
}

visit(component, ['components', componentName]);

if (duplicatePaths.length > 0) {
  console.error(
    `Found ${duplicatePaths.length} ${stateName} value(s) equal to Rest in ${componentName}:`
  );

  for (const path of duplicatePaths) {
    console.error(`- ${path}`);
  }

  console.error(
    'Remove each redundant state or document why it intentionally resets another active state.'
  );
  process.exit(1);
}

console.log(`No ${stateName} palette values equal to Rest were found in ${componentName}.`);
