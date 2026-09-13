# ⚡ Aftercode

> **Autonomous Repository Analysis & Multi-Tier Architecture Engine for AI IDEs**

[![npm version](https://img.shields.io/npm/v/aftercode.svg?style=flat-square&color=6366f1)](https://www.npmjs.com/package/aftercode)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)
[![Build Status](https://img.shields.io/badge/Build-Passing-emerald.svg?style=flat-square)](https://github.com/Sameer-Bagul/aftercode)
[![Model Context Protocol](https://img.shields.io/badge/MCP-Native%20Server-3b82f6.svg?style=flat-square)](https://modelcontextprotocol.io)

**Aftercode** is an open-source developer engine and native **Model Context Protocol (MCP)** server that automatically discovers, analyzes, classifies, synthesizes, and indexes GitHub repositories. 

Designed specifically to power AI IDEs like **Antigravity**, **Cursor**, **Claude Desktop**, and **Windsurf**, Aftercode transforms raw source code into schema-validated metadata, technical accomplishments, and **multi-tier Mermaid subgraph architecture diagrams**.

---

## ✨ Key Features

* **⚡ Native MCP Server (`aftercode serve`)**: Connect directly to Antigravity, Cursor, or Claude Desktop via standard STDIO Model Context Protocol.
* **🛡️ Selective Sparse Sandboxing**: Uses `git clone --depth 1 --filter=blob:none --sparse` to download source files while skipping gigabytes of binary model weights (`.onnx`, `.bin`, `.pt`), media, and archives.
* **📊 Multi-Tier Mermaid Subgraph Diagrams**: Automatically generates 5-tier architecture diagrams dividing topologies into `ClientTier`, `APITier`, `ServiceTier`, `DataEngineTier`, and `InfraTier`.
* **🔍 AST & Framework Detector**: Scans imports, route patterns (`GET /health`, `POST /tts`), package manifests, Dockerfiles, and ORM schemas to extract exact tech stacks.
* **⚡ AI Token Safety Guard**: Enforces token safety budgets (`truncateToTokenBudget`) and 20s timeouts with seamless deep heuristic fallbacks.
* **🚫 Zero-Emoji Sanitization**: Automated recursive sanitizer ensures clean, professional output across all metadata text fields.
* **🔒 Human Override Protection**: Preserves manually verified fields (`manuallyVerified: true`) across analysis runs.

---

## 🏗️ System Architecture

```mermaid
graph TD
    subgraph Client ["AI IDE & Developer Tooling"]
        IDE["Antigravity / Cursor / Claude Desktop"]
        CLI["Aftercode Command Line Tool"]
    end

    subgraph Core ["Aftercode Engine"]
        MCPServer["STDIO MCP Server (aftercode serve)"]
        Discoverer["GitHub Inventory Discovery"]
        Workspace["Sparse Sandboxed Workspace Manager"]
        Collector["AST & Route Evidence Collector"]
        Synthesizer["Multi-Tier Subgraph Synthesizer"]
        Validator["AJV JSON Schema Validator"]
    end

    subgraph Output ["Output & Storage"]
        MetaDir["output/metadata/<slug>.json"]
        Indexes["output/indexes/projects-index.json"]
    end

    IDE <-->|Model Context Protocol (STDIO)| MCPServer
    CLI --> Discoverer
    CLI --> Workspace
    Workspace --> Collector
    Collector --> Synthesizer
    Synthesizer --> Validator
    Validator --> MetaDir
    MetaDir --> Indexes
```

---

## 🚀 Quickstart

### 1. Install via npm

```bash
npm install -g aftercode
# Or use directly via npx:
npx aftercode help
```

### 2. Discover & Process Repositories

```bash
# Discover all public/private repositories for a GitHub user
npx aftercode discover Sameer-Bagul

# Process single repository
npx aftercode process athena-end-to-end-ai-agent

# Process entire repository queue
npx aftercode process all

# Validate output schema
npx aftercode validate
```

---

## 🔌 Connecting to AI IDEs (Antigravity, Cursor, Claude Desktop)

Add **Aftercode** to your IDE's MCP configuration file (e.g. `.agents/mcp_config.json` or `claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "aftercode": {
      "command": "npx",
      "args": ["-y", "aftercode", "serve"],
      "env": {
        "GITHUB_TOKEN": "ghp_your_github_token_optional"
      }
    }
  }
}
```

### Available MCP Tools

Once connected, your AI IDE agent can invoke:
* `aftercode_discover_repositories`: Discover repos for any username.
* `aftercode_analyze_repository`: Perform deep AST analysis and generate multi-tier Mermaid architecture diagrams.
* `aftercode_validate_metadata`: Validate metadata against official AJV schema.
* `aftercode_get_catalog_summary`: Get catalog overview across output metadata.

---

## 🛠️ Environment Variables

Copy `.env.example` to `.env`:

```bash
# Optional: GitHub PAT for 5,000 requests/hr rate limits & private repo access
GITHUB_TOKEN=ghp_your_personal_access_token

# Optional: Gemini / OpenAI API Key for LLM multi-pass synthesis
GEMINI_API_KEY=your_api_key
ENABLE_AI_LLM_SYNTHESIS=true
```

---

## 📄 License

[MIT License](LICENSE) © 2026 Sameer Bagul & Aftercode Contributors.
