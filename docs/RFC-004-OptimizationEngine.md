# RFC-004: Optimization Engine

## Purpose
Formulates carbon footprint reduction recommendations as a multi-objective optimization problem, selecting plans with the highest savings and lowest friction.

## Inputs
- `UserProfile` target goals
- Commits and active/skipped logs
- Behavior patterns

## Outputs
- Ranked `OptimizationPlan[]` options (with cost, savings, difficulty, and category tags)

## Algorithms
- Multi-criteria decision analysis (MCDA) weighing `Savings / (Difficulty * CostFactor)`.
- Recommender filtering based on user constraints.

## Data Flow
```
User Emission Inefficiencies ──> MCDA Matrix Scoring ──> Ranked Reduction Tasks
```

## Dependencies
- `@carbonsense/core`
- `@carbonsense/shared-types`

## Future Extensions
- Dynamic feedback loop updating difficulty score if the user skips a recommendation multiple times.
