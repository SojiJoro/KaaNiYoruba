# Káà — Web

Next.js 14 (App Router) + TypeScript + Tailwind. Deploys to Vercel.

## Local development

```bash
cd web
npm install
npm run dev        # http://localhost:3000
npm test           # runs the Yoruba number engine test suite
npm run build      # production build
```

## Deployment to Vercel

### Option A — Vercel CLI

```bash
npm i -g vercel
cd web
vercel              # follow prompts, link to a new project
vercel --prod       # promote to production
```

Vercel auto-detects Next.js — no special config needed.

### Option B — Git integration

1. Push this repo to GitHub.
2. From the Vercel dashboard, **Add New Project → Import** the GitHub repo.
3. Set the **Root Directory** to `web/`.
4. Framework Preset: **Next.js** (auto-detected).
5. Build command: `npm run build` (default).
6. Output directory: `.next` (default).
7. **Deploy**.

### Environment variables

None required for the MVP. When recorded audio clips are wired up, add:

| Key | Purpose |
|---|---|
| `NEXT_PUBLIC_AUDIO_CDN` | Base URL of recorded Yoruba pronunciations |

## Project structure

```
web/
├─ src/
│  ├─ app/
│  │  ├─ layout.tsx         # html shell, font loading
│  │  ├─ page.tsx           # mounts <Calculator/>
│  │  └─ globals.css        # tokens + adire pattern
│  ├─ components/
│  │  ├─ Calculator.tsx     # top-level state + tabs
│  │  ├─ Display.tsx        # expression + headline result
│  │  ├─ Keypad.tsx         # digit/operator buttons w/ Yoruba labels
│  │  ├─ ModeToggle.tsx     # traditional ↔ modern
│  │  ├─ History.tsx
│  │  ├─ ConverterPanel.tsx
│  │  └─ LearningMode.tsx
│  └─ lib/
│     ├─ yorubaNumbers.ts   # the number engine
│     ├─ yorubaNumbers.test.ts
│     └─ calculator.ts      # expression evaluator
├─ tailwind.config.ts
└─ package.json
```
