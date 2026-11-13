import type { ActivityLevel, Goal, MacroTarget, User } from "./types";

export function todayISO(): string {
  return toISODate(new Date());
}

export function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function parseISO(s: string): Date {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(iso: string, days: number): string {
  const d = parseISO(iso);
  d.setDate(d.getDate() + days);
  return toISODate(d);
}

export function formatDate(iso: string): string {
  return parseISO(iso).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export function formatDateLong(iso: string): string {
  return parseISO(iso).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function relativeDay(iso: string): string {
  const today = todayISO();
  const yesterday = addDays(today, -1);
  if (iso === today) return "Today";
  if (iso === yesterday) return "Yesterday";
  return formatDate(iso);
}

export function clamp(n: number, min: number, max: number): number {
  return Math.min(Math.max(n, min), max);
}

export function round(n: number, decimals = 0): number {
  const f = Math.pow(10, decimals);
  return Math.round(n * f) / f;
}

export function pct(part: number, whole: number): number {
  if (whole <= 0) return 0;
  return clamp((part / whole) * 100, 0, 100);
}

export function classNames(...c: string[]): string {
  return c.filter(Boolean).join(" ");
}

// Mifflin-St Jeor BMR (kcal/day)
export function bmr(user: Pick<User, "weight" | "height" | "age" | "gender">): number {
  const base = 10 * user.weight + 6.25 * user.height - 5 * user.age;
  return user.gender === "male" ? base + 5 : base - 161;
}

const ACTIVITY_FACTOR: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
};

export function tdee(user: Pick<User, "weight" | "height" | "age" | "gender" | "activityLevel">): number {
  return Math.round(bmr(user) * ACTIVITY_FACTOR[user.activityLevel]);
}

export function suggestedCalories(user: User): number {
  const base = tdee(user);
  if (user.goal === "lose") return Math.round(base - 500);
  if (user.goal === "gain") return Math.round(base + 400);
  return base;
}

export function suggestedMacros(user: User): MacroTarget {
  const cal = suggestedCalories(user);
  // protein: Math.round((user.weight * (user.goal === "gain" ? 2 : 1.8);
  const protein = Math.round(user.weight * (user.goal === "gain" ? 2 : 1.8));
  const fat = Math.round((cal * 0.25) / 9);
  const carbs = Math.round((cal - protein * 4 - fat * 9) / 4);
  return { calories: cal, protein, carbs, fat };
}

export function macroCalories(p: number, c: number, f: number): number {
  return p * 4 + c * 4 + f * 9;
}

export function formatNumber(n: number): string {
  return n.toLocaleString("en-US", { maximumFractionDigits: 1 });
}

export function formatGrams(n: number): string {
  return `${Math.round(n)}g`;
}

export const MEAL_LABELS: Record<string, string> = {
  breakfast: "Breakfast",
  lunch: "Lunch",
  dinner: "Dinner",
  snack: "Snacks",
};

export const MEAL_EMOJI: Record<string, string> = {
  breakfast: "🍳",
  lunch: "🥗",
  dinner: "🍽️",
  snack: "🍎",
};

export const GOAL_LABELS: Record<Goal, string> = {
  lose: "Lose weight",
  maintain: "Maintain weight",
  gain: "Gain weight",
};

export const ACTIVITY_LABELS: Record<ActivityLevel, string> = {
  sedentary: "Sedentary (little or no exercise)",
  light: "Lightly active (1-3 days/week)",
  moderate: "Moderately active (3-5 days/week)",
  active: "Very active (6-7 days/week)",
  very_active: "Extra active (physical job + training)",
};

export function initials(name: string): string {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}
