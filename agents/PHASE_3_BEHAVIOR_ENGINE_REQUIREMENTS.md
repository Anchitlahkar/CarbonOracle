# PHASE_3_BEHAVIOR_ENGINE_REQUIREMENTS.md

## New Shared Types

BehaviorSignal

Represents a single detected signal.

Examples:

* Frequent Beef Consumption
* High Car Dependency
* Weekend Flight Pattern
* High Shopping Frequency

Fields:

id
type
strength
confidence
detectedAt

---

BehaviorProfile

Represents current behavioral state.

Fields:

userId

signals[]

dominantBehavior

behaviorScore

riskScore

lastUpdated

---

BehaviorTrend

Represents changes over time.

Fields:

trendType

direction

confidence

timeWindow

changePercent

generatedAt
