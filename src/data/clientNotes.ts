import type { ClientId } from "./clients";

export type PersonaId = "cio" | "product" | "ba";
export type HorizonId = "long" | "quarter" | "daily";
export type ImpactClass = "" | "pos" | "neg" | "warn";

export type ImpactTile = {
  val: string;
  cls: ImpactClass;
  lbl: string;
};

export type NoteImpact = {
  cio: ImpactTile[];
  product: ImpactTile[];
  ba: ImpactTile[];
  impactNote_cio: string;
  impactNote_product: string;
  impactNote_ba: string;
};

export type ReleaseNote = {
  id: string;
  tier: HorizonId;
  version: string;
  date: string;
  title: string;
  excerpt: string;
  tags: string[];
  summary: string;
  why: string[];
  scores: Record<PersonaId, number>;
  impact: NoteImpact;
};

export const CLIENT_NOTES: Record<ClientId, ReleaseNote[]> = {
  "aether": [
    {
      "id": "a1",
      "tier": "long",
      "version": "Platform",
      "date": "28 Sep 2026",
      "title": "Multi-year 5G network orchestration platform",
      "excerpt": "Unified service graph across radio, core, edge, and partner networks. Foundation for resilient 5G growth.",
      "tags": [
        "5G",
        "Network",
        "Architecture"
      ],
      "summary": "A new orchestration layer that resolves service state once and fans out to radio, core, edge, and partner systems. Designed to support multi-year network expansion without re-plumbing each market or access type.",
      "why": [
        "Directly supports Aether's long-term network intelligence goal",
        "Unblocks partner roaming and edge-service launches without per-market data forks",
        "Reduces operations escalations from mismatched service state"
      ],
      "scores": {
        "cio": 95,
        "product": 72,
        "ba": 55
      },
      "impact": {
        "cio": [
          {
            "val": "+0.8",
            "cls": "pos",
            "lbl": "Projected NPS uplift"
          },
          {
            "val": "£2.4m",
            "cls": "pos",
            "lbl": "Estimated cost avoidance / yr"
          },
          {
            "val": "3",
            "cls": "warn",
            "lbl": "Strategic risks closed"
          },
          {
            "val": "FY27 Q1",
            "cls": "",
            "lbl": "Readiness milestone"
          }
        ],
        "impactNote_cio": "Closes the single largest architectural risk flagged in the FY26 board review. Enables the multi-market expansion plan without per-region rework.",
        "product": [
          {
            "val": "Q1 FY27",
            "cls": "",
            "lbl": "Delivery dependency cleared"
          },
          {
            "val": "2",
            "cls": "pos",
            "lbl": "Q3 OKRs unblocked"
          },
          {
            "val": "−6 wks",
            "cls": "pos",
            "lbl": "Partner onboarding time reduction"
          },
          {
            "val": "4",
            "cls": "warn",
            "lbl": "Teams with downstream impact"
          }
        ],
        "impactNote_product": "Removes the architectural blocker on the partner roaming stream. Two Q3 OKRs can now move to green without additional infra work.",
        "ba": [
          {
            "val": "11",
            "cls": "pos",
            "lbl": "Jira tickets unblocked"
          },
          {
            "val": "3",
            "cls": "pos",
            "lbl": "Systems affected"
          },
          {
            "val": "~2 days",
            "cls": "",
            "lbl": "Est. implementation effort"
          },
          {
            "val": "0",
            "cls": "pos",
            "lbl": "Rollback risk (hotfix not needed)"
          }
        ],
        "impactNote_ba": "Resolves INFRA-2847, INFRA-2901, and 9 related tickets flagged as blocked on service state consistency. Runbook and edge agent update ship together."
      }
    },
    {
      "id": "a2",
      "tier": "quarter",
      "version": "DS v4.2",
      "date": "30 Sep 2026",
      "title": "Network console design system — density tokens",
      "excerpt": "Compact, default, and comfortable density tokens for high-information network operations consoles.",
      "tags": [
        "Design System",
        "Network ops",
        "Tokens"
      ],
      "summary": "Compact, default, and comfortable density tokens with audited contrast. Data-table, topology, and status-chip components ship with Storybook docs and Figma library sync.",
      "why": [
        "Mapped to Q3 network operations console modernisation OKR",
        "Expected -18% scroll depth on dense service-impact boards",
        "Support and training playbooks updated for new density modes"
      ],
      "scores": {
        "cio": 60,
        "product": 91,
        "ba": 78
      },
      "impact": {
        "cio": [
          {
            "val": "−18%",
            "cls": "pos",
            "lbl": "Scroll depth on ops consoles"
          },
          {
            "val": "£340k",
            "cls": "pos",
            "lbl": "Ops efficiency saving / yr"
          },
          {
            "val": "1",
            "cls": "warn",
            "lbl": "OKR at risk if deferred"
          },
          {
            "val": "Q3",
            "cls": "",
            "lbl": "Target quarter"
          }
        ],
        "impactNote_cio": "Directly supports the Q3 network ops console modernisation commitment to the board. Deferral puts one OKR at risk.",
        "product": [
          {
            "val": "Q3 ✓",
            "cls": "pos",
            "lbl": "OKR delivery status"
          },
          {
            "val": "3",
            "cls": "pos",
            "lbl": "Squads adopting new tokens"
          },
          {
            "val": "Storybook",
            "cls": "",
            "lbl": "Docs shipped"
          },
          {
            "val": "Figma",
            "cls": "",
            "lbl": "Library synced"
          }
        ],
        "impactNote_product": "Closes the design system density gap on the Q3 list. Three squads can adopt immediately; training playbooks are already updated.",
        "ba": [
          {
            "val": "7",
            "cls": "pos",
            "lbl": "Jira tickets resolved"
          },
          {
            "val": "DS-114",
            "cls": "",
            "lbl": "Key ticket closed"
          },
          {
            "val": "~1 day",
            "cls": "",
            "lbl": "Est. implementation effort"
          },
          {
            "val": "Low",
            "cls": "pos",
            "lbl": "Rollback risk"
          }
        ],
        "impactNote_ba": "Closes DS-114 and 6 related density/accessibility tickets. Component swap is additive — no breaking changes to existing console views."
      }
    },
    {
      "id": "a3",
      "tier": "daily",
      "version": "v9.4.1",
      "date": "1 Oct 2026",
      "title": "Network telemetry ingest — edge handoff fix",
      "excerpt": "Hotfix for intermittent telemetry gaps when traffic shifts between 5G core and edge regions.",
      "tags": [
        "Telemetry",
        "5G",
        "Hotfix"
      ],
      "summary": "Addresses intermittent ingest gaps reported by network operations. Patch ships through the edge agent; the runbook includes rollback steps and status-page copy.",
      "why": [
        "Reduces day-to-day operations noise on network health gaps",
        "Protects subscriber experience during busy autumn demand",
        "No change to the long-term orchestration roadmap"
      ],
      "scores": {
        "cio": 40,
        "product": 65,
        "ba": 87
      },
      "impact": {
        "cio": [
          {
            "val": "−0.2",
            "cls": "warn",
            "lbl": "NPS risk if unresolved (per quarter)"
          },
          {
            "val": "Low",
            "cls": "pos",
            "lbl": "Strategic exposure"
          },
          {
            "val": "0",
            "cls": "pos",
            "lbl": "Roadmap items affected"
          },
          {
            "val": "Hotfix",
            "cls": "",
            "lbl": "Patch type"
          }
        ],
        "impactNote_cio": "Low strategic risk but subscriber satisfaction exposure during peak autumn demand. Hotfix resolves without roadmap impact.",
        "product": [
          {
            "val": "0",
            "cls": "pos",
            "lbl": "OKRs impacted"
          },
          {
            "val": "Patch",
            "cls": "",
            "lbl": "Delivery type"
          },
          {
            "val": "<1 hr",
            "cls": "pos",
            "lbl": "Deployment window"
          },
          {
            "val": "Runbook ✓",
            "cls": "pos",
            "lbl": "Rollback plan status"
          }
        ],
        "impactNote_product": "No OKR impact. Edge agent patch deploys in under an hour; rollback is scripted. Safe to ship this sprint.",
        "ba": [
          {
            "val": "5",
            "cls": "pos",
            "lbl": "Open incident tickets closed"
          },
          {
            "val": "OPS-778",
            "cls": "",
            "lbl": "Priority ticket resolved"
          },
          {
            "val": "~4 hrs",
            "cls": "",
            "lbl": "Est. monitoring effort post-patch"
          },
          {
            "val": "Scripted",
            "cls": "pos",
            "lbl": "Rollback available"
          }
        ],
        "impactNote_ba": "Resolves OPS-778 and 4 related telemetry gap incidents. Post-patch monitoring checklist is in the runbook. Status-page copy is pre-staged."
      }
    },
    {
      "id": "a4",
      "tier": "quarter",
      "version": "API 3.1",
      "date": "25 Sep 2026",
      "title": "Billing API — usage threshold notifications",
      "excerpt": "Proactive usage alerts for plans approaching configured billing thresholds.",
      "tags": [
        "Billing API",
        "Usage",
        "Notifications"
      ],
      "summary": "Clients can subscribe to usage events before a plan threshold is reached. The signals feed care tools and network operations so teams can act before a customer is surprised.",
      "why": [
        "Supports the quarter goal of fewer unexpected billing contacts",
        "Feeds day-to-day support macros with clearer service context"
      ],
      "scores": {
        "cio": 55,
        "product": 84,
        "ba": 90
      },
      "impact": {
        "cio": [
          {
            "val": "+0.4",
            "cls": "pos",
            "lbl": "Projected NPS uplift"
          },
          {
            "val": "−12%",
            "cls": "pos",
            "lbl": "Unexpected billing contacts"
          },
          {
            "val": "£180k",
            "cls": "pos",
            "lbl": "Care cost reduction / yr"
          },
          {
            "val": "Q3",
            "cls": "",
            "lbl": "Target quarter"
          }
        ],
        "impactNote_cio": "Billing surprises are the top driver of churn in the 12–24 month tenure band. Proactive threshold alerts close this gap.",
        "product": [
          {
            "val": "Q3 ✓",
            "cls": "pos",
            "lbl": "Feature delivery status"
          },
          {
            "val": "2",
            "cls": "pos",
            "lbl": "Care tool integrations enabled"
          },
          {
            "val": "API 3.1",
            "cls": "",
            "lbl": "Version shipping"
          },
          {
            "val": "0",
            "cls": "pos",
            "lbl": "Breaking changes"
          }
        ],
        "impactNote_product": "Completes the billing signals feature on the Q3 list. Two care tool integrations unblocked immediately; no breaking changes to existing API consumers.",
        "ba": [
          {
            "val": "9",
            "cls": "pos",
            "lbl": "Jira tickets resolved"
          },
          {
            "val": "BILL-203",
            "cls": "",
            "lbl": "Lead ticket closed"
          },
          {
            "val": "~3 hrs",
            "cls": "",
            "lbl": "Est. integration effort"
          },
          {
            "val": "3",
            "cls": "",
            "lbl": "Support macros to update"
          }
        ],
        "impactNote_ba": "Closes BILL-203 and 8 dependent tickets. Three support macros need updating to reference the new threshold context fields — estimated 3 hours."
      }
    },
    {
      "id": "a5",
      "tier": "daily",
      "version": "Ops",
      "date": "2 Oct 2026",
      "title": "Roaming change calendar — overnight sync",
      "excerpt": "Operations calendar sync so roaming windows align with partner maintenance automatically.",
      "tags": [
        "Roaming",
        "Ops",
        "Calendar"
      ],
      "summary": "Automated sync from the partner maintenance calendar into the network platform. Reduces manual operations edits during overnight roaming changes.",
      "why": [
        "Improves day-to-day roaming reliability",
        "Fewer last-minute partner change fire-drills"
      ],
      "scores": {
        "cio": 35,
        "product": 60,
        "ba": 78
      },
      "impact": {
        "cio": [
          {
            "val": "Low",
            "cls": "pos",
            "lbl": "Strategic exposure"
          },
          {
            "val": "£60k",
            "cls": "pos",
            "lbl": "Ops overhead saving / yr"
          },
          {
            "val": "0",
            "cls": "pos",
            "lbl": "Roadmap items affected"
          },
          {
            "val": "Ops",
            "cls": "",
            "lbl": "Change type"
          }
        ],
        "impactNote_cio": "Operational efficiency gain. Low strategic exposure; primarily reduces overnight ops overhead.",
        "product": [
          {
            "val": "0",
            "cls": "pos",
            "lbl": "OKRs impacted"
          },
          {
            "val": "Auto",
            "cls": "pos",
            "lbl": "Sync method"
          },
          {
            "val": "−4 hrs/wk",
            "cls": "pos",
            "lbl": "Manual ops time saved"
          },
          {
            "val": "Low",
            "cls": "pos",
            "lbl": "Implementation risk"
          }
        ],
        "impactNote_product": "No delivery risk. Saves four hours of manual ops edits per week across the roaming team.",
        "ba": [
          {
            "val": "4",
            "cls": "pos",
            "lbl": "Open tickets resolved"
          },
          {
            "val": "OPS-812",
            "cls": "",
            "lbl": "Lead ticket closed"
          },
          {
            "val": "~1 hr",
            "cls": "pos",
            "lbl": "Est. setup effort"
          },
          {
            "val": "0",
            "cls": "pos",
            "lbl": "Manual steps remaining"
          }
        ],
        "impactNote_ba": "Closes OPS-812 and 3 related calendar sync tickets. One-hour setup to configure partner calendar endpoint; fully automated thereafter."
      }
    },
    {
      "id": "a6",
      "tier": "long",
      "version": "Strategy",
      "date": "20 Sep 2026",
      "title": "Open network API readiness roadmap",
      "excerpt": "Phased plan for network, billing, and partner APIs with trust hooks and operator-facing packaging.",
      "tags": [
        "Network API",
        "Interconnect",
        "Roadmap"
      ],
      "summary": "Multi-quarter readiness programme covering network capability APIs, billing integration evidence, and partner-facing packaging for new connectivity services.",
      "why": [
        "Anchors long-term platform openness and service innovation",
        "Aligns network, compliance, and commercial teams on a single narrative"
      ],
      "scores": {
        "cio": 88,
        "product": 70,
        "ba": 50
      },
      "impact": {
        "cio": [
          {
            "val": "£8m+",
            "cls": "pos",
            "lbl": "Addressable partner revenue (FY28)"
          },
          {
            "val": "3",
            "cls": "warn",
            "lbl": "Regulatory milestones enabled"
          },
          {
            "val": "FY27 H2",
            "cls": "",
            "lbl": "First external API target"
          },
          {
            "val": "5",
            "cls": "",
            "lbl": "Teams aligned to roadmap"
          }
        ],
        "impactNote_cio": "Enables the partner ecosystem revenue line in the FY28 plan. Three regulatory milestones depend on open API evidence being in place by H1 FY27.",
        "product": [
          {
            "val": "FY27 H2",
            "cls": "",
            "lbl": "First delivery milestone"
          },
          {
            "val": "3",
            "cls": "warn",
            "lbl": "Squads with planning impact"
          },
          {
            "val": "API-first",
            "cls": "",
            "lbl": "Architecture constraint"
          },
          {
            "val": "2",
            "cls": "",
            "lbl": "Dependency programmes"
          }
        ],
        "impactNote_product": "Three squads need to factor this into H1 FY27 sprint planning. API-first constraint applies to two dependency programmes already in flight.",
        "ba": [
          {
            "val": "0",
            "cls": "pos",
            "lbl": "Immediate tickets impacted"
          },
          {
            "val": "Roadmap",
            "cls": "",
            "lbl": "Artefact type"
          },
          {
            "val": "FY27",
            "cls": "",
            "lbl": "First implementation phase"
          },
          {
            "val": "Low",
            "cls": "pos",
            "lbl": "Near-term ops impact"
          }
        ],
        "impactNote_ba": "No immediate operational action required. First implementation phase is FY27. Useful context for understanding the API direction before tooling decisions are made."
      }
    }
  ],
  "hexworth": [
    {
      "id": "h1",
      "tier": "quarter",
      "version": "API v2.4",
      "date": "29 Sep 2026",
      "title": "Streaming entitlements API v2.4 — flexible content access",
      "excerpt": "New package access and entitlement-preview endpoints for content partners — core Q3 subscriber deliverable.",
      "tags": [
        "Entitlements",
        "API",
        "Content"
      ],
      "summary": "Partners can preview and activate content access without waiting for legacy batch jobs. Includes sandbox fixtures and versioned deprecation of v1 catalogue endpoints.",
      "why": [
        "Primary Q3 deliverable for subscriber experience growth",
        "Unblocks four content integrations waiting on flexible package rules",
        "Reduces custom extracts from media operations"
      ],
      "scores": {
        "cio": 75,
        "product": 97,
        "ba": 88
      },
      "impact": {
        "cio": [
          {
            "val": "+1.2",
            "cls": "pos",
            "lbl": "Projected NPS uplift"
          },
          {
            "val": "4",
            "cls": "warn",
            "lbl": "Partner integrations unblocked"
          },
          {
            "val": "£1.8m",
            "cls": "pos",
            "lbl": "Partner revenue at risk if delayed"
          },
          {
            "val": "Q3 ✓",
            "cls": "pos",
            "lbl": "Board commitment status"
          }
        ],
        "impactNote_cio": "Q3 subscriber experience commitment to the board. Four partner integrations are currently blocked on this — delay directly risks the £1.8m partner revenue pipeline.",
        "product": [
          {
            "val": "Q3 ✓",
            "cls": "pos",
            "lbl": "OKR delivery status"
          },
          {
            "val": "4",
            "cls": "pos",
            "lbl": "Partner integrations unblocked"
          },
          {
            "val": "v1 API",
            "cls": "warn",
            "lbl": "Deprecation to communicate"
          },
          {
            "val": "Sandbox ✓",
            "cls": "pos",
            "lbl": "Test fixtures shipped"
          }
        ],
        "impactNote_product": "Primary Q3 delivery. Four integrations can now proceed. v1 catalogue endpoint deprecation needs partner comms within 30 days — assign owner.",
        "ba": [
          {
            "val": "14",
            "cls": "pos",
            "lbl": "Jira tickets unblocked"
          },
          {
            "val": "ENT-441",
            "cls": "",
            "lbl": "Lead ticket closed"
          },
          {
            "val": "~1 day",
            "cls": "",
            "lbl": "Est. integration effort per partner"
          },
          {
            "val": "Sandbox ✓",
            "cls": "pos",
            "lbl": "Test environment available"
          }
        ],
        "impactNote_ba": "Closes ENT-441 and 13 related tickets across four partner integration streams. Sandbox fixtures mean testing can begin immediately without prod access."
      }
    },
    {
      "id": "h2",
      "tier": "long",
      "version": "Platform",
      "date": "22 Sep 2026",
      "title": "Cross-service subscriber identity framework",
      "excerpt": "Long-term framework for subscriber identity across streaming, set-top, and partner experiences.",
      "tags": [
        "Identity",
        "Streaming",
        "Architecture"
      ],
      "summary": "Defines how subscribers sign in, manage profiles, and carry entitlements across mobile, web, set-top, and partner apps. Telemetry feeds the audience console; onboarding is API-driven.",
      "why": [
        "Cornerstone of long-term connected media growth",
        "Sets the experience model for multi-year content and distribution deals"
      ],
      "scores": {
        "cio": 94,
        "product": 78,
        "ba": 55
      },
      "impact": {
        "cio": [
          {
            "val": "+2.5",
            "cls": "pos",
            "lbl": "Projected NPS uplift (FY28)"
          },
          {
            "val": "£12m",
            "cls": "pos",
            "lbl": "New distribution deal enablement"
          },
          {
            "val": "3",
            "cls": "warn",
            "lbl": "Strategic risks closed"
          },
          {
            "val": "FY27 H1",
            "cls": "",
            "lbl": "Identity framework target date"
          }
        ],
        "impactNote_cio": "Foundational for the multi-year connected media strategy. Three distribution deals in negotiation are contingent on cross-service identity being in place.",
        "product": [
          {
            "val": "FY27 H1",
            "cls": "",
            "lbl": "First delivery milestone"
          },
          {
            "val": "4",
            "cls": "warn",
            "lbl": "Squads with planning dependency"
          },
          {
            "val": "API-driven",
            "cls": "",
            "lbl": "Onboarding model"
          },
          {
            "val": "2",
            "cls": "",
            "lbl": "Programmes in flight affected"
          }
        ],
        "impactNote_product": "Four squads need to account for identity framework constraints in FY27 sprint planning. Two dependency programmes already in flight need architecture review.",
        "ba": [
          {
            "val": "0",
            "cls": "pos",
            "lbl": "Immediate tickets impacted"
          },
          {
            "val": "FY27",
            "cls": "",
            "lbl": "First ops touchpoint"
          },
          {
            "val": "Low",
            "cls": "pos",
            "lbl": "Near-term ops impact"
          },
          {
            "val": "Roadmap",
            "cls": "",
            "lbl": "Artefact type"
          }
        ],
        "impactNote_ba": "No immediate operational action. First ops touchpoint is FY27. Useful as background for understanding identity data flows ahead of tooling decisions."
      }
    },
    {
      "id": "h3",
      "tier": "daily",
      "version": "v6.2.1",
      "date": "1 Oct 2026",
      "title": "Hexworth app — playback handoff fix",
      "excerpt": "Faster playback handoff with clearer package availability across the day-to-day app path.",
      "tags": [
        "App",
        "Playback",
        "UX"
      ],
      "summary": "Streamlined handoff from browse to playback reduces drop-off. Availability copy aligns across app, care macros, and entitlement checks; analytics cover each funnel step.",
      "why": [
        "Cuts day-to-day support contacts on package confusion",
        "Protects viewing satisfaction during the autumn release push"
      ],
      "scores": {
        "cio": 42,
        "product": 72,
        "ba": 86
      },
      "impact": {
        "cio": [
          {
            "val": "+0.3",
            "cls": "pos",
            "lbl": "Projected NPS uplift"
          },
          {
            "val": "−8%",
            "cls": "pos",
            "lbl": "Package confusion contacts"
          },
          {
            "val": "Low",
            "cls": "pos",
            "lbl": "Strategic risk"
          },
          {
            "val": "Hotfix",
            "cls": "",
            "lbl": "Delivery type"
          }
        ],
        "impactNote_cio": "Subscriber satisfaction protection during the autumn peak. Low strategic risk but meaningful NPS contribution if left unresolved over the season.",
        "product": [
          {
            "val": "0",
            "cls": "pos",
            "lbl": "OKRs impacted"
          },
          {
            "val": "App ✓",
            "cls": "pos",
            "lbl": "Analytics instrumented"
          },
          {
            "val": "Care ✓",
            "cls": "pos",
            "lbl": "Macros aligned"
          },
          {
            "val": "<1 sprint",
            "cls": "pos",
            "lbl": "Delivery window"
          }
        ],
        "impactNote_product": "No OKR impact. Analytics cover the full browse-to-playback funnel. Care macros and entitlement copy are already aligned — nothing else to ship.",
        "ba": [
          {
            "val": "6",
            "cls": "pos",
            "lbl": "Open tickets resolved"
          },
          {
            "val": "APP-559",
            "cls": "",
            "lbl": "Lead ticket closed"
          },
          {
            "val": "3",
            "cls": "",
            "lbl": "Support macros to verify"
          },
          {
            "val": "~2 hrs",
            "cls": "",
            "lbl": "Est. verification effort"
          }
        ],
        "impactNote_ba": "Closes APP-559 and 5 related handoff/availability copy tickets. Three support macros need a spot check to confirm copy alignment — estimated 2 hours."
      }
    },
    {
      "id": "h4",
      "tier": "quarter",
      "version": "Hub 5.0",
      "date": "27 Sep 2026",
      "title": "Content partner hub — event retries and signed payloads",
      "excerpt": "Reliable content-package event delivery with signed payloads for partner integrations.",
      "tags": [
        "Partner Hub",
        "Webhooks",
        "Security"
      ],
      "summary": "Exponential backoff retries, dead-letter queue, and signed payloads for content and entitlement events. Partner docs and the test collection are updated.",
      "why": [
        "Supports the Q3 active-integration growth target",
        "Reduces partner support tickets on missed package events"
      ],
      "scores": {
        "cio": 65,
        "product": 90,
        "ba": 82
      },
      "impact": {
        "cio": [
          {
            "val": "−40%",
            "cls": "pos",
            "lbl": "Partner event failure rate"
          },
          {
            "val": "£420k",
            "cls": "pos",
            "lbl": "Partner support cost reduction / yr"
          },
          {
            "val": "Q3 ✓",
            "cls": "pos",
            "lbl": "Integration reliability target"
          },
          {
            "val": "5",
            "cls": "pos",
            "lbl": "Partner integrations strengthened"
          }
        ],
        "impactNote_cio": "Directly addresses the partner reliability gap flagged in Q2. Signed payloads close a security requirement from two enterprise partners.",
        "product": [
          {
            "val": "Q3 ✓",
            "cls": "pos",
            "lbl": "Reliability OKR status"
          },
          {
            "val": "DLQ ✓",
            "cls": "pos",
            "lbl": "Dead-letter queue active"
          },
          {
            "val": "Docs ✓",
            "cls": "pos",
            "lbl": "Partner docs updated"
          },
          {
            "val": "0",
            "cls": "pos",
            "lbl": "Breaking changes"
          }
        ],
        "impactNote_product": "Closes the Q3 partner reliability OKR. Dead-letter queue is live; test collection and partner docs are updated. No breaking changes to existing integrations.",
        "ba": [
          {
            "val": "8",
            "cls": "pos",
            "lbl": "Tickets resolved"
          },
          {
            "val": "HUB-302",
            "cls": "",
            "lbl": "Lead ticket closed"
          },
          {
            "val": "~3 hrs",
            "cls": "",
            "lbl": "Partner notification effort"
          },
          {
            "val": "Scripted",
            "cls": "pos",
            "lbl": "Rollback available"
          }
        ],
        "impactNote_ba": "Closes HUB-302 and 7 related reliability tickets. Partners need notification of the signed payload requirement — template is in the updated docs. Rollback is scripted."
      }
    },
    {
      "id": "h5",
      "tier": "daily",
      "version": "Ops",
      "date": "2 Oct 2026",
      "title": "Billing run — October package change window",
      "excerpt": "Scheduled maintenance for October billing and package updates; status pages pre-staged.",
      "tags": [
        "Billing API",
        "Ops",
        "Change"
      ],
      "summary": "Standard monthly change window with freeze rules, rollback plan, and status-page templates for support and content partners.",
      "why": [
        "Keeps day-to-day billing and package operations predictable",
        "Partners notified through the hub ahead of the freeze"
      ],
      "scores": {
        "cio": 38,
        "product": 65,
        "ba": 82
      },
      "impact": {
        "cio": [
          {
            "val": "Low",
            "cls": "pos",
            "lbl": "Strategic risk"
          },
          {
            "val": "Scheduled",
            "cls": "",
            "lbl": "Change type"
          },
          {
            "val": "0",
            "cls": "pos",
            "lbl": "Revenue items at risk"
          },
          {
            "val": "Partners ✓",
            "cls": "pos",
            "lbl": "Notification status"
          }
        ],
        "impactNote_cio": "Standard monthly ops window. No strategic risk; partners are pre-notified via the hub.",
        "product": [
          {
            "val": "0",
            "cls": "pos",
            "lbl": "OKRs impacted"
          },
          {
            "val": "Freeze ✓",
            "cls": "",
            "lbl": "Code freeze in effect"
          },
          {
            "val": "Rollback ✓",
            "cls": "pos",
            "lbl": "Plan available"
          },
          {
            "val": "Low",
            "cls": "pos",
            "lbl": "Delivery risk"
          }
        ],
        "impactNote_product": "No delivery risk. Code freeze is in effect during the window. Rollback plan and status-page templates are pre-staged.",
        "ba": [
          {
            "val": "2",
            "cls": "pos",
            "lbl": "Ops tickets resolved"
          },
          {
            "val": "BILL-417",
            "cls": "",
            "lbl": "Lead ticket closed"
          },
          {
            "val": "Status ✓",
            "cls": "pos",
            "lbl": "Pages pre-staged"
          },
          {
            "val": "~30 min",
            "cls": "",
            "lbl": "Monitoring check required"
          }
        ],
        "impactNote_ba": "Closes BILL-417 and 1 related ops ticket. Status pages are pre-staged for support and partners. Post-window monitoring check is approximately 30 minutes."
      }
    },
    {
      "id": "h6",
      "tier": "long",
      "version": "Strategy",
      "date": "18 Sep 2026",
      "title": "Open content APIs — streaming roadmap",
      "excerpt": "Multi-year exposure plan: catalogue sync, entitlement signals, and package identity for media partners.",
      "tags": [
        "Content API",
        "Streaming",
        "Roadmap"
      ],
      "summary": "Phased exposure of content and streaming APIs to app developers and distribution partners, with commercial packaging and trust controls.",
      "why": [
        "Anchors a long-term API-first media platform narrative",
        "Aligns product, legal, and partner teams on sequencing"
      ],
      "scores": {
        "cio": 92,
        "product": 75,
        "ba": 52
      },
      "impact": {
        "cio": [
          {
            "val": "£15m+",
            "cls": "pos",
            "lbl": "Addressable API revenue (FY28)"
          },
          {
            "val": "4",
            "cls": "warn",
            "lbl": "Distribution deals contingent on roadmap"
          },
          {
            "val": "FY27 H2",
            "cls": "",
            "lbl": "First external API milestone"
          },
          {
            "val": "3",
            "cls": "",
            "lbl": "Regulatory items enabled"
          }
        ],
        "impactNote_cio": "Four distribution deals in active negotiation reference open API capability as a prerequisite. FY28 revenue projections assume this roadmap is on track.",
        "product": [
          {
            "val": "FY27 H2",
            "cls": "",
            "lbl": "First delivery milestone"
          },
          {
            "val": "3",
            "cls": "warn",
            "lbl": "Squads with planning impact"
          },
          {
            "val": "API-first",
            "cls": "",
            "lbl": "Architecture constraint"
          },
          {
            "val": "Legal ✓",
            "cls": "",
            "lbl": "Trust controls scoped"
          }
        ],
        "impactNote_product": "Three squads need to align FY27 planning to the API-first constraint. Legal has scoped the trust controls — commercial packaging is the next dependency.",
        "ba": [
          {
            "val": "0",
            "cls": "pos",
            "lbl": "Immediate tickets impacted"
          },
          {
            "val": "Roadmap",
            "cls": "",
            "lbl": "Artefact type"
          },
          {
            "val": "FY27",
            "cls": "",
            "lbl": "First ops touchpoint"
          },
          {
            "val": "Low",
            "cls": "pos",
            "lbl": "Near-term ops impact"
          }
        ],
        "impactNote_ba": "No immediate ops action. First touchpoint is FY27 when catalogue sync tooling begins. Useful context ahead of any API-adjacent tooling decisions."
      }
    },
    {
      "id": "h7",
      "tier": "daily",
      "version": "v4.1.2",
      "date": "30 Sep 2026",
      "title": "Support desktop — entitlement context update",
      "excerpt": "Updated support macros and deep-links into the entitlement API for faster subscriber access resolution.",
      "tags": [
        "Support",
        "Entitlements",
        "Tooling"
      ],
      "summary": "Agents get one-click context from access tickets into the relevant package and entitlement preview. Reduces average handle time.",
      "why": [
        "Improves day-to-day subscriber support efficiency",
        "Uses new entitlement API surfaces from the quarter release"
      ],
      "scores": {
        "cio": 45,
        "product": 68,
        "ba": 80
      },
      "impact": {
        "cio": [
          {
            "val": "−15%",
            "cls": "pos",
            "lbl": "Average support handle time"
          },
          {
            "val": "£95k",
            "cls": "pos",
            "lbl": "Care cost reduction / yr"
          },
          {
            "val": "Low",
            "cls": "pos",
            "lbl": "Strategic risk"
          },
          {
            "val": "Ops",
            "cls": "",
            "lbl": "Change type"
          }
        ],
        "impactNote_cio": "Meaningful care cost reduction from a low-risk ops change. Handles one of the top subscriber pain points in the Q3 NPS verbatim analysis.",
        "product": [
          {
            "val": "0",
            "cls": "pos",
            "lbl": "OKRs impacted"
          },
          {
            "val": "ENT API ✓",
            "cls": "pos",
            "lbl": "Entitlement surfaces used"
          },
          {
            "val": "−15%",
            "cls": "pos",
            "lbl": "Projected handle time reduction"
          },
          {
            "val": "Low",
            "cls": "pos",
            "lbl": "Delivery risk"
          }
        ],
        "impactNote_product": "Low-risk ops improvement that uses the entitlement API surfaces already shipped this quarter. No new infrastructure needed.",
        "ba": [
          {
            "val": "5",
            "cls": "pos",
            "lbl": "Tickets resolved"
          },
          {
            "val": "SUP-188",
            "cls": "",
            "lbl": "Lead ticket closed"
          },
          {
            "val": "~2 hrs",
            "cls": "",
            "lbl": "Agent training update effort"
          },
          {
            "val": "Deep-links ✓",
            "cls": "pos",
            "lbl": "One-click context live"
          }
        ],
        "impactNote_ba": "Closes SUP-188 and 4 related support tooling tickets. Agent training update is approximately 2 hours. Deep-links to entitlement preview are live immediately."
      }
    }
  ]
};

export function notesFor(clientId: ClientId): ReleaseNote[] {
  return CLIENT_NOTES[clientId];
}
