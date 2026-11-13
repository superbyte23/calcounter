export type MealType = "breakfast" | "lunch" | "dinner" | "snack";

export type Gender = "male" | "female";
export type Goal = "lose" | "maintain" | "gain";
export type ActivityLevel = "sedentary" | "light" | "moderate" | "active" | "very_active";

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  age: number;
  gender: Gender;
  weight: number; // kg
  height: number; // cm
  activityLevel: ActivityLevel;
  goal: Goal;
  targetWeight?: number;
  createdAt: string;
}

export interface FoodItem {
  id: string;
  name: string;
  brand?: string;
  barcode?: string;
  servingSize: number; // in grams or units
  servingUnit: string;
  calories: number; // per serving
  protein: number; // g per serving
  carbs: number; // g per serving
  fat: number; // g per serving
  fiber?: number;
  sugar?: number;
  sodium?: number; // mg
  category: string;
  isCustom?: boolean;
  userId?: string;
  emoji?: string;
}

export interface FoodEntry {
  id: string;
  userId: string;
  foodId: string;
  foodName: string;
  brand?: string;
  emoji?: string;
  mealType: MealType;
  quantity: number; // number of servings
  servingSize: number;
  servingUnit: string;
  calories: number; // total for this entry
  protein: number;
  carbs: number;
  fat: number;
  date: string; // YYYY-MM-DD
  createdAt: string;
}

export interface DietPlan {
  id: string;
  userId: string;
  name: string;
  description?: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  isActive: boolean;
  createdAt: string;
}

export interface WeightEntry {
  id: string;
  userId: string;
  weight: number; // kg
  date: string; // YYYY-MM-DD
  note?: string;
}

export interface WaterEntry {
  id: string;
  userId: string;
  amount: number; // ml
  date: string; // YYYY-MM-DD
  createdAt: string;
}

export interface Recipe {
  id: string;
  userId: string;
  name: string;
  emoji: string;
  servings: number;
  items: { foodId: string; quantity: number }[];
  createdAt: string;
}

export interface DailyTotals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface MacroTarget {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}
