import { useEffect, useMemo, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { ClientShell } from "../components/ClientShell";
import { FeedHead, RailButton, SearchField, WorkLayout } from "../components/worldUi";
import { CATALOG } from "../data/catalog";
import { CLIENT_PREVIEWS, type ClientId } from "../data/clients";
import { PERSONA_COPY } from "../data/personaCopy";
import {
  HORIZON_LABEL,
  RELEASE_DROP,
  clientNotes,
  horizonCount,
  type Horizon,
  type SalientChange,
} from "../data/releaseNotes";
import { formatScore } from "../format";
import { useClient } from "../portal/useClient";
import { rankTop } from "../scoring/rank";
import { readReq, reqText } from "../state/requirements";
import { useSession } from "../state/SessionProvider";
import { ROLE_LABELS, type Role, type ShortlistContext } from "../types";

type Filter = Horizon | "all";

const TIER_TITLES: Record<Filter, string> = {
  all: "All releases",
  long: "Long-term",
  quarter: "Quarter",
  daily: "Day-to-day",
};

function scoringContext(
  clientId: ClientId,
  saved: ShortlistContext | null,
  pendingRole: Role | null,
): ShortlistContext {
  if (saved) return saved;
  const preview = CLIENT_PREVIEWS[clientId];
  if (pendingRole) return { ...preview, role: pendingRole };
  return preview;
}

/** Display order for salient notes. Catalog ranking stays in rank.ts. */
function roleScore(note: SalientChange, role: Role): number {
  const bias: Record<Role, Record<Horizon, number>> = {
    cio: { long: 12, quarter: 0, daily: -18 },
    product_lead: { long: -4, quarter: 10, daily: -6 },
    ba: { long: -16, quarter: 2, daily: 12 },
  };
  return Math.max(1, Math.min(99, note.match + bias[role][note.horizon]));
}

function keywordLens(notes: SalientChange[], role: Role, text: string): Record<string, number> {
  const words = text
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((word) => word.length > 2);
  const scores: Record<string, number> = {};
  for (const note of notes) {
    const hay = `${note.headline} ${note.salient} ${note.version}`.toLowerCase();
    const hits = words.filter((word) => hay.includes(word)).length;
    scores[note.id] = Math.max(1, Math.min(99, roleScore(note, role) + hits * 6));
  }
  return scores;
}

function RelevantFeatures({ clientId }: { clientId: ClientId }) {
  const { context, pendingRole } = useSession();
  const lens = scoringContext(clientId, context, pendingRole);
  const ranked = rankTop(lens, CATALOG).slice(0, 3);
  const base = `/clients/${clientId}`;
  return (
    <section className="relevant-features" data-testid="relevant-features" aria-label="Most relevant features">
      <h2>Most relevant features · {ROLE_LABELS[lens.role]}</h2>
      <p className="relevant-note">
        {context
          ? "Ranked from the FY objectives and mocks saved in this session."
          : "Preview lens until FY objectives are saved. The role login changes this ranking."}
      </p>
      <ol>
        {ranked.map((row) => (
          <li key={row.item.id}>
            <Link to={context ? `${base}/items/${row.item.id}` : `${base}/intake`}>
              <strong>{row.item.name}</strong>
              <span>{formatScore(row.score)}</span>
            </Link>
            <p>{row.item.summary}</p>
          </li>
        ))}
      </ol>
      <Link className="fy-link" to={`${base}/intake`}>
        Open FY brief
      </Link>
    </section>
  );
}

function PortalFeed({ clientId }: { clientId: ClientId }) {
  const hex = clientId === "hexworth";
  const { context, pendingRole } = useSession();
  const lens = scoringContext(clientId, context, pendingRole);
  const persona = PERSONA_COPY[lens.role];
  const notes = clientNotes(clientId);
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);
  const [clientReq, setClientReq] = useState(() => reqText(readReq(clientId)));
  const [personaReq, setPersonaReq] = useState("");
  const [lensScores, setLensScores] = useState<Record<string, number> | null>(null);
  const [status, setStatus] = useState("Default ranking");

  useEffect(() => {
    setLensScores(null);
    setStatus("Default ranking");
  }, [lens.role]);

  const scoreFor = (note: SalientChange) => lensScores?.[note.id] ?? roleScore(note, lens.role);

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return notes
      .filter((note) => (filter === "all" ? true : note.horizon === filter))
      .filter((note) => {
        if (!needle) return true;
        return `${note.headline} ${note.salient} ${note.version}`.toLowerCase().includes(needle);
      })
      .slice()
      .sort((left, right) => scoreFor(right) - scoreFor(left));
    // scoreFor closes over lens role and lensScores
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notes, filter, query, lens.role, lensScores]);

  const top = Math.max(...notes.map((note) => scoreFor(note)));
  const counts: Record<Filter, number> = {
    all: notes.length,
    long: horizonCount(clientId, "long"),
    quarter: horizonCount(clientId, "quarter"),
    daily: horizonCount(clientId, "daily"),
  };

  function rerank() {
    const text = `${clientReq} ${personaReq}`.trim();
    if (!text) return;
    setLensScores(keywordLens(notes, lens.role, text));
    setStatus("Re-ranked");
    setOpenId(null);
  }

  const noteList = (
    <div id={hex ? "hxNoteList" : "aeNoteList"} data-testid="salient-list">
      {visible.map((note) => {
        const open = openId === note.id;
        const score = scoreFor(note);
        return (
          <div className={hex ? "hx-note-row" : "ae-note-row"} key={note.id}>
            <button
              className={hex ? "hx-note-row-main" : "ae-note-row-main"}
              type="button"
              onClick={() => setOpenId(open ? null : note.id)}
            >
              <div className={hex ? `hx-tier-pill ${note.horizon}` : `ae-tier-tag ${note.horizon}`}>
                {HORIZON_LABEL[note.horizon]}
              </div>
              <div>
                <div className={hex ? "hx-note-title" : "ae-note-title"}>{note.headline}</div>
                <div className={hex ? "hx-note-excerpt" : "ae-note-excerpt"}>{note.salient}</div>
                <div className={hex ? "hx-note-chips" : "ae-note-chips"}>
                  <span className={hex ? "hx-note-chip" : "ae-note-chip"}>{note.date}</span>
                  <span className={hex ? "hx-note-chip" : "ae-note-chip"}>{note.version}</span>
                </div>
              </div>
              <div className={hex ? "hx-note-score" : "ae-note-score"}>
                <div className="n">
                  {score}
                  <em>%</em>
                </div>
                <div className="l">Match</div>
              </div>
            </button>
            {open ? (
              <div className={hex ? "hx-note-expand open" : "ae-note-expand open"}>
                <div>
                  <h4>Summary</h4>
                  <p>{note.salient}</p>
                </div>
                <div>
                  <h4>Release</h4>
                  <p>
                    {RELEASE_DROP.label} · {note.version} · mock scrape
                  </p>
                </div>
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );

  const filters: Filter[] = ["all", "long", "quarter", "daily"];

  return (
    <div data-testid="portal-home">
      {hex ? (
        <section className="hx-hero">
          <div className="hx-hero-in">
            <div>
              <p className="hx-hero-eyebrow">Latest release focus · {persona.eyebrow}</p>
              <h1>{persona.heroTitle}</h1>
              <p className="hx-hero-sub">{persona.heroSub}</p>
            </div>
            <aside className="hx-hero-fig">
              <div className="hx-hero-big">{top}%</div>
              <div className="hx-hero-fig-lbl">Top match</div>
            </aside>
          </div>
        </section>
      ) : (
        <div className="ae-data-header">
          <div className="ae-data-header-in">
            <div className="ae-data-lead">
              <h1>{persona.heroTitle}</h1>
              <p>{persona.heroSub}</p>
            </div>
            <div className="ae-kpi">
              <div className="n">{notes.length}</div>
              <div className="l">Open notes</div>
            </div>
            <div className="ae-kpi">
              <div className="n">
                {top}
                <em>%</em>
              </div>
              <div className="l">Top match</div>
            </div>
            <div className="ae-kpi">
              <div className="n">Q3</div>
              <div className="l">Focus window</div>
            </div>
            <div className="ae-kpi">
              <div className="n">3</div>
              <div className="l">Horizons</div>
            </div>
          </div>
        </div>
      )}

      {hex ? (
        <div className="hx-persona-bar">
          <div className="hx-persona-bar-in">
            <PersonaFields clientId={clientId} roleLine={persona.roleLine} horizon={persona.horizon} objective={persona.objectives[clientId]} tags={persona.tags[clientId]} />
          </div>
        </div>
      ) : (
        <div className="ae-persona-panel-in">
          <PersonaFields clientId={clientId} roleLine={persona.roleLine} horizon={persona.horizon} objective={persona.objectives[clientId]} tags={persona.tags[clientId]} />
        </div>
      )}

      <div className={hex ? "hx-rerank-wrap" : "ae-rerank-wrap"}>
        <div className={hex ? "rerank-bar hx-theme" : "rerank-bar ae-theme"}>
          <div className="rerank-fields">
            <div>
              <label className="rerank-field-label" htmlFor="rerank-client">
                Client requirements
              </label>
              <textarea
                className="rerank-textarea"
                id="rerank-client"
                rows={2}
                value={clientReq}
                placeholder="Problems to solve and business requirements set at agency level..."
                onChange={(event) => setClientReq(event.target.value)}
              />
            </div>
            <div>
              <label className="rerank-field-label" htmlFor="rerank-persona">
                Your focus
              </label>
              <textarea
                className="rerank-textarea"
                id="rerank-persona"
                rows={2}
                value={personaReq}
                placeholder="Add your own lens on top of the client requirements..."
                onChange={(event) => setPersonaReq(event.target.value)}
              />
            </div>
          </div>
          <div className="rerank-actions">
            <button className="rerank-btn" type="button" disabled={!clientReq.trim() && !personaReq.trim()} onClick={rerank}>
              <span className="rerank-spin">▲</span> Re-rank
            </button>
            <span className={status === "Re-ranked" ? "rerank-status live" : "rerank-status"}>{status}</span>
          </div>
        </div>
      </div>

      <WorkLayout
        label="Horizon"
        rail={
          <>
            {filters.map((id) => (
              <RailButton
                key={id}
                active={filter === id}
                label={id === "all" && hex ? "All" : TIER_TITLES[id]}
                count={hex ? `${counts[id]} notes` : counts[id]}
                onClick={() => {
                  setFilter(id);
                  setOpenId(null);
                }}
              />
            ))}
          </>
        }
      >
        <FeedHead title={TIER_TITLES[filter]}>
          <SearchField
            value={query}
            placeholder="Search notes..."
            onChange={(value) => {
              setQuery(value);
              setOpenId(null);
            }}
          />
        </FeedHead>
        {visible.length === 0 ? (
          <div className={hex ? "hx-empty show" : "ae-empty show"}>No notes match this filter.</div>
        ) : (
          noteList
        )}
        <RelevantFeatures clientId={clientId} />
      </WorkLayout>
    </div>
  );
}

function PersonaFields({
  clientId,
  roleLine,
  horizon,
  objective,
  tags,
}: {
  clientId: ClientId;
  roleLine: string;
  horizon: string;
  objective: string;
  tags: string[];
}) {
  const hex = clientId === "hexworth";
  if (hex) {
    return (
      <>
        <div className="hx-pfield">
          <span className="hx-pfield-label">Viewing as</span>
          <div className="hx-pfield-value">{roleLine}</div>
        </div>
        <div className="hx-pfield">
          <span className="hx-pfield-label">Focus horizon</span>
          <div className="hx-pfield-value">{horizon}</div>
        </div>
        <div className="hx-pfield" style={{ flex: 2 }}>
          <span className="hx-pfield-label">FY objectives</span>
          <div className="hx-pfield-value">{objective}</div>
        </div>
        <div className="hx-pfield">
          <span className="hx-pfield-label">Matching on</span>
          <div className="hx-ptags">
            {tags.map((tag) => (
              <span className="hx-ptag" key={tag}>
                {tag}
              </span>
            ))}
          </div>
        </div>
      </>
    );
  }
  return (
    <>
      <div className="ae-persona-field">
        <span className="ae-persona-field-label">Viewing as</span>
        <div className="ae-persona-field-value">{roleLine}</div>
      </div>
      <div className="ae-persona-field">
        <span className="ae-persona-field-label">Focus horizon</span>
        <div className="ae-persona-field-value">{horizon}</div>
      </div>
      <div className="ae-persona-field" style={{ flex: 2 }}>
        <span className="ae-persona-field-label">FY objectives</span>
        <div className="ae-persona-field-value">{objective}</div>
      </div>
      <div className="ae-persona-field">
        <span className="ae-persona-field-label">Matching on</span>
        <div className="ae-persona-tags">
          {tags.map((tag) => (
            <span className="ae-persona-tag" key={tag}>
              {tag}
            </span>
          ))}
        </div>
      </div>
    </>
  );
}

export function PortalHome() {
  const client = useClient();
  if (!client) return <Navigate to="/" replace />;
  return (
    <ClientShell>
      <PortalFeed clientId={client.id} />
    </ClientShell>
  );
}
