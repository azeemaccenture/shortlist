import { useEffect, useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import { ClientShell } from "../components/ClientShell";
import { RequirementsPanel } from "../components/RequirementsPanel";
import { FeedHead, RailButton, SearchField, WorkLayout } from "../components/worldUi";
import { type PersonaId, type ReleaseNote } from "../data/clientNotes";
import { PERSONA_COPY } from "../data/personaCopy";
import type { ClientId } from "../data/clients";
import { SALESFORCE_RELEASE_NOTES } from "../data/salesforceReleaseNotes";
import { salesforceNotesFor } from "../data/salesforceClientNotes";
import { HORIZON_TITLE, TIER_LABEL, leadSignal, noteScore, rerankFromText, visibleNotes, type HorizonFilter } from "../portal/feed";
import { useBriefing } from "../portal/BriefingContext";
import { useClient } from "../portal/useClient";
import { readSources, requirementText, subscribeRequirements } from "../state/requirements";

const FILTERS: HorizonFilter[] = ["all", "long", "quarter", "daily"];

function hasRequirements(clientId: ClientId, persona: PersonaId): boolean {
  const sources = readSources(clientId, persona);
  return Boolean(sources.document || sources.jira);
}

function PortalFeed({ clientId }: { clientId: ClientId }) {
  const hex = clientId === "hexworth";
  const notes = useMemo(() => salesforceNotesFor(clientId), [clientId]);
  const { persona, setPersona, briefing, toggleBriefing, briefingOpen } = useBriefing();
  const copy = PERSONA_COPY[persona];
  const [filter, setFilter] = useState<HorizonFilter>("all");
  const [query, setQuery] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);
  const [pinned, setPinned] = useState<string[]>([]);
  const [overrides, setOverrides] = useState<Record<string, number> | null>(null);
  const [sourcesFilled, setSourcesFilled] = useState(() => hasRequirements(clientId, persona));

  useEffect(() => {
    setOpenId(null);
    setOverrides(rerankFromText(notes, persona, requirementText(clientId, persona)));
  }, [clientId, persona, notes]);

  useEffect(() => {
    setSourcesFilled(hasRequirements(clientId, persona));
    return subscribeRequirements(() => setSourcesFilled(hasRequirements(clientId, persona)));
  }, [clientId, persona]);

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

  function rerank(text: string) {
    setOverrides(rerankFromText(notes, persona, text));
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
              {sourcesFilled ? (
                <>
                  <div className="hx-hero-big">{top}%</div>
                  <div className="hx-hero-fig-lbl">Top match</div>
                </>
              ) : (
                <>
                  <div className="hx-hero-big awaiting">—</div>
                  <div className="hx-hero-fig-lbl">Awaiting requirements</div>
                </>
              )}
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
              <div className="l">Winter ’27 notes</div>
            </div>
            <div className="ae-kpi">
              {sourcesFilled ? (
                <>
                  <div className="n">
                    {top}
                    <em>%</em>
                  </div>
                  <div className="l">Top match</div>
                </>
              ) : (
                <>
                  <div className="n awaiting">—</div>
                  <div className="l">Awaiting requirements</div>
                </>
              )}
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
        <RequirementsPanel clientId={clientId} persona={persona} onPersona={setPersona} onApply={rerank} />
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

      {sourcesFilled ? (
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
      ) : (
        <AwaitingRequirements
          clientId={clientId}
          persona={persona}
          noteCount={notes.length}
          hex={hex}
        />
      )}
    </div>
  );
}

function AwaitingRequirements({
  clientId,
  persona,
  noteCount,
  hex,
}: {
  clientId: ClientId;
  persona: PersonaId;
  noteCount: number;
  hex: boolean;
}) {
  const copy = PERSONA_COPY[persona];
  return (
    <section
      className={hex ? "req-gate hx-theme" : "req-gate ae-theme"}
      data-testid="requirements-gate"
      aria-live="polite"
    >
      <div className="req-gate-eyebrow">Recommendations</div>
      <h2 className="req-gate-title">Attach requirements to see recommendations</h2>
      <p className="req-gate-body">
        {noteCount} Winter ’27 features from the Salesforce release 264 notes are routed to {clientId === "aether" ? "Aether Dynamics" : "Hexworth"} on
        the agency feed. Upload a document or connect Jira above as the <strong>{copy.label}</strong> persona, and
        Shortlist will rank those features against what you&rsquo;ve attached.
      </p>
      <ul className="req-gate-steps">
        <li>
          <span className="req-gate-step-num">1</span>
          <span>Attach a strategy document or roadmap, or connect your Jira board, in the panel above.</span>
        </li>
        <li>
          <span className="req-gate-step-num">2</span>
          <span>Press <em>Re-apply to ranking</em> to score the Salesforce release 264 features against it.</span>
        </li>
        <li>
          <span className="req-gate-step-num">3</span>
          <span>Open the top-ranked features to see their persona impact and add them to your briefing.</span>
        </li>
      </ul>
      <a
        className="req-gate-source"
        href={SALESFORCE_RELEASE_NOTES.sourceUrl}
        target="_blank"
        rel="noreferrer"
      >
        Source · {SALESFORCE_RELEASE_NOTES.label} · release {SALESFORCE_RELEASE_NOTES.release}
      </a>
    </section>
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
