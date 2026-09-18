# ⚡ Aftercode

> **Autonomous Repository Analysis, Next.js App Router Workspace & Programmatic Remotion Media Engine**

[![npm version](https://img.shields.io/npm/v/aftercode.svg?style=flat-square&color=ff7e5f)](https://www.npmjs.com/package/aftercode)
[![License: MIT](https://img.shields.io/badge/License-MIT-emerald.svg?style=flat-square)](LICENSE)
[![Next.js 14](https://img.shields.io/badge/Next.js-14%20App%20Router-black.svg?style=flat-square&logo=next.js)](https://nextjs.org)
[![Model Context Protocol](https://img.shields.io/badge/MCP-Native%20Server-0284c7.svg?style=flat-square)](https://modelcontextprotocol.io)

**Aftercode** is an open-source monorepo developer engine, native **Model Context Protocol (MCP)** server, and full-stack **Next.js 14 App Router SaaS Workspace** that automatically discovers, analyzes, classifies, synthesizes, and showcases GitHub repositories.

Designed to connect with AI IDEs (**Antigravity**, **Cursor**, **Claude Desktop**, and **Windsurf**), Aftercode transforms raw codebase AST evidence into schema-validated metadata, multi-tier topology diagrams, offline voiceovers, and **Remotion programmatic MP4 video showcases**.

---

## 🚀 What's New in Version 2.0 (Monorepo Architecture)

* 🏗️ **Monorepo Architecture**: Decoupled packages (`@aftercode/shared`, `@aftercode/engine`, `@aftercode/mcp`) and Next.js SaaS app (`apps/web`).
* ⚡ **Next.js 14 App Router App (`apps/web`)**: Production-grade full-stack Web application featuring per-project workspaces (`/project/[slug]`), global video studio (`/video-studio`), AST knowledge graph explorer (`/knowledge-graph`), asset library (`/asset-library`), and telemetry analytics (`/analytics`).
* 🎙️ **Local Offline TTS Engine**: Zero-cost, privacy-first narration audio synthesis (`espeak-ng` / Piper) normalized using broadcast-grade FFmpeg `loudnorm` filter (`-16 LUFS`).
* 🎬 **Native Remotion Player Integration**: Frame-accurate video preview scrubber (`RemotionPlayer.tsx`) and programmatic MP4 exporter.
* 🔌 **Model Context Protocol Server (`@aftercode/mcp`)**: Native Stdio MCP server exposing repository analysis, RAG indexing, and video rendering tools directly to AI IDE agents.

---

## 🏗️ Monorepo Workspace Structure

```text
aftercode (Monorepo Root)
├── package.json                   # Monorepo workspace root configuration
├── packages/
│   ├── shared/                    # Shared TypeScript Types & AJV Schemas (@aftercode/shared)
│   ├── engine/                    # AST Evidence Collector, RAG Indexer, Local TTS & Remotion Builder (@aftercode/engine)
│   └── mcp/                       # Model Context Protocol Stdio Transport Server (@aftercode/mcp)
└── apps/
    └── web/                       # Next.js 14 App Router Full-Stack Application (@aftercode/web)
        ├── app/
        │   ├── page.tsx           # Repositories Catalog & Search Dashboard
        │   ├── project/[slug]/    # Dedicated Per-Project Workspace Hub
        │   ├── video-studio/      # Global Video Production Studio & Timeline Scrubber
        │   ├── knowledge-graph/   # AST Knowledge Graph & Evidence Explorer
        │   ├── asset-library/     # Extracted SVG Diagrams & Audio Buffers
        │   ├── analytics/         # System Telemetry & Tech Stack Metrics
        │   ├── mcp-status/        # MCP Server Monitor & Tool Inspector
        │   └── api/               # Next.js Server Route Handlers
```

---

## ⚡ Quick Start

### 1. Installation & Setup

```bash
# Clone the repository
git clone https://github.com/Sameer-Bagul/aftercode.git
cd aftercode

# Install monorepo workspace dependencies
npm install

# Copy environment variables
cp .env.example .env

# Build all workspace packages
npm run build
```

### 2. Launch the Next.js SaaS Web Application

```bash
# Start Next.js development server at http://localhost:3000
npm run dev
```

### 3. Run the MCP Server for AI IDEs

```bash
# Launch Stdio MCP Server for Antigravity / Cursor / Claude Desktop
npm run mcp
```

---

## 🔌 Connecting to AI IDEs (Antigravity, Cursor, Claude Desktop)

Add Aftercode to your IDE's MCP configuration (`.agents/mcp_config.json` or `claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "aftercode": {
      "command": "node",
      "args": ["/absolute/path/to/aftercode/packages/mcp/dist/server.js"],
      "env": {
        "GITHUB_TOKEN": "${GITHUB_TOKEN}",
        "GEMINI_API_KEY": "${GEMINI_API_KEY}"
      }
    }
  }
}
```

---

## 🛠️ Environment Configuration (`.env`)

See [.env.example](.env.example) for all available options:

```bash
# GitHub PAT for 5,000 req/hr rate limits
GITHUB_TOKEN=ghp_your_personal_access_token

# Optional LLM Synthesis Key
GEMINI_API_KEY=your_gemini_api_key
ENABLE_AI_LLM_SYNTHESIS=true

# Local Audio Engine Settings
LOCAL_TTS_ENGINE=espeak
PIPER_TTS_PATH=/usr/bin/piper
```

---

## 🤝 Contributing

We welcome community contributions! Please review our [CONTRIBUTING.md](CONTRIBUTING.md) guide for environment setup, coding standards, and PR workflows.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE) © 2026 Sameer Bagul & Aftercode Contributors.
