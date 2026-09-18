# Aftercode Monorepo Roadmap & Execution TODO

> **Project Mission**: Build `aftercode` — an open-source monorepo developer engine, native Model Context Protocol (MCP) server, and full-stack Next.js 14 App Router SaaS application to discover, analyze, synthesize, validate, and showcase GitHub repositories with local offline TTS voiceovers and Remotion programmatic MP4 video rendering.

---

## 🔌 Phase 0: Workspace & MCP Setup
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
  - [x] Create `package.json` with workspace scripts (`discover`, `process-one`, `process-all`, `validate`, `rebuild-indexes`)
  - [x] Configure `tsconfig.json` with strict mode and NodeNext module resolution
  - [x] Set up ESLint & Prettier
  - [x] Install dependencies (`ajv`, `ajv-formats`, `execa`, `glob`, `@types/node`)
- [x] **Create Directory Structure**
  - [x] `schemas/`
  - [x] `prompts/`
  - [x] `src/github/`, `src/repository/`, `src/metadata/`, `src/validation/`, `src/processing/`
  - [x] `workspace/current/`
  - [x] `output/metadata/`, `output/indexes/`, `output/reports/`
- [x] **Create Root Guidance Documents**
  - [x] Write `AGENTS.md` (AI Agent behavior rules, zero-hallucination policy, evidence-first rules)
  - [x] Write `README.md` (System overview, installation, CLI usage, MCP integration guide)

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

---

## 🔍 Phase 3: Discovery & Inventory Engine
- [x] **GitHub Discovery Module (`src/github/`)**
  - [x] Implement `src/github/discover-repositories.ts` to fetch public/private repositories for `Sameer-Bagul`
  - [x] Handle pagination and rate-limiting gracefully
- [x] **Inventory & Queue Persistence (`src/processing/`)**
  - [x] Maintain `processing/repository-inventory.json`
  - [x] Track execution states (`pending`, `processing`, `completed`, `failed`)

---

## 🔬 Phase 4: Sandboxed Clone & AST Evidence Engine
- [x] **Workspace Sandbox Manager (`src/repository/workspace-manager.ts`)**
  - [x] Implement shallow `git clone --depth 1` into isolated `workspace/current/`
  - [x] Implement safe cleanup function to completely wipe `workspace/current/` after processing each repository
- [x] **Repository Classifier (`src/repository/classifier.ts`)**
  - [x] Implement automated classification logic based on codebase size, language breakdown, README quality, and manifest features
  - [x] Assign classification type (`portfolio-worthy` | `secondary` | `practice` | `fork` | `archived` | `empty`)
- [x] **Evidence Collector (`src/repository/evidence-collector.ts`)**
  - [x] Scan package manifests (`package.json`, `Cargo.toml`, `requirements.txt`, `go.mod`, `pom.xml`, `build.gradle`)
  - [x] Scan configuration files (`Dockerfile`, `docker-compose.yml`, `vercel.json`, `prisma/schema.prisma`, `.env.example`)
  - [x] Extract tech stack breakdown (`frontend`, `backend`, `database`, `aiMl`, `infrastructure`, `devops`, `testing`, `tools`)

---

## 🧩 Phase 5: Metadata Synthesis & Safe Merge Engine
- [x] **Metadata Generator (`src/metadata/generator.ts`)**
  - [x] Synthesize raw evidence into full 30+ field `Metadata` object conforming to schema
  - [x] Enforce fallback defaults (`null`, `[]`, `"Unknown"`) for missing fields
  - [x] Enforce Zero-Hallucination Policy (no fabricated metrics, revenue, or testimonials)
- [x] **Safe Merge Engine (`src/metadata/merger.ts`)**
  - [x] Lock all fields if `manuallyVerified: true`
  - [x] Selectively preserve human-curated fields (`clientOrCompany`, `duration`, `clientTestimonial`, `metrics`, `image`, `gallery`)

---

## 🛡️ Phase 6: AJV Validation & Indexing Engine
- [x] **AJV Schema Validator (`src/validation/schema-validator.ts`)**
  - [x] Compile `schemas/project.schema.json` with AJV
  - [x] Implement strict validation for all required fields, types, enums, and URL formats
- [x] **Index & Telemetry Generator**
  - [x] Generate `output/indexes/all-projects.json`
  - [x] Write summary telemetry report to `output/reports/summary.json`

---

## ⚡ Phase 7: Remotion Video Builder & Local TTS Audio Engine
- [x] **Local Zero-Cost Offline TTS Engine (`src/audio/local-tts.ts`)**
  - [x] Synthesize narration WAV buffers locally via `espeak-ng` / Piper
  - [x] Apply broadcast-grade FFmpeg `loudnorm` filter (`-af loudnorm=I=-16:TP=-1.5:LRA=11`)
- [x] **Remotion Storyboard Builder (`src/video/remotion-builder.ts`)**
  - [x] Synthesize 6-scene storyboard scripts (Hero Intro, Architecture Topology, API Endpoint Matrix, AST Code Structure, Key Highlights, Outro CTA)
  - [x] Support programmatic MP4 video export

---

## 🏗️ Phase 8: Monorepo Next.js 14 App Router Migration
- [x] **Workspace Re-architecture**
  - [x] Configure root `package.json` and `pnpm-workspace.yaml` for monorepo packages (`packages/*`, `apps/*`)
  - [x] Extract `@aftercode/shared` (`packages/shared/`)
  - [x] Extract `@aftercode/engine` (`packages/engine/`)
  - [x] Extract `@aftercode/mcp` (`packages/mcp/`)
  - [x] Create Next.js 14 App Router SaaS Application (`apps/web/`)
- [x] **Next.js Full-Stack App Pages (`apps/web/app/`)**
  - [x] `/` — Repositories Catalog & Search Dashboard
  - [x] `/project/[slug]` — Dedicated Per-Project Workspace Hub (Overview, Remotion Studio, Knowledge Graph, Asset Library, JSON metadata)
  - [x] `/video-studio` — Global Remotion Video Studio & Timeline Scrubber (`RemotionPlayer.tsx`)
  - [x] `/knowledge-graph` — AST Knowledge Graph & Evidence Explorer with Mermaid diagrams
  - [x] `/asset-library` — Extracted SVGs, Audio Buffers, and Video Bundles
  - [x] `/analytics` — System Telemetry & Tech Stack Metrics
  - [x] `/mcp-status` — Model Context Protocol Server Monitor
- [x] **Next.js Server API Routes (`apps/web/app/api/`)**
  - [x] `app/api/projects/route.ts` — Serves project metadata from `./output/metadata/*.json`
  - [x] `app/api/repos/route.ts` — GitHub inventory route
  - [x] `app/api/video/tts/[slug]/route.ts` — Local TTS voiceover API trigger
  - [x] `app/api/video/render/[slug]/route.ts` — Remotion MP4 video render API trigger
- [x] **Monorepo Build Verification**
  - [x] Verify `npm run build` compiles all packages (`@aftercode/shared`, `@aftercode/engine`, `@aftercode/mcp`, `@aftercode/web`) with **0 errors**.

---

## 🔮 Phase 9: Open-Source Documentation & Standards
- [x] **Create Standard Open-Source Documentation**
  - [x] Write comprehensive `README.md` with Next.js App Router architecture guidelines
  - [x] Create `.env.example` detailing all environment variables
  - [x] Write `CONTRIBUTING.md` developer guide
  - [x] Verify OSI-approved `LICENSE` (MIT License)

---

## 🚀 Phase 10: Future Roadmap & Upcoming Features

- [ ] **Interactive Live Web Editor for Remotion Video Studio**
  - [ ] Drag-and-drop scene reordering in `apps/web/app/video-studio/page.tsx`
  - [ ] Custom background gradient picker & font customization
- [ ] **Multi-Voice Piper TTS Model Selection**
  - [ ] Voice selection dropdown (e.g. `en_US-lessac-medium`, `en_GB-alan-low`) in Video Studio
- [ ] **Playwright Product Capture Integration**
  - [ ] Automated headless browser screenshot capture of deployed web apps (`demoUrl`)
  - [ ] Auto-embedding captured screenshots into Remotion Video scenes
- [ ] **GitHub Webhook Sync**
  - [ ] Automatic background re-indexing whenever a `git push` event hits a repository
