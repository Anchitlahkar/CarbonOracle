# RFC-002: Behavior Intelligence Engine

## Purpose
Identifies structural consumption habits, negative carbon spikes, and recurring lifestyles to trigger high-impact behavioral interventions.

## Inputs
- `CarbonEntry[]` logs over multiple days
- Profile baseline variables

## Outputs
- `BehaviorPattern[]` list (containing detected frequency, description, and impact metrics)
- String arrays listing categorized risk alerts

## Algorithms
- Pattern matching logic evaluating sliding time windows (e.g. standard deviation checks for weekly beef intake).
- Inefficiency heuristics scoring relative commute modes.

## Data Flow
```
DB entries ──> Periodical scan job ──> Pattern detection rules ──> Active notifications
```

## Dependencies
- `@carbonsense/core`
- `@carbonsense/shared-types`

## Future Extensions
- Sequence prediction to flag carbon intensive choices before they occur.
