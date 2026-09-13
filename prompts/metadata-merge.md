# Safe Metadata Merge Rules Prompt Template

When merging newly generated metadata with pre-existing `output/metadata/<slug>.json`:

1. **Human Override Lock**:
   - If `existing.metadata.manuallyVerified === true`, lock the file completely. Update only `metadata.lastAnalyzedAt`.

2. **Selective Attribute Protection**:
   - Keep existing `clientOrCompany` if present.
   - Keep existing `duration` if present.
   - Keep existing `clientTestimonial` and `metrics` if present.
   - Keep existing `image`, `gallery`, and `architectureDiagram` if present.
   - Merge `myContributions`, `features`, and `learnings` arrays without duplicate entries.

3. **Timestamp Update**:
   - Update `metadata.lastAnalyzedAt` to current ISO timestamp.
