"use client";

import { FormEvent, useState } from "react";
import { librariesAlphabetical } from "@/lib/libraries";
import {
  RESOURCE_TYPES,
  type ItemStatus,
  type ResourceSection,
  type ResourceType,
  type SearchResponse,
  type StatusRow,
} from "@/lib/types";

const LIBRARIES = librariesAlphabetical();

const STATUS_LABEL: Record<ItemStatus, string> = {
  available: "Available",
  on_hold: "On hold",
  not_found: "Not found",
  error: "Error",
};

const TYPE_LABEL: Record<ResourceType, string> = {
  book: "Book",
  ebook: "eBook",
  audiobook: "Audiobook",
  other: "Other media",
};

function foundCount(rows: StatusRow[]): number {
  return rows.filter((row) => row.status === "available" || row.status === "on_hold").length;
}

function availableCount(rows: StatusRow[]): number {
  return rows.filter((row) => row.status === "available").length;
}

function isEmpty(section: ResourceSection): boolean {
  return section.rows.every((row) => row.status === "not_found" || row.status === "error");
}

function foundLabel(found: number, total: number): string {
  return `Found in ${found} of ${total} ${total === 1 ? "library" : "libraries"}`;
}

export default function HomePage() {
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [types, setTypes] = useState<ResourceType[]>([...RESOURCE_TYPES]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [data, setData] = useState<SearchResponse | null>(null);

  function toggleType(type: ResourceType) {
    setTypes((current) => {
      if (current.includes(type)) return current.length > 1 ? current.filter((t) => t !== type) : current;
      return RESOURCE_TYPES.filter((t) => t === type || current.includes(t));
    });
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    const query = title.trim();
    if (!query) return;

    setLoading(true);
    setError("");
    setData(null);

    try {
      const params = new URLSearchParams({ q: query });
      if (author.trim()) params.set("author", author.trim());
      const response = await fetch(`/api/search?${params.toString()}`);
      const body = (await response.json()) as SearchResponse & { error?: string };
      if (!response.ok) throw new Error(body.error || "Search failed");
      setData(body);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Search failed");
    } finally {
      setLoading(false);
    }
  }

  const works = (data?.works ?? [])
    .map((work) => ({
      ...work,
      sections: work.sections.filter((section) => types.includes(section.type) && !isEmpty(section)),
    }))
    .filter((work) => work.sections.length > 0);

  return (
    <main className="page">
      <header className="masthead">
        <h1>Library Catalog Search</h1>
        <details className="onboarded">
          <summary>
            Libraries onboarded: <strong>{LIBRARIES.length}</strong>
          </summary>
          <ul>
            {LIBRARIES.map((library) => (
              <li key={library.id}>
                <a href={library.homepage} target="_blank" rel="noreferrer">
                  {library.name}
                </a>
              </li>
            ))}
          </ul>
        </details>
      </header>

      <form className="search" onSubmit={onSubmit}>
        <div className="fields">
          <label>
            Title
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Dune"
              required
              autoFocus
            />
          </label>
          <label>
            Author
            <input
              value={author}
              onChange={(event) => setAuthor(event.target.value)}
              placeholder="Optional"
            />
          </label>
          <button type="submit" disabled={loading}>
            {loading ? "Searching…" : "Search"}
          </button>
        </div>
        <div className="filters" role="group" aria-label="Media type">
          <span className="filter-label">Media type</span>
          {RESOURCE_TYPES.map((type) => (
            <button
              key={type}
              type="button"
              className="chip"
              aria-pressed={types.includes(type)}
              onClick={() => toggleType(type)}
            >
              {TYPE_LABEL[type]}
            </button>
          ))}
        </div>
      </form>

      {loading && <p className="note">Checking all {LIBRARIES.length} catalogs…</p>}
      {error && <p className="banner error">{error}</p>}

      {data && data.libraryErrors.length > 0 && (
        <p className="errors">
          {data.libraryErrors.map((item) => `${item.libraryName} could not be reached`).join(" · ")}
        </p>
      )}

      {data && works.length === 0 && !loading && (
        <div className="empty">
          No matching title{data.author ? ` by ${data.author}` : ""}
          {data.works.length > 0 ? " in the selected media types" : ""}.
        </div>
      )}

      {works.map((work, index) => {
        const total = LIBRARIES.length;
        const foundIds = new Set(
          work.sections.flatMap((section) =>
            section.rows
              .filter((row) => row.status === "available" || row.status === "on_hold")
              .map((row) => row.libraryId),
          ),
        );
        return (
          <details
            className="work"
            key={`${data?.query}-${work.title}-${work.author}`}
            open={index === 0}
          >
            <summary>
              <div className="work-head">
                <h2>{work.title}</h2>
                <p className="by">{work.author}</p>
              </div>
              <span className="work-meta">{foundLabel(foundIds.size, total)}</span>
            </summary>

            {work.sections.map((section) => {
              const found = foundCount(section.rows);
              const available = availableCount(section.rows);
              return (
                <details className="section" key={section.type}>
                  <summary>
                    <h3>{section.label}</h3>
                    <span className="section-meta">
                      {foundLabel(found, total)}
                      {available > 0 && <span className="avail"> · {available} available</span>}
                    </span>
                  </summary>
                  <table>
                    <tbody>
                      {section.rows.map((row) => (
                        <tr key={row.libraryId}>
                          <td className="library">{row.libraryName}</td>
                          <td>
                            <a
                              className={`status ${row.status}`}
                              href={row.href}
                              target="_blank"
                              rel="noreferrer"
                              title={row.error}
                            >
                              {STATUS_LABEL[row.status]}
                            </a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </details>
              );
            })}
          </details>
        );
      })}
    </main>
  );
}
