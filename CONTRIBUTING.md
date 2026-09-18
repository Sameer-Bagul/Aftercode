# 🤝 Contributing to Aftercode

Thank you for your interest in contributing to **Aftercode**! Aftercode is an open-source monorepo developer engine, native Model Context Protocol (MCP) server, and Next.js full-stack SaaS workspace designed to discover, analyze, synthesize, and showcase GitHub repositories.

We welcome pull requests, bug reports, feature suggestions, and documentation improvements from the community.

---

## 📜 Code of Conduct & Core Principles

When contributing to Aftercode, please adhere to our core operational principles:

1. **Strict Zero-Hallucination Policy**: All tech stack claims, API routes, and code metrics MUST be backed by AST evidence matching (`package.json`, imports, code symbols, config files). Never invent metrics or unverified tech stacks.
2. **Clean SaaS Design Standards**: All UI components in `apps/web` must maintain modern, clean SaaS aesthetics (no over-badged UI elements, no gimmick spark icons, smooth card surfaces with fruit accents).
3. **Local Offline First**: Core media processing (such as TTS narration audio synthesis) must rely on local offline engines (`espeak-ng`/Piper + FFmpeg `loudnorm`) to operate without mandatory cloud costs.

---

## 🏗️ Monorepo Architecture Overview

Aftercode is organized as an **npm / pnpm Monorepo Workspace**:

```text
aftercode (Monorepo Root)
├── packages/
│   ├── shared/      # Common TypeScript interfaces, schemas & types (@aftercode/shared)
│   ├── engine/      # AST evidence collector, RAG indexer, local TTS, Remotion builder (@aftercode/engine)
│   └── mcp/         # Model Context Protocol Stdio Server (@aftercode/mcp)
└── apps/
    └── web/         # Next.js 14 App Router SaaS Application (@aftercode/web)
```

---

## 🚀 Setting Up Local Development

### 1. Prerequisites
- **Node.js**: `v18.17.0` or higher (v20+ recommended)
- **npm** or **pnpm**: `npm v9+`
- **FFmpeg**: Required for audio loudness normalization (`loudnorm`) and local video assembly.
  ```bash
  # Linux (Ubuntu/Debian)
  sudo apt-get install ffmpeg espeak-ng

  # macOS
  brew install ffmpeg espeak
  ```

### 2. Initializing the Workspace

```bash
# 1. Clone the repository
git clone https://github.com/Sameer-Bagul/aftercode.git
cd aftercode

# 2. Install workspace dependencies
npm install

# 3. Create environment configuration
cp .env.example .env

# 4. Build all workspace packages
npm run build
```

---

## 💻 Development Workflow Commands

```bash
# Start Next.js App Router Web Application (http://localhost:3000)
npm run dev

# Run Stdio MCP Server for AI IDE testing (Antigravity / Cursor / Claude Desktop)
npm run mcp

# Run full monorepo build check
npm run build

# Run unit tests across workspace packages
npm test
```

---

## 🌿 Git Branch & Commit Conventions

Please use descriptive branch names prefixed with the area of change:

- `feat/feature-name` — New features (e.g. `feat/remotion-player-scrubber`)
- `fix/bug-description` — Bug fixes (e.g. `fix/mcp-path-resolution`)
- `docs/topic` — Documentation updates (e.g. `docs/api-guide`)
- `refactor/scope` — Refactoring without changing behavior

### Commit Message Format
Follow the [Conventional Commits](https://www.conventionalcommits.org/) format:

```text
feat(engine): add local piper tts fallback for voiceover synthesis
fix(web): correct check icon import in project workspace header
docs(readme): update monorepo setup commands
```

---

## 📮 Submitting a Pull Request (PR)

1. **Fork the Repository**: Create your feature branch off `main`.
2. **Make & Test Changes**: Ensure `npm run build` succeeds cleanly across all monorepo packages.
3. **Commit & Push**: Push your branch to your fork.
4. **Open a PR**: Submit a Pull Request targeting `main` with:
   - A concise title explaining the change.
   - A clear description of the problem solved and technical approach taken.
   - Verification steps or screenshots (if introducing UI changes).

---

## 📄 License

By contributing to Aftercode, you agree that your contributions will be licensed under the project's [MIT License](LICENSE).
