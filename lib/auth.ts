export type Role = "Superadmin" | "Admin" | "Manager" | "HR" | "Staff";

export interface User {
    id: string;
    name: string;
    email: string;
    role: Role;
    token?: string;
}

// Role → dashboard route mapping
export const ROLE_ROUTES: Record<Role, string> = {
    Superadmin: "/dashboard/superadmin",
    Admin: "/dashboard/admin",
    Manager: "/dashboard/manager",
    HR: "/dashboard/hr",
    Staff: "/dashboard/staff",
};

/**
 * Normalizes roles from API (e.g. "admin", "hr") to app's Role type.
 */
export function normalizeRole(role: string): Role {
    const r = role.toLowerCase();
    if (r === "superadmin") return "Superadmin";
    if (r === "admin") return "Admin";
    if (r === "manager") return "Manager";
    if (r === "hr") return "HR";
    return "Staff"; // Default or fallback
}
