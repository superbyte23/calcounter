import { useMemo, useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Search, Plus, Pencil, Trash2, X, Beef, Wheat, Droplet, ChefHat } from "lucide-react";
import { useData } from "../context/DataContext";
import { useToast } from "../context/ToastContext";
import { Card, Button, Input, Label, Select, Modal, EmptyState, Badge, Spinner } from "../components/ui";
import { MEAL_LABELS } from "../lib/utils";
import type { FoodItem, MealType } from "../lib/types";

const CATEGORIES = ["All", "Fruits", "Vegetables", "Proteins", "Grains", "Dairy", "Snacks", "Beverages", "Meals"];

export default function FoodSearch() {
  const { foods, addEntry, addCustomFood, updateCustomFood, deleteCustomFood } = useData();
  const { toast } = useToast();
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [selected, setSelected] = useState<FoodItem | null>(null);
  const [meal, setMeal] = useState<MealType>((params.get("meal") as MealType) || "breakfast");
  const [qty, setQty] = useState(1);
  const [searching, setSearching] = useState(false);
  const [showCustom, setShowCustom] = useState(false);
  const [editingFood, setEditingFood] = useState<FoodItem | null>(null);

  const date = params.get("date") || new Date().toISOString().slice(0, 10);

  useEffect(() => {
    if (!query) return;
    setSearching(true);
    const t = setTimeout(() => setSearching(false), 300);
    return () => clearTimeout(t);
  }, [query]);

  const filtered = useMemo(() => {
    return foods.filter((f) => {
      const matchesQuery = !query || f.name.toLowerCase().includes(query.toLowerCase()) || (f.brand?.toLowerCase().includes(query.toLowerCase()));
      const matchesCat = category === "All" || f.category === category;
      return matchesQuery && matchesCat;
    });
  }, [foods, query, category]);

  const openFood = (food: FoodItem) => {
    setSelected(food);
    setQty(1);
  };

  const confirmAdd = () => {
    if (!selected) return;
    addEntry({ food: selected, mealType: meal, quantity: qty, date });
    toast(`Added ${selected.name} to ${MEAL_LABELS[meal]}`, "success");
    setSelected(null);
    navigate(`/app/diary?date=${date}`);
  };

  const handleDeleteCustom = (food: FoodItem) => {
    deleteCustomFood(food.id);
    toast(`Deleted ${food.name}`, "info");
  };

  return (
    <div className="space-y-5">
      {/* Search bar */}
      <Card className="p-4">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search foods, brands, or scan a barcode..."
            className="pl-10"
            autoFocus
          />
          {query && (
            <button onClick={() => setQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                category === c ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </Card>

      {/* Add custom food */}
      <button
        onClick={() => setShowCustom(true)}
        className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-200 py-3 text-sm font-semibold text-slate-500 transition-colors hover:border-emerald-300 hover:bg-emerald-50/50 hover:text-emerald-600"
      >
        <ChefHat className="h-4 w-4" /> Create custom food
      </button>

      {/* Results */}
      {searching ? (
        <div className="flex items-center justify-center py-12">
          <Spinner className="h-6 w-6 text-emerald-500" />
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<Search className="h-6 w-6" />}
          title="No foods found"
          description={query ? `No results for "${query}". Try a different search or create a custom food.` : "Start typing to search the food database."}
        />
      ) : (
        <div className="space-y-2">
          {filtered.map((food) => (
            <Card key={food.id} className="flex items-center gap-3 p-3 transition-shadow hover:shadow-md">
              <button onClick={() => openFood(food)} className="flex min-w-0 flex-1 items-center gap-3 text-left">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-2xl">{food.emoji ?? "🍽️"}</span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-semibold text-slate-800">{food.name}</p>
                    {food.isCustom && <Badge color="violet">Custom</Badge>}
                  </div>
                  <p className="truncate text-xs text-slate-400">{food.brand} · {food.servingUnit}</p>
                </div>
              </button>
              <div className="hidden text-right sm:block">
                <p className="text-sm font-bold text-slate-900">{food.calories}</p>
                <p className="text-[10px] text-slate-400">kcal</p>
              </div>
              <div className="hidden gap-3 text-xs text-slate-400 md:flex">
                <span className="flex items-center gap-1"><Beef className="h-3 w-3 text-sky-400" />{food.protein}g</span>
                <span className="flex items-center gap-1"><Wheat className="h-3 w-3 text-amber-400" />{food.carbs}g</span>
                <span className="flex items-center gap-1"><Droplet className="h-3 w-3 text-rose-400" />{food.fat}g</span>
              </div>
              {food.isCustom ? (
                <div className="flex gap-1">
                  <button onClick={() => setEditingFood(food)} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button onClick={() => handleDeleteCustom(food)} className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <button onClick={() => openFood(food)} className="rounded-lg bg-emerald-50 p-2 text-emerald-600 hover:bg-emerald-100">
                  <Plus className="h-4 w-4" />
                </button>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Add to diary modal */}
      <Modal open={!!selected} onClose={() => setSelected(null)} title="Add to Diary" size="sm">
        {selected && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">
              <span className="text-3xl">{selected.emoji ?? "🍽️"}</span>
              <div className="flex-1">
                <p className="text-sm font-bold text-slate-800">{selected.name}</p>
                <p className="text-xs text-slate-400">{selected.brand} · {selected.servingUnit}</p>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-2 text-center">
              <div className="rounded-lg bg-emerald-50 p-2">
                <p className="text-sm font-bold text-emerald-700">{selected.calories}</p>
                <p className="text-[10px] text-slate-500">kcal</p>
              </div>
              <div className="rounded-lg bg-sky-50 p-2">
                <p className="text-sm font-bold text-sky-700">{selected.protein}g</p>
                <p className="text-[10px] text-slate-500">protein</p>
              </div>
              <div className="rounded-lg bg-amber-50 p-2">
                <p className="text-sm font-bold text-amber-700">{selected.carbs}g</p>
                <p className="text-[10px] text-slate-500">carbs</p>
              </div>
              <div className="rounded-lg bg-rose-50 p-2">
                <p className="text-sm font-bold text-rose-700">{selected.fat}g</p>
                <p className="text-[10px] text-slate-500">fat</p>
              </div>
            </div>
            <div>
              <Label>Meal</Label>
              <Select value={meal} onChange={(e) => setMeal(e.target.value as MealType)}>
                {(Object.keys(MEAL_LABELS) as MealType[]).map((m) => (
                  <option key={m} value={m}>{MEAL_LABELS[m]}</option>
                ))}
              </Select>
            </div>
            <div>
              <Label>Number of servings</Label>
              <Input type="number" min={0.1} step={0.1} value={qty} onChange={(e) => setQty(Number(e.target.value))} />
              <p className="mt-1 text-xs text-slate-400">≈ {Math.round(selected.calories * qty)} kcal · {Math.round(selected.protein * qty)}g protein</p>
            </div>
            <Button className="w-full" onClick={confirmAdd}>
              <Plus className="h-4 w-4" /> Add to diary
            </Button>
          </div>
        )}
      </Modal>

      {/* Custom food modal */}
      <CustomFoodModal
        open={showCustom}
        onClose={() => setShowCustom(false)}
        food={editingFood}
        onSave={(data) => {
          if (editingFood) {
            updateCustomFood(editingFood.id, data);
            toast("Food updated", "success");
          } else {
            addCustomFood(data);
            toast("Custom food created", "success");
          }
          setShowCustom(false);
          setEditingFood(null);
        }}
      />
    </div>
  );
}

function CustomFoodModal({ open, onClose, food, onSave }: { open: boolean; onClose: () => void; food: FoodItem | null; onSave: (data: Omit<FoodItem, "id" | "isCustom" | "userId">) => void }) {
  const [form, setForm] = useState({
    name: "",
    brand: "",
    servingSize: 100,
    servingUnit: "100g",
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    category: "Proteins",
    emoji: "🍽️",
  });

  useEffect(() => {
    if (food) {
      setForm({
        name: food.name,
        brand: food.brand ?? "",
        servingSize: food.servingSize,
        servingUnit: food.servingUnit,
        calories: food.calories,
        protein: food.protein,
        carbs: food.carbs,
        fat: food.fat,
        category: food.category,
        emoji: food.emoji ?? "🍽️",
      });
    } else {
      setForm({ name: "", brand: "", servingSize: 100, servingUnit: "100g", calories: 0, protein: 0, carbs: 0, fat: 0, category: "Proteins", emoji: "🍽️" });
    }
  }, [food, open]);

  const set = (k: string, v: string | number) => setForm((p) => ({ ...p, [k]: v }));

  return (
    <Modal open={open} onClose={onClose} title={food ? "Edit Food" : "Create Custom Food"} size="md">
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-3">
          <div className="col-span-2">
            <Label>Food name</Label>
            <Input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. Grilled Chicken Salad" />
          </div>
          <div>
            <Label>Emoji</Label>
            <Input value={form.emoji} onChange={(e) => set("emoji", e.target.value)} maxLength={2} />
          </div>
        </div>
        <div>
          <Label>Brand (optional)</Label>
          <Input value={form.brand} onChange={(e) => set("brand", e.target.value)} placeholder="e.g. Homemade" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Serving size (g)</Label>
            <Input type="number" value={form.servingSize} onChange={(e) => set("servingSize", Number(e.target.value))} />
          </div>
          <div>
            <Label>Serving label</Label>
            <Input value={form.servingUnit} onChange={(e) => set("servingUnit", e.target.value)} placeholder="1 cup" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Calories</Label>
            <Input type="number" value={form.calories} onChange={(e) => set("calories", Number(e.target.value))} />
          </div>
          <div>
            <Label>Category</Label>
            <Select value={form.category} onChange={(e) => set("category", e.target.value)}>
              {CATEGORIES.filter((c) => c !== "All").map((c) => <option key={c} value={c}>{c}</option>)}
            </Select>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <Label>Protein (g)</Label>
            <Input type="number" value={form.protein} onChange={(e) => set("protein", Number(e.target.value))} />
          </div>
          <div>
            <Label>Carbs (g)</Label>
            <Input type="number" value={form.carbs} onChange={(e) => set("carbs", Number(e.target.value))} />
          </div>
          <div>
            <Label>Fat (g)</Label>
            <Input type="number" value={form.fat} onChange={(e) => set("fat", Number(e.target.value))} />
          </div>
        </div>
        <div className="flex gap-2 pt-2">
          <Button variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
          <Button className="flex-1" onClick={() => onSave(form)} disabled={!form.name}>
            {food ? "Save changes" : "Create food"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
