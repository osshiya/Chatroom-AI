import { marked } from "https://cdn.jsdelivr.net/npm/marked/lib/marked.esm.js";

export function toMarked(message) {
  var result = marked.parse(message);

  return result;
}