# Inventory Dashboard

## Overview
The Inventory Dashboard provides a comprehensive view of drug inventory management with real-time data visualization and analysis capabilities.

## File Structure

```
inventory-dashboard/
├── index.tsx                 # Main dashboard component
├── hooks.ts                  # React hooks for data fetching
├── hooks.controller.ts       # Business logic and data processing
├── types.ts                  # Centralized type definitions
├── components/               # Reusable UI components
│   ├── index.tsx            # Component exports
│   ├── InventoryMetricCard.tsx
│   ├── StockStatusSummary.tsx
│   ├── HistoricalDrugRatioChart.tsx
│   └── DrugDetailsList.tsx
├── component.loading.tsx     # Loading state component
├── component.error.tsx       # Error state component
├── component.empty.tsx       # Empty state component
└── README.md                # This file
```

## Components

### InventoryMetricCard
Displays key metrics in card format with icons and color coding.
- Drug reserve ratio
- Total inventory value
- Total item count
- Unlinked drugs count

### StockStatusSummary
Shows drug status distribution in a compact table:
- วิกฤต (Critical) - Red
- ต่ำ (Low) - Orange  
- เหมาะสม (Adequate) - Green
- เกิน (Excess) - Blue
- มากเกินไป (Too Much) - Purple

### HistoricalDrugRatioChart
Line chart showing drug ratio trends over time using @ant-design/plots.

### DrugDetailsList
Comprehensive table with filtering capabilities:
- **All drugs** - Complete inventory list
- **Linked** - Drugs connected to hospital system
- **Unlinked** - Drugs not yet linked to hospital system

Features:
- Status-based sorting (critical items first)
- Visual highlighting for critical/low stock
- Detailed drug information with cost calculations
- Advanced pagination and search

## Data Types

### Main Types
- `InventoryDashboardData` - Complete dashboard data structure
- `DrugData` - Individual drug item data
- `DrugStatus` - Status count summary
- `HistoricalDrugRatio` - Historical trend data

### Constants
- `STATUS_PRIORITY` - Status sorting order
- `DRUG_TYPE_MAP` - Drug type translations
- `STATUS_COLORS` - Color mappings for status

## Usage

```tsx
import { InventoryDashboard } from './pages/inventory-dashboard';

// Main dashboard with PCU selection
<InventoryDashboard />
```

## Drug Status Logic

Status is determined by days of remaining stock:
- **วิกฤต (Critical)**: < 7 days
- **ต่ำ (Low)**: 7-15 days  
- **เหมาะสม (Adequate)**: 15-45 days
- **เกิน (Excess)**: 45-75 days
- **มากเกินไป (Too Much)**: > 75 days

## Key Features

1. **Real-time Data**: Automatic updates when PCU is selected
2. **Visual Analytics**: Charts and color-coded status indicators
3. **Flexible Filtering**: Multiple view options for drug lists
4. **Export Ready**: Data formatted for reporting and analysis
5. **Responsive Design**: Works on different screen sizes
6. **Type Safety**: Full TypeScript support with centralized types

## Dependencies

- React 18+
- Ant Design 5+
- @ant-design/plots 2+
- TypeScript 5+ 