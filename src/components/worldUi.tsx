import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { useClient } from "../portal/useClient";

export function useHex() {
  return useClient()?.id === "hexworth";
}

export function SearchIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M10.5 10.5L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function ScoreHeader({
  eyebrow,
  title,
  lede,
  stats,
}: {
  eyebrow?: string;
  title: string;
  lede: string;
  stats: { n: ReactNode; l: string }[];
}) {
  const hex = useHex();
  if (hex) {
    return (
      <>
        <section className="hx-hero product-hero">
          <div className="hx-hero-in">
            <div>
              <p className="hx-hero-eyebrow">{eyebrow ?? "Shortlist"}</p>
              <h1>{title}</h1>
              <p className="hx-hero-sub">{lede}</p>
            </div>
            {stats[0] ? (
              <aside className="hx-hero-fig">
                <div className="hx-hero-big">{stats[0].n}</div>
                <div className="hx-hero-fig-lbl">{stats[0].l}</div>
              </aside>
            ) : null}
          </div>
        </section>
        {stats.length > 1 ? (
          <div className="hx-persona-bar">
            <div className="hx-persona-bar-in">
              {stats.slice(1).map((stat) => (
                <div className="hx-pfield" key={stat.l}>
                  <span className="hx-pfield-label">{stat.l}</span>
                  <div className="hx-pfield-value">{stat.n}</div>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </>
    );
  }
  return (
    <div className="ae-data-header">
      <div className="ae-data-header-in">
        <div className="ae-data-lead">
          <h1>{title}</h1>
          <p>{lede}</p>
        </div>
        {stats.map((stat) => (
          <div className="ae-kpi" key={stat.l}>
            <div className="n">{stat.n}</div>
            <div className="l">{stat.l}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function WorkLayout({ label, rail, children }: { label: string; rail: ReactNode; children: ReactNode }) {
  const hex = useHex();
  return (
    <div className={hex ? "hx-main-layout" : "ae-main-layout"}>
      {hex ? (
        <nav className="hx-rail" aria-label={label}>
          {rail}
        </nav>
      ) : (
        <nav className="ae-sidebar" aria-label={label}>
          <div className="ae-sidebar-label">{label}</div>
          {rail}
        </nav>
      )}
      <div>{children}</div>
    </div>
  );
}

export function RailButton({
  active,
  onClick,
  testId,
  label,
  count,
}: {
  active?: boolean;
  onClick?: () => void;
  testId?: string;
  label: string;
  count?: ReactNode;
}) {
  const hex = useHex();
  const className = `${hex ? "hx-rail-btn" : "ae-filter-item"}${active ? " active" : ""}`;
  return (
    <button type="button" className={className} onClick={onClick} data-testid={testId}>
      {label}
      {count !== undefined ? hex ? <small>{count}</small> : <span className="ae-filter-cnt">{count}</span> : null}
    </button>
  );
}

export function RailLink({ to, active, label, count }: { to: string; active?: boolean; label: string; count?: ReactNode }) {
  const hex = useHex();
  const className = `${hex ? "hx-rail-btn" : "ae-filter-item"}${active ? " active" : ""}`;
  return (
    <Link to={to} className={className}>
      {label}
      {count !== undefined ? hex ? <small>{count}</small> : <span className="ae-filter-cnt">{count}</span> : null}
    </Link>
  );
}

export function FeedHead({ title, children }: { title: string; children?: ReactNode }) {
  const hex = useHex();
  return (
    <div className={hex ? "hx-feed-top" : "ae-feed-top"}>
      <h2>{title}</h2>
      {children}
    </div>
  );
}

export function SearchField({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  const hex = useHex();
  return (
    <label className={hex ? "hx-search-wrap" : "ae-search-bar"}>
      <SearchIcon />
      <input type="search" value={value} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

export function NoteRowLink({
  to,
  tier,
  tierClass,
  title,
  excerpt,
  chips,
  score,
  scoreLabel,
  extra,
}: {
  to: string;
  tier: string;
  tierClass: string;
  title: string;
  excerpt: string;
  chips: string[];
  score: ReactNode;
  scoreLabel: string;
  extra?: ReactNode;
}) {
  const hex = useHex();
  return (
    <Link className={hex ? "hx-note-row" : "ae-note-row"} to={to}>
      <div className={hex ? "hx-note-row-main" : "ae-note-row-main"}>
        <div className={hex ? `hx-tier-pill ${tierClass}` : `ae-tier-tag ${tierClass}`}>{tier}</div>
        <div>
          <div className={hex ? "hx-note-title" : "ae-note-title"}>{title}</div>
          <div className={hex ? "hx-note-excerpt" : "ae-note-excerpt"}>{excerpt}</div>
          {extra}
          {chips.length > 0 ? (
            <div className={hex ? "hx-note-chips" : "ae-note-chips"}>
              {chips.map((chip) => (
                <span key={chip} className={hex ? "hx-note-chip" : "ae-note-chip"}>
                  {chip}
                </span>
              ))}
            </div>
          ) : null}
        </div>
        <div className={hex ? "hx-note-score" : "ae-note-score"}>
          <div className="n">{score}</div>
          <div className="l">{scoreLabel}</div>
        </div>
      </div>
    </Link>
  );
}

export function actionClass(hex: boolean, kind: "primary" | "ghost") {
  if (hex) return kind === "primary" ? "hx-btn-primary" : "hx-btn-ghost";
  return kind === "primary" ? "ae-btn-primary" : "ae-btn-ghost";
}
