# Testing & Quality Assurance

CarbonSense utilizes a strict testing regime to ensure the mathematical and behavioral validity of its carbon engines. Because the application combines deterministic calculations with AI logic, testing boundaries are rigidly enforced.

## 1. Unit Tests

Unit tests are written using **Vitest** and are co-located within the respective engine packages. We verify individual calculation layers before they are aggregated into the user profile.

- **Current Coverage**: 258 passing tests.
- **Framework**: Vitest (for execution speed and native TypeScript support).

### Package Coverage Breakdown
- `@carbonsense/planet-twin-engine`: 58 tests
- `@carbonsense/carbon-dna-engine`: 54 tests
- `@carbonsense/optimization-engine`: 47 tests
- `@carbonsense/forecast-engine`: 36 tests
- `@carbonsense/behavior-intelligence-engine`: 32 tests
- `@carbonsense/carbon-science-engine`: 28 tests
- `@carbonsense/receipt-intelligence-engine`: 3 tests
- `frontend/src/lib/carbon-selectors`: 5 tests

## 2. Critical Validation Paths

Carbon tracking software must be highly reliable. We enforce tests around:
1. **Zero / Edge Case Inputs**: Verifying that zero-activity days do not cause division-by-zero errors in the Forecast Engine.
2. **Confidence Degradation**: Validating that behavioral signals decay in confidence over time if not refreshed (Behavior Engine).
3. **MCDA Ranking Accuracy**: Asserting that the Optimization Engine correctly ranks high-impact, low-difficulty actions above low-impact, high-difficulty ones.

## 3. Awareness Layer Validation

The newly added **Carbon Awareness Layer** acts as the primary data presentation surface.
- Tests in `carbon-selectors.test.ts` validate that the `selectPrimaryCategoryRatio` and `formatCategoryRatioText` accurately parse complex DNA matrices.
- This ensures the UI never misrepresents the user's primary footprint contributor.

## 4. E2E and UI Component Tests

End-to-End flows are monitored to ensure the Evaluator Journey remains intact:
- **Sandbox Hydration**: Verification that the `/demo` route successfully loads `demoData.ts` without triggering unauthenticated API calls.
- **Data Rendering**: The Recharts graphs and React Three Fiber planets are tested visually via smoke tests to ensure context boundaries correctly provide React hooks with state variables.
