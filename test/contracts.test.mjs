import test from "node:test"
import assert from "node:assert/strict"
import fs from "node:fs"
import { validateBrainBrief, validateDerivedIndex, validateHotContextPack, validateMemoryPatch } from "../src/contracts.mjs"

const patch = JSON.parse(fs.readFileSync(new URL("../examples/memory-patch.json", import.meta.url)))
const brief = JSON.parse(fs.readFileSync(new URL("../examples/brain-brief.json", import.meta.url)))
const derivedIndex = JSON.parse(fs.readFileSync(new URL("../examples/derived-index.json", import.meta.url)))
const hotContextPack = JSON.parse(fs.readFileSync(new URL("../examples/hot-context-pack.json", import.meta.url)))

test("accepts the example Memory Patch", () => {
  assert.deepEqual(validateMemoryPatch(patch), { valid: true, errors: [] })
})

test("rejects a patch without provenance", () => {
  const result = validateMemoryPatch({ ...patch, provenance: [] })
  assert.equal(result.valid, false)
  assert.match(result.errors.join("\n"), /provenance/)
})

test("rejects unsupported memory types", () => {
  const result = validateMemoryPatch({ ...patch, suggested_type: "diary" })
  assert.equal(result.valid, false)
})

test("rejects a patch without lifecycle metadata", () => {
  const { lifecycle: _lifecycle, ...withoutLifecycle } = patch
  const result = validateMemoryPatch(withoutLifecycle)
  assert.equal(result.valid, false)
  assert.match(result.errors.join("\n"), /lifecycle/)
})

test("accepts the example Brain Brief", () => {
  assert.deepEqual(validateBrainBrief(brief), { valid: true, errors: [] })
})

test("bounds direct reads to three paths", () => {
  const result = validateBrainBrief({
    ...brief,
    direct_read_paths: ["aaa", "bbb", "ccc", "ddd"],
  })
  assert.equal(result.valid, false)
  assert.match(result.errors.join("\n"), /at most 3/)
})

test("accepts the example Derived Index", () => {
  assert.deepEqual(validateDerivedIndex(derivedIndex), { valid: true, errors: [] })
})

test("rejects a derived index that claims canonical memory status", () => {
  const result = validateDerivedIndex({ ...derivedIndex, canonical_memory: true })
  assert.equal(result.valid, false)
  assert.match(result.errors.join("\n"), /canonical_memory/)
})

test("accepts the example Hot Context Pack", () => {
  assert.deepEqual(validateHotContextPack(hotContextPack), { valid: true, errors: [] })
})

test("rejects a hot context pack that claims canonical memory status", () => {
  const result = validateHotContextPack({ ...hotContextPack, canonical_memory: true })
  assert.equal(result.valid, false)
  assert.match(result.errors.join("\n"), /canonical_memory/)
})
