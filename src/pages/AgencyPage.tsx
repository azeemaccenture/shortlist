import { Link } from "react-router-dom";
import { CATALOG } from "../data/catalog";
import { CLIENT_PREVIEWS, CLIENTS, type ClientId } from "../data/clients";
import { RELEASE_DROP, portfolioStats } from "../data/releaseNotes";
import { formatScore } from "../format";
import { clientHref } from "../portal/useClient";
import { rankTop } from "../scoring/rank";
import { ROLE_LABELS } from "../types";

function clientRank(clientId: ClientId) {
  return rankTop(CLIENT_PREVIEWS[clientId], CATALOG);
}

export function AgencyPage() {
  const stats = portfolioStats();
  const aether = clientRank("aether");
  const hexworth = clientRank("hexworth");
  const aetherTop = aether[0];
  const hexworthTop = hexworth[0];

  return (
    <div className="world world-accenture" role="region" aria-label="Accenture Song agency portfolio" data-testid="agency-home">
      <header className="ac-bar">
        <Link className="ac-mark" to="/">
          <span className="chev">&gt;</span>PulseNotes
        </Link>
        <nav className="ac-nav" aria-label="Agency">
          <span className="is-on">Portfolio</span>
          <span>Briefings</span>
          <span>Insights</span>
        </nav>
        <div className="ac-bar-end">RG</div>
      </header>

      <section className="ac-hero">
        <p className="ac-hero-eye">Accenture Song</p>
        <h1>Welcome back. Your clients are ready.</h1>
        <p className="ac-hero-lead">
          {RELEASE_DROP.label} release {RELEASE_DROP.release} across the portfolio. Open a client environment and
          step into their world.
        </p>
      </section>

      <main className="ac-body">
        <p className="ac-qa-label">Quick access</p>
        <div className="ac-qa">
          <Link className="ac-qa-card" to={clientHref("aether")}>
            <div className="ac-qa-top">
              <div className="ac-qa-icon" aria-hidden="true">
                ▦
              </div>
              <span className="ac-live">Live</span>
            </div>
            <div>
              <div className="ac-qa-name">{CLIENTS.aether.name}</div>
              <div className="ac-qa-tag">{CLIENTS.aether.tag}</div>
            </div>
            <p className="ac-qa-desc">{CLIENTS.aether.description}</p>
            <div className="ac-qa-meta">
              <span>
                <strong>{RELEASE_DROP.clients.aether.length}</strong> notes
              </span>
              <span>
                <strong>{aetherTop ? `${Math.round(aetherTop.score)}%` : "—"}</strong> top feature
              </span>
            </div>
            <span className="ac-open">
              Open <span className="arr">→</span>
            </span>
          </Link>

          <Link className="ac-qa-card" to={clientHref("hexworth")}>
            <div className="ac-qa-top">
              <div className="ac-qa-icon" aria-hidden="true">
                ◆
              </div>
              <span className="ac-live">Live</span>
            </div>
            <div>
              <div className="ac-qa-name">{CLIENTS.hexworth.name}</div>
              <div className="ac-qa-tag">{CLIENTS.hexworth.tag}</div>
            </div>
            <p className="ac-qa-desc">{CLIENTS.hexworth.description}</p>
            <div className="ac-qa-meta">
              <span>
                <strong>{RELEASE_DROP.clients.hexworth.length}</strong> notes
              </span>
              <span>
                <strong>{hexworthTop ? `${Math.round(hexworthTop.score)}%` : "—"}</strong> top feature
              </span>
            </div>
            <span className="ac-open">
              Open <span className="arr">→</span>
            </span>
          </Link>
        </div>

        <div className="ac-strip" aria-label="Deliverables overview">
          <p className="ac-strip-label">
            Deliverables · {RELEASE_DROP.label} release {RELEASE_DROP.release}
          </p>
          <div className="ac-film">
            <div className="ac-film-cell">
              <div className="ac-film-n">{stats.notes}</div>
              <div className="ac-film-l">Salient changes</div>
            </div>
            <div className="ac-film-cell">
              <div className="ac-film-n">{stats.long}</div>
              <div className="ac-film-l">Long-term</div>
            </div>
            <div className="ac-film-cell">
              <div className="ac-film-n">{stats.quarter}</div>
              <div className="ac-film-l">Quarter</div>
            </div>
            <div className="ac-film-cell">
              <div className="ac-film-n">{stats.daily}</div>
              <div className="ac-film-l">Day-to-day</div>
            </div>
            <div className="ac-film-cell">
              <div className="ac-film-n">{stats.clients}</div>
              <div className="ac-film-l">Live clients</div>
            </div>
          </div>
        </div>

        <p className="ac-act-label">General release headlines</p>
        <ul className="ac-act" data-testid="release-headlines">
          {RELEASE_DROP.headlines.map((item) => (
            <li key={item.id}>
              <div>
                <strong>{item.headline}</strong> — {item.salient}
              </div>
              <time>{RELEASE_DROP.label}</time>
            </li>
          ))}
        </ul>

        <section className="agency-ranks" aria-label="Per-client features">
          <ClientRank clientId="aether" rows={aether.slice(0, 3)} />
          <ClientRank clientId="hexworth" rows={hexworth.slice(0, 3)} />
        </section>
      </main>

      <footer className="ac-foot">
        <strong>PulseNotes</strong> · Hackathon prototype · Fictional client brands · Accenture Song agency shell only
      </footer>
    </div>
  );
}

function ClientRank({
  clientId,
  rows,
}: {
  clientId: ClientId;
  rows: ReturnType<typeof clientRank>;
}) {
  const client = CLIENTS[clientId];
  const lens = CLIENT_PREVIEWS[clientId];
  return (
    <div className="agency-rank">
      <div className="agency-rank-head">
        <h2>{client.name}</h2>
        <p>
          Most relevant · {ROLE_LABELS[lens.role]} lens
        </p>
      </div>
      <ol>
        {rows.map((row) => (
          <li key={row.item.id}>
            <span>{row.item.name}</span>
            <strong>{formatScore(row.score)}</strong>
            <p>{row.item.summary}</p>
          </li>
        ))}
      </ol>
      <Link className="ac-open" to={clientHref(clientId)}>
        Open portal <span className="arr">→</span>
      </Link>
    </div>
  );
}
