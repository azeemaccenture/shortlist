import type { ClientId } from "./clients";
import type { PersonaId } from "./clientNotes";

export type SourceKind = "document" | "jira";
export type ExtractTag = "obj" | "risk" | "commit";

export type Extract = {
  tag: ExtractTag;
  text: string;
};

export type RecentFile = {
  name: string;
  meta: string;
};

export type SourceTemplate = {
  name: string;
  meta: string;
  text: string;
  emptyName: string;
  emptyMeta: string;
};

export type DocumentTemplate = SourceTemplate & {
  recentFiles: RecentFile[];
  uploadSteps: string[];
  extracts: Extract[];
};

export type JiraTemplate = SourceTemplate & {
  host: string;
};

export type PersonaRequirements = {
  filledSummary: string;
  emptyTitle: string;
  emptyBody: string;
  document: DocumentTemplate;
  jira: JiraTemplate;
  order: SourceKind[];
};

function documentText(extracts: Extract[]) {
  return extracts.map((item) => item.text).join(" ");
}

const AETHER: Record<PersonaId, PersonaRequirements> = {
  cio: {
    filledSummary: "2 sources active — strategy document and Jira epics. Ranking is live.",
    emptyTitle: "No requirements set",
    emptyBody: "Add a strategy document or connect Jira epics so notes rank against what matters to the CIO.",
    document: {
      name: "aether-strategy-fy26.pdf",
      meta: "Uploaded 28 Sep · 6 objectives extracted",
      text: "",
      emptyName: "Upload a document",
      emptyMeta: "Strategy deck, board paper, or objectives document",
      recentFiles: [
        { name: "aether-strategy-fy26.pdf", meta: "24 pages · Modified 28 Sep" },
        { name: "board-objectives-q3.pptx", meta: "18 slides · Modified 22 Sep" },
      ],
      uploadSteps: [
        "Reading document structure…",
        "Extracting objectives and commitments…",
        "Mapping to FY goals…",
        "Done",
      ],
      extracts: [
        { tag: "obj", text: "Network intelligence platform — unified service graph by FY26 Q4" },
        { tag: "obj", text: "Open API readiness — partner ecosystem revenue line by FY28" },
        { tag: "risk", text: "Service state mismatches flagged as top escalation driver in Q2 ops review" },
        { tag: "commit", text: "5G orchestration platform — presented to board Sep 2026, delivery Nov 2026" },
      ],
    },
    jira: {
      name: "Jira — STRAT board",
      meta: "aether-dynamics.atlassian.net · 2 epics selected",
      text: "strategic epics network platform open API readiness",
      emptyName: "Jira — not connected",
      emptyMeta: "Pull epics and strategic initiatives from your board",
      host: "aether-dynamics.atlassian.net",
    },
    order: ["document", "jira"],
  },
  product: {
    filledSummary: "Jira sprint connected — 3 tickets in scope including 1 blocked. Ranking reflects delivery priorities.",
    emptyTitle: "No sprint linked",
    emptyBody: "Connect your active Jira sprint so notes rank against what your team is delivering this quarter.",
    document: {
      name: "q3-roadmap-oct-2026.pdf",
      meta: "Uploaded just now · roadmap extracted",
      text: "",
      emptyName: "Upload a document",
      emptyMeta: "Roadmap, PRD, or quarterly plan",
      recentFiles: [
        { name: "q3-roadmap-oct-2026.pdf", meta: "12 pages · Modified 1 Oct" },
        { name: "network-ops-prd-v3.docx", meta: "8 pages · Modified 25 Sep" },
      ],
      uploadSteps: [
        "Reading document structure…",
        "Extracting OKRs and sprint goals…",
        "Matching to delivery milestones…",
        "Done",
      ],
      extracts: [
        { tag: "obj", text: "Q3 OKR: Network ops console modernisation — density tokens shipped" },
        { tag: "obj", text: "Q3 OKR: Billing surprise reduction — threshold alerts integrated" },
        { tag: "risk", text: "Dependency on API 3.1 for billing alerts integration — blocked" },
        { tag: "commit", text: "Design system v4.2 adoption committed for Sprint 14 close" },
      ],
    },
    jira: {
      name: "Jira — NET-OPS · Sprint 14",
      meta: "aether-dynamics.atlassian.net · 3 tickets selected",
      text: "network console density billing usage sprint delivery",
      emptyName: "Jira — not connected",
      emptyMeta: "Active sprint, OKRs, and blocked stories",
      host: "aether-dynamics.atlassian.net",
    },
    order: ["jira", "document"],
  },
  ba: {
    filledSummary: "Jira connected — 4 tickets matched across OPS and INFRA boards, 3 blocked.",
    emptyTitle: "No tickets linked",
    emptyBody: "Connect your Jira backlog so Shortlist can match release notes to blocked and in-flight tickets.",
    document: {
      name: "ops-runbook-oct-2026.pdf",
      meta: "Uploaded just now · runbook extracted",
      text: "",
      emptyName: "Upload a document",
      emptyMeta: "Ops runbook, requirements spec, or audit log",
      recentFiles: [
        { name: "ops-runbook-oct-2026.pdf", meta: "16 pages · Modified 30 Sep" },
        { name: "infra-requirements-v2.docx", meta: "9 pages · Modified 18 Sep" },
      ],
      uploadSteps: [
        "Reading document structure…",
        "Extracting ops requirements…",
        "Matching to open ticket labels…",
        "Done",
      ],
      extracts: [
        { tag: "obj", text: "Jira plug-in compatibility required for all network ops tooling updates" },
        { tag: "obj", text: "Roaming calendar sync — eliminate overnight manual edits by end of Q3" },
        { tag: "risk", text: "Telemetry ingest gaps flagged as P1 — OPS-778 unresolved since 24 Sep" },
        { tag: "commit", text: "Billing threshold alerts must integrate with care tool macros before Oct billing run" },
      ],
    },
    jira: {
      name: "Jira — OPS and INFRA boards",
      meta: "aether-dynamics.atlassian.net · 4 tickets selected",
      text: "roaming calendar telemetry blocked tickets operations",
      emptyName: "Jira — not connected",
      emptyMeta: "Blocked tickets, open incidents, and ops tasks",
      host: "aether-dynamics.atlassian.net",
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
      text: "",
      emptyName: "Upload a document",
      emptyMeta: "Strategy deck, board paper, or objectives document",
      recentFiles: [
        { name: "hexworth-strategy-fy26.pdf", meta: "20 pages · Modified 22 Sep" },
        { name: "content-board-q3.pptx", meta: "14 slides · Modified 18 Sep" },
      ],
      uploadSteps: [
        "Reading document structure…",
        "Extracting objectives and commitments…",
        "Mapping to FY goals…",
        "Done",
      ],
      extracts: [
        { tag: "obj", text: "Subscriber identity across streaming, set-top, and partner experiences" },
        { tag: "obj", text: "Open content APIs — streaming roadmap and partner revenue by FY28" },
        { tag: "risk", text: "Entitlement mismatches flagged as a support driver in the Q2 review" },
        { tag: "commit", text: "Content platform presented to the board Sep 2026" },
      ],
    },
    jira: {
      name: "Jira — CONTENT board",
      meta: "hexworth.atlassian.net · 2 epics selected",
      text: "subscriber identity content platform strategic epics",
      emptyName: "Jira — not connected",
      emptyMeta: "Pull epics and strategic initiatives from your board",
      host: "hexworth.atlassian.net",
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
      text: "",
      emptyName: "Upload a document",
      emptyMeta: "Roadmap, PRD, or quarterly plan",
      recentFiles: [
        { name: "hexworth-q3-plan.pdf", meta: "11 pages · Modified 1 Oct" },
        { name: "entitlements-prd.docx", meta: "9 pages · Modified 26 Sep" },
      ],
      uploadSteps: [
        "Reading document structure…",
        "Extracting OKRs and sprint goals…",
        "Matching to delivery milestones…",
        "Done",
      ],
      extracts: [
        { tag: "obj", text: "Q3 OKR: Entitlements API v2.4 partner onboarding" },
        { tag: "obj", text: "Q3 OKR: Partner hub signed payloads" },
        { tag: "risk", text: "Playback handoff blocked on entitlement context" },
        { tag: "commit", text: "Content package access committed for the October window" },
      ],
    },
    jira: {
      name: "Jira — ENTITLEMENTS · Sprint 14",
      meta: "hexworth.atlassian.net · 3 tickets selected",
      text: "entitlements API partner hub sprint delivery",
      emptyName: "Jira — not connected",
      emptyMeta: "Active sprint, OKRs, and blocked stories",
      host: "hexworth.atlassian.net",
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
      text: "",
      emptyName: "Upload a document",
      emptyMeta: "Ops runbook, requirements spec, or audit log",
      recentFiles: [
        { name: "hexworth-ops-spec.pdf", meta: "14 pages · Modified 29 Sep" },
        { name: "playback-requirements.docx", meta: "8 pages · Modified 19 Sep" },
      ],
      uploadSteps: [
        "Reading document structure…",
        "Extracting ops requirements…",
        "Matching to open ticket labels…",
        "Done",
      ],
      extracts: [
        { tag: "obj", text: "Playback handoff must clear before the October billing run" },
        { tag: "obj", text: "Entitlement context for the support desktop" },
        { tag: "risk", text: "Package change window tickets blocked on billing" },
        { tag: "commit", text: "Signed payload retries for the partner hub" },
      ],
    },
    jira: {
      name: "Jira — PLAYBACK and HUB boards",
      meta: "hexworth.atlassian.net · 4 tickets selected",
      text: "playback handoff billing package blocked tickets",
      emptyName: "Jira — not connected",
      emptyMeta: "Blocked tickets, open incidents, and ops tasks",
      host: "hexworth.atlassian.net",
    },
    order: ["jira", "document"],
  },
};

for (const client of [AETHER, HEXWORTH]) {
  for (const persona of Object.values(client)) {
    persona.document.text = documentText(persona.document.extracts);
  }
}

export const REQUIREMENT_COPY: Record<ClientId, Record<PersonaId, PersonaRequirements>> = {
  aether: AETHER,
  hexworth: HEXWORTH,
};

export const EXTRACT_LABEL: Record<ExtractTag, string> = {
  obj: "Objective",
  risk: "Risk",
  commit: "Board commit",
};
