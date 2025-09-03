# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Structure

This is a Next.js wine barrel inventory management application for Kauri Wine:

- Root directory contains the Next.js 15 application with React 19 and TypeScript
- `docs/design-system.md` - Professional design system documentation with logo-aligned brand colors

## Commands

**Development:**
```bash
pnpm dev          # Start development server with Turbo
```

**Build and Deploy:**
```bash
pnpm build        # Build for production
pnpm start        # Start production server
```

**Code Quality:**
```bash
pnpm lint         # Run ESLint
```

## Architecture Overview

### Tech Stack
- **Framework:** Next.js 15 with App Router
- **UI:** React 19 with TypeScript
- **Styling:** Tailwind CSS with custom design system
- **Components:** Radix UI primitives with custom styling
- **Icons:** Lucide React

### Key Components Architecture
- `src/app/` - Next.js App Router pages and layouts
- `src/components/` - Reusable React components
  - `dashboard-*` - Dashboard-specific components
  - `inventory-*` - Inventory management components
  - `ui/` - Base UI components (buttons, tables, badges, etc.)
- `src/lib/` - Utility functions and shared logic

### Component Patterns
- Uses shadcn/ui component patterns with Radix UI
- Custom design system based on wine industry aesthetics
- Components use TypeScript with proper typing
- UI components follow composition patterns with variants

### Professional Brand-Aligned Design System Integration
- **Primary Brand Color:** Logo-aligned forest green (--logo-green) as main brand color
- **Foundation:** Sophisticated slate grays (--slate-50 to --slate-900) for interface
- **Accent Colors:** Refined teal and lime green for complementary moments
- **Status Colors:** Each status has a distinct, memorable color (emerald, amber, coral, purple, blue)
- **Category Colors:** Each inventory category has its own identity color
- **Data Colors:** Extended vibrant palette for charts and analytics
- **Gradients:** Professional gradient system using logo green as primary
- **Typography:** Inter for UI, JetBrains Mono for data display
- **Shadows:** Sophisticated shadow system with brand-appropriate colors
- **Professional aesthetic:** Brand-consistent, modern interface suitable for wine industry
- **Text Visibility:** Fixed white text on colored backgrounds with proper contrast
- See `docs/design-system.md` for complete professional specifications

### Data Structure
The application manages wine barrel and bottle inventory with:
- Item IDs, groups (Barrel Racks, Bottles)
- Location-based stock (SA013, SA021, SA015, Other)
- Status tracking (available, limited, out-of-stock, reserved)
- Mock data currently used for development

## Development Notes

- Uses `@/` path aliasing for clean imports
- Client components marked with "use client" directive
- Responsive design with mobile-first approach
- All numeric data uses monospace fonts for readability
- Professional utility classes (text-slate-600, bg-logo-green, badge-sophisticated, badge-available, badge-category-barrels, etc.)
- Clean, professional styling focused on usability and data clarity