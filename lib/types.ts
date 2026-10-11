export const RESOURCE_TYPES = ["book", "ebook", "audiobook", "other"] as const;

export type ResourceType = (typeof RESOURCE_TYPES)[number];

export type ItemStatus = "available" | "on_hold" | "not_found" | "error";

export interface CatalogHit {
  title: string;
  author: string;
  resourceType: ResourceType;
  available: boolean;
}

export interface LibrarySearchResult {
  libraryId: string;
  hits: CatalogHit[];
  error?: string;
}

export interface StatusRow {
  libraryId: string;
  libraryName: string;
  status: ItemStatus;
  href: string;
  error?: string;
}

export interface ResourceSection {
  type: ResourceType;
  label: string;
  rows: StatusRow[];
}

export interface WorkResult {
  title: string;
  author: string;
  sections: ResourceSection[];
}

export interface SearchResponse {
  query: string;
  author: string;
  works: WorkResult[];
  libraryErrors: { libraryName: string; error: string }[];
}
