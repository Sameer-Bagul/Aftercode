# Repository Classification Prompt Template

Classify the target repository into one of the following categories based strictly on evidence:

- `portfolio-worthy`: Production-level applications, rich features, complete architecture, high code volume, or significant complexity.
- `secondary`: Working utility, component library, or medium-complexity application.
- `practice`: Educational tutorial, sandbox experiment, algorithm practice, or small learning exercise.
- `fork`: Upstream repository fork with or without custom modifications.
- `archived`: Repository flagged as archived on GitHub.
- `empty`: 0 commits or 0 source files.
- `unknown`: Default fallback.

Criteria:
- Evaluate README depth, manifest files, Docker/IaC presence, and source code volume.
- Output JSON format: `{ "type": "<category>", "portfolioWorthiness": "high|medium|low" }`.
