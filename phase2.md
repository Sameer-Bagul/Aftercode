Yes. With the clarified requirement, I would simplify the stack considerably.

**The repo is cloned locally into the MCP workspace. Antigravity connects to the MCP. The MCP creates the entire video project inside that cloned repo.** External APIs are providers, not the core architecture.

Here is the single decision table I would use.

| Stage                     | Tool / API                                           | Role in our MCP                                           | Input                       | Output                   | Automation                          | Free / OSS            | Decision     |
| ------------------------- | ---------------------------------------------------- | --------------------------------------------------------- | --------------------------- | ------------------------ | ----------------------------------- | --------------------- | ------------ |
| Repo                      | **Git CLI**                                          | Clone repo into sandbox                                   | Git URL                     | Local repo               | Full                                | Free                  | **USE**      |
| Repo metadata             | **GitHub API**                                       | Repo metadata, commits, releases, issues if needed        | Repo URL/token              | JSON                     | Full                                | Free API tier         | **USE**      |
| Code analysis             | **Tree-sitter**                                      | Parse source code AST                                     | Source files                | AST                      | Full                                | OSS                   | **USE**      |
| Code analysis             | **GitHub Linguist**                                  | Detect languages/code composition                         | Repo                        | Language stats           | Full                                | OSS                   | **USE**      |
| Dependency analysis       | **package.json / lockfiles / requirements / Docker** | Detect actual stack                                       | Repo files                  | `tech-stack.json`        | Full                                | Free                  | **USE**      |
| Architecture              | **Custom analyzer + LLM**                            | Infer actual system architecture                          | Code + docs                 | `architecture.json`      | Full                                | Depends on LLM        | **USE**      |
| Architecture              | **Mermaid**                                          | Deterministic architecture/flow diagrams                  | JSON/DSL                    | SVG/PNG                  | Full                                | OSS                   | **USE**      |
| Architecture              | **Graphviz**                                         | Dependency/data relationship graphs                       | DOT                         | SVG/PNG                  | Full                                | OSS                   | **USE**      |
| Visual diagrams           | **Napkin AI API**                                    | Beautiful high-level diagrams, workflows, concepts        | Text/context                | SVG/PNG/PPT              | API                                 | Free credits          | **USE**      |
| Mindmaps                  | **Napkin / Mermaid**                                 | Concept/mindmap visuals                                   | Structured text             | SVG/PNG                  | Full                                | Free/OSS              | **USE**      |
| Icons                     | **Iconify API**                                      | Framework, database, cloud and tech logos                 | Icon name                   | SVG                      | Full                                | Free/OSS              | **USE**      |
| Animated assets           | **LottieFiles**                                      | Reusable animations                                       | Asset query/download        | Lottie/SVG/etc.          | Partial/API dependent               | Large free library    | **USE**      |
| Product screenshots       | **Playwright**                                       | Navigate SaaS and capture UI                              | URL + actions               | PNG                      | Full                                | OSS                   | **USE**      |
| Product video             | **Playwright + FFmpeg**                              | Automated product walkthrough recording                   | Browser flow                | MP4                      | Full                                | OSS                   | **USE**      |
| Screen recording fallback | **OBS Studio**                                       | Real desktop/application capture                          | Screen                      | Video                    | Partial                             | OSS                   | **OPTIONAL** |
| Generated images          | **Krea**                                             | Custom visual/B-roll assets                               | Prompt                      | Image/video              | API availability needs verification | Free daily allocation | **OPTIONAL** |
| Generated images          | **Leonardo**                                         | Illustration/concept assets                               | Prompt                      | PNG                      | API                                 | Free allocation       | **OPTIONAL** |
| Local image generation    | **Stable Diffusion / ComfyUI**                       | Unlimited local image generation                          | Prompt/workflow             | PNG                      | Full                                | OSS                   | **OPTIONAL** |
| Image search              | **Wikimedia Commons API**                            | Real-world/reference images                               | Search query                | Image + metadata         | Full                                | Free                  | **USE**      |
| Image search              | **Openverse API**                                    | Openly licensed images                                    | Search query                | Image + license metadata | Full                                | Free                  | **USE**      |
| Stock images              | **Unsplash API**                                     | High-quality photography                                  | Query                       | Image + attribution      | Full                                | Free with API limits  | **OPTIONAL** |
| Stock video               | **Pexels API**                                       | Video B-roll                                              | Query                       | MP4                      | Full                                | Free API              | **OPTIONAL** |
| Asset inspection          | **FFprobe**                                          | Dimensions, codec, FPS, bitrate, duration, audio metadata | Asset                       | JSON                     | Full                                | OSS                   | **USE**      |
| Asset processing          | **FFmpeg**                                           | Resize, crop, convert, normalize, extract frames          | Assets                      | Normalized media         | Full                                | OSS                   | **CORE**     |
| Image processing          | **Sharp**                                            | Fast image resizing/composition/preprocessing             | Images                      | PNG/WebP/JPEG            | Full                                | OSS                   | **USE**      |
| SVG processing            | **SVGO**                                             | Optimize generated SVGs                                   | SVG                         | Optimized SVG            | Full                                | OSS                   | **USE**      |
| Story                     | **LLM provider interface**                           | Script and narrative generation                           | Project knowledge           | Script JSON              | Full                                | Depends on provider   | **CORE**     |
| Local story AI            | **Ollama**                                           | Local script/story analysis                               | Project data                | JSON/text                | Full                                | OSS                   | **USE**      |
| Story template            | **Our own JSON/MD templates**                        | Standardize video structure                               | Template + project          | Storyboard               | Full                                | Free                  | **CORE**     |
| Storyboard                | **Custom JSON schema**                               | Define every scene                                        | Script + assets             | `storyboard.json`        | Full                                | Free                  | **CORE**     |
| Voice                     | **ElevenLabs API**                                   | High-quality narration                                    | Script                      | WAV/MP3                  | Full                                | Free allocation       | **PRIMARY**  |
| Voice fallback            | **Google Cloud TTS**                                 | Backup narration                                          | Script                      | WAV/MP3                  | Full                                | Generous free tier    | **FALLBACK** |
| Local voice               | **Piper TTS**                                        | Completely local narration                                | Script                      | WAV                      | Full                                | OSS                   | **FALLBACK** |
| Speech analysis           | **Whisper**                                          | Word/sentence timestamps                                  | Voice                       | JSON/SRT/VTT             | Full                                | OSS                   | **USE**      |
| Captions                  | **Whisper**                                          | Generate subtitles                                        | Voice                       | SRT/VTT/JSON             | Full                                | OSS                   | **USE**      |
| Audio                     | **FFmpeg loudnorm**                                  | Normalize voice/music                                     | Audio                       | Normalized audio         | Full                                | OSS                   | **USE**      |
| Music                     | **YouTube Audio Library**                            | Background music                                          | Search/manual selection     | Audio                    | Partial                             | Free                  | **OPTIONAL** |
| SFX                       | **Freesound API**                                    | UI/transition sound effects                               | Query                       | Audio + license          | Full                                | Free                  | **USE**      |
| Animation                 | **Remotion**                                         | Main video composition                                    | Scene JSON/assets           | Frames/video             | Full                                | Free for our use case | **CORE**     |
| Motion                    | **GSAP**                                             | Advanced 2D motion inside scenes                          | React scene                 | Animation                | Full                                | Free core             | **CORE**     |
| Technical animation       | **Motion Canvas**                                    | Complex technical/vector animations                       | TS scene                    | Frames/video             | Full                                | OSS                   | **OPTIONAL** |
| 3D                        | **Three.js / R3F**                                   | 3D technical/product visuals                              | Scene data                  | Frames                   | Full                                | OSS                   | **OPTIONAL** |
| 3D rendering              | **Blender**                                          | Complex 3D scenes                                         | `.blend`/Python             | PNG/MP4                  | Full                                | OSS                   | **OPTIONAL** |
| Mathematical animation    | **Manim**                                            | Algorithms/math/ML concepts                               | Python                      | Frames/video             | Full                                | OSS                   | **OPTIONAL** |
| Timeline                  | **Remotion Timeline**                                | Scene sequencing                                          | `storyboard.json`           | Render composition       | Full                                | Free                  | **CORE**     |
| Rendering                 | **Remotion Renderer**                                | Render final video                                        | Composition                 | MP4/WebM                 | Full                                | Free                  | **CORE**     |
| Rendering                 | **FFmpeg**                                           | Final encoding/muxing                                     | Frames + audio              | MP4                      | Full                                | OSS                   | **CORE**     |
| Compression               | **FFmpeg / HandBrake CLI**                           | Optimize final file                                       | MP4                         | Smaller MP4              | Full                                | OSS                   | **USE**      |
| QA                        | **FFprobe**                                          | Verify technical output                                   | MP4                         | Metadata                 | Full                                | OSS                   | **USE**      |
| QA                        | **OpenCV**                                           | Detect black frames, visual anomalies                     | Frames                      | QA report                | Full                                | OSS                   | **USE**      |
| QA                        | **Whisper**                                          | Verify narration/subtitles                                | Final video                 | Transcript               | Full                                | OSS                   | **USE**      |
| QA                        | **LLM validator**                                    | Check claims against repo                                 | Video script + project data | Validation report        | Full                                | Depends on LLM        | **USE**      |
| Asset licensing           | **Our Asset Registry**                               | Track source/license/attribution                          | Asset metadata              | `attribution.json`       | Full                                | Free                  | **CORE**     |
| Asset caching             | **Local filesystem + hashes**                        | Avoid regenerating assets                                 | Asset                       | Cached asset             | Full                                | Free                  | **CORE**     |
| Pipeline state            | **SQLite**                                           | Track jobs/scenes/assets                                  | JSON                        | DB                       | Full                                | OSS                   | **USE**      |
| Configuration             | **JSON/YAML**                                        | Project/video settings                                    | Config                      | Runtime config           | Full                                | Free                  | **CORE**     |
| MCP                       | **MCP TypeScript SDK**                               | Expose pipeline to Antigravity                            | MCP requests                | Tool results             | Full                                | OSS                   | **CORE**     |
| Orchestration             | **Our TypeScript pipeline engine**                   | Execute stages and retries                                | Job                         | Artifacts                | Full                                | Free                  | **CORE**     |
| Logging                   | **Pino**                                             | Pipeline logs                                             | Events                      | Logs                     | Full                                | OSS                   | **USE**      |
| Packaging                 | **Docker**                                           | Reproducible video environment                            | Project                     | Container                | Full                                | Free                  | **USE**      |

## The stack I would actually lock in

We do **not** need every row in the first version.

The core should be:

```text
                    ANTIGRAVITY
                         |
                        MCP
                         |
                SaaS Video Engine
                         |
       +-----------------+-----------------+
       |                 |                 |
       v                 v                 v
   REPO ENGINE       STORY ENGINE       ASSET ENGINE
       |                 |                 |
    Git CLI             Ollama          Wikimedia
    Tree-sitter         Template        Openverse
    Linguist            LLM             Iconify
    Parsers             Storyboard      Napkin
       |                 |               Lottie
       +-----------------+                 |
                 |                         |
                 v                         v
            PROJECT JSON             ASSET REGISTRY
                 |                         |
                 +------------+------------+
                              |
                              v
                       CAPTURE ENGINE
                              |
                         Playwright
                              |
                              v
                       PRODUCT VIDEO
                              |
                 +------------+------------+
                 |                         |
                 v                         v
             VOICE                     DIAGRAMS
                 |                         |
           ElevenLabs                    SVG
           Whisper                       Mermaid
                 |                       Napkin
                 +------------+------------+
                              |
                              v
                       SCENE ENGINE
                              |
                    Remotion + GSAP
                              |
                              v
                           FFmpeg
                              |
                              v
                       VIDEO QA
                              |
                              v
                         FINAL MP4
```

# Most important part: everything lives inside the cloned repo

I agree with your approach here.

We don't need to upload the repository somewhere.

The MCP can work with:

```text
/workspace/
    project/
        <cloned SaaS repo>

        .video/
            config.json
            instructions.md

            knowledge/
                project.json
                architecture.json
                tech-stack.json
                features.json

            script/
                script.md
                narration.json

            storyboard/
                storyboard.json

            assets/
                images/
                icons/
                diagrams/
                animations/

            captures/
                screenshots/
                product-demo/

            audio/
                narration.wav
                music.wav
                sfx/

            scenes/
                ...

            renders/
                preview.mp4
                final.mp4

            reports/
                analysis.json
                asset-report.json
                qa-report.json
                attribution.json
```

That means **the repository itself becomes the video workspace**.

---

# The asset pipeline you described

This should be one of the most deterministic parts of the system:

```text
Scene requires:
1920x1080 background
        |
        v
Asset Planner
        |
        +---- Wikimedia?
        +---- Openverse?
        +---- Iconify?
        +---- Napkin?
        +---- AI generation?
        +---- Generate SVG?
        |
        v
Download / Generate
        |
        v
FFprobe
        |
        v
Asset Metadata
        |
        v
Sharp / FFmpeg
        |
        v
NORMALIZED ASSET
        |
        v
Scene Placement
        |
        v
Remotion
```

For every asset:

```json
{
  "id": "asset_042",
  "type": "image",
  "source": "wikimedia",
  "originalWidth": 3840,
  "originalHeight": 2160,
  "originalSize": 4820392,

  "target": {
    "width": 1920,
    "height": 1080
  },

  "transform": {
    "fit": "cover",
    "x": 0,
    "y": 0,
    "scale": 1.05
  },

  "license": {
    "name": "CC BY-SA 4.0",
    "attributionRequired": true
  }
}
```

Then the renderer doesn't have to think.

It receives:

```text
Asset
+
X
+
Y
+
Width
+
Height
+
Scale
+
Rotation
+
Opacity
+
Animation
+
Start Frame
+
End Frame
```

and renders it.

---

# One change I would make to our previous plan

I would **not make Motion Canvas a core dependency**.

We can get very far with:

```text
React
+
Remotion
+
GSAP
+
SVG
+
FFmpeg
```

Motion Canvas becomes an optional specialist renderer for scenes where Remotion isn't convenient.

Similarly, I would not make Krea/Leonardo mandatory.

Our hierarchy should be:

```text
                ASSET GENERATOR
                      |
        +-------------+-------------+
        |             |             |
        v             v             v
   Deterministic   External AI    Local AI
        |             |             |
   SVG/Mermaid      Krea/etc.     ComfyUI
   Iconify          Napkin
   Graphviz
        |
        v
    PREFERRED
```

This keeps the MCP **cheap, reproducible and autonomous**.

---

# The final MCP tool surface

I would eventually expose around **12 to 15 high-level MCP tools** to Antigravity:

```text
analyze_project
create_video_project
configure_video
generate_story
create_storyboard
plan_assets
generate_assets
capture_product
generate_voiceover
build_scenes
preview_video
render_video
validate_video
fix_video
export_video
```

Internally these can call dozens of small modules.

So Antigravity doesn't have to micromanage:

```text
ffprobe
→ resize
→ convert
→ download
→ normalize
→ generate SVG
→ etc.
```

It just asks:

```text
generate_assets()
```

and the MCP handles the machinery.

That is the architecture I would lock before we start coding.


=================================================================================================
=================================================================================================
=================================================================================================
=================================================================================================
=================================================================================================

Yes. At this point I would stop treating this as "a video generator" and design it as a **local AI video-engineering platform**.

The core idea is:

> **Antigravity = Director / Agent**
> **Your MCP = Video Production Engine**
> **Cloned GitHub repo = Source of truth**
> **Project Knowledge Graph = Understanding of the SaaS**
> **Remotion + GSAP = Composition engine**
> **FFmpeg = Media processing/rendering layer**

The MCP should not expose 50 tiny tools to Antigravity. It should expose a small number of powerful workflows, while internally orchestrating dozens of specialized modules.

Below is the implementation plan I would follow.

---

# 1. Final Goal

You give Antigravity something like:

> "Create a 4-minute technical product video for this repository. Focus on the RAG architecture, show the actual product, explain the AI pipeline, and make it cinematic."

The system should autonomously:

```text
GitHub URL
   ↓
Clone repository
   ↓
Understand repository
   ↓
Run / inspect application
   ↓
Build Project Knowledge Graph
   ↓
Understand features + architecture
   ↓
Generate video strategy
   ↓
Generate script
   ↓
Generate storyboard
   ↓
Plan visual assets
   ↓
Collect / generate assets
   ↓
Capture real product
   ↓
Generate diagrams
   ↓
Generate voice
   ↓
Generate captions
   ↓
Build scenes
   ↓
Animate
   ↓
Render preview
   ↓
QA
   ↓
Fix
   ↓
Render final
   ↓
MP4 + SRT + project report
```

The important part is that **every step produces an artifact**.

You never want:

```text
AI thinks → magic happens → video
```

You want:

```text
repo
 ↓
analysis.json
 ↓
knowledge graph
 ↓
script.json
 ↓
storyboard.json
 ↓
asset-plan.json
 ↓
assets
 ↓
scene-manifest.json
 ↓
render
 ↓
qa-report.json
 ↓
final.mp4
```

That makes the system debuggable.

---

# 2. The Architecture I Recommend

```text
                         ANTIGRAVITY
                              │
                              │ MCP
                              ▼
                 ┌────────────────────────┐
                 │     VIDEO MCP SERVER   │
                 │                        │
                 │  Workflow Orchestrator │
                 └────────────┬───────────┘
                              │
          ┌───────────────────┼───────────────────┐
          │                   │                   │
          ▼                   ▼                   ▼
   PROJECT ENGINE       CONTENT ENGINE      MEDIA ENGINE
          │                   │                   │
          │                   │                   │
   Repository             Script AI          Assets
   Analyzer               Storyboard         Voice
   Code Parser            Scene Planner      Music
   Runtime Analyzer       Visual Planner     Capture
   Architecture           Fact Checker       Diagrams
          │                   │                   │
          └───────────────────┼───────────────────┘
                              │
                              ▼
                    PROJECT KNOWLEDGE GRAPH
                              │
                              ▼
                       SCENE MANIFEST
                              │
                              ▼
                    REMOTION + GSAP
                              │
                              ▼
                           FFMPEG
                              │
                              ▼
                        VIDEO QA ENGINE
                              │
                              ▼
                         FINAL VIDEO
```

---

# 3. First Design Decision: Local-First

I strongly recommend making the first version **local-first**.

Your machine becomes:

```text
Antigravity
   +
MCP
   +
Docker
   +
Node
   +
Python
   +
FFmpeg
   +
Remotion
   +
Playwright
   +
Ollama
```

External APIs are only providers.

For example:

```text
              ┌── ElevenLabs
              ├── Google TTS
Voice Engine ─┤
              └── Piper
```

and:

```text
              ┌── Napkin
              ├── Mermaid
Diagram ──────┤
              ├── Graphviz
              └── Custom SVG
```

This is extremely important.

If Napkin changes its API tomorrow, your video engine should continue working.

---

# 4. Repository Structure

Create a dedicated repository for the MCP.

Something like:

```text
saas-video-engine/
```

Inside:

```text
saas-video-engine/
│
├── src/
│   │
│   ├── mcp/
│   │   ├── server.ts
│   │   ├── tools/
│   │   ├── resources/
│   │   └── prompts/
│   │
│   ├── orchestrator/
│   │   ├── pipeline.ts
│   │   ├── workflow.ts
│   │   ├── state.ts
│   │   └── checkpoint.ts
│   │
│   ├── project/
│   │   ├── clone.ts
│   │   ├── scanner.ts
│   │   ├── analyzer.ts
│   │   ├── runtime.ts
│   │   ├── dependencies.ts
│   │   ├── architecture.ts
│   │   └── knowledge.ts
│   │
│   ├── code/
│   │   ├── treesitter.ts
│   │   ├── linguist.ts
│   │   ├── routes.ts
│   │   ├── components.ts
│   │   └── ai-detection.ts
│   │
│   ├── content/
│   │   ├── script.ts
│   │   ├── storyboard.ts
│   │   ├── fact-checker.ts
│   │   ├── scene-planner.ts
│   │   └── templates/
│   │
│   ├── assets/
│   │   ├── manager.ts
│   │   ├── registry.ts
│   │   ├── downloader.ts
│   │   ├── normalizer.ts
│   │   ├── icons/
│   │   ├── images/
│   │   ├── diagrams/
│   │   └── providers/
│   │
│   ├── capture/
│   │   ├── playwright.ts
│   │   ├── browser.ts
│   │   ├── flows.ts
│   │   └── screenshots.ts
│   │
│   ├── audio/
│   │   ├── tts.ts
│   │   ├── whisper.ts
│   │   ├── music.ts
│   │   └── mixer.ts
│   │
│   ├── diagrams/
│   │   ├── mermaid.ts
│   │   ├── graphviz.ts
│   │   ├── napkin.ts
│   │   └── svg.ts
│   │
│   ├── video/
│   │   ├── remotion/
│   │   ├── scenes/
│   │   ├── transitions/
│   │   ├── timeline.ts
│   │   └── renderer.ts
│   │
│   ├── media/
│   │   ├── ffmpeg.ts
│   │   ├── ffprobe.ts
│   │   ├── sharp.ts
│   │   └── svgo.ts
│   │
│   ├── qa/
│   │   ├── video.ts
│   │   ├── audio.ts
│   │   ├── visual.ts
│   │   ├── captions.ts
│   │   └── semantic.ts
│   │
│   └── providers/
│       ├── llm/
│       ├── tts/
│       ├── images/
│       ├── diagrams/
│       └── music/
│
├── remotion/
│   ├── Root.tsx
│   ├── compositions/
│   ├── components/
│   ├── scenes/
│   └── styles/
│
├── schemas/
│   ├── project.ts
│   ├── script.ts
│   ├── storyboard.ts
│   ├── asset.ts
│   ├── scene.ts
│   └── video.ts
│
├── templates/
│   ├── technical-saas/
│   ├── ai-product/
│   ├── developer-tool/
│   ├── portfolio/
│   └── cinematic-product/
│
├── tests/
│
├── docker/
│
├── scripts/
│
├── docs/
│
├── package.json
├── tsconfig.json
├── Dockerfile
└── README.md
```

---

# 5. The Sandbox Architecture

When you give it:

```text
https://github.com/user/project
```

the MCP creates:

```text
sandbox/
└── projects/
    └── project-name/
```

Then:

```text
project-name/
│
├── original/
│   └── cloned repository
│
└── .video/
```

I would **never modify the original application unnecessarily**.

Instead:

```text
original/
    ↓
analysis
    ↓
.video/
```

---

# 6. `.video` Directory

This becomes the heart of the system.

```text
.video/
│
├── config.json
│
├── instructions.md
│
├── state.json
│
├── knowledge/
│   ├── project.json
│   ├── tech-stack.json
│   ├── features.json
│   ├── routes.json
│   ├── components.json
│   ├── architecture.json
│   ├── dependencies.json
│   ├── ai-system.json
│   └── knowledge-graph.json
│
├── content/
│   ├── concept.json
│   ├── script.json
│   ├── narration.txt
│   ├── storyboard.json
│   └── scene-plan.json
│
├── assets/
│   ├── images/
│   ├── icons/
│   ├── diagrams/
│   ├── backgrounds/
│   └── generated/
│
├── capture/
│   ├── screenshots/
│   ├── recordings/
│   └── browser-state/
│
├── audio/
│   ├── narration/
│   ├── music/
│   ├── sfx/
│   └── final/
│
├── scenes/
│   ├── 001-hook/
│   ├── 002-problem/
│   ├── 003-product/
│   ├── 004-architecture/
│   └── ...
│
├── render/
│   ├── preview/
│   ├── final/
│   └── frames/
│
├── qa/
│   ├── technical.json
│   ├── visual.json
│   ├── audio.json
│   └── semantic.json
│
└── reports/
    ├── attribution.json
    ├── generation.json
    └── final-report.md
```

This means if scene 7 fails, you don't regenerate scenes 1-6.

---

# 7. MCP Layer

Use the current MCP TypeScript SDK rather than building your own protocol implementation. The current v2 SDK provides server tools, resources and prompts, with stdio appropriate for local process integrations. ([Model Context Protocol][1])

Your MCP should expose roughly:

```text
create_video_project
analyze_project
configure_video
generate_video_plan
generate_script
generate_storyboard
generate_assets
capture_product
generate_audio
build_video
preview_video
validate_video
fix_video
render_video
get_video_status
```

But internally these become large workflows.

---

# 8. `create_video_project`

Antigravity calls:

```json
{
  "repo": "https://github.com/user/project",
  "template": "technical-saas",
  "duration": 240,
  "instructions": "Focus on RAG architecture and real product demo."
}
```

MCP does:

```text
validate repo
      ↓
create sandbox
      ↓
clone repo
      ↓
initialize .video
      ↓
save configuration
      ↓
create pipeline state
```

Output:

```json
{
  "projectId": "skillify-001",
  "path": ".../sandbox/projects/skillify",
  "status": "initialized"
}
```

---

# 9. Repository Ingestion

Use Git for the actual clone.

GitHub's APIs are useful for metadata and repository information, but for your local workflow you don't need to download the entire repository through the REST API. Git itself is the correct ingestion mechanism. GitHub also documents local cloning as a standard repository workflow. ([GitHub Docs][2])

Flow:

```text
GitHub URL
   ↓
parse owner/repo
   ↓
authentication check
   ↓
git clone
   ↓
detect branch
   ↓
record commit SHA
   ↓
freeze source version
```

Store:

```json
{
  "repository": "Sameer-Bagul/project",
  "branch": "main",
  "commit": "abc123",
  "clonedAt": "...",
  "private": false
}
```

This is important because your video must correspond to a **specific version of the code**.

---

# 10. Repository Analyzer

This should be one of your biggest modules.

Don't immediately send the entire repo to an LLM.

First extract facts deterministically.

Analyze:

```text
README
package.json
pnpm-lock.yaml
package-lock.json
yarn.lock
requirements.txt
pyproject.toml
Dockerfile
docker-compose.yml
.env.example
next.config.*
vite.config.*
tsconfig.json
routes
API endpoints
React components
database schemas
models
services
controllers
hooks
utilities
tests
```

Also detect:

```text
Next.js
React
Vite
Express
FastAPI
Django
MongoDB
Postgres
Redis
Vector DB
LangChain
LangGraph
OpenAI
Gemini
Anthropic
Ollama
Docker
AWS
Cloudflare
Vercel
etc.
```

---

# 11. Code Analysis

Use Tree-sitter for AST-level analysis.

Example:

```text
React
 ↓
find components
 ↓
find imports
 ↓
find hooks
 ↓
find API calls
 ↓
find routes
 ↓
find state management
```

Backend:

```text
Express
 ↓
routes
 ↓
controllers
 ↓
services
 ↓
database
```

AI:

```text
embedding
 ↓
vector DB
 ↓
retriever
 ↓
LLM
 ↓
agent
 ↓
response
```

The analyzer should produce:

```json
{
  "frontend": [],
  "backend": [],
  "database": [],
  "ai": [],
  "integrations": [],
  "infrastructure": []
}
```

---

# 12. Runtime Analyzer

This is extremely important.

Static analysis tells us:

> "There is a Next.js application."

Runtime analysis tells us:

> "Here is what the actual application looks like."

Try:

```text
npm install
npm run dev
```

or:

```text
pnpm install
pnpm dev
```

or:

```text
docker compose up
```

based on detected configuration.

Then:

```text
Playwright
   ↓
localhost
   ↓
discover routes
   ↓
capture screenshots
   ↓
interact with UI
```

Playwright already supports browser video recording as well as screenshots, so it is a good foundation for automated product capture. ([Playwright][3])

---

# 13. Application Discovery

Your system should automatically discover:

```text
/
/login
/dashboard
/settings
/projects
/chat
/upload
/analytics
/etc.
```

Then classify them:

```text
authentication
dashboard
core product
settings
admin
marketing
utility
```

You don't want the video showing a random settings page.

The AI should determine:

> "These are the 3 screens that best demonstrate the product."

---

# 14. Project Knowledge Graph

This is the most important artifact.

Create:

```text
knowledge-graph.json
```

Example:

```json
{
  "project": "Skillify",

  "nodes": [
    {
      "id": "frontend",
      "type": "system",
      "name": "Next.js"
    },
    {
      "id": "api",
      "type": "system",
      "name": "API"
    },
    {
      "id": "rag",
      "type": "ai",
      "name": "RAG Pipeline"
    },
    {
      "id": "vector-db",
      "type": "database",
      "name": "Vector Database"
    }
  ],

  "edges": [
    {
      "from": "frontend",
      "to": "api",
      "relationship": "requests"
    },
    {
      "from": "api",
      "to": "rag",
      "relationship": "invokes"
    }
  ]
}
```

This graph powers:

* script
* diagrams
* narration
* architecture scene
* asset selection
* animation
* fact checking

---

# 15. Separate Facts From AI Inference

This is critical.

Every piece of information should have:

```json
{
  "claim": "The application uses PostgreSQL",
  "source": "package.json",
  "confidence": 0.99
}
```

or:

```json
{
  "claim": "The system uses RAG",
  "source": "src/ai/retriever.ts",
  "confidence": 0.98
}
```

Then:

```text
FACT
INFERENCE
USER PROVIDED
AI GENERATED
UNKNOWN
```

This prevents hallucinated technical claims.

---

# 16. User Instructions

The repo should support:

```text
.video/instructions.md
```

Example:

```md
# Video

Duration: 4 minutes

Style:
Technical
Cinematic
Minimal

Focus:
- RAG
- AI architecture
- Product UI
- Engineering decisions

Show:
- Real application
- Architecture
- Code
- Data flow

Avoid:
- Fake metrics
- Generic AI footage
- Fake testimonials

Tone:
Confident
Technical
Developer-focused
```

The user instruction gets merged with the discovered facts.

---

# 17. Video Templates

Don't build one video format.

Create templates.

```text
technical-saas
ai-product
developer-tool
portfolio-project
startup-demo
architecture-deep-dive
```

Each template defines:

```json
{
  "duration": 240,

  "sections": [
    "hook",
    "problem",
    "solution",
    "product",
    "architecture",
    "deep-dive",
    "engineering",
    "closing"
  ]
}
```

---

# 18. Script Generation

The LLM should NOT directly generate a video.

It generates structured content.

Example:

```json
{
  "title": "How Skillify Turns Your Resume Into an AI Career Roadmap",

  "scenes": [
    {
      "id": "hook",
      "duration": 12,
      "narration": "...",
      "visualIntent": "show product + problem"
    }
  ]
}
```

Then the storyboard engine decides how to visualize it.

This separation is extremely important.

---

# 19. Script Generation Pipeline

```text
Project Knowledge
       +
User Instructions
       +
Template
       ↓
Narrative Planner
       ↓
Script Writer
       ↓
Technical Fact Checker
       ↓
Script Optimizer
       ↓
Final Script
```

The fact checker should compare every technical statement against:

```text
knowledge graph
```

If it cannot verify:

```text
REMOVE
```

or:

```text
FLAG FOR REVIEW
```

---

# 20. Storyboard Engine

The storyboard is the bridge between language and video.

Example:

```json
{
  "scene": "architecture",

  "duration": 22,

  "narration": "...",

  "visuals": [
    {
      "type": "architecture-diagram",
      "source": "knowledgeGraph"
    },
    {
      "type": "data-flow",
      "source": "knowledgeGraph"
    }
  ],

  "animation": {
    "style": "technical",
    "camera": "push-in"
  }
}
```

---

# 21. Scene Types

Build reusable scene primitives.

At minimum:

```text
TitleScene
HookScene
ProblemScene
ProductScene
ScreenshotScene
BrowserDemoScene
ArchitectureScene
FlowScene
PipelineScene
CodeScene
MetricsScene
ComparisonScene
QuoteScene
TechnologyScene
ClosingScene
```

Then the LLM composes these.

---

# 22. Asset Engine

The asset engine should answer:

> "What visuals are required for this scene?"

Example:

```json
{
  "scene": "rag",

  "assets": [
    {
      "type": "vector-icon",
      "query": "database"
    },
    {
      "type": "diagram",
      "query": "RAG pipeline"
    },
    {
      "type": "product-capture",
      "route": "/chat"
    }
  ]
}
```

---

# 23. Asset Provider System

Use a provider interface.

```ts
interface AssetProvider {
  search(query: string): Promise<Asset[]>
  download(asset: Asset): Promise<string>
}
```

Then:

```text
WikimediaProvider
OpenverseProvider
UnsplashProvider
PexelsProvider
IconifyProvider
KreaProvider
LeonardoProvider
LocalSDProvider
```

The orchestration layer doesn't care which provider supplied the asset.

---

# 24. Asset Priority

The system should prefer:

```text
1. Actual product
2. Actual repository assets
3. Programmatic diagrams
4. Official technology icons
5. Open-license photography
6. Generated illustrations
7. Generated cinematic footage
```

This prevents the video from looking like generic AI content.

---

# 25. Asset Registry

Every asset gets:

```json
{
  "id": "asset_123",

  "source": "wikimedia",

  "originalUrl": "...",

  "localPath": "...",

  "author": "...",

  "license": "CC BY-SA",

  "licenseUrl": "...",

  "attributionRequired": true,

  "retrievedAt": "...",

  "width": 3840,

  "height": 2160,

  "format": "jpg"
}
```

This automatically generates:

```text
attribution.md
```

at the end.

---

# 26. Asset Normalization

This is where your earlier idea is exactly right.

Suppose:

```text
target:
1920x1080
30 FPS
48kHz
H.264
```

An image could be:

```text
3840x2160
```

Another:

```text
1200x800
```

Another:

```text
SVG
```

Another:

```text
4K MP4
```

The asset engine normalizes them.

```text
source
 ↓
ffprobe
 ↓
metadata
 ↓
normalizer
 ↓
1920x1080 compatible asset
```

Use:

```text
ffprobe
FFmpeg
Sharp
SVGO
```

Do not ask the LLM to determine dimensions.

---

# 27. Diagram Engine

Use a layered strategy.

### Level 1

Mermaid.

For:

```text
architecture
sequence
flowchart
state
database
```

### Level 2

Graphviz.

For:

```text
dependencies
module relationships
service relationships
```

### Level 3

Napkin.

For:

```text
beautiful conceptual diagrams
mindmaps
process diagrams
visual explanations
```

### Level 4

Custom SVG/React.

For:

```text
animated RAG
data packets
AI agent loops
network traffic
vector search
```

This is much better than depending entirely on one diagram generator.

---

# 28. Product Capture Engine

This should become one of the strongest features.

Example:

```json
{
  "route": "/dashboard",
  "actions": [
    "waitForLoad",
    "click:New Project",
    "type:...",
    "click:Generate",
    "waitForResponse"
  ]
}
```

Playwright executes this.

Capture:

```text
screenshot
video
mouse movement
click
scroll
typing
loading
result
```

Then your video can show the actual SaaS.

---

# 29. Automatic Demo Discovery

Eventually the system should be able to inspect the UI and determine:

```text
What can I demonstrate?
```

For example:

```text
Dashboard
 ↓
Upload resume
 ↓
Generate analysis
 ↓
Show result
 ↓
Open roadmap
```

This becomes:

```text
Demo Flow
```

and gets converted into a storyboard scene.

---

# 30. Browser Capture Modes

Implement:

```text
Screenshot
Video
Step-by-step capture
Interactive demo
Scroll capture
Element zoom
```

Don't depend on OBS for the core engine.

OBS can remain a manual fallback.

---

# 31. Voice Engine

Use an abstraction:

```ts
interface TTSProvider {
  synthesize(text, options): Promise<AudioAsset>
}
```

Providers:

```text
ElevenLabs
Google Cloud TTS
Piper
```

ElevenLabs can be your high-quality provider. Its current free plan is listed at 10,000 credits/month. ([Remotion][4])

Google TTS can be your large-quota fallback, subject to its current account and pricing conditions.

---

# 32. Voice Segmentation

Do not generate the entire 4-minute narration as one request.

Instead:

```text
Scene 1 → audio_001.wav
Scene 2 → audio_002.wav
Scene 3 → audio_003.wav
```

Benefits:

* easy retry
* easy scene editing
* easier timing
* easier provider fallback
* easier voice changes

---

# 33. Whisper

Use Whisper to get timestamps.

```text
audio
 ↓
Whisper
 ↓
word timestamps
 ↓
caption timeline
```

Then:

```text
"RAG retrieves relevant documents"
```

becomes:

```text
0.00 - 0.42
0.42 - 0.78
0.78 - 1.12
...
```

This allows captions and animations to synchronize.

---

# 34. Caption Engine

Don't just generate an SRT.

Generate:

```json
{
  "word": "retrieval",
  "start": 14.23,
  "end": 14.61,
  "style": "highlight"
}
```

Then Remotion can animate captions.

---

# 35. Music Engine

Use music very carefully.

The system should determine:

```text
energy = low / medium / high
```

Then choose:

```text
intro
technical
demo
closing
```

Use separate music stems or segments if possible.

The voice should always have priority.

---

# 36. Audio Mixing

Final audio pipeline:

```text
Voice
  ↓
EQ
  ↓
Compression
  ↓
Normalization
  ↓
Music
  ↓
Duck music under voice
  ↓
SFX
  ↓
Limiter
  ↓
Final WAV
```

FFmpeg handles final media processing.

---

# 37. Remotion Becomes the Main Video Engine

This is where the actual video is assembled.

Remotion is designed for programmatic React-based videos and supports parameterized, data-driven compositions and batch rendering. ([Remotion][4])

Your Remotion project should be a **design system**, not a collection of one-off videos.

---

# 38. Remotion Component Architecture

```text
Video
│
├── Scene
│   ├── Background
│   ├── Camera
│   ├── Content
│   ├── Caption
│   └── Transition
│
├── Typography
│
├── Cards
│
├── Browser
│
├── Code
│
├── Diagram
│
├── Architecture
│
├── Terminal
│
├── Device
│
├── Logo
│
├── Image
│
├── Video
│
└── Particles
```

---

# 39. GSAP

Use GSAP for advanced timelines:

```text
text reveal
camera movement
scale
parallax
diagram drawing
data packets
node activation
```

But don't make GSAP responsible for the entire video timeline.

Use:

```text
Remotion = timeline/composition
GSAP = complex animation
```

---

# 40. Your Scene Manifest

This is probably the most important runtime structure.

Example:

```json
{
  "video": {
    "width": 1920,
    "height": 1080,
    "fps": 30
  },

  "scenes": [
    {
      "id": "hook",
      "start": 0,
      "duration": 12,
      "component": "HookScene",
      "props": {}
    },

    {
      "id": "architecture",
      "start": 65,
      "duration": 24,
      "component": "ArchitectureScene",
      "props": {
        "diagram": "architecture.svg"
      }
    }
  ]
}
```

Remotion reads this.

---

# 41. The Video DSL

Eventually I would create your own small declarative video language.

Something like:

```json
{
  "scene": "architecture",

  "layers": [
    {
      "type": "diagram",
      "src": "architecture.svg"
    },

    {
      "type": "node-highlight",
      "target": "vector-db"
    },

    {
      "type": "data-packet",
      "from": "api",
      "to": "vector-db"
    },

    {
      "type": "caption",
      "text": "Retrieve relevant context"
    }
  ]
}
```

This lets the AI generate videos without directly writing complicated React.

---

# 42. Don't Let the LLM Write Arbitrary Remotion

This is a major architectural rule.

Bad:

```text
LLM → generate 1000 lines of React
```

Better:

```text
LLM
 ↓
Scene DSL
 ↓
Validator
 ↓
Scene Renderer
 ↓
Remotion
```

That gives you predictable videos.

---

# 43. Animation Library

Build reusable animations:

```text
fadeIn
fadeOut
slideIn
slideOut
scaleIn
scaleOut
blurReveal
typewriter
codeReveal
drawPath
nodePulse
dataPacket
cameraZoom
cameraPan
parallax
splitScreen
wipe
glitch
terminalTyping
browserZoom
```

Then scenes compose these.

---

# 44. Technical Visual Library

Build special components for AI/software.

For example:

### RAG

```text
Question
   ↓
Embedding
   ↓
Vector Search
   ↓
Retrieved Context
   ↓
Prompt
   ↓
LLM
   ↓
Answer
```

Animate a glowing data packet through each stage.

### Agent

```text
User
 ↓
Planner
 ↓
Tool
 ↓
Observation
 ↓
Reasoning
 ↓
Tool
 ↓
Final Answer
```

### API

```text
Browser
 ↓
API
 ↓
Service
 ↓
Database
```

### Event system

```text
Producer
 ↓
Queue
 ↓
Consumer
 ↓
Worker
```

This is where your tool can become genuinely impressive.

---

# 45. Code Visualization

The system can detect important code.

For example:

```text
src/ai/rag.ts
```

Then show:

```ts
const docs = await retriever.invoke(query);
```

with animated highlighting.

Don't show huge blocks.

Use:

```text
5-15 important lines
```

and zoom into them.

---

# 46. Architecture Visualization

From the knowledge graph:

```text
Frontend
   ↓
API
   ↓
AI Agent
   ↓
Retriever
   ↓
Vector DB
   ↓
LLM
```

Generate:

```text
static SVG
```

then animate it.

The diagram should be generated from facts, not invented by the LLM.

---

# 47. Video QA

This needs its own subsystem.

Don't trust the renderer.

After rendering:

```text
final.mp4
   ↓
ffprobe
```

Check:

```text
resolution
fps
duration
codec
audio
sample rate
channels
bitrate
```

---

# 48. Visual QA

Extract frames:

```text
frame 0
frame 300
frame 600
...
```

Check:

```text
black frame
blank frame
overflow
missing asset
wrong aspect ratio
broken image
text outside viewport
```

OpenCV can assist with automated checks.

---

# 49. Semantic QA

Give the final video plus script/knowledge graph to an LLM.

Ask:

```text
Does the video accurately represent the repository?

Are there claims that cannot be verified?

Does the visual shown match the narration?

Are technical diagrams consistent with the source?
```

Output:

```json
{
  "score": 0.94,
  "issues": []
}
```

But internally, use **pass/fail criteria**, not a vague AI score.

---

# 50. Automated Repair Loop

This is where the system becomes agentic.

```text
Render
 ↓
QA
 ↓
Issues?
 ├── No → Final
 │
 └── Yes
       ↓
     Diagnose
       ↓
     Fix
       ↓
     Render affected scene
       ↓
     QA
```

Example:

```text
Issue:
Scene 4 text overflow.

Fix:
Reduce font size 8%.

Re-render:
Scene 4.

QA:
Passed.
```

Don't rerender the entire video when unnecessary.

---

# 51. Checkpoint System

Every stage writes:

```json
{
  "stage": "storyboard",
  "status": "completed",
  "startedAt": "...",
  "completedAt": "...",
  "artifact": ".video/content/storyboard.json"
}
```

If MCP crashes:

```text
restart
 ↓
read state.json
 ↓
resume from last incomplete stage
```

This is essential.

---

# 52. Pipeline State Machine

Use:

```text
CREATED
↓
CLONING
↓
ANALYZING
↓
PLANNING
↓
SCRIPTING
↓
STORYBOARDING
↓
ASSET_PLANNING
↓
ASSET_GENERATION
↓
CAPTURING
↓
AUDIO
↓
SCENE_BUILD
↓
PREVIEW
↓
QA
↓
REPAIR
↓
RENDERING
↓
COMPLETED
```

---

# 53. Provider Abstraction

Every external API gets an interface.

Example:

```ts
interface ImageProvider {
  generate(request: ImageRequest): Promise<ImageAsset>
}
```

Implement:

```text
KreaProvider
LeonardoProvider
LocalSDProvider
```

Similarly:

```ts
interface VoiceProvider
interface DiagramProvider
interface MusicProvider
interface SearchProvider
interface LLMProvider
```

This prevents vendor lock-in.

---

# 54. Provider Selection

Your config:

```json
{
  "providers": {
    "llm": ["ollama", "cloud"],
    "tts": ["elevenlabs", "google", "piper"],
    "diagram": ["napkin", "mermaid", "graphviz"],
    "image": ["openverse", "wikimedia", "local"]
  }
}
```

Then:

```text
Try provider 1
 ↓
quota?
 ↓
error?
 ↓
provider 2
 ↓
provider 3
```

---

# 55. API Key Management

Never store:

```text
API keys
```

inside `.video/config.json`.

Use:

```text
.env
```

or OS environment variables.

Example:

```text
GITHUB_TOKEN=
ELEVENLABS_API_KEY=
NAPKIN_API_KEY=
GOOGLE_APPLICATION_CREDENTIALS=
```

`.video` contains only provider configuration.

---

# 56. MCP Resources

Don't expose only tools.

Expose useful resources too.

For example:

```text
video://project/knowledge
video://project/storyboard
video://project/assets
video://project/status
video://project/qa
```

Then Antigravity can inspect project state.

MCP supports tools, resources and prompts as first-class concepts. ([Model Context Protocol][1])

---

# 57. MCP Prompts

Create reusable prompts:

```text
create-technical-video
create-ai-product-video
analyze-project
improve-storyboard
review-video
fix-video
```

This gives Antigravity higher-level workflows.

---

# 58. MCP Tool Design

I would ultimately expose:

| Tool                   | Purpose                      |
| ---------------------- | ---------------------------- |
| `create_video_project` | Initialize project           |
| `analyze_project`      | Analyze repo                 |
| `generate_video_plan`  | Decide story                 |
| `generate_script`      | Create narration             |
| `generate_storyboard`  | Create scene plan            |
| `plan_assets`          | Determine assets             |
| `generate_assets`      | Fetch/create assets          |
| `capture_product`      | Record UI                    |
| `generate_audio`       | Voice/music/captions         |
| `build_video`          | Generate scene code/manifest |
| `preview_video`        | Render low-res preview       |
| `validate_video`       | Run QA                       |
| `fix_video`            | Automatically repair         |
| `render_video`         | Final render                 |
| `get_video_status`     | Pipeline state               |

That's enough.

---

# 59. One Important Tool: `run_pipeline`

Eventually add:

```text
run_pipeline
```

Example:

```json
{
  "project": "skillify",
  "template": "technical-saas",
  "duration": 240,
  "autoFix": true
}
```

This triggers:

```text
analyze
→ plan
→ script
→ storyboard
→ assets
→ capture
→ audio
→ build
→ preview
→ QA
→ fix
→ final
```

This becomes your one-click experience.

---

# 60. Antigravity Workflow

Antigravity should be able to say:

```text
User:
Make a video for this repo.
```

Antigravity:

```text
1. create_video_project
2. analyze_project
3. generate_video_plan
4. inspect results
5. generate_script
6. inspect
7. generate_storyboard
8. generate_assets
9. capture_product
10. generate_audio
11. build_video
12. preview_video
13. validate_video
14. fix_video
15. render_video
```

This is exactly where MCP fits.

---

# 61. Why Antigravity Should Remain the Director

Don't put the entire reasoning system inside your MCP.

Antigravity can reason:

```text
"This architecture scene is weak."

"Let's emphasize the RAG flow."

"Use the real dashboard instead of generated imagery."

"Regenerate scene 6."
```

Your MCP executes.

This creates a clean separation:

```text
Antigravity
= intelligence / decision maker

MCP
= capabilities / execution
```

---

# 62. Local LLM Role

Since you already use local LLM tooling, use Ollama for:

```text
repository summarization
classification
code explanation
scene planning
asset descriptions
first-pass scripts
fact extraction
QA
```

But don't force local models to do everything.

You can configure:

```text
simple task → local
complex creative task → cloud
```

---

# 63. LLM Routing

Example:

```text
                 Task
                   │
          ┌────────┴────────┐
          │                 │
      deterministic        AI
          │                 │
     normal parser       classifier
                         │
                 ┌───────┴───────┐
                 │               │
              local            cloud
              Ollama           provider
```

This saves money.

---

# 64. Database

For V1:

**SQLite.**

Store:

```text
projects
runs
stages
assets
providers
usage
scenes
renders
errors
```

Example:

```text
projects
    ↓
runs
    ↓
stages
    ↓
artifacts
```

No Postgres needed initially.

---

# 65. Caching

Caching will save you a lot of money.

Hash:

```text
input
+
provider
+
parameters
```

Example:

```text
SHA256(script + voice + voiceId)
```

If same input:

```text
cache hit
```

Don't call ElevenLabs again.

Same for:

```text
Napkin
images
icons
LLM
TTS
screenshots
```

---

# 66. Asset Deduplication

Hash every asset:

```text
SHA256(file)
```

If already exists:

```text
reuse
```

This is particularly useful for technology icons.

---

# 67. Video Resolution Strategy

During development:

```text
1280x720
24/30 FPS
```

Preview:

```text
1280x720
```

Final:

```text
1920x1080
30 FPS
```

Don't render 1080p every time while developing.

---

# 68. Render Profiles

Create:

```text
preview
draft
final
youtube
linkedin
vertical
```

Example:

```json
{
  "preview": {
    "width": 960,
    "height": 540,
    "fps": 24
  },

  "final": {
    "width": 1920,
    "height": 1080,
    "fps": 30
  }
}
```

Later:

```text
9:16
1:1
16:9
```

---

# 69. Video Outputs

Final project should produce:

```text
final.mp4
final.srt
final.vtt
thumbnail.png
attribution.md
video-report.json
script.md
```

Potentially:

```text
project-video.zip
```

---

# 70. Thumbnail Engine

Don't forget this.

Use the same scene/asset engine to create:

```text
YouTube thumbnail
LinkedIn thumbnail
social preview
```

The system can generate:

```text
1280x720
```

from the strongest frame.

---

# 71. Future: Social Versions

Once the main video works:

```text
4-minute video
      ↓
      ├── 60s LinkedIn
      ├── 45s Twitter/X
      ├── 30s Reel
      ├── 15s teaser
      └── 9:16 short
```

Same knowledge graph.

Same assets.

Different storyboard.

This is a huge future feature.

---

# 72. Development Phases

Now the actual build order.

Do **not** build everything simultaneously.

---

## Phase 0: Foundation

Goal:

```text
MCP can run locally.
```

Build:

```text
TypeScript
Node
MCP SDK
Zod
Pino
SQLite
dotenv
```

Create:

```text
server.ts
```

Register:

```text
get_video_status
```

Connect Antigravity.

Test:

```text
Antigravity
 ↓
MCP
 ↓
tool
 ↓
response
```

The current MCP TypeScript SDK supports local stdio servers, which is exactly what you want for the first local implementation. ([Model Context Protocol][5])

---

# 73. Phase 1: Project Ingestion

Build:

```text
create_video_project
```

Implement:

```text
repo URL parser
git clone
branch selection
commit detection
sandbox creation
.video initialization
```

Output:

```text
sandbox/projects/my-project
```

Success criteria:

```text
Give GitHub URL
→ repository cloned
→ .video created
```

---

# 74. Phase 2: Static Analyzer

Build:

```text
analyze_project
```

Implement:

```text
README parser
package parser
dependency parser
language detector
route detector
component detector
Docker detector
AI library detector
database detector
```

Generate:

```text
knowledge/project.json
knowledge/tech-stack.json
knowledge/dependencies.json
```

---

# 75. Phase 3: Knowledge Graph

Combine:

```text
static analysis
+
LLM analysis
+
runtime analysis
```

Generate:

```text
knowledge-graph.json
```

This is your first major milestone.

You should be able to ask:

> "Explain this repository."

and your MCP can return an accurate technical explanation.

---

# 76. Phase 4: Runtime Discovery

Implement Playwright.

Process:

```text
detect start command
 ↓
start app
 ↓
wait for localhost
 ↓
discover routes
 ↓
capture screenshots
 ↓
record interactions
 ↓
shutdown app
```

Generate:

```text
capture/routes.json
capture/screenshots/*
```

---

# 77. Phase 5: Script Engine

Implement:

```text
generate_video_plan
generate_script
```

Create:

```text
templates/technical-saas
```

Output:

```text
concept.json
script.json
```

Don't worry about fancy visuals yet.

---

# 78. Phase 6: Storyboard

Convert:

```text
script
```

into:

```text
storyboard.json
```

Example:

```text
Scene 1 → HookScene
Scene 2 → ProblemScene
Scene 3 → ProductScene
Scene 4 → ArchitectureScene
Scene 5 → RAGScene
Scene 6 → DemoScene
Scene 7 → EngineeringScene
Scene 8 → ClosingScene
```

---

# 79. Phase 7: Remotion Core

Before adding AI asset generation, manually create:

```text
HookScene
ProductScene
ArchitectureScene
DemoScene
ClosingScene
```

Get these looking excellent.

This is a critical point.

**Do not automate ugly scenes.**

First make the visual design system good.

---

# 80. Phase 8: Scene DSL

Create:

```text
scene-manifest.json
```

Then:

```text
manifest
 ↓
Remotion
```

At this point the LLM can generate scene manifests rather than React code.

---

# 81. Phase 9: Asset Engine

Add:

```text
Iconify
Wikimedia
Openverse
local assets
```

Then:

```text
asset registry
normalizer
metadata
attribution
```

Only after that add:

```text
Krea
Leonardo
Stable Diffusion
```

AI generation should not be a dependency for your MVP.

---

# 82. Phase 10: Diagram Engine

Implement:

```text
Mermaid
Graphviz
custom SVG
```

Then integrate Napkin.

Napkin's API supports programmatic visual generation, asynchronous processing and SVG/PNG/PPT outputs, making it suitable as an optional visual provider rather than the foundation of the diagram system. ([Model Context Protocol][1])

---

# 83. Phase 11: Product Capture

Now integrate:

```text
Playwright
```

Build:

```text
BrowserScene
ScreenshotScene
DemoScene
```

This is where the generated video starts feeling like a **real product video**.

---

# 84. Phase 12: Audio

Implement:

```text
ElevenLabs
Google TTS
Piper
```

Then:

```text
Whisper
```

Generate:

```text
narration
timestamps
captions
```

---

# 85. Phase 13: Audio Synchronization

Storyboard should now contain:

```text
narration duration
```

Example:

```text
Scene 1:
12.3 sec

Scene 2:
17.8 sec

Scene 3:
23.1 sec
```

Total:

```text
240 seconds
```

Then the timeline is derived from narration.

This is better than manually guessing scene durations.

---

# 86. Phase 14: Music + SFX

Add:

```text
music provider
SFX provider
audio mixer
ducking
```

Don't overdo this.

Technical videos need clarity more than noise.

---

# 87. Phase 15: QA

Implement:

```text
ffprobe
OpenCV
Whisper
LLM
```

Generate:

```text
qa-report.json
```

---

# 88. Phase 16: Auto-Fix

Implement:

```text
fix_video
```

Example:

```text
QA:
Scene 5 has unreadable text.

Agent:
Reduce text density.

MCP:
updates scene props.

Renderer:
renders scene.

QA:
passes.
```

---

# 89. Phase 17: Full Autonomous Pipeline

Finally:

```text
run_pipeline
```

One call:

```text
run_pipeline({
  repo,
  template,
  duration,
  instructions
})
```

Then:

```text
clone
→ analyze
→ understand
→ plan
→ script
→ storyboard
→ assets
→ capture
→ audio
→ build
→ preview
→ QA
→ repair
→ final
```

---

# 90. Phase 18: Multiple Video Templates

Add:

```text
technical-saas
ai-product
portfolio
developer-tool
startup-pitch
architecture-deep-dive
```

The same engine produces different styles.

---

# 91. Phase 19: Social Repurposing

Add:

```text
generate_short
```

It takes:

```text
existing knowledge
existing assets
existing narration
```

and creates:

```text
YouTube
LinkedIn
Instagram
Twitter/X
```

versions.

---

# 92. Phase 20: Cloud Rendering

Only after the local system works.

Then consider:

```text
local render
        ↓
cloud render
```

Remotion's current ecosystem supports server-side and bulk rendering workflows, so cloud rendering can be added later rather than complicating V1. ([Remotion][4])

---

# 93. What NOT to Build Initially

Do not start with:

```text
Kubernetes
Postgres
Redis
AWS Lambda
Cloud UI
multi-user auth
billing
OAuth
dashboard
cloud storage
mobile app
```

None of those help you prove the core idea.

---

# 94. Your V1

The first successful version should do only this:

```text
GitHub URL
       ↓
Clone
       ↓
Analyze
       ↓
Generate project knowledge
       ↓
Generate script
       ↓
Generate storyboard
       ↓
Capture actual product
       ↓
Generate Mermaid architecture
       ↓
Generate voice
       ↓
Generate captions
       ↓
Build 5-8 Remotion scenes
       ↓
Render MP4
```

That's enough.

---

# 95. V1 Target

I would define the first milestone as:

> **Give the MCP one SaaS GitHub repository and receive a technically accurate 60-120 second video automatically.**

Not 5 minutes.

Not perfect.

Just:

```text
Repo
 ↓
understanding
 ↓
real UI
 ↓
architecture
 ↓
voice
 ↓
animation
 ↓
MP4
```

Once that works, scaling to 4 minutes is mostly a content problem.

---

# 96. V2

Then:

```text
2-5 minute videos
+
multiple templates
+
Napkin
+
asset providers
+
AI image generation
+
better animations
+
automatic QA
+
auto repair
```

---

# 97. V3

Then:

```text
one-click autonomous video production
```

with:

```text
repo
 ↓
AI director
 ↓
video
```

And Antigravity can supervise.

---

# 98. V4

Eventually:

```text
Repo
 ↓
Video
 ↓
Thumbnail
 ↓
LinkedIn post
 ↓
YouTube description
 ↓
Short clips
 ↓
Technical blog
 ↓
Architecture documentation
```

At that point you have something much bigger than a video generator.

You have a **repository-to-content engine**.

---

# 99. The Most Important Design Principles

I would lock these into the project README.

### Principle 1

**The repository is the source of truth.**

### Principle 2

**The knowledge graph is the source of truth for the video.**

### Principle 3

**LLMs propose. Deterministic code validates.**

### Principle 4

**Every stage produces an artifact.**

### Principle 5

**Everything should be resumable.**

### Principle 6

**Every external provider has a fallback.**

### Principle 7

**Assets are cached.**

### Principle 8

**Assets have provenance and license metadata.**

### Principle 9

**Real product UI beats generated fake UI.**

### Principle 10

**Remotion is the final source of truth for composition.**

### Principle 11

**MCP orchestrates capabilities, not business logic from Antigravity.**

### Principle 12

**The LLM should generate structured DSL/JSON, not arbitrary video code.**

---

# 100. Final Technology Stack

This is the stack I would actually build.

| Layer                     | Technology                      |
| ------------------------- | ------------------------------- |
| Agent                     | Antigravity                     |
| Protocol                  | MCP                             |
| MCP SDK                   | TypeScript MCP SDK v2           |
| Language                  | TypeScript                      |
| Runtime                   | Node.js                         |
| Validation                | Zod                             |
| Local LLM                 | Ollama                          |
| Repository                | Git                             |
| GitHub                    | GitHub API                      |
| Code parsing              | Tree-sitter                     |
| Language analysis         | GitHub Linguist                 |
| Runtime                   | Node/Python/Docker              |
| Browser                   | Playwright                      |
| Screenshots               | Playwright                      |
| Product recording         | Playwright + FFmpeg             |
| Diagrams                  | Mermaid                         |
| Dependency graphs         | Graphviz                        |
| Visual diagrams           | Napkin API                      |
| Icons                     | Iconify                         |
| Open images               | Wikimedia/Openverse             |
| AI images                 | Optional Krea/Leonardo/SD       |
| Image processing          | Sharp                           |
| SVG processing            | SVGO                            |
| Media inspection          | ffprobe                         |
| Media processing          | FFmpeg                          |
| TTS                       | ElevenLabs                      |
| TTS fallback              | Google TTS                      |
| Local TTS                 | Piper                           |
| STT                       | Whisper                         |
| Music                     | YouTube Audio Library/Freesound |
| Video                     | Remotion                        |
| Animation                 | GSAP                            |
| 3D                        | Three.js/R3F                    |
| Advanced vector animation | Motion Canvas                   |
| 3D fallback               | Blender                         |
| QA                        | ffprobe + OpenCV + LLM          |
| State                     | SQLite                          |
| Cache                     | Local filesystem + hashes       |
| Logging                   | Pino                            |
| Config                    | JSON/YAML                       |
| Containerization          | Docker                          |
| Final format              | H.264 MP4                       |
| Captions                  | SRT + VTT                       |

The current MCP SDK v2 is especially suitable here because it provides the server-side primitives for tools, resources and prompts, while stdio is intended for local process integrations. ([Model Context Protocol][1])

---

# 101. The Actual Build Order I Recommend

If we are sitting together and starting the project **today**, I would do exactly this:

```text
DAY 1
│
├── Create saas-video-engine repo
├── TypeScript + Node
├── MCP SDK
├── Connect Antigravity
└── create_video_project

DAY 2
│
├── Git clone engine
├── sandbox manager
├── .video structure
└── pipeline state

DAY 3-4
│
├── README analyzer
├── package analyzer
├── dependency analyzer
├── language analyzer
└── tech-stack.json

DAY 5-6
│
├── Tree-sitter
├── route detection
├── component detection
├── architecture detection
└── knowledge graph

DAY 7
│
├── Ollama integration
├── project summarizer
└── technical fact checker

DAY 8-9
│
├── Playwright
├── app launcher
├── route discovery
└── screenshot capture

DAY 10
│
├── Remotion
├── basic scene system
└── first 30-second video

DAY 11-12
│
├── Scene DSL
├── storyboard schema
├── scene renderer
└── reusable animations

DAY 13-14
│
├── Mermaid
├── Graphviz
├── architecture scene
└── RAG scene

DAY 15
│
├── ElevenLabs
├── Whisper
└── captions

DAY 16-17
│
├── Asset registry
├── Iconify
├── Wikimedia/Openverse
└── asset normalization

DAY 18-19
│
├── Playwright demo recording
├── BrowserScene
└── real product walkthrough

DAY 20
│
├── FFmpeg pipeline
├── audio mixing
└── final render

DAY 21
│
├── QA
├── ffprobe
├── visual checks
└── automatic repair
```

After that:

```text
V1 COMPLETE
```

Then we improve visual quality rather than endlessly adding infrastructure.

---

# 102. The First Real Test

For the first end-to-end test, don't use a random GitHub project.

Use one of your own SaaS/AI projects where you know the architecture extremely well.

For example, something containing:

```text
Next.js
React
API
database
AI
RAG/agent
```

Then give the MCP:

```text
Create a 90-second technical SaaS video.

Focus on:
1. problem
2. product
3. architecture
4. AI pipeline
5. real UI
6. engineering stack

Use actual repository facts.
Do not invent metrics.
Use the real application UI.
```

The desired output:

```text
.video/
├── knowledge/
├── content/
├── assets/
├── capture/
├── audio/
├── scenes/
├── render/
│   └── final.mp4
├── qa/
└── reports/
```

That is our **definition of done for V1**.

---

## The one architectural decision I would lock right now

Do **not** make this:

```text
Antigravity
   ↓
MCP
   ↓
LLM
   ↓
generate React video code
```

Make it:

```text
                     ANTIGRAVITY
                         │
                    MCP interface
                         │
                  WORKFLOW ENGINE
                         │
        ┌────────────────┼────────────────┐
        │                │                │
   PROJECT GRAPH     CONTENT GRAPH    ASSET GRAPH
        │                │                │
        └────────────────┼────────────────┘
                         │
                    SCENE DSL
                         │
                REMOTION + GSAP
                         │
                      FFmpeg
                         │
                       QA
                         │
                     final.mp4
```

That architecture gives you something that can eventually become a **real reusable video-engineering platform**, rather than a collection of prompts that happens to generate videos.

And because the MCP SDK already supports the exact local-server model we need, we can start implementation from the MCP server and sandbox manager rather than building a web application first. ([Model Context Protocol][1])

[1]: https://ts.sdk.modelcontextprotocol.io/v2/?utm_source=chatgpt.com "MCP TypeScript SDK"
[2]: https://docs.github.com/en/repositories/creating-and-managing-repositories/quickstart-for-repositories?utm_source=chatgpt.com "Quickstart for repositories - GitHub Docs"
[3]: https://playwright.dev/docs/videos?utm_source=chatgpt.com "Videos | Playwright"
[4]: https://www.remotion.dev/?utm_source=chatgpt.com "Remotion | Make videos programmatically"
[5]: https://ts.sdk.modelcontextprotocol.io/v2/get-started/first-server?utm_source=chatgpt.com "Build your first server | MCP TypeScript SDK"
