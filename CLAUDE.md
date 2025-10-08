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

## Critical Pattern: Sticky Table Headers

### MANDATORY Rules for Sticky Headers
**When implementing sticky table headers, ALWAYS follow these rules:**

1. **For headers sticky BOTH vertically AND horizontally:**
   ```tsx
   <th style={{ position: 'sticky', left: 0, top: 0, zIndex: 30 }}>
     Item ID
   </th>
   ```
   - MUST have `position: 'sticky'` (NOT className)
   - MUST specify BOTH `left` AND `top` values
   - Higher zIndex (30) for dual-sticky cells

2. **For headers sticky ONLY vertically:**
   ```tsx
   <th style={{ position: 'sticky', top: 0, zIndex: 20 }}>
     Column Name
   </th>
   ```
   - MUST have `position: 'sticky'` (NOT className)
   - MUST specify `top: 0`
   - Lower zIndex (20) for single-sticky cells

3. **For data cells sticky horizontally:**
   ```tsx
   <td className="sticky left-0 bg-inherit z-10">
     {data}
   </td>
   ```
   - Can use className for single-direction sticky
   - MUST use `bg-inherit` to preserve row striping

4. **Background colors:**
   - ALL sticky headers MUST have explicit `backgroundColor` in style
   - Use `bg-gray-100` class PLUS `backgroundColor` in style for consistency

5. **Common Mistake - DO NOT DO THIS:**
   ```tsx
   {/* WRONG - will lose vertical sticky */}
   <thead className="sticky top-0">
     <th className="sticky left-0">...</th>
   </thead>

   {/* CORRECT - each <th> must have position: sticky */}
   <thead>
     <th style={{ position: 'sticky', left: 0, top: 0 }}>...</th>
   </thead>
   ```

## Critical Pattern: Bulletproof Table Column Alignment

### Problem Pattern
When building complex tables with dynamic column widths and region spanning headers, misalignment issues occur when:
1. Header text length exceeds calculated column width (e.g., "CONOTHER" too long for warehouse columns)
2. Different sections (header, group rows, data rows) use different width calculations
3. CSS flexbox containers expand inconsistently causing visual gaps and extra borders

### Solution: Single Source of Truth Pattern
**ALWAYS use this pattern for complex table layouts:**

```typescript
// 1. Create immutable layout calculation function
const getColumnLayout = () => {
  // Fixed column widths - NEVER CHANGE THESE
  const FIXED_COLUMNS = {
    itemId: 140,
    description: 300, 
    group: 140
  };
  
  // Summary column widths - NEVER CHANGE THESE
  const SUMMARY_COLUMNS = {
    total: 320,
    individual: 80
  };

  // Calculate warehouse region layouts with IMMUTABLE logic
  const warehouseRegions = Object.entries(groupedByRegion).map(([region, warehouses]) => {
    // IMMUTABLE: Region width calculation
    const regionTextWidth = region.length * 8;
    const minWarehouseWidth = warehouses.length * warehouseColumnWidth;
    const regionTotalWidth = Math.max(regionTextWidth, minWarehouseWidth);
    
    // IMMUTABLE: Each warehouse gets EXACTLY the same width
    const warehouseWidth = regionTotalWidth / warehouses.length;

    return {
      region,
      totalWidth: regionTotalWidth,
      warehouses: warehouses.map(warehouse => ({
        name: warehouse,
        width: warehouseWidth // EXACTLY the same for all warehouses in this region
      }))
    };
  });

  return {
    fixedColumns: FIXED_COLUMNS,
    summaryColumns: SUMMARY_COLUMNS,
    warehouseRegions
  };
};

// 2. Create shared rendering function for perfect alignment
const renderWarehouseColumns = (isHeader: boolean = false, item?: any) => {
  return columnLayout.warehouseRegions.map(({ region, totalWidth, warehouses }) => (
    <div key={region} className="flex flex-col border-r border-gray-200 flex-shrink-0">
      {isHeader && (
        <div 
          className="px-2 py-2 text-sm font-semibold text-center border-b border-gray-300 bg-slate-50" 
          style={{ 
            minWidth: `${totalWidth}px`,
            width: `${totalWidth}px`
          }}
        >
          {region}
        </div>
      )}
      <div 
        className="flex bg-slate-50" 
        style={{ 
          minWidth: `${totalWidth}px`,
          width: `${totalWidth}px`
        }}
      >
        {warehouses.map(({ name, width }) => (
          <div 
            key={name} 
            className="px-1 py-2 text-xs text-center border-r border-gray-100 whitespace-normal break-words" 
            style={{ 
              minWidth: `${width}px`, 
              width: `${width}px`
            }}
          >
            {/* Content rendering logic */}
          </div>
        ))}
      </div>
    </div>
  ));
};

// 3. Use EXACTLY the same layout object throughout ALL sections
// Header: {renderWarehouseColumns(true)}
// Group rows: {renderWarehouseColumns(false)}
// Data rows: {renderWarehouseColumns(false, item)}
```

### Key Principles
1. **Single Source of Truth**: One layout calculation function used everywhere
2. **Immutable Widths**: Calculate once, never modify, use consistently
3. **Shared Rendering**: Same function renders header, group rows, and data rows
4. **Text Overflow Handling**: Use `whitespace-normal break-words` for proper wrapping
5. **Perfect Width Sync**: Every section uses identical `style={{ width: 'Xpx', minWidth: 'Xpx' }}`

### Why This Matters
- Prevents "CONOTHER" type issues where long text creates layout gaps
- Eliminates mysterious extra vertical lines and border misalignment
- Ensures perfect column alignment across all table sections
- Makes layout changes bulletproof and maintainable