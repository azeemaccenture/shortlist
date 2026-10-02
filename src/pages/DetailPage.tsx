import { Link, useParams } from "react-router-dom";
import { ClientShell } from "../components/ClientShell";
import { ContextSummary } from "../components/ContextSummary";
import { RailLink, ScoreHeader, WorkLayout, useHex } from "../components/worldUi";
import { CATALOG, findCatalogItem } from "../data/catalog";
import { formatScore } from "../format";
import { useClientBase } from "../portal/useClient";
import { rankAll, scoreItem } from "../scoring/rank";
import { useSession } from "../state/SessionProvider";
import { ROLE_WEIGHT_PROFILE } from "../types";

export function DetailPage() {
  const { id } = useParams();
  const { context } = useSession();
  const base = useClientBase();
  const hex = useHex();
  if (!context) return null;

  const item = id ? findCatalogItem(id) : undefined;
  if (!item) {
    return (
      <ClientShell>
        <ScoreHeader title="Not in the catalog" lede="That feature is not in the seed catalog." stats={[]} />
        <div className="band">
          <Link to={`${base}/catalog`}>Back to catalog</Link>
        </div>
      </ClientShell>
    );
  }

  const ranked = rankAll(context, CATALOG);
  const scored = ranked.find((row) => row.item.id === item.id) ?? scoreItem(context, item);
  const fit = scored.dimensions.find((dimension) => dimension.id === "strategicFit");
  const load = scored.dimensions.find((dimension) => dimension.id === "changeLoad");
  const expand = hex ? "hx-note-expand open detail-copy" : "ae-note-expand open detail-copy";

  return (
    <ClientShell>
      <ScoreHeader
        eyebrow={item.cloud}
        title={item.name}
        lede={item.summary}
        stats={[
          { n: formatScore(scored.score), l: "Score" },
          { n: item.effortBand, l: "Effort" },
          { n: fit?.score ?? "—", l: "Strategic fit" },
          { n: load?.score ?? "—", l: "Change load" },
        ]}
      />
      <div className="band">
        <p className="crumb">
          <Link to={`${base}/shortlist`}>Top 5</Link> · <Link to={`${base}/catalog`}>Catalog</Link>
        </p>
        <ContextSummary context={context} />
      </div>
      <WorkLayout
        label="View"
        rail={
          <>
            <RailLink to={`${base}/catalog`} label="Catalog" />
            <RailLink to={`${base}/shortlist`} label="Top 5" />
          </>
        }
      >
        <article className={hex ? "hx-note-row" : "ae-note-row"}>
          <div className={expand}>
            <div>
              <h2>Next step</h2>
              <p className="next-step-copy" data-testid="next-step">
                {scored.nextStep}
              </p>
              <h2>Scoring inputs</h2>
              <ul className="factor-list">
                <li>Cloud · {item.cloud}</li>
                <li>Themes · {item.strategyTags.join(", ")}</li>
                <li>Effort · {item.effortBand}</li>
                <li>Related objects · {item.relatedObjectsUsed}</li>
                <li>Package installed · {item.packageInstalled ? "yes" : "no"}</li>
                <li>
                  Usage last 90 days · {item.usageLast90d} (threshold {item.usageThreshold})
                </li>
                <li>Admin ready · {item.adminReady ? "yes" : "no"}</li>
                <li>
                  Demand · {item.demandCount} · {item.urgency} urgency
                </li>
                <li>
                  Blocker · {item.blockerFlag ? "yes" : "no"} · dependencies {item.dependencyCount}
                </li>
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
              {scored.sensitiveToWeights ? <p data-testid="weight-sensitive">Sensitive to weight changes.</p> : null}
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
      </WorkLayout>
    </ClientShell>
  );
}
