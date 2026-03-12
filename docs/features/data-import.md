# Feature: Vote Data Import System

**Status**: In Progress
**Started**: 2024-09-06
**Last Updated**: 2026-02-27

## Objectives
Import Senate and House vote data from congress.gov XML files into the database for analysis and visualization.

- Parse XML files from senate.gov/house.gov
- Import vote records with all metadata
- Import ballot data (legislator votes)
- Handle legislator data and associations
- Run as manual batch process

## Tasks

### Completed ✅
- [x] Basic vote record import (without ballots)
- [x] Ballot processing implementation
- [x] XML parsing (preferred over JSON)
- [x] Monorepo importer package setup
- [x] Service-based entity creation

### In Progress 🚧
- [ ] None currently

### Todo 📋
- [ ] Add error handling and retry logic
- [ ] Create import validation tools
- [ ] Add progress reporting for large imports
- [ ] Handle incremental updates (new votes only)
- [ ] Add integration tests for import process

## Scope Changes
- **2024-09-14**: Realized XML schema is cleaner than JSON, switched to XML parsing
- **2024-09-14**: Moved entity creation to services

## Technical Debt & Future Enhancements
- Schema doesn't currently support legislators changing districts
- Need better error reporting during imports
- Could add automatic import scheduling
- Should validate imported data more thoroughly
- Consider adding import rollback capability

## Implementation Notes
- Importer is separate package in `/packages/importer`
- XML files stored in `../congress/data/[session]/votes/`
- Run manually via: `npm run import -w importer`
- Uses services from `/lib` for database operations
- BioGuide ID inconsistency: Senate vote IDs ≠ bioguideId (but House IDs = bioguideId)

## Related Files
- `/packages/importer/` - Importer package
- `/lib/importer/importer.ts` - Import logic
- `/lib/services/` - Entity creation services
- `/lib/prisma/` - Database schema and operations
- `../congress/data/` - Vote XML files (external)

## Testing
- [ ] Unit tests added
- [ ] Integration tests added
- [ ] E2E tests added

### Test Coverage
- Need integration tests for:
  - XML parsing accuracy
  - Vote record creation
  - Ballot association
  - Legislator data handling
  - Error handling for malformed XML

## Dependencies
- XML parser (TBD which library)
- Prisma for database operations
- File system access for reading XML files

## References
- Congress.gov XML schema
- Example data in `/data/s170/`
- README log entries for import development history
