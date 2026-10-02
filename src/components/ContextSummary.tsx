import { formatWhen } from "../format";
import type { ShortlistContext } from "../types";
import { ROLE_LABELS } from "../types";

export function ContextSummary({ context }: { context: ShortlistContext }) {
  const { upload, va, jiraMock, salesforceMock } = context.sources;

  return (
    <section className="summary" data-testid="context-summary" aria-label="Saved context">
      <div className="summary-head">
        <p className="kicker">Saved context</p>
        <h2>{ROLE_LABELS[context.role]}</h2>
      </div>
      <div className="summary-grid">
        <div>
          <h3>Goals</h3>
          <ul>
            {context.goals.map((goal) => (
              <li key={goal}>{goal}</li>
            ))}
          </ul>
        </div>
        <div>
          <h3>Constraints</h3>
          <ul>
            {context.constraints.map((constraint) => (
              <li key={constraint}>{constraint}</li>
            ))}
          </ul>
        </div>
        <div>
          <h3>Priorities</h3>
          <ul>
            {context.priorities.map((priority) => (
              <li key={priority.label}>
                {priority.label} <span className="weight">weight {priority.weight}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <ul className="source-row">
        {upload ? (
          <li>
            Upload {upload.fileName} · {formatWhen(upload.parsedAt)}
          </li>
        ) : null}
        {va ? (
          <li>
            Assistant · {va.turns} turns · {formatWhen(va.confirmedAt)}
          </li>
        ) : null}
        {jiraMock ? <li>Jira mock · {formatWhen(jiraMock.syncedAt)}</li> : null}
        {salesforceMock ? <li>Salesforce mock · {formatWhen(salesforceMock.syncedAt)}</li> : null}
      </ul>
    </section>
  );
}
