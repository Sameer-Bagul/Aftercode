---
name: portfolio-metadata
description: Specialized execution skill for discovering, analyzing, classifying, synthesizing, validating, and indexing GitHub repositories into portfolio metadata JSON files.
---

# Portfolio Metadata SKILL Instructions

When processing a repository or updating portfolio metadata, follow these strict execution steps:

1. **Verify Evidence First**:
   - Inspect `package.json`, `Cargo.toml`, `requirements.txt`, `go.mod`, `Dockerfile`, `docker-compose.yml`, `prisma/schema.prisma`, and `README.md`.
   - Never infer technologies without evidence.

2. **Classification**:
   - Classify repository as `portfolio-worthy`, `secondary`, `practice`, `fork`, `archived`, or `empty`.
   - Set analysis depth accordingly.

3. **Safe Ingestion & Merging**:
   - Check if `output/metadata/<slug>.json` exists.
   - If `manuallyVerified: true`, lock human fields.
   - Preserve human-curated fields (`clientOrCompany`, `duration`, `clientTestimonial`, `metrics`, media links).

4. **Schema Compliance**:
   - Every file must pass validation against `schemas/project.schema.json`.
   - Ensure `_id`, `title`, `slug`, `category`, `status`, `role`, `githubUrl`, `techStackBreakdown`, `features`, `challenges`, `learnings`, `repository`, `classification`, and `metadata` are present.

5. **Sanitize Workspace**:
   - Wipe `workspace/current/` after completing each repository.
