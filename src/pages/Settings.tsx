import { useState } from "react";
import { User as UserIcon, Target, Activity, Save, Shield, LogOut, Trash2, Check } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { Card, Button, Input, Label, Select, Badge } from "../components/ui";
import { GOAL_LABELS, ACTIVITY_LABELS, initials } from "../lib/utils";
import type { Goal, ActivityLevel } from "../lib/types";

export default function Settings() {
  const { user, updateUser, logout } = useAuth();
  const { toast } = useToast();
  const [form, setForm] = useState({
    name: user?.name ?? "",
    email: user?.email ?? "",
    age: user?.age ?? 25,
    gender: user?.gender ?? "female",
    weight: user?.weight ?? 70,
    height: user?.height ?? 170,
    activityLevel: user?.activityLevel ?? "light",
    goal: user?.goal ?? "maintain",
    targetWeight: user?.targetWeight ?? 60,
  });
  const [saved, setSaved] = useState(false);

  const set = (k: string, v: string | number) => setForm((p) => ({ ...p, [k]: v }));

  const handleSave = () => {
    updateUser(form);
    setSaved(true);
    toast("Profile updated", "success");
    setTimeout(() => setSaved(false), 2000);
  };

  if (!user) return null;

  return (
    <div className="space-y-6">
      {/* Profile header */}
      <Card className="flex flex-col items-center gap-4 p-6 sm:flex-row">
        <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-2xl font-bold text-white shadow-lg shadow-emerald-500/30">
          {initials(user.name)}
        </div>
        <div className="flex-1 text-center sm:text-left">
          <h2 className="text-xl font-bold text-slate-900">{user.name}</h2>
          <p className="text-sm text-slate-500">{user.email}</p>
          <div className="mt-2 flex flex-wrap justify-center gap-2 sm:justify-start">
            <Badge color="emerald">{GOAL_LABELS[user.goal]}</Badge>
            <Badge color="sky">{ACTIVITY_LABELS[user.activityLevel].split(" ")[0]}</Badge>
            <Badge color="violet">Member since {new Date(user.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })}</Badge>
          </div>
        </div>
      </Card>

      {/* Personal info */}
      <Card className="p-6">
        <div className="mb-4 flex items-center gap-2">
          <UserIcon className="h-5 w-5 text-emerald-600" />
          <h3 className="text-base font-bold text-slate-900">Personal Information</h3>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label>Name</Label>
            <Input value={form.name} onChange={(e) => set("name", e.target.value)} />
          </div>
          <div>
            <Label>Email</Label>
            <Input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} />
          </div>
          <div>
            <Label>Age</Label>
            <Input type="number" min={14} max={100} value={form.age} onChange={(e) => set("age", Number(e.target.value))} />
          </div>
          <div>
            <Label>Gender</Label>
            <Select value={form.gender} onChange={(e) => set("gender", e.target.value)}>
              <option value="female">Female</option>
              <option value="male">Male</option>
            </Select>
          </div>
        </div>
      </Card>

      {/* Body & goals */}
      <Card className="p-6">
        <div className="mb-4 flex items-center gap-2">
          <Target className="h-5 w-5 text-emerald-600" />
          <h3 className="text-base font-bold text-slate-900">Body & Goals</h3>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label>Current weight (kg)</Label>
            <Input type="number" min={30} max={300} value={form.weight} onChange={(e) => set("weight", Number(e.target.value))} />
          </div>
          <div>
            <Label>Target weight (kg)</Label>
            <Input type="number" min={30} max={300} value={form.targetWeight} onChange={(e) => set("targetWeight", Number(e.target.value))} />
          </div>
          <div>
            <Label>Height (cm)</Label>
            <Input type="number" min={100} max={250} value={form.height} onChange={(e) => set("height", Number(e.target.value))} />
          </div>
          <div>
            <Label>Goal</Label>
            <Select value={form.goal} onChange={(e) => set("goal", e.target.value)}>
              {(Object.keys(GOAL_LABELS) as Goal[]).map((g) => (
                <option key={g} value={g}>{GOAL_LABELS[g]}</option>
              ))}
            </Select>
          </div>
          <div className="sm:col-span-2">
            <Label>Activity level</Label>
            <Select value={form.activityLevel} onChange={(e) => set("activityLevel", e.target.value)}>
              {(Object.keys(ACTIVITY_LABELS) as ActivityLevel[]).map((a) => (
                <option key={a} value={a}>{ACTIVITY_LABELS[a]}</option>
              ))}
            </Select>
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <Button onClick={handleSave}>
            {saved ? <><Check className="h-4 w-4" /> Saved!</> : <><Save className="h-4 w-4" /> Save changes</>}
          </Button>
        </div>
      </Card>

      {/* Account */}
      <Card className="p-6">
        <div className="mb-4 flex items-center gap-2">
          <Shield className="h-5 w-5 text-emerald-600" />
          <h3 className="text-base font-bold text-slate-900">Account</h3>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between rounded-xl bg-slate-50 p-4">
            <div className="flex items-center gap-3">
              <Activity className="h-5 w-5 text-slate-400" />
              <div>
                <p className="text-sm font-semibold text-slate-700">Calorie targets</p>
                <p className="text-xs text-slate-500">Automatically calculated from your profile</p>
              </div>
            </div>
            <Badge color="emerald">Active</Badge>
          </div>
          <Button variant="outline" className="w-full" onClick={logout}>
            <LogOut className="h-4 w-4" /> Sign out
          </Button>
          <Button variant="ghost" className="w-full text-rose-600 hover:bg-rose-50 hover:text-rose-700" onClick={() => toast("Demo data is stored locally. Clear your browser data to reset.", "info")}>
            <Trash2 className="h-4 w-4" /> Reset all data
          </Button>
        </div>
      </Card>
    </div>
  );
}
