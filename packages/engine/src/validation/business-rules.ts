import { ValidationResult } from './schema-validator.js';

export function validateBusinessRules(metadata: any, existingSlugs: Set<string>): ValidationResult {
  const errors: string[] = [];

  if (!metadata.slug || typeof metadata.slug !== 'string') {
    errors.push('Missing or invalid slug');
  } else if (existingSlugs.has(metadata.slug)) {
    errors.push(`Duplicate slug detected: '${metadata.slug}'`);
  }

  if (!metadata.githubUrl || !metadata.githubUrl.startsWith('http')) {
    errors.push(`Invalid githubUrl: '${metadata.githubUrl}'`);
  }

  if (!metadata.title || metadata.title.trim().length === 0) {
    errors.push('Title cannot be empty');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
