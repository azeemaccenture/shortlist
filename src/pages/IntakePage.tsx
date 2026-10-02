import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { ClientShell } from "../components/ClientShell";
import { RailButton, ScoreHeader, WorkLayout, actionClass, useHex } from "../components/worldUi";
import { CATALOG } from "../data/catalog";
import { formatWhen } from "../format";
import { nonEmptyLines, parsePriorityLine, parseUpload, type ParsedBrief } from "../intake/parseUpload";
import { SAMPLE_BRIEF, SAMPLE_FILE_NAME } from "../intake/sampleBrief";
import { VA_PROMPTS, VA_TURN_COUNT } from "../intake/vaScript";
import { briefError, intakeError, priorityError } from "../intake/validate";
import { useClient } from "../portal/useClient";
import { useSession } from "../state/SessionProvider";
import type { Priority, Role } from "../types";
import { ROLE_LABELS, ROLES } from "../types";

const ROLE_COPY: Record<Role, string> = {
  cio: "Ops weights: change load, feasibility, and evidence.",
  product_lead: "Sales weights: strategic fit, evidence, and demand.",
  ba: "Consolidated weights across the shared and Ops profiles.",
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
  const client = useClient();
  const { context, saveContext, pendingRole, setPendingRole, setRole: setSessionRole } = useSession();
  const [role, setRole] = useState<Role | "">(context?.role ?? pendingRole ?? "");
  const [mode, setMode] = useState<"upload" | "va">("upload");
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState("");
  const [parsed, setParsed] = useState<ParsedBrief | null>(null);
  const [vaStep, setVaStep] = useState(0);
  const [vaDraft, setVaDraft] = useState("");
  const [vaGoals, setVaGoals] = useState<string[]>([]);
  const [vaConstraints, setVaConstraints] = useState<string[]>([]);
  const [vaPriorities, setVaPriorities] = useState<Priority[]>([]);

  useEffect(() => {
    if (context?.role) setRole(context.role);
    else if (pendingRole) setRole(pendingRole);
  }, [context?.role, pendingRole]);

  function chooseRole(option: Role) {
    setRole(option);
    setPendingRole(option);
    if (context) setSessionRole(option);
    setError(null);
  }

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
    navigate(client ? `/clients/${client.id}/catalog` : "/");
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
    navigate(client ? `/clients/${client.id}/catalog` : "/");
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

  const hex = useHex();
  const primary = actionClass(hex, "primary");
  const ghost = actionClass(hex, "ghost");
  if (!client) return <Navigate to="/" replace />;

  return (
    <ClientShell>
      <ScoreHeader
        eyebrow="FY planning"
        title="What should this shortlist decide?"
        lede="Start as a CIO, Product Lead, or BA. Upload an FY brief or answer the assistant. Either path saves one session context."
        stats={[
          { n: CATALOG.length, l: "Features" },
          {
            n: mode === "upload" ? parsed?.goals.length || context?.goals.length || "—" : vaGoals.length || context?.goals.length || "—",
            l: "Goals",
          },
          {
            n:
              mode === "upload"
                ? parsed?.priorities.length || context?.priorities.length || "3–5"
                : vaPriorities.length || context?.priorities.length || "3–5",
            l: "Priorities",
          },
          { n: role ? ROLE_LABELS[role] : "—", l: "Role" },
        ]}
      />
      <WorkLayout
        label="Path"
        rail={
          <>
            <RailButton
              role="tab"
              active={mode === "upload"}
              label="Upload a brief"
              onClick={() => {
                setMode("upload");
                setError(null);
              }}
            />
            <RailButton
              role="tab"
              active={mode === "va"}
              label="Assistant"
              onClick={() => {
                setMode("va");
                setError(null);
              }}
            />
          </>
        }
      >
        {context ? (
          <p className="notice">A context is already saved for this session. Confirming again replaces it.</p>
        ) : null}

        <fieldset className="role-field">
          <legend>Role</legend>
          <div className={hex ? "hx-persona-pills intake-roles" : "intake-roles"} role="radiogroup" aria-label="Role">
            {ROLES.map((option) => (
              <label
                key={option}
                className={`choice ${hex ? "hx-persona-pill" : "ae-persona-tab"}${role === option ? " active" : ""}`}
              >
                <input
                  type="radio"
                  name="role"
                  value={option}
                  checked={role === option}
                  data-testid={`role-${option}`}
                  onChange={() => chooseRole(option)}
                />
                {ROLE_LABELS[option]}
                <span className="sr-only">. {ROLE_COPY[option]}</span>
              </label>
            ))}
          </div>
        </fieldset>

        {error ? (
          <p className="banner" role="alert" data-testid="intake-error">
            {error}
          </p>
        ) : null}

        {mode === "upload" ? (
          <form
            onSubmit={(event) => {
              event.preventDefault();
              confirmUpload();
            }}
          >
            <p className="hint">
              Use lines that start with <code>Goal:</code>, <code>Constraint:</code>, and{" "}
              <code>Priority: label | weight</code>.
            </p>
            <div className="product-actions">
              <label className={`file-button ${ghost}`}>
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
                className={ghost}
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
            <button type="submit" className={primary} data-testid="save-context">
              Save context
            </button>
          </form>
        ) : (
          <div>
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
                    className="brief-input"
                    data-testid="va-input"
                    rows={5}
                    value={vaDraft}
                    placeholder={prompt.hint}
                    onChange={(event) => setVaDraft(event.target.value)}
                  />
                </label>
                <button type="submit" className={primary} data-testid="va-continue">
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
                <div className="product-actions">
                  <button
                    type="button"
                    className={ghost}
                    onClick={() => {
                      setVaStep(2);
                      setVaDraft(vaPriorities.map((priority) => `${priority.label} | ${priority.weight}`).join("\n"));
                      setError(null);
                    }}
                  >
                    Edit priorities
                  </button>
                  <button type="submit" className={primary} data-testid="save-context">
                    Save context
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        <ul className="activity">
          {activity.map((item) => (
            <li key={`${item.title}-${item.when}`}>
              <div>
                <strong>{item.title}</strong> — {item.body}
              </div>
              <time>{item.when}</time>
            </li>
          ))}
        </ul>
      </WorkLayout>
    </ClientShell>
  );
}
