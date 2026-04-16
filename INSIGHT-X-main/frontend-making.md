# INSIGHT-X Frontend Development Master Prompt

**Version:** 1.0  
**Target:** Claude 4.5 Sonnet  
**Purpose:** Complete professional frontend implementation for INSIGHT-X insider threat detection platform

---

## 📋 Context & Overview

You are tasked with creating a complete, production-ready frontend for INSIGHT-X, an insider threat detection platform. This is a security operations center (SOC) application built with:

- **Frontend Stack:** React 18 + TypeScript + Tailwind CSS + React Query + React Router
- **Backend:** Spring Boot microservices exposed via API Gateway (localhost:8080)
- **Design System:** Dark-themed, trust-centric security interface
- **State Management:** React Query (@tanstack/react-query) for server state, Zustand for client state

---

## 🎨 Design System Requirements

### Design Files (MUST READ FIRST)
You have access to two critical design files:

1. **design.json** - Complete design tokens including:
   - Color palette (primary, accent, semantic, neutral)
   - Typography (Inter Tight font, type scale)
   - Spacing system
   - Border radius values
   - Shadows
   - Animation timings
   - Component specifications (button, card, badge, modal, etc.)
   - Trust score ranges and visual representations
   - Icons mapping

2. **designdoc.md** - Comprehensive design documentation including:
   - Design philosophy for 24/7 SOC environments
   - Complete component specifications
   - Layout guidelines (sidebar, topbar, content area)
   - Page-specific designs (Dashboard, Users, Cases, Trust Detail, etc.)
   - Loading/error/empty state specifications
   - Accessibility requirements (WCAG 2.1 AA)
   - Responsive breakpoints
   - Implementation examples

### Critical Design Principles
- **Dark-First Design:** Primary background `#080C08`, secondary `#1C1C1E`, tertiary `#2C2C2E`
- **Trust-Centric Colors:** 
  - High trust (80-100): Cyan gradient `#30F0B3` to `#16B383`
  - Medium trust (60-79): Blue gradient `#306FFF` to `#0A3E99`
  - Low trust (40-59): Yellow gradient `#FAD670` to `#D4A820`
  - Critical (0-39): Red gradient `#FF5C5C` to `#E61A1A`
- **Typography:** Inter Tight (sans), JetBrains Mono (monospace)
- **High Contrast:** All text meets WCAG 2.1 AA standards
- **Data Density:** Show complex security data without overwhelming analysts

---

## 🔌 Backend API Documentation

### API Gateway
- **Base URL:** `http://localhost:8080/api/v1`
- **All endpoints** are accessed through the gateway which routes to internal services

### Available Endpoints

#### Trust Engine (`/api/v1/trust/*`)
```typescript
// GET /api/v1/trust/users/{id}
interface TrustStateResponse {
  entityId: string;
  trustScore: number;      // 0-100
  confidence: number;      // 0-1
  lastUpdated: string;     // ISO 8601 timestamp
}

// GET /api/v1/trust/users/{id}/history?limit=n
interface TrustHistoryEntry {
  decisionId: string;
  entityId: string;
  trustScore: number;
  confidence: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  timestamp: string;
}

// POST /api/v1/trust/evaluate
interface EvaluateTrustRequest {
  entityId: string;
  context: Record<string, any>;
}
```

#### User Service (`/api/v1/users`)
```typescript
// GET /api/v1/users?page=1&pageSize=20&search=&role=&status=
interface UserListResponse {
  users: User[];
  total: number;
  page: number;
  pageSize: number;
}

interface User {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'ANALYST' | 'VIEWER';
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  avatar: string;
  department: string;
  lastLogin: string;
  createdAt: string;
  updatedAt: string;
}
```

#### Dashboard/Health (`/api/v1/health` or `/api/v1/dashboard`)
```typescript
interface HealthResponse {
  status: 'UP' | 'DOWN';
  components: {
    database: { status: string };
    kafka: { status: string };
    trustEngine: { status: string };
    // Other services...
  };
}
```

#### Alerts (`/api/v1/alerts`)
```typescript
interface Alert {
  id: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  description: string;
  timestamp: string;
  entityId: string;
}
```

#### Cases (`/api/v1/cases`)
```typescript
interface Case {
  caseId: string;
  title: string;
  status: 'OPEN' | 'CLOSED' | 'IN_PROGRESS';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  openedAt: string;
  assignedTo: string;
}
```

#### Policies (`/api/v1/policies`)
```typescript
interface Policy {
  policyId: string;
  name: string;
  enabled: boolean;
  description: string;
}
```

#### Controls (`/api/v1/controls`)
```typescript
// GET /api/v1/controls/requests - List approval requests
interface ControlRequest {
  id: string;
  type: string;
  entityId: string;
  requestedAt: string;
  status: 'PENDING' | 'APPROVED' | 'DENIED';
}

// POST /api/v1/controls/approve/{id}
// POST /api/v1/controls/deny/{id}
```

---

## 🚨 Current Frontend Issues (MUST FIX)

### Gap Analysis Findings
1. **Static Placeholders:** Dashboard, Users, Policies, Reports, Settings, Timeline, ThreatMap pages show hardcoded numbers/text with NO API calls
2. **Mock Data Dependency:** EntityTrustDetail uses hardcoded `mockTimeline` array and mocked `decayRate`/`baselineScore` fields
3. **Incomplete Actions:** Approvals page has TODO comments - approve/deny just `console.log`
4. **API Wrapper Issues:** `src/api/trust.ts` adds fake fields (`decayRate: 0.5, baselineScore: 50`) not in backend response
5. **No Error Handling:** Missing loading states, error boundaries, empty states
6. **Mock Mode Flag:** `env.enableMockData` can be accidentally enabled - needs warning banner

### What Backend Actually Returns (vs UI Expectations)
- ✅ Backend provides: `entityId, trustScore, confidence, lastUpdated`
- ❌ UI expects but backend DOESN'T provide: `decayRate, baselineScore`
- 🔧 Solution: Either extend backend OR modify UI to not use these fields

---

## 📦 Required Deliverables

### Phase 1: Foundation & Configuration

#### 1.1 Tailwind Configuration
**File:** `tailwind.config.js`

Create a complete Tailwind config that:
- Extends theme with ALL colors from `design.json`
- Adds custom font families (Inter Tight, JetBrains Mono)
- Includes all spacing values
- Defines border radius scale
- Adds custom shadows
- Implements animations (shimmer, fadeIn, slideUp, rotate)
- Sets up responsive breakpoints
- Includes @tailwindcss/forms plugin

**Reference:** Lines 905-1002 in FilesRequested.txt for partial config, but COMPLETE it with all design.json values

#### 1.2 Design Tokens
**File:** `src/config/designTokens.ts`

Export TypeScript constants for:
```typescript
export const colors = { /* from design.json */ };
export const typography = { /* from design.json */ };
export const spacing = { /* from design.json */ };
export const borderRadius = { /* from design.json */ };
export const shadows = { /* from design.json */ };
export const animation = { /* from design.json */ };
export const breakpoints = { /* from design.json */ };
export const trustScoreRanges = { /* from design.json */ };

// Helper functions
export const getTrustColor = (score: number) => { /* returns gradient based on score */ };
export const getTrustLabel = (score: number) => { /* returns 'High Trust' | 'Medium Trust' etc */ };
export const getSeverityColor = (severity: string) => { /* returns color for alert/case severity */ };
```

#### 1.3 Environment Configuration
**File:** `src/config/env.ts`

```typescript
export const env = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1',
  wsUrl: import.meta.env.VITE_WS_URL || 'ws://localhost:8080',
  enableMockData: import.meta.env.VITE_ENABLE_MOCK_DATA === 'true',
  environment: import.meta.env.MODE,
};

// Validation
if (env.enableMockData) {
  console.warn('⚠️ MOCK DATA MODE ENABLED - All API calls will return static data');
}
```

---

### Phase 2: Core UI Components

Create components in `src/components/ui/` following designdoc.md specifications.

#### 2.1 Button Component
**File:** `src/components/ui/Button.tsx`

Variants from design.json:
- **primary:** Linear gradient `#306FFF` to `#0D4FCC`, white text
- **secondary:** Transparent bg, white border, white text  
- **danger:** Linear gradient `#FF5C5C` to `#E61A1A`, white text
- **ghost:** Transparent, no border, hover state

Sizes: `sm`, `md`, `lg`  
States: `default`, `hover`, `active`, `disabled`, `loading`

Props:
```typescript
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  children: React.ReactNode;
  onClick?: () => void;
}
```

**Reference:** design.json lines 240-269, designdoc.md lines 262-293

#### 2.2 Card Component
**File:** `src/components/ui/Card.tsx`

Variants from design.json:
- **default:** `bg-gray-700`, subtle border, rounded-lg (8px)
- **elevated:** `bg-gray-700`, shadow-lg, no border
- **outlined:** transparent bg, default border
- **glass:** `bg-gray-700/50`, backdrop blur

Props:
```typescript
interface CardProps {
  variant?: 'default' | 'elevated' | 'outlined' | 'glass';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  className?: string;
}
```

Sub-components:
- `Card.Header` - With optional icon and action
- `Card.Body` - Main content area  
- `Card.Footer` - Bottom section

**Reference:** design.json lines 270-285, designdoc.md lines 199-223

#### 2.3 Badge Component
**File:** `src/components/ui/Badge.tsx`

Severity variants from design.json:
- **critical:** Red bg/border, `#FF5C5C` text
- **high:** Yellow bg/border, `#FAD670` text
- **medium:** Blue bg/border, `#7B9FFF` text
- **low:** Gray bg/border, `#9E9EA7` text

Props:
```typescript
interface BadgeProps {
  severity: 'critical' | 'high' | 'medium' | 'low';
  children: React.ReactNode;
  size?: 'sm' | 'md';
}
```

**Reference:** design.json lines 343-380, designdoc.md lines 294-321

#### 2.4 Input Component
**File:** `src/components/ui/Input.tsx`

Features:
- Dark theme styling
- Focus states with `#306FFF` border
- Error states with red border
- Icon support (left/right)
- Label and helper text
- Disabled state

Types: `text`, `email`, `password`, `number`, `search`

**Reference:** design.json lines 286-303, designdoc.md lines 322-354

#### 2.5 Modal Component
**File:** `src/components/ui/Modal.tsx`

Structure from design.json:
- Container: `bg-gray-700`, rounded-xl (12px), shadow-2xl
- Header: `bg-gray-800`, 20px padding, bottom border
- Body: `bg-gray-700`, 24px padding
- Footer: `bg-gray-800`, 16px padding, top border

Sizes: `small` (600px), `medium` (800px), `large` (1200px)

Props:
```typescript
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  size?: 'small' | 'medium' | 'large';
  children: React.ReactNode;
  footer?: React.ReactNode;
}
```

**Reference:** design.json lines 318-342, designdoc.md lines 419-453

#### 2.6 Loading States
**File:** `src/components/ui/LoadingState.tsx`

Variants:
- **Skeleton:** Shimmer animation, used for loading content
- **Spinner:** Rotating circle, sizes sm/md/lg
- **Inline:** Small loader for buttons/inline elements

**Reference:** design.json lines 527-543, designdoc.md lines 774-800

#### 2.7 Empty State
**File:** `src/components/ui/EmptyState.tsx`

Shows when no data is available:
- 64px icon in gray-600
- Title: 18px Semibold, gray-300
- Description: 14px Regular, gray-500  
- Optional action button

**Reference:** design.json lines 544-552, designdoc.md lines 801-822

#### 2.8 Error State
**File:** `src/components/ui/ErrorState.tsx`

Shows on API errors:
- Red alert triangle icon
- Error title
- Error message
- Retry button

**Reference:** design.json lines 553-558, designdoc.md lines 823-834

#### 2.9 Select/Dropdown
**File:** `src/components/ui/Select.tsx`

Dark dropdown menu:
- Container: `bg-gray-800`, border, shadow
- Items: Hover state `bg-gray-700`
- Selected item: Blue background `rgba(48, 111, 255, 0.1)`

**Reference:** design.json lines 395-414

#### 2.10 Toggle/Switch
**File:** `src/components/ui/Toggle.tsx`

Specifications:
- Width: 44px, Height: 24px
- Circle: 18px diameter
- Off: `bg-gray-600`, circle left
- On: `bg-primary-400`, circle right
- Smooth transition: 200ms

**Reference:** design.json lines 381-394

---

### Phase 3: Trust-Specific Components

#### 3.1 TrustScoreBadge
**File:** `src/components/trust/TrustScoreBadge.tsx`

Circular progress indicator showing trust score:
- SVG-based circular progress bar
- Gradient stroke based on score range
- Score number in center
- Sizes: small (64px), medium (96px), large (128px)
- 8px stroke width
- Smooth animation on score change

```typescript
interface TrustScoreBadgeProps {
  score: number;           // 0-100
  size?: 'small' | 'medium' | 'large';
  showLabel?: boolean;     // Show "High Trust" label
  animated?: boolean;      // Animate on mount
}
```

Implementation guide:
1. Create SVG with two circles (background gray, foreground gradient)
2. Calculate stroke-dasharray based on score: `score * 2.51` out of 251
3. Apply gradient based on score range from `trustScoreRanges` in design.json
4. Rotate -90deg to start from top
5. Add smooth transition (500ms) on stroke-dasharray change

**Reference:** design.json lines 416-465, designdoc.md lines 843-900

#### 3.2 TrustTrendChart
**File:** `src/components/trust/TrustTrendChart.tsx`

Line chart showing trust score over time:
- Uses Recharts library
- Data: Array of `{ timestamp: string, score: number }`
- Y-axis: 0-100 scale
- X-axis: Time labels
- Line color: Based on average score (green/blue/yellow/red)
- Grid: Subtle gray lines `rgba(255, 255, 255, 0.05)`
- Tooltip: Dark themed with score and timestamp

**Reference:** design.json lines 501-525, designdoc.md lines 564-603

#### 3.3 TrustDelta  
**File:** `src/components/trust/TrustDelta.tsx`

Shows trust score change with arrow:
```typescript
interface TrustDeltaProps {
  current: number;
  previous: number;
}
```

Display: `+5` (green up arrow) or `-3` (red down arrow) or `0` (gray dash)

---

### Phase 4: Layout Components

#### 4.1 AppLayout
**File:** `src/components/layout/AppLayout.tsx`

Main application shell:
```
┌─────────────────────────────────────────┐
│  TopBar (64px height)                   │
├──────┬──────────────────────────────────┤
│      │                                  │
│ Side │  Page Content                    │
│ bar  │  {children}                      │
│      │                                  │
│240px │                                  │
└──────┴──────────────────────────────────┘
```

Features:
- Collapsible sidebar (240px → 64px)
- Persistent across routes
- Responsive (overlay on mobile <768px)
- Dark theme `bg-gray-900` for main, `bg-gray-800` for sidebar

**Reference:** designdoc.md lines 173-198

#### 4.2 Sidebar
**File:** `src/components/layout/Sidebar.tsx`

Navigation menu with items:
- Dashboard (LayoutDashboard icon)
- Cases (FolderOpen icon)
- Campaigns (Network icon)
- Alerts (Bell icon)
- Users (Users icon)
- Timeline (Clock icon)
- Policies (Shield icon)
- Provenance (Archive icon)
- Settings (Settings icon)

Active state:
- Blue background `rgba(48, 111, 255, 0.1)`
- Left border 2px `#306FFF`
- Icon and text in `#306FFF`

Hover state:
- Gray background `rgba(255, 255, 255, 0.05)`

**Reference:** design.json lines 467-499, designdoc.md lines 224-252

#### 4.3 TopBar
**File:** `src/components/layout/TopBar.tsx`

Top navigation bar:
- Logo on left
- Global search in center (command palette trigger)
- Right: Alerts icon (with count badge), theme toggle, user menu

Height: 64px
Background: `bg-gray-900`
Border bottom: `border-gray-800`

**Reference:** designdoc.md lines 173-198

#### 4.4 Breadcrumbs
**File:** `src/components/layout/Breadcrumbs.tsx`

Navigation trail: `Dashboard > Cases > CASE-2025-1234`
- 12px Regular font
- Separator: `>` in gray-500
- Links: gray-400, hover gray-50
- Current (last): gray-50, not clickable

**Reference:** designdoc.md lines 253-261

---

### Phase 5: Page Components (CRITICAL - MUST WORK WITH REAL API)

#### 5.1 Dashboard Page
**File:** `src/pages/Dashboard.tsx`

**CURRENT ISSUE:** Shows hardcoded `Total Threats: 0`, `System Health: 100%`

**FIX REQUIRED:**

1. Fetch real data from multiple endpoints:
```typescript
// Use React Query to fetch data
const { data: healthData } = useQuery({
  queryKey: ['health'],
  queryFn: () => fetch('/api/v1/health').then(r => r.json())
});

const { data: alertsData } = useQuery({
  queryKey: ['alerts'],
  queryFn: () => fetch('/api/v1/alerts').then(r => r.json())
});

const { data: casesData } = useQuery({
  queryKey: ['cases'],  
  queryFn: () => fetch('/api/v1/cases').then(r => r.json())
});
```

2. Display real metrics:
- **System Health:** From health endpoint, show status badge
- **Active Threats:** Count alerts with severity HIGH/CRITICAL
- **Open Cases:** Count cases with status OPEN/IN_PROGRESS
- **Trust Score Average:** Calculate from user trust scores

3. Components to show:
- 4 KPI cards (grid)
- Recent alerts table (last 5)
- Trust score trend chart (last 7 days)
- Active cases list

4. States:
- Loading: Show skeleton cards
- Error: Show error state with retry
- Empty: Show appropriate empty message

**Reference:** designdoc.md lines 652-715, FilesRequested.txt lines 99-108

#### 5.2 Users Page
**File:** `src/pages/Users.tsx`

**CURRENT ISSUE:** Only shows static description, no table/list

**FIX REQUIRED:**

1. Fetch users with pagination:
```typescript
const [page, setPage] = useState(1);
const [search, setSearch] = useState('');
const [roleFilter, setRoleFilter] = useState('');

const { data, isLoading } = useQuery({
  queryKey: ['users', page, search, roleFilter],
  queryFn: () => fetch(
    `/api/v1/users?page=${page}&pageSize=20&search=${search}&role=${roleFilter}`
  ).then(r => r.json())
});
```

2. Display as data table with columns:
- Avatar + Name
- Email
- Role (badge)
- Status (badge)
- Trust Score (TrustScoreBadge)
- Department
- Last Login (relative time)
- Actions (view details button)

3. Features:
- Search bar (filters by name/email)
- Role filter dropdown (All/Admin/Analyst/Viewer)
- Status filter (Active/Inactive/Suspended)
- Pagination controls
- Sortable columns
- Click row to navigate to user detail

4. Fetch trust scores for each user:
```typescript
// For each user, fetch their trust score
const trustScores = useQueries({
  queries: users.map(user => ({
    queryKey: ['trust', user.id],
    queryFn: () => fetch(`/api/v1/trust/users/${user.id}`).then(r => r.json())
  }))
});
```

**Reference:** designdoc.md lines 716-749

#### 5.3 Trust Detail Page
**File:** `src/pages/trust/EntityTrustDetail.tsx`

**CURRENT ISSUES:**
- Uses hardcoded `mockTimeline` array
- Shows fake `decayRate: 0.5` and `baselineScore: 50` from wrapper
- No real history fetch

**FIX REQUIRED:**

1. Remove mock timeline, fetch real history:
```typescript
const { id } = useParams();

const { data: trustState } = useQuery({
  queryKey: ['trust', id],
  queryFn: () => fetch(`/api/v1/trust/users/${id}`).then(r => r.json())
});

const { data: trustHistory } = useQuery({
  queryKey: ['trust-history', id],
  queryFn: () => fetch(`/api/v1/trust/users/${id}/history?limit=30`).then(r => r.json())
});
```

2. Display real data:
- Header: User info + current trust score (large TrustScoreBadge)
- KPI row: Score, Confidence, Risk Level, Last Updated
- Chart: Trust score over time (from history)
- Timeline: List of trust decisions with reasons

3. Remove `decayRate` and `baselineScore` fields OR:
   - Show only if backend provides them
   - Add note: "Decay rate and baseline coming soon" if not available

4. Add trust evaluation form (if user is admin):
```typescript
const evaluateMutation = useMutation({
  mutationFn: (data) => fetch('/api/v1/trust/evaluate', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  onSuccess: () => {
    queryClient.invalidateQueries(['trust', id]);
  }
});
```

**Reference:** FilesRequested.txt lines 45-73, designdoc.md lines 564-603

#### 5.4 Alerts Page
**File:** `src/pages/Alerts.tsx`

**CURRENT ISSUE:** Placeholder only

**CREATE:**

1. Fetch alerts:
```typescript
const { data: alerts } = useQuery({
  queryKey: ['alerts'],
  queryFn: () => fetch('/api/v1/alerts').then(r => r.json())
});
```

2. Display as list/table:
- Severity badge (color-coded)
- Description
- Entity ID (link to user)
- Timestamp (relative)
- Actions (view details, dismiss)

3. Features:
- Filter by severity
- Sort by time (newest first)
- Search alerts
- Pagination
- Click to see alert details

4. Real-time updates (if WebSocket available):
```typescript
useEffect(() => {
  const ws = new WebSocket('ws://localhost:8080/alerts');
  ws.onmessage = (event) => {
    const newAlert = JSON.parse(event.data);
    queryClient.setQueryData(['alerts'], (old) => [newAlert, ...old]);
  };
  return () => ws.close();
}, []);
```

**Reference:** FilesRequested.txt lines 110-120

#### 5.5 Cases Page
**File:** `src/pages/Cases.tsx`

**CURRENT ISSUE:** Placeholder only

**CREATE:**

1. Fetch cases:
```typescript
const { data: cases } = useQuery({
  queryKey: ['cases'],
  queryFn: () => fetch('/api/v1/cases').then(r => r.json())
});
```

2. Display as cards or table:
- Case ID
- Title
- Status badge (Open/Closed/In Progress)
- Severity badge
- Assigned analyst
- Opened date
- Actions (view, assign, close)

3. Features:
- Filter by status/severity
- Assign case to analyst
- Change case status
- Create new case button
- Click case to see details

**Reference:** FilesRequested.txt lines 122-133

#### 5.6 Policies Page
**File:** `src/pages/Policies.tsx`

**CURRENT ISSUE:** Static markup only

**CREATE:**

1. Fetch policies:
```typescript
const { data: policies } = useQuery({
  queryKey: ['policies'],
  queryFn: () => fetch('/api/v1/policies').then(r => r.json())
});
```

2. Display as list:
- Policy name
- Description
- Enabled toggle switch
- Edit/Delete actions

3. Features:
- Enable/disable policy (toggle)
```typescript
const toggleMutation = useMutation({
  mutationFn: (policyId) => fetch(`/api/v1/policies/${policyId}/toggle`, {
    method: 'POST'
  }),
  onSuccess: () => {
    queryClient.invalidateQueries(['policies']);
  }
});
```
- Create new policy (opens modal)
- Edit policy (opens modal)
- Delete policy (with confirmation)

**Reference:** FilesRequested.txt lines 135-145

#### 5.7 Approvals Page
**File:** `src/pages/Approvals.tsx`

**CURRENT ISSUE:** 
- `handleApprove` and `handleDeny` are TODOs with `console.log`
- No real API calls

**FIX REQUIRED:**

1. Fetch approval requests:
```typescript
const { data: requests } = useQuery({
  queryKey: ['approval-requests'],
  queryFn: () => fetch('/api/v1/controls/requests').then(r => r.json())
});
```

2. Implement approve action:
```typescript
const approveMutation = useMutation({
  mutationFn: (requestId: string) => 
    fetch(`/api/v1/controls/approve/${requestId}`, {
      method: 'POST'
    }).then(r => r.json()),
  onSuccess: () => {
    queryClient.invalidateQueries(['approval-requests']);
    toast.success('Request approved');
  },
  onError: (error) => {
    toast.error('Failed to approve request');
  }
});

const handleApprove = (requestId: string) => {
  approveMutation.mutate(requestId);
};
```

3. Implement deny action:
```typescript
const denyMutation = useMutation({
  mutationFn: (requestId: string) => 
    fetch(`/api/v1/controls/deny/${requestId}`, {
      method: 'POST'
    }).then(r => r.json()),
  onSuccess: () => {
    queryClient.invalidateQueries(['approval-requests']);
    toast.success('Request denied');
  },
  onError: (error) => {
    toast.error('Failed to deny request');
  }
});

const handleDeny = (requestId: string) => {
  denyMutation.mutate(requestId);
};
```

4. Display:
- List of pending requests
- Request details (type, entity, timestamp)
- Approve/Deny buttons (disabled while loading)
- Show success/error feedback

---

### Phase 6: API Client Cleanup

#### 6.1 Trust API Client
**File:** `src/api/trust.ts`

**CURRENT ISSUE:** 
- `trustApi.getEntityTrust()` adds fake fields: `decayRate: 0.5, baselineScore: 50`

**FIX:**

```typescript
// REMOVE the wrapper that adds fake fields
// Use only the real backend response

export const getTrustState = async (entityId: string): Promise<TrustStateResponse> => {
  const response = await client.get(`/trust/users/${entityId}`);
  return response; // Return as-is from backend
};

export const getTrustHistory = async (
  entityId: string, 
  limit = 30
): Promise<TrustHistoryEntry[]> => {
  const response = await client.get(`/trust/users/${entityId}/history`, {
    params: { limit }
  });
  return response;
};

export const evaluateTrust = async (
  request: EvaluateTrustRequest
): Promise<TrustStateResponse> => {
  const response = await client.post('/trust/evaluate', request);
  return response;
};

// Type definitions matching ACTUAL backend
export interface TrustStateResponse {
  entityId: string;
  trustScore: number;
  confidence: number;
  lastUpdated: string;
}

export interface TrustHistoryEntry {
  decisionId: string;
  entityId: string;
  trustScore: number;
  confidence: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  timestamp: string;
}
```

**NO mock data wrappers!** If `env.enableMockData` is true, handle it at the client level, not in individual API files.

#### 6.2 Remove Mock Data Flag OR Add Warning
**File:** `src/App.tsx`

Add warning banner when mock mode is active:

```typescript
{env.enableMockData && (
  <div className="bg-warning-500 text-gray-900 px-4 py-2 text-center font-semibold">
    ⚠️ MOCK DATA MODE - All data are simulated
  </div>
)}
```

---

### Phase 7: Utilities & Helpers

#### 7.1 Date Formatting
**File:** `src/utils/dateUtils.ts`

```typescript
export const formatRelativeTime = (timestamp: string): string => {
  // "2 hours ago", "3 days ago", etc.
};

export const formatDateTime = (timestamp: string): string => {
  // "Feb 13, 2026 at 2:30 PM"
};

export const formatDate = (timestamp: string): string => {
  // "Feb 13, 2026"
};
```

#### 7.2 String Utilities
**File:** `src/utils/stringUtils.ts`

```typescript
export const truncate = (text: string, length: number): string => {
  // Truncate with ellipsis
};

export const capitalize = (text: string): string => {
  // Capitalize first letter
};
```

#### 7.3 Trust Score Utilities
**File:** `src/utils/trustUtils.ts`

```typescript
import { trustScoreRanges } from '@/config/designTokens';

export const getTrustRange = (score: number) => {
  if (score >= 80) return trustScoreRanges.high;
  if (score >= 60) return trustScoreRanges.medium;
  if (score >= 40) return trustScoreRanges.low;
  return trustScoreRanges.critical;
};

export const getTrustGradient = (score: number): string => {
  const range = getTrustRange(score);
  return range.gradient;
};

export const getTrustLabel = (score: number): string => {
  const range = getTrustRange(score);
  return range.label;
};
```

---

## 🎯 Implementation Requirements

### TypeScript Standards
- ✅ Use strict TypeScript
- ✅ Define interfaces for all props
- ✅ Define interfaces matching backend DTOs exactly
- ✅ No `any` types
- ✅ Export types from `.types.ts` files

### React Best Practices
- ✅ Use functional components + hooks
- ✅ Use React Query for all data fetching
- ✅ Proper loading/error/empty states everywhere
- ✅ Accessible components (ARIA labels, keyboard nav)
- ✅ Responsive design (mobile-first)

### Design System Adherence
- ✅ Use ONLY colors from design.json
- ✅ Use ONLY spacing values from design.json
- ✅ Follow typography scale exactly
- ✅ Match component specs from designdoc.md
- ✅ Implement all animations (shimmer, fadeIn, etc.)
- ✅ Dark theme throughout

### API Integration
- ✅ NO hardcoded data in components
- ✅ NO mock data wrappers (unless behind `env.enableMockData` flag)
- ✅ All endpoints call real backend
- ✅ Proper error handling with user-friendly messages
- ✅ Optimistic updates where appropriate
- ✅ Loading states for all async operations

### File Structure
```
src/
├── api/
│   ├── client.ts
│   ├── trust.ts
│   ├── trust.types.ts
│   ├── users.ts
│   ├── users.types.ts
│   ├── alerts.ts
│   ├── cases.ts
│   ├── policies.ts
│   └── controls.ts
├── components/
│   ├── layout/
│   │   ├── AppLayout.tsx
│   │   ├── Sidebar.tsx
│   │   ├── TopBar.tsx
│   │   └── Breadcrumbs.tsx
│   ├── ui/
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Badge.tsx
│   │   ├── Input.tsx
│   │   ├── Modal.tsx
│   │   ├── Select.tsx
│   │   ├── Toggle.tsx
│   │   ├── LoadingState.tsx
│   │   ├── ErrorState.tsx
│   │   └── EmptyState.tsx
│   └── trust/
│       ├── TrustScoreBadge.tsx
│       ├── TrustTrendChart.tsx
│       └── TrustDelta.tsx
├── pages/
│   ├── Dashboard.tsx
│   ├── Users.tsx
│   ├── Alerts.tsx
│   ├── Cases.tsx
│   ├── Policies.tsx
│   ├── Approvals.tsx
│   └── trust/
│       └── EntityTrustDetail.tsx
├── config/
│   ├── designTokens.ts
│   └── env.ts
├── utils/
│   ├── dateUtils.ts
│   ├── stringUtils.ts
│   └── trustUtils.ts
├── App.tsx
└── main.tsx
```

---

## ✅ Quality Checklist

Before marking as complete, verify:

### Design Compliance
- [ ] All colors match design.json exactly
- [ ] Typography uses Inter Tight and JetBrains Mono
- [ ] Spacing follows design.json scale
- [ ] Components match designdoc.md specifications
- [ ] Animations implemented (shimmer, fadeIn, slideUp)
- [ ] Dark theme throughout (#080C08 background)
- [ ] Trust score colors match gradient ranges

### Functionality
- [ ] Dashboard shows real metrics from backend
- [ ] Users page fetches and displays real users with trust scores
- [ ] Trust detail page shows real history (no mock timeline)
- [ ] Alerts/Cases/Policies pages fetch and display real data
- [ ] Approvals page approve/deny actions work (no TODOs)
- [ ] All API calls go to http://localhost:8080/api/v1/*
- [ ] No mock data wrappers (or properly flagged if present)

### UX
- [ ] Loading states show skeleton/spinner
- [ ] Error states show user-friendly messages with retry
- [ ] Empty states show appropriate messaging
- [ ] Forms have validation
- [ ] Success/error feedback after actions (toast/alert)
- [ ] Responsive layout (works on mobile/tablet/desktop)

### Code Quality
- [ ] TypeScript strict mode enabled
- [ ] All interfaces defined
- [ ] No console.log (except in dev mode)
- [ ] Components are reusable
- [ ] Proper file organization
- [ ] Comments for complex logic

### Accessibility
- [ ] Keyboard navigation works
- [ ] ARIA labels on interactive elements
- [ ] Focus visible on all interactive elements
- [ ] Color contrast meets WCAG 2.1 AA
- [ ] Screen reader friendly

---

## 📁 Deliverable Format

Provide all files in organized folders:

```
/outputs/
  ├── config/
  │   ├── tailwind.config.js
  │   ├── designTokens.ts
  │   └── env.ts
  ├── components/
  │   ├── layout/
  │   ├── ui/
  │   └── trust/
  ├── pages/
  ├── api/
  ├── utils/
  ├── INTEGRATION_GUIDE.md    (How to integrate into existing project)
  └── COMPONENTS_DEMO.md      (Component usage examples)
```

---

## 🚀 Getting Started Instructions for Claude

1. **Read design.json and designdoc.md FIRST** - Understand the complete design system
2. **Review FilesRequested.txt** - Understand backend contracts and current issues
3. **Start with foundation** - Tailwind config, design tokens, env config
4. **Build core UI components** - Button, Card, Badge, Input, Modal, etc.
5. **Create trust components** - TrustScoreBadge with SVG circular progress
6. **Build layout** - AppLayout, Sidebar, TopBar
7. **Fix pages** - Remove mocks, connect to real APIs, implement proper states
8. **Clean API clients** - Remove mock wrappers, use real backend responses
9. **Add utilities** - Date formatting, trust score helpers
10. **Test thoroughly** - Verify all features work with real backend

### Critical Reminders
- ⚠️ **NO MOCKED DATA** - All components must fetch from real backend
- ⚠️ **EXACT COLOR MATCHING** - Use design.json colors precisely
- ⚠️ **COMPLETE SPECIFICATIONS** - Follow designdoc.md exactly for components
- ⚠️ **PROPER ERROR HANDLING** - Every API call needs try/catch and error states
- ⚠️ **LOADING STATES** - Show skeletons/spinners while data loads
- ⚠️ **EMPTY STATES** - Show appropriate message when no data exists

---

## 📖 Additional Notes

### Backend Known Limitations
- Trust engine only returns 4 fields (entityId, trustScore, confidence, lastUpdated)
- Dashboard endpoint might not exist - use /api/v1/health instead
- Some services (reports, settings, timeline) might not have backend yet - show "Coming Soon"

### Future Enhancements (Don't implement now)
- Real-time WebSocket updates for alerts
- Advanced filtering and search
- Export functionality (CSV, PDF)
- Dark/Light theme toggle
- User preferences persistence
- Keyboard shortcuts (command palette)

### Testing Recommendations
- Test with backend running: `docker compose up -d`
- Verify API gateway routes are configured
- Check CORS is enabled on backend
- Test with real data, not mocks
- Test error scenarios (backend down, invalid data)
- Test on different screen sizes

---

**END OF MASTER PROMPT**

Version: 1.0  
Last Updated: February 13, 2026  
Author: INSIGHT-X Development Team
