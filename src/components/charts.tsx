import { useId } from "react";
import { cn } from "../utils/cn";

/* ---------------- Line Chart ---------------- */
export interface LinePoint { label: string; value: number; }

export function LineChart({ data, color = "#10b981", height = 180, formatValue }: { data: LinePoint[]; color?: string; height?: number; formatValue?: (n: number) => string }) {
  const id = useId();
  const width = 600;
  const padX = 36;
  const padY = 24;
  const innerW = width - padX * 2;
  const innerH = height - padY * 2;

  if (data.length === 0) return null;
  const values = data.map((d) => d.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const niceMin = min - range * 0.1;
  const niceMax = max + range * 0.1;
  const niceRange = niceMax - niceMin || 1;

  const points = data.map((d, i) => {
    const x = padX + (i / Math.max(data.length - 1, 1)) * innerW;
    const y = padY + innerH - ((d.value - niceMin) / niceRange) * innerH;
    return { x, y, ...d };
  });

  const path = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const area = `${path} L ${points[points.length - 1].x} ${padY + innerH} L ${points[0].x} ${padY + innerH} Z`;

  const gridLines = 4;
  const yTicks = Array.from({ length: gridLines + 1 }, (_, i) => niceMin + (niceRange * i) / gridLines);

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full" style={{ height }}>
      <defs>
        <linearGradient id={`grad-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {yTicks.map((t, i) => {
        const y = padY + innerH - (i / gridLines) * innerH;
        return (
          <g key={i}>
            <line x1={padX} y1={y} x2={width - padX} y2={y} stroke="#f1f5f9" strokeWidth="1" />
            <text x={padX - 6} y={y + 3} textAnchor="end" className="fill-slate-400 text-[9px]">
              {formatValue ? formatValue(t) : Math.round(t)}
            </text>
          </g>
        );
      })}
      <path d={area} fill={`url(#grad-${id})`} />
      <path d={path} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {points.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r="3.5" fill="white" stroke={color} strokeWidth="2" />
          {data.length <= 12 && (
            <text x={p.x} y={height - 6} textAnchor="middle" className="fill-slate-400 text-[9px]">
              {p.label}
            </text>
          )}
        </g>
      ))}
    </svg>
  );
}

/* ---------------- Bar Chart ---------------- */
export interface BarDatum { label: string; value: number; }

export function BarChart({ data, color = "#10b981", height = 180, formatValue }: { data: BarDatum[]; color?: string; height?: number; formatValue?: (n: number) => string }) {
  const width = 600;
  const padX = 36;
  const padY = 24;
  const innerW = width - padX * 2;
  const innerH = height - padY * 2;
  const max = Math.max(...data.map((d) => d.value), 1);
  const barW = (innerW / data.length) * 0.6;
  const gap = (innerW / data.length) * 0.4;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full" style={{ height }}>
      {[0, 0.25, 0.5, 0.75, 1].map((t, i) => {
        const y = padY + innerH - t * innerH;
        return (
          <g key={i}>
            <line x1={padX} y1={y} x2={width - padX} y2={y} stroke="#f1f5f9" strokeWidth="1" />
            <text x={padX - 6} y={y + 3} textAnchor="end" className="fill-slate-400 text-[9px]">
              {formatValue ? formatValue(max * t) : Math.round(max * t)}
            </text>
          </g>
        );
      })}
      {data.map((d, i) => {
        const x = padX + i * (barW + gap) + gap / 2;
        const h = (d.value / max) * innerH;
        const y = padY + innerH - h;
        return (
          <g key={i}>
            <rect x={x} y={y} width={barW} height={h} rx="4" fill={color} className="transition-all duration-500" />
            <text x={x + barW / 2} y={height - 6} textAnchor="middle" className="fill-slate-400 text-[9px]">
              {d.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

/* ---------------- Macro Donut ---------------- */
export function MacroDonut({ protein, carbs, fat, size = 140 }: { protein: number; carbs: number; fat: number; size?: number }) {
  const total = protein + carbs + fat;
  const radius = (size - 24) / 2;
  const circumference = 2 * Math.PI * radius;
  const stroke = 16;

  if (total <= 0) {
    return (
      <div className="flex items-center justify-center" style={{ width: size, height: size }}>
        <div className="rounded-full border-[16px] border-slate-100" style={{ width: size - 24, height: size - 24 }} />
      </div>
    );
  }

  const segments = [
    { label: "Protein", value: protein, color: "#0ea5e9" },
    { label: "Carbs", value: carbs, color: "#f59e0b" },
    { label: "Fat", value: fat, color: "#f43f5e" },
  ];

  let offset = 0;
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#f1f5f9" strokeWidth={stroke} />
        {segments.map((s, i) => {
          const len = (s.value / total) * circumference;
          const el = (
            <circle
              key={i}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={s.color}
              strokeWidth={stroke}
              strokeLinecap="round"
              strokeDasharray={`${len} ${circumference - len}`}
              strokeDashoffset={-offset}
              className="transition-all duration-700"
            />
          );
          offset += len;
          return el;
        })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xl font-bold text-slate-900">{Math.round(total)}g</span>
        <span className="text-[10px] font-medium text-slate-400">total macros</span>
      </div>
    </div>
  );
}

/* ---------------- Stat Tile ---------------- */
export function StatTile({ label, value, unit, icon, color, progress, target }: { label: string; value: number; unit?: string; icon: React.ReactNode; color: string; progress?: number; target?: number }) {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</span>
        <span className={cn("flex h-8 w-8 items-center justify-center rounded-lg", color)}>{icon}</span>
      </div>
      <div className="mt-2 flex items-baseline gap-1">
        <span className="text-2xl font-bold text-slate-900">{Math.round(value)}</span>
        {unit && <span className="text-sm font-medium text-slate-400">{unit}</span>}
      </div>
      {target !== undefined && (
        <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
          <span>{Math.round(value)} / {Math.round(target)} {unit}</span>
          {progress !== undefined && <span className="font-semibold text-slate-500">{Math.round(progress)}%</span>}
        </div>
      )}
    </div>
  );
}
