import type { LibraryConfig } from "../libraries";
import { resourceTypeFromLabel } from "../formats";
import { titlesMatch } from "../text";
import type { CatalogHit } from "../types";

const API = "https://na5.iiivega.com/api/search-result";

interface MaterialTab {
  name?: string;
  type?: string;
  availability?: {
    status?: { general?: string; electronicLocator?: string };
    vendors?: { overdrive?: { reserveId?: string[] } };
  };
}

interface FormatGroup {
  title?: string;
  primaryAgent?: { label?: string };
  materialTabs?: MaterialTab[];
}

interface SearchPayload {
  data?: FormatGroup[];
}

interface OverDriveAvailability {
  reserveId?: string;
  available?: boolean;
}

function headers(library: LibraryConfig, apiVersion: string): Record<string, string> {
  return {
    Accept: "application/json",
    "Content-Type": "application/json",
    "User-Agent": "library-search/1.0",
    "api-version": apiVersion,
    "iii-customer-domain": `${library.siteCode}.na5.iiivega.com`,
    "iii-host-domain": new URL(library.origin ?? "").host,
    "Anonymous-User-Id": "00000000-0000-4000-8000-000000000000",
  };
}

async function overDriveAvailable(library: LibraryConfig, reserveIds: string[]): Promise<Set<string>> {
  const available = new Set<string>();
  for (let start = 0; start < reserveIds.length; start += 25) {
    const response = await fetch(`${API}/overdrive/products/availability`, {
      method: "POST",
      headers: headers(library, "1"),
      body: JSON.stringify(reserveIds.slice(start, start + 25)),
      signal: AbortSignal.timeout(12000),
      cache: "no-store",
    });
    if (!response.ok) continue;
    const items = (await response.json()) as OverDriveAvailability[];
    for (const item of items) {
      if (item.available && item.reserveId) available.add(item.reserveId);
    }
  }
  return available;
}

export async function searchVega(library: LibraryConfig, query: string): Promise<CatalogHit[]> {
  if (!library.origin || !library.siteCode) throw new Error("Missing Vega catalog settings");

  const response = await fetch(`${API}/search/format-groups`, {
    method: "POST",
    headers: headers(library, "2"),
    body: JSON.stringify({ searchText: query, searchType: "title", pageNum: 0, pageSize: 25 }),
    signal: AbortSignal.timeout(12000),
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`Catalog returned ${response.status}`);

  const data = (await response.json()) as SearchPayload;
  const groups = (data.data ?? []).filter((group) => titlesMatch(group.title ?? "", query));

  const reserveIds = groups.flatMap((group) =>
    (group.materialTabs ?? []).flatMap((tab) => tab.availability?.vendors?.overdrive?.reserveId ?? []),
  );
  const overDrive = reserveIds.length > 0 ? await overDriveAvailable(library, reserveIds) : new Set<string>();

  const hits: CatalogHit[] = [];
  for (const group of groups) {
    const title = (group.title ?? "").trim();
    const author = (group.primaryAgent?.label ?? "").trim();
    for (const tab of group.materialTabs ?? []) {
      const label = (tab.name ?? "").replace(/^on order\s+/i, "");
      const status = tab.availability?.status;
      const ids = tab.availability?.vendors?.overdrive?.reserveId ?? [];
      let available: boolean;
      if (tab.type === "electronic") {
        available =
          ids.length > 0
            ? ids.some((id) => overDrive.has(id))
            : status?.general === "Available" || status?.general === "CheckAvailability";
      } else {
        available = status?.general === "Available";
      }
      hits.push({ title, author, resourceType: resourceTypeFromLabel(label, title), available });
    }
  }

  return hits;
}
