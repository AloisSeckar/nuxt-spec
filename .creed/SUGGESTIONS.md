# AgentCreed Suggestions

<!-- ↓↓↓ agentcreed ↓↓↓ -->

This file is used to collect Agentic AI suggestions about agent instructions discovered during development (ambiguities, discrepancies, contradictions, inefficiencies or possible improvements in `AGENTS.md`, `ARCHITECTURE.md`, `SECURITY.md`, skills and other instruction files). Tasks for the project codebase belong to `BACKLOG.md`.

This file holds pending suggestions only. Resolved items are deleted, never marked as done.

<!-- ↑↑↑ agentcreed ↑↑↑ -->

- Status of `ARCHITECTURE.md` is ambiguous in managed text. `AGENTS.md` ("Suggestions and backlog") and the `SUGGESTIONS.md` header list `ARCHITECTURE.md` among instruction files whose findings are logged here. `creed-dev` ("Instruction files") treats it as documentation that agents edit directly and names only `AGENTS.md`, `SECURITY.md` and skills as instruction files. It is unclear whether a wrong fact in `ARCHITECTURE.md` should be fixed directly or logged here.
- Grammar in managed skill text (cannot be edited locally): `creed-chat` "what the required information are" -> "is"; `creed-dev` "help him achieve his/her tasks and improve his code base" (inconsistent pronouns, also "let him decide"); `creed-dev` "Only edit `ARCHITECTURE.md`, `README.md`, documentation files" lacks "and"; `creed-dev` "(i.e. to understand actual runtime behavior ...)" should be "e.g.".
