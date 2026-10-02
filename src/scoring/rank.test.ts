import { describe, expect, it } from "vitest";
import { CATALOG } from "../data/catalog";
import { JIRA_BOTTLENECKS } from "../data/jiraMock";
import { SALESFORCE_RECORDS } from "../data/salesforceMock";
import { parseUpload } from "../intake/parseUpload";
import { SAMPLE_BRIEF, SAMPLE_FILE_NAME } from "../intake/sampleBrief";
import type { CatalogItem, DimensionId, Role, ScoredItem, ShortlistContext } from "../types";
import {
  changeLoadScore,
  compareScored,
  configEvidenceScore,
  demandSignalScore,
  feasibilityScore,
  rankTop,
  scoreItem,
  strategicFitScore,
  tagIntersectsPriority,
  WEIGHTS,
} from "./rank";

function sampleContext(role: Role, sources: ShortlistContext["sources"] = {}): ShortlistContext {
  const parsed = parseUpload(SAMPLE_BRIEF);
  return {
    role,
    goals: parsed.goals,
    constraints: parsed.constraints,
    priorities: parsed.priorities,
    sources: {
      upload: { fileName: SAMPLE_FILE_NAME, parsedAt: "2026-10-02T00:00:00.000Z" },
      ...sources,
    },
  };
}

function item(partial: Partial<CatalogItem> & Pick<CatalogItem, "id" | "name">): CatalogItem {
  return {
    summary: "",
    cloud: "Platform",
    strategyTags: [],
    relatedObjectsUsed: 0,
    packageInstalled: false,
    usageLast90d: 0,
    usageThreshold: 50,
    adminReady: false,
    demandCount: 0,
    urgency: "low",
    effortBand: "M",
    blockerFlag: false,
    dependencyCount: 0,
    changeLoadBand: "med",
    requiresDataMigration: false,
    touchesSharedObjects: false,
    ...partial,
  };
}

function dimension(row: ScoredItem, id: DimensionId) {
  const found = row.dimensions.find((entry) => entry.id === id);
  if (!found) throw new Error(`missing ${id}`);
  return found;
}

function stub(partial: Pick<ScoredItem, "rawScore" | "item"> & Partial<ScoredItem>): ScoredItem {
  const base = scoreItem(sampleContext("ba"), partial.item);
  return { ...base, ...partial, item: partial.item };
}

describe("v1.1 formulas", () => {
  it("matches a tag when a token equals or prefixes another token of length at least 4", () => {
    expect(tagIntersectsPriority("forecasting", "pipeline forecast accuracy")).toBe(true);
    expect(tagIntersectsPriority("service-speed", "speed to serve")).toBe(true);
    expect(tagIntersectsPriority("ai", "aim high")).toBe(false);
    expect(tagIntersectsPriority("cat", "catalog cleanup")).toBe(false);
    expect(tagIntersectsPriority("nurture", "pipeline forecast accuracy")).toBe(false);
  });

  it("scores strategic fit from tag overlap and uses 50 when there are no priorities", () => {
    const forecasting = item({ id: "fit", name: "Fit", strategyTags: ["forecasting", "pipeline", "ai"] });
    const sample = sampleContext("product_lead");
    expect(strategicFitScore(forecasting, sample)).toBe(50);
    expect(strategicFitScore(forecasting, { ...sample, priorities: [] })).toBe(50);
    expect(
      strategicFitScore(forecasting, {
        ...sample,
        priorities: [{ label: "forecast accuracy", weight: 1 }],
      }),
    ).toBe(100);
  });

  it("scores config evidence, demand, feasibility, and change load on the v1.1 rules", () => {
    expect(configEvidenceScore(item({ id: "bare", name: "Bare" }))).toBe(10);
    expect(
      configEvidenceScore(
        item({
          id: "rich",
          name: "Rich",
          relatedObjectsUsed: 2,
          packageInstalled: true,
          usageLast90d: 80,
          usageThreshold: 50,
          adminReady: true,
        }),
      ),
    ).toBe(100);
    expect(demandSignalScore(item({ id: "d", name: "D", demandCount: 3, urgency: "med" }))).toBe(55);
    expect(demandSignalScore(item({ id: "hot", name: "Hot", demandCount: 1023, urgency: "high" }))).toBe(100);
    expect(feasibilityScore(item({ id: "s", name: "S", effortBand: "S" }))).toBe(95);
    expect(
      feasibilityScore(
        item({ id: "blocked", name: "Blocked", effortBand: "XL", blockerFlag: true, dependencyCount: 4 }),
      ),
    ).toBe(0);
    expect(changeLoadScore(item({ id: "easy", name: "Easy", changeLoadBand: "low" }))).toBe(90);
    expect(
      changeLoadScore(
        item({
          id: "hard",
          name: "Hard",
          changeLoadBand: "high",
          requiresDataMigration: true,
          touchesSharedObjects: true,
        }),
      ),
    ).toBe(0);
  });
});

describe("rankTop", () => {
  it("is stable and returns five rows for the seed catalog", () => {
    const context = sampleContext("product_lead");
    const first = rankTop(context, CATALOG);
    const second = rankTop(context, CATALOG);
    expect(first).toHaveLength(5);
    expect(second.map((row) => row.item.id)).toEqual(first.map((row) => row.item.id));
    expect(CATALOG).toHaveLength(8);
  });

  it("ranks the sample brief with Sales weights for Product Lead and Ops weights for CIO", () => {
    const productLead = rankTop(sampleContext("product_lead"), CATALOG);
    const cio = rankTop(sampleContext("cio"), CATALOG);
    const ba = rankTop(sampleContext("ba"), CATALOG);

    expect(productLead.map((row) => row.item.name)).toEqual([
      "Deal-risk pipeline forecasting",
      "Tableau Knowledge",
      "Agent Skills and Plugins",
      "Informatica Headless",
      "Agentic Segmentation and Activation",
    ]);
    expect(productLead[0].score).toBe(78.8);
    expect(productLead[1].score).toBe(78.8);
    expect(productLead[0].reason).toBe("Led by Config Evidence (25.0) and Demand Signal (25.0).");
    expect(productLead[0].contrastClause).toBe("Outranks Tableau Knowledge (78.8).");
    expect(productLead[0].sensitiveToWeights).toBe(true);
    expect(productLead[0].nextStep).toBe("Share this shortlist");
    expect(dimension(productLead[0], "changeLoad").weight).toBe(0);
    expect(dimension(productLead[0], "changeLoad").score).toBe(50);

    expect(cio[0].item.name).toBe("Tableau Knowledge");
    expect(cio[0].score).toBe(82.5);
    expect(cio[0].reason).toBe("Led by Change Load (22.5) and Config Evidence (20.0).");
    expect(cio.map((row) => row.item.name)).not.toEqual(productLead.map((row) => row.item.name));

    expect(ba[0].item.name).toBe("Tableau Knowledge");
    expect(ba[0].score).toBe(81.5);
    expect(WEIGHTS.ba.strategicFit).toBe(0.275);
    expect(WEIGHTS.product_lead.strategicFit).toBe(0.35);
    expect(WEIGHTS.cio.changeLoad).toBe(0.25);
  });

  it("breaks equal scores by strategic fit, then effort band, then id", () => {
    const shared = item({ id: "sf-feat-m", name: "Middle", strategyTags: ["pipeline"] });
    const higherFit = stub({
      rawScore: 40,
      item: { ...shared, id: "sf-feat-b", strategyTags: ["pipeline", "forecasting"] },
      dimensions: [
        { id: "strategicFit", label: "Strategic Fit", score: 80, weight: 0.2, contribution: 16 },
        { id: "configEvidence", label: "Config Evidence", score: 0, weight: 0, contribution: 0 },
        { id: "demandSignal", label: "Demand Signal", score: 0, weight: 0, contribution: 0 },
        { id: "feasibility", label: "Feasibility", score: 0, weight: 0, contribution: 0 },
        { id: "changeLoad", label: "Change Load", score: 0, weight: 0, contribution: 0 },
      ],
    });
    const lowerFitSmallerEffort = stub({
      rawScore: 40,
      item: { ...shared, id: "sf-feat-c", effortBand: "S" },
      dimensions: higherFit.dimensions.map((entry) =>
        entry.id === "strategicFit" ? { ...entry, score: 20, contribution: 4 } : entry,
      ),
    });
    const sameFitLaterId = stub({
      rawScore: 40,
      item: { ...shared, id: "sf-feat-z", effortBand: "XL" },
      dimensions: lowerFitSmallerEffort.dimensions,
    });
    const sameFitEarlierId = stub({
      rawScore: 40,
      item: { ...shared, id: "sf-feat-a", effortBand: "XL" },
      dimensions: lowerFitSmallerEffort.dimensions,
    });
    const higherScore = stub({
      rawScore: 90,
      item: { ...shared, id: "sf-feat-9" },
      dimensions: lowerFitSmallerEffort.dimensions,
    });

    const ordered = [sameFitLaterId, higherFit, lowerFitSmallerEffort, sameFitEarlierId, higherScore].sort(
      compareScored,
    );
    expect(ordered.map((row) => row.item.id)).toEqual([
      "sf-feat-9",
      "sf-feat-b",
      "sf-feat-c",
      "sf-feat-a",
      "sf-feat-z",
    ]);
  });

  it("does not add points for Jira or Salesforce, and still writes the backlog next step", () => {
    const context = sampleContext("product_lead");
    const paired = CATALOG.find((entry) => entry.name === "Deal-risk pipeline forecasting");
    const unpaired = CATALOG.find((entry) => entry.name === "Tableau Knowledge");
    if (!paired || !unpaired) throw new Error("catalog fixtures missing");

    const beforePaired = scoreItem(context, paired);
    const beforeUnpaired = scoreItem(context, unpaired);
    const withJira = sampleContext("product_lead", {
      jiraMock: { syncedAt: "2026-10-02T01:00:00.000Z", bottlenecks: JIRA_BOTTLENECKS },
    });
    const pairedAfter = scoreItem(withJira, paired);
    expect(pairedAfter.score).toBe(beforePaired.score);
    expect(pairedAfter.rawScore).toBe(beforePaired.rawScore);
    expect(scoreItem(withJira, unpaired).score).toBe(beforeUnpaired.score);
    expect(pairedAfter.nextStep).toBe(
      "Take \u201CDeal-risk pipeline forecasting\u201D to the backlog against BOT-14",
    );
    expect(pairedAfter.reason.startsWith("Led by")).toBe(true);

    const mixedCase = sampleContext("product_lead", {
      jiraMock: {
        syncedAt: "2026-10-02T01:00:00.000Z",
        bottlenecks: [
          { id: "BOT-22", summary: "Voice wait times", pairedFeature: "agentforce contact center" },
        ],
      },
    });
    const voice = CATALOG.find((entry) => entry.name === "Agentforce Contact Center");
    if (!voice) throw new Error("catalog fixture missing");
    const voiceScored = scoreItem(mixedCase, voice);
    expect(voiceScored.score).toBeLessThan(70);
    expect(voiceScored.nextStep).toBe(
      "Take \u201CAgentforce Contact Center\u201D to the backlog against BOT-22",
    );

    const withSalesforce = sampleContext("ba", {
      salesforceMock: { syncedAt: "2026-10-02T01:00:00.000Z", records: SALESFORCE_RECORDS },
    });
    const target = CATALOG.find((entry) => entry.id === "sf-feat-005");
    if (!target) throw new Error("catalog fixture missing");
    expect(scoreItem(withSalesforce, target).rawScore).toBe(scoreItem(sampleContext("ba"), target).rawScore);
    expect(scoreItem(sampleContext("product_lead"), voice).nextStep).toBe(
      "Request an estimate for \u201CAgentforce Contact Center\u201D",
    );
  });

  it("flags a near tie and adds a contrast clause when the next score is within 5", () => {
    const cio = rankTop(sampleContext("cio"), CATALOG);
    const deal = cio.find((row) => row.item.name === "Deal-risk pipeline forecasting");
    const informatica = cio.find((row) => row.item.name === "Informatica Headless");
    if (!deal || !informatica) throw new Error("expected CIO rows");
    expect(Math.abs(deal.score - informatica.score)).toBeLessThan(3);
    expect(deal.sensitiveToWeights).toBe(true);
    expect(informatica.sensitiveToWeights).toBe(true);
    expect(deal.contrastClause).toContain("Informatica Headless");
    expect(cio[0].contrastClause).toBeUndefined();
  });
});
