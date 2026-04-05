"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

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
      router.push("/login");
      return;
    }

    if (requiredType && tipo !== requiredType) {
      router.push("/");
    }
  }, [user, tipo, loading]);

  if (loading) return null;

  return <>{children}</>;
}