import { Link, useParams } from "react-router-dom";
import { ClientShell } from "../components/ClientShell";
import { ContextSummary } from "../components/ContextSummary";
import { CATALOG, findCatalogItem } from "../data/catalog";
import { formatScore } from "../format";
import { rankAll, scoreItem } from "../scoring/rank";
import { useClientBase } from "../portal/useClient";
import { useSession } from "../state/SessionProvider";
import { ROLE_WEIGHT_PROFILE } from "../types";

export function DetailPage() {
  const { id } = useParams();
  const { context } = useSession();
  const base = useClientBase();
  if (!context) return null;

  const item = id ? findCatalogItem(id) : undefined;
  if (!item) {
    return (
      <ClientShell>
        <section className="ae-data">
          <div className="ae-data-in">
            <div className="ae-data-lead">
              <h1>Not in the catalog</h1>
              <p>That feature is not in the seed catalog.</p>
            </div>
          </div>
        </section>
        <div className="ae-band">
          <Link to={`${base}/catalog`}>Back to catalog</Link>
        </div>
      </ClientShell>
    );
  }

  const ranked = rankAll(context, CATALOG);
  const scored = ranked.find((row) => row.item.id === item.id) ?? scoreItem(context, item);
  const fit = scored.dimensions.find((dimension) => dimension.id === "strategicFit");
  const load = scored.dimensions.find((dimension) => dimension.id === "changeLoad");

  return (
    <ClientShell>
      <section className="ae-data">
        <div className="ae-data-in">
          <div className="ae-data-lead">
            <h1>{item.name}</h1>
            <p>{item.cloud}. {item.summary}</p>
          </div>
          <div className="ae-stat"><div className="n">{formatScore(scored.score)}</div><div className="l">Score</div></div>
          <div className="ae-stat"><div className="n">{item.effortBand}</div><div className="l">Effort</div></div>
          <div className="ae-stat"><div className="n">{fit?.score ?? "—"}</div><div className="l">Strategic fit</div></div>
          <div className="ae-stat"><div className="n">{load?.score ?? "—"}</div><div className="l">Change load</div></div>
        </div>
      </section>
      <div className="ae-band">
        <p className="crumb">
          <Link to={`${base}/shortlist`}>Top 5</Link> · <Link to={`${base}/catalog`}>Catalog</Link>
        </p>
        <ContextSummary context={context} />
      </div>
      <div className="ae-main">
        <nav className="ae-filters" aria-label="View">
          <p className="ae-filters-label">View</p>
          <Link to={`${base}/catalog`}>Catalog</Link>
          <Link to={`${base}/shortlist`}>Top 5</Link>
        </nav>
        <article className="detail-card">
          <div className="ae-expand-grid">
            <div>
              <h2>Next step</h2>
              <p className="next-step-copy" data-testid="next-step">{scored.nextStep}</p>
              <h2>Scoring inputs</h2>
              <ul className="factor-list">
                <li>Cloud · {item.cloud}</li>
                <li>Themes · {item.strategyTags.join(", ")}</li>
                <li>Effort · {item.effortBand}</li>
                <li>Related objects · {item.relatedObjectsUsed}</li>
                <li>Package installed · {item.packageInstalled ? "yes" : "no"}</li>
                <li>Usage last 90 days · {item.usageLast90d} (threshold {item.usageThreshold})</li>
                <li>Admin ready · {item.adminReady ? "yes" : "no"}</li>
                <li>Demand · {item.demandCount} · {item.urgency} urgency</li>
                <li>Blocker · {item.blockerFlag ? "yes" : "no"} · dependencies {item.dependencyCount}</li>
                <li>
                  Change load · {item.changeLoadBand}
                  {item.requiresDataMigration ? " · data migration" : ""}
                  {item.touchesSharedObjects ? " · shared objects" : ""}
                </li>
                <li>Weight profile · {ROLE_WEIGHT_PROFILE[context.role]}</li>
                {scored.bottleneck ? (
                  <li>
                    Jira bottleneck · {scored.bottleneck.id} · {scored.bottleneck.summary}
                  </li>
                ) : null}
              </ul>
            </div>
            <div>
              <h2>Why it ranked</h2>
              <p className="reason" data-testid="rank-reason">
                {scored.reason}
                {scored.contrastClause ? ` ${scored.contrastClause}` : ""}
              </p>
              {scored.sensitiveToWeights ? (
                <p data-testid="weight-sensitive">Sensitive to weight changes.</p>
              ) : null}
              <ul className="factor-list" data-testid="dimension-breakdown">
                {scored.dimensions.map((dimension) => (
                  <li key={dimension.id}>
                    {dimension.label} · score {dimension.score} · weight {dimension.weight} · contribution{" "}
                    {formatScore(dimension.contribution)}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </article>
      </div>
    </ClientShell>
  );
}
