import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
        display: ['Sora', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        surface: {
          DEFAULT: 'hsl(var(--surface))',
          low: 'hsl(var(--surface-low))',
          lowest: 'hsl(var(--surface-lowest))',
          high: 'hsl(var(--surface-high))',
          highest: 'hsl(var(--surface-highest))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
          container: 'hsl(var(--primary-container))',
          'fixed-variant': 'hsl(var(--on-primary-fixed-variant))',
          50: 'hsl(var(--primary) / 0.1)',
          100: 'hsl(var(--primary) / 0.2)',
          200: 'hsl(var(--primary) / 0.3)',
          300: 'hsl(var(--primary) / 0.4)',
          400: 'hsl(var(--primary) / 0.5)',
          500: 'hsl(var(--primary) / 0.6)',
          600: 'hsl(var(--primary) / 0.7)',
          700: 'hsl(var(--primary) / 0.8)',
          800: 'hsl(var(--primary) / 0.9)',
          900: 'hsl(var(--primary) / 0.95)',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
          container: 'hsl(var(--secondary-container))',
        },
        tertiary: {
          DEFAULT: 'hsl(var(--tertiary))',
          foreground: 'hsl(var(--tertiary-foreground))',
          container: 'hsl(var(--tertiary-container))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
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
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        sidebar: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
          muted: 'hsl(var(--primary) / 0.9)',
          border: 'hsl(var(--primary) / 0.2)',
        },
        badge: {
          consultation: 'hsl(var(--badge-consultation))',
          surgery: 'hsl(var(--badge-surgery))',
          vaccination: 'hsl(var(--badge-vaccination))',
          grooming: 'hsl(var(--badge-grooming))',
        },
      },
      borderRadius: {
        none: '0',
        sm: '0.375rem',
        DEFAULT: 'var(--radius)',
        md: 'calc(var(--radius) + 0.125rem)',
        lg: 'calc(var(--radius) + 0.25rem)',
        xl: 'calc(var(--radius) + 0.5rem)',
        '2xl': 'calc(var(--radius) + 0.75rem)',
        '3xl': 'calc(var(--radius) + 1rem)',
      },
      boxShadow: {
        'sm': 'var(--shadow-sm)',
        'DEFAULT': 'var(--shadow-md)',
        'md': 'var(--shadow-md)',
        'lg': 'var(--shadow-lg)',
        'xl': 'var(--shadow-xl)',
        'inner-soft': 'inset 0 2px 4px 0 rgba(45, 52, 54, 0.05)',
        'soft': '0 2px 8px -2px rgba(45, 52, 54, 0.08), 0 4px 16px -4px rgba(45, 52, 54, 0.06)',
        'premium': '0 4px 20px -4px rgba(91, 123, 109, 0.15), 0 8px 32px -8px rgba(91, 123, 109, 0.1)',
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out forwards',
        'slide-up': 'slideUp 0.4s ease-out forwards',
        'scale-in': 'scaleIn 0.3s ease-out forwards',
        'shimmer': 'shimmer 1.5s infinite',
        'float': 'float 3s ease-in-out infinite',
        'pulse-soft': 'pulse-soft 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
      },
      transitionTimingFunction: {
        'bounce-in': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      width: {
        '128': '32rem',
        '144': '36rem',
      },
      height: {
        '128': '32rem',
        '144': '36rem',
      },
      maxWidth: {
        '8xl': '88rem',
      },
      scale: {
        '102': '1.02',
        '103': '1.03',
      },
    },
  },
  plugins: [],
};

export default config;
