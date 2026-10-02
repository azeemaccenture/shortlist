import { Link, useParams } from "react-router-dom";
import { Layout } from "../components/Layout";
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
      <Layout>
        <section className="page-intro">
          <h1>Not in the catalog</h1>
          <p>That feature is not in the seed catalog.</p>
          <Link to="/catalog">Back to catalog</Link>
        </section>
      </Layout>
    );
  }

  const scored = scoreItem(context, item);

  return (
    <Layout>
      <p className="crumb">
        <Link to="/shortlist">Top 5</Link> · <Link to="/catalog">Catalog</Link>
      </p>
      <section className="page-intro">
        <h1>{item.name}</h1>
        <p>{item.blurb}</p>
      </section>

      <section className="next-step" data-testid="next-step">
        <p className="kicker">Next step</p>
        <p className="next-step-copy">{scored.nextStep}</p>
      </section>

      <section className="detail-grid">
        <article className="panel">
          <h2>Score {scored.score}</h2>
          <p className="reason" data-testid="rank-reason">
            {scored.reason}
          </p>
          <h3>Why it ranked</h3>
          <dl className="factors">
            <div>
              <dt>Role</dt>
              <dd>
                {scored.factors.role} · {ROLE_LABELS[context.role]}
              </dd>
            </div>
            <div>
              <dt>Goals</dt>
              <dd>
                {scored.factors.goals}
                {scored.matchedGoals.length > 0 ? ` · ${scored.matchedGoals.join("; ")}` : " · none matched"}
              </dd>
            </div>
            <div>
              <dt>Constraints</dt>
              <dd>
                {scored.factors.constraints}
                {scored.matchedConstraints.length > 0
                  ? ` · ${scored.matchedConstraints.join("; ")}`
                  : " · none matched"}
              </dd>
            </div>
            <div>
              <dt>Priorities</dt>
              <dd>
                {scored.factors.priorities}
                {scored.matchedPriorities.length > 0
                  ? ` · ${scored.matchedPriorities
                      .map((priority) => `${priority.label} (${priority.points})`)
                      .join("; ")}`
                  : " · none matched"}
              </dd>
            </div>
            <div>
              <dt>Jira</dt>
              <dd>
                {context.sources.jiraMock
                  ? scored.bottleneck
                    ? `${scored.factors.jira} · ${scored.bottleneck.id} ${scored.bottleneck.summary}`
                    : "0 · synced, no pairing"
                  : "Not synced"}
              </dd>
            </div>
            <div>
              <dt>Salesforce</dt>
              <dd>
                {context.sources.salesforceMock ? scored.factors.salesforce : "Not synced"}
              </dd>
            </div>
          </dl>
        </article>

        <article className="panel">
          <h2>Scoring inputs</h2>
          <dl className="factors">
            <div>
              <dt>Roles</dt>
              <dd>{item.roles.map((role) => ROLE_LABELS[role]).join(", ")}</dd>
            </div>
            <div>
              <dt>Themes</dt>
              <dd>{item.themes.join(", ")}</dd>
            </div>
            <div>
              <dt>Effort</dt>
              <dd>{effortLabel(item.effort)}</dd>
            </div>
            <div>
              <dt>Attributes</dt>
              <dd>{item.attributes.join(", ")}</dd>
            </div>
          </dl>
        </article>
      </section>
    </Layout>
  );
}
