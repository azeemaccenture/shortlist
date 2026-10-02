import type { EffortBand } from "./types";

export function formatWhen(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

/** Display a score to one decimal, using half-up rounding. */
export function formatScore(score: number): string {
  return (Math.round(score * 10) / 10).toFixed(1);
}

export function roundScore(score: number): number {
  return Math.round(score * 10) / 10;
}

export function effortBandLabel(band: EffortBand): string {
  return band;
}
