import type {
  User,
  FoodItem,
  FoodEntry,
  DietPlan,
  WeightEntry,
  WaterEntry,
  Recipe,
} from "./types";

const PREFIX = "calcounter:";

export const storage = {
  getUsers(): User[] {
    return read<User[]>(`${PREFIX}users`, []);
  },
  setUsers(users: User[]) {
    write(`${PREFIX}users`, users);
  },
  getFoods(): FoodItem[] {
    return read<FoodItem[]>(`${PREFIX}foods`, []);
  },
  setFoods(foods: FoodItem[]) {
    write(`${PREFIX}foods`, foods);
  },
  getEntries(): FoodEntry[] {
    return read<FoodEntry[]>(`${PREFIX}entries`, []);
  },
  setEntries(entries: FoodEntry[]) {
    write(`${PREFIX}entries`, entries);
  },
  getPlans(): DietPlan[] {
    return read<DietPlan[]>(`${PREFIX}plans`, []);
  },
  setPlans(plans: DietPlan[]) {
    write(`${PREFIX}plans`, plans);
  },
  getWeights(): WeightEntry[] {
    return read<WeightEntry[]>(`${PREFIX}weights`, []);
  },
  setWeights(weights: WeightEntry[]) {
    write(`${PREFIX}weights`, weights);
  },
  getWater(): WaterEntry[] {
    return read<WaterEntry[]>(`${PREFIX}water`, []);
  },
  setWater(water: WaterEntry[]) {
    write(`${PREFIX}water`, water);
  },
  getRecipes(): Recipe[] {
    return read<Recipe[]>(`${PREFIX}recipes`, []);
  },
  setRecipes(recipes: Recipe[]) {
    write(`${PREFIX}recipes`, recipes);
  },
  getCurrentUserId(): string | null {
    return read<string | null>(`${PREFIX}currentUser`, null);
  },
  setCurrentUserId(id: string | null) {
    write(`${PREFIX}currentUser`, id);
  },
  isSeeded(): boolean {
    return read<boolean>(`${PREFIX}seeded`, false);
  },
  setSeeded(v: boolean) {
    write(`${PREFIX}seeded`, v);
  },
};

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore quota errors */
  }
}

export function uid(prefix = ""): string {
  return prefix + Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-4);
}
