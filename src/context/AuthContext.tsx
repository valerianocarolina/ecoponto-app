"use client";

import { createContext, useContext, useState } from "react";

type UserType = "empresa" | "cliente" | null;

type AuthContextType = {
  user: UserType;
  loginEmpresa: () => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  loginEmpresa: () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserType>(null);

  const loginEmpresa = () => setUser("empresa");
  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, loginEmpresa, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
