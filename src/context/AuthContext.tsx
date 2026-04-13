"use client";

import { createContext, useContext, useEffect, useState } from "react";

type User = {
  nome?: string;
  email?: string;
  telefone?: string;
};

type Tipo = "user" | "cooperative" | null;

type AuthPayload = {
  token: string;
  user: User;
  tipo: Exclude<Tipo, null>;
  expiresAt: number;
};

type AuthContextType = {
  user: User | null;
  token: string | null;
  tipo: Tipo;
  loading: boolean;
  login: (data: any, tipo: Tipo) => void;
  restoreAuth: (payload: AuthPayload) => void;
  logout: () => void;
  updateUser: (user: User) => void;
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
    if (!tipo) return;

    const token = data.token;
    const userData = tipo === "user" ? data.usuario : data.cooperativa;

    const payload: AuthPayload = {
      token,
      user: userData,
      tipo: tipo as Exclude<Tipo, null>,
      expiresAt: Date.now() + 1000 * 60 * 60 * 24, // 24 horas em vez de 1 hora
    };

    localStorage.setItem("auth", JSON.stringify(payload));

    if (localStorage.getItem("biometricEnrolled") === "true") {
      localStorage.setItem("biometricAuthCache", JSON.stringify(payload));
    }

    setToken(token);
    setUser(userData);
    setTipo(tipo);
  };

  const restoreAuth = (payload: AuthPayload) => {
    localStorage.setItem("auth", JSON.stringify(payload));
    setToken(payload.token);
    setUser(payload.user);
    setTipo(payload.tipo);
  };

  const updateUser = (userData: User) => {
    setUser(userData);

    const stored = localStorage.getItem("auth");
    if (!stored) return;

    try {
      const payload = JSON.parse(stored);
      localStorage.setItem(
        "auth",
        JSON.stringify({
          ...payload,
          user: {
            ...payload.user,
            ...userData,
          },
        })
      );
    } catch {
      // ignore invalid auth payload
    }
  };

  const logout = () => {
    localStorage.removeItem("auth");
    setUser(null);
    setToken(null);
    setTipo(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, token, tipo, login, restoreAuth, logout, loading, updateUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);