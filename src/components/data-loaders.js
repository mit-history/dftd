// src/components/data-loaders.js
// Robust FileAttachment loaders (Observable Framework).

export async function tryJson(FileAttachment, ...paths) {
  for (const p of paths) {
    try {
      return await FileAttachment(p).json();
    } catch (e) {
      // keep trying
    }
  }
  throw new Error(`Could not load JSON from any of: ${paths.join(", ")}`);
}

export async function tryCsv(FileAttachment, typed, ...paths) {
  for (const p of paths) {
    try {
      return await FileAttachment(p).csv({ typed });
    } catch (e) {
      // keep trying
    }
  }
  throw new Error(`Could not load CSV from any of: ${paths.join(", ")}`);
}
