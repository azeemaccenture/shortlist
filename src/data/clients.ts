import type { ShortlistContext } from "../types";

export type ClientId = "aether" | "hexworth";

export type ClientProfile = {
  id: ClientId;
  name: string;
  tag: string;
  description: string;
  meta: string;
  mark: "grid" | "prism";
};

export const CLIENTS: Record<ClientId, ClientProfile> = {
  aether: {
    id: "aether",
    name: "Aether Dynamics",
    tag: "Telecom · Network UI · 5G operations",
    description:
      "5G network orchestration, service telemetry, and design-system releases — tuned to the rollout roadmap.",
    meta: "Network · Winter ’27",
    mark: "grid",
  },
  hexworth: {
    id: "hexworth",
    name: "Hexworth",
    tag: "Streaming · Entitlements · Partner growth",
    description:
      "Content packages, billing APIs, and streaming entitlements — aligned with subscriber growth and retention.",
    meta: "Streaming · Winter ’27",
    mark: "prism",
  },
};

export function isClientId(value: string | undefined): value is ClientId {
  return value === "aether" || value === "hexworth";
}

/** Manager-side lenses. Aether is read as CIO / Ops; Hexworth as Product Lead / Sales. */
export const CLIENT_PREVIEWS: Record<ClientId, ShortlistContext> = {
  aether: {
    role: "cio",
    goals: ["Cut network operations cost", "Keep 5G service telemetry trustworthy"],
    constraints: ["Salesforce platform", "Shared-object change risk"],
    priorities: [
      { label: "ops efficiency", weight: 5 },
      { label: "data quality", weight: 4 },
      { label: "service speed", weight: 3 },
      { label: "leadership", weight: 2 },
    ],
    sources: {},
  },
  hexworth: {
    role: "product_lead",
    goals: ["Grow subscriber revenue", "Raise content-package adoption"],
    constraints: ["Salesforce platform", "Partner integration risk"],
    priorities: [
      { label: "pipeline forecasting", weight: 5 },
      { label: "quote to cash", weight: 4 },
      { label: "nurture", weight: 3 },
    ],
    sources: {},
  },
};
