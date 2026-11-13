import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import type {
  FoodItem,
  FoodEntry,
  DietPlan,
  WeightEntry,
  WaterEntry,
  Recipe,
  MealType,
  DailyTotals,
  MacroTarget,
} from "../lib/types";
import { storage, uid } from "../lib/storage";
import { useAuth } from "./AuthContext";
import { suggestedMacros } from "../lib/utils";

interface NewEntryInput {
  food: FoodItem;
  mealType: MealType;
  quantity: number;
  date: string;
}

interface DataContextValue {
  foods: FoodItem[];
  entries: FoodEntry[];
  plans: DietPlan[];
  weights: WeightEntry[];
  water: WaterEntry[];
  recipes: Recipe[];
  activePlan: DietPlan | null;
  targets: MacroTarget;
  // entries
  addEntry: (input: NewEntryInput) => FoodEntry;
  updateEntry: (id: string, patch: Partial<FoodEntry>) => void;
  deleteEntry: (id: string) => void;
  entriesForDate: (date: string) => FoodEntry[];
  totalsForDate: (date: string) => DailyTotals;
  // custom foods
  addCustomFood: (food: Omit<FoodItem, "id" | "isCustom" | "userId">) => FoodItem;
  updateCustomFood: (id: string, patch: Partial<FoodItem>) => void;
  deleteCustomFood: (id: string) => void;
  // plans
  addPlan: (plan: Omit<DietPlan, "id" | "userId" | "createdAt">) => void;
  updatePlan: (id: string, patch: Partial<DietPlan>) => void;
  deletePlan: (id: string) => void;
  setActivePlan: (id: string) => void;
  // weight
  addWeight: (weight: number, date: string, note?: string) => void;
  deleteWeight: (id: string) => void;
  // water
  addWater: (amount: number, date: string) => void;
  deleteWater: (id: string) => void;
  // recipes
  addRecipe: (recipe: Omit<Recipe, "id" | "userId" | "createdAt">) => void;
  deleteRecipe: (id: string) => void;
}

const DataContext = createContext<DataContextValue | null>(null);

export function DataProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const userId = user?.id ?? "";

  const [foods, setFoods] = useState<FoodItem[]>(() => storage.getFoods());
  const [entries, setEntries] = useState<FoodEntry[]>(() => storage.getEntries());
  const [plans, setPlans] = useState<DietPlan[]>(() => storage.getPlans());
  const [weights, setWeights] = useState<WeightEntry[]>(() => storage.getWeights());
  const [water, setWater] = useState<WaterEntry[]>(() => storage.getWater());
  const [recipes, setRecipes] = useState<Recipe[]>(() => storage.getRecipes());

  const persist = useCallback((updater: (prev: FoodEntry[]) => FoodEntry[]) => {
    setEntries((prev) => {
      const next = updater(prev);
      storage.setEntries(next);
      return next;
    });
  }, []);

  const addEntry = useCallback(
    (input: NewEntryInput): FoodEntry => {
      const { food, mealType, quantity, date } = input;
      const entry: FoodEntry = {
        id: uid("e-"),
        userId,
        foodId: food.id,
        foodName: food.name,
        brand: food.brand,
        emoji: food.emoji,
        mealType,
        quantity,
        servingSize: food.servingSize,
        servingUnit: food.servingUnit,
        calories: Math.round(food.calories * quantity),
        protein: Math.round(food.protein * quantity * 10) / 10,
        carbs: Math.round(food.carbs * quantity * 10) / 10,
        fat: Math.round(food.fat * quantity * 10) / 10,
        date,
        createdAt: new Date().toISOString(),
      };
      persist((prev) => [entry, ...prev]);
      return entry;
    },
    [userId, persist],
  );

  const updateEntry = useCallback(
    (id: string, patch: Partial<FoodEntry>) => {
      persist((prev) =>
        prev.map((e) => {
          if (e.id !== id) return e;
          const updated = { ...e, ...patch };
          // Recompute macros if quantity changed
          if (patch.quantity !== undefined) {
            const baseFood = foods.find((f) => f.id === e.foodId);
            if (baseFood) {
              updated.calories = Math.round(baseFood.calories * patch.quantity);
              updated.protein = Math.round(baseFood.protein * patch.quantity * 10) / 10;
              updated.carbs = Math.round(baseFood.carbs * patch.quantity * 10) / 10;
              updated.fat = Math.round(baseFood.fat * patch.quantity * 10) / 10;
            }
          }
          return updated;
        }),
      );
    },
    [persist, foods],
  );

  const deleteEntry = useCallback(
    (id: string) => {
      persist((prev) => prev.filter((e) => e.id !== id));
    },
    [persist],
  );

  const entriesForDate = useCallback(
    (date: string) => entries.filter((e) => e.userId === userId && e.date === date),
    [entries, userId],
  );

  const totalsForDate = useCallback(
    (date: string): DailyTotals => {
      const day = entries.filter((e) => e.userId === userId && e.date === date);
      return day.reduce(
        (acc, e) => ({
          calories: acc.calories + e.calories,
          protein: acc.protein + e.protein,
          carbs: acc.carbs + e.carbs,
          fat: acc.fat + e.fat,
        }),
        { calories: 0, protein: 0, carbs: 0, fat: 0 },
      );
    },
    [entries, userId],
  );

  const addCustomFood = useCallback(
    (food: Omit<FoodItem, "id" | "isCustom" | "userId">) => {
      const newFood: FoodItem = { ...food, id: uid("f-"), isCustom: true, userId };
      setFoods((prev) => {
        const next = [newFood, ...prev];
        storage.setFoods(next);
        return next;
      });
      return newFood;
    },
    [userId],
  );

  const updateCustomFood = useCallback((id: string, patch: Partial<FoodItem>) => {
    setFoods((prev) => {
      const next = prev.map((f) => (f.id === id ? { ...f, ...patch } : f));
      storage.setFoods(next);
      return next;
    });
  }, []);

  const deleteCustomFood = useCallback((id: string) => {
    setFoods((prev) => {
      const next = prev.filter((f) => f.id !== id);
      storage.setFoods(next);
      return next;
    });
  }, []);

  const addPlan = useCallback(
    (plan: Omit<DietPlan, "id" | "userId" | "createdAt">) => {
      setPlans((prev) => {
        const next = prev.map((p) => ({ ...p, isActive: false }));
        const newPlan: DietPlan = { ...plan, id: uid("p-"), userId, isActive: true, createdAt: new Date().toISOString() };
        next.push(newPlan);
        storage.setPlans(next);
        return next;
      });
    },
    [userId],
  );

  const updatePlan = useCallback((id: string, patch: Partial<DietPlan>) => {
    setPlans((prev) => {
      const next = prev.map((p) => (p.id === id ? { ...p, ...patch } : p));
      storage.setPlans(next);
      return next;
    });
  }, []);

  const deletePlan = useCallback((id: string) => {
    setPlans((prev) => {
      const next = prev.filter((p) => p.id !== id);
      storage.setPlans(next);
      return next;
    });
  }, []);

  const setActivePlan = useCallback((id: string) => {
    setPlans((prev) => {
      const next = prev.map((p) => ({ ...p, isActive: p.id === id }));
      storage.setPlans(next);
      return next;
    });
  }, []);

  const addWeight = useCallback(
    (weight: number, date: string, note?: string) => {
      setWeights((prev) => {
        // Replace if same date exists
        const filtered = prev.filter((w) => !(w.userId === userId && w.date === date));
        const next = [...filtered, { id: uid("w-"), userId, weight, date, note }];
        next.sort((a, b) => a.date.localeCompare(b.date));
        storage.setWeights(next);
        return next;
      });
    },
    [userId],
  );

  const deleteWeight = useCallback((id: string) => {
    setWeights((prev) => {
      const next = prev.filter((w) => w.id !== id);
      storage.setWeights(next);
      return next;
    });
  }, []);

  const addWater = useCallback(
    (amount: number, date: string) => {
      setWater((prev) => {
        const next = [...prev, { id: uid("wa-"), userId, amount, date, createdAt: new Date().toISOString() }];
        storage.setWater(next);
        return next;
      });
    },
    [userId],
  );

  const deleteWater = useCallback((id: string) => {
    setWater((prev) => {
      const next = prev.filter((w) => w.id !== id);
      storage.setWater(next);
      return next;
    });
  }, []);

  const addRecipe = useCallback(
    (recipe: Omit<Recipe, "id" | "userId" | "createdAt">) => {
      setRecipes((prev) => {
        const next = [...prev, { ...recipe, id: uid("r-"), userId, createdAt: new Date().toISOString() }];
        storage.setRecipes(next);
        return next;
      });
    },
    [userId],
  );

  const deleteRecipe = useCallback((id: string) => {
    setRecipes((prev) => {
      const next = prev.filter((r) => r.id !== id);
      storage.setRecipes(next);
      return next;
    });
  }, []);

  const userPlans = useMemo(() => plans.filter((p) => p.userId === userId), [plans, userId]);
  const activePlan = useMemo(() => userPlans.find((p) => p.isActive) ?? userPlans[0] ?? null, [userPlans]);

  const targets: MacroTarget = useMemo(() => {
    if (activePlan) {
      return { calories: activePlan.calories, protein: activePlan.protein, carbs: activePlan.carbs, fat: activePlan.fat };
    }
    if (user) return suggestedMacros(user);
    return { calories: 2000, protein: 120, carbs: 220, fat: 65 };
  }, [activePlan, user]);

  const value = useMemo<DataContextValue>(
    () => ({
      foods,
      entries,
      plans: userPlans,
      weights: weights.filter((w) => w.userId === userId),
      water: water.filter((w) => w.userId === userId),
      recipes: recipes.filter((r) => r.userId === userId),
      activePlan,
      targets,
      addEntry,
      updateEntry,
      deleteEntry,
      entriesForDate,
      totalsForDate,
      addCustomFood,
      updateCustomFood,
      deleteCustomFood,
      addPlan,
      updatePlan,
      deletePlan,
      setActivePlan,
      addWeight,
      deleteWeight,
      addWater,
      deleteWater,
      addRecipe,
      deleteRecipe,
    }),
    [foods, entries, userPlans, weights, water, recipes, activePlan, targets, addEntry, updateEntry, deleteEntry, entriesForDate, totalsForDate, addCustomFood, updateCustomFood, deleteCustomFood, addPlan, updatePlan, deletePlan, setActivePlan, addWeight, deleteWeight, addWater, deleteWater, addRecipe, deleteRecipe, userId],
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used within DataProvider");
  return ctx;
}
