import { useEffect, useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import { ClientShell } from "../components/ClientShell";
import { FeedHead, RailButton, SearchField, WorkLayout } from "../components/worldUi";
import { notesFor, type PersonaId, type ReleaseNote } from "../data/clientNotes";
import { PERSONA_COPY } from "../data/personaCopy";
import type { ClientId } from "../data/clients";
import { HORIZON_TITLE, TIER_LABEL, leadSignal, noteScore, rerankFromText, visibleNotes, type HorizonFilter } from "../portal/feed";
import { useBriefing } from "../portal/BriefingContext";
import { useClient } from "../portal/useClient";
import { readReq, reqText } from "../state/requirements";

const FILTERS: HorizonFilter[] = ["all", "long", "quarter", "daily"];

function PortalFeed({ clientId }: { clientId: ClientId }) {
  const hex = clientId === "hexworth";
  const notes = notesFor(clientId);
  const { persona, briefing, toggleBriefing, briefingOpen } = useBriefing();
  const copy = PERSONA_COPY[persona];
  const [filter, setFilter] = useState<HorizonFilter>("all");
  const [query, setQuery] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);
  const [pinned, setPinned] = useState<string[]>([]);
  const [clientReq, setClientReq] = useState(() => reqText(readReq(clientId)));
  const [personaReq, setPersonaReq] = useState("");
  const [overrides, setOverrides] = useState<Record<string, number> | null>(null);
  const [status, setStatus] = useState("Default ranking");

  useEffect(() => {
    setOpenId(null);
  }, [persona]);

  const visible = useMemo(
    () => visibleNotes(notes, persona, filter, query, overrides),
    [notes, persona, filter, query, overrides],
  );
  const top = Math.max(...notes.map((note) => noteScore(note, persona, overrides)));
  const counts = {
    all: notes.length,
    long: notes.filter((note) => note.tier === "long").length,
    quarter: notes.filter((note) => note.tier === "quarter").length,
    daily: notes.filter((note) => note.tier === "daily").length,
  };

  function rerank() {
    const text = `${clientReq} ${personaReq}`.trim();
    const next = rerankFromText(notes, persona, text);
    if (!next) return;
    setOverrides(next);
    setStatus("Re-ranked");
    setOpenId(null);
  }

  const briefingNotes = briefing
    .map((id) => notes.find((note) => note.id === id))
    .filter((note): note is ReleaseNote => Boolean(note));

  return (
    <div data-testid="portal-home">
      {hex ? (
        <section className="hx-hero">
          <div className="hx-hero-in">
            <div>
              <p className="hx-hero-eyebrow">Latest release focus · {copy.eyebrow}</p>
              <h1>{copy.heroTitle[clientId]}</h1>
              <p className="hx-hero-sub">{copy.heroSub[clientId]}</p>
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
              <h1>{copy.heroTitle[clientId]}</h1>
              <p>{copy.heroSub[clientId]}</p>
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
            <PersonaFields clientId={clientId} persona={persona} />
          </div>
        </div>
      ) : (
        <div className="ae-persona-panel-in">
          <PersonaFields clientId={clientId} persona={persona} />
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
        {briefingOpen ? (
          <section className={hex ? "hx-impact-panel briefing-panel" : "ae-impact-panel briefing-panel"} aria-label="Briefing">
            <h2>Briefing</h2>
            {briefingNotes.length === 0 ? (
              <p>No notes in this briefing yet. Open a release and choose Add to briefing.</p>
            ) : (
              <ul>
                {briefingNotes.map((note) => (
                  <li key={note.id}>
                    <strong>{note.title}</strong>
                    <span>
                      {noteScore(note, persona, overrides)}% · {copy.impactTitle}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        ) : null}
      </div>

      <WorkLayout
        label="Horizon"
        rail={
          <>
            {FILTERS.map((id) => (
              <RailButton
                key={id}
                active={filter === id}
                label={id === "all" && hex ? "All" : HORIZON_TITLE[id]}
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
        <FeedHead title={HORIZON_TITLE[filter]}>
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
          <div data-testid="salient-list">
            {visible.map((note) => (
              <NoteRow
                key={note.id}
                note={note}
                persona={persona}
                hex={hex}
                open={openId === note.id}
                score={noteScore(note, persona, overrides)}
                ranked={overrides !== null}
                pinned={pinned.includes(note.id)}
                inBriefing={briefing.includes(note.id)}
                onToggle={() => setOpenId(openId === note.id ? null : note.id)}
                onPin={() =>
                  setPinned((current) =>
                    current.includes(note.id) ? current.filter((id) => id !== note.id) : [...current, note.id],
                  )
                }
                onBriefing={() => toggleBriefing(note.id)}
              />
            ))}
          </div>
        )}
      </WorkLayout>
    </div>
  );
}

function NoteRow({
  note,
  persona,
  hex,
  open,
  score,
  ranked,
  pinned,
  inBriefing,
  onToggle,
  onPin,
  onBriefing,
}: {
  note: ReleaseNote;
  persona: PersonaId;
  hex: boolean;
  open: boolean;
  score: number;
  ranked: boolean;
  pinned: boolean;
  inBriefing: boolean;
  onToggle: () => void;
  onPin: () => void;
  onBriefing: () => void;
}) {
  const signal = leadSignal(note, persona);
  const impactTitle = PERSONA_COPY[persona].impactTitle;
  const tiles = note.impact[persona];
  const impactNote = note.impact[`impactNote_${persona}`];
  return (
    <div className={hex ? "hx-note-row" : "ae-note-row"}>
      <button className={hex ? "hx-note-row-main" : "ae-note-row-main"} type="button" onClick={onToggle}>
        <div className={hex ? `hx-tier-pill ${note.tier}` : `ae-tier-tag ${note.tier}`}>{TIER_LABEL[note.tier]}</div>
        <div>
          <div className={hex ? "hx-note-title" : "ae-note-title"}>{note.title}</div>
          <div className={hex ? "hx-note-excerpt" : "ae-note-excerpt"}>{note.excerpt}</div>
          <div className={hex ? "hx-card-signal" : "ae-card-signal"} data-testid="impact-signal">
            <span className={`sig-val ${signal.cls}`}>{signal.val}</span>
            <span className="sig-lbl">{signal.lbl}</span>
          </div>
          <div className={hex ? "hx-note-chips" : "ae-note-chips"}>
            <span className={hex ? "hx-note-chip" : "ae-note-chip"}>{note.date}</span>
            <span className={hex ? "hx-note-chip" : "ae-note-chip"}>{note.version}</span>
            {note.tags.slice(0, 2).map((tag) => (
              <span key={tag} className={hex ? "hx-note-chip" : "ae-note-chip"}>
                {tag}
              </span>
            ))}
          </div>
        </div>
        <div className={hex ? "hx-note-score" : "ae-note-score"}>
          <div className="n">
            {score}
            <em>%</em>
          </div>
          <div className="l">Match</div>
          {ranked ? <span className={hex ? "ai-badge hx-theme" : "ai-badge ae-theme"}>Ranked</span> : null}
        </div>
      </button>
      {open ? (
        <div className={hex ? "hx-note-expand open" : "ae-note-expand open"} data-testid="note-expand">
          <div>
            <h4>Summary</h4>
            <p>{note.summary}</p>
            <div className={hex ? "hx-note-expand-actions" : "ae-note-expand-actions"}>
              <button className={hex ? "hx-btn-ghost" : "ae-btn-ghost"} type="button" aria-pressed={pinned} onClick={onPin}>
                {pinned ? "Pinned" : "Pin"}
              </button>
              <button
                className={hex ? "hx-btn-primary" : "ae-btn-primary"}
                type="button"
                aria-pressed={inBriefing}
                onClick={onBriefing}
              >
                {inBriefing ? "In briefing" : "Add to briefing"}
              </button>
            </div>
          </div>
          <div>
            <h4>Why it matters here</h4>
            <ul>
              {note.why.map((reason) => (
                <li key={reason}>{reason}</li>
              ))}
            </ul>
          </div>
          <div className={hex ? "hx-impact-panel" : "ae-impact-panel"} data-testid="impact-panel">
            <h4>{impactTitle}</h4>
            <div className={hex ? "hx-impact-grid" : "ae-impact-grid"}>
              {tiles.map((tile) => (
                <div className={hex ? "hx-impact-tile" : "ae-impact-tile"} key={tile.lbl}>
                  <div className={`val ${tile.cls}`}>{tile.val}</div>
                  <div className="lbl">{tile.lbl}</div>
                </div>
              ))}
            </div>
            {impactNote ? <div className={hex ? "hx-impact-note" : "ae-impact-note"}>{impactNote}</div> : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function PersonaFields({ clientId, persona }: { clientId: ClientId; persona: PersonaId }) {
  const copy = PERSONA_COPY[persona];
  const hex = clientId === "hexworth";
  if (hex) {
    return (
      <>
        <div className="hx-pfield">
          <span className="hx-pfield-label">Viewing as</span>
          <div className="hx-pfield-value">{copy.roleLine}</div>
        </div>
        <div className="hx-pfield">
          <span className="hx-pfield-label">Focus horizon</span>
          <div className="hx-pfield-value">{copy.horizon}</div>
        </div>
        <div className="hx-pfield" style={{ flex: 2 }}>
          <span className="hx-pfield-label">FY objectives</span>
          <div className="hx-pfield-value">{copy.objectives[clientId]}</div>
        </div>
        <div className="hx-pfield">
          <span className="hx-pfield-label">Matching on</span>
          <div className="hx-ptags">
            {copy.tags[clientId].map((tag) => (
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
        <div className="ae-persona-field-value">{copy.roleLine}</div>
      </div>
      <div className="ae-persona-field">
        <span className="ae-persona-field-label">Focus horizon</span>
        <div className="ae-persona-field-value">{copy.horizon}</div>
      </div>
      <div className="ae-persona-field" style={{ flex: 2 }}>
        <span className="ae-persona-field-label">FY objectives</span>
        <div className="ae-persona-field-value">{copy.objectives[clientId]}</div>
      </div>
      <div className="ae-persona-field">
        <span className="ae-persona-field-label">Matching on</span>
        <div className="ae-persona-tags">
          {copy.tags[clientId].map((tag) => (
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
