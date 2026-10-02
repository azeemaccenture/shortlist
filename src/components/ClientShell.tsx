import { useEffect, type ReactNode } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import type { ClientProfile } from "../data/clients";
import { useClient } from "../portal/useClient";
import { RoleLogin } from "./RoleLogin";

const NAV = [
  { segment: "", label: "Releases", end: true },
  { segment: "intake", label: "Intake", end: false },
  { segment: "catalog", label: "Catalog", end: false },
  { segment: "shortlist", label: "Top 5", end: false },
];

function AetherMark() {
  return (
    <svg viewBox="0 0 28 28" fill="none" aria-hidden="true">
      <rect x="2" y="2" width="10" height="10" fill="#161616" />
      <rect x="16" y="2" width="10" height="10" fill="#0f62fe" />
      <rect x="2" y="16" width="10" height="10" fill="#4589ff" />
      <rect x="16" y="16" width="10" height="10" fill="#d0e2ff" />
    </svg>
  );
}

function HexworthMark() {
  return (
    <svg viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <path d="M16 2 L28 9 L28 23 L16 30 L4 23 L4 9 Z" fill="#5F5BC7" />
      <path d="M16 2 L28 9 L16 16 L4 9 Z" fill="#4198FF" />
      <path d="M28 9 L28 23 L16 16 Z" fill="#F75242" />
      <path d="M4 9 L16 16 L4 23 Z" fill="#FBBD33" />
      <path d="M16 16 L28 23 L16 30 L4 23 Z" fill="#2A603C" />
      <path d="M16 10 L22 13.5 L16 17 L10 13.5 Z" fill="#D8D4CB" opacity="0.95" />
    </svg>
  );
}

function AetherShell({ client, children }: { client: ClientProfile; children: ReactNode }) {
  const base = `/clients/${client.id}`;
  return (
    <div className="world world-aether" role="region" aria-label="Aether Dynamics client environment">
      <div className="ae-topbar">
        <div className="ae-topbar-in">
          <Link className="ae-back" to="/">
            ← Agency
          </Link>
          <span>PulseNotes · {client.name}</span>
          <span className="grow" />
          <RoleLogin />
          <span className="ae-topbar-meta">{client.meta}</span>
        </div>
      </div>
      <header className="ae-nav">
        <div className="ae-nav-in">
          <Link className="ae-brand" to={base}>
            <div className="ae-mark" aria-hidden="true">
              <AetherMark />
            </div>
            <div className="ae-brand-t">
              Aether Dynamics<span>Network · Releases</span>
            </div>
          </Link>
          <nav className="ae-links" aria-label="Aether">
            {NAV.map((link) => (
              <NavLink
                key={link.label}
                to={link.segment ? `${base}/${link.segment}` : base}
                end={link.end}
                className={({ isActive }) => (isActive ? "is-on" : undefined)}
              >
                {link.label}
              </NavLink>
            ))}
          </nav>
          <Link className="ae-share" to={`${base}/shortlist`} data-testid="see-top-5">
            See top 5
          </Link>
        </div>
      </header>
      <main>{children}</main>
      <footer className="ae-foot">PulseNotes · Aether Dynamics environment · Prototype only · Fictional brand</footer>
    </div>
  );
}

function HexworthShell({ client, children }: { client: ClientProfile; children: ReactNode }) {
  const base = `/clients/${client.id}`;
  return (
    <div className="world world-hexworth" role="region" aria-label="Hexworth client environment">
      <header className="hx-nav">
        <div className="hx-nav-in">
          <Link className="hx-brand" to={base}>
            <div className="hx-mark" aria-hidden="true">
              <HexworthMark />
            </div>
            <div className="hx-brand-n">Hexworth</div>
          </Link>
          <nav className="hx-links" aria-label="Hexworth">
            {NAV.map((link) => (
              <NavLink
                key={link.label}
                to={link.segment ? `${base}/${link.segment}` : base}
                end={link.end}
                className={({ isActive }) => (isActive ? "is-on" : undefined)}
              >
                {link.label}
              </NavLink>
            ))}
          </nav>
          <div className="hx-nav-end">
            <RoleLogin />
            <Link className="hx-agency" to="/">
              ← Agency
            </Link>
            <Link className="hx-cta" to={`${base}/shortlist`} data-testid="see-top-5">
              See top 5
            </Link>
          </div>
        </div>
      </header>
      <main>{children}</main>
      <footer className="hx-foot">
        <strong>PulseNotes</strong> · Hexworth environment · Prototype only · Fictional brand
      </footer>
    </div>
  );
}

export function ClientShell({ children }: { children: ReactNode }) {
  const client = useClient();
  const navigate = useNavigate();

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      const target = event.target;
      if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) return;
      navigate("/");
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [navigate]);

  if (!client) return null;
  if (client.id === "hexworth") return <HexworthShell client={client}>{children}</HexworthShell>;
  return <AetherShell client={client}>{children}</AetherShell>;
}
