import type { LibraryConfig } from "../libraries";
import { resourceTypeFromCode } from "../formats";
import type { CatalogHit } from "../types";

interface TitleHit {
  title?: string;
  author?: string;
  materialType?: string;
  titleAvailabilityInfo?: { totalCopiesAvailable?: number };
}

interface SearchPayload {
  HitlistTitleInfo?: TitleHit[];
}

export async function searchSirsi(library: LibraryConfig, query: string): Promise<CatalogHit[]> {
  if (!library.ilsws) throw new Error("Missing Sirsi service URL");

  const url = new URL(`${library.ilsws}/rest/standard/searchCatalog`);
  url.searchParams.set("clientID", "DS_CLIENT");
  url.searchParams.set("term1", query);
  url.searchParams.set("searchType1", "TITLE");
  url.searchParams.set("hitsToDisplay", "25");
  url.searchParams.set("includeAvailabilityInfo", "true");

  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
      "User-Agent": "library-search/1.0",
      "x-sirs-clientID": "DS_CLIENT",
    },
    signal: AbortSignal.timeout(12000),
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`Catalog returned ${response.status}`);

  const data = (await response.json()) as SearchPayload;
  const hits: CatalogHit[] = [];

  for (const item of data.HitlistTitleInfo ?? []) {
    const title = (item.title ?? "").trim();
    if (!title) continue;
    const availableCopies = item.titleAvailabilityInfo?.totalCopiesAvailable ?? 0;
    hits.push({
      title,
      author: (item.author ?? "").replace(/,\s*$/, "").trim(),
      resourceType: resourceTypeFromCode(item.materialType ?? "", title),
      available: availableCopies > 0,
    });
  }

  return hits;
}
