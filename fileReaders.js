/* ============================================================
   TEXT PREPROCESSING + CHUNKING
   ============================================================ */

function tokenize(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(w => w.length > 0);
}

function makeChunks(words, size) {
  const chunks = [];
  for (let i = 0; i + size <= words.length; i++) {
    const chunkWords = words.slice(i, i + size);
    chunks.push({
      text: chunkWords.join(" "),
      start: i,
      end: i + size - 1
    });
  }
  return chunks;
}

/* ============================================================
   FILE READING — txt / pdf / docx  →  plain text
   ============================================================ */

function readTxt(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsText(file);
  });
}

async function renderPageToCanvas(page) {
  const viewport = page.getViewport({ scale: 2 });
  const canvas = document.createElement("canvas");
  canvas.width = viewport.width;
  canvas.height = viewport.height;
  const ctx = canvas.getContext("2d");
  await page.render({ canvasContext: ctx, viewport }).promise;
  return canvas;
}

async function ocrCanvas(canvas, onProgress) {
  const { data } = await Tesseract.recognize(canvas, "eng", {
    logger: (m) => {
      if (onProgress && m.status === "recognizing text") {
        onProgress(Math.round(m.progress * 100));
      }
    }
  });
  return data.text;
}

async function readPdf(file, { useOcr = true, onStatus = () => {} } = {}) {
  const arrayBuffer = await file.arrayBuffer();
  pdfjsLib.GlobalWorkerOptions.workerSrc =
    "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

  let fullText = "";
  let ocrWasUsed = false;
  const MIN_CHARS_PER_PAGE = 20;

  for (let p = 1; p <= pdf.numPages; p++) {
    const page = await pdf.getPage(p);
    const content = await page.getTextContent();
    const pageText = content.items.map(item => item.str).join(" ").trim();

    if (pageText.length >= MIN_CHARS_PER_PAGE) {
      fullText += pageText + " ";
    } else if (useOcr) {
      ocrWasUsed = true;
      onStatus(`Page ${p}/${pdf.numPages} has no text layer — running OCR...`);
      const canvas = await renderPageToCanvas(page);
      const ocrText = await ocrCanvas(canvas, (pct) => {
        onStatus(`Page ${p}/${pdf.numPages} — OCR ${pct}%`);
      });
      fullText += ocrText + " ";
    }
  }

  return { text: fullText, ocrWasUsed };
}

async function readDocx(file) {
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  return { text: result.value, ocrWasUsed: false };
}

async function extractText(file, options) {
  const ext = file.name.split(".").pop().toLowerCase();
  if (ext === "txt") return { text: await readTxt(file), ocrWasUsed: false };
  if (ext === "pdf") return await readPdf(file, options);
  if (ext === "docx") return await readDocx(file);
  throw new Error("Unsupported file type: ." + ext);
}