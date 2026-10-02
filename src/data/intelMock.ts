import type { ClientId } from "./clients";

export type NoteType = "platform" | "product" | "ops" | "security";

export type UpdateCard = {
  id: string;
  title: string;
  description: string;
  type: NoteType;
  date: string;
  client: ClientId | null;
};

export const SCRAPE_SOURCES = [
  { value: "saas", label: "SaaS platform" },
  { value: "api", label: "API / developer tool" },
  { value: "ds", label: "Design system" },
  { value: "infra", label: "Infrastructure" },
  { value: "media", label: "Streaming / media" },
] as const;

export type ScrapeSource = (typeof SCRAPE_SOURCES)[number]["value"];

const FETCH_STEPS = [
  "Connecting to changelog…",
  "Reading release entries…",
  "Extracting key changes…",
  "Ranking by impact…",
];

export { FETCH_STEPS };

/** Offline stand-in for the prototype fetch. No network call. */
export const MOCK_FETCH: Record<ScrapeSource, UpdateCard[]> = {
  saas: [
    {
      id: "saas-1",
      type: "product",
      date: "1 Oct 2026",
      title: "Workspace search remembers the last team filter",
      description: "Saved filters survive a reload so operators do not rebuild the same queue each morning.",
      client: null,
    },
    {
      id: "saas-2",
      type: "ops",
      date: "30 Sep 2026",
      title: "Overnight job report lands in the admin inbox",
      description: "Failed batch jobs include the record count and a retry link. No dashboard hop required.",
      client: "aether",
    },
    {
      id: "saas-3",
      type: "security",
      date: "28 Sep 2026",
      title: "Session timeout copy is specific about the next step",
      description: "The lock screen names which draft was saved and which one still needs a sign-in.",
      client: "hexworth",
    },
  ],
  api: [
    {
      id: "api-1",
      type: "product",
      date: "2 Oct 2026",
      title: "Idempotency keys on write endpoints",
      description: "Retries no longer create a second entitlement when the first response was lost.",
      client: "hexworth",
    },
    {
      id: "api-2",
      type: "platform",
      date: "29 Sep 2026",
      title: "Pagination cursor documented for list routes",
      description: "Partners can walk large catalogues without offset drift after a mid-page insert.",
      client: null,
    },
    {
      id: "api-3",
      type: "ops",
      date: "27 Sep 2026",
      title: "Error catalog adds a stable code for rate limits",
      description: "Clients can branch on the code instead of parsing the human sentence.",
      client: "aether",
    },
  ],
  ds: [
    {
      id: "ds-1",
      type: "product",
      date: "30 Sep 2026",
      title: "Density tokens for high-information consoles",
      description: "Compact, default, and comfortable spacing share one contrast check.",
      client: "aether",
    },
    {
      id: "ds-2",
      type: "platform",
      date: "26 Sep 2026",
      title: "Status chip set covers partial and queued",
      description: "Operations boards can show a job that started without calling it done.",
      client: "aether",
    },
    {
      id: "ds-3",
      type: "ops",
      date: "24 Sep 2026",
      title: "Focus ring meets the new surface colors",
      description: "Keyboard focus stays visible on both the light console and the dark admin bar.",
      client: null,
    },
  ],
  infra: [
    {
      id: "infra-1",
      type: "ops",
      date: "2 Oct 2026",
      title: "Region failover runbook shortened to one page",
      description: "The checklist names the health signal that must go green before traffic moves back.",
      client: "aether",
    },
    {
      id: "infra-2",
      type: "security",
      date: "29 Sep 2026",
      title: "Signed payloads on partner event delivery",
      description: "Receivers can reject an unsigned package event before it touches the queue.",
      client: "hexworth",
    },
    {
      id: "infra-3",
      type: "platform",
      date: "25 Sep 2026",
      title: "Edge handoff keeps telemetry continuous",
      description: "A shift between core and edge no longer opens a gap in the service graph.",
      client: "aether",
    },
  ],
  media: [
    {
      id: "media-1",
      type: "product",
      date: "29 Sep 2026",
      title: "Entitlement preview for content partners",
      description: "Partners can see package access before a batch job runs.",
      client: "hexworth",
    },
    {
      id: "media-2",
      type: "ops",
      date: "1 Oct 2026",
      title: "Playback handoff keeps availability copy in one place",
      description: "Browse and playback show the same package sentence.",
      client: "hexworth",
    },
    {
      id: "media-3",
      type: "security",
      date: "27 Sep 2026",
      title: "Partner hub retries with a dead-letter queue",
      description: "Missed content events wait in a queue instead of disappearing.",
      client: "hexworth",
    },
  ],
};

export const MOCK_TRENDS = [
  {
    rank: 1,
    title: "Briefings built from the changelog",
    description: "Teams are turning the release list into a client note instead of rewriting it.",
    direction: "up" as const,
  },
  {
    rank: 2,
    title: "Role-specific release reading",
    description: "The same drop is being split for strategy, quarter delivery, and operations.",
    direction: "up" as const,
  },
  {
    rank: 3,
    title: "Long-form release essays",
    description: "Multi-page launch posts are losing ground to one-line salient changes.",
    direction: "down" as const,
  },
];

export const MOCK_SENTIMENT = [
  {
    topic: "Changelog clarity",
    sentiment: "pos" as const,
    score: 74,
    summary: "Readers praise notes that say what changed for their team in one sentence.",
  },
  {
    topic: "Breaking change notice",
    sentiment: "neu" as const,
    score: 51,
    summary: "Threads ask for an earlier flag when a partner endpoint moves, and for a date.",
  },
  {
    topic: "Hidden operational fixes",
    sentiment: "neg" as const,
    score: 38,
    summary: "Operators say hotfixes buried under launch language still surprise the night shift.",
  },
];

export function inferClient(text: string): ClientId | null {
  const lower = text.toLowerCase();
  const hex = ["stream", "entitle", "content", "media", "subscriber", "playback", "partner"].filter((word) =>
    lower.includes(word),
  ).length;
  const ae = ["network", "5g", "telemetry", "roaming", "billing", "orchestrat", "console", "density"].filter((word) =>
    lower.includes(word),
  ).length;
  if (hex === ae) return null;
  return hex > ae ? "hexworth" : "aether";
}
