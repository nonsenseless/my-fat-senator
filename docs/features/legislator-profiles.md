# Feature: Legislator Profiles

**Status**: Not Started
**Started**: TBD
**Last Updated**: 2026-02-27

## Objectives
Add comprehensive legislator profile functionality including images, biographical information, and voting history.

- Import and cache legislator profile images from congress.gov API
- Display legislator info in popups on vote visualization
- Create legislator search functionality
- Build detailed bio pages with election history and voting record

## Tasks

### Completed ✅
- [ ] None yet

### In Progress 🚧
- [ ] None yet

### Todo 📋
- [ ] Create legislator image fetching service in `/lib`
- [ ] Set up image storage/caching strategy
- [ ] Design and implement popup component for vote visualization
- [ ] Create legislator search page
- [ ] Build legislator bio page with:
  - [ ] Profile image and basic info
  - [ ] Election history timeline
  - [ ] Seats held over time
  - [ ] List of all votes with links to vote detail views
- [ ] Add integration tests for legislator workflows
- [ ] Add E2E tests for profile viewing

## Scope Changes
- None yet

## Technical Debt & Future Enhancements
- Need to decide on image caching strategy (local file system vs. CDN)
- Consider API rate limiting for congress.gov
- May need image optimization for different screen sizes
- Should handle legislators without images (fallback placeholder)

## Implementation Notes
- Congress.gov API provides legislator data including images
- BioGuide IDs are used for legislator identification
- Note: Senate vote XML uses different IDs than bioguideId (see Known Constraints)

## Related Files
- `/lib/services/congress-api.ts` - Existing API service
- `/lib/models/legislator.ts` - Legislator model
- TBD: Popup component location
- TBD: Legislator routes

## Testing
- [ ] Unit tests added
- [ ] Integration tests added
- [ ] E2E tests added

### Test Coverage
- TBD: Define test scenarios once implementation begins

## Dependencies
- Congress.gov API (already integrated via axios)
- Existing legislator model and database schema

## References
- Congress.gov API documentation
- Existing congress API response examples in `/docs/congress-api/`
