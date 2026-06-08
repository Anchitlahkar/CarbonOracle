# RFC-007: Planet Twin Engine

## Purpose
Simulates micro-planetary health state projections dynamically corresponding to the user's carbon choices.

## Inputs
- `CarbonEntry[]` logs
- Previous `SimulationState` baseline

## Outputs
- `SimulationState` (including temperature delta, parts per million carbon concentration, and forest cover index)

## Algorithms
- Differential equation mapping emissions to warming indices: `dT = Alpha * ln(PPM / BasePPM)`.
- Decay functions for glacier/forest thresholds.

## Data Flow
```
Individual Logs ──> Emission Aggregates ──> Planetary Health Equation ──> R3F 3D Sphere Renderer
```

## Dependencies
- `@carbonsense/core`
- `@carbonsense/shared-types`

## Future Extensions
- Shared community aggregates driving the shared multi-user globe heatmap representation.
