# Kauri Professional Design System

A modern, refined design system for professional wine inventory management - combining the brand's natural green heritage with vibrant accent colors for optimal user experience and data clarity.

## Design Philosophy

### Vision
Create a professional, engaging interface that honors the Kauri brand identity while using distinct, memorable colors for different categories and statuses, ensuring users can quickly identify and differentiate content at a glance.

### Brand Evolution
- **Brand-Aligned**: Deep forest green as primary color, matching the actual Kauri logo
- **Professional**: Sophisticated color palette suitable for B2B wine industry
- **Distinctive**: Each status and category has its own unique, memorable color
- **Modern**: Contemporary design patterns with gradients and refined interactions
- **Functional**: Colors serve a purpose - every color tells a story and aids navigation

## Color System

### Primary Palette - "Sophisticated Slate"
```css
/* Primary Interface Colors */
--slate-50: 248 250 252;        /* Light backgrounds, cards */
--slate-100: 241 245 249;       /* Subtle surfaces */
--slate-200: 226 232 240;       /* Borders, dividers */
--slate-300: 203 213 225;       /* Disabled states */
--slate-400: 148 163 184;       /* Secondary text */
--slate-500: 100 116 139;       /* Primary gray text */
--slate-600: 71 85 105;         /* Headings */
--slate-700: 51 65 85;          /* Dark text */
--slate-800: 30 41 59;          /* High contrast */
--slate-900: 15 23 42;          /* Maximum contrast */

/* White and Pure */
--pure-white: 255 255 255;      /* Clean white */
--warm-white: 254 252 251;      /* Slightly warm white for softness */
```

### Brand Palette - "Logo-Aligned Professional Green"
```css
/* Primary Brand - Logo-Aligned Green */
--logo-green: 45 125 77;        /* Deep forest green matching logo */
--logo-green-light: 74 158 106; /* Light logo green */
--logo-green-bg: 240 253 244;   /* Logo green background */
--logo-green-dark: 22 101 52;   /* Darker logo green */

/* Secondary Accent - Sophisticated Teal */
--teal-50: 240 253 250;         /* Very light teal backgrounds */
--teal-100: 204 251 241;        /* Light teal surfaces */
--teal-200: 153 246 228;        /* Subtle teal accents */
--teal-300: 94 234 212;         /* Medium teal */
--teal-400: 45 212 191;         /* Vibrant teal */
--teal-500: 20 184 166;         /* Primary teal */
--teal-600: 13 148 136;         /* Darker teal */
--teal-700: 15 118 110;         /* Deep teal */
--teal-800: 17 94 89;           /* Very deep teal */
--teal-900: 19 78 74;           /* Darkest teal */

/* Accent Lime Green */
--lime-50: 247 254 231;         /* Very light lime */
--lime-100: 236 252 203;        /* Light lime */
--lime-200: 217 249 157;        /* Subtle lime */
--lime-300: 190 242 100;        /* Medium lime */
--lime-400: 163 230 53;         /* Vibrant lime */
--lime-500: 132 204 22;         /* Primary lime */
--lime-600: 101 163 13;         /* Darker lime */
--lime-700: 77 124 15;          /* Deep lime */
--lime-800: 63 98 18;           /* Very deep lime */
--lime-900: 54 83 20;           /* Darkest lime */
```

### Data Visualization Palette - "Vibrant Analytics"
```css
/* Extended Data Colors - For charts, stats, and visual differentiation */
--data-blue: 59 130 246;        /* Electric blue */
--data-blue-light: 147 197 253; /* Light blue */
--data-purple: 139 92 246;      /* Vivid purple */
--data-purple-light: 196 181 253; /* Light purple */
--data-indigo: 99 102 241;      /* Rich indigo */
--data-indigo-light: 165 180 252; /* Light indigo */
--data-amber: 245 158 11;       /* Vibrant amber */
--data-amber-light: 252 211 77; /* Light amber */
--data-rose: 244 63 94;         /* Coral rose */
--data-rose-light: 251 113 133; /* Light rose */
--data-emerald: 16 185 129;     /* Brilliant emerald */
--data-emerald-light: 110 231 183; /* Light emerald */
--data-cyan: 6 182 212;         /* Bright cyan */
--data-cyan-light: 103 232 249; /* Light cyan */
--data-pink: 236 72 153;        /* Hot pink */
--data-pink-light: 251 182 206; /* Light pink */
--data-violet: 124 58 237;      /* Deep violet */
--data-violet-light: 196 181 253; /* Light violet */
```

### Professional Gradients
```css
/* Gradient Definitions for Buttons and Accents */
--gradient-primary: linear-gradient(135deg, rgb(var(--logo-green)) 0%, rgb(var(--logo-green-light)) 100%);
--gradient-success: linear-gradient(135deg, rgb(var(--status-available)) 0%, rgb(5, 180, 125) 100%);
--gradient-warning: linear-gradient(135deg, rgb(var(--status-limited)) 0%, rgb(249, 115, 22) 100%);
--gradient-danger: linear-gradient(135deg, rgb(var(--status-critical)) 0%, rgb(220, 38, 38) 100%);
--gradient-info: linear-gradient(135deg, rgb(var(--status-pending)) 0%, rgb(59, 130, 246) 100%);
--gradient-purple: linear-gradient(135deg, rgb(var(--status-reserved)) 0%, rgb(147, 51, 234) 100%);
--gradient-hero: linear-gradient(135deg, rgb(var(--logo-green)) 0%, rgb(var(--teal-500)) 50%, rgb(var(--data-blue)) 100%);
```

### Status Palette - "Vibrant & Distinct States"
```css
/* Inventory Status - Bold and Distinctive */
--status-available: 16 185 129;       /* Vibrant emerald for available */
--status-available-bg: 209 250 229;   /* Light emerald background */
--status-available-border: 5 150 105; /* Darker emerald border */

--status-limited: 245 158 11;         /* Bright amber for limited */
--status-limited-bg: 255 251 235;     /* Light amber background */
--status-limited-border: 217 119 6;   /* Darker amber border */

--status-critical: 239 68 68;         /* Vibrant coral red for critical */
--status-critical-bg: 254 242 242;    /* Light red background */
--status-critical-border: 220 38 38;  /* Darker red border */

--status-reserved: 139 92 246;        /* Electric purple for reserved */
--status-reserved-bg: 245 243 255;    /* Light purple background */
--status-reserved-border: 124 58 237; /* Darker purple border */

--status-pending: 59 130 246;         /* Bright blue for pending */
--status-pending-bg: 239 246 255;     /* Light blue background */
--status-pending-border: 37 99 235;   /* Darker blue border */
```

### Category Palette - "Distinctive Categories"
```css
/* Category Colors - Each category has its own identity */
--category-barrels: 5 150 105;        /* Deep emerald for barrels */
--category-barrels-bg: 209 250 229;   /* Light emerald background */
--category-bottles: 37 99 235;        /* Royal blue for bottles */
--category-bottles-bg: 239 246 255;   /* Light blue background */
--category-equipment: 124 58 237;     /* Deep purple for equipment */
--category-equipment-bg: 245 243 255; /* Light purple background */
--category-corks: 217 119 6;          /* Warm orange for corks */
--category-corks-bg: 255 251 235;     /* Light orange background */
```

## Typography

### Font System - "Professional Clarity"
```css
/* Modern Professional Stack */
--font-sans: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
--font-mono: "JetBrains Mono", "SF Mono", Consolas, monospace;
--font-display: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;

/* No serif - keeping it clean and modern */
```

### Typography Scale - "Data-Focused Hierarchy"
```css
/* Display Typography */
.text-display-lg { font-size: 3rem; font-weight: 700; line-height: 1.1; letter-spacing: -0.025em; }
.text-display-md { font-size: 2.25rem; font-weight: 600; line-height: 1.2; letter-spacing: -0.015em; }
.text-display-sm { font-size: 1.875rem; font-weight: 600; line-height: 1.3; }

/* Heading Typography */
.text-h1 { font-size: 1.875rem; font-weight: 700; line-height: 1.25; }
.text-h2 { font-size: 1.5rem; font-weight: 600; line-height: 1.33; }
.text-h3 { font-size: 1.25rem; font-weight: 600; line-height: 1.4; }
.text-h4 { font-size: 1.125rem; font-weight: 600; line-height: 1.44; }

/* Body Typography */
.text-lg { font-size: 1.125rem; font-weight: 400; line-height: 1.6; }
.text-base { font-size: 1rem; font-weight: 400; line-height: 1.5; }
.text-sm { font-size: 0.875rem; font-weight: 400; line-height: 1.43; }
.text-xs { font-size: 0.75rem; font-weight: 500; line-height: 1.33; }

/* Data Typography */
.text-data-lg { font-size: 1.125rem; font-weight: 600; font-family: var(--font-mono); }
.text-data-base { font-size: 1rem; font-weight: 500; font-family: var(--font-mono); }
.text-data-sm { font-size: 0.875rem; font-weight: 500; font-family: var(--font-mono); }
```

## Layout & Spacing

### Sophisticated Grid System
```css
/* Container System */
.container-sm { max-width: 640px; }
.container-md { max-width: 768px; }
.container-lg { max-width: 1024px; }
.container-xl { max-width: 1280px; }
.container-2xl { max-width: 1440px; }

/* Dashboard Layouts */
.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 1.5rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.25rem;
}

.data-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1rem;
}
```

### Refined Spacing Scale
```css
/* 8px Base Grid System */
--space-0: 0;
--space-px: 1px;
--space-0_5: 0.125rem;  /* 2px */
--space-1: 0.25rem;     /* 4px */
--space-1_5: 0.375rem;  /* 6px */
--space-2: 0.5rem;      /* 8px */
--space-2_5: 0.625rem;  /* 10px */
--space-3: 0.75rem;     /* 12px */
--space-3_5: 0.875rem;  /* 14px */
--space-4: 1rem;        /* 16px */
--space-5: 1.25rem;     /* 20px */
--space-6: 1.5rem;      /* 24px */
--space-7: 1.75rem;     /* 28px */
--space-8: 2rem;        /* 32px */
--space-10: 2.5rem;     /* 40px */
--space-12: 3rem;       /* 48px */
--space-16: 4rem;       /* 64px */
--space-20: 5rem;       /* 80px */
--space-24: 6rem;       /* 96px */
```

## Component Design

### Sophisticated Cards
```css
.card-sophisticated {
  background: rgb(var(--pure-white));
  border: 1px solid rgb(var(--slate-200));
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.03);
  transition: all 0.2s ease;
}

.card-sophisticated:hover {
  border-color: rgb(var(--slate-300));
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05), 0 2px 4px rgba(0, 0, 0, 0.03);
  transform: translateY(-1px);
}

.card-data {
  background: rgb(var(--pure-white));
  border: 1px solid rgb(var(--slate-200));
  border-radius: 8px;
  position: relative;
  overflow: hidden;
}

.card-data::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, 
    rgb(var(--teal-500)) 0%, 
    rgb(var(--data-blue)) 50%, 
    rgb(var(--data-purple)) 100%
  );
}
```

### Premium Buttons
```css
/* Primary Button - Teal */
.btn-primary {
  background: rgb(var(--teal-600));
  color: white;
  border: 1px solid rgb(var(--teal-600));
  font-weight: 500;
  padding: 0.625rem 1rem;
  border-radius: 8px;
  transition: all 0.15s ease;
  font-size: 0.875rem;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.btn-primary:hover {
  background: rgb(var(--teal-700));
  border-color: rgb(var(--teal-700));
  transform: translateY(-1px);
  box-shadow: 0 4px 6px rgba(20, 184, 166, 0.15);
}

/* Secondary Button - Sophisticated */
.btn-secondary {
  background: rgb(var(--pure-white));
  color: rgb(var(--slate-700));
  border: 1px solid rgb(var(--slate-300));
  font-weight: 500;
  padding: 0.625rem 1rem;
  border-radius: 8px;
  transition: all 0.15s ease;
  font-size: 0.875rem;
}

.btn-secondary:hover {
  background: rgb(var(--slate-50));
  border-color: rgb(var(--slate-400));
  transform: translateY(-1px);
}

/* Data Button - For analytics */
.btn-data {
  background: rgb(var(--data-blue));
  color: white;
  border: 1px solid rgb(var(--data-blue));
  font-weight: 500;
  padding: 0.5rem 0.875rem;
  border-radius: 6px;
  transition: all 0.15s ease;
  font-size: 0.8125rem;
}

.btn-data:hover {
  background: rgb(var(--data-indigo));
  transform: translateY(-1px);
}
```

### Sophisticated Status Badges
```css
.badge-sophisticated {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.75rem;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 500;
  line-height: 1;
  border: 1px solid transparent;
}

.badge-available {
  background: rgb(var(--status-available-bg));
  color: rgb(var(--status-available));
  border-color: rgba(16, 185, 129, 0.2);
}

.badge-limited {
  background: rgb(var(--status-limited-bg));
  color: rgb(var(--status-limited));
  border-color: rgba(245, 158, 11, 0.2);
}

.badge-critical {
  background: rgb(var(--status-critical-bg));
  color: rgb(var(--status-critical));
  border-color: rgba(244, 63, 94, 0.2);
}

.badge-reserved {
  background: rgb(var(--status-reserved-bg));
  color: rgb(var(--status-reserved));
  border-color: rgba(99, 102, 241, 0.2);
}

.badge-pending {
  background: rgb(var(--status-pending-bg));
  color: rgb(var(--status-pending));
  border-color: rgba(139, 92, 246, 0.2);
}
```

### Data Tables - Professional Display
```css
.table-sophisticated {
  width: 100%;
  border-collapse: collapse;
  background: rgb(var(--pure-white));
}

.table-sophisticated thead {
  background: rgb(var(--slate-50));
  border-bottom: 1px solid rgb(var(--slate-200));
}

.table-sophisticated th {
  padding: 0.875rem 1rem;
  text-align: left;
  font-weight: 600;
  font-size: 0.75rem;
  color: rgb(var(--slate-600));
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.table-sophisticated td {
  padding: 1rem;
  border-bottom: 1px solid rgb(var(--slate-100));
  font-size: 0.875rem;
  color: rgb(var(--slate-800));
}

.table-sophisticated tbody tr:hover {
  background: rgb(var(--slate-50));
}

/* Data cells for numbers */
.table-data-cell {
  font-family: var(--font-mono);
  font-weight: 500;
  color: rgb(var(--slate-700));
  text-align: right;
}
```

### Modern Forms
```css
.input-sophisticated {
  background: rgb(var(--pure-white));
  border: 1px solid rgb(var(--slate-300));
  border-radius: 8px;
  padding: 0.75rem 1rem;
  font-size: 0.875rem;
  color: rgb(var(--slate-800));
  transition: all 0.15s ease;
  width: 100%;
}

.input-sophisticated:focus {
  outline: none;
  border-color: rgb(var(--teal-500));
  box-shadow: 0 0 0 3px rgba(20, 184, 166, 0.1);
}

.input-sophisticated::placeholder {
  color: rgb(var(--slate-400));
}
```

## Shadow & Elevation System

### Sophisticated Shadows
```css
--shadow-xs: 0 1px 2px rgba(0, 0, 0, 0.03);
--shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.03);
--shadow-md: 0 4px 6px rgba(0, 0, 0, 0.05), 0 2px 4px rgba(0, 0, 0, 0.03);
--shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.08), 0 4px 6px rgba(0, 0, 0, 0.03);
--shadow-xl: 0 20px 25px rgba(0, 0, 0, 0.1), 0 10px 10px rgba(0, 0, 0, 0.03);

/* Colored shadows for accents */
--shadow-teal: 0 4px 6px rgba(20, 184, 166, 0.15);
--shadow-blue: 0 4px 6px rgba(59, 130, 246, 0.15);
--shadow-purple: 0 4px 6px rgba(139, 92, 246, 0.15);
```

## Animation & Motion

### Refined Transitions
```css
--duration-fast: 0.15s;
--duration-normal: 0.2s;
--duration-slow: 0.3s;
--duration-slower: 0.4s;

--ease-out: cubic-bezier(0, 0, 0.2, 1);
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
--ease-bounce: cubic-bezier(0.68, -0.6, 0.32, 1.6);

/* Sophisticated hover effects */
.hover-lift-subtle {
  transition: transform var(--duration-normal) var(--ease-out);
}

.hover-lift-subtle:hover {
  transform: translateY(-1px);
}

.hover-lift-data {
  transition: transform var(--duration-normal) var(--ease-out),
              box-shadow var(--duration-normal) var(--ease-out);
}

.hover-lift-data:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}
```

## Implementation Guidelines

### Design Principles
1. **Sophisticated Restraint**: Use color purposefully, not decoratively
2. **Data Clarity**: Ensure high contrast and readability for all data
3. **Professional Polish**: Subtle animations and refined interactions
4. **Consistent Hierarchy**: Clear visual hierarchy through typography and spacing
5. **Purposeful Color**: Each color serves a functional purpose

### Color Usage Guidelines
- **Slate**: Primary interface, text, borders - neutral foundation
- **Logo Green**: Primary brand color, main CTAs, headers, brand moments
- **Teal**: Secondary actions, complementary accents
- **Lime**: Tertiary accents, success highlights
- **Status Colors**: Each inventory state has a distinct, memorable color
  - **Available**: Vibrant emerald green - positive and ready
  - **Limited**: Bright amber - caution and attention needed
  - **Critical/Out of Stock**: Coral red - urgent action required
  - **Reserved**: Electric purple - special status
  - **Pending**: Bright blue - in progress
- **Category Colors**: Each category has its own identity
  - **Barrel Racks**: Deep emerald - sturdy and natural
  - **Bottles**: Royal blue - premium and refined
  - **Equipment**: Deep purple - technical and specialized
  - **Corks**: Warm orange - traditional and craft
- **Data Colors**: Extended vibrant palette for charts and visual differentiation
- **Gradients**: Professional gradient combinations using logo green as primary

### Typography Guidelines
- **Inter**: All interface text, clean and professional
- **JetBrains Mono**: All data, numbers, codes
- **Weight Hierarchy**: 400 (normal), 500 (medium), 600 (semibold), 700 (bold)

This professional design system creates an engaging, brand-aligned interface that honors the Kauri identity while using color strategically to improve user experience and data comprehension. The logo-aligned green serves as the primary brand anchor, while vibrant accent colors provide clear functional differentiation. Each color serves a specific purpose, helping users quickly identify and differentiate content while maintaining the sophisticated, professional aesthetic appropriate for the wine industry. The system balances brand consistency with modern design trends, creating an application that is both memorable and trustworthy.