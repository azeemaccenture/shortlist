import { useMemo, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { ClientShell } from "../components/ClientShell";
import { CATALOG } from "../data/catalog";
import { CLIENT_PREVIEWS, type ClientId } from "../data/clients";
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
import { useSession } from "../state/SessionProvider";
import { ROLE_LABELS, type ShortlistContext } from "../types";

type Filter = Horizon | "all";

function scoringContext(clientId: ClientId, saved: ShortlistContext | null, pendingRole: ShortlistContext["role"] | null) {
  if (saved) return saved;
  const preview = CLIENT_PREVIEWS[clientId];
  if (pendingRole) return { ...preview, role: pendingRole };
  return preview;
}

function useFeed(clientId: ClientId) {
  const notes = clientNotes(clientId);
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);
  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return notes
      .filter((note) => (filter === "all" ? true : note.horizon === filter))
      .filter((note) => {
        if (!needle) return true;
        return `${note.headline} ${note.salient} ${note.version}`.toLowerCase().includes(needle);
      })
      .slice()
      .sort((left, right) => right.match - left.match);
  }, [notes, filter, query]);
  return { notes, visible, filter, setFilter, query, setQuery, openId, setOpenId };
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
    </section>
  );
}

function AetherOverview({ clientId }: { clientId: ClientId }) {
  const feed = useFeed(clientId);
  const lead = feed.notes[0];
  return (
    <>
      <section className="ae-data" aria-label="Release overview">
        <div className="ae-data-in">
          <div className="ae-data-lead">
            <h1>
              {RELEASE_DROP.label} · release {RELEASE_DROP.release}
            </h1>
            <p>
              {lead.salient} Ordered for Aether network priorities — long-term platforms, quarter deliveries,
              day-to-day operations.
            </p>
          </div>
          <div className="ae-stat">
            <div className="n">{feed.notes.length}</div>
            <div className="l">Salient changes</div>
          </div>
          <div className="ae-stat">
            <div className="n">
              {feed.notes[0] ? Math.max(...feed.notes.map((note) => note.match)) : "—"}
              <em>%</em>
            </div>
            <div className="l">Top match</div>
          </div>
          <div className="ae-stat">
            <div className="n">Q3</div>
            <div className="l">Focus window</div>
          </div>
          <div className="ae-stat">
            <div className="n">3</div>
            <div className="l">Horizons</div>
          </div>
        </div>
      </section>
      <div className="ae-main">
        <FilterRail
          clientId={clientId}
          filter={feed.filter}
          onFilter={(next) => {
            feed.setFilter(next);
            feed.setOpenId(null);
          }}
          variant="aether"
        />
        <div>
          <FeedHead
            title={feed.filter === "all" ? "Client-salient changes" : HORIZON_LABEL[feed.filter]}
            query={feed.query}
            onQuery={(value) => {
              feed.setQuery(value);
              feed.setOpenId(null);
            }}
            variant="aether"
          />
          {feed.visible.length === 0 ? (
            <div className="ae-empty is-visible">
              <p>
                <strong>No notes match</strong>
              </p>
              <p>Try another horizon or clear your search.</p>
            </div>
          ) : (
            <div className="ae-list" data-testid="salient-list">
              {feed.visible.map((note) => (
                <AetherNote
                  key={note.id}
                  note={note}
                  open={feed.openId === note.id}
                  onToggle={() => feed.setOpenId(feed.openId === note.id ? null : note.id)}
                />
              ))}
            </div>
          )}
          <RelevantFeatures clientId={clientId} />
        </div>
      </div>
    </>
  );
}

function HexworthOverview({ clientId }: { clientId: ClientId }) {
  const feed = useFeed(clientId);
  const lead = feed.notes.find((note) => note.horizon === "quarter") ?? feed.notes[0];
  return (
    <>
      <section className="hx-hero">
        <div className="hx-hero-in">
          <div>
            <p className="hx-hero-eye">
              {RELEASE_DROP.label} · release {RELEASE_DROP.release}
            </p>
            <h1>{lead.headline}</h1>
            <p>{lead.salient}</p>
            <button
              className="hx-hero-cta"
              type="button"
              onClick={() => {
                feed.setFilter("quarter");
                feed.setOpenId(lead.id);
              }}
            >
              View Quarter releases →
            </button>
          </div>
          <aside className="hx-hero-fig">
            <div className="big">{lead.match}%</div>
            <div className="lbl">Match score</div>
          </aside>
        </div>
      </section>
      <div className="hx-main">
        <FilterRail
          clientId={clientId}
          filter={feed.filter}
          onFilter={(next) => {
            feed.setFilter(next);
            feed.setOpenId(null);
          }}
          variant="hexworth"
        />
        <div>
          <FeedHead
            title={feed.filter === "all" ? "Client-salient changes" : HORIZON_LABEL[feed.filter]}
            query={feed.query}
            onQuery={(value) => {
              feed.setQuery(value);
              feed.setOpenId(null);
            }}
            variant="hexworth"
          />
          {feed.visible.length === 0 ? (
            <div className="hx-empty is-visible">No notes match this filter.</div>
          ) : (
            <div className="hx-list" data-testid="salient-list">
              {feed.visible.map((note) => (
                <HexworthNote
                  key={note.id}
                  note={note}
                  open={feed.openId === note.id}
                  onToggle={() => feed.setOpenId(feed.openId === note.id ? null : note.id)}
                />
              ))}
            </div>
          )}
          <RelevantFeatures clientId={clientId} />
        </div>
      </div>
    </>
  );
}

function FilterRail({
  clientId,
  filter,
  onFilter,
  variant,
}: {
  clientId: ClientId;
  filter: Filter;
  onFilter: (next: Filter) => void;
  variant: "aether" | "hexworth";
}) {
  const items: { id: Filter; label: string; count: string }[] = [
    { id: "all", label: variant === "aether" ? "All releases" : "All", count: String(clientNotes(clientId).length) },
    { id: "long", label: "Long-term", count: String(horizonCount(clientId, "long")) },
    { id: "quarter", label: "Quarter", count: String(horizonCount(clientId, "quarter")) },
    { id: "daily", label: "Day-to-day", count: String(horizonCount(clientId, "daily")) },
  ];
  if (variant === "hexworth") {
    return (
      <nav className="hx-rail" aria-label="Horizon">
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            className={filter === item.id ? "is-on" : undefined}
            onClick={() => onFilter(item.id)}
          >
            {item.label}
            <small>{item.id === "all" ? `${item.count} notes` : item.count}</small>
          </button>
        ))}
      </nav>
    );
  }
  return (
    <nav className="ae-filters" aria-label="Horizon">
      <p className="ae-filters-label">Horizon</p>
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          className={filter === item.id ? "is-on" : undefined}
          onClick={() => onFilter(item.id)}
        >
          {item.label} <span className="cnt">{item.count}</span>
        </button>
      ))}
    </nav>
  );
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M10.5 10.5L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function FeedHead({
  title,
  query,
  onQuery,
  variant,
}: {
  title: string;
  query: string;
  onQuery: (value: string) => void;
  variant: "aether" | "hexworth";
}) {
  const field = (
    <label className={variant === "aether" ? "ae-search" : "hx-search"}>
      <SearchIcon />
      <input
        type="search"
        value={query}
        placeholder="Search notes…"
        onChange={(event) => onQuery(event.target.value)}
      />
    </label>
  );
  if (variant === "hexworth") {
    return (
      <div className="hx-head">
        <h2>{title}</h2>
        {field}
      </div>
    );
  }
  return (
    <div className="ae-feed-head">
      <h2>{title}</h2>
      {field}
    </div>
  );
}

function AetherNote({ note, open, onToggle }: { note: SalientChange; open: boolean; onToggle: () => void }) {
  return (
    <>
      <button className={open ? "ae-row is-open" : "ae-row"} type="button" onClick={onToggle}>
        <div className={`ae-row-tier ${note.horizon}`}>{HORIZON_LABEL[note.horizon]}</div>
        <div className="ae-row-main">
          <h3>{note.headline}</h3>
          <p>{note.salient}</p>
          <div className="ae-row-meta">
            <span>{note.date}</span>
            <span className="ver">{note.version}</span>
          </div>
        </div>
        <div className="ae-row-score">
          <strong>{note.match}</strong>
          <span>Match</span>
        </div>
      </button>
      {open ? (
        <div className="ae-expand is-visible">
          <div className="ae-expand-grid">
            <div>
              <h4>Salient change</h4>
              <p>{note.salient}</p>
            </div>
            <div>
              <h4>Release</h4>
              <p>
                {RELEASE_DROP.label} · {note.version} · mock scrape
              </p>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

function HexworthNote({ note, open, onToggle }: { note: SalientChange; open: boolean; onToggle: () => void }) {
  return (
    <>
      <button className={open ? "hx-row is-open" : "hx-row"} type="button" onClick={onToggle}>
        <div className={`hx-row-tier ${note.horizon}`}>{HORIZON_LABEL[note.horizon]}</div>
        <div className="hx-row-main">
          <h3>{note.headline}</h3>
          <p>{note.salient}</p>
          <div className="hx-row-meta">
            <span>{note.date}</span>
            <span className="ver">{note.version}</span>
          </div>
        </div>
        <div className="hx-row-score">
          <strong>{note.match}%</strong>
          <span>Match</span>
        </div>
      </button>
      {open ? (
        <div className="hx-expand is-visible">
          <div className="hx-expand-grid">
            <div>
              <h4>Salient change</h4>
              <p>{note.salient}</p>
            </div>
            <div>
              <h4>Release</h4>
              <p>
                {RELEASE_DROP.label} · {note.version} · mock scrape
              </p>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

export function PortalHome() {
  const client = useClient();
  if (!client) return <Navigate to="/" replace />;
  return (
    <ClientShell>
      <div data-testid="portal-home">
        {client.id === "hexworth" ? (
          <HexworthOverview clientId={client.id} />
        ) : (
          <AetherOverview clientId={client.id} />
        )}
      </div>
    </ClientShell>
  );
}
