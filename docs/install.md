# Installation

Memory Patch Harness is file-first. It installs a skill and gives you adapter snippets, but it does not rewrite your agent configuration automatically.

## Requirements

- Node.js 20 or newer
- A Markdown memory folder or Obsidian vault
- A coding agent that can read files and call a small memory-curator role

## Install The Skill

```sh
git clone https://github.com/Grunte12/memory-patch-harness.git
cd memory-patch-harness
npm run check
node scripts/install.mjs --target "$HOME/.config/opencode"
```

The installer copies `skills/memory-curator/` only. It does not edit `opencode.json`.

## Initialize A Project Memory Area

```sh
node scripts/init-project.mjs --vault "/path/to/ObsidianVault" --project "my-project"
```

This creates a small project home under the vault. Keep project-specific facts there; keep global harness rules in this repository.

## OpenCode Adapter

Review:

- `adapters/opencode/AGENTS.snippet.md`
- `adapters/opencode/memory-curator-prompt.md`
- `adapters/opencode/opencode.agent.example.json`

The core mapping is:

```text
Main agent / orchestrator -> authors Memory Patch
memory_curator -> retrieves Brain Briefs and applies patches
Markdown / Obsidian -> canonical operational memory
Derived Index / Hot Context Pack -> rebuildable views
```

## Any-Agent Adapter

If you are not using OpenCode, keep the same boundary:

1. The main agent completes and verifies work.
2. The main agent writes a valid Memory Patch.
3. The memory curator finds the target note, checks conflicts, and returns `APPLIED`, `TENSION`, or `BLOCKED`.
4. Future work asks the curator for a bounded Brain Brief before loading broad memory.

The memory curator may be cheap. It should not decide what the system learned; it should place, link, and lint the lead-agent-authored patch.

## Verify

```sh
npm run check
npm run eval:curator:compare
node scripts/render-hot-context.mjs
```

These commands validate the contracts, retrieval baselines, curator behavior, patch quality, and hot-context rendering.
