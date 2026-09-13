import AjvModule from 'ajv';
import addFormatsModule from 'ajv-formats';
import * as fs from 'fs';

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

const Ajv = (AjvModule as any).default || AjvModule;
const addFormats = (addFormatsModule as any).default || addFormatsModule;

export function createMetadataValidator(schemaPath: string) {
  const ajv = new Ajv({ allErrors: true, strict: false });
  addFormats(ajv);

  const rawSchema = fs.readFileSync(schemaPath, 'utf-8');
  const schema = JSON.parse(rawSchema);
  const validateFn = ajv.compile(schema);

  return function validate(data: any): ValidationResult {
    const valid = validateFn(data);
    if (!valid) {
      const errors = validateFn.errors?.map((err: any) => `${err.instancePath} ${err.message}`) || ['Unknown schema validation error'];
      return { valid: false, errors };
    }
    return { valid: true, errors: [] };
  };
}
