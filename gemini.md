
# Gemini CLI Context for AutoCrate

This document provides context for the Gemini CLI to understand the AutoCrate project.

## Project Overview

- **Project Name:** autocrate
- **Description:** (Please provide a brief description of the project, its purpose, and its main features.)

## Tech Stack

The project is a Next.js application built with TypeScript and React. Other key technologies include:

- **UI Framework:** Radix UI, Tailwind CSS
- **3D Rendering:** Three.js, @react-three/fiber, @react-three/drei
- **State Management:** Zustand
- **Form Handling:** react-hook-form
- **Styling:** tailwind-merge, clsx
- **Animation:** framer-motion

## Scripts

The following scripts are available in `package.json`:

- `dev`: Starts the development server.
- `build`: Creates a production build.
- `start`: Starts the production server.
- `lint`: Lints the codebase.
- `type-check`: Checks for TypeScript errors.
- `format`: Formats the code with Prettier.
- `test`: Runs all tests with Vitest.
- `e2e`: Runs end-to-end tests with Playwright.
- `deploy`: Deploys the application to Vercel.

## Project Structure

- `src/app`: Main application pages and layouts.
- `src/components`: Reusable React components.
- `src/lib`: Utility functions.
- `src/services`: Application services, such as the NX generator.
- `src/store`: Zustand stores for state management.
- `src/styles`: Global styles and design tokens.
- `src/types`: TypeScript type definitions.
- `src/utils`: Utility functions.
- `tests`: Test files, organized by unit, integration, and e2e.

## Testing

The project uses Vitest for unit and integration tests and Playwright for end-to-end tests.

- `npm run test`: Runs all tests.
- `npm run test:unit`: Runs unit tests.
- `npm run test:integration`: Runs integration tests.
- `npm run e2e`: Runs end-to-end tests.
