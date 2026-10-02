import type { ClientId } from "../data/clients";

const KEY = "shortlist.clientReqs";

export type ReqDraft = {
  problems: string;
  business: string;
};

const EMPTY: ReqDraft = { problems: "", business: "" };

function readAll(): Partial<Record<ClientId, ReqDraft>> {
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return {};
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return {};
    return parsed as Partial<Record<ClientId, ReqDraft>>;
  } catch {
    return {};
  }
}

export function readReq(id: ClientId): ReqDraft {
  const row = readAll()[id];
  if (!row || typeof row.problems !== "string" || typeof row.business !== "string") return { ...EMPTY };
  return { problems: row.problems, business: row.business };
}

export function writeReq(id: ClientId, draft: ReqDraft) {
  const all = readAll();
  all[id] = { problems: draft.problems, business: draft.business };
  sessionStorage.setItem(KEY, JSON.stringify(all));
}

export function reqText(draft: ReqDraft): string {
  return [draft.problems.trim(), draft.business.trim()].filter(Boolean).join("\n");
}
