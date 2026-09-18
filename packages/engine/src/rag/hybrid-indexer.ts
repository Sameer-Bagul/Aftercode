import { CodeChunk } from './chunker.js';

export interface RetrievalResult {
  chunk: CodeChunk;
  score: number;
  bm25Rank: number;
  vectorRank: number;
}

export class EphemeralHybridIndex {
  private chunks: CodeChunk[] = [];
  private termFrequencyMap: Map<string, Map<string, number>> = new Map(); // term -> (chunkId -> frequency)
  private documentLengths: Map<string, number> = new Map();
  private chunkTokensMap: Map<string, string[]> = new Map();
  private avgDocLength = 0;
  private totalDocs = 0;

  constructor() {}

  /**
   * Builds the ephemeral Hybrid RAG Index (BM25 + Vector TF-IDF) for a single repository.
   */
  public async buildIndex(chunks: CodeChunk[]): Promise<void> {
    this.destroyIndex(); // Ensure clean slate before indexing

    this.chunks = [...chunks];
    this.totalDocs = this.chunks.length;
    if (this.totalDocs === 0) return;

    let totalLengthSum = 0;

    for (const chunk of this.chunks) {
      const terms = this.tokenize(chunk.content);
      this.chunkTokensMap.set(chunk.chunkId, terms);
      this.documentLengths.set(chunk.chunkId, terms.length);
      totalLengthSum += terms.length;

      const termCounts = new Map<string, number>();
      for (const term of terms) {
        termCounts.set(term, (termCounts.get(term) || 0) + 1);
      }

      for (const [term, count] of termCounts.entries()) {
        if (!this.termFrequencyMap.has(term)) {
          this.termFrequencyMap.set(term, new Map());
        }
        this.termFrequencyMap.get(term)!.set(chunk.chunkId, count);
      }
    }

    this.avgDocLength = totalLengthSum / Math.max(this.totalDocs, 1);
  }

  /**
   * Performs Hybrid RAG Search using BM25 Sparse Search + Dense Similarity + Reciprocal Rank Fusion (RRF).
   */
  public search(query: string, topK = 8): RetrievalResult[] {
    if (this.chunks.length === 0) return [];

    const queryTerms = this.tokenize(query);
    if (queryTerms.length === 0) return [];

    // 1. BM25 Sparse Search Scoring
    const bm25Scores = new Map<string, number>();
    const k1 = 1.5;
    const b = 0.75;

    for (const term of queryTerms) {
      const postingList = this.termFrequencyMap.get(term);
      if (!postingList) continue;

      const df = postingList.size;
      const idf = Math.log((this.totalDocs - df + 0.5) / (df + 0.5) + 1);

      for (const [chunkId, tf] of postingList.entries()) {
        const docLen = this.documentLengths.get(chunkId) || 1;
        const score = (idf * (tf * (k1 + 1))) / (tf + k1 * (1 - b + b * (docLen / this.avgDocLength)));
        bm25Scores.set(chunkId, (bm25Scores.get(chunkId) || 0) + score);
      }
    }

    // Sort BM25 Ranks
    const sortedBM25 = Array.from(bm25Scores.entries()).sort((a, b) => b[1] - a[1]);
    const bm25RankMap = new Map<string, number>();
    sortedBM25.forEach(([id], idx) => bm25RankMap.set(id, idx + 1));

    // 2. Dense Vector Similarity Scoring (Cosine Similarity on term frequency vectors)
    const vectorScores = new Map<string, number>();
    const queryTermSet = new Set(queryTerms);

    for (const chunk of this.chunks) {
      const chunkTerms = this.chunkTokensMap.get(chunk.chunkId) || [];
      const matchCount = chunkTerms.filter((t) => queryTermSet.has(t)).length;
      const simScore = matchCount / (Math.sqrt(chunkTerms.length || 1) * Math.sqrt(queryTerms.length));
      vectorScores.set(chunk.chunkId, simScore);
    }

    const sortedVector = Array.from(vectorScores.entries()).sort((a, b) => b[1] - a[1]);
    const vectorRankMap = new Map<string, number>();
    sortedVector.forEach(([id], idx) => vectorRankMap.set(id, idx + 1));

    // 3. Reciprocal Rank Fusion (RRF) Combination
    const rrfScores = new Map<string, { chunk: CodeChunk; score: number; bm25Rank: number; vectorRank: number }>();
    const rrfConstant = 60;

    for (const chunk of this.chunks) {
      const bm25Rank = bm25RankMap.get(chunk.chunkId) || this.totalDocs + 1;
      const vectorRank = vectorRankMap.get(chunk.chunkId) || this.totalDocs + 1;
      const rrfScore = 1 / (rrfConstant + bm25Rank) + 1 / (rrfConstant + vectorRank);

      rrfScores.set(chunk.chunkId, {
        chunk,
        score: rrfScore,
        bm25Rank,
        vectorRank,
      });
    }

    const sortedRRF = Array.from(rrfScores.values()).sort((a, b) => b.score - a.score);
    return sortedRRF.slice(0, topK);
  }

  /**
   * MANDATORY PURGE: Completely wipes all vector embeddings, BM25 indices, and chunk arrays to guarantee zero cross-repo leakage.
   */
  public destroyIndex(): void {
    this.chunks = [];
    this.termFrequencyMap.clear();
    this.documentLengths.clear();
    this.chunkTokensMap.clear();
    this.avgDocLength = 0;
    this.totalDocs = 0;
  }

  public getChunkCount(): number {
    return this.chunks.length;
  }

  private tokenize(text: string): string[] {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9_/-]/g, ' ')
      .split(/\s+/)
      .filter((t) => t.length > 2);
  }
}
