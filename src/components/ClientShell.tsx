import { useEffect, type ReactNode } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import type { ClientProfile } from "../data/clients";
import { useClient } from "../portal/useClient";
import { RoleLogin } from "./RoleLogin";

type NavItem = { to: string; label: string; end?: boolean };

function AetherMark() {
  return (
    <div className="ae-brand-mark" aria-hidden="true">
      <span />
      <span />
      <span />
      <span />
    </div>
  );
}

function navClass(base: string, isActive: boolean, label: string, pathname: string) {
  const onDetail = pathname.includes("/items/");
  const catalogLabel = label === "Components" || label === "Content";
  const on = isActive || (onDetail && catalogLabel);
  return `${base}${on ? " active" : ""}`;
}

function AetherShell({ client, children }: { client: ClientProfile; children: ReactNode }) {
  const base = `/clients/${client.id}`;
  const { pathname } = useLocation();
  const links: NavItem[] = [
    { to: base, label: "Releases", end: true },
    { to: `${base}/catalog`, label: "Components" },
    { to: `${base}/shortlist`, label: "Network" },
    { to: `${base}/intake`, label: "Health" },
  ];
  return (
    <div id="screen-aether" className="screen active" role="region" aria-label="Aether Dynamics client environment">
      <div className="ae-system-bar">
        <div className="ae-system-bar-in">
          <Link className="ae-back-btn" to="/">
            ← Shortlist agency
          </Link>
          <span className="ae-sys-spacer" />
          <span className="ae-sys-meta">Network · Q3 FY26</span>
        </div>
      </div>
      <header className="ae-product-nav">
        <div className="ae-product-nav-in">
          <Link className="ae-brand-block" to={base}>
            <AetherMark />
            <div>
              <div className="ae-brand-name">Aether Dynamics</div>
              <span className="ae-brand-sub">Network · Releases</span>
            </div>
          </Link>
          <nav className="ae-nav-links" aria-label="Aether">
            {links.map((link) => (
              <NavLink
                key={link.label}
                to={link.to}
                end={link.end}
                className={({ isActive }) => navClass("ae-nav-link", isActive, link.label, pathname)}
              >
                {link.label}
              </NavLink>
            ))}
          </nav>
          <div className="ae-nav-end">
            <RoleLogin />
            <Link className="ae-share-btn" to={`${base}/shortlist`} data-testid="see-top-5">
              Share briefing
            </Link>
          </div>
        </div>
      </header>
      <main>{children}</main>
      <footer className="ae-footer">
        <strong>Shortlist</strong> · Aether Dynamics environment · Prototype only
      </footer>
    </div>
  );
}

function HexworthShell({ client, children }: { client: ClientProfile; children: ReactNode }) {
  const base = `/clients/${client.id}`;
  const { pathname } = useLocation();
  const links: NavItem[] = [
    { to: base, label: "Releases", end: true },
    { to: `${base}/catalog`, label: "Content" },
    { to: `${base}/shortlist`, label: "Subscribers" },
  ];
  return (
    <div id="screen-hexworth" className="screen active" role="region" aria-label="Hexworth client environment">
      <header className="hx-nav">
        <div className="hx-nav-in">
          <Link className="hx-brand-name" to={base}>
            Hexworth
          </Link>
          <nav className="hx-nav-links" aria-label="Hexworth">
            {links.map((link) => (
              <NavLink
                key={link.label}
                to={link.to}
                end={link.end}
                className={({ isActive }) => navClass("hx-nav-link", isActive, link.label, pathname)}
              >
                {link.label}
              </NavLink>
            ))}
          </nav>
          <div className="hx-nav-spacer" />
          <RoleLogin />
          <Link className="hx-back-link" to="/">
            ← Agency
          </Link>
          <Link className="hx-nav-cta" to={`${base}/shortlist`} data-testid="see-top-5">
            Share briefing
          </Link>
        </div>
      </header>
      <main>{children}</main>
      <footer className="hx-footer">
        <strong>Shortlist</strong> · Hexworth environment · Prototype only
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
