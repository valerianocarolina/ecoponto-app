"use client";

import { createContext, useContext, useState, useEffect } from "react";

type User = {
  id?: string;
  nome?: string;
  email?: string;
}

type Tipo = "user" | "cooperative" | null;

type AuthContextType = {
  user: User | null;
  token: string | null;
  tipo: Tipo;

  login: (data: any, tipo: Tipo) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  tipo: null,
  login: () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [tipo, setTipo] = useState<Tipo>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
    const storedTipo = localStorage.getItem("tipo") as Tipo;

    if (storedToken && storedUser && storedTipo) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
      setTipo(storedTipo);
    }
  }, []);

  const login = (data: any, tipo: Tipo) => {
    const token = data.token;

    const userData = tipo === "user" ? data.usuario : data.cooperativa;

    setToken(token);
    setUser(userData);
    setTipo(tipo);

    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("tipo", tipo!);
  }

  const logout = () => {
    setToken(null);
    setUser(null);
    setTipo(null);

    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("tipo");
  };

  return (
    <AuthContext.Provider value={{ user, token, tipo, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);