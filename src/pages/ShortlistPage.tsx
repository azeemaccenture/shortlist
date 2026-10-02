import { Link } from "react-router-dom";
import { ClientShell } from "../components/ClientShell";
import { ContextSummary } from "../components/ContextSummary";
import { CATALOG } from "../data/catalog";
import { formatScore } from "../format";
import { rankTop } from "../scoring/rank";
import { useClientBase } from "../portal/useClient";
import { useSession } from "../state/SessionProvider";
import { ROLE_LABELS, ROLE_WEIGHT_PROFILE } from "../types";

export function ShortlistPage() {
  const { context } = useSession();
  const base = useClientBase();
  if (!context) return null;
  const ranked = rankTop(context, CATALOG);
  const top = ranked[0];
  const profile = ROLE_WEIGHT_PROFILE[context.role];

  return (
    <ClientShell>
      <section className="ae-data" aria-label="Shortlist snapshot">
        <div className="ae-data-in">
          <div className="ae-data-lead">
            <h1>Top {ranked.length}</h1>
            <p>
              {ROLE_LABELS[context.role]} uses the {profile} weight profile. The same context and catalog always
              produce this order.
            </p>
          </div>
          <div className="ae-stat"><div className="n">{ranked.length}</div><div className="l">Picks</div></div>
          <div className="ae-stat"><div className="n">{top ? formatScore(top.score) : "—"}</div><div className="l">Top score</div></div>
          <div className="ae-stat"><div className="n">{context.priorities.length}</div><div className="l">Priorities</div></div>
          <div className="ae-stat"><div className="n">{ROLE_LABELS[context.role] === "Product Lead" ? "PL" : ROLE_LABELS[context.role]}</div><div className="l">Role</div></div>
        </div>
      </section>
      <div className="ae-band">
        <ContextSummary context={context} />
      </div>
      <div className="ae-main">
        <nav className="ae-filters" aria-label="View">
          <p className="ae-filters-label">View</p>
          <Link to={`${base}/catalog`}>
            All features <span className="cnt">{CATALOG.length}</span>
          </Link>
          <Link to={`${base}/shortlist`} className="is-on">
            Top 5 <span className="cnt">{ranked.length}</span>
          </Link>
        </nav>
        <div>
          <div className="ae-feed-head">
            <h2>Ranked for {ROLE_LABELS[context.role]}</h2>
          </div>
          <ol className="ae-list" data-testid="shortlist">
            {ranked.map((row, index) => (
              <li key={row.item.id} data-testid="shortlist-row">
                <Link className="ae-row" to={`${base}/items/${row.item.id}`}>
                  <div className="ae-row-tier rank">{index + 1}</div>
                  <div className="ae-row-main">
                    <h3>{row.item.name}</h3>
                    <p className="reason">{row.reason}</p>
                    {row.sensitiveToWeights ? (
                      <p className="sensitive" data-testid="weight-sensitive">Sensitive to weight changes.</p>
                    ) : null}
                    <div className="ae-row-meta">
                      <span className="ver">{row.item.cloud}</span>
                      <span>Effort {row.item.effortBand}</span>
                    </div>
                  </div>
                  <div className="ae-row-score">
                    <strong className="score">{formatScore(row.score)}</strong>
                    <span>Score</span>
                  </div>
                </Link>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </ClientShell>
  );
}
