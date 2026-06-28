import test from "node:test"
import assert from "node:assert/strict"
import {
  bm25Rank,
  lexicalRank,
  parseMarkdown,
  rank,
  scoreRun,
  tokenize,
} from "../src/retrieval.mjs"

const documents = [
  parseMarkdown("alpha", "# Alpha\nUse provenance for durable claims."),
  parseMarkdown("beta", "# Beta\nKeep routine transcripts out of memory."),
  parseMarkdown("gamma", "# Gamma\nProvenance paths support every stored claim."),
]

test("tokenizes Unicode words and identifiers", () => {
  assert.deepEqual(tokenize("Brain Brief กับ root-cause"), ["brain", "brief", "กับ", "root-cause"])
})

test("lexical retrieval drops zero-score documents", () => {
  assert.deepEqual(lexicalRank(documents, "transcripts").map((item) => item.id), ["beta"])
})

test("BM25 ranks repeated relevant evidence first", () => {
  assert.equal(bm25Rank(documents, "provenance claim")[0].id, "gamma")
})

test("scores recall and reciprocal rank at k", () => {
  const results = bm25Rank(documents, "provenance claim")
  const metrics = scoreRun(results, ["gamma"], 2)
  assert.equal(metrics.hit, 1)
  assert.equal(metrics.recall, 1)
  assert.equal(metrics.reciprocalRank, 1)
})

test("section retrieval returns one best section per parent note", () => {
  const sectioned = [
    parseMarkdown(
      "policy",
      "# Policy\n\n## Old Decision\nUse browser screenshots.\n\n## Current Decision\nUse Playwright evidence.",
    ),
    parseMarkdown("other", "# Other\nUse backend tests."),
  ]
  const results = rank(sectioned, "current Playwright", "bm25-sections")
  assert.equal(results[0].id, "policy")
  assert.match(results[0].title, /Current Decision/)
  assert.equal(results.filter((item) => item.id === "policy").length, 1)
})
