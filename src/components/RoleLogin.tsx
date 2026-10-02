import { useSession } from "../state/SessionProvider";
import { ROLE_LABELS, ROLES } from "../types";

export function RoleLogin() {
  const { context, pendingRole, setRole, setPendingRole } = useSession();
  const active = context?.role ?? pendingRole;

  return (
    <div className="role-login" role="group" aria-label="Role login" data-testid="role-login">
      {ROLES.map((role) => (
        <button
          key={role}
          type="button"
          className={active === role ? "is-on" : undefined}
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
