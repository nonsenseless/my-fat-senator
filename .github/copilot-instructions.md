# My Fat Senator - LLM Development Instructions

## Project Overview

**My Fat Senator** is a data visualization application that displays US Senate votes weighted by state population. The goal is to demonstrate how anti-democratic certain votes can be by showing how small a population can block legislation.

This is a TypeScript monorepo using:
- **Remix v2** (React framework) for the web application
- **Prisma** with SQLite for data persistence
- **Tailwind CSS** for styling
- Monorepo structure with shared domain logic

## Architecture Principles

### Monorepo Structure

```
/lib                          # Domain library (shared logic)
  /models                     # Data models and interfaces
  /services                   # Business logic and data access
  /prisma                     # Database schema and migrations
/packages
  /my-fat-senator            # Main Remix application (UI)
  /importer                  # Batch data import tool
```

**Key Rule**: All domain logic, database interactions, and business rules live in `/lib`. Applications in `/packages` should only contain UI components and route handlers.

### Data Flow

1. **Data Sources**:
   - Congress.gov API for legislator information
   - XML files from senate.gov for vote data (stored in `../congress/data/`)
   - Importer package processes XML files as a **manual batch process**

2. **Data Access Pattern**:
   - All Prisma/database calls happen in `/lib`
   - Services in `/lib` expose domain operations
   - Remix loaders/actions call lib services
   - React components receive data as props (stay "dumb")

3. **Server-First Philosophy**:
   - Maximize server-side data manipulation
   - Use Remix loaders for data fetching
   - Use Remix actions for mutations
   - Minimize client-side state (UI concerns only)
   - Avoid client-side state management libraries (Redux, Zustand, etc.)

## File Naming Conventions

**Standard Pattern**: `[entity].[type].ts`

Examples:
- `legislator.service.ts` - Service for legislator operations
- `vote.model.ts` - Vote data model/interface
- `http.service.ts` - HTTP client service
- `ballot.interface.ts` - Ballot data structure

**Important**: Only apply this pattern to new files or when explicitly asked. If touching legacy files that don't follow the pattern, ask before renaming.

## Remix Routing

### Route Organization

- Prefer **file-based routing** over programmatic routes
- Route files go in `packages/my-fat-senator/app/routes/`
- Use nested routes and layout routes for shared UI

### Layout Component Patterns

When creating routes, consider these Remix patterns:

1. **Pathless Layout Routes**: Use `__layout.tsx` for shared UI without affecting URL
   ```typescript
   // routes/__layout.tsx - provides shared UI
   // routes/__layout/child.tsx - uses layout at /child
   ```

2. **Nested Routes**: Use dot notation for nesting
   ```typescript
   // routes/votes.tsx - parent layout
   // routes/votes.$id.tsx - child route at /votes/:id
   // routes/votes._index.tsx - index route at /votes
   ```

3. **Resource Routes**: Use `.server.ts` for API endpoints
   ```typescript
   // routes/api.votes.server.ts - API endpoint, no UI
   ```

4. **Prefer loaders over useEffect**: Fetch data in loaders, not in components

## TypeScript Standards

### Strict Typing Rules

1. **No `any` types** - Use `unknown` if type is truly unknown
2. **Explicit return types** on all functions
   ```typescript
   function getVote(id: string): Promise<Vote | null> { }
   ```
3. **All data structures use interfaces**
   ```typescript
   interface VoteDetail {
     id: string;
     date: Date;
     question: string;
   }
   ```
4. **Type imports**: Use `import type` when importing only types
   ```typescript
   import type { Vote } from '~/lib/models/vote.model';
   ```

## Styling with Tailwind CSS

- Project uses Tailwind CSS (continue using it)
- Prefer utility classes over custom CSS
- Use Tailwind's design system (spacing, colors, breakpoints)
- Keep styling co-located with components

## Known Constraints & Workarounds

### 1. Prisma LIKE Operator
**Issue**: Prisma doesn't support LIKE operator with SQLite.

**Workaround**: Evaluate case-by-case:
- For simple searches: Use `contains`, `startsWith`, `endsWith`
- For complex text searches: Use `$queryRaw` with SQL
- Document why raw SQL is needed in comments

Example:
```typescript
// Using raw SQL due to Prisma LIKE limitation with SQLite
const results = await prisma.$queryRaw`
  SELECT * FROM Vote 
  WHERE question LIKE ${`%${searchTerm}%`}
`;
```

### 2. Date Serialization
**Issue**: Dates from server serialize to strings, don't auto-deserialize.

**Workaround**: Convert date strings back to Date objects in loaders or use a serialization helper.

### 3. BioGuide ID Inconsistency
**Issue**: The `id` field in Senate votes is NOT the bioguideId (but IS for House votes).

**Workaround**: Always verify which ID system is being used. Document the mapping in comments.

### 4. Batch Import Process
**Issue**: Vote data import is manual, not real-time.

**Process**:
1. Download XML files to `../congress/data/[session]/votes/`
2. Run importer package manually: `npm run import -w importer`
3. Verify data in database before using

## Testing Strategy

### Priority Order
1. **Integration tests** - Test workflows across multiple components
2. **E2E tests** - Test critical user journeys with Cypress
3. **Unit tests** - Test isolated functions/components (lower priority)

### Testing Guidelines

1. **Always suggest tests** when adding new features
2. **Explain test logic** - Walk through what the test validates and why
3. **Focus on key workflows**:
   - Vote search and filtering
   - Population-weighted visualization rendering
   - Legislator profile viewing
   - Data import process

4. **Test file location**:
   - Unit tests: Co-located with source (e.g., `vote.service.test.ts`)
   - Integration tests: `tests/integration/`
   - E2E tests: `cypress/e2e/`

5. **When writing tests, include**:
   - Arrange/Act/Assert comments
   - Description of what's being tested
   - Why this test is important

Example:
```typescript
describe('VoteService.getVoteById', () => {
  it('should return vote with ballots when ID exists', async () => {
    // Arrange: Create test vote in database
    const vote = await createTestVote();
    
    // Act: Retrieve vote by ID
    const result = await voteService.getVoteById(vote.id);
    
    // Assert: Vote is returned with expected data
    expect(result).toBeDefined();
    expect(result?.ballots).toHaveLength(100);
  });
});
```

## Current Development Priorities

### Upcoming Tasks (in order)

1. **Legislator Images & Bios**
   - Import profile images from congress.gov API
   - Display in popup on visualization
   - Include basic bio information

2. **Default Landing Page**
   - Set vote search page as index route
   - Ensure search functionality is prominent

3. **Legislator Pages**
   - Search page for finding legislators
   - Bio page showing:
     - Profile image and biographical info
     - Election history
     - Seats held over time
     - List of all votes (with links to vote detail view)
   - Pull data from congress.gov API

4. **Finalize Population-Weighted Visualization**
   - Render vote categories (Yea/Nay/Not Voting) as groups
   - Balance visualization like a scale
   - **Undecided**: Should senator size be proportional to population or inverted?

5. **Test Coverage**
   - Add integration tests for vote search workflow
   - Add E2E tests for visualization interaction
   - Add tests for legislator profile workflows

## Feature Documentation System

This project uses a hybrid documentation approach to track feature progress and maintain context:

### Documentation Structure

```
/docs
  /features/              # Persistent feature documentation
    legislator-profiles.md
    population-weighted-visualization.md
    vote-search.md
    data-import.md
  SESSIONS.md            # Chronological work log
  TEMPLATE.feature.md    # Template for new features
```

### When to Update Documentation

1. **Starting a Feature**: 
   - Create new file from `TEMPLATE.feature.md` in `/docs/features/`
   - Update status to "In Progress"
   - Review existing tasks and objectives

2. **During Work**:
   - Check off completed tasks
   - Add discovered technical debt
   - Note scope changes with dates
   - Update "Related Files" section

3. **End of Session**:
   - Add entry to `SESSIONS.md` with session summary
   - Update feature file with progress
   - Note what to work on next

4. **Discovering Issues**:
   - Add to "Technical Debt & Future Enhancements"
   - Note in session log if it affects current work

### Purpose

- Provide context for future development sessions
- Track scope changes and decisions
- Document technical debt as it's discovered
- Help maintain continuity across sessions
- Give LLMs comprehensive feature context

## Response Format Preferences

### Before Starting Work

**Always begin by reviewing the request and asking clarifying questions.** Consider:

- **Feature Documentation**: Check if a feature file exists in `/docs/features/`. Read it for context before starting.
- **Scope & Location**: Should this code go in `/lib` or `/packages`? Does it affect multiple workspaces?
- **Data Sources**: Where does the data come from? Congress.gov API, XML files, or existing database?
- **Testing Needs**: What test coverage is appropriate? Integration, E2E, or unit tests?
- **Dependencies**: Will this require new packages or affect existing dependencies?
- **Side Effects**: Could this change impact other features (especially the visualization)?
- **User Experience**: How should errors be handled? What's the expected user flow?
- **Legacy Code**: Are there existing patterns that should be followed or refactored?

**Do not proceed with implementation until critical questions are answered.**

### After Completing Work

When finishing a development session:

1. **Update Feature Documentation**: 
   - Check off completed tasks
   - Add any scope changes discovered
   - Document technical debt or future enhancements
   - Update "Related Files" section

2. **Add Session Entry**:
   - Create new entry in `/docs/SESSIONS.md`
   - Summarize what was accomplished
   - Note any discoveries or gotchas
   - List what to work on next

3. **Provide Summary**: Give user a brief summary of changes and next steps

### When Suggesting Code Changes

1. **Use focused diffs with context**
   ```typescript
   // filepath: /path/to/file.ts
   // ...existing code...
   { changed code }
   // ...existing code...
   ```

2. **Provide step-by-step instructions**
   - Explain what needs to change and why
   - List files to modify in order
   - Explain any side effects or related changes needed

3. **Include explanations**
   - Why this approach was chosen
   - Alternative approaches considered
   - Potential impacts or gotchas

4. **Suggest tests**
   - What tests should be added
   - What scenarios to cover
   - Walk through test logic

## Code Review Checklist

When suggesting code changes, ensure:

- [ ] TypeScript strict typing (no `any`, explicit returns, interfaces)
- [ ] Domain logic in `/lib`, UI in `/packages`
- [ ] Server-side data fetching in loaders
- [ ] File naming follows `[entity].[type].ts` pattern (for new files)
- [ ] Tests included for new features
- [ ] Comments explain "why" not "what"
- [ ] Tailwind classes for styling
- [ ] Prisma SQLite limitations considered

## Helpful Commands

### Development
```bash
# Start Remix dev server
npm run dev -w my-fat-senator

# Run tests
npm run test -w my-fat-senator

# Run E2E tests
npm run test:e2e:run -w my-fat-senator

# Type checking
npm run typecheck -w my-fat-senator
```

### Database
```bash
# Run migrations
npm run migrate -w my-fat-senator

# Generate Prisma client
npx prisma generate

# Seed database
npx prisma db seed
```

### Linting & Formatting
```bash
# Run ESLint
npm run lint -w my-fat-senator

# Format with Prettier
npm run format -w my-fat-senator
```

## Best Practices Reminders

1. **React/Remix Patterns**:
   - Use loaders for data fetching, not useEffect
   - Use actions for mutations
   - Prefer server components over client components
   - Keep component state minimal (UI concerns only)

2. **Error Handling**:
   - Use Remix error boundaries for route-level errors
   - Return proper HTTP status codes from loaders/actions
   - Log errors server-side for debugging

3. **Performance**:
   - Use Remix's automatic code splitting
   - Lazy load heavy components if needed
   - Optimize database queries (proper indexes)
   - Use Prisma's `select` to limit returned fields

4. **Accessibility**:
   - Use semantic HTML
   - Include ARIA labels for interactive elements
   - Ensure keyboard navigation works
   - Test with screen readers for complex visualizations

5. **Code Organization**:
   - One component per file
   - Group related utilities together
   - Keep files focused and small (<300 lines)
   - Use barrel exports (index.ts) for clean imports

## Questions to Ask

When requirements are unclear, ask:

1. **Scope**: Does this belong in `/lib` or `/packages/my-fat-senator`?
2. **Data**: Where does this data come from? Congress.gov API or local XML?
3. **Testing**: What test coverage is needed for this feature?
4. **Legacy Code**: Should I refactor this to current patterns?
5. **Visualization**: Should this affect the population-weighted rendering?

---

*Last Updated: February 26, 2026*
*Project: My Fat Senator Monorepo*
*Primary Application: Remix v2 + React + TypeScript + Prisma + Tailwind*