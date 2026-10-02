import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { JIRA_BOTTLENECKS } from "../data/jiraMock";
import { SALESFORCE_RECORDS } from "../data/salesforceMock";
import { isValidContext } from "../intake/validate";
import type { ShortlistContext } from "../types";

const STORAGE_KEY = "shortlist.context";

type SessionValue = {
  context: ShortlistContext | null;
  saveContext: (next: ShortlistContext) => void;
  syncJira: () => void;
  syncSalesforce: () => void;
};

const SessionContext = createContext<SessionValue | null>(null);

function readStored(): ShortlistContext | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    return isValidContext(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function SessionProvider({ children }: { children: ReactNode }) {
  const [context, setContext] = useState<ShortlistContext | null>(() => readStored());

  const value = useMemo<SessionValue>(() => {
    const persist = (next: ShortlistContext) => {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      setContext(next);
    };

    return {
      context,
      saveContext: persist,
      syncJira: () => {
        if (!context) return;
        persist({
          ...context,
          sources: {
            ...context.sources,
            jiraMock: {
              syncedAt: new Date().toISOString(),
              bottlenecks: JIRA_BOTTLENECKS,
            },
          },
        });
      },
      syncSalesforce: () => {
        if (!context) return;
        persist({
          ...context,
          sources: {
            ...context.sources,
            salesforceMock: {
              syncedAt: new Date().toISOString(),
              records: SALESFORCE_RECORDS,
            },
          },
        });
      },
    };
  }, [context]);

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionValue {
  const session = useContext(SessionContext);
  if (!session) {
    throw new Error("useSession must be used within SessionProvider");
  }
  return session;
}
