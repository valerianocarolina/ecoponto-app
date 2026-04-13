"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { routes } from "@/routes/routes";

type Props = {
  children: React.ReactNode;
  requiredType?: "user" | "cooperative";
};

export function ProtectedRoute({ children, requiredType }: Props) {
  const { user, tipo, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      if (requiredType === "user") {
        router.push(routes.loginCliente);
      } else if (requiredType === "cooperative") {
        router.push(routes.login);
      } else if (tipo === "user") {
        router.push(routes.loginCliente);
      } else if (tipo === "cooperative") {
        router.push(routes.login);
      } else {
        router.push(routes.home);
      }
      return;
    }

    if (requiredType && tipo !== requiredType) {
      router.push(routes.home);
    }
  }, [user, tipo, loading]);

  if (loading) return null;

  return <>{children}</>;
}