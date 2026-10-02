import type { JiraBottleneck } from "../types";

export const JIRA_BOTTLENECKS: JiraBottleneck[] = [
  {
    id: "BOT-14",
    summary: "Forecast calls miss deal risk until the quarter slips",
    pairedFeature: "Deal-risk pipeline forecasting",
  },
  {
    id: "BOT-22",
    summary: "Contact center handoffs still depend on a third-party CCaaS",
    pairedFeature: "Agentforce Contact Center",
  },
  {
    id: "BOT-31",
    summary: "Quote cycles miss risk signals before renewal",
    pairedFeature: "Revenue Management Agent quoting",
  },
  {
    id: "BOT-40",
    summary: "Governed data jobs cannot be called from the tools teams already use",
    pairedFeature: "Informatica Headless",
  },
];
