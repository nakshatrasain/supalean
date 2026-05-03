# 🥦 Supa Lean

**Psychology-first fitness tracking. Built on Kahneman's System 1/2 model and cortisol science.**

Free. Open source. Built with Supabase + OpenAI.

---

## What is Supa Lean?

Most fitness apps track calories. Supa Lean tracks the **psychology behind why you eat them**.

Built on:
- **Kahneman's System 1/2 model** — understanding why willpower fails under stress
- **Cortisol science** — the stress-visceral fat loop that no other app addresses
- **OpenAI Vision** — AI that reads your InBody scan and analyzes your meals from photos
- **WHOOP Recovery Framework** — workout decisions based on actual body readiness

---

## Features

- 📸 **AI Meal Analysis** — Upload photo → instant calories, protein, carbs, fat
- 🫁 **InBody Scan Reader** — AI reads all metrics from photo automatically
- 🤖 **AI Coach Chatbot** — Context-aware coach knows your profile and today's data
- 💚 **WHOOP Recovery Tracker** — Green/Yellow/Red daily gym decisions
- 🏋️ **PPL Workout Logger** — Push/Pull/Legs with progressive overload tracking
- 🏃 **Cardio Logger** — All types ranked for your goals
- 📈 **Progress Tracker** — Weight log, InBody comparison, target timeline
- 🔐 **Supabase Auth** — Secure per-user database

---

## Quick Deploy (5 minutes)

### 1. Clone the repo
```bash
git clone https://github.com/yourusername/supa-lean
cd supa-lean
```

### 2. Set up Supabase
1. Go to [supabase.com](https://supabase.com) → New Project
2. Go to SQL Editor → paste entire contents of `schema.sql` → Run
3. Go to Settings → API → copy **Project URL** and **anon/public key**

### 3. Deploy to Vercel
```bash
npx vercel
```
Or push to GitHub and connect to [vercel.com](https://vercel.com) for auto-deploy.

### 4. Configure in the app
After signing up, go to **Settings** in the app and add:
- Your Supabase URL + anon key
- Your OpenAI API key (from [platform.openai.com](https://platform.openai.com))

> **No environment variables needed** — all config is entered in the Settings page and stored in localStorage.

---

## File Structure

```
supa-lean/
├── index.html      # Landing page
├── app.html        # Main application
├── schema.sql      # Supabase database schema
├── vercel.json     # Vercel routing config
└── README.md       # This file
```

---

## Using Without Supabase (Demo Mode)

The app works fully in **demo mode** without Supabase:
- Data stored in localStorage (browser only)
- Auth is simulated
- All features work except cross-device sync

Just open `app.html` directly in your browser. Add your OpenAI key in Settings for AI features.

---

## The Science Behind It

### Why most fitness apps fail

They're designed for **System 2** (rational, deliberate brain) but food decisions happen in **System 1** (fast, automatic, emotional). Under stress, System 2 goes offline. Cortisol suppresses the prefrontal cortex. You stop calculating. You start craving.

### The cortisol-visceral fat loop

1. Chronic stress → cortisol spike
2. Cortisol → activates lipoprotein lipase → deposits fat around organs
3. Visceral fat cells have 4x more cortisol receptors → amplify cortisol further
4. More cortisol → more visceral fat → repeat

Supa Lean tracks recovery scores, stress patterns, and environmental context — not just calories — to interrupt this loop.

### Why protein > calories

- Protein has 25-30% Thermic Effect of Food vs 5-8% for carbs/fat
- Protects muscle mass during calorie deficit
- Reduces evening cravings that cause most diet failures
- Combined with strength training, directly targets visceral fat

---

## Recommended Stack

- **Database**: Supabase (PostgreSQL + Auth + RLS)
- **AI**: OpenAI GPT-4o (meal analysis + coaching + InBody reading)
- **Deploy**: Vercel
- **No build step required** — pure HTML/CSS/JS

---

## Contributing

Open source under MIT license. PRs welcome.

Built for people who understand that weight loss is a psychology problem first.

---

*Built with ❤️ and cortisol science.*
