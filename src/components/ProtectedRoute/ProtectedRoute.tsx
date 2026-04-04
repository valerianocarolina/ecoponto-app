"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { routes } from "@/routes/routes";

export function ProtectedRoute(requiredTipo?: "user" | "cooperative") {
  const { token, tipo } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!token) {
      router.push(routes.login);
      return;
    }

    if (requiredTipo && tipo !== requiredTipo) {
      router.push(routes.home);
    }
  }, [token, tipo]);
}