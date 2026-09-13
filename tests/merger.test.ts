import { describe, it, expect } from 'vitest';
import { safeMergeMetadata } from '../src/metadata/merger.js';

describe('Safe Metadata Merger', () => {
  it('should lock human verified metadata completely', () => {
    const existing = {
      title: 'Human Edited Title',
      metadata: { manuallyVerified: true },
    };
    const generated = {
      title: 'AI Generated Title',
      metadata: { manuallyVerified: false },
    };

    const res = safeMergeMetadata(existing, generated);
    expect(res.title).toBe('Human Edited Title');
    expect(res.metadata.manuallyVerified).toBe(true);
  });

  it('should preserve human fields like clientOrCompany and clientTestimonial when not manually verified', () => {
    const existing = {
      clientOrCompany: 'Acme Corp',
      clientTestimonial: { quote: 'Great work!' },
    };
    const generated = {
      clientOrCompany: null,
      clientTestimonial: null,
    };

    const res = safeMergeMetadata(existing, generated);
    expect(res.clientOrCompany).toBe('Acme Corp');
    expect(res.clientTestimonial).toEqual({ quote: 'Great work!' });
  });
});
