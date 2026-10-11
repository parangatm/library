export function normalize(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/\p{M}/gu, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Main title before a subtitle marker. "Dune: a novel" matches "dune"; "Dune Messiah" does not. */
export function mainTitle(title: string): string {
  const head = title.split(/[:;/]| - /)[0] ?? title;
  return normalize(head);
}

export function titlesMatch(catalogTitle: string, query: string): boolean {
  const wanted = normalize(query);
  if (!wanted) return false;
  return mainTitle(catalogTitle) === wanted;
}

export function cleanAuthor(author: string): string {
  let value = author.trim();
  let previous = "";
  while (value !== previous) {
    previous = value;
    value = value.replace(/,?\s*(?:a?uthors?|illustrators?|editors?|narrators?|compilers?)\.?\s*$/i, "");
    value = value.replace(/[,\s.]+$/, "").trim();
  }
  return value;
}

function authorWords(author: string): string {
  const cleaned = cleanAuthor(author).replace(/\b\d{4}\b/g, " ").trim();
  const comma = cleaned.indexOf(",");
  if (comma === -1) return cleaned;

  const surname = cleaned.slice(0, comma).trim();
  const givenNames = cleaned.slice(comma + 1).trim();
  return givenNames && surname ? `${givenNames} ${surname}` : cleaned;
}

export function displayAuthorName(author: string): string {
  return authorWords(author).replace(/\s+/g, " ").trim();
}

export function authorKey(author: string): string {
  return normalize(authorWords(author));
}

export function authorsMatch(catalogAuthor: string, queryAuthor: string): boolean {
  const wanted = normalize(queryAuthor);
  if (!wanted) return true;
  const author = authorKey(catalogAuthor);
  if (!author) return false;
  const authorParts = author.split(" ");
  const wantedParts = wanted.split(" ");
  const namesMatch = wantedParts.every((part) => authorParts.includes(part));
  return namesMatch && authorParts.length <= wantedParts.length + 2;
}
