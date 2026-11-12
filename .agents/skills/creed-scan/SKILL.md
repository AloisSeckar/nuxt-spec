---
name: creed-scan
description: Skill for structured exploration of codebases to understand structure, tech stack, patterns, and conventions. Use when onboarding to a new project, exploring unfamiliar code, or when asked "how does this work?" or "what's the architecture?"
---

<!-- ↓↓↓ agentcreed ↓↓↓ -->

<!-- forked from https://github.com/CloudAI-X/claude-workflow-v2/blob/v2.0.7/skills/analyzing-projects/SKILL.md -->

# creed-scan

Use this approach to systematically explore and understand a codebase.

If `ARCHITECTURE.md` file already exists in project root, treat it as a source of truth. Otherwise fallback to `README.md`. Verify available claims against the code and look directly into the code for anything it does not cover.

## Project Analysis Workflows

Copy this checklist and track progress:

```text
Project Analysis Progress:
- [ ] Step 1: Quick overview (README, root files)
- [ ] Step 2: Detect tech stack
- [ ] Step 3: Map project structure
- [ ] Step 4: Identify key patterns
- [ ] Step 5: Find development workflow
- [ ] Step 6: Generate summary report
```

## Step 1: Quick Overview

Try to locate key project files such as `README.md`, `ARCHITECTURE.md`, and other root-level documentation.

## Step 2: Tech Stack Detection

### Package Managers & Dependencies

- `package.json` → Node.js/JavaScript/TypeScript
- `requirements.txt` / `pyproject.toml` / `setup.py` → Python
- `go.mod` → Go
- `Cargo.toml` → Rust
- `pom.xml` / `build.gradle` → Java
- `Gemfile` → Ruby

### Frameworks (from dependencies)

- React, Vue, Angular, Next.js, Nuxt
- Express, FastAPI, Django, Flask, Rails
- Spring Boot, Gin, Echo

### Infrastructure

- `Dockerfile`, `docker-compose.yml` → Containerized
- `kubernetes/`, `k8s/` → Kubernetes
- `terraform/`, `.tf` files → IaC
- `serverless.yml` → Serverless Framework
- `.github/workflows/` → GitHub Actions

## Step 3: Project Structure Analysis

Present as a tree with annotations:

```text
project/
├── src/              # Source code
│   ├── components/   # UI components (React/Vue)
│   ├── services/     # Business logic
│   ├── models/       # Data models
│   └── utils/        # Shared utilities
├── tests/            # Test files
├── docs/             # Documentation
└── config/           # Configuration
```

## Step 4: Key Patterns Identification

Look for and report:

- **Architecture**: Monolith, Microservices, Serverless, Monorepo
- **API Style**: REST, GraphQL, gRPC, tRPC
- **State Management**: Redux, Zustand, MobX, Context
- **Database**: SQL, NoSQL, ORM used
- **Authentication**: JWT, OAuth, Sessions
- **Testing**: Jest, Pytest, Go test, etc.

## Step 5: Development Workflow

Check for:

- `.eslintrc`, `.prettierrc` → Linting/Formatting
- `.husky/` → Git hooks
- `Makefile` → Build commands
- `scripts/` in package.json → NPM scripts

## Step 6: Output Format

Generate a summary using this template:

```markdown
## Overview

[1-2 sentence description]

## Tech Stack

| Category  | Technology |
| --------- | ---------- |
| Language  | TypeScript |
| Framework | Next.js 14 |
| Database  | PostgreSQL |
| ...       | ...        |

## Architecture

[Description with simple ASCII diagram if helpful]

## Key Directories

- `src/` - [purpose]
- `lib/` - [purpose]

## Entry Points

- Main: `src/index.ts`
- API: `src/api/`
- Tests: `npm test`

## Conventions

- [Naming conventions]
- [File organization patterns]
- [Code style preferences]

## Quick Commands

| Action  | Command         |
| ------- | --------------- |
| Install | `npm install`   |
| Dev     | `npm run dev`   |
| Test    | `npm test`      |
| Build   | `npm run build` |

## Needs Clarification

- [ ] Any assumptions made without evidence are noted
```

## Analysis Validation

After completing analysis, verify:

```text
Analysis Validation:
- [ ] All major directories explained
- [ ] Tech stack accurately identified
- [ ] Entry points documented
- [ ] Development commands listed
- [ ] No assumptions made without evidence
```

If any items cannot be verified, note them as "needs clarification" in the report.

## Persisting Analysis

If `ARCHITECTURE.md` exists in project root and ends with `<!-- ↑↑↑ agentcreed ↑↑↑ -->`, append the analysis after this marker.

If `ARCHITECTURE.md` exists in project root and has any other content (with or without `<!-- ↑↑↑ agentcreed ↑↑↑ -->` marker), merge the findings into its existing text instead.

If `ARCHITECTURE.md` does not exist in project root, create the file, use project name as a H1 headline and insert the analysis afterwards.

## Final Check

Run `creed-check` skill session to ensure consistency of all the newly documented facts.

<!-- ↑↑↑ agentcreed ↑↑↑ -->
