import type { Priority, Role, ShortlistContext } from "../types";
import { ROLES } from "../types";
import type { ParsedBrief } from "./parseUpload";

export function priorityError(priorities: Priority[]): string | null {
  if (priorities.length < 3 || priorities.length > 5) {
    return "Enter 3 to 5 priorities, each with a label and a positive weight.";
  }
  const invalid = priorities.some(
    (priority) =>
      priority.label.trim().length === 0 ||
      !Number.isFinite(priority.weight) ||
      priority.weight <= 0,
  );
  if (invalid) {
    return "Enter 3 to 5 priorities, each with a label and a positive weight.";
  }
  return null;
}

export function briefError(parsed: ParsedBrief): string | null {
  if (parsed.recognized === 0) {
    return "That file has no Goal, Constraint, or Priority lines.";
  }
  if (parsed.goals.length === 0) {
    return "Add at least one goal.";
  }
  if (parsed.constraints.length === 0) {
    return "Add at least one constraint.";
  }
  return priorityError(parsed.priorities);
}

export function intakeError(input: {
  role: Role | "";
  goals: string[];
  constraints: string[];
  priorities: Priority[];
  hasSource: boolean;
}): string | null {
  if (!input.role) {
    return "Choose a role before continuing.";
  }
  if (input.goals.length === 0) {
    return "Add at least one goal.";
  }
  if (input.constraints.length === 0) {
    return "Add at least one constraint.";
  }
  const priorities = priorityError(input.priorities);
  if (priorities) return priorities;
  if (!input.hasSource) {
    return "Upload a brief or finish the assistant conversation before continuing.";
  }
  return null;
}

export function isValidContext(value: unknown): value is ShortlistContext {
  if (!value || typeof value !== "object") return false;
  const candidate = value as ShortlistContext;
  if (!ROLES.includes(candidate.role)) return false;
  if (!Array.isArray(candidate.goals) || candidate.goals.length < 1) return false;
  if (!candidate.goals.every((goal) => typeof goal === "string" && goal.trim().length > 0)) {
    return false;
  }
  if (!Array.isArray(candidate.constraints) || candidate.constraints.length < 1) return false;
  if (
    !candidate.constraints.every(
      (constraint) => typeof constraint === "string" && constraint.trim().length > 0,
    )
  ) {
    return false;
  }
  if (!candidate.sources || typeof candidate.sources !== "object") return false;
  if (!candidate.sources.upload && !candidate.sources.va) return false;
  return priorityError(candidate.priorities ?? []) === null;
}
