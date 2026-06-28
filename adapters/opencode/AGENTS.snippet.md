## Durable Memory

- The lead agent owns the meaning of new memory.
- Before non-trivial work where prior decisions could change the plan, ask the memory curator for a compact Brain Brief.
- After verified work, save only knowledge that can change future work.
- New durable knowledge must be sent as a Memory Patch containing `claim`, `why_it_matters`, `scope`, `provenance`, `confidence`, and `suggested_type`.
- The curator may retrieve, deduplicate, merge, link, normalize minimally, and lint. It must not invent facts, causes, rationale, policy, or confidence.
- A conflict returns `TENSION`. Missing meaning or evidence returns `BLOCKED`. Otherwise return `APPLIED`.
- Raw evidence is the evidentiary source of truth and must not be rewritten. Markdown notes are canonical operational memory and must stay traceable to evidence. Search, vector, and graph indexes are rebuildable derived views.
- Do not save secrets, raw transcripts, routine summaries, or low-confidence speculation.
