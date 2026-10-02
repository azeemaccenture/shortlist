import { beforeEach, describe, expect, it, vi } from "vitest";
import { attachDocument, clearSources, connectJira, readSources, removeSource, requirementText } from "./requirements";

const memory = new Map<string, string>();

beforeEach(() => {
  memory.clear();
  vi.stubGlobal("sessionStorage", {
    getItem: (key: string) => memory.get(key) ?? null,
    setItem: (key: string, value: string) => {
      memory.set(key, value);
    },
    removeItem: (key: string) => {
      memory.delete(key);
    },
  });
});

describe("requirement sources", () => {
  it("keeps a sync for every profile on the same client", () => {
    connectJira("aether", "cio");
    attachDocument("aether", "product", "roadmap.pdf");

    expect(readSources("aether", "cio").jira?.name).toBe("Jira — STRAT board");
    expect(readSources("aether", "product").jira?.name).toBe("Jira — STRAT board");
    expect(readSources("aether", "ba").document?.name).toBe("roadmap.pdf");
    expect(requirementText("aether", "ba")).toContain("strategic");
    expect(requirementText("aether", "cio")).toContain("density");
    expect(requirementText("hexworth", "ba")).toBe("");
  });

  it("drops one source without clearing the other", () => {
    connectJira("hexworth", "ba");
    attachDocument("hexworth", "ba", "hexworth-ops-spec.pdf");
    removeSource("hexworth", "ba", "jira");

    expect(readSources("hexworth", "ba").jira).toBeUndefined();
    expect(readSources("hexworth", "cio").document?.name).toBe("hexworth-ops-spec.pdf");
    expect(requirementText("hexworth", "product")).toContain("Playback");
    expect(readSources("hexworth", "ba").document?.extracts?.length).toBeGreaterThan(0);

    clearSources("hexworth", "ba");
    expect(requirementText("hexworth", "ba")).toBe("");
  });
});
