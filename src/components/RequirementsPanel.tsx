import { useEffect, useRef, useState } from "react";
import type { ClientId } from "../data/clients";
import type { PersonaId } from "../data/clientNotes";
import { EXTRACT_LABEL, REQUIREMENT_COPY, type Extract, type RecentFile, type SourceKind } from "../data/requirementSources";
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

type Modal = "jira" | "upload" | null;

function Icon({ name }: { name: "check" | "file" | "plus" | "search" | "ticket" | "upload" | "loader" | "cloud" | "circle" }) {
  const common = { width: 18, height: 18, viewBox: "0 0 24 24", fill: "none", "aria-hidden": true as const };
  if (name === "check") {
    return (
      <svg {...common}>
        <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.6" />
        <path d="M8.5 12.2 L11 14.6 L15.5 9.5" stroke="currentColor" strokeWidth="1.6" />
      </svg>
    );
  }
  if (name === "circle") {
    return (
      <svg {...common}>
        <circle cx="12" cy="12" r="7" stroke="currentColor" strokeWidth="1.6" />
      </svg>
    );
  }
  if (name === "loader") {
    return (
      <svg {...common}>
        <path d="M12 4 a8 8 0 1 1 -6 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    );
  }
  if (name === "cloud") {
    return (
      <svg {...common} width={32} height={32}>
        <path d="M7 17 a4 4 0 0 1 1 -8 5 5 0 0 1 9.5 -1.5 A3.5 3.5 0 0 1 18 17 Z" stroke="currentColor" strokeWidth="1.6" />
        <path d="M12 16 V11 M9.8 13.2 L12 11 L14.2 13.2" stroke="currentColor" strokeWidth="1.6" />
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
  const [modal, setModal] = useState<Modal>(null);
  const [jiraPhase, setJiraPhase] = useState<"connecting" | "authorising" | "connected">("connecting");
  const [jiraProgress, setJiraProgress] = useState(0);
  const [uploadStep, setUploadStep] = useState<1 | 2 | 3>(1);
  const [chosen, setChosen] = useState<RecentFile | null>(null);
  const [parseIndex, setParseIndex] = useState(0);
  const timers = useRef<number[]>([]);
  const active = onPersona ? persona : localPersona;
  const copy = REQUIREMENT_COPY[clientId][active];
  const filled = Boolean(sources.document || sources.jira);
  const summary = summaryFor(active, sources, copy.filledSummary);

  function clearTimers() {
    timers.current.forEach((id) => window.clearTimeout(id));
    timers.current = [];
  }

  function later(fn: () => void, ms: number) {
    const id = window.setTimeout(fn, ms);
    timers.current.push(id);
  }

  useEffect(() => () => clearTimers(), []);

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

  function openJira() {
    clearTimers();
    setModal("jira");
    setJiraPhase("connecting");
    setJiraProgress(0);
    later(() => setJiraProgress(70), 60);
    later(() => setJiraPhase("authorising"), 700);
    later(() => {
      setJiraProgress(100);
      setJiraPhase("connected");
    }, 1400);
    later(() => {
      connectJira(clientId, active);
      setApplied(false);
      setModal(null);
    }, 1900);
  }

  function closeJira() {
    clearTimers();
    setModal(null);
  }

  function openUpload() {
    clearTimers();
    setChosen(null);
    setUploadStep(1);
    setParseIndex(0);
    setModal("upload");
  }

  function closeUpload() {
    clearTimers();
    setModal(null);
  }

  function selectFile(file: RecentFile) {
    setChosen(file);
  }

  function runParse(index: number, total: number) {
    if (index >= total) {
      setUploadStep(3);
      return;
    }
    setParseIndex(index);
    later(() => runParse(index + 1, total), 650);
  }

  function uploadNext() {
    if (uploadStep === 1 && chosen) {
      setUploadStep(2);
      setParseIndex(0);
      later(() => runParse(0, copy.document.uploadSteps.length), 40);
      return;
    }
    if (uploadStep === 3 && chosen) {
      attachDocument(clientId, active, chosen.name, chosen.meta);
      setApplied(false);
      closeUpload();
    }
  }

  function uploadBack() {
    clearTimers();
    setUploadStep(1);
    setChosen(null);
    setParseIndex(0);
  }

  function apply() {
    onApply?.(requirementText(clientId, active));
    setApplied(true);
  }

  const jiraStatus =
    jiraPhase === "connected" ? "Connected" : jiraPhase === "authorising" ? "Authorising…" : "Connecting to Atlassian…";
  const uploadLabel =
    uploadStep === 2 ? "Parsing…" : uploadStep === 3 ? "Add to requirements" : chosen ? "Parse document" : "Choose file first";

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
                  {kind === "document" ? <ExtractList extracts={source.extracts} /> : null}
                  <div className="rp-actions">
                    {kind === "document" ? (
                      <button className="rp-link" type="button" onClick={openUpload}>
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
            <button className="rp-add" type="button" onClick={openUpload}>
              <Icon name="plus" /> Add a document
            </button>
          ) : null}
          {sources.document && !sources.jira ? (
            <button className="rp-jira rp-jira-later" type="button" data-testid="requirements-jira" onClick={openJira}>
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
            <Icon name={active === "cio" ? "search" : "ticket"} />
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
                onUpload={openUpload}
                onJira={openJira}
              />
            ))}
          </div>
        </>
      )}

      {modal === "jira" ? (
        <div className="rp-modal" data-testid="jira-modal" onClick={(event) => event.target === event.currentTarget && closeJira()}>
          <div className="rp-modal-box" role="dialog" aria-modal="true" aria-label="Connect Jira">
            <div className="rp-modal-head">
              <div className="rp-modal-title">
                <span className="rp-jira-mark">J</span> Connect Jira
              </div>
              <button className="rp-modal-close" type="button" onClick={closeJira} aria-label="Close">
                ×
              </button>
            </div>
            <div className="rp-modal-body">
              <div className="rp-oauth">
                <Icon name="ticket" />
                <p>{jiraStatus}</p>
              </div>
              <div className="rp-bar">
                <span style={{ width: `${jiraProgress}%` }} />
              </div>
            </div>
            <div className="rp-modal-foot">
              <span className="rp-modal-sub">{copy.jira.host}</span>
            </div>
          </div>
        </div>
      ) : null}

      {modal === "upload" ? (
        <div className="rp-modal" data-testid="upload-modal" onClick={(event) => event.target === event.currentTarget && closeUpload()}>
          <div className="rp-modal-box" role="dialog" aria-modal="true" aria-label="Upload a document">
            <div className="rp-modal-head">
              <div className="rp-modal-title">
                <Icon name="upload" /> Upload a document
              </div>
              <button className="rp-modal-close" type="button" onClick={closeUpload} aria-label="Close">
                ×
              </button>
            </div>
            <div className="rp-modal-body">
              {uploadStep === 1 ? (
                <>
                  <button
                    className="rp-drop"
                    type="button"
                    onClick={() => selectFile(copy.document.recentFiles[0])}
                  >
                    <Icon name="cloud" />
                    <div className="rp-drop-label">Drop a file here or click to browse</div>
                    <div className="rp-drop-sub">PDF, PPTX, DOCX — up to 50 MB</div>
                  </button>
                  <p className="rp-modal-label">Or choose a recent file</p>
                  <div className="rp-file-list">
                    {copy.document.recentFiles.map((file) => (
                      <button
                        key={file.name}
                        className={chosen?.name === file.name ? "rp-file-row selected" : "rp-file-row"}
                        type="button"
                        onClick={() => selectFile(file)}
                      >
                        <Icon name="file" />
                        <span className="rp-fname">{file.name}</span>
                        <span className="rp-fmeta">{file.meta}</span>
                      </button>
                    ))}
                  </div>
                </>
              ) : null}
              {uploadStep === 2 ? (
                <div className="rp-parse">
                  {copy.document.uploadSteps.map((step, index) => {
                    const state = index < parseIndex ? "done" : index === parseIndex ? "active" : "";
                    return (
                      <div className={`rp-step ${state}`} key={step}>
                        <Icon name={index < parseIndex ? "check" : index === parseIndex ? "loader" : "circle"} />
                        <span>{step}</span>
                      </div>
                    );
                  })}
                </div>
              ) : null}
              {uploadStep === 3 && chosen ? (
                <>
                  <div className="rp-preview-file">
                    <div className="rp-icon doc">
                      <Icon name="file" />
                    </div>
                    <div>
                      <div className="rp-name">{chosen.name}</div>
                      <div className="rp-meta">
                        {chosen.meta} · {copy.document.extracts.length} items extracted
                      </div>
                    </div>
                    <span className="rp-badge ok">
                      <Icon name="check" /> Parsed
                    </span>
                  </div>
                  <p className="rp-modal-label">Extracted from document</p>
                  <ExtractList extracts={copy.document.extracts} bare />
                </>
              ) : null}
            </div>
            <div className="rp-modal-foot">
              <button
                className="rp-modal-back"
                type="button"
                style={{ visibility: uploadStep === 3 ? "visible" : "hidden" }}
                onClick={uploadBack}
              >
                ← Back
              </button>
              <button
                className="rp-modal-primary"
                type="button"
                data-testid="upload-next"
                disabled={uploadStep === 2 || (uploadStep === 1 && !chosen)}
                onClick={uploadNext}
              >
                {uploadLabel}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function ExtractList({ extracts, bare }: { extracts?: Extract[]; bare?: boolean }) {
  if (!extracts?.length) return null;
  return (
    <div className={bare ? "rp-extracts bare" : "rp-extracts"} data-testid="requirements-extracts">
      {extracts.map((item) => (
        <div className="rp-extract" key={item.text}>
          <span className={`rp-tag ${item.tag}`}>{EXTRACT_LABEL[item.tag]}</span>
          <span>{item.text}</span>
        </div>
      ))}
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
