import { ClientShell } from "../components/ClientShell";
import { ContextSummary } from "../components/ContextSummary";
import { FeedHead, NoteRowLink, RailLink, ScoreHeader, WorkLayout } from "../components/worldUi";
import { CATALOG } from "../data/catalog";
import { formatScore } from "../format";
import { useClientBase } from "../portal/useClient";
import { rankTop } from "../scoring/rank";
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
      <ScoreHeader
        eyebrow="Top 5"
        title={`Top ${ranked.length}`}
        lede={`${ROLE_LABELS[context.role]} uses the ${profile} weight profile. The same context and catalog always produce this order.`}
        stats={[
          { n: ranked.length, l: "Picks" },
          { n: top ? formatScore(top.score) : "—", l: "Top score" },
          { n: context.priorities.length, l: "Priorities" },
          { n: ROLE_LABELS[context.role] === "Product Lead" ? "PL" : ROLE_LABELS[context.role], l: "Role" },
        ]}
      />
      <div className="band">
        <ContextSummary context={context} />
      </div>
      <WorkLayout
        label="View"
        rail={
          <>
            <RailLink to={`${base}/catalog`} label="All features" count={CATALOG.length} />
            <RailLink to={`${base}/shortlist`} active label="Top 5" count={ranked.length} />
          </>
        }
      >
        <FeedHead title={`Ranked for ${ROLE_LABELS[context.role]}`} />
        <ol className="note-list" data-testid="shortlist">
          {ranked.map((row, index) => (
            <li key={row.item.id} data-testid="shortlist-row">
              <NoteRowLink
                to={`${base}/items/${row.item.id}`}
                tier={String(index + 1)}
                tierClass="band"
                title={row.item.name}
                excerpt={row.reason}
                chips={[row.item.cloud, `Effort ${row.item.effortBand}`]}
                score={formatScore(row.score)}
                scoreLabel="Score"
                extra={
                  row.sensitiveToWeights ? (
                    <p className="sensitive" data-testid="weight-sensitive">
                      Sensitive to weight changes.
                    </p>
                  ) : null
                }
              />
            </li>
          ))}
        </ol>
      </WorkLayout>
    </ClientShell>
  );
}
