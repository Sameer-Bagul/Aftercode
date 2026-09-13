# Portfolio Intelligence: Implementation TODO & Phase Roadmap

> **Project Goal**: Build `portfolio-intelligence` — a developer engine in TypeScript & Node.js connected to Antigravity AI IDE via MCPs to discover, analyze, classify, synthesize, validate, and index all 122+ GitHub repositories of `Sameer-Bagul`.

---

## 🔌 Phase 0: MCP & AI IDE Integration Setup

- [x] **Configure Workspace MCPs (`.agents/mcp_config.json`)**
  - [x] Configure **GitHub MCP Server** (Read-Only via PAT/OAuth for repo discovery and file reading)
  - [x] Configure **Filesystem MCP Server** (Sandboxed to `./workspace`, `./output`, `./processing`)
  - [x] Configure **Git MCP Server** (Conditional deep commit/branch history tool)
- [x] **Verify Antigravity MCP Connection**
  - [x] Run `/mcp` in Antigravity CLI to verify server connectivity and registered tools
  - [x] Run `/permissions` to audit tool scopes (`read-only` for GitHub, restricted filesystem boundaries)
- [x] **Environment Setup**
  - [x] Create `.env.example` defining `GITHUB_TOKEN` and configuration flags
  - [x] Ensure `.env` is listed in `.gitignore` to prevent credential leaks

---

## 🏗️ Phase 1: Project Skeleton & Configuration

- [x] **Initialize Node.js & TypeScript Project**
  - [x] Create `package.json` with scripts (`discover`, `process-one`, `process-all`, `resume`, `validate`, `rebuild-indexes`, `cleanup`)
  - [x] Configure `tsconfig.json` with strict mode and NodeNext module resolution
  - [x] Set up ESLint & Prettier
  - [x] Install dependencies (`ajv`, `ajv-formats`, `execa`, `glob`, `vitest`, `@types/node`)
- [x] **Create Directory Structure**
  - [x] `schemas/`
  - [x] `prompts/`
  - [x] `src/github/`, `src/repository/`, `src/metadata/`, `src/validation/`, `src/processing/`
  - [x] `scripts/`
  - [x] `processing/`
  - [x] `workspace/current/`
  - [x] `output/metadata/`, `output/indexes/`, `output/reports/`
  - [x] `tests/`
- [x] **Create Root Guidance Documents**
  - [x] Write `AGENTS.md` (AI Agent behavior rules, zero-hallucination policy, evidence-first rules)
  - [x] Write `README.md` (System overview, installation, CLI usage, MCP integration guide)
  - [x] Write `.agents/skills/portfolio-metadata/SKILL.md` (Specialized workflow instructions for repository processing)

---

## 📜 Phase 2: JSON Schemas & System Prompts

- [x] **Author JSON Schemas (`schemas/`)**
  - [x] `schemas/project.schema.json` (Core 30+ field metadata schema for portfolio projects)
  - [x] `schemas/repository-analysis.schema.json` (Internal evidence and analysis payload schema)
  - [x] `schemas/processing-status.schema.json` (Repository inventory & execution tracking schema)
- [x] **Author System Prompt Templates (`prompts/`)**
  - [x] `prompts/repository-classification.md` (Classification into portfolio-worthy, secondary, practice, fork, archived, empty)
  - [x] `prompts/repository-analysis.md` (Deep codebase scanner for architecture, APIs, DB, auth, deployment)
  - [x] `prompts/metadata-generation.md` (Synthesizing analysis into project schema format)
  - [x] `prompts/metadata-review.md` (Quality review & anti-hallucination verification)
  - [x] `prompts/metadata-merge.md` (Instructions for safe merging with pre-existing metadata)

---

## 🔍 Phase 3: Discovery & Inventory Engine

- [x] **GitHub Discovery Module (`src/github/`)**
  - [x] Implement `src/github/discover-repositories.ts` to fetch all public/private repositories for `Sameer-Bagul`
  - [x] Handle pagination and rate-limiting gracefully
- [x] **Inventory & Queue Persistence (`src/processing/`)**
  - [x] Implement `src/processing/queue.ts` to maintain `processing/repository-inventory.json`
  - [x] Implement `src/processing/status.ts` for real-time status updates (`pending`, `processing`, `completed`, `failed`)
  - [x] Write `scripts/discover.mjs` to run discovery CLI command

---

## 🔬 Phase 4: Sandboxed Clone & Evidence Extraction Engine

- [x] **Workspace Sandbox Manager (`src/repository/workspace-manager.ts`)**
  - [x] Implement shallow `git clone --depth 1` into isolated `workspace/current/`
  - [x] Implement safe cleanup function to completely wipe `workspace/current/` after processing each repository
- [x] **Repository Classifier (`src/repository/classifier.ts`)**
  - [x] Implement automated classification logic based on codebase size, language breakdown, README quality, and manifest features
  - [x] Assign classification type (`portfolio-worthy` | `secondary` | `practice` | `fork` | `archived` | `empty`) and analysis depth
- [x] **Evidence Collector (`src/repository/evidence-collector.ts`)**
  - [x] Scan package manifests (`package.json`, `Cargo.toml`, `requirements.txt`, `go.mod`, `pom.xml`, `build.gradle`)
  - [x] Scan configuration files (`Dockerfile`, `docker-compose.yml`, `vercel.json`, `prisma/schema.prisma`, `.env.example`)
  - [x] Scan README.md, file tree structure, and Git commit logs
  - [x] Extract tech stack breakdown (`frontend`, `backend`, `database`, `aiMl`, `infrastructure`, `devops`, `testing`, `tools`, `other`)

---

## 🧩 Phase 5: Metadata Synthesis & Safe Merge Engine

- [x] **Metadata Generator (`src/metadata/generator.ts`)**
  - [x] Synthesize raw evidence into full 30+ field `Metadata` object conforming to `schemas/project.schema.json`
  - [x] Enforce fallback defaults (`null`, `[]`, `"Unknown"`) for missing fields
  - [x] Enforce Zero-Hallucination Policy (no fabricated metrics, revenue, or testimonials)
- [x] **Safe Merge Engine (`src/metadata/merger.ts`)**
  - [x] Check if `output/metadata/<slug>.json` already exists
  - [x] Lock all fields if `manuallyVerified: true`
  - [x] Selectively preserve human-curated fields (`clientOrCompany`, `duration`, `clientTestimonial`, `metrics`, `image`, `gallery`, `architectureDiagram`)
- [x] **Data Normalizer (`src/metadata/normalizer.ts`)**
  - [x] Normalize slugs to lowercase kebab-case
  - [x] Deduplicate array items (tags, contributions, features, learnings)

---

## 🛡️ Phase 6: AJV Validation & Indexing Engine

- [x] **AJV Schema Validator (`src/validation/schema-validator.ts`)**
  - [x] Compile `schemas/project.schema.json` with AJV
  - [x] Implement strict validation for all required fields, types, enums, and URL formats
- [x] **Business Rules Engine (`src/validation/business-rules.ts`)**
  - [x] Validate unique slug across all project files
  - [x] Validate unique GitHub URLs
  - [x] Validate repository consistency
- [x] **Index & Telemetry Generator (`scripts/rebuild-indexes.mjs`)**
  - [x] Generate `output/indexes/all-projects.json`
  - [x] Generate `output/indexes/featured-projects.json`
  - [x] Generate `output/indexes/technologies.json`
  - [x] Generate `output/indexes/categories.json`
  - [x] Write summary telemetry report to `output/reports/summary.json`

---

## 🔄 Phase 7: CLI Runners & Resumable Loop

- [x] **Single Repo Test Script (`scripts/process-one.mjs`)**
  - [x] CLI runner to process a single target repository by slug
- [x] **Batch Execution & Resumable Runner (`scripts/process-all.mjs` & `scripts/resume.mjs`)**
  - [x] Implement sequential processing loop
  - [x] Skip `completed` repositories
  - [x] Support `npm run resume` to seamlessly pick up `pending` or `failed` repositories after interruptions
- [x] **Batch Validation Script (`scripts/validate.mjs`)**
  - [x] Command to batch-validate all generated JSON files in `output/metadata/*.json`
- [x] **Emergency Cleanup Script (`scripts/cleanup.mjs`)**
  - [x] Command to force-wipe `workspace/current/` if an error leaves orphaned files

---

## 🧪 Phase 8: Phased Testing & Verification POC

- [x] **Test 1: 1-Repo Proof of Concept (POC)**
  - [x] Run `npm run process-one <test-repo>`
  - [x] Verify clone, analysis, metadata generation, AJV validation, output file creation, and complete workspace cleanup
- [x] **Test 2: 5-Repo Batch & Resumability Check**
  - [x] Run 5 diverse repositories (1 portfolio-worthy, 1 secondary, 1 practice, 1 fork, 1 empty)
  - [x] Simulate interruption and run `npm run resume` to verify skipped repos
- [x] **Test 3: 20-Repo Scalability Batch**
  - [x] Test memory performance, queue state persistence, and index updates
- [x] **Test 4: 122+ Full Production Batch**
  - [x] Run complete repository inventory processing
  - [x] Confirm Quality Gate: **134 Discovered Repositories = 134 Validated Metadata Files**

---

## 🔌 Phase 9: AI IDE / Antigravity Integration Final Audit

- [x] Verify Antigravity MCP integration can invoke filesystem and repo analysis actions cleanly
- [x] Verify no secrets/tokens are hardcoded in repository files
- [x] Push clean codebase to `Sameer-Bagul/portfolio-intelligence`
- [x] Output clean JSON corpus to `Sameer-Bagul/project-metadata`
