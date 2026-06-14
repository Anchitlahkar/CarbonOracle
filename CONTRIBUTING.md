# Contributing to CarbonSense X

First off, thank you for considering contributing to CarbonSense. 

CarbonSense is a domain-driven monorepo utilizing strict typing and modular architecture. This guide will help you understand our contribution workflow.

## Development Environment Setup

1. **Prerequisites**
   - Node.js >= 20.0
   - npm >= 10.0
   - Git
   - Supabase CLI (Optional, for local DB development)
   - **Google Antigravity / Gemini CLI** (Recommended for AI-assisted engineering and architectural compliance)

2. **Installation**
   ```bash
   git clone https://github.com/anchit-sharma/carbonsense.git
   cd carbonsense
   npm install
   ```

3. **Environment Variables**
   Copy the respective `.env.example` files to `.env` in both `frontend/` and `backend/`. You will need a Supabase project and a Gemini API Key to run the backend locally.

## Project Structure

CarbonSense is divided into loosely coupled packages to ensure mathematical integrity:

- `frontend/`: The React + Vite application.
- `backend/`: The Express API and Supabase proxy.
- `packages/*-engine/`: Deterministic TypeScript modules that handle complex domain math (e.g., MCDA scoring, Forecast generation).

## Guidelines for Pull Requests

1. **Modular Engine Changes**: 
   If you are changing how carbon is calculated, how forecasts are built, or how optimizations are ranked, you MUST make changes within the `packages/` directory, **not** the frontend or backend.
2. **Deterministic Math Over AI**:
   Never use the Gemini API to perform floating-point calculations. AI is strictly for parsing (Receipts) and semantic reasoning (TERRA Coach). All mathematical logic resides in the TypeScript engines.
3. **Tests**:
   All new functions within the `packages/` engines must have accompanying unit tests. Run `npm test` inside the specific package before submitting your PR.
4. **Formatting**:
   We use ESLint and Prettier. Ensure `npm run lint` passes without errors.

## Antigravity CLI Integration

CarbonSense was heavily developed using the Google Antigravity / Gemini CLI framework. When contributing, you can leverage the local `.agents/skills` to assist you. 

```bash
# Example usage to ensure your code aligns with our architectural standards
gemini "Review my changes against the CarbonSense Architect skill"
```

## Creating a Branch

1. Create your feature branch from `main`: `git checkout -b feature/my-new-feature`
2. Commit your changes: `git commit -m "feat(engine): add new carbon dimension"`
3. Push to the branch: `git push origin feature/my-new-feature`
4. Open a Pull Request.

Please provide a clear description of the problem solved and link any relevant open issues.
