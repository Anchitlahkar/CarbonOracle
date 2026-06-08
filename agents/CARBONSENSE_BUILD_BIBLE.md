# 🌍 CARBONSENSE — COMPLETE BUILD BIBLE
### Prompt Wars 2026 · Carbon Footprint Awareness Platform · By Anchit
**Target: Top 10 finish | #82 → #1**

---

## 0. STRATEGIC INTELLIGENCE (READ FIRST)

### What judges are actually scoring (your submission criteria):
| Criterion | Weight | What actually wins |
|-----------|--------|-------------------|
| **Code Quality** | High | Clean architecture, readable code, proper separation of concerns |
| **Security** | High | Auth, input validation, no exposed keys, HTTPS, OWASP basics |
| **Efficiency** | High | Fast load times, lazy loading, API caching, no redundant calls |
| **Testing** | Medium | At least unit tests for core logic + one E2E smoke test |
| **Accessibility** | Medium | WCAG AA: aria labels, keyboard nav, color contrast ≥4.5:1 |

### What every other project does (DO NOT DO THESE):
- Basic calculator form with a pie chart
- Generic green color scheme with leaf icons
- "AI suggestions" that are just static text
- No 3D, no real-time data, no genuine interactivity
- Firebase + React template with zero original architecture

### What CarbonSense does differently:
- **Immersive 3D Earth** that visually degrades based on your real footprint score
- **AI conversation** (Gemini API) — not a chatbot, a *personal carbon coach*
- **Receipt/bill scanner** — photo → AI → instant carbon breakdown
- **Real-time community globe** — see collective impact across users as 3D heatmap
- **Carbon "debt clock"** that counts up in real time like a national debt counter
- **Streak + gamification** that actually matters to behavior change science

### Hosting (free, production-grade):
- **Frontend**: Vercel (free tier, instant deploy from GitHub, custom domain)
- **Backend**: Railway.app (free $5/month credit, Node.js/FastAPI, auto-deploy)
- **Database**: Supabase (free tier, PostgreSQL, real-time subscriptions built in)
- **Auth**: Supabase Auth (built in, email + Google OAuth)
- **AI**: Gemini API (free tier, 1M tokens/day)
- **File storage**: Supabase Storage (for receipt images)
- **Size limit**: Keep GitHub repo under 10MB — use `.gitignore` for node_modules, `.env`, build artifacts

---

## 1. TECH STACK DECISION

```
Frontend:  React 18 + Vite + TypeScript
3D:        Three.js (react-three-fiber + drei)
UI:        Tailwind CSS + shadcn/ui + React Bits (for animated components)
State:     Zustand
Charts:    Recharts
Animation: Framer Motion
Backend:   Node.js + Express (TypeScript)
DB:        Supabase (PostgreSQL + Realtime + Auth + Storage)
AI:        Google Gemini 1.5 Flash API
Testing:   Vitest (unit) + Playwright (E2E smoke test)
Deploy:    Vercel (FE) + Railway (BE)
```

**Why this stack wins on judging criteria:**
- TypeScript everywhere → Code Quality ✓
- Supabase RLS policies → Security ✓
- Vite + lazy routes → Efficiency ✓
- Vitest + Playwright → Testing ✓
- shadcn/ui + aria roles → Accessibility ✓

---

## 2. FOLDER STRUCTURE

```
carbonsense/
├── frontend/                    # Vite + React + TypeScript
│   ├── src/
│   │   ├── components/
│   │   │   ├── 3d/              # Three.js components
│   │   │   │   ├── EarthScene.tsx
│   │   │   │   ├── CarbonParticles.tsx
│   │   │   │   └── GlobeHeatmap.tsx
│   │   │   ├── dashboard/
│   │   │   │   ├── CarbonClock.tsx
│   │   │   │   ├── FootprintScore.tsx
│   │   │   │   ├── CategoryBreakdown.tsx
│   │   │   │   └── StreakTracker.tsx
│   │   │   ├── scanner/
│   │   │   │   └── ReceiptScanner.tsx
│   │   │   ├── coach/
│   │   │   │   └── AICoach.tsx
│   │   │   └── ui/              # shadcn/ui components
│   │   ├── pages/
│   │   │   ├── Landing.tsx
│   │   │   ├── Onboarding.tsx
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Scanner.tsx
│   │   │   ├── Coach.tsx
│   │   │   ├── Community.tsx
│   │   │   └── Profile.tsx
│   │   ├── hooks/
│   │   │   ├── useCarbon.ts
│   │   │   ├── useGemini.ts
│   │   │   └── useRealtime.ts
│   │   ├── store/               # Zustand
│   │   │   └── carbonStore.ts
│   │   ├── lib/
│   │   │   ├── supabase.ts
│   │   │   ├── carbon-calculator.ts
│   │   │   └── gemini.ts
│   │   └── tests/
│   │       ├── carbon-calculator.test.ts
│   │       └── e2e/smoke.spec.ts
│   ├── public/
│   │   └── models/              # .glb files for Earth (keep small!)
│   └── vite.config.ts
│
├── backend/                     # Node.js + Express + TypeScript
│   ├── src/
│   │   ├── routes/
│   │   │   ├── carbon.ts
│   │   │   ├── scanner.ts
│   │   │   └── coach.ts
│   │   ├── middleware/
│   │   │   ├── auth.ts
│   │   │   ├── rateLimit.ts
│   │   │   └── validate.ts
│   │   ├── services/
│   │   │   ├── geminiService.ts
│   │   │   ├── carbonService.ts
│   │   │   └── supabaseService.ts
│   │   └── index.ts
│   └── package.json
│
├── .github/
│   └── workflows/
│       └── ci.yml               # GitHub Actions CI
├── .gitignore
└── README.md
```

---

## 3. DATABASE SCHEMA (Supabase)

```sql
-- Users table (extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  username TEXT UNIQUE,
  avatar_url TEXT,
  country TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Carbon entries (one per activity log)
CREATE TABLE carbon_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  category TEXT NOT NULL, -- 'transport' | 'food' | 'energy' | 'shopping'
  sub_category TEXT,
  amount_kg DECIMAL(10,4) NOT NULL,
  source TEXT, -- 'manual' | 'scanner' | 'ai_coach'
  metadata JSONB,
  logged_at TIMESTAMP DEFAULT NOW()
);

-- Daily summaries (pre-computed for performance)
CREATE TABLE daily_summaries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  total_kg DECIMAL(10,4) NOT NULL,
  by_category JSONB,
  UNIQUE(user_id, date)
);

-- Streaks
CREATE TABLE streaks (
  user_id UUID REFERENCES profiles(id) PRIMARY KEY,
  current_streak INT DEFAULT 0,
  longest_streak INT DEFAULT 0,
  last_logged DATE
);

-- Community aggregates (for globe heatmap)
CREATE TABLE country_stats (
  country_code CHAR(2) PRIMARY KEY,
  total_users INT DEFAULT 0,
  avg_daily_kg DECIMAL(10,4) DEFAULT 0,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Row Level Security
ALTER TABLE carbon_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can only see own entries"
  ON carbon_entries FOR ALL USING (auth.uid() = user_id);
```

---

## 4. DESIGN SYSTEM

### Aesthetic Direction: **"Dark Biopunk Data"**
Dark backgrounds with bioluminescent greens and dangerous reds — like looking at a living organism's vital signs. The Earth is alive, and your actions are killing or healing it.

```css
/* Color Palette */
--bg-primary: #050A0E;        /* Deep space black */
--bg-surface: #0A1628;        /* Dark navy */
--bg-card: #0F1F35;           /* Card background */
--accent-green: #00FF87;      /* Bioluminescent green — healthy */
--accent-red: #FF3366;        /* Danger red — high footprint */
--accent-amber: #FFB800;      /* Warning amber */
--accent-blue: #00D4FF;       /* Data blue */
--text-primary: #E8F4FD;      /* Near white */
--text-muted: #7BA7C4;        /* Muted blue-grey */
--glow-green: 0 0 20px rgba(0,255,135,0.4);
--glow-red: 0 0 20px rgba(255,51,102,0.4);

/* Typography */
--font-display: 'Syne', sans-serif;     /* Bold, geometric for headings */
--font-body: 'DM Sans', sans-serif;     /* Clean, readable for body */
--font-mono: 'JetBrains Mono', monospace; /* For numbers/data */

/* React Bits components to use: */
/* - Animated gradient borders on cards */
/* - Glitch text effect on the "carbon clock" number */
/* - Particle background on landing */
/* - Magnetic buttons */
/* - Aurora background for onboarding */
```

### 3D Sections:
| Page | 3D Element | Three.js Approach |
|------|-----------|-------------------|
| Landing | Spinning Earth with atmosphere | `@react-three/drei` → `<Stars>` + custom Earth shader |
| Dashboard | Personal "carbon bubble" | Animated sphere that grows/shrinks with your score |
| Community | Global heatmap globe | Earth texture + overlay points colored by country intensity |
| Coach | Floating AI orb | Animated icosahedron with particle trail |

---

## 5. BUILD PHASES (Execute in Order with AntiGravity)

---

### PHASE 1 — Project Scaffold & Auth (Do This First)
**Estimated Time: 20-30 min**
**AntiGravity Prompt Style: Use the IDE, not CLI for initial setup**

**What to build:**
1. Initialize Vite + React + TypeScript frontend
2. Initialize Express + TypeScript backend
3. Configure Tailwind + shadcn/ui
4. Set up Supabase project (do this manually at supabase.com first, then paste credentials)
5. Implement auth flow: Sign Up / Login / Google OAuth
6. Basic routing with React Router v6
7. Protected route wrapper

**AntiGravity prompt to use:**
```
Create a full-stack carbon footprint tracking app called CarbonSense.

Frontend: React 18 + Vite + TypeScript + Tailwind CSS + shadcn/ui + React Router v6 + Zustand
Backend: Express + TypeScript + CORS + helmet + express-rate-limit

Setup auth using Supabase with these env vars already configured:
VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY

Create:
1. Landing page route at /
2. Dashboard at /dashboard (protected, redirect to /auth if not logged in)
3. Auth page at /auth with email/password + Google OAuth using Supabase Auth
4. Zustand store with: user, isLoading, carbonEntries[]
5. A ProtectedRoute component that checks Supabase session
6. Basic layout with a sidebar nav showing: Dashboard, Scanner, AI Coach, Community, Profile

Use this color scheme in tailwind.config.ts:
- bg-primary: #050A0E
- bg-surface: #0A1628  
- accent-green: #00FF87
- accent-red: #FF3366
- text-primary: #E8F4FD

Import Google Fonts: Syne (700, 800) and DM Sans (400, 500) in index.html
```

**Files expected after Phase 1:**
- `frontend/src/pages/Landing.tsx` ✓
- `frontend/src/pages/Auth.tsx` ✓
- `frontend/src/pages/Dashboard.tsx` (skeleton) ✓
- `frontend/src/store/carbonStore.ts` ✓
- `frontend/src/lib/supabase.ts` ✓
- `backend/src/index.ts` with Express + middleware ✓

**Verify before moving on:**
- [ ] Can sign up with email
- [ ] Redirects to dashboard after login
- [ ] Dashboard redirects to /auth if not logged in
- [ ] Tailwind custom colors working
- [ ] Both servers running without errors

---

### PHASE 2 — Carbon Calculator Engine (Core Logic)
**Estimated Time: 20-25 min**
**This is what judges score as "Code Quality" and "Efficiency"**

**What to build:**
1. Carbon calculation library (pure TypeScript functions — easily testable)
2. Supabase table setup via SQL migration
3. API endpoints: POST /carbon/log, GET /carbon/summary, GET /carbon/history
4. Frontend form for logging activities (transport, food, energy, shopping)

**AntiGravity prompt:**
```
Build the carbon footprint calculation engine for CarbonSense.

Create: frontend/src/lib/carbon-calculator.ts
This is a PURE FUNCTION library (no side effects, no API calls) with:

interface CarbonEntry {
  category: 'transport' | 'food' | 'energy' | 'shopping'
  subCategory: string
  quantity: number
  unit: string
}

Use these emission factors (kg CO2e per unit):
Transport: car_petrol_km: 0.21, car_electric_km: 0.053, bus_km: 0.089, 
           train_km: 0.041, flight_domestic_km: 0.255, flight_intl_km: 0.195
Food: beef_kg: 27.0, chicken_kg: 6.9, fish_kg: 3.0, vegetarian_meal: 0.5, 
      vegan_meal: 0.3, dairy_liter: 3.2, eggs_dozen: 3.6
Energy: electricity_kwh: 0.82, natural_gas_m3: 2.04, lpg_kg: 2.98
Shopping: clothing_item: 7.0, electronics_phone: 70.0, electronics_laptop: 300.0

Export:
- calculateCarbon(entry: CarbonEntry): number  // returns kg CO2e
- getWeeklyAverage(entries: CarbonEntry[]): number
- getDailyTotal(entries: CarbonEntry[], date: Date): number  
- getCategoryBreakdown(entries: CarbonEntry[]): Record<string, number>
- getFootprintScore(dailyKg: number): { score: number, rating: 'excellent'|'good'|'average'|'poor'|'critical' }
  // Global average: 12kg/day, Target: 3kg/day, Score: 0-100 (higher = better)

Also create: backend/src/routes/carbon.ts
Express router with:
- POST /api/carbon/log — validates body, calls supabase insert
- GET /api/carbon/summary — returns last 30 days summary per category
- GET /api/carbon/history?days=7 — paginated entry list
- DELETE /api/carbon/entry/:id — owner check via Supabase auth token

Middleware: auth.ts that extracts JWT from Authorization header and verifies with Supabase
```

**Files expected:**
- `frontend/src/lib/carbon-calculator.ts` ✓
- `frontend/src/tests/carbon-calculator.test.ts` ✓ (write this too)
- `backend/src/routes/carbon.ts` ✓
- `backend/src/middleware/auth.ts` ✓

**Unit tests to write (CRITICAL for judging):**
```typescript
// carbon-calculator.test.ts
describe('calculateCarbon', () => {
  it('calculates car petrol correctly', () => {
    expect(calculateCarbon({ category: 'transport', subCategory: 'car_petrol', quantity: 100, unit: 'km' }))
      .toBeCloseTo(21.0)
  })
  it('returns 0 for unknown subCategory', () => { ... })
  it('getFootprintScore returns critical for >15kg/day', () => { ... })
})
```

---

### PHASE 3 — Dashboard UI with 3D Carbon Bubble
**Estimated Time: 30-40 min**
**This is your visual WOW moment #1**

**What to build:**
1. Dashboard layout with stats cards
2. The Carbon Clock component (real-time counter)
3. 3D "personal carbon bubble" using react-three-fiber
4. Recharts area chart for 30-day history
5. Streak tracker component

**AntiGravity prompt:**
```
Build the main Dashboard page for CarbonSense.

Install: npm install three @react-three/fiber @react-three/drei framer-motion recharts

Create Dashboard.tsx with this layout:
- Top: Carbon Clock — a large glowing number showing kg CO2 emitted TODAY
  It counts up in real time (add 0.001kg every ~3 seconds to simulate)
  Color: green if under 3kg, amber if 3-8kg, red if over 8kg
  Font: JetBrains Mono, huge (text-7xl)
  Add glitch animation effect using CSS keyframes when it crosses thresholds

- Left column (40%): 
  3D Canvas using @react-three/fiber showing a sphere
  The sphere SIZE corresponds to today's carbon total (scale from 0.5 to 3.0)
  The sphere COLOR lerps from #00FF87 (green) to #FF3366 (red) based on score
  It slowly rotates and has animated particle ring around it
  Background: deep space with subtle star particles (@react-three/drei Stars)

- Right column (60%):
  4 stat cards: Today / This Week / This Month / vs. Global Average
  Each card has a subtle animated gradient border
  Recharts AreaChart showing last 14 days, colored gradient fill
  Category breakdown: 4 progress bars (transport, food, energy, shopping)
  Each bar glows its accent color

- Bottom:
  "Log Activity" floating action button — opens slide-in drawer
  Quick-log buttons: 🚗 Drove, 🥩 Ate meat, ⚡ Electricity, 🛍 Shopping

Style: All dark cards with bg-surface, subtle glow effects, everything animated on mount with framer-motion (stagger: 0.1s per card)

Fetch data from GET /api/carbon/summary on mount using React Query
```

**The 3D Carbon Bubble (separate file: EarthScene.tsx):**
```typescript
// Prompt for this specifically:
// Create a Three.js scene with:
// - Central sphere with vertex shader that makes surface look like swirling atmosphere
// - Particle system orbiting the sphere (200 particles)
// - Wireframe icosahedron overlay, slowly rotating opposite direction
// - Post-processing bloom effect from @react-three/postprocessing
// - Camera orbits slowly on auto (no user interaction needed)
// Accept props: carbonScore (0-100), dailyKg (number)
// Use these to dynamically color and scale the scene
```

---

### PHASE 4 — Receipt/Bill Scanner (The AI Power Feature)
**Estimated Time: 25-30 min**
**This is your technical complexity differentiator**

**What to build:**
1. Image upload component
2. Gemini Vision API call (backend) to analyze receipt/energy bill
3. Parse AI response → carbon entries
4. Confirmation UI before saving

**AntiGravity prompt:**
```
Build the Receipt Scanner feature for CarbonSense.

Backend: Create backend/src/routes/scanner.ts
- POST /api/scanner/analyze
- Accepts multipart/form-data with an image file
- Stores image temporarily in memory (multer memoryStorage)
- Calls Gemini 1.5 Flash API with the image as base64
- System prompt: "You are a carbon footprint analyst. Analyze this receipt or utility bill image. 
  Extract all items/services and estimate their carbon footprint in kg CO2e. 
  Respond ONLY with valid JSON: { items: [{ name, quantity, unit, estimatedCarbonKg, category }], totalCarbonKg, confidence: 0-1 }"
- Parse the JSON response, validate it, return to frontend
- Rate limit this endpoint: 10 requests per user per hour (use express-rate-limit with redis-like Map)
- Gemini API key must come from process.env.GEMINI_API_KEY — NEVER expose to frontend

Frontend: Create frontend/src/pages/Scanner.tsx
- Drag-and-drop upload zone with dashed border animation
- Preview the uploaded image 
- Loading state: animated spinner with text "AI is analyzing your receipt..."
- Result display: 
  - Each detected item as a card with its estimated carbon
  - Color code: green/amber/red based on carbon amount
  - Total at bottom with "Add to my log" button
  - "Surprising fact" — one AI-generated insight about the highest-carbon item
- Camera capture option for mobile (use <input type="file" accept="image/*" capture>)

Security: 
- Validate file type server-side (only image/jpeg, image/png, image/webp)
- Max file size: 5MB
- Sanitize all AI response fields before saving to DB
```

---

### PHASE 5 — AI Carbon Coach (Gemini Chat)
**Estimated Time: 20-25 min**
**This is what makes it feel next-generation**

**What to build:**
1. Chat interface (not a generic chatbot)
2. System prompt that makes Gemini a personalized carbon coach using the user's real data
3. Suggested actions carousel
4. "Challenge of the day" feature

**AntiGravity prompt:**
```
Build the AI Carbon Coach page for CarbonSense.

Backend: Create backend/src/routes/coach.ts
POST /api/coach/chat
- Accepts: { message: string, conversationHistory: Message[] }
- Fetches user's last 7 days carbon data from Supabase
- Builds system prompt:
  "You are TERRA, an AI carbon footprint coach. The user's data:
  - 7-day average: {X} kg CO2e/day (global avg: 12kg, target: 3kg)
  - Highest category: {category} at {Y}%
  - Current streak: {N} days logging
  Be specific, empathetic, practical. Give EXACT actions with REAL numbers.
  Example: 'Switching from daily beef to chicken for one month saves 62kg CO2 — 
  equivalent to driving 295km less.' Keep responses under 150 words. 
  Don't be preachy. Be a supportive coach, not a lecturer."
- Streams the response back using SSE (Server-Sent Events) for real-time feel
- Max 20 messages per user per day (rate limit)

Frontend: Create frontend/src/pages/Coach.tsx
- Full page chat interface, dark background
- Floating 3D animated orb (icosahedron) in top right corner using Three.js
  The orb pulses when TERRA is "thinking"
- TERRA's messages have a subtle animated gradient border and small AI icon
- User messages: right-aligned, solid bg-surface
- Streaming text: characters appear one by one (typewriter effect)
- Bottom: 3 suggested quick prompts that change daily:
  "What's my worst habit?" | "Quick wins for this week" | "Compare me to global average"
- "Challenge of the day" card at top — AI-generated specific challenge based on user's weakest category
```

---

### PHASE 6 — Community Globe (The Visual Showstopper)
**Estimated Time: 30-35 min**
**This is WOW moment #2 — judges will remember this**

**What to build:**
1. Interactive 3D Earth with country heatmap overlay
2. Real-time leaderboard (sorted by improvement, not lowest footprint — rewards effort)
3. Global stats ticker

**AntiGravity prompt:**
```
Build the Community page for CarbonSense.

Install: npm install globe.gl (or use Three.js directly with a sphere + texture)

Create frontend/src/components/3d/GlobeHeatmap.tsx:
- Use globe.gl library to render an interactive 3D Earth
- Overlay country polygons colored by average daily kg CO2 per user
  Color scale: #00FF87 (green, < 3kg) → #FFB800 (amber, 3-10kg) → #FF3366 (red, >10kg)
- Hovering a country shows tooltip: "🇮🇳 India: avg 4.2 kg/day • 127 users"
- Auto-rotates slowly, users can drag to spin
- Atmosphere glow effect
- Animated arcs between countries that have done challenges together
- Fetch country stats from GET /api/community/stats

Create the Community page layout:
- Globe takes 60% of screen (left)
- Right panel:
  - "Most Improved This Week" leaderboard (NOT lowest footprint — rewards effort)
    Shows avatar, username, improvement %, flag emoji
  - Live activity feed: "[username] just logged 2.1kg saved by biking to work 🚲"
    This uses Supabase Realtime to stream new entries live
  - "Active Challenges": 3 community challenges with progress bars
    e.g. "1000 members reduce beef consumption this week: 67% complete"
- Stats ticker at top: "Combined, CarbonSense users have saved X,XXX kg CO2 this week"
  This number counts up in real time using Supabase Realtime

Backend: GET /api/community/stats — aggregated country data (cached, refresh every 5 min)
```

---

### PHASE 7 — Onboarding Flow (First Impression)
**Estimated Time: 20 min**
**Judges see this first after auth — make it stunning**

**AntiGravity prompt:**
```
Build an onboarding flow for new CarbonSense users (shown once after first login).

5-step onboarding at /onboarding:
Step 1: "What's your baseline?" — select country + answer 5 quick questions
  (How do you commute? What's your diet? Do you own a car? Home energy source? Avg flights/year)
  Use large tap-target button cards, not dropdowns
  Background: aurora animation (use CSS, not canvas)

Step 2: Animated reveal of their estimated baseline
  "You emit approximately X kg CO2 per day"
  Show vs global average and Paris Agreement target (3kg)
  Animate a comparison bar chart sliding in
  "That's the equivalent of [relatable comparison] per year"
  (e.g., "driving from Mumbai to Delhi 47 times")

Step 3: Set a goal
  "I want to reduce my footprint by [10% / 25% / 50% / custom]"
  Show what that means: "Your target: X kg/day by [date]"
  3D Earth shows healing animation when they pick higher reduction goal

Step 4: "What's hardest for you to change?"
  Multi-select: Diet / Transport / Energy / Shopping
  Gemini API generates 3 personalized tips for their chosen areas

Step 5: "You're all set" — confetti + animated Earth spinning + CTA to Dashboard

Store onboarding data to profiles table.
Mark onboarding complete so it never shows again.
```

---

### PHASE 8 — Performance, Security & Accessibility Hardening
**Estimated Time: 20-25 min**
**This is where you win the Code Quality, Security, and Accessibility criteria**

**AntiGravity prompt:**
```
Audit and harden CarbonSense for production quality.

SECURITY (do all of these):
1. Helmet.js already installed — verify Content-Security-Policy is configured
2. All API routes check Supabase JWT — verify middleware applied to ALL routes
3. Input validation: add Zod schemas to ALL POST routes
4. GEMINI_API_KEY: verify it's only in .env, never in any frontend code
5. Rate limiting: verify limits on scanner (10/hr) and coach (20/day)
6. Supabase RLS: verify carbon_entries policy only allows owner access
7. Add CORS config: only allow frontend domain in production

PERFORMANCE:
1. Lazy load all pages with React.lazy() + Suspense
2. Three.js scenes: add loading fallback, use useFrame efficiently (no setState in render loop)
3. API calls: wrap all fetch calls with React Query (useQuery, useMutation) for caching
4. Images in scanner: compress client-side before upload using browser-image-compression
5. Add Vite bundle analysis: run `vite-bundle-visualizer`, ensure no chunk > 500KB
6. Memoize expensive calculations: getCategoryBreakdown, getWeeklyAverage with useMemo

ACCESSIBILITY:
1. All interactive elements have aria-label or aria-labelledby
2. All color information is also conveyed by icon or text (don't rely on color alone)
3. Keyboard navigation: Tab through all form elements, Enter activates buttons
4. The 3D globe: add aria-label="Interactive 3D globe showing carbon data by country" 
   and aria-hidden="false" — provide same data in accessible table below
5. Color contrast: verify all text meets WCAG AA (4.5:1) — use CSS variable adjustments
6. Loading states: use role="status" aria-live="polite" on loading indicators
7. Focus ring: ensure visible focus indicator on all interactive elements (outline: 2px solid #00FF87)

TESTING:
1. Write 10 unit tests in carbon-calculator.test.ts covering all calculation functions
2. Write Playwright smoke test (e2e/smoke.spec.ts):
   - Visits landing page
   - Clicks "Get Started"
   - Auth page loads
   - (Optional: actual login if test user exists)
3. Add GitHub Actions CI (.github/workflows/ci.yml):
   - Run on push to main
   - npm install + npm run test + npm run build (frontend)
   - Fail PR if tests fail
```

---

### PHASE 9 — Landing Page (The Judge's First Look)
**Estimated Time: 20-25 min**
**This is what judges see BEFORE they log in**

**AntiGravity prompt:**
```
Build a stunning landing page for CarbonSense at the / route.

Sections (scroll-based):

HERO:
- Full viewport height
- Background: animated particle system (React Bits or Three.js) with dark space feel
- Centered: "Your Planet. Your Footprint. Your Choice."
  "CARBONSENSE" in massive Syne font with animated gradient text (green → blue)
- Sub: "The only carbon tracker powered by AI that actually changes behavior"
- Two CTAs: "Start for Free →" (green, magnetic hover effect) + "See Demo" (outline)
- Below: 3 trust badges: "Gemini AI Powered" | "Open Source" | "Privacy First"

FEATURES SHOWCASE (3 cards, animate in on scroll):
Card 1: Scanner — show mockup of receipt scan flow
Card 2: AI Coach — show TERRA chat mockup  
Card 3: Community Globe — small 3D globe preview spinning

IMPACT NUMBERS (animate count-up on scroll-into-view):
"12.4 tons" - average person's yearly footprint
"3 tons" - Paris Agreement target
"89%" - of footprint comes from just 3 habits

HOW IT WORKS (3 steps with icons):
1. Log your activities (or scan receipts) → 2. AI analyzes patterns → 3. Get actionable steps

SOCIAL PROOF (even if fake for demo):
"1,247 users have reduced their footprint by an average of 23% in 30 days"

FOOTER: links, GitHub, "Built with AntiGravity for Prompt Wars 2026"

Technical notes:
- Use IntersectionObserver for scroll animations
- All animations use CSS transitions (not JS for performance)
- Fully responsive — test at 375px mobile width
- CLS (Cumulative Layout Shift) should be near zero — set explicit dimensions on all media
```

---

### PHASE 10 — Final Polish, Deployment & README
**Estimated Time: 15-20 min**

**Deployment steps:**
```bash
# 1. Push to GitHub (verify repo is under 10MB)
git init
echo "node_modules/\n.env\ndist/\nbuild/\n*.log" > .gitignore
git add .
git commit -m "feat: CarbonSense v1.0 - Carbon Footprint Awareness Platform"
git push origin main

# 2. Vercel (Frontend)
# - Connect GitHub repo at vercel.com
# - Set root directory: frontend/
# - Add env vars: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, VITE_API_URL
# - Deploy

# 3. Railway (Backend)  
# - Connect GitHub repo at railway.app
# - Set root directory: backend/
# - Add env vars: SUPABASE_URL, SUPABASE_SERVICE_KEY, GEMINI_API_KEY, FRONTEND_URL
# - Deploy

# 4. Supabase (DB)
# - Run SQL migrations in Supabase SQL editor
# - Enable Realtime for carbon_entries table
# - Set up Storage bucket: receipt-images (private)
```

**AntiGravity prompt for README:**
```
Write a production-quality README.md for CarbonSense that includes:
- Project description with screenshots (placeholder links)
- Tech stack table
- Key features list
- Architecture diagram (as ASCII art or mermaid)
- Local setup instructions (5 steps)
- Environment variables table (with descriptions, no real values)
- API documentation (all endpoints with request/response examples)
- Deployment guide
- How AI (Gemini) is used (specific, technical)
- Contributing section
- License: MIT

Make it look like a senior engineer wrote it. Include badges for:
Built with React, TypeScript, Three.js, Powered by Gemini, Deployed on Vercel
```

---

## 6. FULL JUDGING CHECKLIST

Before submitting, verify every item:

### Code Quality ✓
- [ ] TypeScript everywhere (no `any` types)
- [ ] Consistent naming conventions (camelCase functions, PascalCase components)
- [ ] No commented-out dead code
- [ ] Functions < 50 lines, single responsibility
- [ ] All async operations have error handling (try/catch)
- [ ] README explains architecture clearly

### Security ✓
- [ ] Gemini API key ONLY in backend .env
- [ ] Supabase anon key in frontend (this is OK — it's designed for that)
- [ ] Supabase service key ONLY in backend .env
- [ ] All API routes validate JWT
- [ ] Zod validation on all POST body inputs
- [ ] Rate limiting on AI endpoints
- [ ] File upload: type + size validation
- [ ] CORS: whitelist frontend URL only
- [ ] No sensitive data in git history (`git log` clean)

### Efficiency ✓
- [ ] Vite build < 2MB total
- [ ] React Query caching API responses
- [ ] React.lazy() on all page components
- [ ] Three.js: no memory leaks (dispose geometries, materials on unmount)
- [ ] No N+1 queries (batch DB calls)
- [ ] Supabase daily_summaries pre-computed (not calculated on every request)

### Testing ✓
- [ ] ≥10 unit tests in Vitest, all passing
- [ ] Playwright smoke test passing
- [ ] GitHub Actions CI green on latest commit
- [ ] Test coverage report shows core calculator at 80%+

### Accessibility ✓
- [ ] Lighthouse Accessibility score ≥ 85
- [ ] All images have alt text
- [ ] All form inputs have labels
- [ ] Tab order is logical
- [ ] WCAG AA color contrast on all text
- [ ] 3D elements have accessible text alternatives
- [ ] No content relies on color alone

---

## 7. WHAT MAKES THIS RANK #1

Every other project in this challenge will have:
- Green dashboard with pie charts
- "Log food/transport" form
- Generic GPT suggestions

CarbonSense has:
1. **3D Earth that visually degrades** — no one else has this
2. **Receipt AI scanner** — multimodal Gemini, not just text
3. **Real-time community globe** — Supabase Realtime + Three.js
4. **TERRA streaming AI coach** — SSE streaming, personalized with real user data
5. **Carbon debt clock** — emotionally impactful, memorable
6. **Full TypeScript + Zod + testing** — wins every technical criterion
7. **WCAG AA accessibility** — almost no hackathon project does this properly

This is not a hackathon project. This is an MVP that could raise seed funding.

---

## 8. TIME BUDGET

| Phase | Time | Cumulative |
|-------|------|-----------|
| Phase 1: Scaffold + Auth | 30 min | 30 min |
| Phase 2: Carbon Engine | 25 min | 55 min |
| Phase 3: Dashboard 3D | 40 min | 95 min |
| Phase 4: Scanner | 30 min | 125 min |
| Phase 5: AI Coach | 25 min | 150 min |
| Phase 6: Community Globe | 35 min | 185 min |
| Phase 7: Onboarding | 20 min | 205 min |
| Phase 8: Security/A11y | 25 min | 230 min |
| Phase 9: Landing Page | 25 min | 255 min |
| Phase 10: Deploy + README | 20 min | **275 min total (~4.5 hours)** |

You have until **June 21st**. Start **June 10th** (tomorrow). That's 11 days.
Pace: 1 phase per day with time to fix bugs. You will finish.

---

*CarbonSense | Built by Anchit | Prompt Wars 2026 | SRMIST Kattankulathur*
