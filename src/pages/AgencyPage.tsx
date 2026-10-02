import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { RequirementsPanel } from "../components/RequirementsPanel";
import { ShortlistLogo } from "../components/ShortlistLogo";
import { CLIENTS, type ClientId } from "../data/clients";
import {
  MOCK_SENTIMENT,
  MOCK_TRENDS,
  type UpdateCard,
} from "../data/intelMock";
import {
  SALESFORCE_FETCH_STEPS,
  SALESFORCE_RELEASE_NOTES,
  SALESFORCE_SEED_HEADLINES,
  SALESFORCE_SHIPPED,
} from "../data/salesforceReleaseNotes";
import { salesforceNoteCount } from "../data/salesforceClientNotes";
import { clientHref } from "../portal/useClient";

const CLIENT_ORDER: ClientId[] = ["aether", "hexworth"];

const CARD_COPY: Record<ClientId, { description: string; pills: string[] }> = {
  aether: {
    description:
      "Network intelligence platform. Multi-year 5G orchestration, network operations console modernisation, and open API readiness.",
    pills: ["5G Orchestration", "Network Ops", "Open API"],
  },
  hexworth: {
    description:
      "Streaming and media platform. Subscriber identity, content entitlements API, and partner hub reliability for Q3 growth targets.",
    pills: ["Streaming API", "Entitlements", "Partner Hub"],
  },
};

function seedHeadlines(): UpdateCard[] {
  return SALESFORCE_SEED_HEADLINES;
}

export function AgencyPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<"update" | "trends" | "sentiment">("update");
  const [cards, setCards] = useState<UpdateCard[]>(() => seedHeadlines());
  const [fetching, setFetching] = useState(false);
  const [fetchStep, setFetchStep] = useState(0);
  const [trends, setTrends] = useState<typeof MOCK_TRENDS | null>(null);
  const [trendsBusy, setTrendsBusy] = useState(false);
  const [sentiment, setSentiment] = useState<typeof MOCK_SENTIMENT | null>(null);
  const [sentimentBusy, setSentimentBusy] = useState(false);
  const [query, setQuery] = useState("release notes software product management");
  const [sentimentMeta, setSentimentMeta] = useState("Not yet fetched");
  const [openReq, setOpenReq] = useState<ClientId | null>(null);
  const timers = useRef<number[]>([]);

  useEffect(() => {
    return () => {
      timers.current.forEach((id) => window.clearTimeout(id));
    };
  }, []);

  function later(fn: () => void, ms: number) {
    const id = window.setTimeout(fn, ms);
    timers.current.push(id);
  }

  function fetchNotes() {
    if (fetching) return;
    setTab("update");
    setFetching(true);
    setFetchStep(0);
    SALESFORCE_FETCH_STEPS.forEach((_, index) => {
      later(() => setFetchStep(index), index * 280);
    });
    later(() => {
      setCards(SALESFORCE_SHIPPED);
      setFetching(false);
    }, SALESFORCE_FETCH_STEPS.length * 280);
  }

  function fetchTrends() {
    setTrendsBusy(true);
    later(() => {
      setTrends(MOCK_TRENDS);
      setTrendsBusy(false);
    }, 400);
  }

  function fetchSentiment() {
    setSentimentBusy(true);
    later(() => {
      setSentiment(MOCK_SENTIMENT);
      const now = new Date();
      const stamp = now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
      setSentimentMeta(`"${query.slice(0, 24)}…" · ${stamp}`);
      setSentimentBusy(false);
    }, 400);
  }

  return (
    <div
      id="screen-agency"
      className="screen active"
      role="region"
      aria-label="Accenture Song agency portfolio"
      data-testid="agency-home"
    >
      <header className="ag-topbar">
        <div className="ag-topbar-in">
          <Link className="ag-wordmark" to="/" aria-label="Shortlist">
            <ShortlistLogo animate />
          </Link>
          <div className="ag-spacer" />
          <a
            className="ag-source"
            href={SALESFORCE_RELEASE_NOTES.sourceUrl}
            target="_blank"
            rel="noreferrer"
            aria-label={`Release notes source: ${SALESFORCE_RELEASE_NOTES.label}, release ${SALESFORCE_RELEASE_NOTES.release}`}
            title={SALESFORCE_RELEASE_NOTES.sourceUrl}
            data-testid="release-source"
          >
            <span className="ag-source-dot" aria-hidden="true" />
            Source · {SALESFORCE_RELEASE_NOTES.releaseLabel} · release {SALESFORCE_RELEASE_NOTES.release}
          </a>
          <button className={fetching ? "ag-scrape-btn fetching" : "ag-scrape-btn"} type="button" onClick={fetchNotes}>
            <span className="spin">↻</span> <span>{fetching ? "Fetching…" : "Fetch latest notes"}</span>
          </button>
          <div className="ag-avatar">RG</div>
        </div>
      </header>

      <section className="ag-hero">
        <p className="ag-hero-label">Agency view · Oct 2026</p>
        <h1>What shipped. What it means.</h1>
        <p className="ag-hero-sub">
          Release notes filtered and ranked by what matters to each client relationship. Start with the headlines, then
          go deep where it counts.
        </p>
      </section>

      <main className="ag-body" id="agMain">
        <div className="ag-intel" id="release-intel">
          <div className="ag-intel-tabs">
            <button
              className={tab === "update" ? "ag-intel-tab active" : "ag-intel-tab"}
              type="button"
              onClick={() => setTab("update")}
            >
              What shipped
            </button>
            <button
              className={tab === "trends" ? "ag-intel-tab active" : "ag-intel-tab"}
              type="button"
              onClick={() => setTab("trends")}
            >
              Industry trends
            </button>
            <button
              className={tab === "sentiment" ? "ag-intel-tab active" : "ag-intel-tab"}
              type="button"
              onClick={() => setTab("sentiment")}
            >
              X.com sentiment
            </button>
            <div className="ag-intel-tab-spacer" />
            <div className="ag-intel-tab-action">
              {tab === "trends" ? (
                <button className="ag-intel-action-btn" type="button" disabled={trendsBusy} onClick={fetchTrends}>
                  <span>↻</span> Fetch trends
                </button>
              ) : null}
              {tab === "sentiment" ? (
                <>
                  <span className="ag-intel-action-meta">{sentimentMeta}</span>
                  <button className="ag-intel-action-btn" type="button" disabled={sentimentBusy} onClick={fetchSentiment}>
                    <span>↻</span> Fetch sentiment
                  </button>
                </>
              ) : null}
            </div>
          </div>

          <div className={tab === "update" ? "ag-intel-panel active" : "ag-intel-panel"}>
            <div className="ag-intel-source" data-testid="release-source-citation">
              <span className="ag-intel-source-label">Source</span>
              <a
                className="ag-intel-source-link"
                href={SALESFORCE_RELEASE_NOTES.sourceUrl}
                target="_blank"
                rel="noreferrer"
              >
                {SALESFORCE_RELEASE_NOTES.label} · release {SALESFORCE_RELEASE_NOTES.release} ({SALESFORCE_RELEASE_NOTES.releaseLabel})
              </a>
              <span className="ag-intel-source-meta">{SALESFORCE_RELEASE_NOTES.sourceName}</span>
            </div>
            <div className={fetching ? "fetch-status show" : "fetch-status"}>
              <div className="fetch-dot" />
              <span className="fetch-status-text">{SALESFORCE_FETCH_STEPS[fetchStep]}</span>
              <span className="fetch-status-step">
                {fetchStep + 1} / {SALESFORCE_FETCH_STEPS.length}
              </span>
            </div>
            <div className="ag-intel-cards" data-testid="release-headlines">
              {cards.map((card) => (
                <article className="ag-intel-card" key={card.id}>
                  <div className={`ag-intel-card-type ${card.type}`}>{card.type}</div>
                  <div className="ag-intel-card-title">{card.title}</div>
                  <div className="ag-intel-card-desc">{card.description}</div>
                  <div className="ag-intel-card-footer">
                    <span className="ag-intel-card-date">{card.date}</span>
                    {card.client ? (
                      <Link className="ag-intel-card-salient" to={clientHref(card.client)}>
                        {CLIENTS[card.client].name}
                      </Link>
                    ) : null}
                  </div>
                </article>
              ))}
            </div>
          </div>

          <div className={tab === "trends" ? "ag-intel-panel active" : "ag-intel-panel"}>
            <div className="ag-intel-cards">
              {trendsBusy ? <div className="ag-intel-empty">Identifying trends…</div> : null}
              {!trendsBusy && !trends ? (
                <div className="ag-intel-empty">
                  No trends loaded.{" "}
                  <button className="ag-intel-inline-btn" type="button" onClick={fetchTrends}>
                    Fetch now
                  </button>
                </div>
              ) : null}
              {!trendsBusy && trends
                ? trends.map((trend) => (
                    <article className="ag-intel-card" key={trend.rank}>
                      <div className="ag-intel-card-rank">0{trend.rank}</div>
                      <div className="ag-intel-card-title">{trend.title}</div>
                      <div className="ag-intel-card-desc">{trend.description}</div>
                      <div className={`ag-intel-card-type ${trend.direction}`}>
                        {trend.direction === "up" ? "↗ Rising" : trend.direction === "down" ? "↘ Declining" : "→ Stable"}
                      </div>
                    </article>
                  ))
                : null}
            </div>
          </div>

          <div className={tab === "sentiment" ? "ag-intel-panel active" : "ag-intel-panel"}>
            <div className="ag-sentiment-query-row">
              <span className="ag-x-query-label">Query</span>
              <input
                className="ag-x-query-input"
                type="text"
                value={query}
                placeholder="Topics to search on X..."
                onChange={(event) => setQuery(event.target.value)}
              />
            </div>
            <div className="ag-intel-cards">
              {sentimentBusy ? <div className="ag-intel-empty">Reading signals…</div> : null}
              {!sentimentBusy && !sentiment ? <div className="ag-intel-empty">No sentiment fetched yet.</div> : null}
              {!sentimentBusy && sentiment
                ? sentiment.map((signal) => (
                    <article className="ag-intel-card" key={signal.topic}>
                      <div className={`ag-intel-card-score ${signal.sentiment}`}>{signal.score}</div>
                      <div className="ag-intel-card-title">{signal.topic}</div>
                      <div className="ag-intel-card-desc">{signal.summary}</div>
                      <div className={`ag-intel-card-type ${signal.sentiment}`}>
                        {signal.sentiment === "pos" ? "Positive" : signal.sentiment === "neg" ? "Negative" : "Neutral"}
                      </div>
                    </article>
                  ))
                : null}
            </div>
          </div>
        </div>

        <p className="ag-section-label">Client portals</p>
        <div className="ag-clients">
          {CLIENT_ORDER.map((id) => {
            const copy = CARD_COPY[id];
            const open = openReq === id;
            return (
              <article
                key={id}
                className="ag-client-card"
                onClick={() => navigate(clientHref(id))}
              >
                <div className="ag-client-card-top">
                  <h2>{CLIENTS[id].name}</h2>
                  <div className="ag-client-badge">{salesforceNoteCount(id)} notes</div>
                </div>
                <p className="ag-client-desc">{copy.description}</p>
                <div className="ag-relevance-pills">
                  {copy.pills.map((pill) => (
                    <div className="ag-pill" key={pill}>
                      {pill}
                    </div>
                  ))}
                </div>
                <button
                  className={open ? "ag-req-toggle open" : "ag-req-toggle"}
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    setOpenReq(open ? null : id);
                  }}
                >
                  <span className="chevron">►</span> Client requirements
                </button>
                <div
                  className={open ? "ag-req-drawer open" : "ag-req-drawer"}
                  onClick={(event) => event.stopPropagation()}
                >
                  <RequirementsPanel clientId={id} persona="cio" onApply={() => navigate(clientHref(id))} />
                </div>
                <div className="ag-client-card-actions">
                  <Link className="ag-client-card-enter" to={clientHref(id)} onClick={(event) => event.stopPropagation()}>
                    Enter portal <span className="arr">→</span>
                  </Link>
                  <button
                    className="ag-client-see-all"
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      setTab("update");
                      document.getElementById("release-intel")?.scrollIntoView({ behavior: "smooth", block: "start" });
                    }}
                  >
                    See all updates ↗
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </main>

      <footer className="ag-footer">
        <ShortlistLogo /> · Prototype build · Fictional client brands · Accenture Song agency shell
      </footer>
    </div>
  );
}
