import type { ClientId } from "../data/clients";
import type { PersonaId } from "../data/clientNotes";
import { REQUIREMENT_COPY } from "../data/requirementSources";

const KEY = "shortlist.requirementSources";
const EVENT = "shortlist-requirements";

export type StoredSource = {
  name: string;
  meta: string;
  text: string;
};

export type PersonaSources = {
  document?: StoredSource;
  jira?: StoredSource;
};

type Store = Partial<Record<ClientId, Partial<Record<PersonaId, PersonaSources>>>>;

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

export function readSources(clientId: ClientId, persona: PersonaId): PersonaSources {
  return readAll()[clientId]?.[persona] ?? {};
}

export function connectJira(clientId: ClientId, persona: PersonaId) {
  const template = REQUIREMENT_COPY[clientId][persona].jira;
  const store = readAll();
  const client = store[clientId] ?? {};
  const current = client[persona] ?? {};
  client[persona] = {
    ...current,
    jira: { name: template.name, meta: template.meta, text: template.text },
  };
  store[clientId] = client;
  writeAll(store);
}

export function attachDocument(clientId: ClientId, persona: PersonaId, fileName: string) {
  const template = REQUIREMENT_COPY[clientId][persona].document;
  const store = readAll();
  const client = store[clientId] ?? {};
  const current = client[persona] ?? {};
  client[persona] = {
    ...current,
    document: {
      name: fileName || template.name,
      meta: template.meta,
      text: `${template.text} ${fileName}`.trim(),
    },
  };
  store[clientId] = client;
  writeAll(store);
}

export function removeSource(clientId: ClientId, persona: PersonaId, kind: "document" | "jira") {
  const store = readAll();
  const client = store[clientId];
  const current = client?.[persona];
  if (!client || !current) return;
  const next = { ...current };
  delete next[kind];
  client[persona] = next;
  store[clientId] = client;
  writeAll(store);
}

export function clearSources(clientId: ClientId, persona: PersonaId) {
  const store = readAll();
  const client = store[clientId];
  if (!client) return;
  delete client[persona];
  store[clientId] = client;
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
