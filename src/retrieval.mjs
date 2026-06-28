const WORD = /[\p{L}\p{M}\p{N}_-]+/gu

export function tokenize(value) {
  return String(value)
    .toLocaleLowerCase("en")
    .match(WORD)
    ?.filter((token) => token.length > 1) ?? []
}

export function parseMarkdown(id, markdown) {
  const title = markdown.match(/^#\s+(.+)$/m)?.[1]?.trim() ?? id
  const frontmatter = markdown.startsWith("---")
    ? markdown.split("---", 3)[1] ?? ""
    : ""
  return {
    id,
    title,
    text: `${frontmatter}\n${markdown}`,
    tokens: tokenize(`${title}\n${frontmatter}\n${markdown}`),
    characters: markdown.length,
    markdown,
  }
}

export function splitMarkdownSections(document) {
  const lines = document.markdown.split(/\r?\n/)
  const sections = []
  let heading = document.title
  let body = []

  function flush() {
    const content = body.join("\n").trim()
    if (!content) return
    const text = `${document.title}\n${heading}\n${content}`
    sections.push({
      id: document.id,
      chunkId: `${document.id}#${sections.length + 1}`,
      title: `${document.title} - ${heading}`,
      text,
      tokens: tokenize(text),
      characters: content.length,
    })
  }

  for (const line of lines) {
    const match = line.match(/^#{2,6}\s+(.+)$/)
    if (match) {
      flush()
      heading = match[1].trim()
      body = []
    } else {
      body.push(line)
    }
  }
  flush()

  return sections.length
    ? sections
    : [{
        id: document.id,
        chunkId: `${document.id}#1`,
        title: document.title,
        text: document.text,
        tokens: document.tokens,
        characters: document.characters,
      }]
}

function frequencies(tokens) {
  const counts = new Map()
  for (const token of tokens) counts.set(token, (counts.get(token) ?? 0) + 1)
  return counts
}

export function lexicalRank(documents, query) {
  const queryTokens = [...new Set(tokenize(query))]
  return documents
    .map((document) => {
      const counts = frequencies(document.tokens)
      const score = queryTokens.reduce((sum, token) => sum + Math.min(counts.get(token) ?? 0, 3), 0)
      return { ...document, score }
    })
    .filter((document) => document.score > 0)
    .sort((a, b) => b.score - a.score || a.id.localeCompare(b.id))
}

export function bm25Rank(documents, query, { k1 = 1.2, b = 0.75 } = {}) {
  const queryTokens = [...new Set(tokenize(query))]
  const averageLength =
    documents.reduce((sum, document) => sum + document.tokens.length, 0) /
    Math.max(documents.length, 1)

  const documentFrequency = new Map()
  for (const token of queryTokens) {
    documentFrequency.set(
      token,
      documents.filter((document) => document.tokens.includes(token)).length,
    )
  }

  return documents
    .map((document) => {
      const counts = frequencies(document.tokens)
      let score = 0
      for (const token of queryTokens) {
        const frequency = counts.get(token) ?? 0
        if (!frequency) continue
        const containing = documentFrequency.get(token) ?? 0
        const idf = Math.log(1 + (documents.length - containing + 0.5) / (containing + 0.5))
        const lengthNormalization =
          frequency +
          k1 * (1 - b + b * (document.tokens.length / Math.max(averageLength, 1)))
        score += idf * ((frequency * (k1 + 1)) / lengthNormalization)
      }
      return { ...document, score }
    })
    .filter((document) => document.score > 0)
    .sort((a, b) => b.score - a.score || a.id.localeCompare(b.id))
}

export function rank(documents, query, method) {
  if (method === "lexical") return lexicalRank(documents, query)
  if (method === "bm25") return bm25Rank(documents, query)
  if (method === "bm25-sections") {
    const sections = documents.flatMap(splitMarkdownSections)
    const rankedSections = bm25Rank(sections, query)
    const seen = new Set()
    return rankedSections.filter((section) => {
      if (seen.has(section.id)) return false
      seen.add(section.id)
      return true
    })
  }
  throw new Error(`Unknown retrieval method: ${method}`)
}

export function scoreRun(results, relevantIds, k = 3) {
  const relevant = new Set(relevantIds)
  const top = results.slice(0, k)
  const hits = top.filter((result) => relevant.has(result.id))
  const firstRelevant = results.findIndex((result) => relevant.has(result.id))

  let dcg = 0
  top.forEach((result, index) => {
    if (relevant.has(result.id)) dcg += 1 / Math.log2(index + 2)
  })
  let ideal = 0
  for (let index = 0; index < Math.min(k, relevant.size); index += 1) {
    ideal += 1 / Math.log2(index + 2)
  }

  return {
    hit: hits.length > 0 ? 1 : 0,
    recall: relevant.size ? hits.length / relevant.size : 1,
    reciprocalRank: firstRelevant >= 0 ? 1 / (firstRelevant + 1) : 0,
    ndcg: ideal ? dcg / ideal : 1,
    contextCharacters: top.reduce((sum, result) => sum + result.characters, 0),
  }
}

export function summarizeRuns(runs) {
  const total = Math.max(runs.length, 1)
  const average = (field) => runs.reduce((sum, run) => sum + run.metrics[field], 0) / total
  return {
    queries: runs.length,
    hitAtK: average("hit"),
    recallAtK: average("recall"),
    mrr: average("reciprocalRank"),
    ndcgAtK: average("ndcg"),
    averageContextCharacters: average("contextCharacters"),
  }
}
