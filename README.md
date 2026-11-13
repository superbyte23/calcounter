# CalCounter — Calorie Counter & Nutrition Tracker

A modern, responsive nutrition tracking web app built with **React 19 + TypeScript + Vite + Tailwind CSS 4**. Log meals, track macros, monitor weight and water intake, and follow a diet plan — all running entirely in the browser with no backend required.

> The app is branded **CalCounter** in the UI, though the project folder is named `NutriSnap`.

---

## Features

| Feature | Description |
| --- | --- |
| 📊 **Dashboard** | Daily calorie/macro rings, remaining calories, meal breakdown, water tracker, and quick stats for the selected day. |
| 📖 **Food Diary** | Browse any day's entries grouped by meal (breakfast, lunch, dinner, snacks), edit quantities, and delete entries. |
| 🔍 **Food Search** | Search a curated food database by name or brand, filter by category, and add items to a meal with a chosen serving quantity. Custom foods can be created, edited, and deleted. |
| 📷 **Barcode Scan** | Simulated barcode scanning flow with a manual code lookup — picks a matching product and lets you log it. |
| 🍽️ **Meal Scan** | Simulated photo scan that animates through capture → detection → portion estimation, then proposes a meal you can adjust and log in one tap. |
| 🎯 **Diet Plans** | Create macro targets (calories, protein, carbs, fat), activate a plan, and have those targets drive the dashboard. Falls back to auto-calculated targets when no plan is active. |
| 📈 **Reports** | Charts for calorie intake and macro trends over time, plus adherence stats. |
| ⚖️ **Weight** | Log weight entries (one per day), view trend charts, and track progress toward your target weight. |
| 💧 **Water** | Add and remove water intake (250 ml glasses) per day. |
| ⚙️ **Settings** | Update profile details (name, email, age, gender, height, weight, activity level, goal, target weight) and sign out. |

### Smart targets

If no diet plan is active, calorie and macro targets are calculated from the profile using the **Mifflin-St Jeor** BMR equation, an activity multiplier (1.2–1.9), and the selected goal:

- **Lose weight:** TDEE − 500 kcal
- **Maintain:** TDEE
- **Gain weight:** TDEE + 400 kcal

Protein is set to `1.8 g/kg` (or `2 g/kg` when gaining), fat to 25% of calories, and carbs fill the remainder.

---

## Demo account

The app seeds a demo user, ~50 foods, 10 days of entries, weight history, water logs, and two diet plans on first launch.

```
Email:    demo@calcounter.app
Password: demo1234
```

You can also create a new account from the sign-up page.

---

## Getting started

### Prerequisites

- **Node.js 18+** (Node 20+ recommended)
- npm

### Install & run

```bash
npm install
npm run dev
```

Vite prints a local URL (typically <http://localhost:5173>). Open it in a browser.

### Build

```bash
npm run build
```

Thanks to `vite-plugin-singlefile`, the production build inlines all JS and CSS into a **single self-contained `dist/index.html`** — handy for demos or static hosting with no asset server.

```bash
npm run preview   # serve the production build locally
```

### Available scripts

| Script | Purpose |
| --- | --- |
| `npm run dev` | Start the Vite dev server with HMR |
| `npm run build` | Vite production build to `dist/` |
| `npm run preview` | Preview the built app |

---

## Tech stack

- **React 19** — UI library
- **TypeScript 5.9** — static typing
- **Vite 7** — dev server and bundler
- **Tailwind CSS 4** (`@tailwindcss/vite`) — styling
- **React Router 7** (`HashRouter`) — client-side routing, so the single-file build works from any static path
- **lucide-react** — icons
- **clsx** + **tailwind-merge** — conditional class names (`cn` helper in `src/utils/cn.ts`)
- **vite-plugin-singlefile** — inlines everything into one HTML file

No charting library is used; charts are custom SVG/HTML components in `src/components/charts.tsx`.

---

## Project structure

```
NutriSnap/
├── index.html                  # App entry (title, root div)
├── package.json
├── tsconfig.json
├── vite.config.ts              # React + Tailwind + single-file plugins, "@" alias
└── src/
    ├── main.tsx                # React root
    ├── index.css               # Tailwind import, base styles, keyframes
    ├── App.tsx                 # Router, providers, protected routes
    ├── components/
    │   ├── layout.tsx          # Responsive sidebar + topbar shell
    │   ├── ui.tsx              # Button, Card, Input, Select, Modal, Badge, Spinner…
    │   └── charts.tsx          # Calorie/macro/weight chart components
    ├── context/
    │   ├── AuthContext.tsx     # Login, signup, logout, profile updates
    │   ├── DataContext.tsx     # Entries, foods, plans, weight, water, recipes
    │   └── ToastContext.tsx    # Toast notifications
    ├── lib/
    │   ├── types.ts            # Domain types (User, FoodItem, FoodEntry, …)
    │   ├── storage.ts          # localStorage persistence layer
    │   ├── utils.ts            # Dates, BMR/TDEE, macros, formatting, labels
    │   ├── seed.ts             # Demo foods, entries, weights, water, plans
    │   └── seedData.ts         # First-run seeding orchestration
    ├── pages/
    │   ├── Login.tsx           # Login page
    │   ├── Signup.tsx          # Multi-step-style signup form
    │   ├── Dashboard.tsx
    │   ├── Diary.tsx
    │   ├── FoodSearch.tsx
    │   ├── BarcodeScanner.tsx
    │   ├── MealScan.tsx
    │   ├── DietPlans.tsx
    │   ├── Reports.tsx
    │   ├── Weight.tsx
    │   └── Settings.tsx
    └── utils/
        └── cn.ts               # clsx + tailwind-merge helper
```

---

## Routes

| Path | Page |
| --- | --- |
| `/login` | Sign in |
| `/signup` | Create account |
| `/app` | Dashboard (protected) |
| `/app/diary` | Food diary |
| `/app/foods` | Food search & custom foods |
| `/app/scan` | Barcode scanner |
| `/app/meal-scan` | Meal photo scanner |
| `/app/plans` | Diet plans |
| `/app/reports` | Reports & charts |
| `/app/weight` | Weight tracking |
| `/app/settings` | Profile settings |

All `/app/*` routes are guarded and redirect to `/login` when no user is signed in.

---

## Data & persistence

All data lives in **`localStorage`** under keys prefixed with `calcounter:`:

| Key | Contents |
| --- | --- |
| `calcounter:users` | Registered accounts |
| `calcounter:currentUser` | ID of the signed-in user |
| `calcounter:foods` | Food database (seeded + custom) |
| `calcounter:entries` | Food diary entries |
| `calcounter:plans` | Diet plans |
| `calcounter:weights` | Weight log |
| `calcounter:water` | Water log |
| `calcounter:recipes` | Saved recipes (data layer ready) |
| `calcounter:seeded` | First-run seed flag |

Because everything is client-side, data is per-browser and per-device. Clearing site data or `localStorage` resets the app and re-triggers seeding on next load.

### Domain model

Defined in `src/lib/types.ts`:

- `User` — profile, body metrics, activity level, goal
- `FoodItem` — name, brand, barcode, serving size/unit, calories, protein, carbs, fat, fiber, sugar, sodium, category, emoji
- `FoodEntry` — a logged food for a meal on a date, with macros snapshot
- `DietPlan` — macro targets and active flag
- `WeightEntry`, `WaterEntry` — date-stamped logs
- `Recipe`, `DailyTotals`, `MacroTarget` — supporting types

---

## Notes & limitations

- **No backend or authentication service.** Accounts are stored in `localStorage`, and passwords are stored in plain text — this is a demo/prototype, not production-ready auth.
- **Barcode and meal scanning are simulated.** They animate a realistic flow and select from the built-in food database rather than using a camera, barcode API, or computer-vision model.
- **The food database is curated and small (~50 items)** with approximately accurate nutrition values per serving.
- **Recipes** exist in the data layer and types but have no dedicated UI yet.
- Dates are handled as local `YYYY-MM-DD` strings; nutrition targets are computed client-side.

---

## Possible next steps

- Backend + real auth (e.g. Node/Express or Supabase) with hashed passwords
- Real barcode lookup (Open Food Facts) and camera-based meal recognition
- Recipe builder UI and "log recipe" support
- PWA support (offline install, camera access)
- Expanded food database and nutrient detail (fiber, sodium, sugar already modeled)
- Data export/import (JSON or CSV)
