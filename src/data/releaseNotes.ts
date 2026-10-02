import type { ClientId } from "./clients";

export type Horizon = "long" | "quarter" | "daily";

export type ReleaseHeadline = {
  id: string;
  headline: string;
  salient: string;
};

export type SalientChange = {
  id: string;
  horizon: Horizon;
  version: string;
  date: string;
  headline: string;
  salient: string;
  match: number;
};

export const HORIZON_LABEL: Record<Horizon, string> = {
  long: "Long-term",
  quarter: "Quarter",
  daily: "Day-to-day",
};

/**
 * Mock “latest” scrape. Headlines and one-line salient changes only.
 * Catalog cards do not render this copy.
 */
export const RELEASE_DROP = {
  id: "winter-27",
  label: "Winter ’27",
  release: "264",
  scrapedAt: "2026-10-02T09:00:00.000Z",
  source: "mock" as const,
  headlines: [
    {
      id: "g1",
      headline: "Deal-risk pipeline forecasting is in the Winter ’27 drop",
      salient: "Forecast calls can surface deal risk before the quarter slips.",
    },
    {
      id: "g2",
      headline: "Agentforce Contact Center is called out for voice and case routing",
      salient: "Service teams get a contact-center headline in the same drop as the console updates.",
    },
    {
      id: "g3",
      headline: "Agent Skills and Plugins ship on the platform",
      salient: "Reusable skills attach to the flows teams already run.",
    },
    {
      id: "g4",
      headline: "Agentic Segmentation and Activation opens for campaigns",
      salient: "Segments can activate without a separate batch extract.",
    },
    {
      id: "g5",
      headline: "Tableau Knowledge and Informatica Headless share the drop",
      salient: "Analytics and governed data jobs are headlines, not long-form notes.",
    },
  ] satisfies ReleaseHeadline[],
  clients: {
    aether: [
      {
        id: "a1",
        horizon: "long",
        version: "Platform",
        date: "28 Sep 2026",
        headline: "Multi-year 5G network orchestration platform",
        salient: "One service graph across radio, core, edge, and partner networks.",
        match: 95,
      },
      {
        id: "a2",
        horizon: "quarter",
        version: "DS v4.2",
        date: "30 Sep 2026",
        headline: "Network console density tokens",
        salient: "A tighter density scale for high-information network operations consoles.",
        match: 91,
      },
      {
        id: "a3",
        horizon: "daily",
        version: "v9.4.1",
        date: "1 Oct 2026",
        headline: "Network telemetry ingest — edge handoff fix",
        salient: "Closes intermittent telemetry gaps when traffic shifts between core and edge.",
        match: 87,
      },
      {
        id: "a4",
        horizon: "quarter",
        version: "API 3.1",
        date: "25 Sep 2026",
        headline: "Billing API usage-threshold notifications",
        salient: "Plans can signal before a configured usage threshold is reached.",
        match: 84,
      },
      {
        id: "a5",
        horizon: "daily",
        version: "Ops",
        date: "2 Oct 2026",
        headline: "Roaming change calendar overnight sync",
        salient: "Partner maintenance windows land on the network calendar without a manual edit.",
        match: 78,
      },
      {
        id: "a6",
        horizon: "long",
        version: "Strategy",
        date: "20 Sep 2026",
        headline: "Open network API readiness roadmap",
        salient: "A phased plan for network, billing, and partner APIs.",
        match: 88,
      },
    ],
    hexworth: [
      {
        id: "h1",
        horizon: "quarter",
        version: "API v2.4",
        date: "29 Sep 2026",
        headline: "Streaming entitlements API v2.4",
        salient: "Content partners can preview package access without a legacy batch job.",
        match: 97,
      },
      {
        id: "h2",
        horizon: "long",
        version: "Platform",
        date: "22 Sep 2026",
        headline: "Cross-service subscriber identity framework",
        salient: "One identity model across streaming, set-top, and partner apps.",
        match: 94,
      },
      {
        id: "h3",
        horizon: "daily",
        version: "v6.2.1",
        date: "1 Oct 2026",
        headline: "Playback handoff fix",
        salient: "Browse-to-playback handoff keeps package availability in one sentence of copy.",
        match: 86,
      },
      {
        id: "h4",
        horizon: "quarter",
        version: "Hub 5.0",
        date: "27 Sep 2026",
        headline: "Content partner hub retries and signed payloads",
        salient: "Package events retry with a signature instead of a missed webhook.",
        match: 90,
      },
      {
        id: "h5",
        horizon: "daily",
        version: "Ops",
        date: "2 Oct 2026",
        headline: "October package change window",
        salient: "The monthly billing freeze is staged for support and content partners.",
        match: 82,
      },
      {
        id: "h6",
        horizon: "long",
        version: "Strategy",
        date: "18 Sep 2026",
        headline: "Open content APIs roadmap",
        salient: "Catalogue sync and entitlement signals are sequenced for media partners.",
        match: 92,
      },
      {
        id: "h7",
        horizon: "daily",
        version: "v4.1.2",
        date: "30 Sep 2026",
        headline: "Support desktop entitlement context",
        salient: "Access tickets deep-link to the entitlement preview.",
        match: 80,
      },
    ],
  } satisfies Record<ClientId, SalientChange[]>,
};

export function clientNotes(clientId: ClientId): SalientChange[] {
  return RELEASE_DROP.clients[clientId];
}

export function horizonCount(clientId: ClientId, horizon: Horizon): number {
  return clientNotes(clientId).filter((note) => note.horizon === horizon).length;
}

export function portfolioStats() {
  const notes = [...clientNotes("aether"), ...clientNotes("hexworth")];
  const top = Math.max(...notes.map((note) => note.match));
  return {
    notes: notes.length,
    long: notes.filter((note) => note.horizon === "long").length,
    quarter: notes.filter((note) => note.horizon === "quarter").length,
    daily: notes.filter((note) => note.horizon === "daily").length,
    clients: 2,
    top,
  };
}
