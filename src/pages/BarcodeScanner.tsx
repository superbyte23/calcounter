import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ScanLine, Camera, Check, X, Plus, Search } from "lucide-react";
import { useData } from "../context/DataContext";
import { useToast } from "../context/ToastContext";
import { Card, Button, Modal, Input, Label, Select, Badge } from "../components/ui";
import { MEAL_LABELS } from "../lib/utils";
import type { FoodItem, MealType } from "../lib/types";

export default function BarcodeScanner() {
  const { foods, addEntry } = useData();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [scanning, setScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [found, setFound] = useState<FoodItem | null>(null);
  const [meal, setMeal] = useState<MealType>("breakfast");
  const [qty, setQty] = useState(1);
  const [manualOpen, setManualOpen] = useState(false);
  const [manualCode, setManualCode] = useState("");
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const scannableFoods = foods.filter((f) => !f.isCustom);

  const startScan = () => {
    setScanning(true);
    setProgress(0);
    setFound(null);
    timerRef.current = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          if (timerRef.current) clearInterval(timerRef.current);
          // Pick a random food
          const pick = scannableFoods[Math.floor(Math.random() * scannableFoods.length)];
          setFound(pick);
          setScanning(false);
          return 100;
        }
        return p + 4;
      });
    }, 60);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const confirmAdd = () => {
    if (!found) return;
    const date = new Date().toISOString().slice(0, 10);
    addEntry({ food: found, mealType: meal, quantity: qty, date });
    toast(`Added ${found.name}`, "success");
    navigate(`/app/diary?date=${date}`);
  };

  const manualLookup = () => {
    if (!manualCode.trim()) return;
    const pick = scannableFoods[Math.floor(Math.random() * scannableFoods.length)];
    setFound(pick);
    setManualOpen(false);
    setManualCode("");
    toast("Barcode matched!", "success");
  };

  return (
    <div className="space-y-5">
      <Card className="overflow-hidden">
        {/* Viewfinder */}
        <div className="relative aspect-[4/3] bg-gradient-to-br from-slate-900 to-slate-800">
          {/* Simulated camera grid */}
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />

          {/* Scan frame */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative h-48 w-72 rounded-2xl border-2 border-white/30">
              {/* Corner brackets */}
              <span className="absolute -left-0.5 -top-0.5 h-8 w-8 rounded-tl-2xl border-l-4 border-t-4 border-emerald-400" />
              <span className="absolute -right-0.5 -top-0.5 h-8 w-8 rounded-tr-2xl border-r-4 border-t-4 border-emerald-400" />
              <span className="absolute -bottom-0.5 -left-0.5 h-8 w-8 rounded-bl-2xl border-b-4 border-l-4 border-emerald-400" />
              <span className="absolute -bottom-0.5 -right-0.5 h-8 w-8 rounded-br-2xl border-b-4 border-r-4 border-emerald-400" />

              {/* Scan line */}
              {scanning && (
                <div className="absolute inset-x-2 top-0 h-1 rounded-full bg-emerald-400 shadow-lg shadow-emerald-400/50 animate-[scanline_1.5s_ease-in-out_infinite]" />
              )}

              {/* Center icon */}
              <div className="absolute inset-0 flex items-center justify-center">
                {scanning ? (
                  <div className="text-center">
                    <ScanLine className="mx-auto h-10 w-10 animate-pulse text-emerald-400" />
                    <p className="mt-2 text-xs font-medium text-white/70">Scanning...</p>
                  </div>
                ) : found ? (
                  <div className="text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500">
                      <Check className="h-6 w-6 text-white" />
                    </div>
                    <p className="mt-2 text-xs font-medium text-white/70">Match found!</p>
                  </div>
                ) : (
                  <div className="text-center">
                    <Camera className="mx-auto h-10 w-10 text-white/40" />
                    <p className="mt-2 text-xs font-medium text-white/50">Point camera at barcode</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Progress bar */}
          {scanning && (
            <div className="absolute bottom-4 left-1/2 w-64 -translate-x-1/2">
              <div className="h-1.5 overflow-hidden rounded-full bg-white/20">
                <div className="h-full rounded-full bg-emerald-400 transition-all duration-75" style={{ width: `${progress}%` }} />
              </div>
            </div>
          )}

          {/* Found overlay */}
          {found && (
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-4">
              <div className="flex items-center gap-3 rounded-xl bg-white/95 p-3 backdrop-blur">
                <span className="text-3xl">{found.emoji}</span>
                <div className="flex-1">
                  <p className="text-sm font-bold text-slate-900">{found.name}</p>
                  <p className="text-xs text-slate-500">{found.brand} · {found.servingUnit}</p>
                </div>
                <Badge color="emerald">{found.calories} kcal</Badge>
              </div>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="p-4">
          {!found ? (
            <div className="flex gap-2">
              <Button className="flex-1" onClick={startScan} disabled={scanning}>
                <ScanLine className="h-4 w-4" /> {scanning ? "Scanning..." : "Start Scanning"}
              </Button>
              <Button variant="outline" onClick={() => setManualOpen(true)}>
                Enter code
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="grid grid-cols-4 gap-2 text-center">
                <div className="rounded-lg bg-emerald-50 p-2">
                  <p className="text-sm font-bold text-emerald-700">{found.calories}</p>
                  <p className="text-[10px] text-slate-500">kcal</p>
                </div>
                <div className="rounded-lg bg-sky-50 p-2">
                  <p className="text-sm font-bold text-sky-700">{found.protein}g</p>
                  <p className="text-[10px] text-slate-500">protein</p>
                </div>
                <div className="rounded-lg bg-amber-50 p-2">
                  <p className="text-sm font-bold text-amber-700">{found.carbs}g</p>
                  <p className="text-[10px] text-slate-500">carbs</p>
                </div>
                <div className="rounded-lg bg-rose-50 p-2">
                  <p className="text-sm font-bold text-rose-700">{found.fat}g</p>
                  <p className="text-[10px] text-slate-500">fat</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Meal</Label>
                  <Select value={meal} onChange={(e) => setMeal(e.target.value as MealType)}>
                    {(Object.keys(MEAL_LABELS) as MealType[]).map((m) => <option key={m} value={m}>{MEAL_LABELS[m]}</option>)}
                  </Select>
                </div>
                <div>
                  <Label>Servings</Label>
                  <Input type="number" min={0.1} step={0.1} value={qty} onChange={(e) => setQty(Number(e.target.value))} />
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => { setFound(null); setProgress(0); }}>
                  <X className="h-4 w-4" /> Scan again
                </Button>
                <Button className="flex-1" onClick={confirmAdd}>
                  <Plus className="h-4 w-4" /> Add to diary
                </Button>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Tips */}
      <Card className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-50">
            <Search className="h-4 w-4 text-emerald-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-700">How it works</p>
            <p className="mt-0.5 text-xs text-slate-500">
              Point your camera at any food barcode. The scanner will instantly look up the product and its nutrition facts. You can also manually enter a barcode number.
            </p>
          </div>
        </div>
      </Card>

      {/* Manual entry modal */}
      <Modal open={manualOpen} onClose={() => setManualOpen(false)} title="Enter Barcode" size="sm">
        <div className="space-y-4">
          <div>
            <Label>Barcode number</Label>
            <Input value={manualCode} onChange={(e) => setManualCode(e.target.value)} placeholder="e.g. 0123456789012" inputMode="numeric" autoFocus />
          </div>
          <p className="text-xs text-slate-400">Enter the numeric code found below or above the barcode on most packaged foods.</p>
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => setManualOpen(false)}>Cancel</Button>
            <Button className="flex-1" onClick={manualLookup} disabled={!manualCode.trim()}>
              <Search className="h-4 w-4" /> Look up
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
