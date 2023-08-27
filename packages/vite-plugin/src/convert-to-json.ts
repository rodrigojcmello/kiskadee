// eslint-disable-next-line import/no-extraneous-dependencies
import prettier from 'prettier';
import fs from 'node:fs';
import { sandbox } from './tmp/sandbox';

async function convertToJson() {
  const jsonContent = JSON.stringify(sandbox);
  const formattedJson = await prettier.format(jsonContent, { parser: 'json' });

  fs.writeFileSync('schema.json', formattedJson, 'utf8');

  console.log('JSON object converted and formatted successfully.');
}

// eslint-disable-next-line unicorn/prefer-top-level-await
void convertToJson();
