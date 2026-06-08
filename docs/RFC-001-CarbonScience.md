# RFC-001: Carbon Science Engine

## Purpose
Establishes the core calculation metrics mapping human activities (transport, diet, residential energy, shopping) directly to greenhouse gas equivalents (kg CO2e).

## Inputs
- `CarbonEntry` properties (category, subCategory, quantity, unit)
- Historical entries for averages

## Outputs
- Carbon footprint values (number)
- Footprint ratings and 0-100 scores
- Aggregated category breakdown maps

## Algorithms
- Linear product multiplier: `Emissions = Quantity * EmissionFactor`
- Scale-normalization rating algorithms for daily scores

## Data Flow
```
User Log Entry ──> Form Validation ──> calculateCarbon() ──> DB Save
```

## Dependencies
- `@carbonsense/core`
- `@carbonsense/shared-types`

## Future Extensions
- Dynamic local emission factors matching user postal code grid coefficients.
