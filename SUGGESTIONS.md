# Project Suggestions

This document provides suggestions to enhance the AutoCrate project's security, stability, and maintainability, based on the planned UI/feature overhaul.

## 🛡️ Security

1.  **Dependency Auditing**:
    *   **Suggestion**: Regularly run `npm audit` to check for vulnerabilities in the project's dependencies, especially after adding new ones like `katex`, `jspdf`, and `xlsx`.
    *   **Reason**: New packages can introduce known vulnerabilities. Since `dependabot.yml` is already configured, ensure its alerts are monitored and addressed promptly.

2.  **Input Sanitization for Exporters**:
    *   **Suggestion**: Before passing data to the `jspdf` and `xlsx` libraries for export, strictly validate and sanitize all user-provided inputs (e.g., crate dimensions, configuration details).
    *   **Reason**: Maliciously crafted large inputs could potentially lead to denial-of-service (DoS) by crashing the user's browser tab. Implement size and value range limits on all inputs.

3.  **3D Scene Input Clamping**:
    *   **Suggestion**: Clamp and validate any user-configurable values that directly influence the 3D scene rendering in `CrateViewer3D.tsx`.
    *   **Reason**: Extreme or invalid values (e.g., negative dimensions, excessively large numbers) could cause rendering errors, performance degradation, or unexpected visual artifacts.

4.  **Secure API Development Practices**:
    *   **Suggestion**: For the future REST API, plan to use Next.js API Routes with input validation libraries like `zod`. Also, consider security middleware like `helmet` for setting secure HTTP headers.
    *   **Reason**: Proactively planning for API security will prevent common vulnerabilities like XSS, CSRF, and insecure direct object references when you begin implementation.

## 🐛 Potential Bugs & Performance Issues

1.  **3D Rendering Performance**:
    *   **Suggestion**: Profile the `CrateViewer3D` component after adding the new features (individual floorboards, axes, hover effects, exploded views). Use the React DevTools Profiler and browser performance tools to ensure the 60 FPS target is met.
    *   **Reason**: The complexity of the 3D scene is increasing significantly. This is a high-risk area for performance bottlenecks. Consider using `React.memo` on expensive components and dynamically importing parts of the 3D view with `next/dynamic` to reduce initial load.

2.  **State Management Consistency**:
    *   **Suggestion**: As the UI is refactored, ensure that all new components correctly use the existing Zustand stores (`crate-store`, `theme-store`, `logs-store`). Be mindful of race conditions or inconsistent state when multiple actions are triggered.
    *   **Reason**: Large refactors can easily lead to bugs where the UI and the state fall out of sync. Centralizing state logic in the stores and testing interactions thoroughly is crucial.

3.  **Calculation Logic Integrity**:
    *   **Suggestion**: Create comprehensive unit tests for the new `engineeringCalculations.ts` service. Add integration tests that verify its outputs work correctly with the `floorboard-calculations` and `skid-calculations` services.
    *   **Reason**: The application's core value lies in its calculations. Bugs here can have significant consequences. Tests should cover edge cases (e.g., zero or extreme dimensions, heavy weights) to ensure robustness.

4.  **Next.js Hydration Errors**:
    *   **Suggestion**: Be vigilant for hydration mismatch errors, especially with the new client-side features like 3D view controls and the `react-katex` formulas. Use `useEffect` to run browser-only logic and `next/dynamic` with `ssr: false` for components that do not need to be server-rendered.
    *   **Reason**: The `TODO.md` already notes a hydration-safe timestamp. This indicates it's a known area of concern. The new interactive features increase this risk.

## ✨ General Good Practices

1.  **Centralize Constants**:
    *   **Suggestion**: The code snippets in `TODO.md` contain "magic numbers" (e.g., `scaleFactor = 25.4`, `thickness = 0.038`). Move these to a central, well-documented file like `src/lib/constants.ts`.
    *   **Reason**: This improves readability and makes the values easier to manage and update in the future, as they are defined in a single place.

2.  **Component Granularity**:
    *   **Suggestion**: Break down the new, complex components outlined in the `TODO.md` (like `EngineeringTab.tsx` and `CrateViewer3D.tsx`) into smaller, single-purpose sub-components.
    *   **Reason**: Smaller components are easier to understand, test, and reuse. This will improve the long-term maintainability of the codebase.

3.  **Enforce Type Safety**:
    *   **Suggestion**: Continue the excellent practice of "No `any` type". Create detailed TypeScript interfaces in `src/types/` for all new data structures, including the return types for the `EngineeringCalculator` service and the props for the new UI components.
    *   **Reason**: Strong typing is one of the project's main advantages. It prevents entire classes of bugs and makes the code self-documenting.

4.  **Establish Environment Variable Conventions**:
    *   **Suggestion**: Create a `.env.example` file in the root directory to document the environment variables needed for local development, even if none are required right now.
    *   **Reason**: As the project grows to include an API or other services, you will need environment variables. Establishing the convention now makes onboarding new developers easier.