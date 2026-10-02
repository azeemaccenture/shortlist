import type {
  CatalogItem,
  JiraBottleneck,
  MatchedPriority,
  Role,
  ScoredItem,
  ScoreFactors,
  ShortlistContext,
} from "../types";
import { ROLE_LABELS } from "../types";

const STOPWORDS = new Set(["the", "and", "for", "with", "from", "that", "this"]);

const ROLE_FOCUS: Record<Role, string[]> = {
  cio: ["risk", "platform", "security", "cost", "integration"],
  product_lead: ["revenue", "adoption", "roadmap", "customer", "release"],
  ba: ["process", "requirements", "workflow", "data", "acceptance"],
};

const QUOTE_OPEN = "\u201C";
const QUOTE_CLOSE = "\u201D";

function quote(value: string): string {
  return `${QUOTE_OPEN}${value}${QUOTE_CLOSE}`;
}

export function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[^a-z]+/)
    .filter((token) => token.length >= 3 && !STOPWORDS.has(token));
}

function itemBag(item: CatalogItem): Set<string> {
  const text = [item.name, item.blurb, ...item.themes, ...item.attributes].join(" ");
  return new Set(tokenize(text));
}

function distinctTokens(texts: string[]): string[] {
  const seen = new Set<string>();
  const ordered: string[] = [];
  for (const text of texts) {
    for (const token of tokenize(text)) {
      if (!seen.has(token)) {
        seen.add(token);
        ordered.push(token);
      }
    }
  }
  return ordered;
}

function findBottleneck(context: ShortlistContext, item: CatalogItem): JiraBottleneck | undefined {
  const bottlenecks = context.sources.jiraMock?.bottlenecks;
  if (!bottlenecks) return undefined;
  const name = item.name.toLowerCase();
  return bottlenecks.find((bottleneck) => bottleneck.pairedFeature.toLowerCase() === name);
}

function salesforceMatch(context: ShortlistContext, bag: Set<string>): boolean {
  const records = context.sources.salesforceMock?.records;
  if (!records) return false;
  for (const record of records) {
    const chunks = [record.name, record.type, ...Object.values(record.fields)];
    for (const token of tokenize(chunks.join(" "))) {
      if (bag.has(token)) return true;
    }
  }
  return false;
}

function priorityPoints(weight: number, totalWeight: number): number {
  if (totalWeight <= 0) return 0;
  return Math.round((weight / totalWeight) * 30);
}

export function scoreItem(context: ShortlistContext, item: CatalogItem): ScoredItem {
  const bag = itemBag(item);
  const focus = new Set(ROLE_FOCUS[context.role]);
  const themeHits = new Set(item.themes).size
    ? [...new Set(item.themes)].filter((theme) => focus.has(theme)).length
    : 0;
  const rolePoints = (item.roles.includes(context.role) ? 10 : 0) + Math.min(10, themeHits * 2);

  const goalTokens = distinctTokens(context.goals);
  const matchedGoalTokens = goalTokens.filter((token) => bag.has(token));
  const goalPoints = Math.min(25, matchedGoalTokens.length * 5);
  const matchedGoals = context.goals.filter((goal) =>
    tokenize(goal).some((token) => bag.has(token)),
  );

  const constraintTokens = distinctTokens(context.constraints);
  const matchedConstraintTokens = constraintTokens.filter((token) => bag.has(token));
  const constraintPoints = Math.min(15, matchedConstraintTokens.length * 3);
  const matchedConstraints = context.constraints.filter((constraint) =>
    tokenize(constraint).some((token) => bag.has(token)),
  );

  const totalWeight = context.priorities.reduce((sum, priority) => sum + priority.weight, 0);
  const matchedPriorities: MatchedPriority[] = [];
  for (const priority of context.priorities) {
    const hits = tokenize(priority.label).some((token) => bag.has(token));
    if (!hits) continue;
    matchedPriorities.push({
      label: priority.label,
      weight: priority.weight,
      points: priorityPoints(priority.weight, totalWeight),
    });
  }
  const priorityScore = matchedPriorities.reduce((sum, priority) => sum + priority.points, 0);

  const bottleneck = findBottleneck(context, item);
  const jiraPoints = bottleneck ? 10 : 0;
  const salesforcePoints = salesforceMatch(context, bag) ? 5 : 0;

  const factors: ScoreFactors = {
    role: rolePoints,
    goals: goalPoints,
    constraints: constraintPoints,
    priorities: priorityScore,
    jira: jiraPoints,
    salesforce: salesforcePoints,
  };
  const raw =
    rolePoints + goalPoints + constraintPoints + priorityScore + jiraPoints + salesforcePoints;
  const score = Math.max(0, Math.min(100, raw));

  const strongest = matchedPriorities.reduce<MatchedPriority | undefined>((best, priority) => {
    if (!best || priority.weight > best.weight) return priority;
    return best;
  }, undefined);

  let reason = "Weak fit for this context";
  if (bottleneck) {
    reason = `Paired to Jira bottleneck ${quote(bottleneck.summary)}`;
  } else if (strongest) {
    reason = `Matches priority ${quote(strongest.label)} (${ROLE_LABELS[context.role]})`;
  } else if (rolePoints > 0) {
    reason = `Fits the ${ROLE_LABELS[context.role]} lens`;
  } else if (matchedGoals[0]) {
    reason = `Supports your goal ${quote(matchedGoals[0])}`;
  } else if (matchedConstraints[0]) {
    reason = `Respects constraint ${quote(matchedConstraints[0])}`;
  }

  let nextStep = `Request an estimate for ${quote(item.name)}`;
  if (bottleneck) {
    nextStep = `Take ${quote(item.name)} to the backlog against ${bottleneck.id}`;
  } else if (score >= 70) {
    nextStep = "Share this shortlist";
  }

  return {
    item,
    score,
    reason,
    factors,
    matchedGoals,
    matchedConstraints,
    matchedPriorities,
    bottleneck,
    nextStep,
  };
}

export function rankTop(context: ShortlistContext, catalog: CatalogItem[]): ScoredItem[] {
  return catalog
    .map((item) => scoreItem(context, item))
    .sort((left, right) => {
      if (right.score !== left.score) return right.score - left.score;
      if (left.item.name < right.item.name) return -1;
      if (left.item.name > right.item.name) return 1;
      return 0;
    })
    .slice(0, 5);
}
