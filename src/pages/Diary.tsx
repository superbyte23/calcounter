import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, Plus, Search, ScanLine, Camera, Trash2, Pencil, Droplet } from "lucide-react";
import { useData } from "../context/DataContext";
import { useToast } from "../context/ToastContext";
import { Card, Button, ProgressBar, Modal, Input, Label, Badge } from "../components/ui";
import { MEAL_LABELS, MEAL_EMOJI, todayISO, addDays, formatDate, relativeDay, pct } from "../lib/utils";
import type { MealType, FoodEntry } from "../lib/types";

const MEAL_ORDER: MealType[] = ["breakfast", "lunch", "dinner", "snack"];

export default function Diary() {
  const { entriesForDate, totalsForDate, targets, deleteEntry, updateEntry, addWater, water } = useData();
  const { toast } = useToast();
  const [date, setDate] = useState(todayISO());
  const [editing, setEditing] = useState<FoodEntry | null>(null);
  const [editQty, setEditQty] = useState(1);

  const entries = entriesForDate(date);
  const totals = totalsForDate(date);
  const remaining = Math.max(0, targets.calories - totals.calories);

  const grouped = useMemo(() => {
    const g: Record<MealType, FoodEntry[]> = { breakfast: [], lunch: [], dinner: [], snack: [] };
    entries.forEach((e) => g[e.mealType].push(e));
    return g;
  }, [entries]);

  const todayWater = water.filter((w) => w.date === date).reduce((s, w) => s + w.amount, 0);

  const startEdit = (e: FoodEntry) => {
    setEditing(e);
    setEditQty(e.quantity);
  };

  const saveEdit = () => {
    if (!editing) return;
    updateEntry(editing.id, { quantity: editQty });
    toast("Entry updated", "success");
    setEditing(null);
  };

  const handleDelete = (id: string, name: string) => {
    deleteEntry(id);
    toast(`Removed ${name}`, "info");
  };

  const logWater = (ml: number) => {
    addWater(ml, date);
    toast(`Logged ${ml}ml water`, "success");
  };

  return (
    <div className="space-y-6">
      {/* Date navigator */}
      <Card className="flex items-center justify-between p-3">
        <button onClick={() => setDate(addDays(date, -1))} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100">
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div className="text-center">
          <p className="text-sm font-bold text-slate-900">{formatDate(date)}</p>
          <p className="text-xs text-slate-400">{relativeDay(date)}</p>
        </div>
        <button onClick={() => setDate(addDays(date, 1))} disabled={date >= todayISO()} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 disabled:opacity-30">
          <ChevronRight className="h-5 w-5" />
        </button>
      </Card>

      {/* Summary */}
      <Card className="p-5">
        <div className="grid grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-slate-900">{totals.calories}</p>
            <p className="text-xs text-slate-400">Consumed</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-emerald-600">{remaining}</p>
            <p className="text-xs text-slate-400">Remaining</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-slate-900">{targets.calories}</p>
            <p className="text-xs text-slate-400">Goal</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-slate-900">{Math.round(pct(totals.calories, targets.calories))}%</p>
            <p className="text-xs text-slate-400">Complete</p>
          </div>
        </div>
        <div className="mt-4">
          <ProgressBar value={totals.calories} max={targets.calories} />
        </div>
        <div className="mt-4 grid grid-cols-3 gap-3">
          {[
            { label: "Protein", val: totals.protein, tgt: targets.protein, color: "sky" },
            { label: "Carbs", val: totals.carbs, tgt: targets.carbs, color: "amber" },
            { label: "Fat", val: totals.fat, tgt: targets.fat, color: "rose" },
          ].map((m) => (
            <div key={m.label} className="rounded-xl bg-slate-50 p-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-600">{m.label}</span>
                <span className="text-slate-400">{Math.round(m.val)}/{Math.round(m.tgt)}g</span>
              </div>
              <ProgressBar value={m.val} max={m.tgt} color={m.color as "sky" | "amber" | "rose"} className="mt-1.5" />
            </div>
          ))}
        </div>
      </Card>

      {/* Water quick log */}
      <Card className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50">
            <Droplet className="h-5 w-5 text-sky-500" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-700">Water</p>
            <p className="text-xs text-slate-400">{(todayWater / 1000).toFixed(1)}L of 2.5L</p>
          </div>
        </div>
        <div className="flex gap-2">
          {[250, 500].map((ml) => (
            <button key={ml} onClick={() => logWater(ml)} className="rounded-lg bg-sky-50 px-3 py-1.5 text-xs font-semibold text-sky-600 hover:bg-sky-100">
              +{ml}ml
            </button>
          ))}
        </div>
      </Card>

      {/* Meals */}
      <div className="space-y-4">
        {MEAL_ORDER.map((meal) => {
          const mealEntries = grouped[meal];
          const mealCal = mealEntries.reduce((s, e) => s + e.calories, 0);
          return (
            <Card key={meal} className="overflow-hidden">
              <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{MEAL_EMOJI[meal]}</span>
                  <h3 className="text-sm font-bold text-slate-900">{MEAL_LABELS[meal]}</h3>
                  <Badge color="slate">{mealCal} kcal</Badge>
                </div>
                <Link to={`/app/foods?meal=${meal}&date=${date}`} className="flex items-center gap-1 text-sm font-semibold text-emerald-600 hover:text-emerald-700">
                  <Plus className="h-4 w-4" /> Add
                </Link>
              </div>
              {mealEntries.length === 0 ? (
                <div className="px-5 py-6 text-center">
                  <p className="text-sm text-slate-400">No {MEAL_LABELS[meal].toLowerCase()} logged</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-50">
                  {mealEntries.map((e) => (
                    <div key={e.id} className="group flex items-center gap-3 px-5 py-3">
                      <span className="text-xl">{e.emoji ?? "🍽️"}</span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-slate-800">{e.foodName}</p>
                        <p className="text-xs text-slate-400">
                          {e.quantity} × {e.servingSize}{e.servingUnit.includes("g") && !e.servingUnit.includes("(") ? "g" : ""} {e.servingUnit}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-slate-900">{e.calories}</p>
                        <p className="text-[10px] text-slate-400">kcal</p>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                        <button onClick={() => startEdit(e)} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button onClick={() => handleDelete(e.id, e.foodName)} className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {/* Quick add bar */}
      <div className="sticky bottom-4 z-10 flex justify-center">
        <div className="flex gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-lg">
          <Link to={`/app/foods?date=${date}`} className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700">
            <Search className="h-4 w-4" /> Search Food
          </Link>
          <Link to="/app/scan" className="flex items-center gap-2 rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-200">
            <ScanLine className="h-4 w-4" /> Scan
          </Link>
          <Link to="/app/meal-scan" className="flex items-center gap-2 rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-200">
            <Camera className="h-4 w-4" /> Meal
          </Link>
        </div>
      </div>

      {/* Edit modal */}
      <Modal open={!!editing} onClose={() => setEditing(null)} title="Edit Entry" size="sm">
        {editing && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">
              <span className="text-2xl">{editing.emoji ?? "🍽️"}</span>
              <div>
                <p className="text-sm font-semibold text-slate-800">{editing.foodName}</p>
                <p className="text-xs text-slate-400">{editing.servingUnit}</p>
              </div>
            </div>
            <div>
              <Label>Number of servings</Label>
              <Input type="number" min={0.1} step={0.1} value={editQty} onChange={(e) => setEditQty(Number(e.target.value))} />
            </div>
            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="rounded-xl bg-emerald-50 p-3">
                <p className="text-lg font-bold text-emerald-700">{Math.round(editing.calories * (editQty / editing.quantity))}</p>
                <p className="text-xs text-slate-500">Calories</p>
              </div>
              <div className="rounded-xl bg-sky-50 p-3">
                <p className="text-lg font-bold text-sky-700">{Math.round(editing.protein * (editQty / editing.quantity))}g</p>
                <p className="text-xs text-slate-500">Protein</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setEditing(null)}>Cancel</Button>
              <Button className="flex-1" onClick={saveEdit}>Save</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
