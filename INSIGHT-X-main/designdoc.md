# INSIGHT-X Design System Documentation

**Version:** 1.0  
**Last Updated:** February 10, 2026  
**Status:** Draft

---

## 1. Design Philosophy

INSIGHT-X is a security operations platform designed for 24/7 SOC environments. The design system prioritizes:

- **Clarity in Critical Situations**: High-contrast, easily scannable information architecture
- **Dark-First Design**: Optimized for low-light environments and reduced eye strain
- **Data Density with Hierarchy**: Show complex security data without overwhelming analysts
- **Trust-Centric Visual Language**: Visual metaphors that reinforce trust scores, risk levels, and campaign progression
- **Accessibility**: WCAG 2.1 AA compliance for keyboard navigation and screen readers

---

## 2. Typography

### Primary Typeface: **Inter Tight**

Based on the reference design, we'll use **Inter Tight** for its excellent readability and modern aesthetic suitable for data-heavy interfaces.

#### Font Weights & Usage

| Weight | Usage | Example |
|--------|-------|---------|
| **Regular (400)** | Body text, descriptions, secondary information | Event descriptions, case notes |
| **Medium (500)** | Labels, metadata, table headers | "Trust Score", "Created At" |
| **Semibold (600)** | Emphasized text, important metrics | User names, resource identifiers |
| **Bold (700)** | Page headings, section titles, primary CTAs | "Dashboard", "Case Detail" |

#### Type Scale

```
H1 (Page Titles):        32px / 2rem     - Bold (700)    - Letter-spacing: -0.02em
H2 (Section Headings):   24px / 1.5rem   - Bold (700)    - Letter-spacing: -0.01em
H3 (Card Titles):        20px / 1.25rem  - Semibold (600)
H4 (Subsections):        18px / 1.125rem - Semibold (600)
H5 (Labels):             16px / 1rem     - Medium (500)
Body (Regular):          14px / 0.875rem - Regular (400) - Line-height: 1.5
Body (Small):            12px / 0.75rem  - Regular (400) - Line-height: 1.4
Caption:                 11px / 0.6875rem - Regular (400) - Line-height: 1.3
```

### Monospace Typeface: **JetBrains Mono**

For technical data, event IDs, timestamps, and code snippets.

```
Event IDs:    13px / 0.8125rem - Regular (400)
Timestamps:   12px / 0.75rem   - Regular (400)
Code:         13px / 0.8125rem - Regular (400)
```

---

## 3. Color Palette

### Foundation Colors

Inspired by the reference design, adapted for security operations:

#### Primary (Trust/Security)
```css
--primary-50:  #E6F0FF   /* Lightest blue tint */
--primary-100: #B3D4FF
--primary-200: #80B8FF
--primary-300: #4D9CFF
--primary-400: #306FFF   /* Primary blue - trust positive */
--primary-500: #0D4FCC
--primary-600: #0A3E99
--primary-700: #072D66
--primary-800: #051F44
--primary-900: #021022
```

#### Accent (Highlight/Interactive)
```css
--accent-cyan-400:   #30F0B3   /* Success, positive trend */
--accent-cyan-500:   #1DD9A0
--accent-yellow-400: #FAD670   /* Warning, attention */
--accent-yellow-500: #F5C842
```

#### Semantic Colors

**Success/Positive**
```css
--success-400: #30F0B3   /* Trust increase, benign activity */
--success-500: #1DD9A0
--success-600: #16B383
--success-bg:  rgba(48, 240, 179, 0.1)
```

**Warning/Attention**
```css
--warning-400: #FAD670   /* Medium risk, needs review */
--warning-500: #F5C842
--warning-600: #D4A820
--warning-bg:  rgba(250, 214, 112, 0.1)
```

**Danger/Critical**
```css
--danger-400: #FF5C5C    /* Critical alerts, malicious intent */
--danger-500: #FF3333
--danger-600: #E61A1A
--danger-bg:  rgba(255, 92, 92, 0.1)
```

**Info/Neutral**
```css
--info-400: #7B9FFF
--info-500: #5580FF
--info-600: #3366FF
--info-bg:  rgba(123, 159, 255, 0.1)
```

#### Neutral/Gray Scale (Dark Theme Primary)

```css
--gray-50:  #FFFFFF   /* Pure white - text on dark */
--gray-100: #F5F5F7   /* Off-white */
--gray-200: #E5E5EA   /* Light gray */
--gray-300: #C4C4CC   /* Medium-light gray */
--gray-400: #9E9EA7   /* Medium gray - disabled text */
--gray-500: #6E6E73   /* Dark gray - secondary text */
--gray-600: #48484D   /* Darker gray - borders */
--gray-700: #2C2C2E   /* Card background */
--gray-800: #1C1C1E   /* Panel background */
--gray-900: #080C08   /* Page background (nearly black) */
--gray-950: #000000   /* Pure black */
```

#### Background Hierarchy (Dark Theme)

```css
--bg-primary:   #080C08    /* Main page background */
--bg-secondary: #1C1C1E    /* Panel/section background */
--bg-tertiary:  #2C2C2E    /* Card background */
--bg-elevated:  #36363A    /* Modal/dropdown background */
--bg-overlay:   rgba(0, 0, 0, 0.6)  /* Modal overlay */
```

#### Text Colors (Dark Theme)

```css
--text-primary:    #FFFFFF         /* Primary headings, key data */
--text-secondary:  rgba(255, 255, 255, 0.7)  /* Body text, descriptions */
--text-tertiary:   rgba(255, 255, 255, 0.5)  /* Metadata, timestamps */
--text-disabled:   rgba(255, 255, 255, 0.3)  /* Disabled state */
--text-inverse:    #080C08         /* Text on light backgrounds */
```

#### Border Colors

```css
--border-subtle:  rgba(255, 255, 255, 0.08)  /* Dividers, card borders */
--border-default: rgba(255, 255, 255, 0.12)  /* Input borders */
--border-strong:  rgba(255, 255, 255, 0.18)  /* Emphasized borders */
--border-focus:   #306FFF                     /* Focus state */
```

---

## 4. Component Design System

### 4.1 Layout Components

#### App Layout

```
┌─────────────────────────────────────────────────────────────────┐
│  Top Bar (64px)                                                 │
│  [Logo]  [Global Search]        [Alerts] [Theme] [User Menu]   │
├──────┬──────────────────────────────────────────────────────────┤
│      │                                                          │
│ Side │  Page Content Area                                       │
│ Nav  │  [Breadcrumbs]                                          │
│ 240px│  [Page Header]                                          │
│      │  [Content Sections]                                     │
│      │                                                          │
│ Coll-│                                                          │
│ apse │                                                          │
│ 64px │                                                          │
└──────┴──────────────────────────────────────────────────────────┘
```

**Specifications:**
- Top bar: Fixed, 64px height, `bg-gray-900`, `border-b border-border-subtle`
- Sidebar: Fixed, 240px width (collapsed: 64px), `bg-gray-800`
- Content area: Padding 24px, max-width 1920px, centered
- Responsive: Sidebar overlay on mobile (<768px)

#### Card Component

```
┌─────────────────────────────────────────────┐
│  ┌─ Icon  Card Title              [Action] │
│  │                                          │
│  └─ Subtitle / Description                 │
│                                             │
│  Content Area                               │
│  (Charts, tables, metrics)                  │
│                                             │
│  Footer (optional)                          │
└─────────────────────────────────────────────┘
```

**Variants:**
- **Default**: `bg-gray-700`, `border border-border-subtle`, `rounded-lg` (8px)
- **Elevated**: `bg-gray-700`, `shadow-lg`, no border
- **Outlined**: `bg-transparent`, `border border-border-default`
- **Glass**: `bg-gray-700/50`, `backdrop-blur-md`, `border border-border-subtle`

**Spacing:**
- Padding: 20px (desktop), 16px (mobile)
- Gap between cards: 16px

### 4.2 Navigation Components

#### Sidebar Navigation Item

```
Active State:
┌─────────────────────────────┐
│ [Icon]  Dashboard           │  ← bg-primary-400/10, border-l-2 primary-400
└─────────────────────────────┘

Hover State:
┌─────────────────────────────┐
│ [Icon]  Cases               │  ← bg-gray-600/50
└─────────────────────────────┘

Default State:
┌─────────────────────────────┐
│ [Icon]  Campaigns           │  ← transparent, text-gray-300
└─────────────────────────────┘
```

**Specifications:**
- Height: 44px
- Padding: 12px 16px
- Icon size: 20px, margin-right 12px
- Font: 14px Medium
- Active indicator: 2px left border, background overlay
- Transition: all 150ms ease

#### Breadcrumbs

```
Dashboard  >  Cases  >  CASE-2025-1234
  ↑ Link      ↑ Link      ↑ Current (not clickable)
```

**Specifications:**
- Font: 12px Regular
- Color: Links `text-gray-400`, Current `text-gray-50`
- Separator: `>` in `text-gray-600`, margin 8px
- Hover: `text-primary-400`, underline

### 4.3 Data Display Components

#### Stat Card (KPI Metric)

```
┌─────────────────────────────────┐
│ Trust Posture Score             │  ← Label (12px, text-gray-400)
│                                 │
│ 72.4                            │  ← Value (32px Bold, text-gray-50)
│ ↑ 5.2% vs last quarter          │  ← Delta (12px, success/danger color)
│                                 │
│ [Sparkline chart]               │  ← Mini trend (optional)
└─────────────────────────────────┘
```

**Delta Colors:**
- Positive (trust increase): `text-success-400`, `↑` arrow
- Negative (trust decrease): `text-danger-400`, `↓` arrow
- Neutral: `text-gray-400`, `→` arrow

#### Trust Score Badge

```
Visual: Circular progress ring with score in center

  ┌───────┐
  │  ╱ ╲  │
  │ │ 72│ │  ← Score (20px Bold)
  │  ╲ ╱  │
  └───────┘
   ▓▓▓▓░░   ← Progress ring (gradient based on score)
```

**Color Gradient:**
- 80-100: `from-success-400 to-success-600` (High trust)
- 60-79:  `from-primary-400 to-primary-600` (Medium trust)
- 40-59:  `from-warning-400 to-warning-600` (Low trust)
- 0-39:   `from-danger-400 to-danger-600` (Critical trust)

#### Alert Severity Badge

```
┌────────────┐   ┌────────────┐   ┌────────────┐   ┌────────────┐
│ ● Critical │   │ ● High     │   │ ● Medium   │   │ ● Low      │
└────────────┘   └────────────┘   └────────────┘   └────────────┘
   Danger          Warning          Info            Gray
```

**Specifications:**
- Font: 11px Semibold, uppercase
- Padding: 4px 8px
- Border-radius: 4px
- Dot: 6px circle, margin-right 6px
- Colors: Background is 10% opacity of main color

### 4.4 Interactive Components

#### Button System

**Primary Button (CTA)**
```css
background: linear-gradient(135deg, #306FFF, #0D4FCC);
color: #FFFFFF;
padding: 10px 20px;
border-radius: 6px;
font: 14px Semibold;
transition: all 200ms ease;

hover: brightness(1.1), shadow-md;
active: brightness(0.9), scale(0.98);
disabled: opacity 0.5, cursor not-allowed;
```

**Secondary Button**
```css
background: transparent;
border: 1px solid rgba(255, 255, 255, 0.18);
color: #FFFFFF;
padding: 10px 20px;
border-radius: 6px;

hover: background rgba(255, 255, 255, 0.05), border-color rgba(255, 255, 255, 0.3);
```

**Danger Button**
```css
background: linear-gradient(135deg, #FF5C5C, #E61A1A);
color: #FFFFFF;
padding: 10px 20px;
border-radius: 6px;

hover: brightness(1.1);
```

**Icon Button (Ghost)**
```css
background: transparent;
padding: 8px;
border-radius: 6px;
color: rgba(255, 255, 255, 0.7);

hover: background rgba(255, 255, 255, 0.08), color #FFFFFF;
```

#### Input Fields

**Text Input**
```
┌─────────────────────────────────────┐
│ Placeholder text                    │
└─────────────────────────────────────┘

Default:
- Background: rgba(255, 255, 255, 0.05)
- Border: 1px solid rgba(255, 255, 255, 0.12)
- Color: #FFFFFF
- Padding: 10px 12px
- Border-radius: 6px
- Font: 14px Regular

Focus:
- Border: 1px solid #306FFF
- Background: rgba(48, 111, 255, 0.05)
- Shadow: 0 0 0 3px rgba(48, 111, 255, 0.1)

Error:
- Border: 1px solid #FF5C5C
- Background: rgba(255, 92, 92, 0.05)
```

**Search Input (with icon)**
```
┌─ 🔍 ─────────────────────────────────┐
│      Search users, cases, events...  │
└──────────────────────────────────────┘
```

#### Dropdown / Select

```
┌─────────────────────────────── ▼ ┐
│ Selected Option                   │
└───────────────────────────────────┘
        ↓ (on click)
┌───────────────────────────────────┐
│ ✓ Selected Option                 │  ← bg-primary-400/10
│   Option 2                        │
│   Option 3                        │
└───────────────────────────────────┘
```

**Specifications:**
- Dropdown background: `bg-gray-800`, `shadow-xl`
- Border: `border border-border-strong`
- Item hover: `bg-gray-700`
- Item selected: `bg-primary-400/10`, checkmark icon
- Max height: 320px, scroll if overflow

#### Toggle Switch

```
OFF:                    ON:
┌────────┐             ┌────────┐
│ ○      │             │      ● │
└────────┘             └────────┘
Gray                   Primary-400
```

**Specifications:**
- Width: 44px, Height: 24px
- Circle: 18px diameter
- Transition: 200ms ease
- Off: `bg-gray-600`, circle left
- On: `bg-primary-400`, circle right

### 4.5 Data Visualization Components

#### Timeline Event Item

```
┌─────────────────────────────────────────────────────────────┐
│  14:22:35                                              [•••] │  ← Time + Actions menu
│  Data Access Event                                          │  ← Event type
│                                                              │
│  User: john.doe@corp.com accessed customer-db               │  ← Description
│  Risk Score: 65  |  Resource: customer-db                   │  ← Metadata
│                                                              │
│  [3 Contributing Signals]                                   │  ← Expandable details
└─────────────────────────────────────────────────────────────┘
   │  ← Timeline connector line (2px, gray-600)
```

**Visual Indicators:**
- Left border: 3px, color based on risk severity
- Risk score: Colored badge (same as trust score gradient)
- Hover: slight elevation, `shadow-md`

#### Chart Styling (Generic)

**Line/Area Charts:**
- Line width: 2px
- Grid lines: `stroke: rgba(255, 255, 255, 0.05)`
- Axis labels: 11px, `text-gray-400`
- Tooltip: `bg-gray-800`, `shadow-xl`, `border border-border-strong`
- Colors: Use primary/accent colors from palette

**Gradient Fills:**
```css
Trust trend (positive): 
  from: rgba(48, 240, 179, 0.3) 
  to:   rgba(48, 240, 179, 0.0)

Trust trend (negative):
  from: rgba(255, 92, 92, 0.3)
  to:   rgba(255, 92, 92, 0.0)
```

### 4.6 Modal System

```
Overlay: rgba(0, 0, 0, 0.6) with backdrop-blur-sm

┌─────────────────────────────────────────────────┐
│  Modal Title                              [✕]   │  ← Header (bg-gray-800)
├─────────────────────────────────────────────────┤
│                                                 │
│  Modal Content Area                             │  ← Body (bg-gray-700)
│  (Forms, data, confirmation message)            │
│                                                 │
├─────────────────────────────────────────────────┤
│                    [Cancel]  [Confirm Action]   │  ← Footer (bg-gray-800)
└─────────────────────────────────────────────────┘
```

**Specifications:**
- Max-width: 600px (small), 800px (medium), 1200px (large)
- Border-radius: 12px
- Shadow: `shadow-2xl`
- Animation: Fade in + scale from 0.95 to 1.0 (200ms)

---

## 5. Iconography

### Icon System: **Lucide Icons**

Consistent 20px icons throughout the application (24px for emphasis)

#### Core Navigation Icons

| Icon Name | Usage |
|-----------|-------|
| `LayoutDashboard` | Dashboard |
| `FolderOpen` | Cases |
| `Network` | Campaigns |
| `Bell` | Alerts |
| `Users` | User Management |
| `Clock` | Timeline |
| `Shield` | Policies |
| `Archive` | Provenance |
| `Settings` | Settings |

#### Status & Action Icons

| Icon Name | Usage |
|-----------|-------|
| `AlertCircle` | Warning status |
| `AlertTriangle` | Critical alert |
| `CheckCircle` | Success, approved |
| `XCircle` | Danger, denied |
| `Info` | Information |
| `TrendingUp` / `TrendingDown` | Trust score trends |
| `Eye` | View details |
| `MoreVertical` | Actions menu |
| `Filter` | Filter options |
| `Search` | Search functionality |

---

## 6. Spacing System

Based on 4px base unit:

```
--space-1:  4px    (0.25rem)
--space-2:  8px    (0.5rem)
--space-3:  12px   (0.75rem)
--space-4:  16px   (1rem)      ← Default gap between elements
--space-5:  20px   (1.25rem)
--space-6:  24px   (1.5rem)    ← Section padding
--space-8:  32px   (2rem)      ← Large section spacing
--space-10: 40px   (2.5rem)
--space-12: 48px   (3rem)
--space-16: 64px   (4rem)      ← Page padding
```

**Grid System:**
- 12-column grid
- Gutter: 16px (desktop), 12px (mobile)
- Container max-width: 1920px

---

## 7. Elevation & Shadows

```css
--shadow-sm:  0 1px 2px rgba(0, 0, 0, 0.3);
--shadow-md:  0 4px 8px rgba(0, 0, 0, 0.4);
--shadow-lg:  0 8px 16px rgba(0, 0, 0, 0.5);
--shadow-xl:  0 16px 32px rgba(0, 0, 0, 0.6);
--shadow-2xl: 0 24px 48px rgba(0, 0, 0, 0.7);
```

**Usage:**
- `shadow-sm`: Subtle card separation
- `shadow-md`: Hover states, elevated cards
- `shadow-lg`: Dropdowns, tooltips
- `shadow-xl`: Modals
- `shadow-2xl`: Full-screen overlays

---

## 8. Animation & Transitions

### Timing Functions

```css
--ease-in:     cubic-bezier(0.4, 0, 1, 1);
--ease-out:    cubic-bezier(0, 0, 0.2, 1);
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
--ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);
```

### Duration Standards

```css
--duration-fast:   150ms   /* Micro-interactions, hovers */
--duration-normal: 200ms   /* Button clicks, state changes */
--duration-slow:   300ms   /* Page transitions, modals */
--duration-slower: 500ms   /* Complex animations */
```

### Common Animations

**Fade In:**
```css
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
animation: fadeIn 200ms ease-out;
```

**Slide Up:**
```css
@keyframes slideUp {
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}
animation: slideUp 300ms ease-out;
```

**Pulse (for alerts):**
```css
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}
animation: pulse 2s ease-in-out infinite;
```

---

## 9. Responsive Breakpoints

```css
/* Mobile First Approach */

/* Extra Small (Mobile) */
--breakpoint-xs: 0px;

/* Small (Large Mobile / Small Tablet) */
--breakpoint-sm: 640px;

/* Medium (Tablet) */
--breakpoint-md: 768px;

/* Large (Desktop) */
--breakpoint-lg: 1024px;

/* Extra Large (Large Desktop) */
--breakpoint-xl: 1280px;

/* 2X Large (Wide Screens) */
--breakpoint-2xl: 1536px;
```

**Responsive Behavior:**
- < 768px: Sidebar collapses to overlay, single-column layout
- 768px - 1024px: Sidebar visible, 2-column dashboard grid
- > 1024px: Full desktop layout, 3-4 column dashboard grid

---

## 10. Accessibility Guidelines

### Color Contrast
- Text on dark backgrounds: Minimum 4.5:1 ratio for normal text, 3:1 for large text
- Interactive elements: Minimum 3:1 against background
- Status indicators: Never rely on color alone; use icons + text

### Keyboard Navigation
- All interactive elements must be keyboard accessible
- Visible focus indicators: `outline: 2px solid #306FFF`, `outline-offset: 2px`
- Tab order follows logical reading flow
- Modal traps focus, ESC to close

### Screen Readers
- Semantic HTML: `<nav>`, `<main>`, `<article>`, `<aside>`
- ARIA labels for icon-only buttons
- Live regions for dynamic alerts: `aria-live="polite"` or `"assertive"`
- Table headers properly associated with `scope="col"` and `scope="row"`

### Motion
- Respect `prefers-reduced-motion` media query
- Provide option to disable animations in settings

---

## 11. Page-Specific Design Patterns

### 11.1 Dashboard Layout

```
┌──────────────────────────────────────────────────────────────────┐
│  Dashboard                                    [Refresh] [Custom] │
│  A brief overview of recent activity                             │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────┐
│  │ Trust Score  │ │ Active Cases │ │ Alerts Today │ │ Campaign │
│  │    72.4      │ │     24       │ │     156      │ │ Detects  │
│  │  ↑ 5.2%      │ │  ↓ 12%       │ │  ↑ 23%       │ │    8     │
│  └──────────────┘ └──────────────┘ └──────────────┘ └──────────┘
│                                                                  │
│  ┌────────────────────────────────┐ ┌─────────────────────────┐
│  │ Trust Posture Over Time        │ │ Top Risk Indicators     │
│  │ [Area Chart]                   │ │ • Privilege escalation  │
│  │                                │ │ • Unusual access time   │
│  │                                │ │ • Data staging          │
│  └────────────────────────────────┘ └─────────────────────────┘
│                                                                  │
│  ┌──────────────────────────────────────────────────────────────┐
│  │ High Risk Users                                              │
│  │ [Table with: User, Trust Score, Last Activity, Status]       │
│  └──────────────────────────────────────────────────────────────┘
└──────────────────────────────────────────────────────────────────┘
```

**Grid:**
- 4 stat cards: 1fr each on desktop, stack on mobile
- 2 charts below: 2fr (left) + 1fr (right) on desktop, stack on mobile
- Table: full width

### 11.2 Case Detail Layout

```
┌──────────────────────────────────────────────────────────────────┐
│  ← Back to Cases                                                 │
│                                                                  │
│  CASE-2025-1234    [Badge: Open] [Badge: High]                  │
│  Subject: john.doe@corp.com                                      │
│  Assigned to: Jane Analyst                                       │
│                                                                  │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │ Trust Score: 58 │  │ Created:        │  │ Last Updated:   │ │
│  │ [Ring Chart]    │  │ Feb 8, 10:30    │  │ Feb 9, 16:45    │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
├──────────────────────────────────────────────────────────────────┤
│  [Tab: Timeline] [Tab: Hypotheses] [Tab: Graph] [Tab: Actions]  │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Timeline Tab Content:                                           │
│  ┌──────────────────────────────────────────────────────────────┐
│  │ [Filter: All Events ▼] [Date Range]                         │
│  ├──────────────────────────────────────────────────────────────┤
│  │ 14:22 - Data Access Event                             Risk:65│
│  │ User accessed customer-db from unusual location              │
│  │ [View Details]                                               │
│  ├──────────────────────────────────────────────────────────────┤
│  │ 12:15 - Privilege Escalation Attempt                  Risk:82│
│  │ Requested admin rights to finance system                     │
│  │ [View Details]                                               │
│  └──────────────────────────────────────────────────────────────┘
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

**Layout:**
- Header: Full width, sticky on scroll
- KPI cards: 3 columns on desktop, stack on mobile
- Tabs: Full width, content area below
- Events: Chronological list with filtering sidebar (desktop) or dropdown (mobile)

---

## 12. Component State Specifications

### Loading States

**Skeleton Screens:**
```css
.skeleton {
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0.05) 0%,
    rgba(255, 255, 255, 0.1) 50%,
    rgba(255, 255, 255, 0.05) 100%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 4px;
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
```

**Spinners:**
- Size: 20px (small), 32px (medium), 48px (large)
- Color: `primary-400`
- Animation: Rotate 360deg, 800ms linear infinite

### Empty States

```
┌─────────────────────────────────────┐
│                                     │
│         [Large Icon]                │
│                                     │
│    No Cases Found                   │
│    Create your first case to        │
│    start tracking insider threats   │
│                                     │
│      [Create Case Button]           │
│                                     │
└─────────────────────────────────────┘
```

**Specifications:**
- Icon: 64px, `text-gray-600`
- Title: 18px Semibold, `text-gray-300`
- Description: 14px Regular, `text-gray-500`
- Action button: Primary style

### Error States

```
┌─────────────────────────────────────┐
│         [Alert Triangle Icon]       │
│    Failed to Load Data              │
│    Unable to fetch case details.    │
│    Please try again.                │
│                                     │
│        [Retry Button]               │
└─────────────────────────────────────┘
```

---

## 13. Implementation Guidelines

### Technology Stack Integration

**React + TypeScript + Tailwind:**
```tsx
// Example: Trust Score Badge Component
interface TrustScoreBadgeProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
}

const getTrustColor = (score: number) => {
  if (score >= 80) return 'from-success-400 to-success-600';
  if (score >= 60) return 'from-primary-400 to-primary-600';
  if (score >= 40) return 'from-warning-400 to-warning-600';
  return 'from-danger-400 to-danger-600';
};

export const TrustScoreBadge: React.FC<TrustScoreBadgeProps> = ({ 
  score, 
  size = 'md' 
}) => {
  const sizeClasses = {
    sm: 'w-16 h-16 text-lg',
    md: 'w-24 h-24 text-2xl',
    lg: 'w-32 h-32 text-3xl'
  };

  return (
    <div className={`relative ${sizeClasses[size]}`}>
      <svg className="w-full h-full transform -rotate-90">
        <circle
          cx="50%"
          cy="50%"
          r="40%"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth="8"
          fill="none"
        />
        <circle
          cx="50%"
          cy="50%"
          r="40%"
          stroke={`url(#gradient-${score})`}
          strokeWidth="8"
          strokeDasharray={`${score * 2.51} 251`}
          fill="none"
          className="transition-all duration-500"
        />
        <defs>
          <linearGradient id={`gradient-${score}`}>
            <stop offset="0%" className={getTrustColor(score)} />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="font-bold text-gray-50">{score}</span>
      </div>
    </div>
  );
};
```

### Tailwind Configuration

```js
// tailwind.config.js
module.exports = {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#E6F0FF',
          400: '#306FFF',
          500: '#0D4FCC',
          600: '#0A3E99',
        },
        accent: {
          cyan: {
            400: '#30F0B3',
            500: '#1DD9A0',
          },
          yellow: {
            400: '#FAD670',
            500: '#F5C842',
          },
        },
        success: { 400: '#30F0B3', 500: '#1DD9A0', 600: '#16B383' },
        warning: { 400: '#FAD670', 500: '#F5C842', 600: '#D4A820' },
        danger: { 400: '#FF5C5C', 500: '#FF3333', 600: '#E61A1A' },
        gray: {
          50: '#FFFFFF',
          400: '#9E9EA7',
          500: '#6E6E73',
          600: '#48484D',
          700: '#2C2C2E',
          800: '#1C1C1E',
          900: '#080C08',
        },
      },
      fontFamily: {
        sans: ['Inter Tight', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        shimmer: 'shimmer 1.5s infinite',
        fadeIn: 'fadeIn 200ms ease-out',
        slideUp: 'slideUp 300ms ease-out',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        slideUp: {
          from: { transform: 'translateY(20px)', opacity: '0' },
          to: { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
};
```

---

## 14. Design Deliverables Checklist

- [x] Color palette with semantic colors
- [x] Typography scale and font specifications
- [x] Component library specifications
- [x] Layout system and grid
- [x] Iconography standards
- [x] Spacing and elevation system
- [x] Animation and transition guidelines
- [x] Responsive breakpoints
- [x] Accessibility requirements
- [x] State specifications (loading, empty, error)
- [ ] Figma component library (to be created)
- [ ] Interactive prototype (to be created)
- [ ] Design tokens JSON export (to be created)

---

## 15. Next Steps

1. **Create Figma Design Library**: Build reusable components in Figma
2. **Develop React Component Storybook**: Implement components in isolation
3. **Build Design Token System**: Export colors, spacing, typography as JSON
4. **Conduct Accessibility Audit**: WCAG 2.1 AA compliance testing
5. **User Testing**: Validate with security analysts for usability

---

## Document History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-02-10 | Initial design system based on reference designs and INSIGHT-X requirements |

---

**References:**
- Design inspiration: Arounda UX/UI Sales Analytics Dashboard
- INSIGHT-X Architecture Document v1.0
- INSIGHT-X Product Requirements Document v1.0