#!/usr/bin/env node
import fs from "node:fs"
import os from "node:os"
import path from "node:path"
import process from "node:process"
import { fileURLToPath } from "node:url"

const here = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(here, "..")
const args = process.argv.slice(2)

function option(name, fallback) {
  const index = args.indexOf(name)
  return index >= 0 ? args[index + 1] : fallback
}

const targetRoot = path.resolve(option("--target", path.join(os.homedir(), ".config", "opencode")))
const force = args.includes("--force")
const source = path.join(root, "skills", "memory-curator")
const destination = path.join(targetRoot, "skills", "memory-curator")

if (fs.existsSync(destination) && !force) {
  console.error(`Refusing to overwrite ${destination}`)
  console.error("Review the existing skill or rerun with --force.")
  process.exit(1)
}

fs.mkdirSync(path.dirname(destination), { recursive: true })
fs.cpSync(source, destination, { recursive: true, force })

console.log(`Installed skill: ${destination}`)
console.log("")
console.log("Manual OpenCode integration:")
console.log(`1. Review ${path.join(root, "adapters", "opencode", "AGENTS.snippet.md")}`)
console.log(`2. Review ${path.join(root, "adapters", "opencode", "memory-curator-prompt.md")}`)
console.log("3. Merge the example agent using only fields supported by your OpenCode version.")
console.log("The installer intentionally does not edit opencode.json.")
