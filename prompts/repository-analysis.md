# Repository Deep Codebase Analysis Prompt Template

Analyze the repository in `workspace/current/` and extract strictly verified evidence:

1. **Manifest Technologies**: Detect dependencies from `package.json`, `Cargo.toml`, `requirements.txt`, `go.mod`, `pom.xml`, `build.gradle`.
2. **Infrastructure & Deployment**: Scan for `Dockerfile`, `docker-compose.yml`, `vercel.json`, `netlify.toml`, `.github/workflows/`.
3. **Database & Persistence**: Scan for `prisma/schema.prisma`, SQL migrations, ORM imports.
4. **API Routes & Services**: Identify REST/GraphQL/gRPC endpoints.
5. **Key Features & Architectural Patterns**: Extract major capabilities documented in code or README.

Rules:
- NEVER assume or fabricate dependencies not found in files.
- Return structured evidence JSON payload.
