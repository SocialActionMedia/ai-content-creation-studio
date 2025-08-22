export type AppRole = "admin" | "editor" | "client";

export function isAdmin(role: AppRole | null | undefined): boolean {
  return role === "admin";
}

export function canApprove(role: AppRole | null | undefined): boolean {
  return role === "admin" || role === "editor";
}

export function canEdit(role: AppRole | null | undefined): boolean {
  return role === "admin" || role === "editor";
}


