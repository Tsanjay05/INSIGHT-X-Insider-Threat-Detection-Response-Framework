# INSIGHT-X Frontend

Zero-trust insider threat detection platform - Web UI

## Overview

Modern React/TypeScript application for monitoring, analyzing, and responding to insider threats using zero-trust architecture.

**Built With:**
- React 18 + TypeScript 5
- Vite 5 (Build Tool)
- TailwindCSS 3 (Design System)
- TanStack Query v5 (Data Fetching)
- Zustand (State Management)
- React Router v6
- Recharts (Visualizations)

## Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.development

# Start development server
npm run dev
```

The app will be available at `http://localhost:3000`

## Development

### Available Scripts

```bash
npm run dev          # Start dev server with HMR
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Lint code with ESLint
npm run lint:fix     # Fix linting issues
npm run format       # Format code with Prettier
npm run format:check # Check code formatting
npm run test         # Run tests
npm run test:ui      # Run tests with UI
npm run typecheck    # TypeScript type checking
```

### Environment Variables

See `.env.example` for all available environment variables.

**Key Variables:**
- `VITE_API_BASE_URL` - Backend API URL
- `VITE_SSE_URL` - Server-Sent Events endpoint
- `VITE_ENABLE_REALTIME` - Enable real-time features
- `VITE_ENABLE_MOCK_DATA` - Use mock data instead of API calls

## Project Structure

```
src/
├── api/              # API clients and types
├── components/       # React components
│   ├── ui/          # Design system primitives
│   ├── layout/      # Layout components
│   └── charts/      # Chart components
├── config/          # App configuration
├── hooks/           # Custom React hooks
├── lib/             # Utilities and helpers
├── pages/           # Page components
├── store/           # Global state (Zustand)
└── test/            # Test utilities
```

## Code Quality

### TypeScript
- Strict mode enabled
- Path aliases configured (`@components/*`, `@api/*`, etc.)
- Full type coverage

### Linting & Formatting
- ESLint with React, TypeScript, a11y rules
- Prettier with Tailwind class sorting
- Pre-commit hooks (future)

### Testing
-  Vitest + React Testing Library
- Coverage reports available

## Architecture

### State Management
- **Global State:** Zustand stores
- **Server State:** TanStack Query (caching, invalidation)
- **UI State:** Local component state

### Data Fetching
- TanStack Query for async state
- SSE for real-time updates
- WebSocket support (future)

### Routing
- React Router v6
-  Protected routes (auth)
- Lazy-loaded pages

## Design System

Based on a dark-theme, modern UI with:
- **Typography:** Inter Tight (sans), JetBrains Mono (mono)
- **Colors:** Semantic colors for trust levels, risk, status
- **Components:** Consistent, reusable primitives

See `tailwind.config.js` for full design tokens.

## API Integration

### Backend Services
- **Trust Engine** (`/api/v1/trust`) - Trust scoring and evaluation
- **Controls** (`/api/v1/controls`) - Adaptive access controls
- **Intent** (`/api/v1/intent`) - Behavioral intent analysis
- **Provenance** (`/api/v1/provenance`) - Decision audit trails
- **Graph** (`/api/v1/graph`) - Campaign detection

### Real-time Updates
- Server-Sent Events (SSE) for trust decision stream
- Auto-reconnection with exponential backoff

## Contributing

See [CONTRIBUTING.md](./docs/CONTRIBUTING.md) for development guidelines.

## License

Proprietary - All Rights Reserved

## Support

For questions or issues, contact the development team.
