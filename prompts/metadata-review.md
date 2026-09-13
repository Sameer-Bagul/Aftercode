# Metadata Quality Audit & Anti-Hallucination Prompt Template

Perform a strict quality audit on the generated project metadata JSON:

1. **Schema Check**: Ensure all required properties match `schemas/project.schema.json`.
2. **Zero-Hallucination Verification**:
   - Verify every technology in `techStackBreakdown` is backed by repo evidence.
   - Confirm no fake metrics, user numbers, or client testimonials were inserted.
3. **URL Validation**: Verify `githubUrl` matches the exact target repository URL.
4. **Fallback Audit**: Ensure non-existent fields are set to `null` or `[]` rather than omitted or hallucinated.
