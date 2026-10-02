import type {
  CatalogItem,
  ChangeLoadBand,
  DimensionBreakdown,
  DimensionId,
  EffortBand,
  JiraBottleneck,
  Role,
  ScoredItem,
  ShortlistContext,
  Urgency,
} from "../types";
import { formatScore, roundScore } from "../format";

const DIMENSION_ORDER: DimensionId[] = [
  "strategicFit",
  "configEvidence",
  "demandSignal",
  "feasibility",
  "changeLoad",
];

const DIMENSION_LABELS: Record<DimensionId, string> = {
  strategicFit: "Strategic Fit",
  configEvidence: "Config Evidence",
  demandSignal: "Demand Signal",
  feasibility: "Feasibility",
  changeLoad: "Change Load",
};

/**
 * v1.1 weight profiles. Session roles map onto them:
 * product_lead → Sales, cio → Ops, ba → Consolidated.
 * Consolidated numbers are the published 3-decimal table (they sum to 1.009
 * because strategic fit is published as 0.275).
 */
export const WEIGHTS: Record<Role, Record<DimensionId, number>> = {
  product_lead: {
    strategicFit: 0.35,
    configEvidence: 0.25,
    demandSignal: 0.25,
    feasibility: 0.15,
    changeLoad: 0,
  },
  cio: {
    strategicFit: 0.2,
    configEvidence: 0.2,
    demandSignal: 0.15,
    feasibility: 0.2,
    changeLoad: 0.25,
  },
  ba: {
    strategicFit: 0.275,
    configEvidence: 0.217,
    demandSignal: 0.217,
    feasibility: 0.175,
    changeLoad: 0.125,
  },
};

const EFFORT_SCORE: Record<EffortBand, number> = { S: 95, M: 75, L: 50, XL: 25 };
const EFFORT_ORDINAL: Record<EffortBand, number> = { S: 0, M: 1, L: 2, XL: 3 };
const CHANGE_SCORE: Record<ChangeLoadBand, number> = { low: 90, med: 60, high: 30 };
const URGENCY_WEIGHT: Record<Urgency, number> = { low: 0, med: 1, high: 2 };

const QUOTE_OPEN = "\u201C";
const QUOTE_CLOSE = "\u201D";

function quote(value: string): string {
  return `${QUOTE_OPEN}${value}${QUOTE_CLOSE}`;
}

function letterTokens(text: string): string[] {
  return text.toLowerCase().split(/[^a-z]+/).filter((token) => token.length > 0);
}

/** Equal, or a prefix match whose shorter token is at least 4 characters. */
export function tokensMatch(left: string, right: string): boolean {
  if (left === right) return true;
  const shorter = left.length <= right.length ? left : right;
  const longer = left.length <= right.length ? right : left;
  return shorter.length >= 4 && longer.startsWith(shorter);
}

export function tagIntersectsPriority(tag: string, priorityLabel: string): boolean {
  const tagTokens = letterTokens(tag);
  const priorityTokens = letterTokens(priorityLabel);
  return tagTokens.some((tagToken) =>
    priorityTokens.some((priorityToken) => tokensMatch(tagToken, priorityToken)),
  );
}

export function strategicFitScore(item: CatalogItem, context: ShortlistContext): number {
  if (context.priorities.length === 0) return 50;
  const hits = item.strategyTags.filter((tag) =>
    context.priorities.some((priority) => tagIntersectsPriority(tag, priority.label)),
  ).length;
  return Math.min(100, Math.round((100 * hits) / Math.max(1, context.priorities.length)));
}

export function configEvidenceScore(item: CatalogItem): number {
  let score = item.relatedObjectsUsed >= 1 ? 40 : 10;
  if (item.packageInstalled) score += 30;
  if (item.usageLast90d >= item.usageThreshold) score += 20;
  if (item.adminReady) score += 10;
  return Math.min(100, score);
}

export function demandSignalScore(item: CatalogItem): number {
  const raw = 20 * Math.log2(1 + item.demandCount) + 15 * URGENCY_WEIGHT[item.urgency];
  return Math.min(100, Math.round(raw));
}

export function feasibilityScore(item: CatalogItem): number {
  let score = EFFORT_SCORE[item.effortBand];
  if (item.blockerFlag) score -= 15;
  if (item.dependencyCount >= 3) score -= 10;
  return Math.max(0, score);
}

export function changeLoadScore(item: CatalogItem): number {
  let score = CHANGE_SCORE[item.changeLoadBand];
  if (item.requiresDataMigration) score -= 20;
  if (item.touchesSharedObjects) score -= 10;
  return Math.max(0, score);
}

function dimensionScore(item: CatalogItem, context: ShortlistContext, id: DimensionId): number {
  if (id === "strategicFit") return strategicFitScore(item, context);
  if (id === "configEvidence") return configEvidenceScore(item);
  if (id === "demandSignal") return demandSignalScore(item);
  if (id === "feasibility") return feasibilityScore(item);
  return changeLoadScore(item);
}

function findBottleneck(context: ShortlistContext, item: CatalogItem): JiraBottleneck | undefined {
  const bottlenecks = context.sources.jiraMock?.bottlenecks;
  if (!bottlenecks) return undefined;
  const name = item.name.toLowerCase();
  return bottlenecks.find((bottleneck) => bottleneck.pairedFeature.toLowerCase() === name);
}

function reasonFor(dimensions: DimensionBreakdown[]): string {
  const ranked = dimensions
    .filter((dimension) => dimension.weight > 0)
    .sort((left, right) => {
      if (right.contribution !== left.contribution) return right.contribution - left.contribution;
      return DIMENSION_ORDER.indexOf(left.id) - DIMENSION_ORDER.indexOf(right.id);
    });
  const first = ranked[0];
  const second = ranked[1];
  if (!first) return "Led by an even weight profile.";
  if (!second) return `Led by ${first.label} (${formatScore(first.contribution)}).`;
  return `Led by ${first.label} (${formatScore(first.contribution)}) and ${second.label} (${formatScore(second.contribution)}).`;
}

function nextStepFor(item: CatalogItem, score: number, bottleneck?: JiraBottleneck): string {
  if (bottleneck) return `Take ${quote(item.name)} to the backlog against ${bottleneck.id}`;
  if (score >= 70) return "Share this shortlist";
  return `Request an estimate for ${quote(item.name)}`;
}

function fitOf(row: ScoredItem): number {
  return row.dimensions.find((dimension) => dimension.id === "strategicFit")?.score ?? 0;
}

export function compareScored(left: ScoredItem, right: ScoredItem): number {
  if (left.rawScore !== right.rawScore) return right.rawScore - left.rawScore;
  const fitDelta = fitOf(right) - fitOf(left);
  if (fitDelta !== 0) return fitDelta;
  const effortDelta = EFFORT_ORDINAL[left.item.effortBand] - EFFORT_ORDINAL[right.item.effortBand];
  if (effortDelta !== 0) return effortDelta;
  if (left.item.id < right.item.id) return -1;
  if (left.item.id > right.item.id) return 1;
  return 0;
}

export function scoreItem(context: ShortlistContext, item: CatalogItem): ScoredItem {
  const weights = WEIGHTS[context.role];
  const dimensions: DimensionBreakdown[] = DIMENSION_ORDER.map((id) => {
    const score = dimensionScore(item, context, id);
    const weight = weights[id];
    return {
      id,
      label: DIMENSION_LABELS[id],
      score,
      weight,
      contribution: weight * score,
    };
  });
  const rawScore = dimensions.reduce((sum, dimension) => sum + dimension.contribution, 0);
  const score = roundScore(rawScore);
  const bottleneck = findBottleneck(context, item);
  return {
    item,
    score,
    rawScore,
    reason: reasonFor(dimensions),
    dimensions,
    bottleneck,
    nextStep: nextStepFor(item, score, bottleneck),
    sensitiveToWeights: false,
  };
}

function withNeighbors(ranked: ScoredItem[]): ScoredItem[] {
  return ranked.map((row, index) => {
    const prev = ranked[index - 1];
    const next = ranked[index + 1];
    const contrastClause =
      next && Math.abs(row.score - next.score) <= 5
        ? `Outranks ${next.item.name} (${formatScore(next.score)}).`
        : undefined;
    const sensitiveToWeights =
      (prev !== undefined && Math.abs(row.score - prev.score) < 3) ||
      (next !== undefined && Math.abs(row.score - next.score) < 3);
    return { ...row, contrastClause, sensitiveToWeights };
  });
}

export function rankAll(context: ShortlistContext, catalog: CatalogItem[]): ScoredItem[] {
  const ranked = catalog.map((item) => scoreItem(context, item)).sort(compareScored);
  return withNeighbors(ranked);
}

export function rankTop(context: ShortlistContext, catalog: CatalogItem[]): ScoredItem[] {
  return rankAll(context, catalog).slice(0, 5);
}
