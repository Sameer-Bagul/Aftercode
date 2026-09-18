import AjvModule from 'ajv';
import addFormatsModule from 'ajv-formats';
import * as fs from 'fs';
const Ajv = AjvModule.default || AjvModule;
const addFormats = addFormatsModule.default || addFormatsModule;
export function createMetadataValidator(schemaPath) {
    const ajv = new Ajv({ allErrors: true, strict: false });
    addFormats(ajv);
    const rawSchema = fs.readFileSync(schemaPath, 'utf-8');
    const schema = JSON.parse(rawSchema);
    const validateFn = ajv.compile(schema);
    return function validate(data) {
        const valid = validateFn(data);
        if (!valid) {
            const errors = validateFn.errors?.map((err) => `${err.instancePath} ${err.message}`) || ['Unknown schema validation error'];
            return { valid: false, errors };
        }
        return { valid: true, errors: [] };
    };
}
