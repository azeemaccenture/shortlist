import { describe, expect, it } from "vitest";
import { CLIENTS } from "./clients";
import { SALESFORCE_SHIPPED } from "./salesforceReleaseNotes";
import { salesforceNoteCount, salesforceNotesFor } from "./salesforceClientNotes";
import { leadSignal, rerankFromText, visibleNotes } from "../portal/feed";

describe("salesforce client feed", () => {
  const sharedCount = SALESFORCE_SHIPPED.filter((card) => card.client === null).length;
  const aetherOwned = SALESFORCE_SHIPPED.filter((card) => card.client === "aether");
  const hexworthOwned = SALESFORCE_SHIPPED.filter((card) => card.client === "hexworth");

  it("includes client-routed cards plus the shared drop for Aether", () => {
    const list = salesforceNotesFor("aether");
    expect(list).toHaveLength(sharedCount + aetherOwned.length);
    expect(salesforceNoteCount("aether")).toBe(list.length);
    for (const card of aetherOwned) {
      const match = list.find((note) => note.id === `aether-${card.id}`);
      expect(match, `aether note for ${card.id}`).toBeDefined();
      expect(match!.tags).toContain(CLIENTS.aether.name);
    }
  });

  it("includes client-routed cards plus the shared drop for Hexworth", () => {
    const list = salesforceNotesFor("hexworth");
    expect(list).toHaveLength(sharedCount + hexworthOwned.length);
    for (const card of hexworthOwned) {
      const match = list.find((note) => note.id === `hexworth-${card.id}`);
      expect(match, `hexworth note for ${card.id}`).toBeDefined();
      expect(match!.tags).toContain(CLIENTS.hexworth.name);
    }
  });

  it("tags shared cards as a shared release", () => {
    const list = salesforceNotesFor("aether");
    const sharedNote = list.find((note) => note.id === "aether-sf-264-slack-code");
    expect(sharedNote).toBeDefined();
    expect(sharedNote!.tags).toContain("Shared release");
  });

  it("populates every ReleaseNote field the feed and persona panel read", () => {
    for (const clientId of ["aether", "hexworth"] as const) {
      for (const note of salesforceNotesFor(clientId)) {
        expect(note.id).toMatch(new RegExp(`^${clientId}-`));
        expect(["long", "quarter", "daily"]).toContain(note.tier);
        expect(note.version).toBe("Winter ’27");
        expect(note.title.length).toBeGreaterThan(0);
        expect(note.excerpt.length).toBeGreaterThan(0);
        expect(note.summary.length).toBeGreaterThan(note.excerpt.length);
        expect(note.tags.length).toBeGreaterThanOrEqual(3);
        expect(note.why.length).toBeGreaterThanOrEqual(2);
        for (const persona of ["cio", "product", "ba"] as const) {
          expect(note.scores[persona]).toBeGreaterThan(0);
          expect(note.impact[persona]).toHaveLength(4);
          expect(note.impact[`impactNote_${persona}`].length).toBeGreaterThan(0);
        }
      }
    }
  });

  it("boosts client-matched cards above the shared baseline for the same tier", () => {
    const aether = salesforceNotesFor("aether");
    const matched = aether.find((note) => note.id === "aether-sf-264-agentforce-contact-center");
    const shared = aether.find((note) => note.id === "aether-sf-264-adaptive-dynamic-plans");
    expect(matched).toBeDefined();
    expect(shared).toBeDefined();
    expect(matched!.scores.cio).toBeGreaterThan(shared!.scores.cio);
  });

  it("shows a different impact metric for each role", () => {
    const note = salesforceNotesFor("aether").find((item) => item.id === "aether-sf-264-agentforce-contact-center");
    expect(note).toBeDefined();
    expect(leadSignal(note!, "cio")).toMatchObject({ val: "+0.8", lbl: "NPS outlook" });
    expect(leadSignal(note!, "product")).toMatchObject({ val: "Elevated", lbl: "Measure of success" });
    expect(leadSignal(note!, "ba").lbl).toBe("Active Jira tickets");
    expect(note!.impact.impactNote_ba).toMatch(/This fix would solve \d+ active Jira tickets/);
    expect(note!.impact.impactNote_product).toMatch(/Elevated measure of success: Containment moves \+18%/);
    expect(leadSignal(note!, "cio").lbl).not.toBe(leadSignal(note!, "ba").lbl);
  });

  it("re-ranks against uploaded requirement text", () => {
    const aether = salesforceNotesFor("aether");
    const overrides = rerankFromText(aether, "cio", "voice contact centre dispatch roaming");
    expect(overrides).not.toBeNull();
    const topFirst = visibleNotes(aether, "cio", "all", "", overrides).map((note) => note.id);
    expect(topFirst[0]).toBe("aether-sf-264-agentforce-contact-center");
  });
});
