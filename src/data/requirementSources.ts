import type { ClientId } from "./clients";
import type { PersonaId } from "./clientNotes";

export type SourceKind = "document" | "jira";

export type SourceTemplate = {
  name: string;
  meta: string;
  text: string;
  emptyName: string;
  emptyMeta: string;
};

export type PersonaRequirements = {
  filledSummary: string;
  emptyTitle: string;
  emptyBody: string;
  document: SourceTemplate;
  jira: SourceTemplate;
  order: SourceKind[];
};

const AETHER: Record<PersonaId, PersonaRequirements> = {
  cio: {
    filledSummary: "2 sources active — strategy document and Jira epics. Ranking is live.",
    emptyTitle: "No requirements set",
    emptyBody: "Add a strategy document or connect Jira epics so notes rank against what matters to the CIO.",
    document: {
      name: "aether-strategy-fy26.pdf",
      meta: "Uploaded 28 Sep · 6 objectives extracted",
      text: "5G orchestration open network API platform architecture roadmap",
      emptyName: "Upload a document",
      emptyMeta: "Strategy deck, board paper, or objectives document",
    },
    jira: {
      name: "Jira — STRAT board",
      meta: "aether-dynamics.atlassian.net · 2 epics selected",
      text: "strategic epics network platform open API readiness",
      emptyName: "Jira — not connected",
      emptyMeta: "Pull epics and strategic initiatives from your board",
    },
    order: ["document", "jira"],
  },
  product: {
    filledSummary: "Jira sprint connected — 3 tickets in scope including 1 blocked. Ranking reflects delivery priorities.",
    emptyTitle: "No sprint linked",
    emptyBody: "Connect your active Jira sprint so notes rank against what your team is delivering this quarter.",
    document: {
      name: "aether-roadmap-q3.pdf",
      meta: "Uploaded just now · roadmap extracted",
      text: "network console density tokens billing API quarter delivery",
      emptyName: "Upload a document",
      emptyMeta: "Roadmap, PRD, or quarterly plan",
    },
    jira: {
      name: "Jira — NET-OPS · Sprint 14",
      meta: "aether-dynamics.atlassian.net · 3 tickets selected",
      text: "network console density billing usage sprint delivery",
      emptyName: "Jira — not connected",
      emptyMeta: "Active sprint, OKRs, and blocked stories",
    },
    order: ["jira", "document"],
  },
  ba: {
    filledSummary: "Jira connected — 4 tickets matched across OPS and INFRA boards, 3 blocked.",
    emptyTitle: "No tickets linked",
    emptyBody: "Connect your Jira backlog so Shortlist can match release notes to blocked and in-flight tickets.",
    document: {
      name: "aether-ops-runbook.pdf",
      meta: "Uploaded just now · runbook extracted",
      text: "roaming calendar telemetry ingest operations runbook",
      emptyName: "Upload a document",
      emptyMeta: "Ops runbook, requirements spec, or audit log",
    },
    jira: {
      name: "Jira — OPS and INFRA boards",
      meta: "aether-dynamics.atlassian.net · 4 tickets selected",
      text: "roaming calendar telemetry blocked tickets operations",
      emptyName: "Jira — not connected",
      emptyMeta: "Blocked tickets, open incidents, and ops tasks",
    },
    order: ["jira", "document"],
  },
};

const HEXWORTH: Record<PersonaId, PersonaRequirements> = {
  cio: {
    filledSummary: "2 sources active — strategy document and Jira epics. Ranking is live.",
    emptyTitle: "No requirements set",
    emptyBody: "Add a strategy document or connect Jira epics so notes rank against what matters to the CIO.",
    document: {
      name: "hexworth-strategy-fy26.pdf",
      meta: "Uploaded 22 Sep · 5 objectives extracted",
      text: "subscriber identity streaming entitlements open content platform",
      emptyName: "Upload a document",
      emptyMeta: "Strategy deck, board paper, or objectives document",
    },
    jira: {
      name: "Jira — CONTENT board",
      meta: "hexworth.atlassian.net · 2 epics selected",
      text: "subscriber identity content platform strategic epics",
      emptyName: "Jira — not connected",
      emptyMeta: "Pull epics and strategic initiatives from your board",
    },
    order: ["document", "jira"],
  },
  product: {
    filledSummary: "Jira sprint connected — 3 tickets in scope including 1 blocked. Ranking reflects delivery priorities.",
    emptyTitle: "No sprint linked",
    emptyBody: "Connect your active Jira sprint so notes rank against what your team is delivering this quarter.",
    document: {
      name: "hexworth-q3-plan.pdf",
      meta: "Uploaded just now · plan extracted",
      text: "entitlements API partner hub quarterly plan",
      emptyName: "Upload a document",
      emptyMeta: "Roadmap, PRD, or quarterly plan",
    },
    jira: {
      name: "Jira — ENTITLEMENTS · Sprint 14",
      meta: "hexworth.atlassian.net · 3 tickets selected",
      text: "entitlements API partner hub sprint delivery",
      emptyName: "Jira — not connected",
      emptyMeta: "Active sprint, OKRs, and blocked stories",
    },
    order: ["jira", "document"],
  },
  ba: {
    filledSummary: "Jira connected — 4 tickets matched across PLAYBACK and HUB boards, 3 blocked.",
    emptyTitle: "No tickets linked",
    emptyBody: "Connect your Jira backlog so Shortlist can match release notes to blocked and in-flight tickets.",
    document: {
      name: "hexworth-ops-spec.pdf",
      meta: "Uploaded just now · spec extracted",
      text: "playback handoff billing package support tickets",
      emptyName: "Upload a document",
      emptyMeta: "Ops runbook, requirements spec, or audit log",
    },
    jira: {
      name: "Jira — PLAYBACK and HUB boards",
      meta: "hexworth.atlassian.net · 4 tickets selected",
      text: "playback handoff billing package blocked tickets",
      emptyName: "Jira — not connected",
      emptyMeta: "Blocked tickets, open incidents, and ops tasks",
    },
    order: ["jira", "document"],
  },
};

export const REQUIREMENT_COPY: Record<ClientId, Record<PersonaId, PersonaRequirements>> = {
  aether: AETHER,
  hexworth: HEXWORTH,
};
