import { useEffect, useRef, useState } from "react";
import type { ClientId } from "../data/clients";
import type { PersonaId } from "../data/clientNotes";
import { REQUIREMENT_COPY, type SourceKind } from "../data/requirementSources";
import { PERSONA_COPY, PERSONAS } from "../data/personaCopy";
import {
  attachDocument,
  clearSources,
  connectJira,
  readSources,
  removeSource,
  requirementText,
  subscribeRequirements,
  type PersonaSources,
} from "../state/requirements";

type RequirementsPanelProps = {
  clientId: ClientId;
  persona: PersonaId;
  onPersona?: (persona: PersonaId) => void;
  onApply?: (text: string) => void;
};

function Icon({ name }: { name: "check" | "file" | "plus" | "search" | "ticket" | "upload" }) {
  const common = { width: 18, height: 18, viewBox: "0 0 24 24", fill: "none", "aria-hidden": true as const };
  if (name === "check") {
    return (
      <svg {...common}>
        <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.6" />
        <path d="M8.5 12.2 L11 14.6 L15.5 9.5" stroke="currentColor" strokeWidth="1.6" />
      </svg>
    );
  }
  if (name === "upload") {
    return (
      <svg {...common}>
        <path d="M12 16 V7 M8.5 10.5 L12 7 L15.5 10.5" stroke="currentColor" strokeWidth="1.6" />
        <path d="M6 17.5 H18" stroke="currentColor" strokeWidth="1.6" />
      </svg>
    );
  }
  if (name === "plus" || name === "file") {
    return (
      <svg {...common}>
        <path d="M7 3.5 H14 L18 7.5 V20.5 H7 Z" stroke="currentColor" strokeWidth="1.6" />
        <path d="M14 3.5 V7.5 H18" stroke="currentColor" strokeWidth="1.6" />
        {name === "plus" ? <path d="M12 11 V16 M9.5 13.5 H14.5" stroke="currentColor" strokeWidth="1.6" /> : null}
      </svg>
    );
  }
  if (name === "search") {
    return (
      <svg {...common}>
        <circle cx="11" cy="11" r="5.5" stroke="currentColor" strokeWidth="1.6" />
        <path d="M15.2 15.2 L19 19" stroke="currentColor" strokeWidth="1.6" />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <rect x="4" y="6" width="16" height="12" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M8 10 H16 M8 14 H13" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

export function RequirementsPanel({ clientId, persona, onPersona, onApply }: RequirementsPanelProps) {
  const [localPersona, setLocalPersona] = useState(persona);
  const [sources, setSources] = useState<PersonaSources>(() => readSources(clientId, persona));
  const [applied, setApplied] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const active = onPersona ? persona : localPersona;
  const copy = REQUIREMENT_COPY[clientId][active];
  const filled = Boolean(sources.document || sources.jira);
  const summary = summaryFor(active, sources, copy.filledSummary);

  useEffect(() => {
    setLocalPersona(persona);
  }, [persona]);

  useEffect(() => {
    setSources(readSources(clientId, active));
    setApplied(false);
    return subscribeRequirements(() => setSources(readSources(clientId, active)));
  }, [clientId, active]);

  function choosePersona(next: PersonaId) {
    if (onPersona) onPersona(next);
    else setLocalPersona(next);
  }

  function upload(file: File | undefined) {
    if (!file) return;
    attachDocument(clientId, active, file.name);
    setApplied(false);
  }

  function apply() {
    const text = requirementText(clientId, active);
    onApply?.(text);
    setApplied(true);
  }

  return (
    <div className="rp" data-testid="requirements-panel">
      <div className="rp-personas" role="group" aria-label="Requirements role">
        {PERSONAS.map((id) => (
          <button
            key={id}
            type="button"
            className={active === id ? "rp-chip active" : "rp-chip"}
            onClick={() => choosePersona(id)}
          >
            {PERSONA_COPY[id].label}
          </button>
        ))}
      </div>

      {filled ? (
        <>
          <div className="rp-filled">
            <Icon name="check" />
            <p>{summary}</p>
          </div>
          <div className="rp-sources">
            {copy.order.map((kind) => {
              const source = sources[kind];
              if (!source) return null;
              return (
                <article className="rp-card" key={kind}>
                  <div className="rp-card-head">
                    <div className={kind === "jira" ? "rp-icon jira" : "rp-icon doc"}>
                      <Icon name={kind === "jira" ? "ticket" : "file"} />
                    </div>
                    <div className="rp-info">
                      <div className="rp-name">{source.name}</div>
                      <div className="rp-meta">{source.meta}</div>
                    </div>
                    <span className="rp-badge ok">
                      <Icon name="check" /> {kind === "jira" ? "Connected" : "Parsed"}
                    </span>
                  </div>
                  <div className="rp-actions">
                    {kind === "document" ? (
                      <button className="rp-link" type="button" onClick={() => fileRef.current?.click()}>
                        Replace
                      </button>
                    ) : (
                      <button className="rp-link" type="button">
                        Manage tickets
                      </button>
                    )}
                    <button
                      className="rp-link danger"
                      type="button"
                      onClick={() => {
                        removeSource(clientId, active, kind);
                        setApplied(false);
                      }}
                    >
                      {kind === "jira" ? "Disconnect" : "Remove"}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
          {sources.jira && !sources.document ? (
            <button className="rp-add" type="button" onClick={() => fileRef.current?.click()}>
              <Icon name="plus" /> Add a document
            </button>
          ) : null}
          {sources.document && !sources.jira ? (
            <button
              className="rp-jira rp-jira-later"
              type="button"
              data-testid="requirements-jira"
              onClick={() => {
                connectJira(clientId, active);
                setApplied(false);
              }}
            >
              <span className="rp-jira-mark">J</span> Connect Jira
            </button>
          ) : null}
          <div className="rp-footer">
            <button
              className="rp-clear"
              type="button"
              onClick={() => {
                clearSources(clientId, active);
                setApplied(false);
              }}
            >
              Clear all
            </button>
            <button className="rp-apply" type="button" data-testid="requirements-apply" onClick={apply}>
              Re-apply to ranking ↗
            </button>
          </div>
          {applied ? <p className="rp-applied">Ranking updated for {PERSONA_COPY[active].label}.</p> : null}
        </>
      ) : (
        <>
          <div className="rp-empty">
            <Icon name={active === "cio" ? "search" : active === "product" ? "ticket" : "ticket"} />
            <h3>{copy.emptyTitle}</h3>
            <p>{copy.emptyBody}</p>
          </div>
          <div className="rp-sources">
            {copy.order.map((kind) => (
              <EmptyCard
                key={kind}
                kind={kind}
                name={copy[kind].emptyName}
                meta={copy[kind].emptyMeta}
                onUpload={() => fileRef.current?.click()}
                onJira={() => {
                  connectJira(clientId, active);
                  setApplied(false);
                }}
              />
            ))}
          </div>
        </>
      )}
      <input
        ref={fileRef}
        className="rp-file"
        type="file"
        accept=".pdf,.txt,.md,application/pdf,text/plain"
        data-testid="requirements-file"
        onChange={(event) => {
          upload(event.target.files?.[0]);
          event.target.value = "";
        }}
      />
    </div>
  );
}

function summaryFor(persona: PersonaId, sources: PersonaSources, filledSummary: string) {
  if (sources.document && sources.jira) {
    return persona === "cio" ? filledSummary : `${filledSummary} Document included.`;
  }
  if (sources.document) return "1 source active — document parsed. Ranking is ready to apply.";
  if (persona === "cio") return "1 source active — Jira epics connected. Ranking is ready to apply.";
  return filledSummary;
}

function EmptyCard({
  kind,
  name,
  meta,
  onUpload,
  onJira,
}: {
  kind: SourceKind;
  name: string;
  meta: string;
  onUpload: () => void;
  onJira: () => void;
}) {
  return (
    <article className="rp-card">
      <div className="rp-card-head">
        <div className="rp-icon empty">
          <Icon name={kind === "jira" ? "ticket" : "plus"} />
        </div>
        <div className="rp-info">
          <div className="rp-name muted">{name}</div>
          <div className="rp-meta">{meta}</div>
        </div>
        {kind === "document" ? (
          <button className="rp-upload" type="button" onClick={onUpload}>
            <Icon name="upload" /> Upload
          </button>
        ) : (
          <span className="rp-badge warn">Not connected</span>
        )}
      </div>
      {kind === "jira" ? (
        <div className="rp-actions">
          <button className="rp-jira" type="button" data-testid="requirements-jira" onClick={onJira}>
            <span className="rp-jira-mark">J</span> Connect Jira
          </button>
        </div>
      ) : null}
    </article>
  );
}
