Yes. I would give Antigravity a **single master setup specification** rather than asking it to "figure out the MCPs" itself.

I checked the current Antigravity and MCP documentation. Antigravity supports MCP Store installations, workspace-level `.agents/mcp_config.json`, local `stdio` servers, remote MCP servers, OAuth/custom headers, and per-tool MCP permissions. ([Google Antigravity][1])

For this project, I recommend **3 MCPs initially**:

1. **GitHub MCP**: remote GitHub access
2. **Git MCP**: deep local Git repository inspection
3. **Filesystem MCP**: controlled access to the temporary workspace and generated metadata

We do **not** need a database, vector DB, RAG MCP, or custom MCP in V1.

---

# 1. MCPs we will use

## MCP 1: GitHub

Use GitHub's official MCP Server.

[GitHub MCP Server repository](https://github.com/github/github-mcp-server?utm_source=chatgpt.com)

This is the most important one. It can browse repositories, read code/files, search code, inspect commits, and interact with GitHub. GitHub also provides a read-only mode, which is what I recommend initially. ([GitHub][2])

GitHub's hosted MCP endpoint is:

[GitHub hosted MCP endpoint documentation](https://github.com/github/github-mcp-server?utm_source=chatgpt.com)

The official server documentation describes the hosted GitHub MCP server and local installation options. ([GitHub][2])

### Initial permission

We want:

```text
READ ONLY
```

At least initially.

We don't want an AI agent accidentally modifying your repositories.

---

# 2. MCP 2: Git

Use the official MCP reference Git server.

[Official MCP Git server](https://github.com/modelcontextprotocol/servers/tree/main/src/git?utm_source=chatgpt.com)

It can inspect local Git repositories, including status, diffs, branches, logs and repository information. ([GitHub][3])

It can be run through:

```text
uvx mcp-server-git
```

according to the official MCP server documentation. ([GitHub][3])

Important security note: the official reference server has had security advisories in its history, so **Antigravity should use a current version and restrict the repository path it can access**. ([GitHub][4])

---

# 3. MCP 3: Filesystem

Use the official MCP filesystem server.

[Official MCP Filesystem server](https://github.com/modelcontextprotocol/servers/tree/main/src/filesystem?utm_source=chatgpt.com)

The official MCP reference servers include a filesystem server specifically for controlled file operations. ([GitHub][5])

We should restrict it to:

```text
portfolio-intelligence/
```

and especially:

```text
portfolio-intelligence/workspace/
portfolio-intelligence/output/
portfolio-intelligence/processing/
```

It should **not** have access to your entire home directory.

---

# 4. MCPs we should NOT install yet

Do not install:

```text
PostgreSQL
Redis
MongoDB
Pinecone
Supabase
Memory
RAG
Browser automation
Slack
Notion
Figma
Stripe
```

They don't solve the current problem.

Antigravity's current MCP Store has many integrations, including GitHub, databases, Figma, Postman, etc., but we only need the ones relevant to repository analysis right now. ([Google Antigravity][6])

---

# 5. Final architecture

The project should work like this:

```text
                         ANTIGRAVITY
                              |
             ┌────────────────┼────────────────┐
             |                |                |
             v                v                v
        GitHub MCP         Git MCP       Filesystem MCP
             |                |                |
             v                v                v
       GitHub account    Local Git repo    Project files
             |                |                |
             └────────────────┼────────────────┘
                              |
                              v
                    Portfolio Intelligence
                           Engine
                              |
             ┌────────────────┼────────────────┐
             |                |                |
             v                v                v
       Repository        Metadata          Validation
        Analyzer         Generator           Engine
             |                |                |
             └────────────────┼────────────────┘
                              |
                              v
                    project-metadata repo
```

---

# 6. The project we want Antigravity to create

Repository:

```text
Sameer-Bagul/portfolio-intelligence
```

This is the **engine**.

Your existing:

```text
Sameer-Bagul/project-metadata
```

is the **output/data repository**.

So:

```text
portfolio-intelligence
        |
        | generates
        v
project-metadata
```

---

# 7. Complete project structure

Tell Antigravity to create:

```text
portfolio-intelligence/
│
├── README.md
├── AGENTS.md
├── package.json
├── tsconfig.json
├── .gitignore
├── .env.example
│
├── .agents/
│   ├── mcp_config.json
│   └── skills/
│       └── portfolio-metadata/
│           └── SKILL.md
│
├── schemas/
│   ├── project.schema.json
│   ├── repository-analysis.schema.json
│   └── processing-status.schema.json
│
├── prompts/
│   ├── repository-classification.md
│   ├── repository-analysis.md
│   ├── metadata-generation.md
│   ├── metadata-review.md
│   └── metadata-merge.md
│
├── src/
│   ├── github/
│   │   ├── discover-repositories.ts
│   │   └── github-types.ts
│   │
│   ├── repository/
│   │   ├── classifier.ts
│   │   ├── analyzer.ts
│   │   ├── workspace-manager.ts
│   │   └── evidence-collector.ts
│   │
│   ├── metadata/
│   │   ├── generator.ts
│   │   ├── merger.ts
│   │   └── normalizer.ts
│   │
│   ├── validation/
│   │   ├── schema-validator.ts
│   │   └── business-rules.ts
│   │
│   ├── processing/
│   │   ├── queue.ts
│   │   ├── status.ts
│   │   └── runner.ts
│   │
│   └── index.ts
│
├── scripts/
│   ├── discover.mjs
│   ├── process-one.mjs
│   ├── process-all.mjs
│   ├── resume.mjs
│   ├── validate.mjs
│   ├── rebuild-indexes.mjs
│   └── cleanup.mjs
│
├── processing/
│   ├── repository-inventory.json
│   ├── processing-status.json
│   └── errors.json
│
├── workspace/
│   └── current/
│
├── output/
│   ├── metadata/
│   ├── indexes/
│   └── reports/
│
└── tests/
    ├── classifier.test.ts
    ├── analyzer.test.ts
    ├── metadata.test.ts
    └── validation.test.ts
```

---

# 8. MCP configuration

Antigravity's current configuration format uses:

```json
{
  "mcpServers": {}
}
```

and supports local `command`/`args` servers as well as remote `serverUrl` servers. Workspace configuration belongs under:

```text
.agents/mcp_config.json
```

while global configuration is under the Antigravity/Gemini configuration directory. ([Google Antigravity][1])

Conceptually:

```json
{
  "mcpServers": {
    "github": {
      "..."
    },
    "git": {
      "..."
    },
    "filesystem": {
      "..."
    }
  }
}
```

But I would explicitly tell Antigravity:

> Do not hardcode secrets into this file.

Use the MCP Store/OAuth or environment-based credentials.

---

# 9. GitHub authentication

We should try this order:

### First choice

```text
GitHub MCP OAuth
```

If Antigravity's GitHub MCP installation gives us the required repository access, stop there.

### Second choice

Use a **fine-grained GitHub PAT**.

GitHub's official MCP server supports PAT-based authentication for the local server, and its read-only mode can prevent repository mutations. ([GitHub][2])

For our first run:

```text
Repository access:
Only repositories you actually want analyzed

Permissions:
Metadata: Read
Contents: Read
```

Add other read permissions only if the analyzer demonstrates that it needs them.

Do **not** give:

```text
Contents: Write
```

to all repositories.

---

# 10. Repository processing logic

This is the heart of the project.

Antigravity should implement:

```text
DISCOVER
   ↓
QUEUE
   ↓
CLASSIFY
   ↓
CLONE
   ↓
ANALYZE
   ↓
COLLECT EVIDENCE
   ↓
GENERATE METADATA
   ↓
MERGE WITH EXISTING
   ↓
VALIDATE
   ↓
SAVE
   ↓
UPDATE INDEX
   ↓
MARK COMPLETE
   ↓
DELETE TEMP CLONE
   ↓
NEXT REPOSITORY
```

---

# 11. Every repository gets a file

This requirement needs to be explicitly hardcoded into the agent instructions.

If GitHub returns:

```text
122 repositories
```

the expected result is:

```text
122 metadata files
```

Not:

```text
5 metadata files
```

and not:

```text
only portfolio-worthy projects
```

Classification controls **analysis depth**, not whether a metadata file is created.

---

# 12. Repository classification

Use:

```text
portfolio-worthy
secondary
practice
fork
archived
empty
unknown
```

For example:

```json
{
  "classification": {
    "type": "practice",
    "portfolioWorthiness": "low"
  }
}
```

But still generate the complete metadata JSON.

---

# 13. Analysis depth

### Portfolio-worthy

Deep:

```text
README
package files
source code
architecture
database
API
authentication
AI/ML
deployment
testing
Git history
features
challenges
learnings
```

### Secondary

Medium:

```text
README
dependencies
source structure
architecture
features
deployment
Git metadata
```

### Practice

Light:

```text
README
dependencies
languages
basic structure
purpose
```

### Empty

Minimal:

```text
GitHub metadata
README
```

---

# 14. Evidence-first rule

Put this in `AGENTS.md`:

```text
NEVER invent project information.

Only include information supported by repository evidence.

Examples:

Do not claim Stripe unless Stripe is actually detected.

Do not claim PostgreSQL unless PostgreSQL is supported by evidence.

Do not claim AWS deployment unless AWS deployment evidence exists.

Do not invent:
- metrics
- revenue
- user counts
- client testimonials
- business impact
- performance improvements
- production usage
```

Unknown values should become:

```text
null
[]
"Unknown"
```

depending on schema.

---

# 15. Existing metadata protection

This is extremely important.

Before generating metadata:

```text
check:
output/metadata/<slug>.json
```

If it exists:

```text
existing metadata
       +
new evidence
       ↓
safe merge
```

Never blindly overwrite manually added information.

For example:

```json
{
  "clientOrCompany": "ABC Technologies",
  "duration": "6 months"
}
```

must survive future automated runs.

---

# 16. Temporary repository workflow

The agent should only clone one repository at a time:

```text
workspace/current/
```

Example:

```text
workspace/current/
    README.md
    package.json
    src/
```

After completion:

```text
workspace/current/
```

must be cleaned.

Then:

```text
next repository
```

This keeps disk usage under control.

---

# 17. Processing state

Create:

```text
processing/repository-inventory.json
```

Example:

```json
{
  "owner": "Sameer-Bagul",
  "totalRepositories": 122,
  "repositories": [
    {
      "name": "repo-a",
      "status": "completed"
    },
    {
      "name": "repo-b",
      "status": "pending"
    }
  ]
}
```

Statuses:

```text
pending
processing
completed
failed
```

Then:

```text
npm run resume
```

should continue from where the previous run stopped.

---

# 18. Validation

Every generated file must pass:

```text
JSON Schema
+
business rules
+
duplicate detection
```

Before marking:

```text
completed
```

the validator must pass.

So:

```text
Generate
   ↓
Validate
   |
   ├── FAIL → failed
   |
   └── PASS → completed
```

---

# 19. Indexes

After processing:

```text
output/indexes/
```

should contain:

```text
all-projects.json
featured-projects.json
technologies.json
categories.json
```

These are generated automatically.

Never manually maintain them.

---

# 20. Testing strategy

Antigravity should NOT immediately process all 122 repositories.

Use:

```text
Phase A
1 repository

Phase B
5 repositories

Phase C
20 repositories

Phase D
122 repositories
```

For the first repository, manually inspect the result.

Only then scale.

---

# 21. Final success criteria

The complete system is successful when:

```text
Repositories discovered: 122

Metadata files:
122

Valid:
122

Failed:
0

Missing:
0

Temporary repositories:
0

Invented metrics:
0

Invented testimonials:
0

Existing manually verified data overwritten:
0
```

If some fail:

```text
118 completed
4 failed
```

the system must allow:

```text
npm run resume
```

without reprocessing the successful repositories.

---

# 22. RAG comes later

After we have:

```text
122 excellent JSON files
```

we can build:

```text
portfolio-rag
```

and ask:

```text
Which projects use Next.js + PostgreSQL?

Which projects have AI?

Which projects demonstrate AWS?

Which projects are SaaS applications?

Which projects are strongest for a backend role?

Which projects match this job description?
```

At that point the metadata JSON becomes the clean RAG corpus.

---

# 23. The master prompt for Antigravity

This is what I would actually paste into a **new Antigravity project/session**.

# Build: Portfolio Intelligence

You are setting up a new production-quality developer tool called `portfolio-intelligence`.

The purpose of this project is to analyze every GitHub repository owned by `Sameer-Bagul` and generate exactly one detailed portfolio metadata JSON file per repository.

The project must be designed to process repositories sequentially, resume after interruption, preserve manually entered metadata, validate every generated JSON file, and safely clean up temporary repository clones.

Do NOT build a RAG system in V1.
Do NOT build a vector database in V1.
Do NOT build a web dashboard in V1.
Do NOT create a custom MCP server unless an actual capability gap is discovered after the existing MCPs are configured and tested.

## 1. MCP setup

Configure the following MCP integrations.

### GitHub MCP

Use GitHub's official MCP Server:

[https://github.com/github/github-mcp-server](https://github.com/github/github-mcp-server)

Prefer the Antigravity MCP Store / OAuth integration if it provides the required access.

If OAuth is insufficient, configure the official GitHub MCP Server using a fine-grained GitHub PAT.

Initial GitHub access must be read-only.

Required capabilities:

* list repositories for Sameer-Bagul
* inspect repository metadata
* read repository files
* search repository code/files
* inspect commits/history where useful
* inspect branches
* inspect languages/topics/releases where available

Do not grant repository write access during the initial implementation.

### Git MCP

Use the official MCP Git reference server:

[https://github.com/modelcontextprotocol/servers/tree/main/src/git](https://github.com/modelcontextprotocol/servers/tree/main/src/git)

Use the current maintained version.

The Git MCP must only be allowed to operate on the project's controlled temporary repository workspace.

Primary purpose:

* inspect Git repository status
* inspect history
* inspect commits
* inspect branches
* inspect diffs when useful

Do not give the Git MCP unrestricted access to the user's home directory.

### Filesystem MCP

Use the official MCP Filesystem reference server:

[https://github.com/modelcontextprotocol/servers/tree/main/src/filesystem](https://github.com/modelcontextprotocol/servers/tree/main/src/filesystem)

Restrict its accessible paths to the project workspace only.

It must NOT receive unrestricted access to the user's home directory.

Allowed areas should be limited to this project, especially:

* `workspace/`
* `processing/`
* `output/`
* project configuration files

## 2. Antigravity configuration

Use Antigravity's current MCP configuration format.

Workspace MCP configuration must live at:

`.agents/mcp_config.json`

Do not hardcode GitHub PATs, OAuth secrets, or other credentials into committed files.

Use Antigravity's authentication mechanisms or environment variables.

After configuring MCPs, verify all servers are connected and usable.

Use `/mcp` to inspect MCP server status if running through Antigravity CLI.

Use `/permissions` to review MCP permissions.

## 3. Create the project

Create:

`portfolio-intelligence`

Use TypeScript and Node.js.

Recommended stack:

* TypeScript
* Node.js
* AJV
* JSON Schema
* Vitest
* ESLint
* Prettier

Create:

```text
portfolio-intelligence/
├── README.md
├── AGENTS.md
├── package.json
├── tsconfig.json
├── .gitignore
├── .env.example
│
├── .agents/
│   ├── mcp_config.json
│   └── skills/
│       └── portfolio-metadata/
│           └── SKILL.md
│
├── schemas/
│   ├── project.schema.json
│   ├── repository-analysis.schema.json
│   └── processing-status.schema.json
│
├── prompts/
│   ├── repository-classification.md
│   ├── repository-analysis.md
│   ├── metadata-generation.md
│   ├── metadata-review.md
│   └── metadata-merge.md
│
├── src/
│   ├── github/
│   ├── repository/
│   ├── metadata/
│   ├── validation/
│   ├── processing/
│   └── index.ts
│
├── scripts/
│   ├── discover.mjs
│   ├── process-one.mjs
│   ├── process-all.mjs
│   ├── resume.mjs
│   ├── validate.mjs
│   ├── rebuild-indexes.mjs
│   └── cleanup.mjs
│
├── processing/
│   ├── repository-inventory.json
│   ├── processing-status.json
│   └── errors.json
│
├── workspace/
│   └── current/
│
├── output/
│   ├── metadata/
│   ├── indexes/
│   └── reports/
│
└── tests/
```

## 4. Existing metadata repository

The output/data repository is:

`https://github.com/Sameer-Bagul/project-metadata`

Do not replace this repository.

The new `portfolio-intelligence` project is the processing engine.

The `project-metadata` repository is the metadata database/output repository.

## 5. Metadata schema

Use the existing project metadata schema as the source of truth.

The schema includes:

* `_id`
* `title`
* `slug`
* `shortDescription`
* `description`
* `category`
* `isFeatured`
* `status`
* `role`
* `clientOrCompany`
* `duration`
* `targetAudience`
* `techStackBreakdown`
* `myContributions`
* `image`
* `gallery`
* `architectureDiagram`
* `liveUrl`
* `githubUrl`
* `apiDocsUrl`
* `figmaUrl`
* `videoUrl`
* `contributors`
* `features`
* `challenges`
* `learnings`
* `metrics`
* `clientTestimonial`
* `relatedBlogs`
* `futureRoadmap`

The technology breakdown must support:

```json
{
  "frontend": [],
  "backend": [],
  "database": [],
  "aiMl": [],
  "infrastructure": [],
  "devops": [],
  "testing": [],
  "tools": [],
  "other": []
}
```

Repository/classification metadata should include:

```json
{
  "repository": {
    "owner": "",
    "name": "",
    "url": "",
    "visibility": "public|private|unknown",
    "fork": false
  },
  "classification": {
    "type": "portfolio-worthy|secondary|practice|fork|archived|empty|unknown",
    "portfolioWorthiness": "high|medium|low|unknown"
  },
  "metadata": {
    "generatedAt": "",
    "lastAnalyzedAt": "",
    "sourceCommit": null,
    "manuallyVerified": false
  }
}
```

Use the existing schema/repository metadata as authoritative if the latest version is available.

## 6. Critical requirement: one repository = one metadata file

Every repository returned by GitHub MUST receive exactly one metadata JSON file.

If there are 122 repositories, there must be 122 metadata files.

Classification does NOT determine whether a file is created.

Classification determines analysis depth.

Even empty, practice, fork, archived, and low-value repositories must receive metadata files.

For unavailable information use:

* `null`
* `[]`
* `"Unknown"`

according to the field type.

Never omit required metadata simply because the repository is small.

## 7. Repository classification

Classify every repository as one of:

* portfolio-worthy
* secondary
* practice
* fork
* archived
* empty
* unknown

Use evidence such as:

* repository size
* source-code volume
* README quality
* architecture
* dependencies
* features
* deployment
* AI functionality
* authentication
* payments
* database
* integrations
* Git history
* project complexity
* GitHub metadata

Do not use arbitrary assumptions.

## 8. Analysis depth

Portfolio-worthy:
Perform deep analysis.

Inspect:

* README
* dependency files
* source tree
* source code
* architecture
* APIs
* database
* authentication
* AI/ML
* deployment
* testing
* CI/CD
* Git history
* major features
* challenges
* learnings

Secondary:
Perform medium-depth analysis.

Practice:
Perform lightweight analysis.

Empty:
Use GitHub metadata and available README/project information.

Fork:
Record fork status and analyze only as much as needed to create accurate metadata.

Archived:
Record archived status and analyze appropriately.

## 9. Evidence-first rules

This is mandatory.

NEVER invent facts.

Do not claim:

* technologies that are not supported by evidence
* production deployment without evidence
* AWS/Azure/GCP usage without evidence
* PostgreSQL without evidence
* Stripe without evidence
* OpenAI/Gemini/Claude usage without evidence
* authentication without evidence
* payments without evidence
* metrics without evidence
* revenue without evidence
* user counts without evidence
* client testimonials without evidence
* business impact without evidence

Use actual evidence from:

* package files
* lockfiles
* source code
* configuration
* README
* Docker files
* deployment configuration
* GitHub metadata
* Git history
* API definitions
* database schema
* environment examples

## 10. Evidence collection

Internally maintain evidence for important claims.

For example:

```json
{
  "technology": "PostgreSQL",
  "evidence": [
    "prisma/schema.prisma",
    "DATABASE_URL in .env.example",
    "pg dependency"
  ],
  "confidence": "high"
}
```

Evidence can be internal analysis data and does not have to be exposed in the final portfolio metadata unless useful.

## 11. Temporary clone workflow

Process only one repository at a time.

Use:

`workspace/current/`

Workflow:

1. Select next pending repository.
2. Clone it into `workspace/current/`.
3. Analyze it.
4. Generate metadata.
5. Validate metadata.
6. Save metadata.
7. Update indexes/status.
8. Delete the temporary repository.
9. Verify `workspace/current/` is clean.
10. Move to the next repository.

Do not delete arbitrary filesystem paths.

Only delete the known temporary repository path.

## 12. Processing inventory

Create:

`processing/repository-inventory.json`

Track:

```text
repository name
repository URL
classification
status
metadata filename
last processed time
error if any
```

Statuses:

* pending
* processing
* completed
* failed

## 13. Resume capability

The system MUST support interrupted processing.

If the process stops after 40 repositories, rerunning must skip completed repositories and continue with pending/failed repositories.

Implement:

```bash
npm run resume
```

Do not reprocess successfully completed repositories unless explicitly requested.

## 14. Safe metadata merge

Before generating metadata, check whether metadata already exists.

If it exists:

* read it
* preserve manually entered information
* update only fields supported by new evidence
* never replace manual facts with guesses
* never replace testimonials with generated text
* never replace manually entered client/company information without evidence

The merge must be deterministic and testable.

## 15. Validation

Every generated metadata file must pass:

1. JSON parsing
2. JSON Schema validation
3. duplicate slug validation
4. duplicate GitHub URL validation
5. required-field validation
6. enum validation
7. URL validation where applicable
8. repository consistency checks

Only after validation succeeds may the repository be marked `completed`.

Implement:

```bash
npm run validate
```

and:

```bash
npm run validate:repo <slug>
```

## 16. Index generation

Automatically generate:

```text
output/indexes/all-projects.json
output/indexes/featured-projects.json
output/indexes/technologies.json
output/indexes/categories.json
```

Indexes must be generated from metadata files.

Do not manually maintain them.

## 17. Processing reports

Generate reports showing:

* total repositories
* completed
* pending
* failed
* classification counts
* validation errors
* metadata count
* missing metadata
* processing duration
* last processed repository

## 18. Testing

Do not start with all repositories.

First implement and test:

### Test 1

One repository.

Verify:

* clone
* analyze
* metadata generation
* validation
* save
* cleanup

### Test 2

Five repositories.

Verify:

* queue
* resume
* validation
* cleanup
* no duplicate files

### Test 3

Twenty repositories.

Verify:

* performance
* error recovery
* state persistence

### Test 4

All repositories.

Expected:

```text
repositories discovered = metadata files
```

No repository should be missing.

## 19. Security

Do not commit:

* GitHub PAT
* OAuth secrets
* API keys
* private credentials
* repository secrets

Use `.env.example` only for variable names.

Keep GitHub access read-only initially.

Do not grant write access to all GitHub repositories.

Do not grant filesystem access outside this project.

Review MCP permissions before processing repositories.

## 20. GitHub write strategy

During the initial build:

GitHub:
READ ONLY

Local project:
READ/WRITE

Metadata repository:
Local READ/WRITE

Only after successful validation should we consider automating pushes to the metadata repository.

Do not automatically push changes to GitHub during the first test.

## 21. Future architecture

Do not implement yet, but design the code so a future RAG system can consume:

`project-metadata/projects/*.json`

Potential future project:

`portfolio-rag`

It will answer queries such as:

* Which projects use Next.js?
* Which projects use PostgreSQL?
* Which projects have AI?
* Which projects demonstrate AWS?
* Which projects are SaaS applications?
* Which projects are strongest for a specific job?
* Which projects match a job description?

Do not build this in V1.

## 22. Documentation

Create a detailed README explaining:

* project purpose
* architecture
* MCP setup
* authentication
* permissions
* local development
* repository processing
* metadata generation
* validation
* resume behavior
* troubleshooting
* security
* future RAG architecture

Create a detailed AGENTS.md containing all repository-analysis rules.

Create `.agents/skills/portfolio-metadata/SKILL.md` describing the exact metadata-analysis workflow.

## 23. First objective

Do NOT process all repositories immediately.

First complete the infrastructure and verify:

1. GitHub MCP works.
2. Git MCP works.
3. Filesystem MCP works.
4. Antigravity can discover Sameer-Bagul repositories.
5. Repository inventory can be generated.
6. One repository can be cloned.
7. One repository can be analyzed.
8. One metadata JSON can be generated.
9. One metadata JSON can be validated.
10. Temporary clone can be safely deleted.

Only after these checks pass should you process five repositories.

Then twenty.

Then all repositories.

## 24. Definition of done

V1 is complete when:

```text
All GitHub repositories discovered
+
Every repository has exactly one metadata JSON
+
All metadata validates
+
No fabricated information
+
Existing manual metadata preserved
+
Processing is resumable
+
Temporary repositories cleaned
+
Indexes generated
+
Reports generated
+
Tests passing
```

Do not stop after creating the project skeleton.

Actually configure the MCPs, verify their connectivity, implement the processing pipeline, and run the one-repository proof of concept.

When a capability is unavailable through an MCP, document the gap and use the smallest safe local implementation necessary rather than immediately creating a custom MCP server.

---

# 24. One important correction to our earlier plan

I would **not automatically install both GitHub MCP and Git MCP if GitHub MCP already gives Antigravity enough repository access**.

The reason is simplicity.

Start:

```text
GitHub MCP
Filesystem MCP
```

Then test the first repository.

If deep local Git analysis is needed:

```text
+ Git MCP
```

The official Git MCP is a reference implementation and its own documentation warns that it is early/developmental, while the reference server repository also has published security advisories. ([GitHub][3])

So I'd make Git MCP **conditional**, not mandatory.

### Ideal V1

```text
                    Antigravity
                         |
              ┌──────────┴──────────┐
              |                     |
         GitHub MCP          Filesystem MCP
              |                     |
              v                     v
        GitHub repos          Local project
              |                     |
              └──────────┬──────────┘
                         v
                 Portfolio Analyzer
                         |
                         v
                  project-metadata
```

If the agent says:

> "I need deeper Git history/local repository capabilities"

then enable:

```text
Git MCP
```

---

## Official references to give Antigravity

* [Antigravity MCP documentation](https://antigravity.google/docs/mcp/?utm_source=chatgpt.com)
* [Antigravity CLI reference](https://antigravity.google/docs/cli/reference/?utm_source=chatgpt.com)
* [Official GitHub MCP Server](https://github.com/github/github-mcp-server?utm_source=chatgpt.com)
* [Official MCP Servers repository](https://github.com/modelcontextprotocol/servers?utm_source=chatgpt.com)
* [Official Git MCP server](https://github.com/modelcontextprotocol/servers/tree/main/src/git?utm_source=chatgpt.com)
* [Official MCP Filesystem server](https://github.com/modelcontextprotocol/servers/tree/main/src/filesystem?utm_source=chatgpt.com)
* [MCP specification/documentation](https://github.com/modelcontextprotocol/modelcontextprotocol?utm_source=chatgpt.com)

Antigravity's current docs also confirm that you can inspect/manage MCP servers through `/mcp`, and MCP tools can be scoped through permissions such as `mcp(server/tool)` or `mcp(server/*)`. ([Google Antigravity][1])

**So the best move now is to open a completely new Antigravity project, paste the master prompt above, and let it first configure the MCP layer and prove the one-repository pipeline before we let it loose on all 122 repositories.**

[1]: https://antigravity.google/docs/mcp/?utm_source=chatgpt.com "MCP | Google Antigravity Docs"
[2]: https://github.com/github/github-MCP-server?utm_source=chatgpt.com "GitHub - github/github-mcp-server: GitHub's official MCP Server · GitHub"
[3]: https://github.com/modelcontextprotocol/servers/blob/main/src/git/README.md?utm_source=chatgpt.com "servers/src/git/README.md at main · modelcontextprotocol/servers · GitHub"
[4]: https://github.com/modelcontextprotocol/servers/security?utm_source=chatgpt.com "Overview · modelcontextprotocol/servers · GitHub"
[5]: https://github.com/modelcontextprotocol/servers?utm_source=chatgpt.com "GitHub - modelcontextprotocol/servers: Model Context Protocol Servers · GitHub"
[6]: https://www.antigravity.google/docs/mcp?utm_source=chatgpt.com "MCP | Google Antigravity Docs"
