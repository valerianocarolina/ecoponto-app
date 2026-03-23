"use client";

import { createContext, useContext, useState } from "react";

type User = {
  token: string;
};

type AuthContextType = {
  user: User | null;
  loginEmpresa: (token: string) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  loginEmpresa: () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    if (typeof window === "undefined") return null;

    const token = localStorage.getItem("token");
    return token ? { token } : null;
  });

  const loginEmpresa = (token: string) => {
    localStorage.setItem("token", token);
    setUser({ token });
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loginEmpresa, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
