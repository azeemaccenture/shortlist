import type { ClientId } from "./clients";
import { CLIENTS } from "./clients";
import type { HorizonId, ImpactClass, ImpactTile, NoteImpact, PersonaId, ReleaseNote } from "./clientNotes";
import type { NoteType, UpdateCard } from "./intelMock";
import {
  SALESFORCE_RELEASE_NOTES,
  SALESFORCE_SHIPPED,
} from "./salesforceReleaseNotes";

/**
 * Per-client release feed sourced from the Salesforce Winter '27 release 264
 * notes. Each top-level Salesforce "What shipped" card is adapted into the
 * existing ReleaseNote shape so the client portal feed, horizon filters,
 * persona scoring, and impact panel keep working unchanged.
 *
 * Filter: a client sees every card the Salesforce source routes to them,
 * plus the shared cards (client === null) because those features ship for
 * everyone on the release.
 *
 * Source: https://help.salesforce.com/s/articleView?id=release-notes.salesforce_release_notes.htm&language=en_US&type=5&release=264
 */

const TIER_FROM_TYPE: Record<NoteType, HorizonId> = {
  platform: "long",
  product: "quarter",
  ops: "daily",
  security: "daily",
};

const BASE_SCORES: Record<HorizonId, Record<PersonaId, number>> = {
  long: { cio: 90, product: 68, ba: 48 },
  quarter: { cio: 70, product: 90, ba: 66 },
  daily: { cio: 54, product: 72, ba: 88 },
};

/** Bump the match score when a card is routed specifically to this client. */
const CLIENT_MATCH_BOOST = 6;

const WHY_BY_TIER: Record<HorizonId, string[]> = {
  long: [
    "Platform-level change in Winter ’27 — reshapes what the agent runtime can do across every surface.",
    "Governed by the standard Salesforce release train (release 264, GA 12 Oct 2026).",
  ],
  quarter: [
    "Flagship Winter ’27 feature — expect roadmap and enablement conversations this quarter.",
    "Lands on the standard Salesforce release train (release 264, GA 12 Oct 2026).",
  ],
  daily: [
    "Operational change in Winter ’27 — day-to-day behaviour shifts once the org picks it up.",
    "Lands on the standard Salesforce release train (release 264, GA 12 Oct 2026).",
  ],
};

const CLIENT_WHY: Record<ClientId, string> = {
  aether: "Routed to Aether Dynamics on the home feed — fits the network ops and voice-dispatch roadmap.",
  hexworth: "Routed to Hexworth on the home feed — fits the streaming, commerce, and partner-hub roadmap.",
};

const SUCCESS_BY_ID: Record<string, { kpi: string; move: string }> = {
  "sf-264-slack-code": { kpi: "Cycle time", move: "−20%" },
  "sf-264-adaptive-dynamic-plans": { kpi: "First-contact resolution", move: "+9%" },
  "sf-264-agentforce-contact-center": { kpi: "Containment", move: "+18%" },
  "sf-264-tableau-knowledge": { kpi: "Trusted answers", move: "+1 source" },
  "sf-264-informatica-headless": { kpi: "Data time-to-use", move: "−2 days" },
  "sf-264-agentic-segmentation-activation": { kpi: "Campaign activation", move: "+11%" },
  "sf-264-autonomous-scheduling-voice": { kpi: "Dispatch success", move: "+14%" },
  "sf-264-agent-skills-plugins": { kpi: "Reuse of governed skills", move: "+100" },
  "sf-264-third-party-agent-orchestration": { kpi: "Vendor overlap removed", move: "−3 links" },
  "sf-264-agentic-commerce-search": { kpi: "Conversion", move: "+13%" },
  "sf-264-slack-frontline": { kpi: "Shift completion", move: "+7%" },
  "sf-264-marketing-goals-agent": { kpi: "Goal attainment", move: "+8%" },
  "sf-264-revenue-management-agent": { kpi: "Quote cycle", move: "−15%" },
  "sf-264-claims-service-assistance": { kpi: "FNOL completion", move: "+12%" },
  "sf-264-voice-visit-logging": { kpi: "Visit capture", move: "+22%" },
};

const STRATEGIC_BY_TIER: Record<HorizonId, { val: string; lbl: string; cls: ImpactClass }> = {
  long: { val: "£6.4m", lbl: "FY28 value", cls: "pos" },
  quarter: { val: "+0.8", lbl: "NPS outlook", cls: "pos" },
  daily: { val: "Low", lbl: "Architecture risk", cls: "pos" },
};

function ticketsFor(id: string): number {
  let total = 0;
  for (const char of id) total += char.charCodeAt(0);
  return [6, 4, 8, 3, 5, 7, 2][total % 7];
}

function impactFor(card: UpdateCard, tier: HorizonId, clientName: string | null): NoteImpact {
  const tickets = ticketsFor(card.id);
  const blocked = Math.max(1, Math.round(tickets / 3));
  const success = SUCCESS_BY_ID[card.id] ?? { kpi: "Capability uptake", move: "Quarter in" };
  const strategic = STRATEGIC_BY_TIER[tier];
  const where = clientName ?? "the portfolio";
  return {
    cio: tiles([
      [strategic.val, strategic.cls, strategic.lbl],
      ["Winter ’27", "", "Release train"],
      ["Review", "warn", "Architecture call"],
      ["GA 12 Oct 2026", "", "Availability"],
    ]),
    product: tiles([
      ["Elevated", "pos", "Measure of success"],
      [success.move, "pos", success.kpi],
      [tier === "daily" ? "This sprint" : "Quarter in", "", "Delivery window"],
      ["1–2 sprints", "warn", "Enablement"],
    ]),
    ba: tiles([
      [String(tickets), "pos", "Active Jira tickets"],
      [String(blocked), "warn", "Blocked today"],
      ["Day-one", "", "Rollout timing"],
      ["Salesforce admin", "", "Owner"],
    ]),
    impactNote_cio: `${strategic.lbl} of ${strategic.val} for ${where}. This is a board-level read of the Winter ’27 change, not an ops ticket count.`,
    impactNote_product: `Elevated measure of success: ${success.kpi} moves ${success.move} if this ships in the quarter.`,
    impactNote_ba: `This fix would solve ${tickets} active Jira tickets.`,
  };
}

function tiles(entries: Array<[string, ImpactClass, string]>): ImpactTile[] {
  return entries.map(([val, cls, lbl]) => ({ val, cls, lbl }));
}

function tagsFor(card: UpdateCard, clientName: string | null): string[] {
  const typeTag = card.type[0].toUpperCase() + card.type.slice(1);
  const base = [typeTag, `Release ${SALESFORCE_RELEASE_NOTES.release}`];
  return clientName ? [...base, clientName] : [...base, "Shared release"];
}

function toReleaseNote(card: UpdateCard, clientId: ClientId): ReleaseNote {
  const tier = TIER_FROM_TYPE[card.type];
  const isClientMatched = card.client === clientId;
  const clientName = isClientMatched ? CLIENTS[clientId].name : null;
  const scores: Record<PersonaId, number> = {
    cio: Math.min(100, BASE_SCORES[tier].cio + (isClientMatched ? CLIENT_MATCH_BOOST : 0)),
    product: Math.min(100, BASE_SCORES[tier].product + (isClientMatched ? CLIENT_MATCH_BOOST : 0)),
    ba: Math.min(100, BASE_SCORES[tier].ba + (isClientMatched ? CLIENT_MATCH_BOOST : 0)),
  };
  const why = [
    ...(isClientMatched ? [CLIENT_WHY[clientId]] : []),
    ...WHY_BY_TIER[tier],
  ];
  return {
    id: `${clientId}-${card.id}`,
    tier,
    version: SALESFORCE_RELEASE_NOTES.releaseLabel,
    date: card.date,
    title: card.title,
    excerpt: card.description,
    tags: tagsFor(card, clientName),
    summary: `${card.description} Lifted from the Salesforce Winter ’27 release 264 notes; GA ${SALESFORCE_RELEASE_NOTES.gaDate}.`,
    why,
    scores,
    impact: impactFor(card, tier, clientName),
  };
}

/** Cards the Salesforce source routes to this client, plus the shared cards. */
function cardsFor(clientId: ClientId): UpdateCard[] {
  return SALESFORCE_SHIPPED.filter((card) => card.client === clientId || card.client === null);
}

export function salesforceNotesFor(clientId: ClientId): ReleaseNote[] {
  return cardsFor(clientId).map((card) => toReleaseNote(card, clientId));
}

export function salesforceNoteCount(clientId: ClientId): number {
  return cardsFor(clientId).length;
}
