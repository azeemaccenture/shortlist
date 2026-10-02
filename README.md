# Shortlist

Role-aware shortlist for Salesforce-related features. A buyer captures one session context, browses a fixed catalog, and gets a deterministic top 5 with a next step on each pick.

## Demo path

1. Intake at `/` — choose CIO, Product Lead, or BA, then upload a brief or finish the assistant.
2. Catalog at `/catalog` — eight seed features. Optional mock Jira and Salesforce syncs write into the same context.
3. Top 5 at `/shortlist`.
4. Detail at `/items/:id` — score breakdown and one next step.

Upload lines use `Goal:`, `Constraint:`, and `Priority: label | weight` (3–5 priorities). Load sample FY brief skips needing a local file.

## Run

```bash
npm install
npm test
npm run dev
```
