import { describe, expect, it } from "vitest";
import { CATALOG } from "../data/catalog";
import { JIRA_BOTTLENECKS } from "../data/jiraMock";
import { SALESFORCE_RECORDS } from "../data/salesforceMock";
import { parseUpload } from "../intake/parseUpload";
import { SAMPLE_BRIEF, SAMPLE_FILE_NAME } from "../intake/sampleBrief";
import type { CatalogItem, Role, ShortlistContext } from "../types";
import { rankTop, scoreItem } from "./rank";

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
    blurb: "",
    themes: [],
    roles: [],
    effort: "low",
    attributes: [],
    ...partial,
  };
}

describe("rankTop", () => {
  it("is stable and returns five rows for the seed catalog", () => {
    const context = sampleContext("product_lead");
    const first = rankTop(context, CATALOG);
    const second = rankTop(context, CATALOG);
    expect(first).toHaveLength(5);
    expect(second).toEqual(first);
  });

  it("breaks score ties by name", () => {
    const shared = {
      blurb: "same blurb text",
      themes: ["risk"],
      roles: ["cio" as const],
      effort: "low" as const,
      attributes: ["platform"],
    };
    const catalog = [
      item({ id: "b", name: "Bravo", ...shared }),
      item({ id: "a", name: "Alpha", ...shared }),
    ];
    const context = sampleContext("cio");
    context.goals = ["zzzz unique goal"];
    context.constraints = ["yyyy unique constraint"];
    context.priorities = [
      { label: "qqq none", weight: 1 },
      { label: "rrr none", weight: 1 },
      { label: "sss none", weight: 1 },
    ];
    const ranked = rankTop(context, catalog);
    expect(ranked.map((row) => row.item.name)).toEqual(["Alpha", "Bravo"]);
    expect(ranked[0].score).toBe(ranked[1].score);
  });

  it("adds Jira points only when that source is present and the feature is paired", () => {
    const context = sampleContext("product_lead");
    const paired = CATALOG.find((entry) => entry.name === "Opportunity hygiene");
    const unpaired = CATALOG.find((entry) => entry.name === "Lead scoring");
    if (!paired || !unpaired) throw new Error("catalog fixtures missing");

    const beforePaired = scoreItem(context, paired).score;
    const beforeUnpaired = scoreItem(context, unpaired).score;
    const withJira = sampleContext("product_lead", {
      jiraMock: { syncedAt: "2026-10-02T01:00:00.000Z", bottlenecks: JIRA_BOTTLENECKS },
    });
    expect(scoreItem(withJira, paired).score - beforePaired).toBe(10);
    expect(scoreItem(withJira, unpaired).score - beforeUnpaired).toBe(0);
    expect(scoreItem(withJira, paired).reason).toContain("Paired to Jira bottleneck");
    expect(scoreItem(withJira, paired).nextStep).toContain("BOT-14");
  });

  it("adds Salesforce points only when that source is present", () => {
    const context = sampleContext("ba");
    const target = CATALOG.find((entry) => entry.name === "Lead scoring");
    if (!target) throw new Error("catalog fixture missing");
    const before = scoreItem(context, target).factors.salesforce;
    const withSalesforce = sampleContext("ba", {
      salesforceMock: { syncedAt: "2026-10-02T01:00:00.000Z", records: SALESFORCE_RECORDS },
    });
    expect(before).toBe(0);
    expect(scoreItem(withSalesforce, target).factors.salesforce).toBe(5);
  });

  it("ranks the sample brief differently for CIO and Product Lead", () => {
    const productLead = rankTop(sampleContext("product_lead"), CATALOG).map((row) => row.item.name);
    const cio = rankTop(sampleContext("cio"), CATALOG).map((row) => row.item.name);
    expect(productLead).not.toEqual(cio);
    expect(productLead[0]).toBe("Lead scoring");
    expect(cio).toContain("Data Cloud unification");
  });

  it("cites role, priority, goal, or constraint, and clamps at 100", () => {
    const roleOnly = scoreItem(sampleContext("cio"), item({ id: "w", name: "Widget", roles: ["cio"] }));
    roleOnly && expect(roleOnly.reason).toBe("Fits the CIO lens");

    const goalItem = scoreItem(
      {
        ...sampleContext("ba"),
        goals: ["pipeline review"],
        constraints: ["zzzz unique constraint"],
        priorities: [
          { label: "qqq none", weight: 1 },
          { label: "rrr none", weight: 1 },
          { label: "sss none", weight: 1 },
        ],
      },
      item({ id: "g", name: "Gamma", blurb: "pipeline review notes" }),
    );
    expect(goalItem.reason).toBe("Supports your goal \u201Cpipeline review\u201D");

    const constraintItem = scoreItem(
      {
        ...sampleContext("ba"),
        goals: ["zzzz unique goal"],
        constraints: ["budget freeze"],
        priorities: [
          { label: "qqq none", weight: 1 },
          { label: "rrr none", weight: 1 },
          { label: "sss none", weight: 1 },
        ],
      },
      item({ id: "c", name: "Delta", blurb: "budget freeze noted" }),
    );
    expect(constraintItem.reason).toBe("Respects constraint \u201Cbudget freeze\u201D");

    const weak = scoreItem(
      {
        ...sampleContext("ba"),
        goals: ["zzzz unique goal"],
        constraints: ["yyyy unique constraint"],
        priorities: [
          { label: "qqq none", weight: 1 },
          { label: "rrr none", weight: 1 },
          { label: "sss none", weight: 1 },
        ],
      },
      item({ id: "z", name: "Zed", blurb: "unrelated copy" }),
    );
    expect(weak.reason).toBe("Weak fit for this context");
    expect(weak.nextStep).toBe("Request an estimate for \u201CZed\u201D");

    const saturated = item({
      id: "hot",
      name: "Alpha feature",
      blurb: "alpha bravo charlie delta echo",
      themes: ["risk", "platform", "security", "cost", "integration"],
      roles: ["cio"],
      attributes: ["stay", "current", "salesforce", "prefer", "low"],
    });
    const hotContext: ShortlistContext = {
      role: "cio",
      goals: ["alpha bravo charlie delta echo"],
      constraints: ["stay current salesforce prefer low"],
      priorities: [
        { label: "alpha", weight: 1 },
        { label: "bravo", weight: 1 },
        { label: "charlie", weight: 1 },
      ],
      sources: {
        upload: { fileName: "a.txt", parsedAt: "2026-10-02T00:00:00.000Z" },
        jiraMock: {
          syncedAt: "2026-10-02T01:00:00.000Z",
          bottlenecks: [{ id: "BOT-1", summary: "Blocked", pairedFeature: "Alpha feature" }],
        },
        salesforceMock: {
          syncedAt: "2026-10-02T01:00:00.000Z",
          records: [{ id: "SF-1", name: "Alpha deal", type: "Opportunity", fields: { Note: "alpha" } }],
        },
      },
    };
    const hot = scoreItem(hotContext, saturated);
    expect(hot.factors.role + hot.factors.goals + hot.factors.constraints + hot.factors.priorities).toBe(90);
    expect(hot.score).toBe(100);
    expect(hot.nextStep).toContain("BOT-1");

    const shareable = scoreItem(
      {
        ...hotContext,
        sources: {
          upload: hotContext.sources.upload,
          salesforceMock: hotContext.sources.salesforceMock,
        },
      },
      saturated,
    );
    expect(shareable.score).toBeGreaterThanOrEqual(70);
    expect(shareable.nextStep).toBe("Share this shortlist");
  });
});
