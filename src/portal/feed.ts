import type { HorizonId, PersonaId, ReleaseNote } from "../data/clientNotes";

export type HorizonFilter = HorizonId | "all";

export const HORIZON_TITLE: Record<HorizonFilter, string> = {
  all: "All releases",
  long: "Long-term",
  quarter: "Quarter",
  daily: "Day-to-day",
};

export const TIER_LABEL: Record<HorizonId, string> = {
  long: "Long-term",
  quarter: "Quarter",
  daily: "Day-to-day",
};

/** Lead impact tile shown on the closed card. Prefers a signed movement. */
export function leadSignal(note: ReleaseNote, persona: PersonaId) {
  const tiles = note.impact[persona];
  return tiles.find((tile) => tile.cls === "pos" || tile.cls === "warn" || tile.cls === "neg") ?? tiles[0];
}

export function noteScore(note: ReleaseNote, persona: PersonaId, overrides: Record<string, number> | null) {
  if (overrides && overrides[note.id] !== undefined) return overrides[note.id];
  return note.scores[persona];
}

export function visibleNotes(
  notes: ReleaseNote[],
  persona: PersonaId,
  filter: HorizonFilter,
  search: string,
  overrides: Record<string, number> | null,
) {
  const needle = search.trim().toLowerCase();
  return notes
    .filter((note) => (filter === "all" ? true : note.tier === filter))
    .filter((note) => {
      if (!needle) return true;
      const hay = [note.title, note.excerpt, note.summary, note.version, ...note.tags].join(" ").toLowerCase();
      return hay.includes(needle);
    })
    .slice()
    .sort((left, right) => noteScore(right, persona, overrides) - noteScore(left, persona, overrides));
}

/**
 * Local stand-in for the prototype re-rank. No network call.
 * Overlap with the requirement text lifts the seeded persona score.
 */
export function rerankFromText(notes: ReleaseNote[], persona: PersonaId, text: string): Record<string, number> | null {
  const words = text
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((word) => word.length > 2);
  if (words.length === 0) return null;
  const scores: Record<string, number> = {};
  for (const note of notes) {
    const hay = [note.title, note.excerpt, note.summary, ...note.tags, ...note.why].join(" ").toLowerCase();
    const hits = new Set(words.filter((word) => hay.includes(word))).size;
    scores[note.id] = Math.max(0, Math.min(100, note.scores[persona] + hits * 4));
  }
  return scores;
}
