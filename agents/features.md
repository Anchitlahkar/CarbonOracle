# CARBONSENSE X — MASTER SPECIFICATION

## 1. Vision

**Mission**
To transform carbon tracking from passive telemetry into actionable sustainability intelligence through high-fidelity behavioral analysis, forecasting, optimization, and AI-powered guidance.

**Problem Statement**
The "Awareness Gap": Traditional carbon calculators treat footprints as passive accounting. They show *what* happened but fail to explain *why*, what the *consequences* are, or how to *change* effectively. Without forecasting or context-aware nudge engineering, users experience high friction and fail to translate tracking data into real-world behavior changes.

**Research Motivation**
Ecological data must be cognitively linked to personal choices. We hypothesize that providing real-time trajectory visualization (a Planet Twin) combined with habit-adjusted reduction planning (Optimization Engine) significantly increases sustained carbon reduction vs static numerical tables.

**Why Existing Carbon Trackers Fail**
- They rely on manual data entry (high friction).
- They provide generic tips ("Go Vegan") without assessing the user's habit resistance.
- They lack future-state visualization.

**Behavior Change vs Awareness**
CarbonSense bridges this gap by enforcing the following lifecycle:
**Measure** → **Understand** → **Forecast** → **Reduce** → **Track**

**CarbonSense X Hypothesis**
If users can visualize the direct, simulated planetary consequence of their footprint momentum, and receive low-friction, MCDA-ranked reduction steps, their willingness and ability to reduce emissions increases dramatically.

**Success Metrics**
- Reduction of annual Kg CO2e drift vs optimized paths.
- Frequency of "Intervention Commitments" initiated from the TERRA AI Coach.
- Accuracy of Carbon DNA archetype classification.

---

## 2. System Goals

**Functional Goals**
- AI Receipt Scanning for zero-friction measurement.
- Cognitive Archetype profiling (Carbon DNA).
- Multi-Criteria Decision Analysis for optimized task ranking.
- 3D Planet Twin simulation.

**Non-Functional Goals**
- Strict separation of deterministic math from probabilistic AI reasoning.
- Extensible, monorepo engine architecture.

**Performance Targets**
- Dashboard Cockpit renders in < 100ms using Zustand state caching.
- Serverless AI inference completes under 4s.

**Security Targets**
- Zero PII leak via API. Supabase RLS enforced.
- Secure environment separation for Demo evaluators.

**Accessibility Targets**
- WCAG AA compliance across dashboards and WebGL containers.

**Scalability Targets**
- Vercel Edge caching and stateless Express APIs.

---

## 3. Core Innovation

**Behavior Intelligence Engine**
Calculates daily emission means, category ratios, and classifies consumption habits.

**Prediction Engine**
Projects baseline, trend-adjusted, and optimized 30/90/365-day trajectories.

**Intervention Optimization Engine**
Uses MCDA to score reduction tips balancing savings against behavioral resistance.

**Carbon DNA System**
Extracts the "genome" of a user's behavior (Volatility, Intensity, Readiness).

**Explainable AI Layer (TERRA)**
Provides streaming, conversational support grounded entirely in the user's specific DNA profile.

**Planet Twin Simulation**
Translates abstract mathematical drifting into a WebGL planetary health model.

---

## 4. User Personas

**Environmentally Conscious User**
Looking for exact scientific roadmaps rather than vague platitudes.

**High Emission User**
Requires low-friction onboarding (Receipts) and targeted easy-wins to begin their journey.

---

## 5. User Journeys

**First Login**
1. Auth -> Dashboard Welcome.
2. Complete Baseline Profile / Scan first receipt.
3. Dashboard populates with 30-day forecast.

**Daily Usage**
- Check "Executive Brief" via TERRA.
- Monitor Planet Health Index.

**Receipt Upload**
- Image -> Gemini 1.5 Flash -> Structured JSON -> Science Engine -> Dashboard Sync.

**Optimization Review**
- Navigate to Optimization Engine -> Select highest MCDA-ranked candidate -> Commit.

---

## 6. Platform Architecture

**Frontend Architecture**
React 18, Zustand, Tailwind, React Three Fiber.

**Backend Architecture**
Express.js API, Vercel Serverless.

**AI Layer**
Google Gemini 1.5 Flash (via @carbonsense/ai-orchestration).

**Database Layer**
Supabase PostgreSQL.

**Realtime Layer**
Supabase WebSockets for Dashboard Sync.

**Deployment Layer**
Vercel Edge Functions.

---

## 7. Data Model

See `@carbonsense/shared-types` for exact interfaces. Key entities:
- `UserProfile`
- `CarbonEntry`
- `BehaviorProfile`
- `OptimizationPlan`
- `PlanetTwinProfile`
- `CarbonDNAProfile`

---

## 8. Carbon Science Engine
Responsible for deterministic emission factors and methodology constraints.

---

## 9. Behavior Intelligence Engine
Generates `BehaviorFeatureVector` (transport ratio, food ratio, daily mean).

---

## 10. Forecast Engine
Simulates emission trajectories across defined temporal bounds.

---

## 11. Optimization Engine
MCDA algorithm balancing `estimatedSavingsKg`, `difficultyLevel`, and `resistanceScore`.

---

## 12. Carbon DNA Engine
Groups behaviors into Personas (`TransportDominant`, etc.) and scales dimensions.

---

## 13. Explainable AI Layer (TERRA)
Generates `CoachResponse` containing `usageMetrics` and `evidence` blocks to prevent hallucination.

---

## 14. Receipt Intelligence System
Vision AI OCR -> Schema Extractor -> Carbon Science matching.

---

## 15. Planet Twin System
Translates `TwinTrajectory` into `ImpactProjection` (Earth Overshoot Index, Trees required).

---

## 16. 3D Engine
Uses `@react-three/fiber` for Shader materials reflecting planetary temperature/emissions.

---

## 17. Frontend Design System
**Dark Biopunk Data**. High contrast telemetry dashboards (Background: `#050A0E`).

---

## 18. API Specification
Protected via `authMiddleware.ts` requiring Bearer tokens or Demo Sandboxing flags.

---

## 19. Security Architecture
JWT Verification, Environment Variable Isolation, Demo Mode Memory Hydration to prevent DB pollution.

---

## 20. Testing Strategy
Unit Tests via Vitest (258 current coverage). E2E Playwright tests for evaluator validation.

---

## 21. Performance Targets
Vite chunking and code-splitting ensures dashboard components lazy load.

---

## 22. CI/CD
Local typechecking, strict ESLint enforcement (`@typescript-eslint/no-explicit-any`).

---

## 23. Licensing
MIT License.
