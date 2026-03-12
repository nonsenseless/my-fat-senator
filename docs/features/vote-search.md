# Feature: Vote Search & Landing Page

**Status**: In Progress
**Started**: 2024 (initial implementation)
**Last Updated**: 2026-02-27

## Objectives
Provide a searchable interface for finding Senate votes and make it the default entry point for the application.

- Create comprehensive vote search functionality
- Set vote search as default landing page (index route)
- Enable filtering by date, topic, result, etc.
- Link search results to population-weighted visualization

## Tasks

### Completed ✅
- [x] Basic vote search implementation
- [x] Vote listing functionality

### In Progress 🚧
- [ ] None currently

### Todo 📋
- [ ] Set vote search as index route (default landing page)
- [ ] Improve search filters (date range, chamber, result type)
- [ ] Add text search across vote questions/titles
- [ ] Optimize search performance for large datasets
- [ ] Add pagination or infinite scroll
- [ ] Add integration tests for search workflow
- [ ] Add E2E tests for search and navigation

## Scope Changes
- **2026-02-27**: Prioritizing making this the landing page

## Technical Debt & Future Enhancements
- Text search currently limited by Prisma LIKE operator constraint with SQLite
- May need full-text search solution for better performance
- Consider adding saved searches or bookmarks
- Advanced filtering (by party, by state, by legislator) could be useful

## Implementation Notes
- Search happens server-side in Remix loader
- Prisma queries against Vote table
- See Known Constraints about LIKE operator limitations

## Related Files
- `/packages/my-fat-senator/app/routes/` - Route files for search
- `/lib/services/` - Vote services
- `/lib/models/vote.ts` - Vote model

## Testing
- [ ] Unit tests added
- [ ] Integration tests added
- [ ] E2E tests added

### Test Coverage
- Need tests for:
  - Search functionality with various filters
  - Search result accuracy
  - Navigation from search to vote detail
  - Pagination/loading more results

## Dependencies
- Prisma for database queries
- Remix loaders for server-side search
- Vote data from importer

## References
- See Prisma LIKE constraint in `.github/copilot-instructions.md`
