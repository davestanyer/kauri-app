/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    fontFamily: {
      sans: ['var(--font-sans)', 'Inter', 'system-ui', 'sans-serif'],
      serif: ['var(--font-serif)', 'Playfair Display', 'serif'],
      mono: ['var(--font-mono)', 'JetBrains Mono', 'monospace'],
    },
    extend: {
      colors: {
        // Sophisticated Kauri Design System - Slate & Teal
        
        // Primary Palette - Sophisticated Slate
        slate: {
          50: 'rgb(var(--slate-50))',
          100: 'rgb(var(--slate-100))',
          200: 'rgb(var(--slate-200))',
          300: 'rgb(var(--slate-300))',
          400: 'rgb(var(--slate-400))',
          500: 'rgb(var(--slate-500))',
          600: 'rgb(var(--slate-600))',
          700: 'rgb(var(--slate-700))',
          800: 'rgb(var(--slate-800))',
          900: 'rgb(var(--slate-900))',
        },
        
        // Accent Palette - Refined Teal
        teal: {
          50: 'rgb(var(--teal-50))',
          100: 'rgb(var(--teal-100))',
          200: 'rgb(var(--teal-200))',
          300: 'rgb(var(--teal-300))',
          400: 'rgb(var(--teal-400))',
          500: 'rgb(var(--teal-500))',
          600: 'rgb(var(--teal-600))',
          700: 'rgb(var(--teal-700))',
          800: 'rgb(var(--teal-800))',
          900: 'rgb(var(--teal-900))',
        },
        
        // Secondary Accent - Lime Green
        lime: {
          50: 'rgb(var(--lime-50))',
          100: 'rgb(var(--lime-100))',
          200: 'rgb(var(--lime-200))',
          300: 'rgb(var(--lime-300))',
          400: 'rgb(var(--lime-400))',
          500: 'rgb(var(--lime-500))',
          600: 'rgb(var(--lime-600))',
          700: 'rgb(var(--lime-700))',
          800: 'rgb(var(--lime-800))',
          900: 'rgb(var(--lime-900))',
        },
        
        // Vibrant Data Visualization Colors
        'data-blue': 'rgb(var(--data-blue))',
        'data-blue-light': 'rgb(var(--data-blue-light))',
        'data-purple': 'rgb(var(--data-purple))',
        'data-purple-light': 'rgb(var(--data-purple-light))',
        'data-indigo': 'rgb(var(--data-indigo))',
        'data-indigo-light': 'rgb(var(--data-indigo-light))',
        'data-amber': 'rgb(var(--data-amber))',
        'data-amber-light': 'rgb(var(--data-amber-light))',
        'data-rose': 'rgb(var(--data-rose))',
        'data-rose-light': 'rgb(var(--data-rose-light))',
        'data-emerald': 'rgb(var(--data-emerald))',
        'data-emerald-light': 'rgb(var(--data-emerald-light))',
        'data-cyan': 'rgb(var(--data-cyan))',
        'data-cyan-light': 'rgb(var(--data-cyan-light))',
        'data-pink': 'rgb(var(--data-pink))',
        'data-pink-light': 'rgb(var(--data-pink-light))',
        'data-violet': 'rgb(var(--data-violet))',
        'data-violet-light': 'rgb(var(--data-violet-light))',
        
        // Vibrant Status Colors
        'status-available': 'rgb(var(--status-available))',
        'status-available-bg': 'rgb(var(--status-available-bg))',
        'status-available-border': 'rgb(var(--status-available-border))',
        'status-limited': 'rgb(var(--status-limited))',
        'status-limited-bg': 'rgb(var(--status-limited-bg))',
        'status-limited-border': 'rgb(var(--status-limited-border))',
        'status-critical': 'rgb(var(--status-critical))',
        'status-critical-bg': 'rgb(var(--status-critical-bg))',
        'status-critical-border': 'rgb(var(--status-critical-border))',
        'status-reserved': 'rgb(var(--status-reserved))',
        'status-reserved-bg': 'rgb(var(--status-reserved-bg))',
        'status-reserved-border': 'rgb(var(--status-reserved-border))',
        'status-pending': 'rgb(var(--status-pending))',
        'status-pending-bg': 'rgb(var(--status-pending-bg))',
        'status-pending-border': 'rgb(var(--status-pending-border))',
        
        // Category Colors
        'category-barrels': 'rgb(var(--category-barrels))',
        'category-barrels-bg': 'rgb(var(--category-barrels-bg))',
        'category-bottles': 'rgb(var(--category-bottles))',
        'category-bottles-bg': 'rgb(var(--category-bottles-bg))',
        'category-equipment': 'rgb(var(--category-equipment))',
        'category-equipment-bg': 'rgb(var(--category-equipment-bg))',
        'category-corks': 'rgb(var(--category-corks))',
        'category-corks-bg': 'rgb(var(--category-corks-bg))',
        
        // Pure White
        'pure-white': 'rgb(var(--pure-white))',
        'warm-white': 'rgb(var(--warm-white))',
        
        // Logo-Aligned Green Colors
        'logo-green': 'rgb(var(--logo-green))',
        'logo-green-light': 'rgb(var(--logo-green-light))',
        'logo-green-bg': 'rgb(var(--logo-green-bg))',
        'logo-green-dark': 'rgb(var(--logo-green-dark))',
        
        // Legacy kauri color for backward compatibility
        kauri: 'rgb(var(--logo-green))',  // Maps to logo green
        
        // shadcn/ui colors
        background: 'rgb(var(--background))',
        foreground: 'rgb(var(--foreground))',
        card: {
          DEFAULT: 'rgb(var(--card))',
          foreground: 'rgb(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'rgb(var(--popover))',
          foreground: 'rgb(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'rgb(var(--primary))',
          foreground: 'rgb(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'rgb(var(--secondary))',
          foreground: 'rgb(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'rgb(var(--muted))',
          foreground: 'rgb(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'rgb(var(--accent))',
          foreground: 'rgb(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'rgb(var(--destructive))',
          foreground: 'rgb(var(--destructive-foreground))',
        },
        border: 'rgb(var(--border))',
        input: 'rgb(var(--input))',
        ring: 'rgb(var(--ring))',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      boxShadow: {
        'xs': 'var(--shadow-xs)',
        'sm': 'var(--shadow-sm)',
        'md': 'var(--shadow-md)',
        'lg': 'var(--shadow-lg)',
        'xl': 'var(--shadow-xl)',
        'teal': 'var(--shadow-teal)',
        'blue': 'var(--shadow-blue)',
        'purple': 'var(--shadow-purple)',
        'emerald': 'var(--shadow-emerald)',
        'amber': 'var(--shadow-amber)',
        'rose': 'var(--shadow-rose)',
        'cyan': 'var(--shadow-cyan)',
        'pink': 'var(--shadow-pink)',
      },
      spacing: {
        'px': 'var(--space-px)',
        '0': 'var(--space-0)',
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
      transitionTimingFunction: {
        'ease-in-out': 'var(--ease-in-out)',
        'ease-out': 'var(--ease-out)',
        'ease-in': 'var(--ease-in)',
        'bounce': 'var(--ease-bounce)',
      },
      transitionDuration: {
        'fast': 'var(--duration-fast)',
        'normal': 'var(--duration-normal)',
        'slow': 'var(--duration-slow)',
        'slower': 'var(--duration-slower)',
      },
    },
  },
  plugins: [],
}