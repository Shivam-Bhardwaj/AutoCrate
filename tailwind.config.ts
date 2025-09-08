import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      fontFamily: {
        sans: ['var(--font-family-sans)'],
        mono: ['var(--font-family-mono)'],
      },
      colors: {
        // Base colors using design tokens
        background: 'var(--color-background)',
        surface: 'var(--color-surface)',
        primary: 'var(--color-primary)',
        'text-primary': 'var(--color-text-primary)',
        'text-secondary': 'var(--color-text-secondary)',
        borders: 'var(--color-borders)',

        // Semantic colors
        success: 'var(--color-success)',
        warning: 'var(--color-warning)',
        error: 'var(--color-error)',
        info: 'var(--color-info)',

        // Semantic color backgrounds
        'success-bg': 'var(--color-success-bg)',
        'warning-bg': 'var(--color-warning-bg)',
        'error-bg': 'var(--color-error-bg)',
        'info-bg': 'var(--color-info-bg)',

        // Surface variants
        'surface-accent': 'var(--color-surface-accent)',

        // Overlay colors
        'black-overlay': 'var(--color-black-overlay)',

        // Interactive states
        hover: 'var(--color-hover)',
        active: 'var(--color-active)',
        focus: 'var(--color-focus)',
        disabled: 'var(--color-disabled)',

        // Primary color variants
        'primary-hover': 'var(--color-primary-hover)',
        'primary-bg-hover': 'var(--color-primary-bg-hover)',

        // Component specific
        card: 'var(--color-card)',
        input: 'var(--color-input)',
        'button-secondary': 'var(--color-button-secondary)',
        toolbar: 'var(--color-toolbar)',
        sidebar: 'var(--color-sidebar)',

        // Legacy support (keeping existing ones for compatibility)
        border: 'hsl(var(--border))',
        ring: 'hsl(var(--ring))',
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
      },
      fontSize: {
        // Typography scale using design tokens
        'display': ['var(--font-size-display)', {
          lineHeight: 'var(--line-height-display)',
          fontWeight: 'var(--font-weight-bold)',
        }],
        'h1': ['var(--font-size-h1)', {
          lineHeight: 'var(--line-height-h1)',
          fontWeight: 'var(--font-weight-semibold)',
        }],
        'h2': ['var(--font-size-h2)', {
          lineHeight: 'var(--line-height-h2)',
          fontWeight: 'var(--font-weight-semibold)',
        }],
        'h3': ['var(--font-size-h3)', {
          lineHeight: 'var(--line-height-h3)',
          fontWeight: 'var(--font-weight-medium)',
        }],
        'body': ['var(--font-size-body)', {
          lineHeight: 'var(--line-height-body)',
          fontWeight: 'var(--font-weight-normal)',
        }],
        'small': ['var(--font-size-small)', {
          lineHeight: 'var(--line-height-small)',
          fontWeight: 'var(--font-weight-normal)',
        }],
        'caption': ['var(--font-size-caption)', {
          lineHeight: 'var(--line-height-caption)',
          fontWeight: 'var(--font-weight-normal)',
        }],
      },
      fontWeight: {
        light: 'var(--font-weight-light)',
        normal: 'var(--font-weight-normal)',
        medium: 'var(--font-weight-medium)',
        semibold: 'var(--font-weight-semibold)',
        bold: 'var(--font-weight-bold)',
      },
      spacing: {
        '1': 'var(--space-1)',
        '2': 'var(--space-2)',
        '3': 'var(--space-3)',
        '4': 'var(--space-4)',
        '5': 'var(--space-5)',
        '6': 'var(--space-6)',
        '8': 'var(--space-8)',
        '10': 'var(--space-10)',
        '12': 'var(--space-12)',
        '16': 'var(--space-16)',
        '20': 'var(--space-20)',
        '24': 'var(--space-24)',
      },
      borderRadius: {
        none: 'var(--radius-none)',
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        xl: 'var(--radius-xl)',
        '2xl': 'var(--radius-2xl)',
        full: 'var(--radius-full)',
      },
      boxShadow: {
        sm: 'var(--shadow-sm)',
        md: 'var(--shadow-md)',
        lg: 'var(--shadow-lg)',
        xl: 'var(--shadow-xl)',
      },
      transitionDuration: {
        fast: '150ms',
        normal: '300ms',
        slow: '500ms',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
      zIndex: {
        dropdown: 'var(--z-dropdown)',
        sticky: 'var(--z-sticky)',
        fixed: 'var(--z-fixed)',
        'modal-backdrop': 'var(--z-modal-backdrop)',
        modal: 'var(--z-modal)',
        popover: 'var(--z-popover)',
        tooltip: 'var(--z-tooltip)',
        toast: 'var(--z-toast)',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};
export default config;
