import { Navigate, Outlet } from "react-router-dom";

export function RequireUnlock() {
  const unlocked = sessionStorage.getItem("vault_unlocked") === "1";
  if (!unlocked) {
    return <Navigate to="/" replace />;
  }
  return <Outlet />;
}
