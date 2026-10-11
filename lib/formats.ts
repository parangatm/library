import type { ResourceType } from "./types";

const BOOK = new Set(["BK", "LPRINT", "PICTURE_BOOK", "BOARD_BK", "BOARD_BOOK", "BOOK"]);
const EBOOK = new Set(["EBOOK", "E_BOOK"]);
const AUDIOBOOK = new Set([
  "EAUDIOBOOK",
  "AB",
  "BOOK_CD",
  "AUDIOBOOK_CD",
  "PLAYAWAY_AUDIOBOOK",
  "E_SOUNDREC",
]);

export function resourceTypeFromCode(code: string, title = ""): ResourceType {
  const key = code.trim().toUpperCase().replace(/[\s-]+/g, "_");
  if (BOOK.has(key)) return "book";
  if (EBOOK.has(key)) return "ebook";
  if (AUDIOBOOK.has(key)) return "audiobook";
  if (key === "SOUNDDISC") {
    return /music\s*cd|\[music|soundtrack/i.test(title) ? "other" : "audiobook";
  }
  return "other";
}

export function resourceTypeFromLabel(label: string, title = ""): ResourceType {
  const value = label.trim().toLowerCase();
  if (
    value === "eaudiobook" ||
    value === "audiobook" ||
    value === "book on cd" ||
    value === "playaway" ||
    value.includes("audiobook")
  ) {
    return "audiobook";
  }
  if (value === "ebook" || value === "e-book" || value === "electronic resource") return "ebook";
  if (value === "book" || value === "large print" || value === "picture book") return "book";
  if (/music\s*cd|soundtrack/i.test(title) || /music|dvd|blu-?ray|video|magazine|game/i.test(value)) {
    return "other";
  }
  return resourceTypeFromCode(label, title);
}
