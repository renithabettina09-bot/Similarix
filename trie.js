/* ============================================================
   TRIE (stores hashed chunks from Document A for fast lookup)
   ============================================================ */
class TrieNode {
  constructor() {
    this.children = {};   // maps a single character -> TrieNode
    this.isEnd = false;   // true if a hash string ends at this node
  }
}

class Trie {
  constructor() {
    this.root = new TrieNode();
  }

  // Insert a hash string (e.g. "a3f9c1") into the trie, char by char
  insert(hashStr) {
    let node = this.root;
    for (const ch of hashStr) {
      if (!node.children[ch]) node.children[ch] = new TrieNode();
      node = node.children[ch];
    }
    node.isEnd = true;
  }

  // Check whether a hash string exists in the trie
  search(hashStr) {
    let node = this.root;
    for (const ch of hashStr) {
      if (!node.children[ch]) return false;
      node = node.children[ch];
    }
    return node.isEnd;
  }
}

/* ============================================================
   HASHING (djb2 algorithm — turns any chunk of text into a
   short fixed-length string, used as the Trie key)
   ============================================================ */
function hashChunk(str) {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash + str.charCodeAt(i)) >>> 0; // unsigned 32-bit
  }
  return hash.toString(16); // convert to hex string, e.g. "a3f9c1"
}