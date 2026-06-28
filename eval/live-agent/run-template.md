# Live Model Run Template

Use this file as a copyable worksheet for a real model or prompt run. Do not commit private transcripts, secrets, or project-specific names.

## Run Metadata

- Date:
- Model / provider:
- Prompt variant:
- Token or cost budget:
- Tool access:
- Incident set:
- Human reviewer:

## Procedure

1. Pick incidents from `eval/live-agent/incidents.json`.
2. Hide expected memory actions and expected future effects from the tested model.
3. Ask the model to produce candidate Brain Brief, Memory Patch, and curator outputs.
4. Save outputs outside the repo or under ignored `tmp/`.
5. Score with:

```sh
node scripts/eval-agent-run.mjs \
  --curator-output path/to/curator-output.json \
  --patches path/to/patch-candidates \
  --allow-failures
```

## Results

| Metric | Value |
|---|---:|
| Curator pass rate | |
| Average patch score | |
| False-memory failures | |
| Conflict handling failures | |
| Missing lifecycle failures | |
| Estimated input tokens | |
| Estimated output tokens | |
| Latency | |
| Human correction time | |

## Notes

- Strong examples:
- Failure examples:
- Prompt changes to test next:
