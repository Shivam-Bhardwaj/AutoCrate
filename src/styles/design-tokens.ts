/**
 * Design Tokens for AutoCrate
 * Centralized design system configuration
 */

export const designTokens = {
  // Color Palette - Industrial Theme
  colors: {
    // Primary Colors - Wood/Industrial Browns
    primary: {
      50: '#fdf8f6',
      100: '#f2e8e5',
      200: '#e7d6d0',
      300: '#d2b6a8',
      400: '#b89079',
      500: '#8b4513', // Saddle Brown - Main brand color
      600: '#7a3f11',
      700: '#65350f',
      800: '#4d2a0c',
      900: '#3a1f09',
      950: '#1f0f04',
    },

    // Secondary Colors - Steel/Metal Grays
    secondary: {
      50: '#f8f9fa',
      100: '#f1f3f5',
      200: '#e9ecef',
      300: '#dee2e6',
      400: '#ced4da',
      500: '#adb5bd',
      600: '#868e96',
      700: '#495057',
      800: '#343a40',
      900: '#212529',
      950: '#0a0c0e',
    },

    // Accent Colors - Safety Orange
    accent: {
      50: '#fff4ed',
      100: '#ffe6d5',
      200: '#ffc9a5',
      300: '#ffa66c',
      400: '#ff7c2e',
      500: '#ff5722', // Safety Orange
      600: '#f84c16',
      700: '#cc3a0e',
      800: '#a12c0b',
      900: '#7a2108',
      950: '#4d1405',
    },

    // Success/Error/Warning/Info
    success: {
      light: '#4ade80',
      main: '#22c55e',
      dark: '#16a34a',
      contrast: '#ffffff',
    },
    error: {
      light: '#f87171',
      main: '#ef4444',
      dark: '#dc2626',
      contrast: '#ffffff',
    },
    warning: {
      light: '#fbbf24',
      main: '#f59e0b',
      dark: '#d97706',
      contrast: '#000000',
    },
    info: {
      light: '#60a5fa',
      main: '#3b82f6',
      dark: '#2563eb',
      contrast: '#ffffff',
    },

    // Background Colors
    background: {
      default: '#ffffff',
      paper: '#f8f9fa',
      dark: '#1a1a1a',
    },

    // Text Colors
    text: {
      primary: '#212529',
      secondary: '#6c757d',
      disabled: '#adb5bd',
      hint: '#ced4da',
      inverse: '#ffffff',
    },

    // Divider
    divider: 'rgba(0, 0, 0, 0.12)',
  },

  // Typography
  typography: {
    fontFamily: {
      sans: 'Inter, system-ui, -apple-system, sans-serif',
      mono: 'JetBrains Mono, Monaco, Consolas, monospace',
      display: 'Cal Sans, Inter, sans-serif',
    },
    fontSize: {
      xs: '0.75rem', // 12px
      sm: '0.875rem', // 14px
      base: '1rem', // 16px
      lg: '1.125rem', // 18px
      xl: '1.25rem', // 20px
      '2xl': '1.5rem', // 24px
      '3xl': '1.875rem', // 30px
      '4xl': '2.25rem', // 36px
      '5xl': '3rem', // 48px
    },
    fontWeight: {
      light: 300,
      regular: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      extrabold: 800,
    },
    lineHeight: {
      none: 1,
      tight: 1.25,
      snug: 1.375,
      normal: 1.5,
      relaxed: 1.625,
      loose: 2,
    },
  },

  // Spacing
  spacing: {
    0: '0',
    1: '0.25rem', // 4px
    2: '0.5rem', // 8px
    3: '0.75rem', // 12px
    4: '1rem', // 16px
    5: '1.25rem', // 20px
    6: '1.5rem', // 24px
    8: '2rem', // 32px
    10: '2.5rem', // 40px
    12: '3rem', // 48px
    16: '4rem', // 64px
    20: '5rem', // 80px
    24: '6rem', // 96px
    32: '8rem', // 128px
  },

  // Border Radius
  borderRadius: {
    none: '0',
    sm: '0.125rem', // 2px
    base: '0.25rem', // 4px
    md: '0.375rem', // 6px
    lg: '0.5rem', // 8px
    xl: '0.75rem', // 12px
    '2xl': '1rem', // 16px
    '3xl': '1.5rem', // 24px
    full: '9999px',
  },

  // Shadows
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    base: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
    '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
    none: 'none',
  },

  // Breakpoints
  breakpoints: {
    xs: '475px',
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },

  // Z-Index Scale
  zIndex: {
    drawer: 1200,
    modal: 1300,
    popover: 1400,
    tooltip: 1500,
    toast: 1600,
  },

  // Animation
  animation: {
    duration: {
      instant: '0ms',
      fast: '150ms',
      base: '250ms',
      slow: '350ms',
      slower: '500ms',
    },
    easing: {
      linear: 'linear',
      in: 'cubic-bezier(0.4, 0, 1, 1)',
      out: 'cubic-bezier(0, 0, 0.2, 1)',
      inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
      elastic: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    },
  },

  // Component Specific Tokens
  components: {
    button: {
      height: {
        sm: '32px',
        md: '40px',
        lg: '48px',
      },
      padding: {
        sm: '0 12px',
        md: '0 16px',
        lg: '0 24px',
      },
    },
    input: {
      height: {
        sm: '32px',
        md: '40px',
        lg: '48px',
      },
      borderWidth: '1px',
    },
    card: {
      padding: '24px',
      borderRadius: '8px',
      shadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
    },
  },
};

// Type-safe token getter functions
export const getColor = (path: string): string => {
  const keys = path.split('.');
  let value: any = designTokens.colors;

  for (const key of keys) {
    value = value[key];
    if (!value) return '#000000';
  }

  return value as string;
};

export const getSpacing = (key: keyof typeof designTokens.spacing): string => {
  return designTokens.spacing[key];
};

export const getFontSize = (key: keyof typeof designTokens.typography.fontSize): string => {
  return designTokens.typography.fontSize[key];
};

export const getBorderRadius = (key: keyof typeof designTokens.borderRadius): string => {
  return designTokens.borderRadius[key];
};

export const getShadow = (key: keyof typeof designTokens.shadows): string => {
  return designTokens.shadows[key];
};

// CSS Variables Generator
export const generateCSSVariables = (): string => {
  const cssVars: string[] = [':root {'];

  // Colors
  Object.entries(designTokens.colors).forEach(([category, values]) => {
    if (typeof values === 'object') {
      Object.entries(values).forEach(([key, value]) => {
        if (typeof value === 'string') {
          cssVars.push(`  --color-${category}-${key}: ${value};`);
        }
      });
    }
  });

  // Spacing
  Object.entries(designTokens.spacing).forEach(([key, value]) => {
    cssVars.push(`  --spacing-${key}: ${value};`);
  });

  // Typography
  Object.entries(designTokens.typography.fontSize).forEach(([key, value]) => {
    cssVars.push(`  --font-size-${key}: ${value};`);
  });

  // Border Radius
  Object.entries(designTokens.borderRadius).forEach(([key, value]) => {
    cssVars.push(`  --radius-${key}: ${value};`);
  });

  // Shadows
  Object.entries(designTokens.shadows).forEach(([key, value]) => {
    cssVars.push(`  --shadow-${key}: ${value};`);
  });

  cssVars.push('}');
  return cssVars.join('\n');
};

export default designTokens;
