# Portfolio Intelligence: End-to-End Master Implementation Plan

> **System Purpose**: Build a production-grade developer tool engine (`portfolio-intelligence`) in TypeScript & Node.js that automatically discovers, analyzes, classifies, generates metadata for, validates, and indexes all 122+ GitHub repositories owned by `Sameer-Bagul`, outputting strictly schema-compliant JSON files for the `Sameer-Bagul/project-metadata` output repository.

---

## 🔗 Official Documentation, Tools & Repository References

| Resource Name | URL / Link | Purpose / Description |
| :--- | :--- | :--- |
| **Target Output Repository** | [https://github.com/Sameer-Bagul/project-metadata](https://github.com/Sameer-Bagul/project-metadata) | Data repository holding generated JSON metadata files & indexes |
| **Engine Repository** | [https://github.com/Sameer-Bagul/portfolio-intelligence](https://github.com/Sameer-Bagul/portfolio-intelligence) | Processing engine CLI project codebase |
| **Official GitHub MCP Server** | [https://github.com/github/github-mcp-server](https://github.com/github/github-mcp-server) | Official GitHub MCP integration (Read-only OAuth/PAT) |
| **Official Git MCP Server** | [https://github.com/modelcontextprotocol/servers/tree/main/src/git](https://github.com/modelcontextprotocol/servers/tree/main/src/git) | Reference Git MCP server (Conditional deep history analysis) |
| **Official Filesystem MCP Server** | [https://github.com/modelcontextprotocol/servers/tree/main/src/filesystem](https://github.com/modelcontextprotocol/servers/tree/main/src/filesystem) | Controlled workspace file operations |
| **Official MCP Servers Repo** | [https://github.com/modelcontextprotocol/servers](https://github.com/modelcontextprotocol/servers) | Monorepo containing reference MCP implementations |
| **MCP Specification** | [https://github.com/modelcontextprotocol/modelcontextprotocol](https://github.com/modelcontextprotocol/modelcontextprotocol) | Core Model Context Protocol specifications |
| **Git MCP README & Security** | [https://github.com/modelcontextprotocol/servers/security](https://github.com/modelcontextprotocol/servers/security) | Security advisories & setup guidelines for Git MCP |
| **Antigravity MCP Docs** | [https://antigravity.google/docs/mcp/](https://antigravity.google/docs/mcp/) | Configuration & permissions for Antigravity MCP integration |
| **Antigravity CLI Reference** | [https://antigravity.google/docs/cli/reference/](https://antigravity.google/docs/cli/reference/) | CLI commands (`/mcp`, `/permissions`) |

---

## 🏗️ End-to-End System Architectures

### 1. Engine & Output Data Flow Architecture

```text
                           Sameer-Bagul GitHub Account
                                        │
                                        ▼
                  ┌───────────────────────────────────────────┐
                  │ Sameer-Bagul/portfolio-intelligence (Engine)│
                  └─────────────────────┬─────────────────────┘
                                        │
                    ┌───────────────────┼───────────────────┐
                    │                   │                   │
                    ▼                   ▼                   ▼
            Discovery Engine     Analyzer & Queue     Validation Engine
             (GitHub API/MCP)   (Isolated Clone &    (AJV & Business
                                 Evidence Extractor)    Rule Checking)
                    │                   │                   │
                    └───────────────────┼───────────────────┘
                                        │
                                        ▼
                  ┌───────────────────────────────────────────┐
                  │  Sameer-Bagul/project-metadata (Output)   │
                  │   output/metadata/<slug>.json (122 files) │
                  │   output/indexes/*.json                   │
                  └───────────────────────────────────────────┘
```

### 2. MCP Layer Architecture (Conditional Git MCP Strategy)

To minimize security surface and operational overhead, we start with **2 primary MCPs** (GitHub + Filesystem) and enable Git MCP conditionally if deep history diffing is required:

```text
                                  ANTIGRAVITY
                                       │
              ┌────────────────────────┴────────────────────────┐
              │                                                 │
              ▼                                                 ▼
       GitHub MCP Server                             Filesystem MCP Server
  (Read-Only Access via PAT/OAuth)                (Restricted to ./workspace & ./output)
              │                                                 │
              ▼                                                 ▼
       GitHub Repositories                             Local Processing Workspace
              │                                                 │
              └────────────────────────┬────────────────────────┘
                                       │
                                       ▼
                         Portfolio Intelligence Engine
                                       │
                       [If Deep Commit Diffs Needed]
                                       │
                                       ▼
                                 Git MCP Server
                          (Sandboxed to ./workspace/current)
```

### 3. Pipeline State Machine & Sequential Execution Flow

```text
┌──────────┐
│ DISCOVER │  Fetch 122+ repos from GitHub API -> Populate processing/repository-inventory.json
└────┬─────┘
     │
     ▼
┌──────────┐
│  QUEUE   │  Select next repo where status == 'pending' or status == 'failed'
└────┬─────┘
     │
     ▼
┌──────────┐
│ CLASSIFY │  Determine worthiness: portfolio-worthy | secondary | practice | fork | archived | empty
└────┬─────┘
     │
     ▼
┌──────────┐
│  CLONE   │  git clone --depth 1 target repo into sandboxed workspace/current/
└────┬─────┘
     │
     ▼
┌──────────┐
│ ANALYZE  │  Scan code structure, package manifests, Docker, configs, README & commits
└────┬─────┘
     │
     ▼
┌──────────────────┐
│ COLLECT EVIDENCE │ Extract technology breakdown, features, framework versions & links
└────┬─────────────┘
     │
     ▼
┌───────────────────┐
│ GENERATE METADATA │ Synthesize 30+ field project metadata payload
└────┬──────────────┘
     │
     ▼
┌──────────────────┐
│   SAFE MERGE     │ Read existing output/metadata/<slug>.json -> Lock & preserve human edits
└────┬─────────────┘
     │
     ▼
┌──────────────────┐
│    VALIDATE      │ Run AJV JSON Schema check + business rules (unique slug, valid URLs)
└────┬─────────────┘
     │
     ├─── PASS ──────────────────────────────────────────┐
     │                                                   │
     ▼                                                   ▼
┌──────────────────┐                            ┌──────────────────┐
│   MARK FAIL &    │                            │   MARK COMPLETE  │
│ LOG ERRORS.JSON  │                            └────────┬─────────┘
└────┬─────────────┘                                     │
     │                                                   ▼
     │                                          ┌──────────────────┐
     │                                          │  SAVE METADATA & │
     │                                          │  REBUILD INDEXES │
     │                                          └────────┬─────────┘
     │                                                   │
     └─────────────────────────┬─────────────────────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │ WIPE workspace/     │
                    │      current/       │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │ NEXT REPOSITORY IN  │
                    │      INVENTORY      │
                    └─────────────────────┘
```

### 4. Future RAG Architecture (Post-V1 Expansion)

```text
                  ┌───────────────────────────────────────────┐
                  │  Sameer-Bagul/project-metadata (Output)   │
                  │   122 Clean Schema-Compliant JSON Files   │
                  └─────────────────────┬─────────────────────┘
                                        │
                                        ▼
                  ┌───────────────────────────────────────────┐
                  │               portfolio-rag               │
                  │      (Vector Embedding & Ingestion)       │
                  └─────────────────────┬─────────────────────┘
                                        │
                                        ▼
                  ┌───────────────────────────────────────────┐
                  │            Natural Language Q&A           │
                  │ - "Which repos use Next.js + PostgreSQL?" │
                  │ - "Which repos demonstrate AI/ML?"        │
                  │ - "Which repos match Job Description X?"  │
                  └───────────────────────────────────────────┘
```

---

## 🛠️ MCP Configuration & Credentials Specification

### 1. Workspace Configuration File: `.agents/mcp_config.json`

```json
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "${GITHUB_TOKEN}"
      }
    },
    "filesystem": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-filesystem",
        "./workspace",
        "./output",
        "./processing"
      ]
    },
    "git": {
      "command": "uvx",
      "args": ["mcp-server-git", "--repository", "./workspace/current"]
    }
  }
}
```

### 2. GitHub Authentication Strategy Order
1. **First Preference**: GitHub MCP Store / OAuth authentication.
2. **Second Preference**: Fine-grained GitHub Personal Access Token (PAT).
   - **Repository Scope**: Restricted strictly to repositories owned by `Sameer-Bagul`.
   - **Permissions**: `Metadata: Read`, `Contents: Read`.
   - **Write Safety**: `Contents: Write` is **NOT** granted during processing.

---

## 📂 Project Directory Structure

```text
portfolio-intelligence/
├── README.md                           # Operational documentation & usage guide
├── AGENTS.md                           # AI Agent behavior rules & zero-hallucination policies
├── END_TO_END_PLAN.md                  # Master technical implementation roadmap
├── package.json                        # Node.js dependencies & scripts
├── tsconfig.json                       # Strict TypeScript configuration
├── .gitignore                          # Ignores workspace/current/, node_modules, secrets
├── .env.example                        # GITHUB_TOKEN & configuration keys
│
├── .agents/
│   ├── mcp_config.json                 # Workspace MCP declarations (GitHub, Filesystem, Git)
│   └── skills/
│       └── portfolio-metadata/
│           └── SKILL.md                # Specialized execution skill for repository processing
│
├── schemas/
│   ├── project.schema.json             # Core Portfolio Project metadata JSON Schema (30+ fields)
│   ├── repository-analysis.schema.json # Internal evidence & analysis payload schema
│   └── processing-status.schema.json   # Repository inventory & progress tracking schema
│
├── prompts/
│   ├── repository-classification.md    # System prompt for classification engine
│   ├── repository-analysis.md          # System prompt for deep codebase extraction
│   ├── metadata-generation.md          # System prompt for schema mapping
│   ├── metadata-review.md              # Quality audit prompt template
│   └── metadata-merge.md               # Prompt rules for merging new vs existing metadata
│
├── src/
│   ├── github/
│   │   ├── discover-repositories.ts   # GitHub API fetcher & inventory generator
│   │   └── github-types.ts            # GitHub API response types
│   │
│   ├── repository/
│   │   ├── classifier.ts              # Classification logic & depth selector
│   │   ├── analyzer.ts                # Codebase scanner & tech stack detector
│   │   ├── workspace-manager.ts       # Git clone & isolated cleanup manager
│   │   └── evidence-collector.ts      # Multi-file evidence extractor (manifests, docs, commits)
│   │
│   ├── metadata/
│   │   ├── generator.ts               # Raw analysis to project schema mapper
│   │   ├── merger.ts                  # Safe merge logic protecting human-edited fields
│   │   └── normalizer.ts              # Data sanitization (slug formatting, array deduplication)
│   │
│   ├── validation/
│   │   ├── schema-validator.ts        # AJV-backed JSON Schema validator
│   │   └── business-rules.ts          # Custom integrity rules (unique slug, valid URLs)
│   │
│   ├── processing/
│   │   ├── queue.ts                   # Sequential queue controller
│   │   ├── status.ts                  # State updates & inventory persistence
│   │   └── runner.ts                  # Main execution loop driver
│   │
│   └── index.ts                       # Engine entrypoint CLI
│
├── scripts/
│   ├── discover.mjs                   # Fetch all repos & generate processing/repository-inventory.json
│   ├── process-one.mjs                # Test runner for a single repository
│   ├── process-all.mjs                # Full batch execution runner
│   ├── resume.mjs                     # Resumes interrupted execution from last status
│   ├── validate.mjs                   # Batch validation command for output/metadata/*.json
│   ├── rebuild-indexes.mjs            # Re-generates all index files in output/indexes/
│   └── cleanup.mjs                    # Emergency wipe of workspace/current/
│
├── processing/
│   ├── repository-inventory.json      # Master status tracker (122 entries)
│   ├── processing-status.json         # Real-time telemetry summary
│   └── errors.json                    # Detailed log of processing/validation failures
│
├── workspace/
│   └── current/                       # Temporary clone sandbox (strictly cleaned per repo)
│
├── output/
│   ├── metadata/                      # Generated project metadata JSON files (<slug>.json)
│   ├── indexes/                       # auto-generated index files (all-projects, featured, etc.)
│   └── reports/                       # Summary metrics & validation reports
│
└── tests/
    ├── classifier.test.ts             # Unit tests for repo classification
    ├── analyzer.test.ts               # Unit tests for evidence extraction
    ├── metadata.test.ts               # Unit tests for safe merging & normalization
    └── validation.test.ts             # Integration tests for schema compliance
```

---

## 📊 Comprehensive Metadata Schema Definition

Every metadata JSON file in `output/metadata/<slug>.json` must conform strictly to `schemas/project.schema.json`.

### 1. Schema Structure & Field Breakdown

| Field Name | Type | Description / Constraints | Fallback / Default |
| :--- | :--- | :--- | :--- |
| `_id` | `string` | Unique identifier (e.g. `repo-slug-id`) | Generated from slug |
| `title` | `string` | Human-readable project title | Repo name formatted |
| `slug` | `string` | URL-safe slug (Kebab-case) | Lowercase kebab-case |
| `shortDescription` | `string` | 1-2 sentence overview (max 160 chars) | Extracted or GitHub desc |
| `description` | `string` | In-depth description of architecture & purpose | Generated from README/code |
| `category` | `string` | Main category enum (Web App, AI/ML, CLI Tool, Mobile App, API Service, Library, System, Practice) | Classified category |
| `isFeatured` | `boolean` | Flag for portfolio spotlight | `true` if High worthiness else `false` |
| `status` | `string` | Enum: `Completed`, `In Progress`, `Archived`, `Maintenance`, `Prototype` | Repo status |
| `role` | `string` | Creator role (e.g. `Lead Developer`, `Sole Developer`, `Contributor`) | `Sole Developer` |
| `clientOrCompany` | `string \| null` | Client or company context (Manual override priority) | `null` |
| `duration` | `string \| null` | Development timeframe (e.g., `3 weeks`, `2 months`) | Extracted from Git history |
| `targetAudience` | `string \| null` | Intended users/audience | Extracted or `null` |
| `techStackBreakdown` | `object` | Categorized technology breakdown | Empty arrays per category |
| `myContributions` | `array` | Key technical accomplishments / deliverables | Extracted array |
| `image` | `string \| null` | Primary preview image URL / path | `null` |
| `gallery` | `array` | Additional visual media assets | `[]` |
| `architectureDiagram`| `string \| null` | Path/URL to architecture diagram | `null` |
| `liveUrl` | `string \| null` | Production deployment URL | Extracted homepage/README link |
| `githubUrl` | `string` | Full GitHub repository URL | Verified repo URL |
| `apiDocsUrl` | `string \| null` | Link to API documentation / OpenAPI | `null` |
| `figmaUrl` | `string \| null` | Link to design assets | `null` |
| `videoUrl` | `string \| null` | Link to video demo | `null` |
| `contributors` | `array` | List of contributors extracted from Git | Repos owner + Git committers |
| `features` | `array` | Major features supported by code evidence | Extracted list |
| `challenges` | `array` | Technical hurdles & engineering trade-offs | Extracted list |
| `learnings` | `array` | Key technical learnings & takeaways | Extracted list |
| `metrics` | `object \| null` | Performance / quantitative benchmark data | `null` (No fake metrics!) |
| `clientTestimonial` | `object \| null` | Testimonial quote & attribution | `null` (Preserved if manual) |
| `relatedBlogs` | `array` | Links to writeups or articles | `[]` |
| `futureRoadmap` | `array` | Planned enhancements / TODO items | Extracted from TODOs/README |
| `repository` | `object` | Raw repo metadata (`owner`, `name`, `url`, `visibility`, `fork`) | GitHub metadata |
| `classification` | `object` | Analysis depth (`type`, `portfolioWorthiness`) | Classification output |
| `metadata` | `object` | Processing details (`generatedAt`, `lastAnalyzedAt`, `sourceCommit`, `manuallyVerified`) | System timestamps |

### 2. Tech Stack Categorization Structure
```json
{
  "techStackBreakdown": {
    "frontend": ["React", "TypeScript", "TailwindCSS"],
    "backend": ["Node.js", "Express"],
    "database": ["PostgreSQL", "Prisma"],
    "aiMl": ["OpenAI API", "LangChain"],
    "infrastructure": ["Docker", "Vercel"],
    "devops": ["GitHub Actions"],
    "testing": ["Vitest", "Playwright"],
    "tools": ["ESLint", "Prettier"],
    "other": []
  }
}
```

---

## 🎯 Repository Classification & Analysis Depth Strategy

Every repository undergoes automated classification before analysis.

```text
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                               CLASSIFICATION MATRIX                                     │
├───────────────────┬─────────────────────────────┬───────────────────────────────────────┤
│ Type              │ Worthiness Criteria         │ Analysis Depth                        │
├───────────────────┼─────────────────────────────┼───────────────────────────────────────┤
│ portfolio-worthy │ High code volume, complete  │ Deep: README, manifests, full source, │
│                   │ features, architecture docs │ APIs, DB schema, Git commit history,  │
│                   │ deployment configs, AI/ML   │ features, challenges, learnings       │
├───────────────────┼─────────────────────────────┼───────────────────────────────────────┤
│ secondary         │ Working project, moderate   │ Medium: README, package manifests,    │
│                   │ code volume, basic tests    │ source structure, basic Git history   │
├───────────────────┼─────────────────────────────┼───────────────────────────────────────┤
│ practice          │ Small tutorial/sandbox,     │ Light: README, dependencies, languages│
│                   │ learning exercises          │ top-level file tree                   │
├───────────────────┼─────────────────────────────┼───────────────────────────────────────┤
│ fork              │ Forked upstream repo        │ Minimal + Diff: Fork status, upstream │
│                   │                             │ info, custom changes if any           │
├───────────────────┼─────────────────────────────┼───────────────────────────────────────┤
│ archived          │ GitHub Archived flag        │ Archive metadata + Light analysis     │
├───────────────────┼─────────────────────────────┼───────────────────────────────────────┤
│ empty             │ 0 commits or 0 source files │ Minimal: GitHub metadata, blank JSON  │
└───────────────────┴─────────────────────────────┴───────────────────────────────────────┘
```

---

## 🛡️ Anti-Hallucination & Safe Metadata Merge Rules

### 1. Evidence-First Verification Matrix
- **Technologies**: Require manifest match (e.g., `package.json`, `Cargo.toml`, `requirements.txt`, `go.mod`, `pom.xml`, `build.gradle`), import statements, or config files (`prisma/schema.prisma`, `docker-compose.yml`).
- **Deployments**: Require config evidence (`vercel.json`, `netlify.toml`, `Dockerfile`, `.github/workflows/deploy.yml`, `fly.toml`, `kubernetes/`).
- **Database**: Require ORM/client dependency or schema file evidence.
- **Metrics / Testimonials / Client Context**: **STRICTLY PROHIBITED** from AI generation. Set to `null` unless pre-existing in human-curated JSON or documented in explicit evidence files.

### 2. Deterministic Safe Merge Algorithm
When processing a repository whose output file `output/metadata/<slug>.json` already exists:

```typescript
function safeMergeMetadata(existing: Metadata, generated: Metadata): Metadata {
  if (existing.metadata?.manuallyVerified) {
    // Lock human-verified fields completely
    return {
      ...generated,
      ...existing, // Preserve existing human edits
      metadata: {
        ...generated.metadata,
        lastAnalyzedAt: new Date().toISOString(),
        manuallyVerified: true,
      }
    };
  }

  // Selective merge for non-manually verified existing files
  return {
    ...generated,
    // Preserve high-value human metadata fields if present in existing
    clientOrCompany: existing.clientOrCompany ?? generated.clientOrCompany,
    duration: existing.duration ?? generated.duration,
    targetAudience: existing.targetAudience ?? generated.targetAudience,
    clientTestimonial: existing.clientTestimonial ?? generated.clientTestimonial,
    metrics: existing.metrics ?? generated.metrics,
    image: existing.image ?? generated.image,
    gallery: (existing.gallery && existing.gallery.length > 0) ? existing.gallery : generated.gallery,
    architectureDiagram: existing.architectureDiagram ?? generated.architectureDiagram,
    // Merge contributions & learnings without duplicate entries
    myContributions: Array.from(new Set([...(existing.myContributions || []), ...(generated.myContributions || [])])),
  };
}
```

---

## 📝 Prompt Templates Specification (`prompts/`)

1. **`prompts/repository-classification.md`**:
   - System prompt for classifying repository worthiness (`portfolio-worthy` | `secondary` | `practice` | `fork` | `archived` | `empty`) based on file tree size, manifest technologies, and commit stats.
2. **`prompts/repository-analysis.md`**:
   - Instruction set for deep scanning source code, detecting framework imports, database entities, API routes, and deployment manifests.
3. **`prompts/metadata-generation.md`**:
   - Prompt instructing the LLM engine to synthesize analysis evidence into schema-compliant JSON format matching `schemas/project.schema.json`.
4. **`prompts/metadata-review.md`**:
   - Quality audit prompt that inspects generated JSON to ensure zero hallucination, proper fallback usage (`null`, `[]`, `"Unknown"`), and URL validity.
5. **`prompts/metadata-merge.md`**:
   - Precise instructions for identifying human-curated fields in pre-existing metadata files and preserving them during updates.

---

## 📋 Master Prompt for Antigravity Session Execution

Below is the complete, self-contained **Master Prompt** to be copied and pasted into a new Antigravity session to initiate engine development:

```text
# Build: Portfolio Intelligence Engine

You are setting up a new production-quality developer tool called `portfolio-intelligence`.

The purpose of this project is to analyze every GitHub repository owned by `Sameer-Bagul` and generate exactly one detailed portfolio metadata JSON file per repository.

The project must be designed to process repositories sequentially, resume after interruption, preserve manually entered metadata, validate every generated JSON file, and safely clean up temporary repository clones.

Do NOT build a RAG system in V1.
Do NOT build a vector database in V1.
Do NOT build a web dashboard in V1.
Do NOT create a custom MCP server unless an actual capability gap is discovered after the existing MCPs are configured and tested.

## 1. MCP Setup & Config
Configure GitHub MCP (read-only PAT/OAuth) and Filesystem MCP (sandboxed to ./workspace, ./output, ./processing).
Configure `.agents/mcp_config.json`.

## 2. Directory & Boilerplate
Initialize Node.js + TypeScript project structure with AJV, Vitest, and ESLint.
Create schemas/project.schema.json, prompts/, src/, scripts/, processing/, workspace/, output/.

## 3. Strict 1:1 Requirement
Every GitHub repo discovered MUST receive exactly 1 metadata JSON file. 122 Repos = 122 Files.

## 4. Evidence-First & Safe Merge
NEVER invent metrics, testimonials, or unsupported technologies.
Always perform safe merge with existing output/metadata/<slug>.json to preserve human edits.

## 5. Execution Pipeline & Proof of Concept
Build sequential queue with resume capability (`npm run resume`).
Run Test 1 on 1 repository to prove: clone -> analyze -> synthesize -> merge -> validate -> cleanup workspace.
```

---

## ⚙️ Step-by-Step Implementation Roadmap

### Phase 1: Project Setup & Core Schemas
- Initialize `portfolio-intelligence` repo & TypeScript configuration.
- Write `schemas/project.schema.json`, `repository-analysis.schema.json`, `processing-status.schema.json`.
- Configure `.agents/mcp_config.json` with GitHub & Filesystem MCPs.
- Create prompt templates in `prompts/`.
- Write `AGENTS.md` and `README.md`.

### Phase 2: Core Modules & Discovery Script
- Implement `src/github/discover-repositories.ts` to list all 122+ repos for `Sameer-Bagul`.
- Generate `processing/repository-inventory.json`.
- Implement `src/repository/workspace-manager.ts` for safe git cloning & directory sanitization.
- Implement `src/repository/classifier.ts` and `evidence-collector.ts`.
- Implement `src/metadata/generator.ts`, `merger.ts`, and `normalizer.ts`.
- Implement `src/validation/schema-validator.ts` using AJV.

### Phase 3: CLI Scripts & Utility Runners
- Implement `scripts/discover.mjs`.
- Implement `scripts/process-one.mjs` (single repo test runner).
- Implement `scripts/process-all.mjs` & `scripts/resume.mjs`.
- Implement `scripts/validate.mjs` & `scripts/rebuild-indexes.mjs`.
- Implement `scripts/cleanup.mjs`.

### Phase 4: Phased Verification & Testing Strategy
- **Test 1 (1 Repo POC)**:
  - Run `node scripts/process-one.mjs <test-repo-slug>`.
  - Inspect output JSON in `output/metadata/<test-repo-slug>.json`.
  - Verify schema validation, output quality, and workspace cleanup.
- **Test 2 (5 Repos Batch)**:
  - Process 5 diverse repos (1 portfolio-worthy, 1 secondary, 1 practice, 1 fork, 1 empty).
  - Test interruption and `npm run resume`.
- **Test 3 (20 Repos Batch)**:
  - Scalability, memory performance, error handling, and index generation test.
- **Test 4 (122+ Full Production Run)**:
  - Process full inventory of repositories.
  - Verify success criteria (122 discovered = 122 metadata files, 0 schema errors, 0 orphaned temp files).

---

## 🔍 Index Generation & Report Specification

### 1. Automatic Index Outputs (`output/indexes/`)
- `all-projects.json`: Array of all 122 project summaries (`slug`, `title`, `shortDescription`, `category`, `isFeatured`, `techStackBreakdown`, `githubUrl`).
- `featured-projects.json`: Filtered array of `isFeatured: true` projects.
- `technologies.json`: Master list of all unique technologies across all projects with usage counts.
- `categories.json`: Grouping of projects by category.

### 2. Telemetry & Summary Report (`output/reports/summary.json`)
```json
{
  "totalRepositoriesDiscovered": 122,
  "metadataFilesGenerated": 122,
  "completedCount": 122,
  "failedCount": 0,
  "classificationBreakdown": {
    "portfolioWorthy": 25,
    "secondary": 35,
    "practice": 40,
    "fork": 12,
    "archived": 8,
    "empty": 2
  },
  "validationSummary": {
    "totalValidated": 122,
    "passed": 122,
    "failed": 0
  },
  "cleanedWorkspace": true,
  "executionTimeSeconds": 480
}
```

---

## ✅ Final Success Criteria & Quality Gate Checklist

- [ ] **122 / 122 Metadata Files**: Every single discovered repository has an individual `<slug>.json` file in `output/metadata/`.
- [ ] **100% Schema Validation**: Every file passes AJV validation against `schemas/project.schema.json`.
- [ ] **Zero Fabricated Claims**: No fake metrics, revenue, testimonials, or unsupported tech stack claims.
- [ ] **Preserved Human Metadata**: Pre-existing human edits and manual tags remain intact after processing.
- [ ] **Resumability Verified**: `npm run resume` accurately skips completed repos and picks up pending ones.
- [ ] **Clean Workspace Guarantee**: `workspace/current/` is completely empty upon completion of every repo processing step.
- [ ] **Indexes Up to Date**: All four JSON index files in `output/indexes/` are fully compiled and synchronized.
