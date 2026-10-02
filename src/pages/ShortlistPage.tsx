import { Link } from "react-router-dom";
import { ContextSummary } from "../components/ContextSummary";
import { WorkspaceLayout } from "../components/Layout";
import { CATALOG } from "../data/catalog";
import { rankTop } from "../scoring/rank";
import { useSession } from "../state/SessionProvider";
import { ROLE_LABELS } from "../types";

export function ShortlistPage() {
  const { context } = useSession();
  if (!context) return null;
  const ranked = rankTop(context, CATALOG);
  const top = ranked[0];

  return (
    <WorkspaceLayout>
      <section className="ae-data" aria-label="Shortlist snapshot">
        <div className="ae-data-in">
          <div className="ae-data-lead">
            <h1>Top {ranked.length}</h1>
            <p>Same context and catalog always produce this order. Open a row for the score breakdown and one next step.</p>
          </div>
          <div className="ae-stat"><div className="n">{ranked.length}</div><div className="l">Picks</div></div>
          <div className="ae-stat"><div className="n">{top ? top.score : "—"}</div><div className="l">Top score</div></div>
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
          <Link to="/catalog">
            All features <span className="cnt">{CATALOG.length}</span>
          </Link>
          <Link to="/shortlist" className="is-on">
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
                <Link className="ae-row" to={`/items/${row.item.id}`}>
                  <div className="ae-row-tier rank">{index + 1}</div>
                  <div className="ae-row-main">
                    <h3>{row.item.name}</h3>
                    <p className="reason">{row.reason}</p>
                  </div>
                  <div className="ae-row-score">
                    <strong className="score">{row.score}</strong>
                    <span>Score</span>
                  </div>
                </Link>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </WorkspaceLayout>
  );
}
