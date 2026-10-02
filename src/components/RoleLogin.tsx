import { useClient } from "../portal/useClient";
import { useSession } from "../state/SessionProvider";
import { ROLE_LABELS, ROLES } from "../types";

export function RoleLogin() {
  const client = useClient();
  const hex = client?.id === "hexworth";
  const { context, pendingRole, setRole, setPendingRole } = useSession();
  const active = context?.role ?? pendingRole;

  return (
    <div
      className={hex ? "hx-persona-pills" : "ae-persona-tabs"}
      role="group"
      aria-label="Role login"
      data-testid="role-login"
    >
      {ROLES.map((role) => (
        <button
          key={role}
          type="button"
          className={`${hex ? "hx-persona-pill" : "ae-persona-tab"}${active === role ? " active" : ""}`}
          data-testid={`login-${role}`}
          aria-pressed={active === role}
          onClick={() => {
            setPendingRole(role);
            if (context) setRole(role);
          }}
        >
          {ROLE_LABELS[role]}
        </button>
      ))}
    </div>
  );
}
