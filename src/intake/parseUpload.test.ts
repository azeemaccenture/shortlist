import { describe, expect, it } from "vitest";
import { SAMPLE_BRIEF } from "./sampleBrief";
import { parsePriorityLine, parseUpload } from "./parseUpload";
import { briefError } from "./validate";

describe("parseUpload", () => {
  it("reads the sample FY brief", () => {
    const parsed = parseUpload(SAMPLE_BRIEF);
    expect(parsed.goals).toEqual([
      "Raise revenue forecast accuracy for the sales pipeline",
      "Cut service cost by deflecting repeat customer cases",
    ]);
    expect(parsed.constraints).toEqual([
      "Stay on the current Salesforce platform",
      "Prefer low integration risk",
    ]);
    expect(parsed.priorities).toEqual([
      { label: "pipeline forecast accuracy", weight: 5 },
      { label: "customer adoption", weight: 4 },
      { label: "revenue conversion", weight: 3 },
      { label: "case deflection", weight: 2 },
    ]);
    expect(briefError(parsed)).toBeNull();
  });

  it("rejects an empty file", () => {
    const parsed = parseUpload("");
    expect(parsed.recognized).toBe(0);
    expect(briefError(parsed)).toBe("That file has no Goal, Constraint, or Priority lines.");
  });

  it("rejects a file with no recognized lines", () => {
    expect(briefError(parseUpload("Hello team\nPlease review."))).toMatch(/no Goal, Constraint, or Priority/);
  });

  it("rejects priorities outside 3 to 5 or with a bad weight", () => {
    const tooFew = parseUpload(
      "Goal: Ship the portal\nConstraint: Stay on Salesforce\nPriority: portal | 2\nPriority: security | 1\n",
    );
    expect(briefError(tooFew)).toMatch(/3 to 5 priorities/);

    expect(parsePriorityLine("label without weight").weight).toBeNaN();
    const badWeight = parseUpload(
      "Goal: Ship\nConstraint: Budget\nPriority: one | 1\nPriority: two | 0\nPriority: three | 2\n",
    );
    expect(briefError(badWeight)).toMatch(/positive weight/);
  });
});
