import { describe, it, expect } from 'vitest';
import { normalizeSlug, deduplicateArray } from '../src/metadata/normalizer.js';

describe('Data Normalizer', () => {
  it('should format repository names into clean kebab-case slugs', () => {
    expect(normalizeSlug('My_Awesome Repo')).toBe('my-awesome-repo');
    expect(normalizeSlug('  --Repo-Name-- ')).toBe('repo-name');
    expect(normalizeSlug('Project_CMS-123')).toBe('project-cms-123');
  });

  it('should deduplicate arrays cleanly', () => {
    expect(deduplicateArray(['React', 'Node', 'React', 'TS'])).toEqual(['React', 'Node', 'TS']);
  });
});
