# Frontend Architecture

## Overview

INSIGHT-X frontend is a modern single-page application built with React, TypeScript, and Vite.

## Design Principles

1. **Type Safety** - TypeScript strict mode throughout
2. **Component Composition** - Small, reusable components
3. **Separation of Concerns** - Clear boundaries between layers
4. **Performance First** - Lazy loading, code splitting, memoization
5. **Accessibility** - WCAG 2.1 AA compliance

## Architecture Layers

### Presentation Layer
**Components (`src/components/`)**
- `ui/` - Design system primitives (Button, Card, Input, etc.)
- `layout/` - Shell components (Sidebar, TopBar, Layout)
- `charts/` - Visualization components
- `streaming/` - Real-time data components

**Pages (`src/pages/`)**
- Route-level components
- Compose UI components
- Handle page-level state
- Lazy-loaded for code splitting

### Business Logic Layer
**Hooks (`src/hooks/`)**
- Custom React hooks for reusable logic
- Data fetching hooks
- Real-time connection hooks
- Form validation hooks

**API Layer (`src/api/`)**
- Service clients for backend APIs
- Type definitions for API responses
- Request/response transformations
- Mock data for development

### State Management Layer
**Global State (`src/store/`)**
- Zustand stores for global state
- Separate stores by domain (UI, auth, etc.)
- Minimal global state (prefer server state)

**Server State**
- TanStack Query for API data caching
- Automatic refetching and invalidation
- Optimistic updates

### Configuration Layer (`src/config/`)
- Environment variables (`env.ts`)
- Route definitions (`routes.ts`)
- API configuration (`api.ts`)
- Theme tokens (`theme.ts`)
- Feature flags (`features.ts`)

### Utility Layer (`src/lib/`)
- Pure utility functions
- Formatters, validators, helpers
- Constants and enums
- Shared types

## Data Flow

```
User Action → Component → Hook → API Client → Backend
                           ↓
                    Server Cache (TanStack Query)
                           ↓
                    Global State (Zustand)
                           ↓
                    Component Re-render
```

## Real-time Architecture

### Server-Sent Events (SSE)
- Trust decision stream
- Auto-reconnection logic
- Exponential backoff
- State synchronization

```
SSE Stream → useTrustStream Hook → Global Store → Components
```

### WebSocket (Future)
- Bidirectional communication
- Live collaboration features
- Presence indicators

## State Management Strategy

### When to Use What

**Local Component State** (`useState`)
- UI-only state (modals, dropdowns, form inputs)
- Ephemeral data
- No sharing needed

**Global State** (Zustand)
- UI preferences (sidebar collapsed, theme)
- Real-time connection status
- User session
- Shared UI state

**Server State** (TanStack Query)
- All API data
- Cached responses
- Background sync
- Automatic invalidation

## Routing Strategy

### Route Structure
```
/                     → Dashboard
/users               → Users list
/users/:id           → User detail
/alerts              → Alerts list
/alerts/:id          → Alert detail
/cases/:id           → Case detail
/controls            → Controls list
/campaigns           → Campaigns graph
/intent              → Intent analysis
/provenance          → Audit trail
/settings            → Settings
```

### Protected Routes
- Authentication check (future)
- Role-based access control
- Redirect to login if unauthenticated

### Code Splitting
- Route-level code splitting
- Lazy loading for performance
- Loading states during chunk load

## Performance Optimizations

### Code Splitting
```typescript
const Dashboard = lazy(() => import('@pages/Dashboard'));
const Users = lazy(() => import('@pages/Users'));
```

### Memoization
```typescript
const MemoizedComponent = React.memo(ExpensiveComponent);
const memoizedValue = useMemo(() => computeExpensive(data), [data]);
const memoizedCallback = useCallback(() => handleClick(), [deps]);
```

### Virtualization
- Long lists use virtual scrolling
- Render only visible items
- Reduce DOM nodes

### Asset Optimization
- Code splitting by route and library
- Tree shaking for unused code
- Image lazy loading
- Font subsetting

## Error Handling

### Error Boundaries
- Catch rendering errors
- Graceful fallback UI
- Error reporting

### API Errors
- TanStack Query error handling
- Toast notifications
- Retry logic
- Fallback data

## Testing Strategy

### Unit Tests
- Pure functions
- Utility modules
- Custom hooks (with React Hooks Testing Library)

### Component Tests
- User interactions
- Rendering logic
- Edge cases
- Accessibility

### Integration Tests
- API integration
- State updates
- Route navigation
- Real-time features

## Build & Deployment

### Development
```bash
npm run dev  # Hot module replacement
```

### Production
```bash
npm run build  # TypeScript compile + Vite build
npm run preview  # Test production build
```

### Build Output
- Chunked bundles (vendor, app, routes)
- Minified and compressed
- Source maps for debugging
- Asset hashing for cache busting

## Future Enhancements

- [ ] Service Worker for offline support
- [ ] Progressive Web App (PWA)
- [ ] WebSocket integration
- [ ] Advanced caching strategies
- [ ] Performance monitoring
- [ ] A/B testing framework

---

**Last Updated:** 2026-02-11
**Author:** Development Team
