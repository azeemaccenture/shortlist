import { NavLink, Link } from "react-router-dom";
import type { ReactNode } from "react";
import { useSession } from "../state/SessionProvider";
import { ROLE_LABELS, type Role } from "../types";

const LINKS = [
  { to: "/", label: "Intake", end: true },
  { to: "/catalog", label: "Catalog", end: false },
  { to: "/shortlist", label: "Top 5", end: false },
];

const ROLE_MARK: Record<Role, string> = {
  cio: "CI",
  product_lead: "PL",
  ba: "BA",
};

export function AgencyLayout({ children }: { children: ReactNode }) {
  const { context } = useSession();
  const mark = context ? ROLE_MARK[context.role] : "SL";

  return (
    <div className="agency">
      <header className="ac-bar">
        <Link className="ac-mark" to="/">
          <span className="chev">&gt;</span>Shortlist
        </Link>
        <nav className="ac-nav" aria-label="Shortlist">
          {LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) => (isActive ? "is-on" : undefined)}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
        <div className="ac-bar-end" aria-hidden="true">
          {mark}
        </div>
      </header>
      {children}
      <footer className="ac-foot">
        <strong>Shortlist</strong> · Hackathon prototype · Salesforce feature ranking · No live APIs
      </footer>
    </div>
  );
}

export function WorkspaceLayout({ children }: { children: ReactNode }) {
  const { context } = useSession();
  const role = context ? ROLE_LABELS[context.role] : "Session";

  return (
    <div className="workspace">
      <div className="ae-topbar">
        <div className="ae-topbar-in">
          <Link className="ae-back" to="/">
            ← Intake
          </Link>
          <span>Shortlist · {role}</span>
          <span className="grow" />
          <span className="ae-topbar-meta">Salesforce features</span>
        </div>
      </div>
      <header className="ae-nav">
        <div className="ae-nav-in">
          <Link className="ae-brand" to="/catalog">
            <div className="ae-mark" aria-hidden="true">
              <svg viewBox="0 0 28 28" fill="none">
                <path d="M4 20 L14 6 L24 20" stroke="#00205B" strokeWidth="2.2" strokeLinejoin="miter" />
                <path d="M8 20 H20" stroke="#00AEC7" strokeWidth="2.2" />
              </svg>
            </div>
            <div className="ae-brand-t">
              Shortlist<span>Feature ranking</span>
            </div>
          </Link>
          <nav className="ae-links" aria-label="Workspace">
            {LINKS.filter((link) => link.to !== "/").map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) => (isActive ? "is-on" : undefined)}
              >
                {link.label}
              </NavLink>
            ))}
          </nav>
          <Link className="ae-share" to="/shortlist" data-testid="see-top-5">
            See top 5
          </Link>
        </div>
      </header>
      <main>{children}</main>
      <footer className="ae-foot">Shortlist · Prototype only · Deterministic scores · No live APIs</footer>
    </div>
  );
}
