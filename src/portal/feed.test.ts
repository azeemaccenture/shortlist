import { describe, expect, it } from "vitest";
import { notesFor } from "../data/clientNotes";
import { leadSignal, rerankFromText, visibleNotes } from "./feed";

describe("release feed", () => {
  const aether = notesFor("aether");

  it("sorts Aether notes by the CIO score", () => {
    const titles = visibleNotes(aether, "cio", "all", "", null).map((note) => note.id);
    expect(titles[0]).toBe("a1");
    expect(titles.at(-1)).toBe("a5");
  });

  it("changes order when the persona changes", () => {
    const cio = visibleNotes(aether, "cio", "all", "", null).map((note) => note.id);
    const product = visibleNotes(aether, "product", "all", "", null).map((note) => note.id);
    expect(product[0]).toBe("a2");
    expect(product.join()).not.toBe(cio.join());
  });

  it("filters by horizon and search", () => {
    expect(visibleNotes(aether, "cio", "daily", "", null).every((note) => note.tier === "daily")).toBe(true);
    expect(visibleNotes(aether, "cio", "all", "roaming", null).map((note) => note.id)).toEqual(["a5"]);
  });

  it("picks a signed impact tile for the card", () => {
    const lead = leadSignal(aether[0], "cio");
    expect(lead.val).toBe("+0.8");
    expect(lead.lbl).toContain("NPS");
  });

  it("re-ranks from requirement text without a network call", () => {
    const scores = rerankFromText(aether, "ba", "roaming calendar overnight");
    expect(scores).not.toBeNull();
    expect(scores?.a5).toBeGreaterThan(aether.find((note) => note.id === "a5")!.scores.ba);
    expect(rerankFromText(aether, "cio", "  ")).toBeNull();
  });
});
