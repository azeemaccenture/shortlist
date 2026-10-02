import { useMemo, useState } from "react";
import { ClientShell } from "../components/ClientShell";
import { ContextSummary } from "../components/ContextSummary";
import { FeedHead, NoteRowLink, RailButton, ScoreHeader, SearchField, WorkLayout, actionClass, useHex } from "../components/worldUi";
import { CATALOG } from "../data/catalog";
import { formatScore, formatWhen } from "../format";
import { useClientBase } from "../portal/useClient";
import { scoreItem } from "../scoring/rank";
import { useSession } from "../state/SessionProvider";
import { CLOUDS, ROLE_LABELS, ROLE_WEIGHT_PROFILE, type CatalogItem, type Cloud } from "../types";

export function CatalogPage() {
  const { context, syncJira, syncSalesforce } = useSession();
  const base = useClientBase();
  const hex = useHex();
  const [cloud, setCloud] = useState<Cloud | "all">("all");
  const [query, setQuery] = useState("");
  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return CATALOG.filter((item) => {
      if (cloud !== "all" && item.cloud !== cloud) return false;
      if (!needle) return true;
      const hay = [item.name, item.summary, item.cloud, item.effortBand, ...item.strategyTags].join(" ").toLowerCase();
      return hay.includes(needle);
    });
  }, [cloud, query]);
  if (!context) return null;

  const jira = context.sources.jiraMock;
  const salesforce = context.sources.salesforceMock;
  const topScore = Math.max(...CATALOG.map((item) => scoreItem(context, item).score));
  const ghost = `${actionClass(hex, "ghost")} rail-action`;

  return (
    <ClientShell>
      <ScoreHeader
        eyebrow="Catalog"
        title="Candidate pool"
        lede={`Eight Winter ’27 release 264 features, scored with model v1.1 for the ${ROLE_WEIGHT_PROFILE[context.role]} profile. Syncs do not change the score.`}
        stats={[
          { n: CATALOG.length, l: "Features" },
          { n: formatScore(topScore), l: "Top score" },
          { n: context.priorities.length, l: "Priorities" },
          { n: ROLE_LABELS[context.role] === "Product Lead" ? "PL" : ROLE_LABELS[context.role], l: "Role" },
        ]}
      />
      <div className="band">
        <ContextSummary context={context} />
      </div>
      <WorkLayout
        label="Cloud"
        rail={
          <>
            <RailButton active={cloud === "all"} label="All features" count={CATALOG.length} onClick={() => setCloud("all")} />
            {CLOUDS.map((level) => (
              <RailButton
                key={level}
                testId={`cloud-${level}`}
                active={cloud === level}
                label={level}
                count={CATALOG.filter((item) => item.cloud === level).length}
                onClick={() => setCloud(level)}
              />
            ))}
            <div className="sync-block">
              <button type="button" className={ghost} data-testid="sync-jira" onClick={syncJira}>
                Sync Jira mock
              </button>
              <button type="button" className={ghost} data-testid="sync-salesforce" onClick={syncSalesforce}>
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
          </>
        }
      >
        <FeedHead title={cloud === "all" ? "All features" : cloud}>
          <SearchField value={query} placeholder="Search features…" onChange={setQuery} />
        </FeedHead>
        {visible.length === 0 ? (
          <div className={hex ? "hx-empty show" : "ae-empty show"}>
            <p>
              <strong>No features match</strong>
            </p>
            <p>Try another cloud or clear your search.</p>
          </div>
        ) : (
          <ul className="note-list" data-testid="catalog-list">
            {visible.map((item) => (
              <li key={item.id}>
                <CatalogRow item={item} score={scoreItem(context, item).score} base={base} />
              </li>
            ))}
          </ul>
        )}
      </WorkLayout>
    </ClientShell>
  );
}

function CatalogRow({ item, score, base }: { item: CatalogItem; score: number; base: string }) {
  return (
    <NoteRowLink
      to={`${base}/items/${item.id}`}
      tier={item.effortBand}
      tierClass="band"
      title={item.name}
      excerpt={item.summary}
      chips={[item.cloud, ...item.strategyTags]}
      score={formatScore(score)}
      scoreLabel="Score"
    />
  );
}
