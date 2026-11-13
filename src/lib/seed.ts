import type { FoodItem, FoodEntry, WeightEntry, DietPlan, User, WaterEntry } from "./types";
import { uid } from "./storage";
import { addDays, todayISO } from "./utils";

// A realistic, curated food database with accurate-ish nutrition per serving.
export const SEED_FOODS: FoodItem[] = [
  // Fruits
  { id: "f-banana", name: "Banana", brand: "Fresh", servingSize: 118, servingUnit: "medium (118g)", calories: 105, protein: 1.3, carbs: 27, fat: 0.4, fiber: 3.1, sugar: 14, category: "Fruits", emoji: "🍌" },
  { id: "f-apple", name: "Apple", brand: "Fresh", servingSize: 182, servingUnit: "medium (182g)", calories: 95, protein: 0.5, carbs: 25, fat: 0.3, fiber: 4.4, sugar: 19, category: "Fruits", emoji: "🍎" },
  { id: "f-orange", name: "Orange", brand: "Fresh", servingSize: 131, servingUnit: "medium (131g)", calories: 62, protein: 1.2, carbs: 15, fat: 0.2, fiber: 3.1, sugar: 12, category: "Fruits", emoji: "🍊" },
  { id: "f-strawberry", name: "Strawberries", brand: "Fresh", servingSize: 152, servingUnit: "cup (152g)", calories: 49, protein: 1, carbs: 12, fat: 0.5, fiber: 3, sugar: 7, category: "Fruits", emoji: "🍓" },
  { id: "f-blueberry", name: "Blueberries", brand: "Fresh", servingSize: 148, servingUnit: "cup (148g)", calories: 84, protein: 1.1, carbs: 21, fat: 0.5, fiber: 3.6, sugar: 15, category: "Fruits", emoji: "🫐" },
  { id: "f-avocado", name: "Avocado", brand: "Fresh", servingSize: 150, servingUnit: "medium (150g)", calories: 240, protein: 3, carbs: 12, fat: 22, fiber: 10, sugar: 1, category: "Fruits", emoji: "🥑" },
  { id: "f-grapes", name: "Grapes", brand: "Fresh", servingSize: 151, servingUnit: "cup (151g)", calories: 104, protein: 1.1, carbs: 27, fat: 0.2, fiber: 1.4, sugar: 23, category: "Fruits", emoji: "🍇" },
  { id: "f-watermelon", name: "Watermelon", brand: "Fresh", servingSize: 152, servingUnit: "cup (152g)", calories: 46, protein: 0.9, carbs: 12, fat: 0.2, fiber: 0.6, sugar: 10, category: "Fruits", emoji: "🍉" },

  // Vegetables
  { id: "f-broccoli", name: "Broccoli", brand: "Fresh", servingSize: 91, servingUnit: "cup (91g)", calories: 31, protein: 2.5, carbs: 6, fat: 0.4, fiber: 2.4, sugar: 1.5, category: "Vegetables", emoji: "🥦" },
  { id: "f-carrot", name: "Carrots", brand: "Fresh", servingSize: 128, servingUnit: "cup (128g)", calories: 52, protein: 1.2, carbs: 12, fat: 0.3, fiber: 3.6, sugar: 6, category: "Vegetables", emoji: "🥕" },
  { id: "f-tomato", name: "Tomato", brand: "Fresh", servingSize: 180, servingUnit: "medium (180g)", calories: 33, protein: 1.6, carbs: 7, fat: 0.4, fiber: 2.2, sugar: 5, category: "Vegetables", emoji: "🍅" },
  { id: "f-spinach", name: "Spinach", brand: "Fresh", servingSize: 30, servingUnit: "cup (30g)", calories: 7, protein: 0.9, carbs: 1.1, fat: 0.1, fiber: 0.7, sugar: 0.1, category: "Vegetables", emoji: "🥬" },
  { id: "f-cucumber", name: "Cucumber", brand: "Fresh", servingSize: 104, servingUnit: "cup (104g)", calories: 16, protein: 0.8, carbs: 3.8, fat: 0.1, fiber: 0.5, sugar: 1.7, category: "Vegetables", emoji: "🥒" },
  { id: "f-bellpepper", name: "Bell Pepper", brand: "Fresh", servingSize: 149, servingUnit: "cup (149g)", calories: 46, protein: 1.5, carbs: 9, fat: 0.3, fiber: 3.1, sugar: 5, category: "Vegetables", emoji: "🫑" },
  { id: "f-sweetpotato", name: "Sweet Potato", brand: "Fresh", servingSize: 114, servingUnit: "medium (114g)", calories: 103, protein: 2.3, carbs: 24, fat: 0.2, fiber: 3.8, sugar: 7, category: "Vegetables", emoji: "🍠" },

  // Proteins
  { id: "f-chickenbreast", name: "Chicken Breast", brand: "Fresh", servingSize: 100, servingUnit: "100g", calories: 165, protein: 31, carbs: 0, fat: 3.6, category: "Proteins", emoji: "🍗" },
  { id: "f-salmon", name: "Salmon Fillet", brand: "Fresh", servingSize: 100, servingUnit: "100g", calories: 208, protein: 20, carbs: 0, fat: 13, category: "Proteins", emoji: "🐟" },
  { id: "f-tuna", name: "Canned Tuna", brand: "Chicken of the Sea", servingSize: 85, servingUnit: "can (85g)", calories: 90, protein: 20, carbs: 0, fat: 0.5, sodium: 200, category: "Proteins", emoji: "🐟" },
  { id: "f-egg", name: "Large Egg", brand: "Fresh", servingSize: 50, servingUnit: "1 egg (50g)", calories: 72, protein: 6.3, carbs: 0.4, fat: 5, category: "Proteins", emoji: "🥚" },
  { id: "f-tofu", name: "Firm Tofu", brand: "Nasoya", servingSize: 100, servingUnit: "100g", calories: 144, protein: 15, carbs: 3.9, fat: 9, category: "Proteins", emoji: "🧈" },
  { id: "f-shrimp", name: "Shrimp", brand: "Fresh", servingSize: 100, servingUnit: "100g", calories: 99, protein: 24, carbs: 0.2, fat: 0.3, category: "Proteins", emoji: "🦐" },
  { id: "f-steak", name: "Beef Steak", brand: "Fresh", servingSize: 100, servingUnit: "100g", calories: 271, protein: 25, carbs: 0, fat: 19, category: "Proteins", emoji: "🥩" },
  { id: "f-greekyogurt", name: "Greek Yogurt", brand: "Chobani", servingSize: 170, servingUnit: "container (170g)", calories: 100, protein: 17, carbs: 6, fat: 0.7, sugar: 4, category: "Proteins", emoji: "🥛" },
  { id: "f-cottagecheese", name: "Cottage Cheese", brand: "Daisy", servingSize: 113, servingUnit: "1/2 cup (113g)", calories: 98, protein: 11, carbs: 3.4, fat: 4.4, category: "Proteins", emoji: "🧀" },

  // Grains & Carbs
  { id: "f-oats", name: "Rolled Oats", brand: "Quaker", servingSize: 40, servingUnit: "1/2 cup (40g)", calories: 150, protein: 5, carbs: 27, fat: 3, fiber: 4, sugar: 1, category: "Grains", emoji: "🥣" },
  { id: "f-bread", name: "Whole Wheat Bread", brand: "Dave's Killer", servingSize: 45, servingUnit: "1 slice (45g)", calories: 110, protein: 5, carbs: 22, fat: 1.5, fiber: 3, sugar: 3, category: "Grains", emoji: "🍞" },
  { id: "f-brownrice", name: "Brown Rice", brand: "Lundberg", servingSize: 195, servingUnit: "1 cup cooked (195g)", calories: 216, protein: 5, carbs: 45, fat: 1.8, fiber: 3.5, sugar: 0.7, category: "Grains", emoji: "🍚" },
  { id: "f-quinoa", name: "Quinoa", brand: "Bob's Red Mill", servingSize: 185, servingUnit: "1 cup cooked (185g)", calories: 222, protein: 8, carbs: 39, fat: 3.5, fiber: 5.2, sugar: 1.6, category: "Grains", emoji: "🌾" },
  { id: "f-pasta", name: "Whole Wheat Pasta", brand: "Barilla", servingSize: 140, servingUnit: "1 cup cooked (140g)", calories: 174, protein: 7.5, carbs: 37, fat: 0.8, fiber: 4.6, sugar: 0.6, category: "Grains", emoji: "🍝" },
  { id: "f-tortilla", name: "Whole Wheat Tortilla", brand: "Mission", servingSize: 49, servingUnit: "1 tortilla (49g)", calories: 140, protein: 5, carbs: 25, fat: 2.5, fiber: 4, sugar: 0, category: "Grains", emoji: "🫓" },
  { id: "f-granola", name: "Granola", brand: "Bear Naked", servingSize: 55, servingUnit: "1/2 cup (55g)", calories: 260, protein: 6, carbs: 33, fat: 12, fiber: 4, sugar: 15, category: "Grains", emoji: "🥜" },

  // Dairy & Alternatives
  { id: "f-milk", name: "2% Milk", brand: "Horizon", servingSize: 244, servingUnit: "1 cup (244g)", calories: 122, protein: 8.1, carbs: 12, fat: 4.8, sugar: 12, category: "Dairy", emoji: "🥛" },
  { id: "f-almondmilk", name: "Almond Milk", brand: "Califia", servingSize: 240, servingUnit: "1 cup (240g)", calories: 30, protein: 1, carbs: 1, fat: 2.5, category: "Dairy", emoji: "🥛" },
  { id: "f-cheddar", name: "Cheddar Cheese", brand: "Cabot", servingSize: 28, servingUnit: "1 oz (28g)", calories: 114, protein: 7, carbs: 0.4, fat: 9.3, category: "Dairy", emoji: "🧀" },
  { id: "f-mozzarella", name: "Mozzarella", brand: "Fresh", servingSize: 28, servingUnit: "1 oz (28g)", calories: 85, protein: 6.3, carbs: 0.7, fat: 6.3, category: "Dairy", emoji: "🧀" },

  // Snacks & Packaged
  { id: "f-almonds", name: "Almonds", brand: "Blue Diamond", servingSize: 28, servingUnit: "1 oz (28g)", calories: 164, protein: 6, carbs: 6, fat: 14, fiber: 3.5, sugar: 1.2, category: "Snacks", emoji: "🥜" },
  { id: "f-peanutbutter", name: "Peanut Butter", brand: "Jif", servingSize: 32, servingUnit: "2 tbsp (32g)", calories: 188, protein: 8, carbs: 6.9, fat: 16, fiber: 2, sugar: 3, category: "Snacks", emoji: "🥜" },
  { id: "f-hummus", name: "Hummus", brand: "Sabra", servingSize: 70, servingUnit: "1/4 cup (70g)", calories: 140, protein: 4, carbs: 11, fat: 9, fiber: 3, category: "Snacks", emoji: "🥙" },
  { id: "f-chips", name: "Potato Chips", brand: "Lay's", servingSize: 28, servingUnit: "1 oz (28g)", calories: 152, protein: 2, carbs: 15, fat: 10, sodium: 170, category: "Snacks", emoji: "🍟" },
  { id: "f-darkchocolate", name: "Dark Chocolate", brand: "Lindt 70%", servingSize: 40, servingUnit: "1 square (40g)", calories: 220, protein: 2.3, carbs: 24, fat: 14, fiber: 3.6, sugar: 18, category: "Snacks", emoji: "🍫" },
  { id: "f-popcorn", name: "Air-Popped Popcorn", brand: "SkinnyPop", servingSize: 31, servingUnit: "1 cup (31g)", calories: 110, protein: 2, carbs: 14, fat: 5, fiber: 2, category: "Snacks", emoji: "🍿" },
  { id: "f-proteinbar", name: "Protein Bar", brand: "Quest", servingSize: 60, servingUnit: "1 bar (60g)", calories: 200, protein: 21, carbs: 20, fat: 6, fiber: 14, sugar: 1, category: "Snacks", emoji: "🍫" },

  // Beverages
  { id: "f-coffee", name: "Black Coffee", brand: "Brewed", servingSize: 240, servingUnit: "1 cup (240g)", calories: 2, protein: 0.3, carbs: 0, fat: 0, category: "Beverages", emoji: "☕" },
  { id: "f-latte", name: "Caffe Latte", brand: "Starbucks", servingSize: 354, servingUnit: "grande (354g)", calories: 190, protein: 12, carbs: 18, fat: 7, sugar: 18, category: "Beverages", emoji: "☕" },
  { id: "f-orangejuice", name: "Orange Juice", brand: "Tropicana", servingSize: 248, servingUnit: "1 cup (248g)", calories: 112, protein: 1.7, carbs: 26, fat: 0.5, sugar: 21, category: "Beverages", emoji: "🧃" },
  { id: "f-beer", name: "Beer", brand: "Craft", servingSize: 355, servingUnit: "12 oz (355g)", calories: 153, protein: 1.6, carbs: 13, fat: 0, category: "Beverages", emoji: "🍺" },
  { id: "f-wine", name: "Red Wine", brand: "Cabernet", servingSize: 148, servingUnit: "5 oz (148g)", calories: 125, protein: 0.1, carbs: 3.8, fat: 0, category: "Beverages", emoji: "🍷" },
  { id: "f-soda", name: "Cola", brand: "Coca-Cola", servingSize: 355, servingUnit: "12 oz (355g)", calories: 140, protein: 0, carbs: 39, fat: 0, sugar: 39, sodium: 45, category: "Beverages", emoji: "🥤" },

  // Meals / Mixed
  { id: "f-pizza", name: "Cheese Pizza", brand: "Domino's", servingSize: 107, servingUnit: "1 slice (107g)", calories: 285, protein: 12, carbs: 36, fat: 10, sodium: 640, category: "Meals", emoji: "🍕" },
  { id: "f-burger", name: "Cheeseburger", brand: "McDonald's", servingSize: 119, servingUnit: "1 burger (119g)", calories: 300, protein: 15, carbs: 33, fat: 12, sodium: 680, category: "Meals", emoji: "🍔" },
  { id: "f-sushi", name: "California Roll", brand: "Genki", servingSize: 160, servingUnit: "8 pcs (160g)", calories: 255, protein: 6, carbs: 38, fat: 8, sodium: 380, category: "Meals", emoji: "🍣" },
  { id: "f-tacos", name: "Beef Tacos", brand: "Chipotle", servingSize: 200, servingUnit: "2 tacos (200g)", calories: 420, protein: 18, carbs: 38, fat: 21, sodium: 700, category: "Meals", emoji: "🌮" },
  { id: "f-salad", name: "Caesar Salad", brand: "Panera", servingSize: 280, servingUnit: "bowl (280g)", calories: 320, protein: 9, carbs: 12, fat: 27, sodium: 690, category: "Meals", emoji: "🥗" },
  { id: "f-pancakes", name: "Pancakes", brand: "IHOP", servingSize: 230, servingUnit: "3 pcs (230g)", calories: 510, protein: 10, carbs: 70, fat: 20, sugar: 24, category: "Meals", emoji: "🥞" },
  { id: "f-icecream", name: "Vanilla Ice Cream", brand: "Ben & Jerry's", servingSize: 102, servingUnit: "1/2 cup (102g)", calories: 270, protein: 4, carbs: 28, fat: 16, sugar: 24, category: "Meals", emoji: "🍦" },
  { id: "f-cereal", name: "Cheerios", brand: "General Mills", servingSize: 28, servingUnit: "1 cup (28g)", calories: 100, protein: 3, carbs: 20, fat: 2, fiber: 3, sugar: 1, category: "Grains", emoji: "🥣" },
];

export const SEED_USER: User = {
  id: "demo-user",
  name: "Alex Morgan",
  email: "demo@calcounter.app",
  password: "demo1234",
  age: 29,
  gender: "female",
  weight: 68,
  height: 168,
  activityLevel: "light",
  goal: "lose",
  targetWeight: 60,
  createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
};

export function seedDemoEntries(userId: string): FoodEntry[] {
  const today = todayISO();
  const entries: FoodEntry[] = [];
  // Generate ~10 days of entries so charts look alive
  for (let i = 9; i >= 0; i--) {
    const date = addDays(today, -i);
    const day = new Date(date).getDay();
    // Vary the day's food a bit
    const dayPlan = dayPlans[day % dayPlans.length];
    dayPlan.forEach((item, idx) => {
      const food = SEED_FOODS.find((f) => f.id === item.foodId)!;
      const qty = item.qty;
      entries.push({
        id: uid("e-"),
        userId,
        foodId: food.id,
        foodName: food.name,
        brand: food.brand,
        emoji: food.emoji,
        mealType: item.meal,
        quantity: qty,
        servingSize: food.servingSize,
        servingUnit: food.servingUnit,
        calories: Math.round(food.calories * qty),
        protein: round1(food.protein * qty),
        carbs: round1(food.carbs * qty),
        fat: round1(food.fat * qty),
        date,
        createdAt: new Date(parseISO(date).getTime() + idx * 3600000).toISOString(),
      });
    });
  }
  return entries;
}

function round1(n: number) {
  return Math.round(n * 10) / 10;
}

function parseISO(s: string) {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
}

const dayPlans: { foodId: string; qty: number; meal: "breakfast" | "lunch" | "dinner" | "snack" }[][] = [
  [
    { foodId: "f-oats", qty: 1, meal: "breakfast" },
    { foodId: "f-banana", qty: 1, meal: "breakfast" },
    { foodId: "f-almondmilk", qty: 1, meal: "breakfast" },
    { foodId: "f-chickenbreast", qty: 1.2, meal: "lunch" },
    { foodId: "f-brownrice", qty: 1, meal: "lunch" },
    { foodId: "f-broccoli", qty: 1, meal: "lunch" },
    { foodId: "f-greekyogurt", qty: 1, meal: "snack" },
    { foodId: "f-salmon", qty: 1, meal: "dinner" },
    { foodId: "f-sweetpotato", qty: 1, meal: "dinner" },
    { foodId: "f-spinach", qty: 1, meal: "dinner" },
  ],
  [
    { foodId: "f-egg", qty: 2, meal: "breakfast" },
    { foodId: "f-bread", qty: 2, meal: "breakfast" },
    { foodId: "f-coffee", qty: 1, meal: "breakfast" },
    { foodId: "f-tuna", qty: 1, meal: "lunch" },
    { foodId: "f-tortilla", qty: 2, meal: "lunch" },
    { foodId: "f-spinach", qty: 1, meal: "lunch" },
    { foodId: "f-apple", qty: 1, meal: "snack" },
    { foodId: "f-pasta", qty: 1, meal: "dinner" },
    { foodId: "f-mozzarella", qty: 1, meal: "dinner" },
    { foodId: "f-tomato", qty: 1, meal: "dinner" },
  ],
  [
    { foodId: "f-greekyogurt", qty: 1, meal: "breakfast" },
    { foodId: "f-granola", qty: 0.5, meal: "breakfast" },
    { foodId: "f-blueberry", qty: 1, meal: "breakfast" },
    { foodId: "f-sushi", qty: 1, meal: "lunch" },
    { foodId: "f-spinach", qty: 1, meal: "lunch" },
    { foodId: "f-almonds", qty: 1, meal: "snack" },
    { foodId: "f-steak", qty: 1, meal: "dinner" },
    { foodId: "f-quinoa", qty: 1, meal: "dinner" },
    { foodId: "f-bellpepper", qty: 1, meal: "dinner" },
  ],
  [
    { foodId: "f-pancakes", qty: 1, meal: "breakfast" },
    { foodId: "f-milk", qty: 1, meal: "breakfast" },
    { foodId: "f-strawberry", qty: 1, meal: "breakfast" },
    { foodId: "f-tacos", qty: 1, meal: "lunch" },
    { foodId: "f-orange", qty: 1, meal: "snack" },
    { foodId: "f-salmon", qty: 1, meal: "dinner" },
    { foodId: "f-brownrice", qty: 1, meal: "dinner" },
    { foodId: "f-cucumber", qty: 1, meal: "dinner" },
  ],
  [
    { foodId: "f-cereal", qty: 1, meal: "breakfast" },
    { foodId: "f-milk", qty: 1, meal: "breakfast" },
    { foodId: "f-banana", qty: 1, meal: "breakfast" },
    { foodId: "f-salad", qty: 1, meal: "lunch" },
    { foodId: "f-chickenbreast", qty: 0.8, meal: "lunch" },
    { foodId: "f-hummus", qty: 1, meal: "snack" },
    { foodId: "f-pizza", qty: 2, meal: "dinner" },
    { foodId: "f-wine", qty: 1, meal: "dinner" },
  ],
  [
    { foodId: "f-egg", qty: 2, meal: "breakfast" },
    { foodId: "f-bread", qty: 1, meal: "breakfast" },
    { foodId: "f-avocado", qty: 0.5, meal: "breakfast" },
    { foodId: "f-quinoa", qty: 1, meal: "lunch" },
    { foodId: "f-tofu", qty: 1, meal: "lunch" },
    { foodId: "f-carrot", qty: 1, meal: "lunch" },
    { foodId: "f-darkchocolate", qty: 0.5, meal: "snack" },
    { foodId: "f-burger", qty: 1, meal: "dinner" },
    { foodId: "f-beer", qty: 1, meal: "dinner" },
  ],
  [
    { foodId: "f-oats", qty: 1, meal: "breakfast" },
    { foodId: "f-blueberry", qty: 1, meal: "breakfast" },
    { foodId: "f-peanutbutter", qty: 0.5, meal: "breakfast" },
    { foodId: "f-chickenbreast", qty: 1, meal: "lunch" },
    { foodId: "f-pasta", qty: 1, meal: "lunch" },
    { foodId: "f-tomato", qty: 1, meal: "lunch" },
    { foodId: "f-grapes", qty: 1, meal: "snack" },
    { foodId: "f-shrimp", qty: 1, meal: "dinner" },
    { foodId: "f-brownrice", qty: 1, meal: "dinner" },
    { foodId: "f-broccoli", qty: 1, meal: "dinner" },
  ],
];

export function seedWeights(userId: string): WeightEntry[] {
  const today = todayISO();
  const weights: WeightEntry[] = [];
  let w = 71.5;
  for (let i = 30; i >= 0; i -= 3) {
    const date = addDays(today, -i);
    w -= 0.25 + Math.random() * 0.2;
    weights.push({
      id: uid("w-"),
      userId,
      weight: Math.round(w * 10) / 10,
      date,
    });
  }
  return weights;
}

export function seedWater(userId: string): WaterEntry[] {
  const today = todayISO();
  const water: WaterEntry[] = [];
  for (let i = 6; i >= 0; i--) {
    const date = addDays(today, -i);
    const glasses = 5 + Math.floor(Math.random() * 4);
    water.push({
      id: uid("wa-"),
      userId,
      amount: glasses * 250,
      date,
      createdAt: new Date().toISOString(),
    });
  }
  return water;
}

export function seedPlans(userId: string): DietPlan[] {
  return [
    {
      id: uid("p-"),
      userId,
      name: "Cutting Plan",
      description: "Moderate deficit with high protein to preserve muscle.",
      calories: 1600,
      protein: 130,
      carbs: 160,
      fat: 55,
      isActive: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: uid("p-"),
      userId,
      name: "Maintenance",
      description: "Balanced macros for maintaining current weight.",
      calories: 2100,
      protein: 110,
      carbs: 240,
      fat: 70,
      isActive: false,
      createdAt: new Date().toISOString(),
    },
  ];
}
