# Library Catalog Search

Search for a title across 16 California public library catalogs in one place. Compare availability for books, ebooks, audiobooks, and other media, then follow a result to the library's own catalog.

Deployed at: https://library-black-six.vercel.app/

## How to use

1. Enter a title, such as *Dune*. Add an author to narrow the results if needed.
2. Select the media types to include and click **Search**.
3. Expand a matching title and media type to see each library's availability.
4. Click a status link to open that library's catalog search for the title and check borrowing or hold options.

Results show **Available**, **On hold**, **Not found**, or **Error** for each library. A catalog that cannot be reached is reported separately, so a failed search is distinguishable from a missing title.

Searches use the first page of each catalog's results, so **Not found** does not necessarily mean a library does not own the title. Check the library's catalog for current availability, specific editions, and borrowing requirements.

## Supported libraries

The links below open the catalogs directly and can also be used independently of this app.

| Library Name | Catalog Link |
| --- | --- |
| Alameda County Library | [Browse catalog](https://aclibrary.bibliocommons.com/) |
| Berkeley Public Library | [Browse catalog](https://catalog.berkeleypubliclibrary.org/) |
| Irvine Public Library | [Browse catalog](https://irvinepl.ent.sirsi.net/client/en_US/default/) |
| LA County Library | [Browse catalog](https://catalog.lacountylibrary.org/client/en_US/default/) |
| Livermore Public Library | [Browse catalog](https://livermorelibrary.bibliocommons.com/) |
| Los Angeles Public Library | [Browse catalog](https://ls2pac.lapl.org/) |
| Mountain View Public Library | [Browse catalog](https://librarycatalog.mountainview.gov/) |
| Oakland Public Library | [Browse catalog](https://oaklandlibrary.bibliocommons.com/) |
| Orange County Public Library | [Browse catalog](https://catalog.ocpl.org/client/en_US/default/) |
| Palo Alto City Library | [Browse catalog](https://paloalto.bibliocommons.com/) |
| San Francisco Public Library | [Browse catalog](https://sfpl.bibliocommons.com/) |
| San Jose Public Library | [Browse catalog](https://sjpl.bibliocommons.com/) |
| San Mateo County Library | [Browse catalog](https://smcl.bibliocommons.com/) |
| Santa Clara City Library | [Browse catalog](https://sclibrary.bibliocommons.com/) |
| Santa Clara County Library | [Browse catalog](https://sccl.bibliocommons.com/) |
| Sunnyvale Public Library | [Browse catalog](https://sunnyvale.bibliocommons.com/) |

## Run locally

Install Node.js 20.9 or newer and npm. From the project directory, run:

```bash
npm install
npm run dev
```

Open the local URL printed in the terminal. An internet connection is required to search the library catalogs.
