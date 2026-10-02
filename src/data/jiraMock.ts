import type { JiraBottleneck } from "../types";

export const JIRA_BOTTLENECKS: JiraBottleneck[] = [
  {
    id: "BOT-14",
    summary: "Stale opportunity stages are slipping the forecast",
    pairedFeature: "Opportunity hygiene",
  },
  {
    id: "BOT-22",
    summary: "Repeat how-to cases are stacking the service backlog",
    pairedFeature: "Case deflection",
  },
  {
    id: "BOT-31",
    summary: "Quote approvals are missing the release window",
    pairedFeature: "CPQ quote path",
  },
  {
    id: "BOT-40",
    summary: "Duplicate profiles block a single customer view",
    pairedFeature: "Data Cloud unification",
  },
];
