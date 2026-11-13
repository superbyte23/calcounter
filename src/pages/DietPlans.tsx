import { useState } from "react";
import { Plus, Pencil, Trash2, Check, Target, Flame, Beef, Wheat, Droplet, Sparkles } from "lucide-react";
import { useData } from "../context/DataContext";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { Card, Button, Input, Label, Modal, EmptyState, Badge } from "../components/ui";
import { suggestedMacros, tdee, bmr, GOAL_LABELS, ACTIVITY_LABELS } from "../lib/utils";
import type { DietPlan } from "../lib/types";

export default function DietPlans() {
  const { plans, activePlan, addPlan, updatePlan, deletePlan, setActivePlan } = useData();
  const { user } = useAuth();
  const { toast } = useToast();
  const [editing, setEditing] = useState<DietPlan | null>(null);
  const [creating, setCreating] = useState(false);

  const handleSave = (data: Omit<DietPlan, "id" | "userId" | "createdAt">) => {
    if (editing) {
      updatePlan(editing.id, data);
      toast("Plan updated", "success");
    } else {
      addPlan(data);
      toast("Plan created & activated", "success");
    }
    setEditing(null);
    setCreating(false);
  };

  const handleDelete = (plan: DietPlan) => {
    deletePlan(plan.id);
    toast(`Deleted "${plan.name}"`, "info");
  };

  const handleActivate = (plan: DietPlan) => {
    setActivePlan(plan.id);
    toast(`"${plan.name}" is now active`, "success");
  };

  const suggested = user ? suggestedMacros(user) : null;

  return (
    <div className="space-y-6">
      {/* Active plan banner */}
      {activePlan && (
        <Card className="overflow-hidden">
          <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-5 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                <span className="text-sm font-semibold uppercase tracking-wide opacity-90">Active Plan</span>
              </div>
              <Badge color="emerald" className="bg-white/20 text-white">{activePlan.name}</Badge>
            </div>
            <h2 className="mt-2 text-2xl font-bold">{activePlan.name}</h2>
            {activePlan.description && <p className="mt-1 text-sm text-emerald-50">{activePlan.description}</p>}
            <div className="mt-4 grid grid-cols-4 gap-3">
              <div>
                <p className="text-2xl font-bold">{activePlan.calories}</p>
                <p className="text-xs opacity-80">Calories</p>
              </div>
              <div>
                <p className="text-2xl font-bold">{activePlan.protein}g</p>
                <p className="text-xs opacity-80">Protein</p>
              </div>
              <div>
                <p className="text-2xl font-bold">{activePlan.carbs}g</p>
                <p className="text-xs opacity-80">Carbs</p>
              </div>
              <div>
                <p className="text-2xl font-bold">{activePlan.fat}g</p>
                <p className="text-xs opacity-80">Fat</p>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Suggested targets */}
      {suggested && user && (
        <Card className="p-5">
          <div className="mb-3 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-900">Your Personalized Targets</h3>
          </div>
          <p className="mb-4 text-xs text-slate-500">
            Based on your profile — {user.gender === "male" ? "Male" : "Female"}, {user.age} yrs, {user.weight}kg, {user.height}cm, {ACTIVITY_LABELS[user.activityLevel].split(" ")[0].toLowerCase()} activity, goal: {GOAL_LABELS[user.goal].toLowerCase()}.
          </p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <TargetTile icon={<Flame className="h-4 w-4 text-emerald-600" />} label="Calories" value={suggested.calories} unit="kcal" color="bg-emerald-50" />
            <TargetTile icon={<Beef className="h-4 w-4 text-sky-600" />} label="Protein" value={suggested.protein} unit="g" color="bg-sky-50" />
            <TargetTile icon={<Wheat className="h-4 w-4 text-amber-600" />} label="Carbs" value={suggested.carbs} unit="g" color="bg-amber-50" />
            <TargetTile icon={<Droplet className="h-4 w-4 text-rose-600" />} label="Fat" value={suggested.fat} unit="g" color="bg-rose-50" />
          </div>
          <div className="mt-3 grid grid-cols-2 gap-3 text-xs text-slate-500">
            <div className="rounded-lg bg-slate-50 px-3 py-2">
              <span className="font-semibold text-slate-700">BMR:</span> {Math.round(bmr(user))} kcal (resting)
            </div>
            <div className="rounded-lg bg-slate-50 px-3 py-2">
              <span className="font-semibold text-slate-700">TDEE:</span> {Math.round(tdee(user))} kcal (maintenance)
            </div>
          </div>
        </Card>
      )}

      {/* Plans list */}
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold text-slate-900">Your Plans</h3>
        <Button size="sm" onClick={() => setCreating(true)}>
          <Plus className="h-4 w-4" /> New Plan
        </Button>
      </div>

      {plans.length === 0 ? (
        <EmptyState
          icon={<Target className="h-6 w-6" />}
          title="No diet plans yet"
          description="Create a plan with your daily calorie and macro targets."
          action={<Button size="sm" onClick={() => setCreating(true)}><Plus className="h-4 w-4" /> Create plan</Button>}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {plans.map((plan) => (
            <Card key={plan.id} className={`p-5 ${plan.isActive ? "ring-2 ring-emerald-500" : ""}`}>
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-base font-bold text-slate-900">{plan.name}</h4>
                    {plan.isActive && <Badge color="emerald"><Check className="h-3 w-3" /> Active</Badge>}
                  </div>
                  {plan.description && <p className="mt-1 text-xs text-slate-500">{plan.description}</p>}
                </div>
              </div>
              <div className="mt-4 grid grid-cols-4 gap-2 text-center">
                <div className="rounded-lg bg-emerald-50 p-2">
                  <p className="text-sm font-bold text-emerald-700">{plan.calories}</p>
                  <p className="text-[10px] text-slate-500">kcal</p>
                </div>
                <div className="rounded-lg bg-sky-50 p-2">
                  <p className="text-sm font-bold text-sky-700">{plan.protein}g</p>
                  <p className="text-[10px] text-slate-500">protein</p>
                </div>
                <div className="rounded-lg bg-amber-50 p-2">
                  <p className="text-sm font-bold text-amber-700">{plan.carbs}g</p>
                  <p className="text-[10px] text-slate-500">carbs</p>
                </div>
                <div className="rounded-lg bg-rose-50 p-2">
                  <p className="text-sm font-bold text-rose-700">{plan.fat}g</p>
                  <p className="text-[10px] text-slate-500">fat</p>
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                {!plan.isActive && (
                  <Button size="sm" variant="outline" className="flex-1" onClick={() => handleActivate(plan)}>
                    <Check className="h-3.5 w-3.5" /> Activate
                  </Button>
                )}
                <Button size="sm" variant="ghost" onClick={() => setEditing(plan)}>
                  <Pencil className="h-3.5 w-3.5" /> Edit
                </Button>
                <Button size="sm" variant="ghost" onClick={() => handleDelete(plan)}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit modal */}
      <PlanModal
        open={creating || !!editing}
        onClose={() => { setCreating(false); setEditing(null); }}
        plan={editing}
        suggested={suggested}
        onSave={handleSave}
      />
    </div>
  );
}

function TargetTile({ icon, label, value, unit, color }: { icon: React.ReactNode; label: string; value: number; unit: string; color: string }) {
  return (
    <div className={`rounded-xl p-3 ${color}`}>
      <div className="flex items-center gap-1.5">
        {icon}
        <span className="text-xs font-semibold text-slate-600">{label}</span>
      </div>
      <p className="mt-1 text-xl font-bold text-slate-900">{value}<span className="text-xs font-medium text-slate-400"> {unit}</span></p>
    </div>
  );
}

function PlanModal({ open, onClose, plan, suggested, onSave }: { open: boolean; onClose: () => void; plan: DietPlan | null; suggested: { calories: number; protein: number; carbs: number; fat: number } | null; onSave: (data: Omit<DietPlan, "id" | "userId" | "createdAt">) => void }) {
  const [form, setForm] = useState({
    name: "",
    description: "",
    calories: 2000,
    protein: 120,
    carbs: 220,
    fat: 65,
    isActive: true,
  });

  // Sync when opening
  const [lastOpen, setLastOpen] = useState(false);
  if (open !== lastOpen) {
    setLastOpen(open);
    if (open) {
      if (plan) {
        setForm({ name: plan.name, description: plan.description ?? "", calories: plan.calories, protein: plan.protein, carbs: plan.carbs, fat: plan.fat, isActive: plan.isActive });
      } else {
        setForm({ name: "", description: "", calories: suggested?.calories ?? 2000, protein: suggested?.protein ?? 120, carbs: suggested?.carbs ?? 220, fat: suggested?.fat ?? 65, isActive: true });
      }
    }
  }

  const set = (k: string, v: string | number | boolean) => setForm((p) => ({ ...p, [k]: v }));

  const applySuggested = () => {
    if (!suggested) return;
    setForm((p) => ({ ...p, calories: suggested.calories, protein: suggested.protein, carbs: suggested.carbs, fat: suggested.fat }));
  };

  const totalMacroCal = form.protein * 4 + form.carbs * 4 + form.fat * 9;
  const diff = form.calories - totalMacroCal;

  return (
    <Modal open={open} onClose={onClose} title={plan ? "Edit Plan" : "Create Diet Plan"} size="md">
      <div className="space-y-4">
        <div>
          <Label>Plan name</Label>
          <Input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. Cutting Plan, Bulk Cycle..." />
        </div>
        <div>
          <Label>Description (optional)</Label>
          <Input value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="Short description..." />
        </div>

        {suggested && (
          <button onClick={applySuggested} className="flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-semibold text-emerald-700 hover:bg-emerald-100">
            <Sparkles className="h-4 w-4" /> Use my suggested targets
          </button>
        )}

        <div>
          <Label>Daily calories</Label>
          <Input type="number" value={form.calories} onChange={(e) => set("calories", Number(e.target.value))} />
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

        {/* Macro distribution bar */}
        <div>
          <div className="mb-1 flex items-center justify-between text-xs">
            <span className="font-medium text-slate-500">Macro calorie distribution</span>
            <span className={Math.abs(diff) < 50 ? "text-emerald-600" : "text-amber-600"}>
              {Math.abs(diff) < 50 ? "✓ Balanced" : `${diff > 0 ? "+" : ""}${diff} kcal ${diff > 0 ? "under" : "over"}`}
            </span>
          </div>
          <div className="flex h-3 overflow-hidden rounded-full">
            <div className="bg-sky-400" style={{ width: `${(form.protein * 4 / Math.max(totalMacroCal, 1)) * 100}%` }} />
            <div className="bg-amber-400" style={{ width: `${(form.carbs * 4 / Math.max(totalMacroCal, 1)) * 100}%` }} />
            <div className="bg-rose-400" style={{ width: `${(form.fat * 9 / Math.max(totalMacroCal, 1)) * 100}%` }} />
          </div>
          <div className="mt-1.5 flex justify-between text-[10px] text-slate-400">
            <span>Protein {Math.round((form.protein * 4 / Math.max(totalMacroCal, 1)) * 100)}%</span>
            <span>Carbs {Math.round((form.carbs * 4 / Math.max(totalMacroCal, 1)) * 100)}%</span>
            <span>Fat {Math.round((form.fat * 9 / Math.max(totalMacroCal, 1)) * 100)}%</span>
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <Button variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
          <Button className="flex-1" onClick={() => onSave(form)} disabled={!form.name}>
            {plan ? "Save changes" : "Create plan"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
