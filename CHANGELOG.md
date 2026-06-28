# Changelog

This project follows a lightweight changelog format inspired by Keep a Changelog, but versioning is still pre-1.0.

## 0.3.0 - 2026-06-28

### Added

- Learning Packet contract, JSON schema, example, and validator support.
- Learning-loop eval with token ceiling and score-per-token proxy metrics.
- Future-task utility eval for downstream routing, stale checks, noise rejection, and contradiction handling.
- Generated eval report command (`npm run eval:report`).
- Live-model run template for scoring real model outputs without committing private transcripts.
- Thai strategy guide covering mechanics, architecture, use cases, evals, trade-offs, and extension boundaries.

### Changed

- Expanded evaluation docs to separate deterministic proxy confidence from future live-model benchmarks.
- Added structured selectors to Learning Packet examples for retrieval/routing hints.
- Ignored `.opencode/` artifacts to keep external-review bundles out of public commits.
- Added an explicit npm package `files` allowlist and updated citation metadata for the 0.3.0 package surface.

### Notes

- This release still does not claim live-model superiority. The new gates make cost, token ceilings, and downstream decision utility measurable before publishing live results.

## 0.2.0 - 2026-06-28

### Added

- Memory Patch lifecycle metadata.
- Derived Index contract and schema.
- Hot Context Pack contract, schema, and renderer.
- Memory Curator naming and OpenCode adapter prompt.
- Curator behavior eval and proxy comparison.
- Patch-quality eval.
- Live-agent incident dataset and scoring wrapper.
- Public docs for installation, architecture, RAG positioning, demo workflow, live-model evaluation, and repository patterns.
- Community health files for open-source readiness.

### Changed

- Renamed the old archivist adapter concept to Memory Curator.
- Clarified that Markdown notes are canonical operational memory while indexes, graphs, reports, and hot-context packs are derived views.

### Notes

- Live model results are not published yet. Current proxy evals validate the harness contract but do not prove model superiority.
