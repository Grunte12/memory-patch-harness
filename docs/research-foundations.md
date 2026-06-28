# Research Foundations

This project is an engineering synthesis. It does not claim that its exact agent split has already won a published benchmark.

## Directly Supported Components

### Bounded, just-in-time context

Anthropic's context engineering guidance treats context as a limited resource and recommends loading relevant information when needed rather than preloading everything.

Source: https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents

### Persistent compiled knowledge

Karpathy's LLM Wiki describes an LLM-maintained, interlinked Markdown layer between raw sources and repeated questions. This project adopts the persistent-wiki idea but introduces a stricter semantic-author/curator boundary.

Source: https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f

### Episodic and semantic separation

Long-horizon memory experiments report benefits from separating immediate episodes from consolidated semantic state under bounded context.

Source: https://arxiv.org/abs/2605.17625

### Gated consolidation

CraniMem reports improved robustness under distractor noise using bounded memory, utility gating, and scheduled consolidation.

Source: https://openreview.net/forum?id=Tts94WVw40

### Preserve evidence

"Useful Memories Become Faulty When Continuously Updated by LLMs" finds that repeated consolidation can degrade useful memory and recommends retaining raw episodes as evidence while gating consolidation.

Source: https://arxiv.org/abs/2605.12978

### Explicit structure and adaptive retrieval

StructMemEval reports that agents benefit when memory organization is made explicit. SimpleMem reports gains from structured compression and adaptive retrieval.

Sources:

- https://openreview.net/forum?id=a9vY2sJkf4
- https://openreview.net/forum?id=CMveUVer0m

### RAG taxonomy and contextual retrieval

The common RAG taxonomy distinguishes Naive, Advanced, and Modular RAG. Agentic RAG adds planning, tool choice, reflection, and iterative retrieval control. Contextual retrieval combines better chunk context, sparse/dense retrieval, and reranking.

Sources:

- https://arxiv.org/abs/2312.10997
- https://arxiv.org/abs/2501.09136
- https://www.anthropic.com/research/contextual-retrieval

## Project-Specific Hypothesis

The following combination is original to this harness and requires local evaluation:

> A lead agent with full task context should author the durable semantic payload, while a separate curator should control retrieval, placement, linking, conflict detection, and graph hygiene without adding unsupported meaning.

The rationale is information preservation, not an assumption that more agents are always better. For small tasks, direct lead-agent memory may be cheaper. See `evaluation.md`.
