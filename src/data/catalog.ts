import type { CatalogItem } from "../types";

export const CATALOG: CatalogItem[] = [
  {
    id: "opportunity-hygiene",
    name: "Opportunity hygiene",
    blurb:
      "Clean opportunity data so forecasts and pipeline reviews stay trustworthy for the sales team.",
    themes: ["data", "process", "revenue", "workflow"],
    roles: ["ba", "product_lead"],
    effort: "low",
    attributes: ["Sales Cloud", "pipeline", "forecast", "data quality"],
  },
  {
    id: "case-deflection",
    name: "Case deflection",
    blurb:
      "Deflect routine service cases with guided help so agents spend less time on repeat customer work.",
    themes: ["customer", "adoption", "cost", "workflow"],
    roles: ["product_lead", "cio"],
    effort: "mid",
    attributes: ["Service Cloud", "knowledge", "case volume"],
  },
  {
    id: "lead-scoring",
    name: "Lead scoring",
    blurb:
      "Score inbound leads so sales teams raise forecast accuracy on the pipeline and convert the buyers most likely to close.",
    themes: ["revenue", "customer", "adoption", "release"],
    roles: ["product_lead"],
    effort: "mid",
    attributes: ["Einstein", "conversion", "pipeline", "Salesforce platform", "forecast accuracy"],
  },
  {
    id: "cpq-quote-path",
    name: "CPQ quote path",
    blurb: "Shorten the quote-to-cash path with guided pricing and approval rules.",
    themes: ["revenue", "process", "requirements", "cost"],
    roles: ["ba", "product_lead", "cio"],
    effort: "high",
    attributes: ["CPQ", "pricing", "approvals", "quote"],
  },
  {
    id: "data-cloud-unification",
    name: "Data Cloud unification",
    blurb:
      "Unify customer profiles on one platform to cut duplicate data and integration risk.",
    themes: ["platform", "data", "integration", "risk", "security"],
    roles: ["cio", "ba"],
    effort: "high",
    attributes: ["Data Cloud", "identity", "profiles", "governance"],
  },
  {
    id: "slack-sales-alerts",
    name: "Slack sales alerts",
    blurb: "Push deal-risk alerts into Slack so revenue teams act before the quarter slips.",
    themes: ["revenue", "integration", "adoption", "release"],
    roles: ["product_lead", "cio"],
    effort: "low",
    attributes: ["Slack", "alerts", "pipeline", "collaboration"],
  },
  {
    id: "field-service-scheduling",
    name: "Field Service scheduling",
    blurb: "Schedule field technicians against work orders with fewer missed customer windows.",
    themes: ["customer", "workflow", "process", "cost"],
    roles: ["ba", "product_lead"],
    effort: "mid",
    attributes: ["Field Service", "scheduling", "work orders", "technicians"],
  },
  {
    id: "experience-cloud-portal",
    name: "Experience Cloud portal",
    blurb: "Give customers a secure portal for orders, cases, and account self-service.",
    themes: ["security", "customer", "platform", "adoption"],
    roles: ["cio", "product_lead"],
    effort: "high",
    attributes: ["Experience Cloud", "portal", "self-service", "authentication"],
  },
];

export function findCatalogItem(id: string): CatalogItem | undefined {
  return CATALOG.find((item) => item.id === id);
}
