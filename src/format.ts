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

export function effortLabel(effort: "low" | "mid" | "high"): string {
  if (effort === "low") return "Low";
  if (effort === "mid") return "Mid";
  return "High";
}
