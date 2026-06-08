# RFC-005: Carbon DNA Engine

## Purpose
Classifies users dynamically based on their primary carbon drivers, establishing a tailored carbon baseline profile for behavioral targeting.

## Inputs
- `UserProfile` attributes
- `CarbonEntry[]` historical records

## Outputs
- `CarbonDNAProfile` metrics (personas like *High Flyer*, *Eco Champion*, *Heavy Commuter*, etc.)

## Algorithms
- Ratio clustering classifying maximum categories.
- Score-weighted profiling algorithms mapping averages to ratings.

## Data Flow
```
User History ──> Category Ratio Evaluator ──> DNA Profile Mapping ──> Carbon Persona
```

## Dependencies
- `@carbonsense/core`
- `@carbonsense/shared-types`

## Future Extensions
- Unsupervised clustering (K-Means) on similar user cohorts to detect new personas.
