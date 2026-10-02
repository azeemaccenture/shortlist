import { NavLink } from "react-router-dom";
import type { ReactNode } from "react";

const LINKS = [
  { to: "/", label: "Intake", end: true },
  { to: "/catalog", label: "Catalog", end: false },
  { to: "/shortlist", label: "Top 5", end: false },
];

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="shell">
      <header className="topbar">
        <div className="brand">
          <p className="kicker">FY planning</p>
          <p className="wordmark">Shortlist</p>
        </div>
        <nav aria-label="Demo">
          {LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
      </header>
      <main>{children}</main>
    </div>
  );
}
