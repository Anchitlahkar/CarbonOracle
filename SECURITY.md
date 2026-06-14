# Security Controls

CarbonSense is built on a Zero-Trust principle, isolating deterministic computation from LLM interpretation, and strictly walling off development sandbox environments from production databases.

## 1. Authentication & JWT Validation

All user identity management is handled natively by **Supabase Auth**.

- **Tokens**: Clients receive short-lived JWTs stored via browser memory and secure context layers.
- **Middleware**: Every protected route in the Express/Node.js backend must pass through `authMiddleware.ts`.
- **Validation**: The backend extracts the Bearer token and verifies the cryptographic signature directly against the Supabase instance before proceeding to any route logic.

## 2. Row-Level Security (RLS)

The Supabase PostgreSQL database implements strict Row-Level Security.

- Even if the backend service key were compromised, queries executed on behalf of a user (`supabase.auth.uid()`) can only ever select, update, or delete rows where `user_id` matches the authenticated identity.

## 3. Secret Management & Key Isolation

- **Client Keys**: Only the `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are exposed to the Vite build process.
- **Server Keys**: `SUPABASE_SERVICE_KEY` and `GEMINI_API_KEY` reside exclusively in the backend `.env` file and are never sent to the client.
- **AI Access**: The `geminiService.ts` module is the single point of entry for the Gemini API.

## 4. Environment Separation & Demo Isolation

To support evaluation during PromptWars without requiring live PII or creating database junk, a robust **Demo Isolation** layer exists.

- When a user accesses the `/demo` route, the application intercepts the standard Supabase data-fetching lifecycle.
- It instead loads an immutable, statically typed JSON payload from `demoData.ts` directly into the Zustand memory store.
- **Threat Mitigation**: This prevents bot traffic or automated evaluators from filling the production database with mock activity logs.

## 5. Threat Mitigations

| Threat | Mitigation Strategy |
| :--- | :--- |
| **Prompt Injection** | LLM inputs are rigidly structured. Output is required in strict JSON format parsed by Zod. The LLM has zero execution privileges on the backend. |
| **AI Math Hallucination** | The AI is banned from calculating carbon math. It only extracts data (e.g. receipt items). The actual kg CO2e is computed via exact floating-point math in the `@carbonsense/carbon-science-engine`. |
| **Mass Data Exfiltration** | Database queries are paginated by default. RLS restricts payloads to the individual user. |
| **DDoS Attacks** | Rate-limiting middleware is applied to the Gemini `/scanner` and `/coach` endpoints to prevent runaway token usage. |
| **File Upload Exploits** | The Receipt Scanner only accepts images, parses them entirely in-memory as Base64 Buffers via `multer`, and never writes temp files to disk, eliminating directory traversal vulnerabilities. |
