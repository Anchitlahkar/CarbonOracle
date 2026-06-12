# CarbonSense — Powered by TERRA

<p align="left">
  <img src="https://img.shields.io/badge/License-MIT-green" alt="License" />
  <img src="https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/React-18.x-61DAFB?logo=react&logoColor=111827" alt="React" />
  <img src="https://img.shields.io/badge/Node.js-Express-339933?logo=node.js&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/PromptWars-2026-0ea5e9" alt="PromptWars" />
</p>

### ⚡ 10-Second Value Proposition
CarbonSense is a premium **AI Carbon Intelligence Platform** powered by **TERRA**, a world-class carbon advisor. It shifts carbon tracking from generic telemetry and curves to **concrete decisions and consequences**. TERRA synthesizes your behavior patterns, projects environmental futures, and builds ranked carbon roadmaps using Multi-Criteria Decision Analysis (MCDA).

---

## 🌍 The Core Intelligence: Meet TERRA

TERRA is not a generic ChatGPT wrapper or chatbot. It is a reasoning layer sitting on top of six scientific computation engines:

1. **Carbon Science Engine**: Calculates footprints with exact emission factor uncertainty bounds ($E_{upper}, E_{lower}$).
2. **Behavior Intelligence Engine**: Scrapes logging patterns, weekend spikes, and short-trip transport dependencies.
3. **Forecast Engine**: Projects baseline, momentum, and optimized cumulative emissions trajectories.
4. **Optimization Engine**: Employs Multi-Criteria Decision Analysis (MCDA) to rank interventions by monthly savings, effort, and user resistance.
5. **Carbon DNA Engine**: Classifies consumption patterns into dynamic behavioral archetypes (e.g. *Transport Heavy*).
6. **Planet Twin Engine**: Procedurally models parts-per-million atmospheric concentration and overshoot thresholds.

---

## ⏱ 3-Minute Judge Demo Script

Maximize your score in under 3 minutes by following this high-density flow:

### Step 1: The Executive Briefing (0:00 - 0:45)
* Open the **Cockpit Dashboard**. Note the **TERRA Executive Brief** at the very top.
* Point out the clear visual hierarchy answering:
  1. *What should I do next?* (Rank #1 MCDA recommendation to cut footprint).
  2. *Why?* (Dynamic share contribution relative to your behavior profile).
  3. *What happens if I do nothing?* (Consequences on projected annual emissions).

### Step 2: The Carbon DNA Profile (0:45 - 1:15)
* Navigate to **DNA Intelligence**. Show the user taxonomy matched with machine learning confidence scores.
* Observe the behavioral dimensions mapping (Intensity, Volatility, and Optimization Readiness) and the cognitive shift projection model.

### Step 3: Consequence Scenarios (1:15 - 1:45)
* Go to **Future Projections**. Focus on the **Planetary Scenarios Grid** beneath the chart.
* Contrast the outcomes of keeping the *Projected Inaction* path (emissions drift) versus the *TERRA Guided* and *Aggressive Recovery* paths.

### Step 4: The Empirical Evidence (1:45 - 2:15)
* Open **Planetary Dynamics**. Review the 3D Planet Twin globe showing dynamic texture and haze shifts driven by the selected trajectory, acting as the mathematical proof of your roadmap.

### Step 5: Document Scrapes & Citations (2:15 - 3:00)
* Upload a receipt in the **Document Scanner** to observe real-time OCR extraction with carbon Science multipliers.
* Go to the **TERRA Advisor** chat console. Send a message like *"How do I optimize my transport footprint?"* and observe the streaming response concluding with a structured citation checklist (*DNA Profile, User Behavior, Forecast, Expected Outcome*).

---

## 🛠 Technology Stack & Architecture

* **Frontend**: React 18, Vite 5, Tailwind CSS, Zustand, Recharts, Framer Motion.
* **3D Globe**: Three.js mapped through `@react-three/fiber` and `@react-three/drei`.
* **Backend**: Node.js, Express, Helmet, Rate Limiters, Multer.
* **AI Model**: Google Gemini 1.5 Flash.
* **Unit Testing**: Vitest asserting scientific calculator logic (all tests passing).

---

## Graceful AI Fallback

CarbonSense supports both Online and Offline Intelligence Modes.

* **Online Mode**: Uses Gemini for conversational reasoning.
* **Offline Mode**: Automatically activates when external AI services are unavailable.

Offline recommendations continue using:
* Carbon DNA Engine
* Behavior Intelligence Engine
* Forecast Engine
* Optimization Engine

No external AI service is required for core recommendation functionality.

---

## 🚀 Getting Started

### 1. Install Workspace Workspaces
```bash
npm run install:all
```

### 2. Configure Environment
Set `GEMINI_API_KEY` and Supabase variables in your `backend/.env` and `frontend/.env` files (refer to `.env.example`).

### 3. Build & Run
```bash
npm run build
npm run dev
```
Navigate to `http://localhost:5173`.
