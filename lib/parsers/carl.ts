import type { LibraryConfig } from "../libraries";
import { resourceTypeFromLabel } from "../formats";
import type { CatalogHit } from "../types";

interface Holding {
  onshelf?: boolean;
  hideFromPublic?: boolean;
}

interface Resource {
  shortTitle?: string;
  shortAuthor?: string;
  format?: string;
  downloadable?: boolean;
  holdingsInformations?: Holding[];
}

interface SearchPayload {
  resources?: Resource[];
}

export async function searchCarl(library: LibraryConfig, query: string): Promise<CatalogHit[]> {
  if (!library.origin) throw new Error("Missing CARL catalog origin");

  const safeQuery = query.replace(/"/g, "").trim();
  const response = await fetch(`${library.origin}/search`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "User-Agent": "library-search/1.0",
    },
    body: JSON.stringify({
      searchTerm: `title:"${safeQuery}"`,
      hitsPerPage: 25,
      facetFilters: [],
      branchFilters: [],
      sortCriteria: "relevance",
      targetAudience: "",
    }),
    signal: AbortSignal.timeout(12000),
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`Catalog returned ${response.status}`);

  const data = (await response.json()) as SearchPayload;
  const hits: CatalogHit[] = [];

  for (const item of data.resources ?? []) {
    const title = (item.shortTitle ?? "").trim();
    if (!title) continue;
    const holdings = (item.holdingsInformations ?? []).filter((holding) => !holding.hideFromPublic);
    const onShelf = holdings.some((holding) => holding.onshelf);
    const digital = item.downloadable === true && holdings.length === 0;
    hits.push({
      title,
      author: (item.shortAuthor ?? "").trim(),
      resourceType: resourceTypeFromLabel(item.format ?? "", title),
      available: onShelf || digital,
    });
  }

  return hits;
}
