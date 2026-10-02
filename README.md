# Shortlist

Role-aware shortlist of Salesforce Winter '27 release 264 features. A buyer captures one session context, browses a fixed catalog, and gets a deterministic top 5 with a v1.1 score and a next step on each pick.

## Demo path

1. Agency home at `/` — Winter ’27 headlines, deliverables, and the most relevant features for Aether Dynamics and Hexworth.
2. Open a client portal. The top-right login switches CIO, Product Lead, or BA and rescores the shortlist.
3. Intake at `/clients/:clientId/intake` — upload a brief or finish the assistant.
4. Catalog at `/clients/:clientId/catalog` — eight Winter '27 features. Optional mock Jira and Salesforce syncs write into the same context and do not add points.
5. Top 5 at `/clients/:clientId/shortlist`.
6. Detail at `/clients/:clientId/items/:id` — score breakdown and one next step.

Release headlines and client-salient lines are a seeded mock. Catalog cards keep their short summaries.

Upload lines use `Goal:`, `Constraint:`, and `Priority: label | weight` (3–5 priorities). Load sample FY brief skips needing a local file.

## Run

```bash
npm install
npm test
npm run dev
```

## Firebase Hosting

The app is a static Vite build. `firebase.json` sends every path to `index.html` so client routes keep working after a refresh.

The repo targets the Firebase project and hosting site `shortlist-hackathon`. This environment cannot complete Google login, so the publish runs on your machine:

```bash
npm install
npx firebase-tools login
npm run deploy:hosting
```

`deploy:hosting` builds `dist/` and publishes it. When it finishes, the app replaces the default page at `https://shortlist-hackathon.web.app` and `https://shortlist-hackathon.firebaseapp.com`.
