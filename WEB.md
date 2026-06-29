# Kàá — Web

Next.js 14 (App Router) + TypeScript + Tailwind. Lives at the repo root so Vercel auto-detects it as a Next.js project with zero configuration.

## Local development

```bash
npm install
npm run dev        # http://localhost:3000
npm test           # runs the Yoruba number engine test suite
npm run build      # production build
```

## Deployment to Vercel

### Option A — Vercel CLI

```bash
npm i -g vercel
vercel              # follow prompts, link to a new project
vercel --prod       # promote to production
```

Vercel auto-detects Next.js — no special config needed.

### Option B — Git integration (recommended)

1. Push this repo to GitHub.
2. From the Vercel dashboard, **Add New Project → Import** the GitHub repo.
3. Leave **Root Directory** as `.` (the default) — the Next.js app is at the repo root.
4. Framework Preset: **Next.js** (auto-detected).
5. Build command: `npm run build` (default).
6. Output directory: `.next` (default).
7. Install command: `npm install` (default).
8. **Deploy**.

### Why the iOS folder doesn't break the deploy

`ios/` contains only Swift sources. Vercel ignores non-Next.js files. This repository includes a small `.vercelignore` so Vercel skips native sources and project docs:

```
ios/
*.md
!README.md
```

### Environment variables

None required for the current web app.

## Project structure

```
/                              ← Vercel project root
├─ src/
│  ├─ app/
│  │  ├─ layout.tsx            # html shell, metadata, PWA setup
│  │  ├─ page.tsx              # landing page
│  │  ├─ onka/page.tsx         # mounts the Kàá calculator app
│  │  ├─ about/page.tsx        # project background
│  │  └─ globals.css           # design tokens, layout, adire pattern
│  ├─ components/
│  │  ├─ kaa/                  # calculator, converter, history, settings
│  │  ├─ learn/                # learning exercises and sessions
│  │  └─ PwaSetup.tsx          # service-worker registration
│  └─ lib/
│     ├─ yorubaNumbers.ts      # the number engine
│     ├─ yorubaNumbers.test.ts # engine regression tests
│     ├─ calculator.ts         # expression evaluator
│     ├─ learn.ts              # learning-mode content helpers
│     └─ speech.ts             # audio/speech integration points
├─ shared/                     # language pack shared by web and iOS
├─ ios/                        # SwiftUI sources (ignored by Vercel)
├─ public/                     # PWA manifest, icons, service worker
├─ tailwind.config.ts
└─ package.json
```
