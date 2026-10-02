import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import type { PersonaId } from "../data/clientNotes";

type BriefingValue = {
  persona: PersonaId;
  setPersona: (persona: PersonaId) => void;
  briefing: string[];
  toggleBriefing: (id: string) => void;
  briefingOpen: boolean;
  toggleBriefingOpen: () => void;
};

const BriefingContext = createContext<BriefingValue | null>(null);

export function BriefingProvider({ children }: { children: ReactNode }) {
  const [persona, setPersona] = useState<PersonaId>("cio");
  const [briefing, setBriefing] = useState<string[]>([]);
  const [briefingOpen, setBriefingOpen] = useState(false);

  const value = useMemo<BriefingValue>(
    () => ({
      persona,
      setPersona: (next) => {
        setPersona(next);
      },
      briefing,
      toggleBriefing: (id) => {
        setBriefing((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
      },
      briefingOpen,
      toggleBriefingOpen: () => setBriefingOpen((open) => !open),
    }),
    [persona, briefing, briefingOpen],
  );

  return <BriefingContext.Provider value={value}>{children}</BriefingContext.Provider>;
}

export function useBriefing(): BriefingValue {
  const value = useContext(BriefingContext);
  if (!value) throw new Error("useBriefing must be used inside a client world");
  return value;
}
