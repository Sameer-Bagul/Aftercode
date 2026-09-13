# Metadata Generation Prompt Template

Map the extracted repository analysis payload into full portfolio project metadata conforming to `schemas/project.schema.json`.

Required Fields:
- `_id`: Format `${slug}-id`
- `title`: Formatted human-readable name
- `slug`: Lowercase kebab-case string
- `category`: Web App | AI/ML | CLI Tool | Mobile App | API Service | Library | System | Practice
- `techStackBreakdown`: Group into `frontend`, `backend`, `database`, `aiMl`, `infrastructure`, `devops`, `testing`, `tools`, `other`.
- `myContributions`: Technical accomplishments supported by code evidence.
- `features`, `challenges`, `learnings`: Lists derived strictly from code analysis.

Strict Fallbacks:
- `clientOrCompany`, `duration`, `targetAudience`, `image`, `architectureDiagram`, `apiDocsUrl`, `figmaUrl`, `videoUrl`, `metrics`, `clientTestimonial`: Default to `null` if unverified.
- `gallery`, `relatedBlogs`, `futureRoadmap`: Default to `[]` if unverified.
