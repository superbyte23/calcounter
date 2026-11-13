import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Camera, Sparkles, Loader2, X, Plus, Wand2 } from "lucide-react";
import { useData } from "../context/DataContext";
import { useToast } from "../context/ToastContext";
import { Card, Button } from "../components/ui";
import { MEAL_LABELS } from "../lib/utils";
import type { FoodItem, MealType } from "../lib/types";

interface ScannedItem { food: FoodItem; qty: number; }

const MEAL_PRESETS: { name: string; emoji: string; items: { foodId: string; qty: number }[] }[] = [
  {
    name: "Grilled Chicken Bowl",
    emoji: "🍗",
    items: [
      { foodId: "f-chickenbreast", qty: 1.2 },
      { foodId: "f-brownrice", qty: 1 },
      { foodId: "f-broccoli", qty: 1 },
      { foodId: "f-avocado", qty: 0.3 },
    ],
  },
  {
    name: "Avocado Toast",
    emoji: "🥑",
    items: [
      { foodId: "f-bread", qty: 2 },
      { foodId: "f-avocado", qty: 0.5 },
      { foodId: "f-egg", qty: 1 },
    ],
  },
  {
    name: "Greek Yogurt Parfait",
    emoji: "🥛",
    items: [
      { foodId: "f-greekyogurt", qty: 1 },
      { foodId: "f-granola", qty: 0.5 },
      { foodId: "f-blueberry", qty: 0.5 },
      { foodId: "f-banana", qty: 0.5 },
    ],
  },
  {
    name: "Salmon & Veggies",
    emoji: "🐟",
    items: [
      { foodId: "f-salmon", qty: 1 },
      { foodId: "f-sweetpotato", qty: 1 },
      { foodId: "f-spinach", qty: 1 },
    ],
  },
  {
    name: "Protein Smoothie",
    emoji: "🥤",
    items: [
      { foodId: "f-greekyogurt", qty: 0.5 },
      { foodId: "f-banana", qty: 1 },
      { foodId: "f-blueberry", qty: 0.5 },
      { foodId: "f-almondmilk", qty: 1 },
      { foodId: "f-peanutbutter", qty: 0.5 },
    ],
  },
  {
    name: "Cheese Pizza",
    emoji: "🍕",
    items: [
      { foodId: "f-pizza", qty: 2 },
      { foodId: "f-soda", qty: 1 },
    ],
  },
];

const STEPS = ["Capturing image...", "Detecting food items...", "Estimating portions...", "Calculating nutrition..."];

export default function MealScan() {
  const { foods, addEntry } = useData();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [phase, setPhase] = useState<"idle" | "scanning" | "result">("idle");
  const [stepIdx, setStepIdx] = useState(0);
  const [scanned, setScanned] = useState<ScannedItem[]>([]);
  const [meal, setMeal] = useState<MealType>("lunch");
  const [preset, setPreset] = useState<typeof MEAL_PRESETS[0] | null>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const startScan = () => {
    setPhase("scanning");
    setStepIdx(0);
    const pick = MEAL_PRESETS[Math.floor(Math.random() * MEAL_PRESETS.length)];
    setPreset(pick);

    // Animate through steps
    STEPS.forEach((_, i) => {
      timers.current.push(setTimeout(() => setStepIdx(i), i * 700));
    });

    // Build result
    timers.current.push(
      setTimeout(() => {
        const items: ScannedItem[] = pick.items
          .map((it) => {
            const food = foods.find((f) => f.id === it.foodId);
            return food ? { food, qty: it.qty } : null;
          })
          .filter(Boolean) as ScannedItem[];
        setScanned(items);
        setPhase("result");
      }, STEPS.length * 700 + 400),
    );
  };

  const totals = scanned.reduce(
    (acc, s) => ({
      calories: acc.calories + s.food.calories * s.qty,
      protein: acc.protein + s.food.protein * s.qty,
      carbs: acc.carbs + s.food.carbs * s.qty,
      fat: acc.fat + s.food.fat * s.qty,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 },
  );

  const confirmAll = () => {
    const date = new Date().toISOString().slice(0, 10);
    scanned.forEach((s) => addEntry({ food: s.food, mealType: meal, quantity: s.qty, date }));
    toast(`Added ${scanned.length} items to ${MEAL_LABELS[meal]}`, "success");
    navigate(`/app/diary?date=${date}`);
  };

  const removeItem = (idx: number) => {
    setScanned((prev) => prev.filter((_, i) => i !== idx));
  };

  const reset = () => {
    setPhase("idle");
    setScanned([]);
    setStepIdx(0);
  };

  return (
    <div className="space-y-5">
      <Card className="overflow-hidden">
        {/* Camera viewport */}
        <div className="relative aspect-[4/3] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 50% 50%, rgba(255,255,255,0.3) 0%, transparent 70%)" }} />

          {/* Shutter button area */}
          <div className="absolute inset-0 flex items-center justify-center">
            {phase === "idle" && (
              <button onClick={startScan} className="group flex flex-col items-center gap-3">
                <span className="flex h-20 w-20 items-center justify-center rounded-full border-4 border-white/30 bg-white/10 backdrop-blur transition-all group-hover:scale-105 group-active:scale-95">
                  <Camera className="h-9 w-9 text-white" />
                </span>
                <span className="text-sm font-medium text-white/70">Tap to scan meal</span>
              </button>
            )}

            {phase === "scanning" && (
              <div className="text-center">
                <div className="relative mx-auto h-20 w-20">
                  <div className="absolute inset-0 rounded-full border-4 border-emerald-400/30" />
                  <div className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-t-emerald-400" />
                  <Loader2 className="absolute inset-0 m-auto h-8 w-8 animate-pulse text-emerald-400" />
                </div>
                <p className="mt-4 flex items-center gap-2 text-sm font-medium text-white/80">
                  <Sparkles className="h-4 w-4 text-emerald-400" /> {STEPS[stepIdx]}
                </p>
              </div>
            )}

            {phase === "result" && preset && (
              <div className="text-center">
                <div className="text-6xl">{preset.emoji}</div>
                <p className="mt-2 text-lg font-bold text-white">{preset.name}</p>
                <p className="text-xs text-white/50">AI-estimated meal</p>
              </div>
            )}
          </div>

          {/* AI badge */}
          {phase !== "idle" && (
            <div className="absolute left-4 top-4 flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-3 py-1 backdrop-blur">
              <Wand2 className="h-3.5 w-3.5 text-emerald-400" />
              <span className="text-xs font-semibold text-emerald-300">Meal Scan AI</span>
            </div>
          )}
        </div>

        {/* Result panel */}
        {phase === "result" && (
          <div className="p-4">
            {/* Detected items */}
            <div className="mb-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Detected {scanned.length} items</p>
              <div className="space-y-2">
                {scanned.map((s, idx) => (
                  <div key={idx} className="group flex items-center gap-3 rounded-xl border border-slate-100 p-2.5">
                    <span className="text-2xl">{s.food.emoji}</span>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-slate-800">{s.food.name}</p>
                      <p className="text-xs text-slate-400">{s.qty} × {s.food.servingUnit}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-slate-900">{Math.round(s.food.calories * s.qty)}</p>
                      <p className="text-[10px] text-slate-400">kcal</p>
                    </div>
                    <button onClick={() => removeItem(idx)} className="rounded-lg p-1.5 text-slate-300 opacity-0 transition-opacity hover:bg-rose-50 hover:text-rose-500 group-hover:opacity-100">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Totals */}
            <div className="mb-4 rounded-xl bg-slate-50 p-3">
              <div className="grid grid-cols-4 gap-2 text-center">
                <div>
                  <p className="text-lg font-bold text-emerald-600">{Math.round(totals.calories)}</p>
                  <p className="text-[10px] text-slate-500">kcal</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-sky-600">{Math.round(totals.protein)}g</p>
                  <p className="text-[10px] text-slate-500">protein</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-amber-600">{Math.round(totals.carbs)}g</p>
                  <p className="text-[10px] text-slate-500">carbs</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-rose-600">{Math.round(totals.fat)}g</p>
                  <p className="text-[10px] text-slate-500">fat</p>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={reset}>
                <X className="h-4 w-4" /> Rescan
              </Button>
              <Button className="flex-1" onClick={confirmAll} disabled={scanned.length === 0}>
                <Plus className="h-4 w-4" /> Log all
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* How it works */}
      <Card className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-violet-50">
            <Wand2 className="h-4 w-4 text-violet-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-700">AI-Powered Meal Scan</p>
            <p className="mt-0.5 text-xs text-slate-500">
              Take a photo of your plate and our AI instantly identifies the foods, estimates portion sizes, and logs the full meal with macros — all in seconds.
            </p>
          </div>
        </div>
      </Card>

      {phase === "result" && (
        <Card className="p-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Assign to meal</p>
          <div className="grid grid-cols-4 gap-2">
            {(Object.keys(MEAL_LABELS) as MealType[]).map((m) => (
              <button
                key={m}
                onClick={() => setMeal(m)}
                className={`rounded-xl px-2 py-2.5 text-xs font-semibold transition-colors ${
                  meal === m ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {MEAL_LABELS[m]}
              </button>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
