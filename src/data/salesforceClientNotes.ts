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

const IMPACT_BY_TIER: Record<HorizonId, (clientName: string | null) => NoteImpact> = {
  long: (clientName) => ({
    cio: tiles([
      ["Winter ’27", "", "Release train"],
      ["GA 12 Oct 2026", "", "Availability"],
      ["Platform", "pos", "Agent surface"],
      ["Review", "warn", "Architecture call"],
    ]),
    product: tiles([
      ["Horizon shift", "", "Roadmap signal"],
      ["Winter ’27", "", "Release"],
      ["Enablement", "warn", "Team readiness"],
      ["Discovery", "", "Next step"],
    ]),
    ba: tiles([
      ["Low", "pos", "Day-one impact"],
      ["Watch list", "warn", "Add to backlog"],
      ["Winter ’27", "", "Release train"],
      ["Owner: Salesforce admin", "", "Routing"],
    ]),
    impactNote_cio: clientName
      ? `Platform-level Winter ’27 change relevant to ${clientName}. Needs an architecture decision call before the GA window.`
      : "Platform-level Winter ’27 change. Needs an architecture decision call before the GA window.",
    impactNote_product: "No immediate quarter commitment, but belongs on the roadmap backlog for discovery.",
    impactNote_ba: "No day-one operational change. Flag for enablement planning once the architecture call is settled.",
  }),
  quarter: (clientName) => ({
    cio: tiles([
      ["Winter ’27", "", "Release train"],
      ["GA 12 Oct 2026", "", "Availability"],
      ["Agentforce", "pos", "Agent surface"],
      ["Review", "warn", "Governance call"],
    ]),
    product: tiles([
      ["Quarter in", "pos", "Delivery window"],
      ["Agentforce", "pos", "Capability"],
      ["Est. 1–2 sprints", "warn", "Enablement effort"],
      ["GA 12 Oct 2026", "", "Availability"],
    ]),
    ba: tiles([
      ["Rollout", "warn", "Change management"],
      ["Agentforce", "pos", "Capability"],
      ["Winter ’27", "", "Release train"],
      ["Owner: Salesforce admin", "", "Routing"],
    ]),
    impactNote_cio: clientName
      ? `Flagship Winter ’27 feature relevant to ${clientName}. Expect a governance call on skills, data access, and vendor overlap.`
      : "Flagship Winter ’27 feature. Expect a governance call on skills, data access, and vendor overlap.",
    impactNote_product: "Quarter-in rollout candidate. Scope 1–2 sprints for enablement plus a pilot squad.",
    impactNote_ba: "Needs change-management support — new agent surface will shift day-to-day workflows.",
  }),
  daily: (clientName) => ({
    cio: tiles([
      ["Winter ’27", "", "Release train"],
      ["Low", "pos", "Architecture risk"],
      ["Monitor", "warn", "Ops signal"],
      ["Owner: Salesforce admin", "", "Routing"],
    ]),
    product: tiles([
      ["This sprint", "pos", "Day-to-day"],
      ["Winter ’27", "", "Release train"],
      ["Est. <1 sprint", "pos", "Effort"],
      ["Owner: Salesforce admin", "", "Routing"],
    ]),
    ba: tiles([
      ["Day-one", "warn", "Rollout timing"],
      ["Winter ’27", "", "Release train"],
      ["Owner: Salesforce admin", "", "Routing"],
      ["Enablement note", "", "Action"],
    ]),
    impactNote_cio: clientName
      ? `Operational Winter ’27 change relevant to ${clientName}. Low architecture risk; monitor adoption and feedback.`
      : "Operational Winter ’27 change. Low architecture risk; monitor adoption and feedback.",
    impactNote_product: "Low-effort pickup for the current sprint. Confirm enablement coverage.",
    impactNote_ba: "Day-one behaviour change for the admin surface. Prep a short enablement note before GA.",
  }),
};

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
    impact: IMPACT_BY_TIER[tier](clientName),
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
