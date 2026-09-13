# Portfolio Intelligence Agent Instructions & Governance Guidelines

This document defines strict operational constraints, execution policies, and behavioral rules for AI agents (including Antigravity) working on the `portfolio-intelligence` codebase.

---

## 🚫 1. Strict Anti-Hallucination & Zero-Fabrication Rules

1. **NEVER Invent Facts**:
   - Do NOT invent technology stacks, cloud services, ORMs, databases, or authentication systems that are not explicitly present in the repository evidence.
   - Do NOT generate fake performance metrics (e.g. "99.9% uptime", "reduced latency by 40%"), user counts, revenue metrics, or client testimonials.
   - If information is missing or unverified, set the field to `null`, `[]`, or `"Unknown"` based on schema requirements.

2. **Mandatory Evidence Matching**:
   - Tech stack claims require package manifest matches (`package.json`, `Cargo.toml`, `requirements.txt`, `go.mod`), import statements in code, or configuration files (`Dockerfile`, `docker-compose.yml`, `prisma/schema.prisma`).
   - Deployment claims require explicit IaC/deployment configs (`vercel.json`, `netlify.toml`, `.github/workflows/`, `fly.toml`, `Dockerfile`).

---

## 🛡️ 2. Safe Metadata Ingestion & Human Edit Protection

1. **Human Override Protection**:
   - Prior to generating metadata for `output/metadata/<slug>.json`, check if the file already exists.
   - If `manuallyVerified: true`, lock all fields and update only execution timestamps (`lastAnalyzedAt`).
   - If `manuallyVerified` is false/missing, selectively preserve human-curated fields (`clientOrCompany`, `duration`, `clientTestimonial`, `metrics`, `image`, `gallery`, `architectureDiagram`).
   - Never replace manually entered client names or testimonials with generated defaults.

---

## 🔒 3. Workspace Sandboxing & Safety

1. **Sequential Sandboxed Clones**:
   - Clone repositories only into `workspace/current/` using `git clone --depth 1`.
   - Process one repository at a time.
   - Completely wipe `workspace/current/` upon completion of analysis before moving to the next repository.

2. **Read-Only GitHub Access**:
   - GitHub API access must remain strictly read-only (`Metadata: Read`, `Contents: Read`).
   - Do NOT attempt to write or push changes directly to user repositories during analysis.

3. **Restricted Filesystem Access**:
   - Operations must remain restricted to project boundaries (`./workspace`, `./output`, `./processing`).
   - Never inspect or modify files in the host system root or home directory outside this project folder.

---

## 📊 4. 1:1 Repository Mapping Requirement

- Every discovered GitHub repository **MUST** receive exactly one validated JSON metadata file in `output/metadata/<slug>.json`.
- Discovered Count = Generated Metadata Count (e.g. 122 Repositories = 122 Metadata Files).
- Classification (`portfolio-worthy`, `secondary`, `practice`, `fork`, `archived`, `empty`) dictates **analysis depth**, NOT whether a metadata file is created.

---

## ⚡ 5. AI Token Safety & MCP Version Governance

1. **AI Prompt Token Truncation Guard**:
   - All input text payloads (README summaries, AST raw trees) fed into LLM prompts MUST be truncated via `truncateToTokenBudget(text, 12000)` to stay within strict AI context window and token budget limits.
   - LLM requests MUST enforce a 20-second timeout guard. If the LLM request fails, times out, or returns malformed output, the system MUST fallback gracefully to `runDeepHeuristicSynthesis`.

2. **MCP Security & Version Locking**:
   - All MCP servers declared in `.agents/mcp_config.json` MUST use pinned package version tags (e.g., `@0.6.2`).
   - Filesystem MCP access MUST remain sandboxed exclusively within `./workspace`, `./output`, and `./processing`.

---

## 🎨 6. 21st.dev MCP Integration & UI Design Guidelines

1. **21st.dev MCP Configuration**:
   - Configure `@21st-dev/mcp-server` in `.agents/mcp_config.json` to enable automated component search and UI design inspiration for AI IDE agents.
   - Pass API key via environment variable: `"TWENTY_FIRST_API_KEY": "${TWENTY_FIRST_API_KEY}"`.

2. **Minimalist Fruity Light Theme Standards**:
   - All UI components MUST adhere to the minimalist light theme with fresh fruity accents (`#ff7e5f` Peach, `#10b981` Mint, `#8b5cf6` Lavender, `#f59e0b` Lemon, `#06b6d4` Sky Blue).
   - Card surfaces MUST use `#ffffff` with subtle borders and soft drop shadows (`box-shadow: 0 4px 12px rgba(0,0,0,0.03)`).


