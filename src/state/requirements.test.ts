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
  it("stores a mock Jira connection and document per client and persona", () => {
    connectJira("aether", "cio");
    attachDocument("aether", "product", "roadmap.pdf");

    expect(readSources("aether", "cio").jira?.name).toBe("Jira — STRAT board");
    expect(readSources("aether", "product").document?.name).toBe("roadmap.pdf");
    expect(readSources("aether", "cio").document).toBeUndefined();
    expect(requirementText("aether", "cio")).toContain("strategic");
    expect(requirementText("hexworth", "ba")).toBe("");
  });

  it("drops one source without clearing the other", () => {
    connectJira("hexworth", "ba");
    attachDocument("hexworth", "ba", "hexworth-ops-spec.pdf");
    removeSource("hexworth", "ba", "jira");

    expect(readSources("hexworth", "ba").jira).toBeUndefined();
    expect(requirementText("hexworth", "ba")).toContain("playback");

    clearSources("hexworth", "ba");
    expect(requirementText("hexworth", "ba")).toBe("");
  });
});
