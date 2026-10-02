import { useParams } from "react-router-dom";
import { CLIENTS, isClientId, type ClientId, type ClientProfile } from "../data/clients";

export function useClient(): ClientProfile | null {
  const { clientId } = useParams();
  if (!isClientId(clientId)) return null;
  return CLIENTS[clientId];
}

export function useClientBase(): string {
  const client = useClient();
  return client ? `/clients/${client.id}` : "";
}

export function clientHref(clientId: ClientId, segment = ""): string {
  const base = `/clients/${clientId}`;
  return segment ? `${base}/${segment}` : base;
}
