# Evaluator Demo Guide

Welcome to the CarbonSense X Evaluation Demo. This document is designed to guide PromptWars evaluators through the optimal testing flow to verify the project's adherence to the "Carbon Footprint Awareness" problem statement.

## 1. Demo Entry

To access the demo sandbox:
1. Navigate to `/demo` via the deployed URL.
2. The application will instantly hydrate the client state using a localized static JSON payload (`demoData.ts`).
3. **No registration, no email verification, and no database configuration are required.**

## 2. The Evaluator Journey (5-Minute Walkthrough)

### Step 1: The Carbon Awareness Layer (Dashboard)
- Observe the Hero panel. Note the immediate visibility of the footprint: **6.5t CO₂e / Year**.
- Check the **Earth Overshoot Index** to see the 3.1 planet simulation.
- Review the **Impact Translation** section (e.g., KM driven, Trees Required), demonstrating how abstract math is made tangible.

### Step 2: Carbon DNA
- Navigate to the **DNA** tab.
- Note the classification: *Transport Dominant*.
- Review the dimensions sliders (Volatility, Readiness, Intensity). This demonstrates the engine's ability to "Understand" emission drivers beyond just counting logs.

### Step 3: Planet Twin Simulation
- Navigate to the **Planet Twin** tab.
- Observe the 3D WebGL globe. Toggle between "Current Baseline" and "Optimized" trajectories.
- The visual difference in atmospheric density and terrain health explicitly fulfills the "Forecast" awareness requirement.

### Step 4: Optimization Engine
- Navigate to the **Optimization** tab.
- Note how interventions are ranked not just by kg CO₂ saved, but by balancing saving against user *difficulty* and *habit resistance*.
- This fulfills the "Reduce" roadmap requirement.

### Step 5: Coach TERRA (Gemini AI)
- Navigate to the **Coach** tab.
- Observe the context-aware greeting. The AI already knows the user's primary emission factor.
- Test prompting TERRA for specific localized transport substitutions or receipt scanning questions.

## 3. Demo Dataset Specifics

The `demoData.ts` payload contains:
- 120 days of simulated carbon entries.
- A pre-calculated Planet Twin trajectory.
- 5 categorized behavioral signals.
- A top-ranked MCDA candidate targeting the "Transport" sector.

## 4. Architectural Note for Evaluators

While interacting with the demo, note that **all dashboard data is pre-calculated by deterministic TypeScript engines**. The AI (Gemini) is only queried when actively using the Receipt Scanner or chatting with TERRA. This architectural choice is intentional to prevent mathematical hallucinations.
