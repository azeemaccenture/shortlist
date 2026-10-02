import { Link, useParams } from "react-router-dom";
import { ContextSummary } from "../components/ContextSummary";
import { WorkspaceLayout } from "../components/Layout";
import { findCatalogItem } from "../data/catalog";
import { effortLabel } from "../format";
import { scoreItem } from "../scoring/rank";
import { useSession } from "../state/SessionProvider";
import { ROLE_LABELS } from "../types";

export function DetailPage() {
  const { id } = useParams();
  const { context } = useSession();
  if (!context) return null;

  const item = id ? findCatalogItem(id) : undefined;
  if (!item) {
    return (
      <WorkspaceLayout>
        <section className="ae-data">
          <div className="ae-data-in">
            <div className="ae-data-lead">
              <h1>Not in the catalog</h1>
              <p>That feature is not in the seed catalog.</p>
            </div>
          </div>
        </section>
        <div className="ae-band">
          <Link to="/catalog">Back to catalog</Link>
        </div>
      </WorkspaceLayout>
    );
  }

  const scored = scoreItem(context, item);

  return (
    <WorkspaceLayout>
      <section className="ae-data">
        <div className="ae-data-in">
          <div className="ae-data-lead">
            <h1>{item.name}</h1>
            <p>{item.blurb}</p>
          </div>
          <div className="ae-stat"><div className="n">{scored.score}</div><div className="l">Score</div></div>
          <div className="ae-stat"><div className="n">{effortLabel(item.effort)}</div><div className="l">Effort</div></div>
          <div className="ae-stat"><div className="n">{scored.factors.role}</div><div className="l">Role fit</div></div>
          <div className="ae-stat"><div className="n">{scored.factors.priorities}</div><div className="l">Priorities</div></div>
        </div>
      </section>
      <div className="ae-band">
        <p className="crumb">
          <Link to="/shortlist">Top 5</Link> · <Link to="/catalog">Catalog</Link>
        </p>
        <ContextSummary context={context} />
      </div>
      <div className="ae-main">
        <nav className="ae-filters" aria-label="View">
          <p className="ae-filters-label">View</p>
          <Link to="/catalog">Catalog</Link>
          <Link to="/shortlist">Top 5</Link>
        </nav>
        <article className="detail-card">
          <div className="ae-expand-grid">
            <div>
              <h2>Next step</h2>
              <p className="next-step-copy" data-testid="next-step">{scored.nextStep}</p>
              <h2>Scoring inputs</h2>
              <ul className="factor-list">
                <li>Roles · {item.roles.map((role) => ROLE_LABELS[role]).join(", ")}</li>
                <li>Themes · {item.themes.join(", ")}</li>
                <li>Effort · {effortLabel(item.effort)}</li>
                <li>Attributes · {item.attributes.join(", ")}</li>
              </ul>
            </div>
            <div>
              <h2>Why it ranked</h2>
              <p className="reason" data-testid="rank-reason">{scored.reason}</p>
              <ul className="factor-list">
                <li>Role · {scored.factors.role} · {ROLE_LABELS[context.role]}</li>
                <li>
                  Goals · {scored.factors.goals}
                  {scored.matchedGoals.length > 0 ? ` · ${scored.matchedGoals.join("; ")}` : " · none matched"}
                </li>
                <li>
                  Constraints · {scored.factors.constraints}
                  {scored.matchedConstraints.length > 0
                    ? ` · ${scored.matchedConstraints.join("; ")}`
                    : " · none matched"}
                </li>
                <li>
                  Priorities · {scored.factors.priorities}
                  {scored.matchedPriorities.length > 0
                    ? ` · ${scored.matchedPriorities.map((priority) => `${priority.label} (${priority.points})`).join("; ")}`
                    : " · none matched"}
                </li>
                <li>
                  Jira ·{" "}
                  {context.sources.jiraMock
                    ? scored.bottleneck
                      ? `${scored.factors.jira} · ${scored.bottleneck.id} ${scored.bottleneck.summary}`
                      : "0 · synced, no pairing"
                    : "Not synced"}
                </li>
                <li>Salesforce · {context.sources.salesforceMock ? scored.factors.salesforce : "Not synced"}</li>
              </ul>
            </div>
          </div>
        </article>
      </div>
    </WorkspaceLayout>
  );
}
