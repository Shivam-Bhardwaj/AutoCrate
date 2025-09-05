# AutoCrate Project TODOs

This document outlines the prioritized tasks for improving the AutoCrate project.

## High Priority

- **[Security] Dependency Audit:**
  - Run `npm outdated` to identify and update stale dependencies.
  - Run `npm audit` to check for and fix security vulnerabilities.

- **[UX] Implement Loading and Error States:**
  - Create skeleton loaders for a better perceived performance.
  - Implement user-friendly error messages for all data-fetching and form submission operations.

- **[UX] Improve Form Feedback:**
  - Create a `FormField` component that wraps `Input` and includes a `Label`, error message, and helper text.

- **[Accessibility] Enhance Accessibility Testing:**
  - Integrate accessibility audits (`axe-core` or `pa11y`) into the CI/CD pipeline to catch issues automatically.

## Medium Priority

- **[Performance] Bundle Size Analysis:**
  - Integrate `@next/bundle-analyzer` to visualize and optimize the webpack bundle.

- **[Code Quality] Refactor `CrateViewer3D`:**
  - Break down the `CrateModel` component into smaller, more focused components (`Skids`, `Panels`, `Floor`).

- **[Code Quality] Centralize Logging:**
  - Create a logging service to manage logs from a single point and configure different outputs for different environments.

- **[UI] Enhance Button Component:**
  - Add a `loading` prop to show a spinner during async operations.
  - Add support for icons.

- **[UI] Enhance Card Component:**
  - Add interactive states (hover, focus-within).
  - Introduce variants (`default`, `flat`, `bordered`).

- **[UI] Responsive Typography:**
  - Use Tailwind's responsive design features to adjust font sizes for different breakpoints.

- **[UI] Design Empty States:**
  - Create informative and visually appealing empty states for components that display data.

## Low Priority

- **[Code Quality] Improve Code Clarity:**
  - Replace "magic numbers" with named constants.

- **[DX] Add JSDoc Comments:**
  - Add JSDoc comments to all components, functions, and types to improve code clarity and developer experience.

- **[DX] Implement Storybook:**
  - Use Storybook to create an interactive component library for your UI components.

- **[DX] Enhance CI/CD Pipeline:**
  - Add checks for bundle size and performance budgets to the CI pipeline.

- **[UI] Add Micro-interactions:**
  - Use `framer-motion` to add subtle animations and transitions to UI elements.

- **[UI] Expand Theming Capabilities:**
  - Expose more theme variables for spacing, border radius, etc., for easier customization.

- **[DX] Automate Tailwind Class Sorting:**
  - Use the `prettier-plugin-tailwindcss` plugin to automatically sort Tailwind CSS classes.
