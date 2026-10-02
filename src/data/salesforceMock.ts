import type { SalesforceRecord } from "../types";

export const SALESFORCE_RECORDS: SalesforceRecord[] = [
  {
    id: "SF-100",
    name: "Northwind expansion",
    type: "Opportunity",
    fields: { Product: "Lead scoring", Stage: "Commit" },
  },
  {
    id: "SF-240",
    name: "Harbor Health",
    type: "Account",
    fields: { Segment: "Enterprise", Cloud: "Service" },
  },
  {
    id: "SF-318",
    name: "Quote cycle review",
    type: "Task",
    fields: { Related: "CPQ quote path" },
  },
];
