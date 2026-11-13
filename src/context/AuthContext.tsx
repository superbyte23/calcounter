import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { User } from "../lib/types";
import { storage } from "../lib/storage";
import { seedAll } from "../lib/seedData";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => { ok: boolean; error?: string };
  signup: (data: Partial<User> & { email: string; password: string; name: string }) => { ok: boolean; error?: string };
  logout: () => void;
  updateUser: (patch: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Seed demo data on first ever load
    if (!storage.isSeeded()) {
      seedAll();
      storage.setSeeded(true);
    }
    const id = storage.getCurrentUserId();
    if (id) {
      const u = storage.getUsers().find((x) => x.id === id) ?? null;
      setUser(u);
    }
    setLoading(false);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      login(email, password) {
        const u = storage.getUsers().find((x) => x.email.toLowerCase() === email.toLowerCase().trim());
        if (!u) return { ok: false, error: "No account found with that email." };
        if (u.password !== password) return { ok: false, error: "Incorrect password. Try again." };
        storage.setCurrentUserId(u.id);
        setUser(u);
        return { ok: true };
      },
      signup(data) {
        const users = storage.getUsers();
        if (users.some((x) => x.email.toLowerCase() === data.email.toLowerCase().trim())) {
          return { ok: false, error: "An account with that email already exists." };
        }
        const newUser: User = {
          id: "u-" + Math.random().toString(36).slice(2, 9),
          name: data.name.trim(),
          email: data.email.trim(),
          password: data.password,
          age: data.age ?? 25,
          gender: data.gender ?? "female",
          weight: data.weight ?? 70,
          height: data.height ?? 170,
          activityLevel: data.activityLevel ?? "light",
          goal: data.goal ?? "maintain",
          targetWeight: data.targetWeight,
          createdAt: new Date().toISOString(),
        };
        users.push(newUser);
        storage.setUsers(users);
        storage.setCurrentUserId(newUser.id);
        setUser(newUser);
        return { ok: true };
      },
      logout() {
        storage.setCurrentUserId(null);
        setUser(null);
      },
      updateUser(patch) {
        if (!user) return;
        const updated = { ...user, ...patch };
        const users = storage.getUsers().map((x) => (x.id === user.id ? updated : x));
        storage.setUsers(users);
        setUser(updated);
      },
    }),
    [user, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
