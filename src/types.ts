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

export type CatalogItem = {
  id: string;
  name: string;
  blurb: string;
  themes: string[];
  roles: Role[];
  effort: "low" | "mid" | "high";
  attributes: string[];
};

export type ScoreFactors = {
  role: number;
  goals: number;
  constraints: number;
  priorities: number;
  jira: number;
  salesforce: number;
};

export type MatchedPriority = {
  label: string;
  weight: number;
  points: number;
};

export type ScoredItem = {
  item: CatalogItem;
  score: number;
  reason: string;
  factors: ScoreFactors;
  matchedGoals: string[];
  matchedConstraints: string[];
  matchedPriorities: MatchedPriority[];
  bottleneck?: JiraBottleneck;
  nextStep: string;
};

export const ROLE_LABELS: Record<Role, string> = {
  cio: "CIO",
  product_lead: "Product Lead",
  ba: "BA",
};

export const ROLES: Role[] = ["cio", "product_lead", "ba"];
