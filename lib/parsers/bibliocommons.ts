import type { LibraryConfig } from "../libraries";
import { resourceTypeFromCode } from "../formats";
import type { CatalogHit } from "../types";

const AVAILABLE = new Set([
  "AVAILABLE",
  "AVAILABLE_IN_BRANCH",
  "AVAILABLE_IN_SINGLE_BRANCH",
  "DIGITAL_ALWAYS_AVAILABLE",
]);

interface BriefInfo {
  title?: string;
  authors?: string[];
  format?: string;
}

interface Availability {
  statusType?: string;
  localisedStatus?: string;
}

interface Bib {
  briefInfo?: BriefInfo;
  availability?: Availability;
}

interface SearchPayload {
  catalogSearch?: { results?: { representative?: string }[] };
  entities?: { bibs?: Record<string, Bib> };
}

export async function searchBiblioCommons(
  library: LibraryConfig,
  query: string,
): Promise<CatalogHit[]> {
  const slug = library.slug;
  if (!slug) throw new Error("Missing BiblioCommons slug");

  const url = new URL(`https://gateway.bibliocommons.com/v2/libraries/${slug}/bibs/search`);
  url.searchParams.set("query", query);
  url.searchParams.set("searchType", "title");
  url.searchParams.set("locale", "en-US");
  url.searchParams.set("page", "1");

  const response = await fetch(url, {
    headers: { Accept: "application/json", "User-Agent": "library-search/1.0" },
    signal: AbortSignal.timeout(12000),
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`Catalog returned ${response.status}`);

  const data = (await response.json()) as SearchPayload;
  const bibs = data.entities?.bibs ?? {};
  const order = data.catalogSearch?.results ?? [];
  const hits: CatalogHit[] = [];

  for (const result of order) {
    const bib = result.representative ? bibs[result.representative] : undefined;
    if (!bib?.briefInfo?.title) continue;
    const title = bib.briefInfo.title.trim();
    const author = (bib.briefInfo.authors?.[0] ?? "").trim();
    const format = bib.briefInfo.format ?? "";
    const status = bib.availability?.statusType ?? "";
    const localised = bib.availability?.localisedStatus ?? "";
    hits.push({
      title,
      author,
      resourceType: resourceTypeFromCode(format, title),
      available: AVAILABLE.has(status) || AVAILABLE.has(localised),
    });
  }

  return hits;
}
