# Cost and Scale

## English

### What the harness makes cheaper

The harness removes several mandatory components from the initial deployment:

- no hosted vector database,
- no embedding API,
- no embedding batch or re-index job,
- no separate retrieval service,
- no raw-history upload,
- and no vector index as a second source of truth.

It does not make memory free. Costs still exist:

- the curator model must interpret retrieval results,
- filesystem or BM25 search consumes local CPU,
- humans or agents must maintain canonical notes,
- and large files still waste context unless retrieval is section-bounded.

### Real private-vault evaluation

A private local evaluation used 23 real project notes and ten manually labeled questions. Note contents and queries were not published.

At `k=3`:

| Method | Hit@3 | Recall@3 | MRR | nDCG@3 | Avg context chars |
|---|---:|---:|---:|---:|---:|
| Lexical whole-note | 70.0% | 55.0% | 0.498 | 0.415 | 50,843 |
| BM25 whole-note | 90.0% | 75.0% | 0.787 | 0.703 | 28,190 |
| BM25 section retrieval | 100.0% | 90.0% | 0.817 | 0.792 | 2,330 |

Section retrieval reduced retrieved context by about 95.4% versus lexical whole-note retrieval while improving recall by 35 percentage points.

This is promising evidence for the architecture, not a universal benchmark. The dataset is small, private, manually labeled, and drawn from one vault.

### Is it more scalable than vector RAG?

It depends on the dimension being scaled.

| Dimension | File-native harness | Vector RAG |
|---|---|---|
| Installation/distribution | Simple files and Node.js | More components and model/index choices |
| Ingestion cost | No mandatory embedding pass | Embeddings and re-indexing required |
| Model context cost | Low with section-bounded retrieval | Low when retrieval/reranking is tuned |
| Search CPU at large corpus size | Linear without a persistent index | ANN indexes scale better |
| Semantic paraphrase recall | Limited | Usually stronger |
| Exact policy/status/provenance control | Native and inspectable | Requires metadata and filtering design |
| Offline operation | Native | Also possible with FAISS, SQLite vector extensions, or embedded Qdrant |
| Concurrent multi-user service | Not built in | Mature databases provide stronger concurrency and access controls |

Vector retrieval is not inherently cloud-only or expensive. Local FAISS, SQLite Vec1, and Qdrant Edge show that embeddings and vector search can run locally. The real trade-off is operational complexity, indexing, model selection, stale derived state, memory use, and governance.

### Provisional operating ranges

These are engineering starting points, not universal limits:

- **Small curated memory**: project maps plus section retrieval.
- **Medium memory with exact-term failures**: add a persistent BM25/full-text index.
- **Semantic recall failures**: evaluate local embeddings and hybrid retrieval.
- **Large or uncurated corpora**: vector/hybrid retrieval becomes increasingly valuable.
- **Concurrent team service**: add a database/service layer for transactions, identity, and access control.

Raw evidence remains the evidentiary source of truth. Canonical Markdown remains the operational memory at every stage. Indexes should be rebuildable derived views.

### Dependency-free scale benchmark

Run:

```sh
npm run bench:scale
```

Illustrative results from one Windows development machine, using 20 in-memory queries per size:

| Notes | Method | Average query ms | Retrieved context chars |
|---:|---|---:|---:|
| 100 | lexical | 0.69 | 544 |
| 100 | BM25 | 0.30 | 541 |
| 100 | BM25 sections | 1.20 | 168 |
| 1,000 | lexical | 1.55 | 547 |
| 1,000 | BM25 | 2.11 | 544 |
| 1,000 | BM25 sections | 9.36 | 169 |
| 10,000 | lexical | 13.94 | 550 |
| 10,000 | BM25 | 22.36 | 547 |
| 10,000 | BM25 sections | 113.03 | 170 |

The current implementation recomputes token statistics and sections for every query. It is intentionally a transparent baseline, not an optimized search engine. The roughly linear growth demonstrates the boundary: section retrieval controls model context well, but a persistent local index becomes appropriate as corpus size and query concurrency grow.

### Pain points this architecture targets

- vector similarity can retrieve a semantically close but stale or out-of-scope policy;
- chunking can detach a claim from status, date, scope, and provenance;
- embedding model changes require re-indexing;
- deleted or edited source files can leave stale vectors;
- every extra retrieval service adds deployment and observability work;
- storing raw conversations creates noisy memory and privacy risk;
- many coding-agent memories are already structured decisions rather than unstructured document archives.

### Pain points the architecture does not solve

- semantic search across very large or multilingual corpora;
- high-concurrency team access;
- automatic authorization inherited from source systems;
- uncurated PDF and transcript ingestion;
- approximate nearest-neighbor search at very large scale;
- guaranteed correctness of curator judgment.

### Sources

- Anthropic Contextual Retrieval: https://www.anthropic.com/research/contextual-retrieval
- FAISS: https://github.com/facebookresearch/faiss
- SQLite Vec1: https://sqlite.org/vec1
- Qdrant local and embedded options: https://qdrant.tech/documentation/
- Episodic-semantic memory evaluation: https://arxiv.org/abs/2605.17625
- Consolidation failure evidence: https://arxiv.org/abs/2605.12978

## ภาษาไทย

### ระบบนี้ลดต้นทุนตรงไหน

การเริ่มใช้งานไม่บังคับให้มี:

- Cloud vector database
- Embedding API
- งาน batch สำหรับสร้างและอัปเดต embeddings
- Retrieval service แยก
- การอัปโหลด raw history
- Vector index ที่กลายเป็นแหล่งข้อมูลอีกชุดหนึ่ง

แต่ระบบไม่ได้ฟรีทั้งหมด เพราะ Curator ยังใช้ model, การค้นไฟล์ใช้ CPU และ canonical notes ต้องได้รับการดูแล

### ผลจาก private real-vault eval

ทดสอบบน project memory จริง 23 notes และคำถามที่ติด label เอง 10 ข้อ โดยไม่เผยแพร่เนื้อหา vault

| วิธี | Hit@3 | Recall@3 | MRR | nDCG@3 | Context chars เฉลี่ย |
|---|---:|---:|---:|---:|---:|
| Lexical ทั้ง note | 70.0% | 55.0% | 0.498 | 0.415 | 50,843 |
| BM25 ทั้ง note | 90.0% | 75.0% | 0.787 | 0.703 | 28,190 |
| BM25 ระดับ section | 100.0% | 90.0% | 0.817 | 0.792 | 2,330 |

Section retrieval ลด context ประมาณ 95.4% และเพิ่ม recall 35 percentage points เมื่อเทียบกับ lexical ที่ส่งทั้ง note

ผลนี้สนับสนุน architecture ของเรา แต่ยังไม่ใช่ benchmark สากล เพราะ dataset เล็ก มาจาก vault เดียว และ label ด้วยมือ

### Scale ดีกว่า Vector RAG หรือไม่

ขึ้นอยู่กับสิ่งที่ต้องการ scale:

- การติดตั้งและแจกจ่าย: ระบบไฟล์ง่ายกว่า
- ค่า ingestion: ไม่ต้องสร้าง embeddings
- Context cost: section retrieval มีประสิทธิภาพมาก
- Corpus ใหญ่มาก: vector ANN index เหนือกว่า linear file scan
- Semantic paraphrase: vector retrieval มักดีกว่า
- Policy, status, scope และ provenance: Markdown governance ตรวจสอบง่ายกว่า
- Multi-user concurrency: vector/database service พร้อมกว่าระบบไฟล์

Vector RAG ไม่จำเป็นต้องใช้ cloud เสมอไป FAISS, SQLite Vec1 และ Qdrant Edge สามารถทำงาน local ได้ Pain point ที่แท้จริงคือความซับซ้อนของ indexing, embedding model, stale state, RAM/storage, deployment และ governance

### จุดขายที่ซื่อสัตย์ของเรา

ระบบนี้เหมาะกับ coding-agent memory เพราะข้อมูลส่วนใหญ่เป็น decision, workflow, preference และ root cause ที่มีโครงสร้างอยู่แล้ว ไม่ใช่คลัง PDF จำนวนมหาศาล

เราใช้ความสามารถของ agent รุ่นใหม่ให้มันอ่าน project map, เดินตาม links, ตรวจ scope/provenance และเลือก section ที่เกี่ยวข้อง โดยยังรักษา Markdown เป็น source of truth

เมื่อ corpus โตหรือ semantic recall เริ่มพลาด เราสามารถเพิ่ม BM25, embedding, reranking หรือ graph index เป็น optional derived layer โดยไม่ทิ้ง architecture หลัก

### Scale benchmark แบบไม่ใช้ dependency

คำสั่ง `npm run bench:scale` ทดสอบตั้งแต่ 100 ถึง 10,000 notes บนเครื่องพัฒนาเครื่องหนึ่ง ผลที่ 10,000 notes คือ lexical ประมาณ 13.94 ms/query, BM25 22.36 ms/query และ BM25 section 113.03 ms/query โดย section retrieval ส่ง context เฉลี่ยเพียง 170 characters

ผลนี้ไม่ใช่ benchmark สากล แต่แสดงขอบเขตชัดเจน: context ที่เข้า model scale ได้ดีมาก แต่ implementation ปัจจุบันยังคำนวณ token statistics และ sections ใหม่ทุก query จึงโตแบบใกล้ linear เมื่อ corpus ใหญ่ ควรเพิ่ม persistent local index ก่อนพยายามรองรับงานพร้อมกันจำนวนมาก
