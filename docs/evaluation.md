# Evaluation

The repository should earn its claims with repeatable comparison rather than architecture diagrams alone.

## Retrieval Baseline

Run:

```sh
npm run eval:retrieval
```

The included synthetic fixture contains eight canonical notes and fifteen queries across exact, semantic, conflict, distractor, multi-hop, and hard-semantic categories.

Initial result at `k=3`:

| Method | Hit@3 | Recall@3 | MRR | nDCG@3 | Avg context chars |
|---|---:|---:|---:|---:|---:|
| Lexical overlap | 80.0% | 71.1% | 0.817 | 0.708 | 1144 |
| BM25 | 86.7% | 77.8% | 0.786 | 0.739 | 1139 |
| BM25 sections | 86.7% | 77.8% | 0.811 | 0.746 | 997 |

Interpretation:

- BM25 improved Hit@3, Recall@3, nDCG, and context size, but slightly lowered MRR.
- Section retrieval kept BM25 recall while reducing retrieved context further.
- Hard-semantic and multi-hop queries still expose recall gaps.
- The result justifies BM25 as a measured baseline, not as a required runtime dependency.

Decision: keep BM25 as an evaluation baseline. Do not make it the production default until a larger real-vault dataset shows a meaningful gain.

This fixture is deliberately small and synthetic. It validates the benchmark code and exposes failure categories; it does not prove production retrieval quality.

A separate private real-vault evaluation is summarized in `cost-and-scale.md`. Its note contents and labeled queries are intentionally not committed.

## Obsidian Memory Curator Eval

Retrieval quality is necessary but not enough. The core claim of this harness is that a memory curator should retrieve and maintain an Obsidian/Markdown memory without inventing meaning. That requires a separate behavior eval.

Run:

```sh
npm run eval:curator
```

The default fixture uses `eval/curator/scenarios.json` and scores `eval/curator/candidate.memory-patch.json`.

Current reference result:

| Category | Purpose | Result |
|---|---|---:|
| recall-routing | Recall the right UI ownership notes without backend noise | 1/1 |
| recall-multihop | Return a compact split of UI and backend memories | 1/1 |
| recall-safety | Retrieve secret-handling policy without extra context | 1/1 |
| write-apply | Apply a verified lesson with retained provenance | 1/1 |
| write-block | Block a patch that lacks evidence | 1/1 |
| write-conflict | Return `TENSION` instead of overwriting contradictory memory | 1/1 |
| write-noise | Reject routine summaries as non-durable memory | 1/1 |
| write-derived | Preserve the boundary between generated indexes and canonical Markdown | 1/1 |

The evaluator checks:

- Brain Brief schema validity, 1-7 memory items, and at most three direct-read paths.
- Required and forbidden note paths.
- `APPLIED`, `TENSION`, or `BLOCKED` status accuracy.
- `changed_paths` discipline when writes are forbidden.
- retained provenance for applied patches.
- conflict paths for `TENSION`.
- required and forbidden claim/reason terms.
- generated index output staying derived rather than becoming canonical memory.

## Patch Quality Eval

Run:

```sh
npm run eval:patch-quality
```

This scores candidate Memory Patches beyond basic schema validity. The current rubric checks:

- valid contract shape,
- bounded non-vague claim,
- clear why-it-matters,
- applies/excludes scope,
- evidence provenance,
- lifecycle status,
- revalidation triggers,
- no diary/noise language,
- no raw secret terms.

Current fixture result:

| Candidate | Score | Expected |
|---|---:|---:|
| Strong Memory Patch | 100 | 95-100 |
| Missing Lifecycle | 55 | 0-79 |
| Vague Summary | 65 | 0-69 |

The intent is not to replace human judgment. It gives the lead agent and curator a cheap guardrail before durable memory is written.

To test a real agent, save its outputs in the same shape as `eval/curator/candidate.memory-patch.json` and run:

```sh
node scripts/eval-curator.mjs --candidate path/to/agent-output.json
```

To score a combined live run with both curator behavior and patch-quality outputs:

```sh
node scripts/eval-agent-run.mjs \
  --curator-output path/to/curator-output.json \
  --patches path/to/patch-candidates
```

See [Live Model Evaluation](live-model-eval.md) for the anonymized incident set and recommended reporting format.
Publish completed real-model comparisons in [Live Model Results](live-model-results.md), not in this proxy-eval section.

This is a deterministic contract eval. It does not prove model quality by itself; it proves whether an output obeys the memory harness rules for a fixed scenario set. Model comparison should run this same evaluator across fresh sessions, equal budgets, and blinded scenarios.

### Proxy Effectiveness Comparison

Run:

```sh
npm run eval:curator:compare
```

This compares three hand-authored proxy candidates:

- **A - Direct Writer**: the lead agent writes or recalls memory directly.
- **B - Curator Inference**: a second agent infers what to remember from a task summary.
- **C - Memory Patch**: the lead agent authors a structured patch; the curator applies it.

Current proxy result:

| Candidate | Passed | Pass rate |
|---|---:|---:|
| A - Direct Writer | 1/8 | 12.5% |
| B - Curator Inference | 6/8 | 75.0% |
| C - Memory Patch | 8/8 | 100.0% |

Interpretation:

- The direct writer proxy fails because it over-retrieves, writes without provenance, overwrites conflicts, saves routine summaries, and promotes derived graph output.
- The curator inference proxy is better at recall and blocking obvious missing evidence, but still loses detail on provenance and derived-artifact boundaries.
- The Memory Patch proxy passes because semantic authorship, provenance, status, and boundaries are explicit before the curator writes.

This is not yet a live-model benchmark. It is a falsifiable scenario harness. To compare actual models or prompts, generate candidate output files from fresh agent runs and score them with the same script.

## Retrieval Upgrade Gates

Add a technique only when its matching failure is measured:

| Observed failure | Candidate | Required evidence before adoption |
|---|---|---|
| Exact identifiers or error strings are missed | BM25/full-text | Better Recall@k than filesystem/lexical baseline |
| Synonyms and paraphrases miss relevant notes | Embeddings | Better semantic Recall@k without unacceptable false positives |
| Either exact or semantic retrieval alone is incomplete | Hybrid sparse+dense | Better aggregate recall and category balance |
| Relevant notes appear but rank too low | Reranker | Better MRR/nDCG at a bounded context size |
| Multi-hop questions need several retrieval rounds | Agentic retrieval loop | Better task accuracy under explicit step/token/latency budgets |
| Relationship questions span code and memory | Graph-assisted retrieval | Better multi-hop recall while Markdown remains canonical |

Before adding a hosted embedding or reranking service, record privacy, cost, cache, and offline behavior.

## Baselines

Test the same scenarios using:

- **A - Direct writer**: lead agent reads and writes memory directly.
- **B - Curator inference**: lead agent sends a task summary; curator decides what to remember.
- **C - Memory Patch**: lead agent authors the structured patch; curator applies it.

## Dataset

Start with 20-30 completed coding-agent incidents containing:

- a verified decision or root cause,
- concrete provenance,
- a later task where that memory should affect behavior,
- several cases with stale or contradictory knowledge,
- several cases that should not be saved.

Remove secrets and project identities. Freeze expected answers before running agents.

## Metrics

### Memory quality

- Claim precision: stored claims supported by evidence.
- Recall coverage: relevant expected facts returned.
- False-memory rate: unsupported claims presented as fact.
- Contradiction handling: conflicts surfaced rather than silently overwritten.
- Duplicate rate: semantically redundant canonical notes.

### Task utility

- Correct future routing or implementation decision.
- Number of extra vault reads.
- Token use for write and recall.
- End-to-end latency.
- Human correction time.

## Procedure

1. Randomize scenario order.
2. Run each baseline in a fresh agent session.
3. Keep model, tools, and token budget constant.
4. Do not reveal the expected answer to the tested agent.
5. Score contracts with deterministic checks first.
6. Use blinded human review for semantic correctness.
7. Publish failures and confidence intervals, not only averages.

## Initial Success Gate

Adopt C as the default only if it:

- lowers false-memory rate versus B,
- preserves or improves future-task accuracy versus A,
- detects contradictions more reliably,
- and does not add unacceptable token or latency overhead.

Until this experiment is run, describe the project as evidence-informed, not proven superior.
