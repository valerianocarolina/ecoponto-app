"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { routes } from "@/routes/routes";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user !== "empresa") {
      router.push(routes.login);
    }
  }, [user, router]);

  return <>{children}</>;
}
