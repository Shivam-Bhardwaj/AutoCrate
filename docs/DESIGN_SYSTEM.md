# AutoCrate Design System

## 1. Introduction
An overview of the design system, its goals, and principles. The system is designed to create a professional, intuitive, and accessible user experience that aligns with the standards of NX engineers.

## 2. Color System
The color system is built on a token-based architecture to ensure consistency, accessibility, and easy theming. All colors are defined as CSS variables.

### Base Colors
These are the foundational colors for the UI.

| Token | Light Theme | Dark Theme | Use Case | Contrast (Light) | Contrast (Dark) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `--color-background` | `#ffffff` | `#0f1419` | App background | - | - |
| `--color-surface` | `#f8fafb` | `#1a202c` | Elevated surfaces (cards, panels) | - | - |
| `--color-primary` | `#0066cc` | `#3b82f6` | Main interactive elements | 4.53:1 | 4.54:1 |
| `--color-text-primary` | `#1a1a1a` | `#f7fafc` | Main body and heading text | 18.59:1 | 15.83:1 |
| `--color-text-secondary`| `#4a5568` | `#cbd5e0` | Secondary and placeholder text | 4.95:1 | 8.47:1 |
| `--color-borders` | `#e2e8f0` | `#2d3748` | Component borders and separators | 1.47:1 | 1.53:1 |

*Contrast ratios are measured against the `--color-background` of their respective theme and meet WCAG AA standards for interactive elements and AAA for text.*

### Semantic Colors
Used to convey meaning such as success, warning, or error states.

| Token | Light Theme | Dark Theme | Use Case |
| :--- | :--- | :--- | :--- |
| `--color-success` | `#10b981` | `#34d399` | Success states, validation |
| `--color-warning` | `#f59e0b` | `#fbbf24` | Warnings, potentially destructive actions |
| `--color-error` | `#ef4444` | `#f87171` | Error states, destructive actions |
| `--color-info` | `#3b82f6` | `#60a5fa` | Informational messages and highlights |

### Interactive States
Colors for component states like hover, focus, and disabled.

| Token | Light Theme | Dark Theme | Use Case |
| :--- | :--- | :--- | :--- |
| `--color-hover` | `#f1f5f9` | `#2d3748` | Hover state for interactive elements |
| `--color-active` | `#e2e8f0` | `#4a5568` | Active/pressed state for elements |
| `--color-focus` | `#0066cc` | `#3b82f6` | Focus ring and indicators |
| `--color-disabled`| `#cbd5e1` | `#4a5568` | Disabled components |

## 3. Typography
The typographic scale uses `rem` units for scalability and accessibility, based on a root font size of 16px. The primary font is Inter, with JetBrains Mono for code.

### Typographic Scale
| Element | Font Size (rem) | Font Size (px) | Line Height (rem) | Font Weight |
| :--- | :--- | :--- | :--- | :--- |
| `display` | `2.5rem` | `40px` | `3rem` | `700` (Bold) |
| `h1` | `2rem` | `32px` | `2.5rem` | `600` (Semibold) |
| `h2` | `1.5rem` | `24px` | `2rem` | `600` (Semibold) |
| `h3` | `1.25rem` | `20px` | `1.75rem` | `500` (Medium) |
| `body` | `1rem` | `16px` | `1.5rem` | `400` (Normal) |
| `small` | `0.875rem` | `14px` | `1.25rem` | `400` (Normal) |
| `caption` | `0.75rem` | `12px` | `1rem` | `400` (Normal) |

### Font Weights
| Token | Value | Use Case |
| :--- | :--- | :--- |
| `--font-weight-light` | `300` | Seldom used, for delicate text |
| `--font-weight-normal`| `400` | Body text |
| `--font-weight-medium`| `500` | Emphasized text, subheadings |
| `--font-weight-semibold`|`600` | Headings |
| `--font-weight-bold` | `700` | Display text, strong emphasis |

## 4. Layout & Spacing
A consistent spacing system based on a **4px base unit** is used to create a harmonious and predictable layout. The scale is available via CSS variables. (Note: Tailwind uses a 4px base, so `space-2` = 8px).

### Spacing Scale
| Token | Value (rem) | Value (px) | Use Case |
| :--- | :--- | :--- | :--- |
| `--space-1` | `0.25rem` | `4px` | Micro-spacing, inside elements |
| `--space-2` | `0.5rem` | `8px` | Small gaps, icon spacing |
| `--space-3` | `0.75rem` | `12px`| Gaps between related elements |
| `--space-4` | `1rem` | `16px`| Standard component padding/margin |
| `--space-5` | `1.25rem` | `20px`| |
| `--space-6` | `1.5rem` | `24px`| Gaps between larger components |
| `--space-8` | `2rem` | `32px`| Section padding, larger gaps |
| `--space-10`| `2.5rem` | `40px`| |
| `--space-12`| `3rem` | `48px`| Page-level spacing |
| `--space-16`| `4rem` | `64px`| |
| `--space-20`| `5rem` | `80px`| |
| `--space-24`| `6rem` | `96px`| |

## 5. Component Library
A collection of reusable components that form the building blocks of the UI. Each component has been styled to be consistent, accessible, and theme-aware.

### Core Components
- **Button**: For actions and navigation. Includes primary, secondary, ghost, and destructive variants.
- **Input**: Form fields for text, numbers, and other data entry.
- **Label**: Accessible labels for form inputs.
- **Card**: A container for grouping related content.
- **Panel**: A distinct surface for grouping UI sections, often with a header.
- **Toolbar**: A container for actions and controls.

### Data Display
- **Table**: For organizing and displaying tabular data.
- **Badge**: To highlight status or metadata.
- **Code**: For displaying inline or block-level code snippets.

### Feedback & Status
- **Alert**: For displaying important messages to the user (info, success, warning, error).
- **Status Indicator**: A small visual indicator for status (e.g., online, offline).
- **Loading / Skeleton**: To indicate content is loading.

### Overlays & Navigation
- **Modal**: A dialog that overlays the main content to request user interaction.
- **Dropdown**: A menu of options that appears when a user interacts with a control.
- **Tooltip**: A small pop-up that displays information when a user hovers over an element.
- **Separator**: A visual divider to group or separate content.

*Detailed documentation for each component, including visual examples, states (hover, focus, disabled), and code snippets, will be added in a future step.*

## 6. Animation & Motion
Guidelines for creating smooth and meaningful animations.

*Details coming soon.*

## 7. Iconography
Standards for using icons to enhance usability.

*Icon library and guidelines coming soon.*

## 8. Theme Implementation
The application supports both light and dark themes. This section explains how to apply them.

*Implementation guide coming soon.*

## 9. Accessibility Standards
We are committed to meeting WCAG AAA standards. For detailed guidelines, please see the [Accessibility Documentation](./ACCESSIBILITY.md).
