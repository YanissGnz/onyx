import { AuthContext } from "@/components/features/auth/AuthProvider";
import { useContext } from "react";

export function useUser() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useUser must be used within an AuthProvider");
  }

  return context;
}