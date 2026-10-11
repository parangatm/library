export type ParserKind = "bibliocommons" | "sirsi" | "carl" | "vega";

export interface LibraryConfig {
  id: string;
  name: string;
  parser: ParserKind;
  /** Library website shown in the onboarded libraries list. */
  homepage: string;
  /** Builds the public catalog search page for this query. */
  searchUrl: (query: string) => string;
  slug?: string;
  ilsws?: string;
  origin?: string;
  /** Vega Discover site code, resolved from `{origin}/lookup`. */
  siteCode?: string;
}

function biblioSearch(slug: string, query: string): string {
  const params = new URLSearchParams({ query, searchType: "title" });
  return `https://${slug}.bibliocommons.com/v2/search?${params.toString()}`;
}

function sirsiSearch(base: string, query: string): string {
  const params = new URLSearchParams({ qu: query });
  return `${base}/search/results?${params.toString()}`;
}

function carlSearch(origin: string, query: string): string {
  const params = new URLSearchParams({ section: "search", term: query });
  return `${origin}/?${params.toString()}`;
}

function vegaSearch(origin: string, query: string): string {
  const params = new URLSearchParams({ query, searchType: "title", pageSize: "10" });
  return `${origin}/search?${params.toString()}`;
}

export const LIBRARIES: LibraryConfig[] = [
  {
    id: "aclibrary",
    name: "Alameda County Library",
    parser: "bibliocommons",
    slug: "aclibrary",
    homepage: "https://aclibrary.org/",
    searchUrl: (query) => biblioSearch("aclibrary", query),
  },
  {
    id: "berkeley",
    name: "Berkeley Public Library",
    parser: "carl",
    origin: "https://catalog.berkeleypubliclibrary.org",
    homepage: "https://www.berkeleypubliclibrary.org/",
    searchUrl: (query) => carlSearch("https://catalog.berkeleypubliclibrary.org", query),
  },
  {
    id: "irvine",
    name: "Irvine Public Library",
    parser: "sirsi",
    ilsws: "https://sdws05.sirsidynix.net/irvinepl_ilsws",
    homepage: "https://cityofirvine.gov/irvine-public-library-0",
    searchUrl: (query) =>
      sirsiSearch("https://irvinepl.ent.sirsi.net/client/en_US/default", query),
  },
  {
    id: "lacounty",
    name: "LA County Library",
    parser: "sirsi",
    ilsws: "https://cola.sirsi.net/cola_ilsws",
    homepage: "https://lacountylibrary.org/",
    searchUrl: (query) =>
      sirsiSearch("https://catalog.lacountylibrary.org/client/en_US/default", query),
  },
  {
    id: "livermore",
    name: "Livermore Public Library",
    parser: "bibliocommons",
    slug: "livermorelibrary",
    homepage: "https://library.livermoreca.gov/",
    searchUrl: (query) => biblioSearch("livermorelibrary", query),
  },
  {
    id: "lapl",
    name: "Los Angeles Public Library",
    parser: "carl",
    origin: "https://ls2pac.lapl.org",
    homepage: "https://www.lapl.org/",
    searchUrl: (query) => carlSearch("https://ls2pac.lapl.org", query),
  },
  {
    id: "mountainview",
    name: "Mountain View Public Library",
    parser: "vega",
    origin: "https://librarycatalog.mountainview.gov",
    siteCode: "mvpl",
    homepage: "https://library.mountainview.gov/",
    searchUrl: (query) => vegaSearch("https://librarycatalog.mountainview.gov", query),
  },
  {
    id: "oakland",
    name: "Oakland Public Library",
    parser: "bibliocommons",
    slug: "oaklandlibrary",
    homepage: "https://oaklandlibrary.org/",
    searchUrl: (query) => biblioSearch("oaklandlibrary", query),
  },
  {
    id: "ocpl",
    name: "Orange County Public Library",
    parser: "sirsi",
    ilsws: "https://sdws05.sirsidynix.net/orca_ilsws",
    homepage: "https://libraries.oc.gov/",
    searchUrl: (query) => sirsiSearch("https://catalog.ocpl.org/client/en_US/default", query),
  },
  {
    id: "paloalto",
    name: "Palo Alto City Library",
    parser: "bibliocommons",
    slug: "paloalto",
    homepage: "https://library.cityofpaloalto.org/",
    searchUrl: (query) => biblioSearch("paloalto", query),
  },
  {
    id: "sfpl",
    name: "San Francisco Public Library",
    parser: "bibliocommons",
    slug: "sfpl",
    homepage: "https://sfpl.org/",
    searchUrl: (query) => biblioSearch("sfpl", query),
  },
  {
    id: "sjpl",
    name: "San Jose Public Library",
    parser: "bibliocommons",
    slug: "sjpl",
    homepage: "https://www.sjpl.org/",
    searchUrl: (query) => biblioSearch("sjpl", query),
  },
  {
    id: "smcl",
    name: "San Mateo County Library",
    parser: "bibliocommons",
    slug: "smcl",
    homepage: "https://smcl.org/",
    searchUrl: (query) => biblioSearch("smcl", query),
  },
  {
    id: "sclibrary",
    name: "Santa Clara City Library",
    parser: "bibliocommons",
    slug: "sclibrary",
    homepage: "https://www.sclibrary.org/",
    searchUrl: (query) => biblioSearch("sclibrary", query),
  },
  {
    id: "sccl",
    name: "Santa Clara County Library",
    parser: "bibliocommons",
    slug: "sccl",
    homepage: "https://sccld.org/",
    searchUrl: (query) => biblioSearch("sccl", query),
  },
  {
    id: "sunnyvale",
    name: "Sunnyvale Public Library",
    parser: "bibliocommons",
    slug: "sunnyvale",
    homepage: "https://www.library.sunnyvale.ca.gov/",
    searchUrl: (query) => biblioSearch("sunnyvale", query),
  },
];

export function librariesAlphabetical(): LibraryConfig[] {
  return [...LIBRARIES].sort((a, b) => a.name.localeCompare(b.name, "en"));
}
