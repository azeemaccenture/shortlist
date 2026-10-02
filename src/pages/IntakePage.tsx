import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AgencyLayout } from "../components/Layout";
import { CATALOG } from "../data/catalog";
import { formatWhen } from "../format";
import { nonEmptyLines, parsePriorityLine, parseUpload, type ParsedBrief } from "../intake/parseUpload";
import { SAMPLE_BRIEF, SAMPLE_FILE_NAME } from "../intake/sampleBrief";
import { VA_PROMPTS, VA_TURN_COUNT } from "../intake/vaScript";
import { briefError, intakeError, priorityError } from "../intake/validate";
import { useSession } from "../state/SessionProvider";
import type { Priority, Role } from "../types";
import { ROLE_LABELS, ROLES } from "../types";

const ROLE_COPY: Record<Role, string> = {
  cio: "Lens: platform risk, security, cost, and integration.",
  product_lead: "Lens: revenue, adoption, roadmap, and release bets.",
  ba: "Lens: process, requirements, workflow, and data.",
};

function BriefLists({
  goals,
  constraints,
  priorities,
}: {
  goals: string[];
  constraints: string[];
  priorities: Priority[];
}) {
  return (
    <div className="preview" data-testid="brief-preview">
      <div>
        <h3>Goals</h3>
        {goals.length === 0 ? <p className="muted">None yet</p> : <ul>{goals.map((goal) => <li key={goal}>{goal}</li>)}</ul>}
      </div>
      <div>
        <h3>Constraints</h3>
        {constraints.length === 0 ? (
          <p className="muted">None yet</p>
        ) : (
          <ul>{constraints.map((constraint) => <li key={constraint}>{constraint}</li>)}</ul>
        )}
      </div>
      <div>
        <h3>Priorities</h3>
        {priorities.length === 0 ? (
          <p className="muted">None yet</p>
        ) : (
          <ul>
            {priorities.map((priority, index) => (
              <li key={`${priority.label}-${index}`}>
                {priority.label || "(missing label)"} · {Number.isFinite(priority.weight) ? priority.weight : "—"}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export function IntakePage() {
  const navigate = useNavigate();
  const { context, saveContext } = useSession();
  const [role, setRole] = useState<Role | "">(context?.role ?? "");
  const [mode, setMode] = useState<"upload" | "va">("upload");
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState("");
  const [parsed, setParsed] = useState<ParsedBrief | null>(null);
  const [vaStep, setVaStep] = useState(0);
  const [vaDraft, setVaDraft] = useState("");
  const [vaGoals, setVaGoals] = useState<string[]>([]);
  const [vaConstraints, setVaConstraints] = useState<string[]>([]);
  const [vaPriorities, setVaPriorities] = useState<Priority[]>([]);

  function applyUpload(name: string, text: string) {
    const next = parseUpload(text);
    setFileName(name);
    setParsed(next);
    setError(briefError(next));
  }

  function onFile(file: File | undefined) {
    if (!file) return;
    const allowed = /\.(txt|md)$/i.test(file.name);
    if (!allowed) {
      setParsed(null);
      setFileName("");
      setError("Upload a .txt or .md brief.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      applyUpload(file.name, String(reader.result ?? ""));
    };
    reader.onerror = () => {
      setError("That file could not be read.");
    };
    reader.readAsText(file);
  }

  function confirmUpload() {
    if (!parsed || !fileName) {
      setError(role ? "Upload a brief or load the sample FY brief." : "Choose a role before continuing.");
      return;
    }
    const problem =
      briefError(parsed) ??
      intakeError({
        role,
        goals: parsed.goals,
        constraints: parsed.constraints,
        priorities: parsed.priorities,
        hasSource: true,
      });
    if (problem || !role) {
      setError(problem ?? "Choose a role before continuing.");
      return;
    }
    saveContext({
      role,
      goals: parsed.goals,
      constraints: parsed.constraints,
      priorities: parsed.priorities,
      sources: {
        upload: { fileName, parsedAt: new Date().toISOString() },
      },
    });
    navigate("/catalog");
  }

  function submitVaStep() {
    if (vaStep === 0) {
      const goals = nonEmptyLines(vaDraft);
      if (goals.length === 0) {
        setError("Add at least one goal.");
        return;
      }
      setVaGoals(goals);
      setVaStep(1);
      setVaDraft(vaConstraints.join("\n"));
      setError(null);
      return;
    }
    if (vaStep === 1) {
      const constraints = nonEmptyLines(vaDraft);
      if (constraints.length === 0) {
        setError("Add at least one constraint.");
        return;
      }
      setVaConstraints(constraints);
      setVaStep(2);
      setVaDraft(vaPriorities.map((priority) => `${priority.label} | ${priority.weight}`).join("\n"));
      setError(null);
      return;
    }
    const priorities = nonEmptyLines(vaDraft).map((line) => parsePriorityLine(line));
    const problem = priorityError(priorities);
    if (problem) {
      setError(problem);
      return;
    }
    setVaPriorities(priorities);
    setVaStep(3);
    setVaDraft("");
    setError(null);
  }

  function confirmVa() {
    const problem = intakeError({
      role,
      goals: vaGoals,
      constraints: vaConstraints,
      priorities: vaPriorities,
      hasSource: vaStep >= VA_TURN_COUNT,
    });
    if (problem || !role) {
      setError(problem ?? "Choose a role before continuing.");
      return;
    }
    saveContext({
      role,
      goals: vaGoals,
      constraints: vaConstraints,
      priorities: vaPriorities,
      sources: {
        va: { turns: VA_TURN_COUNT, confirmedAt: new Date().toISOString() },
      },
    });
    navigate("/catalog");
  }

  const prompt = VA_PROMPTS[vaStep];

  const activity = context
    ? [
        context.sources.upload
          ? {
              title: "Upload",
              body: context.sources.upload.fileName,
              when: formatWhen(context.sources.upload.parsedAt),
            }
          : null,
        context.sources.va
          ? {
              title: "Assistant",
              body: `${context.sources.va.turns} turns confirmed`,
              when: formatWhen(context.sources.va.confirmedAt),
            }
          : null,
        context.sources.jiraMock
          ? {
              title: "Jira mock",
              body: `${context.sources.jiraMock.bottlenecks.length} bottlenecks paired`,
              when: formatWhen(context.sources.jiraMock.syncedAt),
            }
          : null,
        context.sources.salesforceMock
          ? {
              title: "Salesforce mock",
              body: `${context.sources.salesforceMock.records.length} CRM records`,
              when: formatWhen(context.sources.salesforceMock.syncedAt),
            }
          : null,
      ].filter((item): item is { title: string; body: string; when: string } => item !== null)
    : [
        { title: "Intake", body: "Choose a role, then upload a brief or talk to the assistant.", when: "Start" },
        { title: "Catalog", body: `${CATALOG.length} Salesforce features. No live API.`, when: "Next" },
        { title: "Top 5", body: "Same context and catalog always rank the same way.", when: "Then" },
      ];

  return (
    <AgencyLayout>
      <section className="ac-hero">
        <p className="ac-hero-eye">FY planning</p>
        <h1>What should this shortlist decide?</h1>
        <p className="ac-hero-lead">
          Start as a CIO, Product Lead, or BA. Upload an FY brief or answer the assistant. Either path
          saves one session context.
        </p>
      </section>

      <main className="ac-body">
      {context ? (
        <p className="notice">A context is already saved for this session. Confirming again replaces it.</p>
      ) : null}

      <fieldset className="role-field">
        <legend className="ac-qa-label">Role</legend>
        <div className="ac-qa roles">
          {ROLES.map((option) => (
            <label key={option} className={role === option ? "ac-qa-card role-card is-on" : "ac-qa-card role-card"}>
              <input
                type="radio"
                name="role"
                value={option}
                checked={role === option}
                data-testid={`role-${option}`}
                onChange={() => {
                  setRole(option);
                  setError(null);
                }}
              />
              <span className="ac-qa-name">{ROLE_LABELS[option]}</span>
              <span className="ac-qa-desc">{ROLE_COPY[option]}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <p className="ac-qa-label">Quick access</p>
      <div className="ac-qa tabs" role="tablist" aria-label="Intake path">
        <button
          type="button"
          role="tab"
          aria-selected={mode === "upload"}
          className={mode === "upload" ? "ac-qa-card is-on" : "ac-qa-card"}
          onClick={() => {
            setMode("upload");
            setError(null);
          }}
        >
          <div className="ac-qa-top">
            <div className="ac-qa-icon" aria-hidden="true">↑</div>
            {mode === "upload" ? <span className="ac-live">Selected</span> : null}
          </div>
          <div>
            <div className="ac-qa-name">Upload a brief</div>
            <div className="ac-qa-tag">Goal, constraint, and priority lines</div>
          </div>
          <p className="ac-qa-desc">Parse a .txt or .md FY brief, or load the sample, into this session.</p>
          <span className="ac-open">Open <span className="arr">→</span></span>
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === "va"}
          className={mode === "va" ? "ac-qa-card is-on" : "ac-qa-card"}
          onClick={() => {
            setMode("va");
            setError(null);
          }}
        >
          <div className="ac-qa-top">
            <div className="ac-qa-icon" aria-hidden="true">◈</div>
            {mode === "va" ? <span className="ac-live">Selected</span> : null}
          </div>
          <div>
            <div className="ac-qa-name">Assistant</div>
            <div className="ac-qa-tag">Three prompts, same context</div>
          </div>
          <p className="ac-qa-desc">Answer goals, constraints, and weighted priorities without a file.</p>
          <span className="ac-open">Open <span className="arr">→</span></span>
        </button>
        <div className="ac-qa-card pipe">
          <div className="ac-qa-icon">+</div>
          <div>
            <div className="ac-qa-name" style={{ fontSize: 18 }}>Either path</div>
            <div className="ac-qa-tag">One path is enough to continue</div>
          </div>
        </div>
      </div>

      {error ? (
        <p className="banner" role="alert" data-testid="intake-error">
          {error}
        </p>
      ) : null}

      {mode === "upload" ? (
        <form
          className="ac-panel"
          onSubmit={(event) => {
            event.preventDefault();
            confirmUpload();
          }}
        >
          <p className="muted">
            Use lines that start with <code>Goal:</code>, <code>Constraint:</code>, and{" "}
            <code>Priority: label | weight</code>.
          </p>
          <div className="ac-actions">
            <label className="file-button">
              Choose .txt or .md
              <input
                type="file"
                accept=".txt,.md,text/plain,text/markdown"
                data-testid="brief-file"
                onChange={(event) => onFile(event.target.files?.[0])}
              />
            </label>
            <button
              type="button"
              className="ac-ghost"
              data-testid="load-sample"
              onClick={() => applyUpload(SAMPLE_FILE_NAME, SAMPLE_BRIEF)}
            >
              Load sample FY brief
            </button>
          </div>
          {fileName ? <p className="file-name">File: {fileName}</p> : null}
          {parsed ? (
            <BriefLists goals={parsed.goals} constraints={parsed.constraints} priorities={parsed.priorities} />
          ) : null}
          <button type="submit" className="ac-primary" data-testid="save-context">
            Save context
          </button>
        </form>
      ) : (
        <div className="ac-panel">
          <ol className="turns">
            {vaGoals.length > 0 ? (
              <li>
                <span className="turn-label">Goals</span> {vaGoals.join(" · ")}
              </li>
            ) : null}
            {vaConstraints.length > 0 ? (
              <li>
                <span className="turn-label">Constraints</span> {vaConstraints.join(" · ")}
              </li>
            ) : null}
            {vaPriorities.length > 0 && vaStep === 3 ? (
              <li>
                <span className="turn-label">Priorities</span>{" "}
                {vaPriorities.map((priority) => `${priority.label} (${priority.weight})`).join(" · ")}
              </li>
            ) : null}
          </ol>

          {prompt ? (
            <form
              onSubmit={(event) => {
                event.preventDefault();
                submitVaStep();
              }}
            >
              <label className="stack" htmlFor="va-draft">
                <span>
                  Turn {vaStep + 1} of {VA_TURN_COUNT}. {prompt.prompt}
                </span>
                <textarea
                  id="va-draft"
                  data-testid="va-input"
                  rows={5}
                  value={vaDraft}
                  placeholder={prompt.hint}
                  onChange={(event) => setVaDraft(event.target.value)}
                />
              </label>
              <button type="submit" className="ac-primary" data-testid="va-continue">
                Continue
              </button>
            </form>
          ) : (
            <form
              onSubmit={(event) => {
                event.preventDefault();
                confirmVa();
              }}
            >
              <BriefLists goals={vaGoals} constraints={vaConstraints} priorities={vaPriorities} />
              <div className="ac-actions">
                <button
                  type="button"
                  className="ac-ghost"
                  onClick={() => {
                    setVaStep(2);
                    setVaDraft(
                      vaPriorities.map((priority) => `${priority.label} | ${priority.weight}`).join("\n"),
                    );
                    setError(null);
                  }}
                >
                  Edit priorities
                </button>
                <button type="submit" className="ac-primary" data-testid="save-context">
                  Save context
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      <div className="ac-strip" aria-label="Session snapshot">
        <p className="ac-strip-label">This session</p>
        <div className="ac-film">
          <div className="ac-film-cell"><div className="ac-film-n">{CATALOG.length}</div><div className="ac-film-l">Features</div></div>
          <div className="ac-film-cell"><div className="ac-film-n">{mode === "upload" ? (parsed?.goals.length || context?.goals.length || "—") : (vaGoals.length || context?.goals.length || "—")}</div><div className="ac-film-l">Goals</div></div>
          <div className="ac-film-cell"><div className="ac-film-n">{mode === "upload" ? (parsed?.priorities.length || context?.priorities.length || "3–5") : (vaPriorities.length || context?.priorities.length || "3–5")}</div><div className="ac-film-l">Priorities</div></div>
          <div className="ac-film-cell"><div className="ac-film-n">{role ? ROLE_LABELS[role] : "—"}</div><div className="ac-film-l">Role</div></div>
          <div className="ac-film-cell"><div className="ac-film-n">5</div><div className="ac-film-l">Top picks</div></div>
        </div>
      </div>

      <p className="ac-act-label">Recent activity</p>
      <ul className="ac-act">
        {activity.map((item) => (
          <li key={`${item.title}-${item.when}`}>
            <div><strong>{item.title}</strong> — {item.body}</div>
            <time>{item.when}</time>
          </li>
        ))}
      </ul>
      </main>
    </AgencyLayout>
  );
}
