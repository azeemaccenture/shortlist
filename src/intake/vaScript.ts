export const VA_PROMPTS = [
  {
    id: "goals",
    prompt: "What goals should this shortlist serve? Put each goal on its own line.",
    hint: "Example: Raise forecast accuracy for the sales pipeline",
  },
  {
    id: "constraints",
    prompt: "What constraints must the plan respect? Put each constraint on its own line.",
    hint: "Example: Stay on the current Salesforce platform",
  },
  {
    id: "priorities",
    prompt: "Name 3 to 5 priorities. One per line, written as label | weight.",
    hint: "Example: forecast accuracy | 5",
  },
] as const;

export const VA_TURN_COUNT = VA_PROMPTS.length;
