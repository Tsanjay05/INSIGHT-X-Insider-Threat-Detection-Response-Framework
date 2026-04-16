# Contributing to INSIGHT-X Frontend

## Development Setup

1. Fork the repository
2. Clone your fork: `git clone <your-fork-url>`
3. Install dependencies: `npm install`
4. Copy environment: `cp .env.example .env.development`
5. Start dev server: `npm run dev`

## Code Style

### TypeScript
- Use explicit types where beneficial
- Avoid `any` (use `unknown` if needed)
- Leverage type inference where clear
- Document complex types

### React
- Functional components with hooks
- Props interfaces for all components
- Use `React.FC` sparingly (only when children are needed)
- Extract custom hooks for reusable logic

### File Naming
- Components: PascalCase (`UserCard.tsx`)
- Hooks: camelCase with `use` prefix (`useTrustStream.ts`)
- Utils: camelCase (`formatDate.ts`)
- Constants: UPPER_SNAKE_CASE

### Import Order
1. External libraries
2. Internal modules (with `@` aliases)
3. Relative imports
4. Types
5. CSS/assets

```typescript
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';

import { Button } from '@components/ui/Button';
import { formatDate } from '@lib/utils';

import type { User } from '@api/types';
```

## Component Guidelines

### Structure
```typescript
// 1. Imports
import { ... } from '...';

// 2. Types/Interfaces
interface ComponentProps {
  // ...
}

// 3. Component
export function Component({ prop1, prop2 }: ComponentProps) {
  // Hooks
  // Event handlers
  // Render
}
```

### Props
- Destructure props in function signature
- Use optional props sparingly
- Provide defaults for optional props

### Hooks
- Group useState calls
- useEffect at the end
- Custom hooks extracted to `src/hooks/`

## Testing

### Unit Tests
```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';

describe('Component', () => {
  it('renders correctly', () => {
    render(<Component />);
    expect(screen.getByText('...')).toBeInTheDocument();
  });
});
```

### Coverage
- Aim for 80%+ coverage
- Focus on business logic
- Test user interactions
- Test error states

## Pull Request Process

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Make your changes
3. Run checks:
   ```bash
   npm run typecheck
   npm run lint
   npm run test
   ```
4. Commit with conventional commits:
   - `feat:` New feature
   - `fix:` Bug fix
   - `docs:` Documentation
   - `style:  ` Code style changes
   - `refactor:` Code refactoring
   - `test:` Test changes
   - `chore:` Build/tooling changes

5. Push and create PR
6. Request review
7. Address feedback
8. Squash and merge

## Code Review Checklist

- [ ] Code follows style guide
- [ ] Tests added/updated
- [ ] Documentation updated
- [ ] No console.log statements
- [ ] TypeScript errors resolved
- [ ] ESLint warnings addressed
- [ ] Accessibility considered
- [ ] Performance considered

## Best Practices

### Performance
- Use `React.memo` for expensive components
- Implement virtualization for long lists
- Code split routes
- Optimize images

### Accessibility
- Semantic HTML
- ARIA labels where needed
- Keyboard navigation
- Focus management
- Color contrast ratios

### Security
- Sanitize user input
- Validate data
- No sensitive data in client
- Use HTTPS for APIs

## Getting Help

- Ask in team chat
- Review existing code
- Check documentation
- Reach out to maintainers

Thank you for contributing! 🚀
