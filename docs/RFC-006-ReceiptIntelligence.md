# RFC-006: Receipt Intelligence Engine

## Purpose
Integrates visual OCR analysis to parse utility bills, supermarket checkout receipts, or travel tickets into carbon values automatically.

## Inputs
- Image file binary buffer
- MimeType details

## Outputs
- Standard parsed item array
- Calculated carbon estimates per item
- Confidence rating

## Algorithms
- Gemini multimodal query prompts specifying a strict JSON return template.
- Fallback schema parsers validating response syntax.

## Data Flow
```
Uploaded Image ──> Base64 Conversion ──> Gemini Vision API Call ──> Schema Validation ──> Form Confirm
```

## Dependencies
- `@carbonsense/core`
- `@carbonsense/shared-types`
- `@carbonsense/ai-orchestration`

## Future Extensions
- Client-side compression and local image optimization before transmission.
