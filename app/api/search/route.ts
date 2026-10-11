import { groupResults } from "@/lib/group";
import { LIBRARIES } from "@/lib/libraries";
import { searchBiblioCommons } from "@/lib/parsers/bibliocommons";
import { searchCarl } from "@/lib/parsers/carl";
import { searchSirsi } from "@/lib/parsers/sirsi";
import { searchVega } from "@/lib/parsers/vega";
import type { LibraryConfig, ParserKind } from "@/lib/libraries";
import type { CatalogHit, LibrarySearchResult } from "@/lib/types";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

const PARSERS: Record<ParserKind, (library: LibraryConfig, query: string) => Promise<CatalogHit[]>> = {
  bibliocommons: searchBiblioCommons,
  sirsi: searchSirsi,
  carl: searchCarl,
  vega: searchVega,
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = (searchParams.get("q") ?? "").trim();
  const author = (searchParams.get("author") ?? "").trim();

  if (!query) {
    return Response.json({ error: "Enter a title to search." }, { status: 400 });
  }

  const results = await Promise.all(
    LIBRARIES.map(async (library): Promise<LibrarySearchResult> => {
      try {
        const hits = await PARSERS[library.parser](library, query);
        return { libraryId: library.id, hits };
      } catch (error) {
        const message = error instanceof Error ? error.message : "Search failed";
        return { libraryId: library.id, hits: [], error: message };
      }
    }),
  );

  return Response.json(groupResults(query, author, results));
}
