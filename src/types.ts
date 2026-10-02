export type Role = "cio" | "product_lead" | "ba";

export type Priority = {
  label: string;
  weight: number;
};

export type JiraBottleneck = {
  id: string;
  summary: string;
  pairedFeature: string;
};

export type SalesforceRecord = {
  id: string;
  name: string;
  type: string;
  fields: Record<string, string>;
};

export type ShortlistContext = {
  role: Role;
  goals: string[];
  constraints: string[];
  priorities: Priority[];
  sources: {
    upload?: { fileName: string; parsedAt: string };
    va?: { turns: number; confirmedAt: string };
    jiraMock?: { syncedAt: string; bottlenecks: JiraBottleneck[] };
    salesforceMock?: { syncedAt: string; records: SalesforceRecord[] };
  };
};

export type Cloud = "Sales" | "Service" | "Marketing" | "Platform" | "Analytics";
export type Urgency = "low" | "med" | "high";
export type EffortBand = "S" | "M" | "L" | "XL";
export type ChangeLoadBand = "low" | "med" | "high";

export type CatalogItem = {
  id: string;
  name: string;
  summary: string;
  cloud: Cloud;
  strategyTags: string[];
  relatedObjectsUsed: number;
  packageInstalled: boolean;
  usageLast90d: number;
  usageThreshold: number;
  adminReady: boolean;
  demandCount: number;
  urgency: Urgency;
  effortBand: EffortBand;
  blockerFlag: boolean;
  dependencyCount: number;
  changeLoadBand: ChangeLoadBand;
  requiresDataMigration: boolean;
  touchesSharedObjects: boolean;
};

export type DimensionId =
  | "strategicFit"
  | "configEvidence"
  | "demandSignal"
  | "feasibility"
  | "changeLoad";

export type DimensionBreakdown = {
  id: DimensionId;
  label: string;
  score: number;
  weight: number;
  contribution: number;
};

export type ScoredItem = {
  item: CatalogItem;
  score: number;
  rawScore: number;
  reason: string;
  dimensions: DimensionBreakdown[];
  bottleneck?: JiraBottleneck;
  nextStep: string;
  contrastClause?: string;
  sensitiveToWeights: boolean;
};

export const ROLE_LABELS: Record<Role, string> = {
  cio: "CIO",
  product_lead: "Product Lead",
  ba: "BA",
};

export const ROLES: Role[] = ["cio", "product_lead", "ba"];

export const CLOUDS: Cloud[] = ["Sales", "Service", "Marketing", "Platform", "Analytics"];

/** Session roles stay as they are. Each one uses a v1.1 weight profile. */
export const ROLE_WEIGHT_PROFILE: Record<Role, "Sales" | "Ops" | "Consolidated"> = {
  product_lead: "Sales",
  cio: "Ops",
  ba: "Consolidated",
};
