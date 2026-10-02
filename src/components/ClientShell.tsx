import { useEffect, type ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import type { ClientProfile } from "../data/clients";
import { PERSONAS, PERSONA_COPY } from "../data/personaCopy";
import { BriefingProvider, useBriefing } from "../portal/BriefingContext";
import { useClient } from "../portal/useClient";
import { ShortlistLogo } from "./ShortlistLogo";

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

function PersonaTabs({ hex }: { hex: boolean }) {
  const { persona, setPersona } = useBriefing();
  return (
    <div className={hex ? "hx-persona-pills" : "ae-persona-tabs"} role="group" aria-label="Role">
      {PERSONAS.map((id) => (
        <button
          key={id}
          type="button"
          className={`${hex ? "hx-persona-pill" : "ae-persona-tab"}${persona === id ? " active" : ""}`}
          data-testid={`persona-${id}`}
          aria-pressed={persona === id}
          onClick={() => setPersona(id)}
        >
          {PERSONA_COPY[id].label}
        </button>
      ))}
    </div>
  );
}

function ShareButton({ className }: { className: string }) {
  const { briefing, toggleBriefingOpen } = useBriefing();
  return (
    <button className={className} type="button" onClick={toggleBriefingOpen}>
      Share briefing{briefing.length ? ` (${briefing.length})` : ""}
    </button>
  );
}

const AETHER_NAV = ["Releases", "Components", "Network", "Health"];
const HEX_NAV = ["Releases", "Content", "Subscribers"];

function AetherShell({ client, children }: { client: ClientProfile; children: ReactNode }) {
  const base = `/clients/${client.id}`;
  return (
    <div id="screen-aether" className="screen active" role="region" aria-label="Aether Dynamics client environment">
      <div className="ae-system-bar">
        <div className="ae-system-bar-in">
          <Link className="ae-back-btn" to="/" data-testid="back-agency" aria-label="Shortlist agency">
            <ShortlistLogo />
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
            {AETHER_NAV.map((label) => (
              <button key={label} type="button" className={label === "Releases" ? "ae-nav-link active" : "ae-nav-link"}>
                {label}
              </button>
            ))}
          </nav>
          <div className="ae-nav-end">
            <PersonaTabs hex={false} />
            <ShareButton className="ae-share-btn" />
          </div>
        </div>
      </header>
      <main>{children}</main>
      <footer className="ae-footer">
        <ShortlistLogo /> · Aether Dynamics environment · Prototype only
      </footer>
    </div>
  );
}

function HexworthShell({ client, children }: { client: ClientProfile; children: ReactNode }) {
  const base = `/clients/${client.id}`;
  return (
    <div id="screen-hexworth" className="screen active" role="region" aria-label="Hexworth client environment">
      <header className="hx-nav">
        <div className="hx-nav-in">
          <Link className="hx-brand-name" to={base}>
            Hexworth
          </Link>
          <nav className="hx-nav-links" aria-label="Hexworth">
            {HEX_NAV.map((label) => (
              <button key={label} type="button" className={label === "Releases" ? "hx-nav-link active" : "hx-nav-link"}>
                {label}
              </button>
            ))}
          </nav>
          <div className="hx-nav-spacer" />
          <PersonaTabs hex />
          <Link className="hx-back-link" to="/" data-testid="back-agency" aria-label="Shortlist agency">
            <ShortlistLogo word={false} />
            <span>Agency</span>
          </Link>
          <ShareButton className="hx-nav-cta" />
        </div>
      </header>
      <main>{children}</main>
      <footer className="hx-footer">
        <ShortlistLogo /> · Hexworth environment · Prototype only
      </footer>
    </div>
  );
}

function ShellBody({ children }: { children: ReactNode }) {
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

export function ClientShell({ children }: { children: ReactNode }) {
  return (
    <BriefingProvider>
      <ShellBody>{children}</ShellBody>
    </BriefingProvider>
  );
}
