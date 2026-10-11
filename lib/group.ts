import { librariesAlphabetical, type LibraryConfig } from "./libraries";
import { authorKey, authorsMatch, cleanAuthor, displayAuthorName, titlesMatch } from "./text";
import { RESOURCE_TYPES, type LibrarySearchResult, type ResourceType, type SearchResponse, type WorkResult } from "./types";

const LABELS: Record<ResourceType, string> = {
  book: "Book",
  ebook: "eBook",
  audiobook: "Audiobook",
  other: "Other media",
};

interface MatchedHit {
  libraryId: string;
  title: string;
  author: string;
  authorKey: string;
  resourceType: ResourceType;
  available: boolean;
}

export function groupResults(
  query: string,
  authorQuery: string,
  results: LibrarySearchResult[],
): SearchResponse {
  const libraries = librariesAlphabetical();
  const byId = new Map(results.map((result) => [result.libraryId, result]));
  const matched: MatchedHit[] = [];

  for (const result of results) {
    if (result.error) continue;
    for (const hit of result.hits) {
      if (!titlesMatch(hit.title, query)) continue;
      const author = cleanAuthor(hit.author);
      if (!authorsMatch(author, authorQuery)) continue;
      matched.push({
        libraryId: result.libraryId,
        title: hit.title,
        author,
        authorKey: authorKey(author) || "unknown",
        resourceType: hit.resourceType,
        available: hit.available,
      });
    }
  }

  const groups = new Map<string, MatchedHit[]>();
  for (const hit of matched) {
    const list = groups.get(hit.authorKey) ?? [];
    list.push(hit);
    groups.set(hit.authorKey, list);
  }

  const reach = (hits: MatchedHit[]) => new Set(hits.map((hit) => `${hit.libraryId}:${hit.resourceType}`)).size;
  const works: WorkResult[] = [...groups.values()]
    .map((hits) => ({ reach: reach(hits), work: toWork(hits[0].authorKey, hits, libraries, byId, query) }))
    .sort(
      (a, b) =>
        b.reach - a.reach ||
        a.work.author.localeCompare(b.work.author, "en") ||
        a.work.title.localeCompare(b.work.title, "en"),
    )
    .map(({ work }) => work);

  const libraryErrors = libraries
    .map((library) => {
      const error = byId.get(library.id)?.error;
      return error ? { libraryName: library.name, error } : null;
    })
    .filter((item): item is { libraryName: string; error: string } => item !== null);

  return { query, author: authorQuery, works, libraryErrors };
}

function toWork(
  key: string,
  hits: MatchedHit[],
  libraries: LibraryConfig[],
  byId: Map<string, LibrarySearchResult>,
  query: string,
): WorkResult {
  const title = displayTitle(hits, query);
  const author = key === "unknown" ? "Unknown author" : displayAuthor(hits);

  return {
    title,
    author,
    sections: RESOURCE_TYPES.map((type) => ({
      type,
      label: LABELS[type],
      rows: libraries.map((library) => {
        const result = byId.get(library.id);
        const href = library.searchUrl(query);
        if (result?.error) {
          return {
            libraryId: library.id,
            libraryName: library.name,
            status: "error" as const,
            href,
            error: result.error,
          };
        }
        const relevant = hits.filter((hit) => hit.libraryId === library.id && hit.resourceType === type);
        const status = relevant.some((hit) => hit.available)
          ? "available"
          : relevant.length > 0
            ? "on_hold"
            : "not_found";
        return {
          libraryId: library.id,
          libraryName: library.name,
          status,
          href,
        };
      }),
    })),
  };
}

function displayTitle(hits: MatchedHit[], query: string): string {
  const titles = hits.map((hit) => hit.title.trim()).filter(Boolean);
  const exact = titles.filter((title) => title.localeCompare(query, "en", { sensitivity: "accent" }) === 0);
  const pool = exact.length > 0 ? exact : titles;
  return pool.sort((a, b) => a.length - b.length)[0] ?? query;
}

function displayAuthor(hits: MatchedHit[]): string {
  const authors = hits.map((hit) => hit.author.trim()).filter(Boolean);
  const selected = authors.sort((a, b) => a.length - b.length)[0];
  return selected ? displayAuthorName(selected) : "Unknown author";
}
