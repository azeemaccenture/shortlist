import type { ClientId } from "../data/clients";
import type { PersonaId } from "../data/clientNotes";
import { REQUIREMENT_COPY, type Extract } from "../data/requirementSources";

const KEY = "shortlist.requirementSources";
const EVENT = "shortlist-requirements";

export type StoredSource = {
  name: string;
  meta: string;
  text: string;
  extracts?: Extract[];
};

export type PersonaSources = {
  document?: StoredSource;
  jira?: StoredSource;
};

type LegacyBucket = Partial<Record<PersonaId, PersonaSources>>;
type Store = Partial<Record<ClientId, PersonaSources | LegacyBucket>>;

function readAll(): Store {
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return {};
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return {};
    return parsed as Store;
  } catch {
    return {};
  }
}

function writeAll(store: Store) {
  sessionStorage.setItem(KEY, JSON.stringify(store));
  if (typeof window !== "undefined") window.dispatchEvent(new Event(EVENT));
}

function isShared(value: PersonaSources | LegacyBucket): value is PersonaSources {
  return "document" in value || "jira" in value;
}

/** One sync per client. Older per-profile records are folded together. */
export function readSources(clientId: ClientId, _persona?: PersonaId): PersonaSources {
  const raw = readAll()[clientId];
  if (!raw) return {};
  if (isShared(raw)) return raw;
  const merged: PersonaSources = {};
  for (const sources of Object.values(raw)) {
    if (!sources) continue;
    if (sources.jira) merged.jira = sources.jira;
    if (sources.document) merged.document = sources.document;
  }
  return merged;
}

function writeSources(clientId: ClientId, sources: PersonaSources) {
  const store = readAll();
  store[clientId] = sources;
  writeAll(store);
}

export function connectJira(clientId: ClientId, persona: PersonaId) {
  const template = REQUIREMENT_COPY[clientId][persona].jira;
  const current = readSources(clientId);
  writeSources(clientId, {
    ...current,
    jira: { name: template.name, meta: template.meta, text: template.text },
  });
}

export function attachDocument(clientId: ClientId, persona: PersonaId, fileName: string, fileMeta?: string) {
  const template = REQUIREMENT_COPY[clientId][persona].document;
  const current = readSources(clientId);
  const meta = fileMeta
    ? `${fileMeta} · ${template.extracts.length} items extracted`
    : `Just uploaded · ${template.extracts.length} items extracted`;
  writeSources(clientId, {
    ...current,
    document: {
      name: fileName || template.name,
      meta,
      text: template.text,
      extracts: template.extracts,
    },
  });
}

export function removeSource(clientId: ClientId, _persona: PersonaId, kind: "document" | "jira") {
  const current = readSources(clientId);
  if (!current[kind]) return;
  const next = { ...current };
  delete next[kind];
  writeSources(clientId, next);
}

export function clearSources(clientId: ClientId, _persona?: PersonaId) {
  const store = readAll();
  if (!store[clientId]) return;
  delete store[clientId];
  writeAll(store);
}

export function requirementText(clientId: ClientId, persona: PersonaId): string {
  const sources = readSources(clientId, persona);
  return [sources.document?.text, sources.jira?.text].filter(Boolean).join(" ");
}

export function subscribeRequirements(listener: () => void) {
  window.addEventListener(EVENT, listener);
  return () => window.removeEventListener(EVENT, listener);
}
