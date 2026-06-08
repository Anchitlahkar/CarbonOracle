# docs/ENGINE_OVERVIEW.md

This document outlines the high-level responsibilities and boundaries of the 7 CarbonSense X Intelligence Engines.

---

## 1. Carbon Science Engine (`carbon-science-engine`)
- **Responsibility**: Houses core greenhouse gas emission factor databases, calculates user footprints per logged action, aggregates daily totals, and maps emissions against global target baselines (e.g. Paris Agreement 3kg/day target).
- **Core Interface**: `CarbonScienceEngine`

---

## 2. Behavior Intelligence Engine (`behavior-intelligence-engine`)
- **Responsibility**: Performs pattern matching on user logs to capture repeat carbon spikes, commutes, or dietary frequencies, reporting negative habits or structural lifestyle footprint risks.
- **Core Interface**: `BehaviorIntelligenceEngine`

---

## 3. Forecast Engine (`forecast-engine`)
- **Responsibility**: Models emissions history to predict 30-day, 90-day, and yearly carbon metrics, calculating scenario simulations.
- **Core Interface**: `ForecastEngine`

---

## 4. Optimization Engine (`optimization-engine`)
- **Responsibility**: Generates recommended actions to reduce footprint, ordering items by cost, ease of adjustment, and total footprint impact.
- **Core Interface**: `OptimizationEngine`

---

## 5. Carbon DNA Engine (`carbon-dna-engine`)
- **Responsibility**: Evaluates the user's primary emissions category and behavioral score to assign a carbon classification signature profile.
- **Core Interface**: `CarbonDNAEngine`

---

## 6. Receipt Intelligence Engine (`receipt-intelligence-engine`)
- **Responsibility**: Scans invoices, utility bills, and shopping receipts via AI model parsing, mapping parsed items back into standard emissions types.
- **Core Interface**: `ReceiptIntelligenceEngine`

---

## 7. Planet Twin Engine (`planet-twin-engine`)
- **Responsibility**: Maps individual metrics into simulated climate impacts (PPM rise, temperature scale, and glacier melting), projecting user decisions onto a virtual earth state.
- **Core Interface**: `PlanetTwinEngine`
