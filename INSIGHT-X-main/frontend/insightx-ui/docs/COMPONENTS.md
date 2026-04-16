# Component Library Documentation

## Overview

INSIGHT-X uses a custom component library built on React and TailwindCSS, following atomic design principles.

## Design System Primitives

### Button

**Import:** `import { Button } from '@components/ui/Button';`

**Usage:**
```typescript
<Button variant="primary" size="md" onClick={handleClick}>
  Click Me
</Button>
```

**Props:**
- `variant`: `'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'`
- `size`: `'sm' | 'md' | 'lg'`
- `disabled`: `boolean`
- `loading`: `boolean`
- `icon`: `React.ReactNode`

### Card

**Import:** `import { Card } from '@components/ui/Card';`

**Usage:**
```typescript
<Card>
  <Card.Header>Title</Card.Header>
  <Card.Content>Content here</Card.Content>
  <Card.Footer>Actions</Card.Footer>
</Card>
```

### Badge

**Import:** `import { Badge } from '@components/ui/Badge';`

**Usage:**
```typescript
<Badge variant="success">Active</Badge>
<Badge variant="warning">Pending</Badge>
<Badge variant="error">Critical</Badge>
```

**Variants:**
- `success`, `warning`, `error`, `info`, `neutral`

### Input

**Import:** `import { Input } from '@components/ui/Input';`

**Usage:**
```typescript
<Input
  label="Email"
  type="email"
  placeholder="Enter email"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  error={errors.email}
/>
```

## Layout Components

### AppLayout

Main application shell with sidebar and header.

```typescript
<AppLayout>
  <YourPageContent />
</AppLayout>
```

### Sidebar

Navigation sidebar with links and user profile.

### TopBar

Header with breadcrumbs, search, and notifications.

## Chart Components

### TrustScoreChart

Displays trust score over time.

```typescript
<TrustScoreChart data={trustHistory} />
```

### RiskDistributionChart

Shows distribution of risk levels.

```typescript
<RiskDistributionChart data={riskData} />
```

## Streaming Components

### LiveFeedPanel

Real-time trust decision feed.

```typescript
<LiveFeedPanel />
```

## Best Practices

### Component Composition
```typescript
// Good - Composable
<Card>
  <Card.Header>
    <Heading>User Profile</Heading>
  </Card.Header>
  <Card.Content>
    <UserDetails user={user} />
  </Card.Content>
</Card>

// Avoid - Monolithic
<UserCard user={user} />
```

### Prop Types
```typescript
// Always define prop interfaces
interface ButtonProps {
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  children: React.ReactNode;
}
```

### Accessibility
- Use semantic HTML
- Include ARIA labels
- Keyboard navigation support
- Focus management

### Performance
- Memoize expensive components
- Use virtualization for long lists
- Lazy load heavy components

## Styling Guidelines

### TailwindCSS
- Use utility classes
- Follow design system tokens
- Create reusable class combinations

### Custom Styles
- Avoid inline styles
- Use CSS modules for complex styles
- Follow naming conventions

## Testing Components

```typescript
import { render, screen, fireEvent } from '@testing-library/react';

describe('Button', () => {
  it('calls onClick when clicked', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click</Button>);
    
    fireEvent.click(screen.getByText('Click'));
    expect(handleClick).toHaveBeenCalled();
  });
});
```

## Adding New Components

1. Create component file in appropriate directory
2. Define TypeScript interface for props
3. Implement component with accessibility
4. Add stories (if using Storybook)
5. Write tests
6. Document in this file

---

For questions or additions to the component library, contact the frontend team.
