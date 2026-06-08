# RFC-003: Forecast Engine

## Purpose
Generates time-series projections of carbon output under business-as-usual vs. reduction goal paths.

## Inputs
- `UserProfile`
- `CarbonEntry[]` historical records
- `ForecastScenario` variables (simulating target lifestyle shifts)

## Outputs
- `CarbonPrediction[]` (containing predicted date, value, confidence, and primary factors)

## Algorithms
- Multi-horizon time-series regression algorithms (weighted averages, seasonal adjustments).
- Scenario modifier delta calculations.

## Data Flow
```
History Logs + Scenarios ──> generateForecast() ──> Future prediction arrays
```

## Dependencies
- `@carbonsense/core`
- `@carbonsense/shared-types`

## Future Extensions
- ML auto-regression networks built with TensorFlow.js.
