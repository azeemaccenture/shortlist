import type { Priority } from "../types";

export type ParsedBrief = {
  goals: string[];
  constraints: string[];
  priorities: Priority[];
  recognized: number;
};

export function parsePriorityLine(line: string): Priority {
  const body = line.startsWith("Priority:") ? line.slice("Priority:".length).trim() : line.trim();
  const divider = body.indexOf("|");
  const label = (divider === -1 ? body : body.slice(0, divider)).trim();
  const weightText = divider === -1 ? "" : body.slice(divider + 1).trim();
  const weight = weightText === "" ? Number.NaN : Number(weightText);
  return { label, weight };
}

export function nonEmptyLines(text: string): string[] {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}

export function parseUpload(text: string): ParsedBrief {
  const goals: string[] = [];
  const constraints: string[] = [];
  const priorities: Priority[] = [];
  let recognized = 0;

  for (const line of nonEmptyLines(text)) {
    if (line.startsWith("Goal:")) {
      const value = line.slice("Goal:".length).trim();
      if (value) {
        goals.push(value);
        recognized += 1;
      }
      continue;
    }
    if (line.startsWith("Constraint:")) {
      const value = line.slice("Constraint:".length).trim();
      if (value) {
        constraints.push(value);
        recognized += 1;
      }
      continue;
    }
    if (line.startsWith("Priority:")) {
      priorities.push(parsePriorityLine(line));
      recognized += 1;
    }
  }

  return { goals, constraints, priorities, recognized };
}
