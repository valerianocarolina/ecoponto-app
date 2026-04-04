"use client";

import { ProtectedRoute } from "@/components/ProtectedRoute/ProtectedRoute";

export default function MeusPontos() {
  ProtectedRoute("cooperative");

  return (
      <main>
        <h1>Meus Pontos</h1>
      </main>
  );
}
