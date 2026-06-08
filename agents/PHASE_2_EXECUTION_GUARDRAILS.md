# PHASE_2_EXECUTION_GUARDRAILS.md

## Objective

Implement the Carbon Science Engine as a research-grade scientific calculation system.

The goal is NOT to build a carbon calculator.

The goal is to build a verifiable, auditable, explainable carbon calculation platform.

---

# Mandatory Rules

## Rule 1

Emission factors must NEVER be hardcoded inside engine logic.

All scientific data must come from:

@carbonsense/knowledge-base

Engine code must remain data-driven.

---

## Rule 2

Every calculation must be reproducible.

A calculation result must contain:

* value
* lowerBound
* upperBound
* confidenceScore
* methodologyVersion
* sourceIdentifier
* audit

No exceptions.

---

## Rule 3

Confidence and uncertainty are separate concepts.

Do NOT calculate uncertainty from confidence.

Use:

uncertaintyPercent

stored directly inside emission factors.

---

## Rule 4

Every emission factor must contain:

* id
* category
* subCategory
* value
* source
* sourceYear
* version
* confidence
* uncertaintyPercent
* validFrom
* validTo (optional)
* references

---

## Rule 5

Scientific references must be first-class objects.

Create:

ScientificReference

with:

* id
* title
* organization
* publicationYear
* citation
* doi (optional)
* url (optional)

---

## Rule 6

The engine must generate factor-selection reasoning.

Example:

"Country-specific factor selected for India electricity grid."

or

"No country override available. Global default factor applied."

This reasoning becomes part of CalculationAudit.

---

## Rule 7

All calculations must generate an audit trail.

Audit must include:

* factor selected
* source used
* methodology used
* conversion path
* fallback usage
* country override usage
* timestamp

---

## Rule 8

Expired factors must not be silently used.

Engine must:

* reject expired factors

or

* explicitly report fallback behavior

---

## Rule 9

No UI work.

No React work.

No Dashboard work.

No Three.js work.

No API routes.

No Gemini integration.

Only Carbon Science Engine work is permitted.

---

# Testing Requirements

Coverage Target:

90%+

Required Test Areas:

1. Valid factors
2. Invalid factors
3. Missing factors
4. Expired factors
5. Country overrides
6. Country fallbacks
7. Unit conversions
8. Validation failures
9. Audit generation
10. Methodology loading
11. Scientific reference loading
12. Uncertainty calculations

---

# Success Criteria

The following example must work:

Input:

Transport
Petrol Car
100 km
Country IN

Output:

* Carbon value
* Confidence score
* Uncertainty range
* Scientific source
* Methodology version
* Audit trail
* Factor selection reasoning

If any of these fields are missing,
Phase 2 is incomplete.
