import * as fs from 'fs';
import * as path from 'path';
import { createMetadataValidator } from '../dist/validation/schema-validator.js';

function main() {
  const schemaPath = path.resolve('schemas/project.schema.json');
  const metadataDir = path.resolve('output/metadata');

  if (!fs.existsSync(metadataDir)) {
    console.log(` ⚠️ Output directory ${metadataDir} does not exist yet.`);
    return;
  }

  const validator = createMetadataValidator(schemaPath);
  const files = fs.readdirSync(metadataDir).filter(f => f.endsWith('.json'));

  console.log(`\n🛡️ [Validate] Batch validating ${files.length} metadata files in ${metadataDir}...`);

  let validCount = 0;
  let invalidCount = 0;

  for (const file of files) {
    const filePath = path.join(metadataDir, file);
    try {
      const raw = fs.readFileSync(filePath, 'utf-8');
      const json = JSON.parse(raw);
      const res = validator(json);

      if (res.valid) {
        validCount++;
      } else {
        invalidCount++;
        console.error(` ❌ ${file} invalid: ${res.errors.join('; ')}`);
      }
    } catch (err) {
      invalidCount++;
      console.error(` ❌ ${file} failed parsing: ${err.message}`);
    }
  }

  console.log(`\n📊 Validation Results: ${validCount} Passed | ${invalidCount} Failed`);
  if (invalidCount > 0) {
    process.exit(1);
  }
}

main();
