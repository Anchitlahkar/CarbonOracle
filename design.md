# CarbonSense — Design System Specification

This document details the complete design specification, theme tokens, styling rules, and UI component standards developed for the **CarbonSense Dark Biopunk Data** interface.

---

## 1. Global Visual Direction: "Dark Biopunk Data"

The visual theme resembles a high-density, immersive laboratory cockpit or telemetry console:
* **Deep Space Aesthetics**: Near-black pages with dark metallic card surfaces.
* **Bioluminescent Data Accents**: Vibrant colors signifying health statuses (greens), warnings (ambers), alerts (reds), and information parameters (blues).
* **High-Density Typography**: Clean geometric display faces, readable body text, and monospaced digits.
* **Micro-glows and Shadows**: Subtle glow shadows mapping visual focus on key elements.

### Color Tokens
* `bg-primary`: `#050A0E` (Page background)
* `bg-surface`: `#0A1628` (Primary containers, sidebar, modals)
* `bg-card`: `#0F1F35` (Elevated inner panels)
* `accent-green`: `#00FF87` (Healthy status, optimized paths)
* `accent-red`: `#FF3366` (Danger status, carbon drift, baseline paths)
* `accent-amber`: `#FFB800` (Medium warning status, momentum shifts)
* `accent-blue`: `#00D4FF` (Information, grid telemetry indices)
* `text-primary`: `#E8F4FD` (Body copy, highlighted titles)
* `text-muted`: `#7BA7C4` (Secondary text, labels)
* `text-subtle`: `rgba(123, 167, 196, 0.4)` (Borders, metadata labels)

### Typography
* **Display / Headings**: `Geist Sans` & `Inter` (geometric tracking-tight, uppercase)
* **Body Text**: `Inter`
* **Numbers / Telemetry (Mono)**: `JetBrains Mono`

---

## 2. UI Primitive Components & Container Levels

The design system categorizes panels and containers into hierarchical levels to denote elevation and structural depth:

| Level | Background Style | Border Style | Typical Use Case |
|---|---|---|---|
| **Level 1** | `bg-surface` (`#0A1628`) | `white/[0.06]` | Primary blocks, hero summaries, main analytics |
| **Level 2** | `bg-surface/80` (`#0A1628` with 80% opacity) | `white/[0.04]` + blur | Sub-charts, inner grid cards, classification profiles |
| **Level 3** | `bg-card/40` (`#0F1F35` with 40% opacity) | `white/[0.03]` | Data summaries, parameter splits, metrics metadata |
| **Level 4** | `bg-card/20` (`#0F1F35` with 20% opacity) | `transparent` | Base telemetry footers, audit bars |

---

## 3. Container Colors & Grids Per Page

This section maps the exact background, border, and accent colors utilized for every layout container on each application screen.

### 3.1. Landing Page (`Landing.tsx`)
* **Page Body Canvas**: `bg-primary` (`#050A0E`)
* **Hero Content Wrapper**: Translucent `bg-primary/40` to let background particles show through.
* **Start for Free CTA Button**: Background `bg-accent-green` (`#00FF87`), Text `text-bg-primary` (`#050A0E`).
* **See Demo CTA Button**: Background `bg-transparent`, Border `border-white/10`, Text `text-text-primary`.
* **Feature Cards**: `bg-surface/40` (`#0A1628` at 40% opacity) with hover border change to `border-accent-blue/30`.
* **Trust Badges & Footers**: Translucent `bg-white/[0.01]` with border `border-white/[0.03]`.

---

### 3.2. Authentication Page (`Auth.tsx`)
* **Page Body**: `bg-primary` (`#050A0E`)
* **Auth Modal Box**: Level 1 `bg-surface` (`#0A1628`) with border `border-white/[0.06]`.
* **Form Inputs**: Background `bg-bg-primary/80` (`#050A0E` at 80% opacity), Border `border-white/[0.06]`.
  * *Active Focus*: Border changes to `border-accent-green/60` (`#00FF87`) and applies a subtle green shadow glow.
* **Submit Button**: Background `bg-accent-green` (`#00FF87`), Text `text-bg-primary` (`#050A0E`).

---

### 3.3. Mission Control Dashboard (`Dashboard.tsx`)
* **Page Body Layout**: `bg-primary` (`#050A0E`)
* **Telemetry Status Pill**: Background `bg-transparent`, pulsing dot `bg-accent-green` (`#00FF87`).
* **Daily Intelligence Brief**: Level 1 `bg-surface` (`#0A1628`), Border `border-white/[0.06]`, Status indicator line `border-l-accent-blue` (`#00D4FF`).
  * *Highlights*: Keyword pills are wrapped in `bg-white/5` with borders `border-white/5`.
* **Metric Cards**:
  * *Planet Health Index*: Level 1 `bg-surface` (`#0A1628`), Status border `border-l-accent-amber` (`#FFB800`).
  * *30-Day Forecast*: Level 2 `bg-surface/80` (`#0A1628` at 80% opacity), border `border-white/[0.04]`.
* **Telemetry Ratios Panel**: Level 2 `bg-surface/80` (`#0A1628` at 80% opacity).
  * *Internal Progress Bars*: Outer track `bg-white/[0.02]`. Inner fill bars map to categories:
    * Transport: `bg-accent-blue` (`#00D4FF`)
    * Food: `bg-accent-green` (`#00FF87`)
    * Energy: `bg-accent-amber` (`#FFB800`)
    * Shopping: `bg-accent-red` (`#FF3366`)
* **DNA Genome Panel**: Level 2 `bg-surface/80` (`#0A1628` at 80% opacity).
  * *Archetype Classification Box*: `bg-bg-card` (`#0F1F35`), border `border-white/[0.03]`.
* **Momentum Panel**: Level 2 `bg-surface/80` (`#0A1628` at 80% opacity).
* **Signals Panel**: Level 3 `bg-bg-card/40` (`#0F1F35` at 40% opacity).
  * *Signal Items*: Background `bg-white/[0.01]`, border `border-white/[0.03]`.
* **Impact Previews Panel**: Level 3 `bg-bg-card/40` (`#0F1F35` at 40% opacity).
  * *Item Cards*: Background `bg-bg-card/30`, border `border-white/[0.03]`, Rank Badge `bg-white/[0.03] border-white/[0.06]`.
* **Audit Metadata Bar**: Level 4 `bg-bg-card/20` (borderless).

---

### 3.4. Planet Twin Simulation (`PlanetTwin.tsx`)
* **Page Layout**: `bg-primary` (`#050A0E`)
* **Scenario Toggle Panel**: Level 2 `bg-surface/60` (`#0A1628` at 60% opacity), Border `border-white/[0.03]`.
  * *Toggle Buttons*: Active button background varies by selection:
    * Current: `bg-accent-red` (`#FF3366`)
    * Optimized: `bg-accent-blue` (`#00D4FF`)
    * Aggressive: `bg-accent-green` (`#00FF87`) with text `#050A0E`
* **Globe Main Display**: Level 1 `bg-surface` (`#0A1628`), border `border-white/[0.06]`.
  * *Diagnostic Badge*: Background `bg-bg-surface/40`, border `border-white/[0.04]`.
  * *Offset Box*: Background `bg-bg-card/80`, border `border-white/[0.08]`.
* **Telemetry Data Cards**:
  * *Value boxes*: Level 2 `bg-surface/80` (`#0A1628` at 80% opacity), border `border-white/[0.03]`.
  * *Icon backgrounds*: Translucent `bg-white/[0.01]`, border `border-white/[0.04]`.
* **Simulation Brief**: Level 3 `bg-bg-card/40` (`#0F1F35` at 40% opacity).

---

### 3.5. Carbon DNA Dossier (`DNA.tsx`)
* **Page Layout**: `bg-primary` (`#050A0E`)
* **Dossier Header Block**: Level 1 `bg-surface/40` (`#0A1628` at 40% opacity), border `border-white/[0.04]`.
* **Archetype Match Box**: Level 1 `bg-surface` (`#0A1628`), border `border-white/[0.06]`.
  * *Classification Box*: Background `bg-bg-card` (`#0F1F35`), border `border-white/[0.03]`.
* **Evidence Signals**: Level 2 `bg-surface/30` (`#0A1628` at 30% opacity), border `border-white/[0.03]`.
* **Behavioral Dimensions Card**: Level 2 `bg-surface/50` (`#0A1628` at 50% opacity), border `border-white/[0.04]`.
* **Cognitive Shift Panel**: Level 2 `bg-surface/50` (`#0A1628` at 50% opacity), border `border-white/[0.04]`.
  * *Probable Shift Target Box*: Background `bg-bg-card/50` (`#0F1F35` at 50% opacity), border `border-white/[0.03]`.

---

### 3.6. Forecasts & Analytics (`Forecasts.tsx`)
* **Page Layout**: `bg-primary` (`#050A0E`)
* **Analytics Chart Canvas**: Level 1 `bg-surface/40` (`#0A1628` at 40% opacity), border `border-white/[0.04]`.
  * *Chart Tooltip*: Background `bg-bg-surface` (`#0A1628`), border `border-white/[0.08]`.
* **Sensitivity Risks Panel**: Level 2 `bg-surface/50` (`#0A1628` at 50% opacity), border `border-white/[0.04]`.
* **Alternative Pathing Panel**: Level 2 `bg-surface/50` (`#0A1628` at 50% opacity), border `border-white/[0.04]`.
  * *Item Cards*: Background `bg-bg-card/40` (`#0F1F35` at 40% opacity), border `border-white/[0.03]`.
* **Narrative Brief**: Level 3 `bg-bg-card/40` (`#0F1F35` at 40% opacity).

---

### 3.7. Optimization Center (`Optimization.tsx`)
* **Page Layout**: `bg-primary` (`#050A0E`)
* **Roadmap Intervention Cards**: Level 1 `bg-surface/40` (`#0A1628` at 40% opacity), border `border-white/[0.04]`.
  * *Status Indicators*: Left border success `border-l-accent-green` (`#00FF87`) or info `border-l-accent-blue` (`#00D4FF`).
  * *Decisions Matrix Box*: Background `bg-bg-card/40` (`#0F1F35` at 40% opacity), border `border-white/[0.03]`.
  * *Habit Friction explanation*: Background `bg-white/[0.01]`, border `border-white/[0.03]`.
* **Tradeoffs Dashboard**: Level 2 `bg-surface/50` (`#0A1628` at 50% opacity), border `border-white/[0.04]`.
  * *Tradeoff Cards*: Background `bg-bg-card/30` (`#0F1F35` at 30% opacity), border `border-white/[0.03]`.

---

### 3.8. Receipt Scanner (`Scanner.tsx`)
* **Page Layout**: `bg-primary` (`#050A0E`)
* **Dashed Dropzone Zone**: Background `bg-bg-surface/40` (`#0A1628` at 40% opacity), border `border-dashed border-white/[0.08]`.
  * *Dropzone Icon Wrapper*: Background `bg-white/[0.02]`, border `border-white/[0.06]`.
* **OCR Data Table Container**: Background `bg-bg-surface/40` (`#0A1628` at 40% opacity), border `border-white/[0.04]`.
* **Validation Panel**: Level 3 `bg-bg-surface/50` (`#0A1628` at 50% opacity), border `border-white/[0.04]`.
  * *Pill notification*: Background `bg-accent-amber/5` or `bg-accent-green/5`, border `border-accent-amber/10` or `border-accent-green/10`.
* **Inference Meta Panel**: Level 3 `bg-bg-surface/50` (`#0A1628` at 50% opacity), border `border-white/[0.04]`.
* **Pending Zone placeholder**: Level 2 `bg-bg-surface/30` (`#0A1628` at 30% opacity), border `border-white/[0.02]`.

---

### 3.9. TERRA AI Coach (`Coach.tsx`)
* **Page Layout**: `bg-primary` (`#050A0E`)
* **Chat Container Wrapper**: Background `bg-bg-surface` (`#0A1628`), border `border-white/[0.04]`.
  * *User messages*: Background `bg-bg-card/60` (`#0F1F35` at 60% opacity), border `border-accent-blue/20` (`#00D4FF`).
  * *TERRA messages*: Background `bg-white/[0.01]`, border `border-white/[0.04]`.
* **Quick Trigger Buttons**: Background `bg-white/[0.02]`, border `border-white/[0.04]`.
* **Chat Input Bar**: Background `bg-bg-primary` (`#050A0E`), Input background `bg-bg-surface/60`, border `border-white/[0.08]`.
* **Orb Render Card**: Level 2 `bg-surface/50` (`#0A1628` at 50% opacity), border `border-white/[0.04]`.
* **Explainability Panel**: Level 3 `bg-surface/30` (`#0A1628` at 30% opacity), border `border-white/[0.03]`.

---

### 3.10. Researcher Profile (`Profile.tsx`)
* **Page Layout**: `bg-primary` (`#050A0E`)
* **Profile Setup Panel**: Level 1 `bg-surface/40` (`#0A1628` at 40% opacity), border `border-white/[0.04]`.
* **Reduction Target Selector**: Level 2 `bg-surface/50` (`#0A1628` at 50% opacity), border `border-white/[0.04]`.
  * *Options Cards*: Background `bg-bg-card/40`, border `border-white/[0.03]`.
