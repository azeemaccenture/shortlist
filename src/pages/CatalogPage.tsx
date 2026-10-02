import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ClientShell } from "../components/ClientShell";
import { ContextSummary } from "../components/ContextSummary";
import { CATALOG } from "../data/catalog";
import { formatScore, formatWhen } from "../format";
import { scoreItem } from "../scoring/rank";
import { useClientBase } from "../portal/useClient";
import { useSession } from "../state/SessionProvider";
import { CLOUDS, ROLE_LABELS, ROLE_WEIGHT_PROFILE, type CatalogItem, type Cloud } from "../types";

export function CatalogPage() {
  const { context, syncJira, syncSalesforce } = useSession();
  const base = useClientBase();
  const [cloud, setCloud] = useState<Cloud | "all">("all");
  const [query, setQuery] = useState("");
  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return CATALOG.filter((item) => {
      if (cloud !== "all" && item.cloud !== cloud) return false;
      if (!needle) return true;
      const hay = [item.name, item.summary, item.cloud, item.effortBand, ...item.strategyTags]
        .join(" ")
        .toLowerCase();
      return hay.includes(needle);
    });
  }, [cloud, query]);
  if (!context) return null;

  const jira = context.sources.jiraMock;
  const salesforce = context.sources.salesforceMock;
  const topScore = Math.max(...CATALOG.map((item) => scoreItem(context, item).score));

  return (
    <ClientShell>
      <section className="ae-data" aria-label="Session snapshot">
        <div className="ae-data-in">
          <div className="ae-data-lead">
            <h1>Candidate pool</h1>
            <p>
              Eight Winter &apos;27 release 264 features, scored with model v1.1 for the{" "}
              {ROLE_WEIGHT_PROFILE[context.role]} profile. Syncs do not change the score.
            </p>
          </div>
          <div className="ae-stat"><div className="n">{CATALOG.length}</div><div className="l">Features</div></div>
          <div className="ae-stat"><div className="n">{formatScore(topScore)}</div><div className="l">Top score</div></div>
          <div className="ae-stat"><div className="n">{context.priorities.length}</div><div className="l">Priorities</div></div>
          <div className="ae-stat"><div className="n">{ROLE_LABELS[context.role] === "Product Lead" ? "PL" : ROLE_LABELS[context.role]}</div><div className="l">Role</div></div>
        </div>
      </section>

      <div className="ae-band">
        <ContextSummary context={context} />
      </div>

      <div className="ae-main">
        <nav className="ae-filters" aria-label="Cloud">
          <p className="ae-filters-label">Cloud</p>
          <button type="button" className={cloud === "all" ? "is-on" : undefined} onClick={() => setCloud("all")}>
            All features <span className="cnt">{CATALOG.length}</span>
          </button>
          {CLOUDS.map((level) => (
            <button
              key={level}
              type="button"
              data-testid={`cloud-${level}`}
              className={cloud === level ? "is-on" : undefined}
              onClick={() => setCloud(level)}
            >
              {level} <span className="cnt">{CATALOG.filter((item) => item.cloud === level).length}</span>
            </button>
          ))}
          <div className="sync-block">
            <p className="ae-filters-label">Enrich</p>
            <button type="button" className="ae-ghost" data-testid="sync-jira" onClick={syncJira}>
              Sync Jira mock
            </button>
            <button type="button" className="ae-ghost" data-testid="sync-salesforce" onClick={syncSalesforce}>
              Sync Salesforce mock
            </button>
            {jira ? (
              <div className="sync-note" data-testid="jira-sync">
                <p>Jira synced {formatWhen(jira.syncedAt)}</p>
                <ul>
                  {jira.bottlenecks.map((bottleneck) => (
                    <li key={bottleneck.id}>
                      {bottleneck.id}: {bottleneck.summary} → {bottleneck.pairedFeature}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
            {salesforce ? (
              <div className="sync-note" data-testid="salesforce-sync">
                <p>Salesforce synced {formatWhen(salesforce.syncedAt)}</p>
                <ul>
                  {salesforce.records.map((record) => (
                    <li key={record.id}>
                      {record.type} · {record.name}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        </nav>

        <div>
          <div className="ae-feed-head">
            <h2>{cloud === "all" ? "All features" : cloud}</h2>
            <label className="ae-search">
              <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.5" />
                <path d="M10.5 10.5L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              <input
                type="search"
                value={query}
                placeholder="Search features…"
                onChange={(event) => setQuery(event.target.value)}
              />
            </label>
          </div>
          {visible.length === 0 ? (
            <div className="ae-empty">
              <p><strong>No features match</strong></p>
              <p>Try another cloud or clear your search.</p>
            </div>
          ) : (
            <ul className="ae-list" data-testid="catalog-list">
              {visible.map((item) => (
                <CatalogRow key={item.id} item={item} score={scoreItem(context, item).score} base={base} />
              ))}
            </ul>
          )}
        </div>
      </div>
    </ClientShell>
  );
}

function CatalogRow({ item, score, base }: { item: CatalogItem; score: number; base: string }) {
  return (
    <li>
      <Link className="ae-row catalog-card" to={`${base}/items/${item.id}`}>
        <div className="ae-row-tier" title={`Effort band ${item.effortBand}`}>{item.effortBand}</div>
        <div className="ae-row-main">
          <h3>{item.name}</h3>
          <p>{item.summary}</p>
          <div className="ae-row-meta">
            <span className="ver">{item.cloud}</span>
            {item.strategyTags.map((tag) => (
              <span key={tag}>{tag}</span>
            ))}
          </div>
        </div>
        <div className="ae-row-score">
          <strong>{formatScore(score)}</strong>
          <span>Score</span>
        </div>
      </Link>
    </li>
  );
}
