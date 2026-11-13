---
name: creed-check
description: 'Methodology for checking consistency of instruction files and relevance and accuracy of the documentation'
---

<!-- ↓↓↓ agentcreed ↓↓↓ -->

# creed-check

The following process is used to check and fix the current state of agent instructions and project documentation in projects driven by AgentCreed. Follow it step by step to ensure effective assessment.

For the purpose of this skill, consider:

- `project root` is the folder with the top-level `AGENTS.md` (usually the repository root).
- `creed-files` are `AGENTS.md`, `ARCHITECTURE.md`, `SECURITY.md`, `.creed/BACKLOG.md` and `.creed/SUGGESTIONS.md` in `project root`. Other files with the same names in nested folders are ordinary `linked-files`.
- `linked-files` are instruction or documentation files a read file links to or directs to read/use, including skills it requires to be used (e.g. `creed-dev`). Exclude `creed-files` and exclude source code, test or configuration files. Read each file only once.
- `security-boundaries` impose limits on code or agent actions from a security perspective that must always be fulfilled.
- `agent-instructions` describe how agents should (or shouldn't) interact with the code or behave when performing given tasks (excluding security rules).
- `documented-facts` describe the project structure and its behavior (to be "documented", the fact must be written somewhere within the project).
- `source` of an item is the exact file and passage it was taken from.

Split a passage into separate items only where it holds independent rules. Keep a condition together with its consequence (e.g. "do X and notify the user" is one item).

For duplication checks, intentional documentation summaries and navigation are not duplicates to remove. Preserve them while consolidating redundant normative rules with the same scope and unnecessarily repeated documented facts. Summaries must stay consistent with their authoritative sources.

When a flaw is in an instruction file or inside AgentCreed-managed text that `AGENTS.md` does not allow editing, do not edit it; log the finding into `.creed/SUGGESTIONS.md` instead. This restriction applies to every editing step below.

Fix typos and grammar mistakes in any file you read and may edit right away, without asking and without adding them into `fixes`, provided the meaning does not change. If a correction could change the meaning, treat it as an ambiguity (add it into `questions`).

When moving or rephrasing a `source`, move text word for word by default and keep its strength words (MUST, ALWAYS, NEVER, pause, make sure). Before applying such a change, compare each old rule with its new wording and mark it kept / merged / strengthened / weakened / dropped for the final report.

## 1. Gathering information

First read the key files line by line to get the full picture of the current status.

Start with empty `security-boundaries`, `agent-instructions`, `documented-facts` and `questions` lists.

For each step below: if the main file is not present in `project root`, log its absence into `.creed/SUGGESTIONS.md` and add a question into `questions` asking whether to create it.

### 1.1 Security Boundaries

Read `SECURITY.md` in `project root` and its `linked-files`. Append all claims established by their content to `security-boundaries`.

### 1.2 Agent Instructions

Read `AGENTS.md` in `project root` and its `linked-files`, and any remaining skills in `.agents/skills/`. Append all claims established by their content to `agent-instructions`.

### 1.3 Documented Facts

Read `ARCHITECTURE.md` in `project root` with its `linked-files` and `README.md` in `project root` with its `linked-files`, if present. Append all claims established by their content to `documented-facts`.

## 2. Verifying consistency

Now analyze the gathered items closely and systematically to discover flaws.

Start with an empty `fixes` list. Whenever you make any edit based on the rules below, note the change down in it.

For each item of `security-boundaries` list, verify it is:

1. Really a security boundary. If it is giving instructions that are not related to security, move its source into `AGENTS.md` (or appropriate nested file linked from there). If it just describes the project, move its source into `ARCHITECTURE.md` (or appropriate nested file linked from there).
2. Clear and unambiguous. Rephrase the source if needed. If the intention is not clear to you, add it into `questions`.
3. Not duplicated by any other item in any list. If yes, keep only one in the source.
4. Not contradicting `documented-facts`. If yes, add it into `questions` and ask what should win.

For each item of `agent-instructions` list, verify it is:

1. Really an agent instruction. If it is imposing a security boundary, move its source into `SECURITY.md` (or appropriate nested file linked from there). If it just describes the project, move its source into `ARCHITECTURE.md` (or appropriate nested file linked from there).
2. Clear and unambiguous. Rephrase the source if needed. If the intention is not clear to you, add it into `questions`.
3. Not duplicated by any other item in any list. If yes, keep only one in the source.
4. Not conflicting with rules imposed by `security-boundaries`. If yes, security rules must win and the instruction must be removed from source.
5. Not contradicting `documented-facts`. If yes, add it into `questions` and ask what should win.
6. Effective. Files, skills, tools and commands it refers to must exist and be reachable by agents. If not, fix the reference or add it into `questions`.

For each item of `documented-facts` list, verify it is:

1. Really a documented fact. If it is imposing a security boundary, move its source into `SECURITY.md` (or appropriate nested file linked from there). If it is giving instructions that are not related to security, move its source into `AGENTS.md` (or appropriate nested file linked from there). If it is a pending task, TODO or open question, move it into `.creed/BACKLOG.md`.
2. Clear and unambiguous. Rephrase the source if needed. If the intention is not clear to you, add it into `questions`.
3. Not duplicated by any other item in any list. If yes, keep only one in the source.
4. Accurate. Verify it against the codebase and configuration (e.g. package manifests, scripts, folder structure). Fix verifiably wrong facts, remove transient states (e.g. test counts) and add uncertain cases into `questions`.

After all items are checked:

1. If `questions` is not empty, stop and ask the user for clarification of all of them at once. Make appropriate changes to reflect user info, note them into `fixes` and empty `questions`.
2. If `fixes` is not empty (including changes made after user's answers), the consistency must be re-assessed: gather the lists again (chapter 1) and start over with this chapter. Repeat this loop at most 3 times. If `fixes` is still not empty after the 3rd repetition, stop and ask the user how to proceed, listing the remaining changes.
3. Once a pass ends with empty `fixes` and `questions`, proceed to the next chapter.

## 3. Report

Respond with a summary of:

- findings and changes made in the files, grouped by file
- items logged into `.creed/SUGGESTIONS.md` and `.creed/BACKLOG.md`
- typos and grammar mistakes fixed
- every moved or rephrased rule with its old and new wording, marked as kept, merged, strengthened, weakened or dropped

<!-- ↑↑↑ agentcreed ↑↑↑ -->
