/* ============================================================
   CORE COMPARISON LOGIC
   ============================================================ */

function compareDocuments(textA, textB, chunkSize) {
  const wordsA = tokenize(textA);
  const wordsB = tokenize(textB);

  const chunksA = makeChunks(wordsA, chunkSize);
  const chunksB = makeChunks(wordsB, chunkSize);

  const trie = new Trie();
  for (const chunk of chunksA) {
    trie.insert(hashChunk(chunk.text));
  }

  const matchedInB = new Set();
  let matchedChunkCount = 0;

  for (const chunk of chunksB) {
    const h = hashChunk(chunk.text);
    if (trie.search(h)) {
      matchedChunkCount++;
      for (let i = chunk.start; i <= chunk.end; i++) matchedInB.add(i);
    }
  }

  const hashSetB = new Set(chunksB.map(c => hashChunk(c.text)));
  const matchedInA = new Set();
  for (const chunk of chunksA) {
    if (hashSetB.has(hashChunk(chunk.text))) {
      for (let i = chunk.start; i <= chunk.end; i++) matchedInA.add(i);
    }
  }

  const similarity = chunksB.length === 0
    ? 0
    : Math.round((matchedChunkCount / chunksB.length) * 100);

  return { similarity, wordsA, wordsB, matchedInA, matchedInB };
}

function renderHighlighted(words, matchedSet) {
  return words
    .map((w, i) => matchedSet.has(i) ? `<mark>${w}</mark>` : w)
    .join(" ");
}