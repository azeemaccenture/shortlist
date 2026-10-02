import type { ClientId } from "./clients";
import type { Role } from "../types";

export type PersonaCopy = {
  roleLine: string;
  horizon: string;
  objectives: Record<ClientId, string>;
  tags: Record<ClientId, string[]>;
  heroTitle: string;
  heroSub: string;
  eyebrow: string;
};

export const PERSONA_COPY: Record<Role, PersonaCopy> = {
  cio: {
    roleLine: "CIO · Strategic view",
    horizon: "Long-term platform & architecture",
    objectives: {
      aether: "Network intelligence, open API platform, scalable 5G architecture",
      hexworth: "Long-term subscriber platform, cross-service identity, API-first media",
    },
    tags: {
      aether: ["Architecture", "Platform", "Roadmap"],
      hexworth: ["Identity", "Platform", "Roadmap"],
    },
    heroTitle: "Long-term platform moves that reshape your roadmap",
    heroSub:
      "Filtered to what matters at the strategic horizon. Multi-year plays and platform bets, ranked by relevance to your FY objectives.",
    eyebrow: "CIO view",
  },
  product_lead: {
    roleLine: "Product lead · Quarterly view",
    horizon: "Quarter delivery & capability roadmap",
    objectives: {
      aether: "Q3 network ops console, billing API improvements, design system rollout",
      hexworth: "Q3 entitlements API, partner hub reliability, subscriber growth metrics",
    },
    tags: {
      aether: ["Design System", "Billing API", "Q3 OKR"],
      hexworth: ["Entitlements", "Partner Hub", "Q3 OKR"],
    },
    heroTitle: "What ships this quarter and why it matters",
    heroSub:
      "Ranked by impact on your Q3 delivery targets. Capability releases, API updates, and partner changes most likely to need your attention.",
    eyebrow: "Product lead view",
  },
  ba: {
    roleLine: "Business analyst · Day-to-day view",
    horizon: "Operational & day-to-day",
    objectives: {
      aether: "Telemetry reliability, Jira plug-in compatibility, roaming operations, billing thresholds",
      hexworth: "Support tooling, billing ops, playback reliability, entitlement data accuracy",
    },
    tags: {
      aether: ["Telemetry", "Ops", "Billing", "Jira"],
      hexworth: ["Support", "Billing", "Playback", "Ops"],
    },
    heroTitle: "Day-to-day changes that affect your team today",
    heroSub:
      "Operational fixes, support tooling updates, and threshold changes your team needs to act on. Sorted by immediacy.",
    eyebrow: "Analyst view",
  },
};
