import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ContextSummary } from "../components/ContextSummary";
import { WorkspaceLayout } from "../components/Layout";
import { CATALOG } from "../data/catalog";
import { formatWhen, effortLabel } from "../format";
import { scoreItem } from "../scoring/rank";
import { useSession } from "../state/SessionProvider";
import { ROLE_LABELS, type CatalogItem } from "../types";

const EFFORTS = ["low", "mid", "high"] as const;

export function CatalogPage() {
  const { context, syncJira, syncSalesforce } = useSession();
  const [effort, setEffort] = useState<(typeof EFFORTS)[number] | "all">("all");
  const [query, setQuery] = useState("");
  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return CATALOG.filter((item) => {
      if (effort !== "all" && item.effort !== effort) return false;
      if (!needle) return true;
      const hay = [item.name, item.blurb, ...item.themes, ...item.attributes].join(" ").toLowerCase();
      return hay.includes(needle);
    });
  }, [effort, query]);
  if (!context) return null;

  const jira = context.sources.jiraMock;
  const salesforce = context.sources.salesforceMock;
  const topScore = Math.max(...CATALOG.map((item) => scoreItem(context, item).score));

  return (
    <WorkspaceLayout>
      <section className="ae-data" aria-label="Session snapshot">
        <div className="ae-data-in">
          <div className="ae-data-lead">
            <h1>Candidate pool</h1>
            <p>Eight Salesforce features, scored only from this session. Syncs are optional.</p>
          </div>
          <div className="ae-stat"><div className="n">{CATALOG.length}</div><div className="l">Features</div></div>
          <div className="ae-stat"><div className="n">{topScore}</div><div className="l">Top score</div></div>
          <div className="ae-stat"><div className="n">{context.priorities.length}</div><div className="l">Priorities</div></div>
          <div className="ae-stat"><div className="n">{ROLE_LABELS[context.role] === "Product Lead" ? "PL" : ROLE_LABELS[context.role]}</div><div className="l">Role</div></div>
        </div>
      </section>

      <div className="ae-band">
        <ContextSummary context={context} />
      </div>

      <div className="ae-main">
        <nav className="ae-filters" aria-label="Effort">
          <p className="ae-filters-label">Effort</p>
          <button type="button" className={effort === "all" ? "is-on" : undefined} onClick={() => setEffort("all")}>
            All features <span className="cnt">{CATALOG.length}</span>
          </button>
          {EFFORTS.map((level) => (
            <button
              key={level}
              type="button"
              className={effort === level ? "is-on" : undefined}
              onClick={() => setEffort(level)}
            >
              {effortLabel(level)} <span className="cnt">{CATALOG.filter((item) => item.effort === level).length}</span>
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
            <h2>{effort === "all" ? "All features" : `${effortLabel(effort)} effort`}</h2>
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
              <p>Try another effort or clear your search.</p>
            </div>
          ) : (
            <ul className="ae-list" data-testid="catalog-list">
              {visible.map((item) => (
                <CatalogRow key={item.id} item={item} score={scoreItem(context, item).score} />
              ))}
            </ul>
          )}
        </div>
      </div>
    </WorkspaceLayout>
  );
}

function CatalogRow({ item, score }: { item: CatalogItem; score: number }) {
  return (
    <li>
      <Link className="ae-row catalog-card" to={`/items/${item.id}`}>
        <div className="ae-row-tier">{effortLabel(item.effort)}</div>
        <div className="ae-row-main">
          <h3>{item.name}</h3>
          <p>{item.blurb}</p>
          <div className="ae-row-meta">
            {item.roles.map((role) => (
              <span className="ver" key={role}>{ROLE_LABELS[role]}</span>
            ))}
            {item.themes.slice(0, 3).map((theme) => (
              <span key={theme}>{theme}</span>
            ))}
          </div>
        </div>
        <div className="ae-row-score">
          <strong>{score}</strong>
          <span>Score</span>
        </div>
      </Link>
    </li>
  );
}
