import { describe, it, expect } from 'vitest';
import { classifyRepository } from '../src/repository/classifier.js';

describe('Repository Classifier', () => {
  it('should classify archived repository as archived', () => {
    const res = classifyRepository('/tmp/test', false, true);
    expect(res.type).toBe('archived');
  });

  it('should classify fork repository as fork', () => {
    const res = classifyRepository('/tmp/test', true, false);
    expect(res.type).toBe('fork');
  });

  it('should classify empty workspace as empty', () => {
    const res = classifyRepository('/non_existent_folder_path_xyz', false, false);
    expect(res.type).toBe('empty');
  });
});
