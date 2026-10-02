import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { JIRA_BOTTLENECKS } from "../data/jiraMock";
import { SALESFORCE_RECORDS } from "../data/salesforceMock";
import { isValidContext } from "../intake/validate";
import type { Role, ShortlistContext } from "../types";

const STORAGE_KEY = "shortlist.context";
const PENDING_ROLE_KEY = "shortlist.pendingRole";

function readPendingRole(): Role | null {
  try {
    const raw = sessionStorage.getItem(PENDING_ROLE_KEY);
    if (raw === "cio" || raw === "product_lead" || raw === "ba") return raw;
    return null;
  } catch {
    return null;
  }
}

type SessionValue = {
  context: ShortlistContext | null;
  pendingRole: Role | null;
  saveContext: (next: ShortlistContext) => void;
  setRole: (role: Role) => void;
  setPendingRole: (role: Role) => void;
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
  const [pendingRole, setPendingRoleState] = useState<Role | null>(() => readPendingRole());

  const value = useMemo<SessionValue>(() => {
    const persist = (next: ShortlistContext) => {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      setContext(next);
    };

    return {
      context,
      pendingRole,
      saveContext: persist,
      setRole: (role: Role) => {
        if (!context) return;
        persist({ ...context, role });
      },
      setPendingRole: (role: Role) => {
        sessionStorage.setItem(PENDING_ROLE_KEY, role);
        setPendingRoleState(role);
      },
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
  }, [context, pendingRole]);

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionValue {
  const session = useContext(SessionContext);
  if (!session) {
    throw new Error("useSession must be used within SessionProvider");
  }
  return session;
}
