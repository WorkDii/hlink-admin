# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

HLink Admin is a React-based healthcare inventory management system built with Refine.dev framework. It manages drug inventory, requests, bills, and provides dashboard analytics for healthcare facilities.

## Commands

### Development
- `pnpm dev` - Start development server
- `pnpm build` - Build for production (runs TypeScript check + Refine build)
- `pnpm preview` - Preview production build
- `pnpm test` - Run tests with Vitest in watch mode

### Type Generation
- `pnpm generate-types` - Generate TypeScript types from Directus API schema
  - Requires DIRECTUS_URL and DIRECTUS_TOKEN environment variables
  - Creates types in `src/directus/generated/client.ts`

## Architecture

### Framework Stack
- **Frontend**: React 18 + TypeScript + Vite
- **UI Library**: Ant Design 5
- **State Management**: Refine.dev with Directus data provider
- **Backend**: Directus CMS as headless backend
- **Routing**: React Router v6 with hash routing
- **Testing**: Vitest

### Key Components
- **Authentication**: Directus-based auth with local storage (`src/authProvider.ts`)
- **Data Provider**: Custom Directus integration (`src/directusClient.ts`)
- **Layout**: Refine ThemedLayoutV2 with custom header/sider
- **Styling**: Ant Design with Sarabun font and Green theme

### Main Features
1. **Inventory Dashboard** (`src/pages/inventory-dashboard/`) - Analytics and metrics
2. **Inventory Requests** (`src/pages/inventory_request/`) - Drug request management
3. **Inventory Bills** (`src/pages/inventory_bill/`) - Billing and CSV export
4. **Hospital Drug Management** (`src/pages/hospital_drug/`) - Drug catalog
5. **Settings Pages** - Units, drug problems, hospital drugs

### Data Flow
- Directus API → Custom data provider → Refine hooks → React components
- Real-time updates via Directus realtime connection
- Local storage for authentication tokens
- CSV export functionality for reports

### Testing Strategy
- Unit tests with Vitest for utility functions
- Component tests for complex UI logic
- Example: `src/pages/inventory_request/create/getRecommendRequestQuantity.test.ts`

### Environment Variables
- `VITE_API_URL` - Directus instance URL
- `DIRECTUS_URL` - For type generation
- `DIRECTUS_TOKEN` - Static token for type generation