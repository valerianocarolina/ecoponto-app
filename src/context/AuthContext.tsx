"use client";

import { createContext, useContext, useEffect, useState } from "react";

type User = {
  nome?: string;
};

type Tipo = "user" | "cooperative" | null;

type AuthContextType = {
  user: User | null;
  token: string | null;
  tipo: Tipo;
  loading: boolean; // 🔥 NOVO
  login: (data: any, tipo: Tipo) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType>({} as any);

export function AuthProvider({ children }: any) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [tipo, setTipo] = useState<Tipo>(null);
  const [loading, setLoading] = useState(true); // 🔥 começa true

  useEffect(() => {
    const stored = localStorage.getItem("auth");

    if (stored) {
      const parsed = JSON.parse(stored);

      const isExpired = Date.now() > parsed.expiresAt;

      if (!isExpired) {
        setUser(parsed.user);
        setToken(parsed.token);
        setTipo(parsed.tipo);
      } else {
        localStorage.removeItem("auth");
      }
    }

    setLoading(false);
  }, []);

  const login = (data: any, tipo: Tipo) => {
    const token = data.token;
    const userData = tipo === "user" ? data.usuario : data.cooperativa;

    const payload = {
      token,
      user: userData,
      tipo,
      expiresAt: Date.now() + 1000 * 60 * 60,
    };

    localStorage.setItem("auth", JSON.stringify(payload));

    setToken(token);
    setUser(userData);
    setTipo(tipo);
  };

  const logout = () => {
    localStorage.removeItem("auth");
    setUser(null);
    setToken(null);
    setTipo(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, token, tipo, login, logout, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);