"use client";

import { ProtectedRoute } from "@/components/ProtectedRoute/ProtectedRoute";

export default function MeusPontos() {
  return (
    <ProtectedRoute>
      <main>
        <h1>Meus Pontos</h1>
      </main>
    </ProtectedRoute>
  );
}
