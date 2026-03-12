# Feature: Population-Weighted Visualization

**Status**: In Progress
**Started**: 2024 (initial implementation)
**Last Updated**: 2026-02-27

## Objectives
Create an interactive visualization of Senate votes where each senator's visual representation is weighted by their state's population to demonstrate how anti-democratic certain votes can be.

- Render senators with size/weight based on state population
- Group votes into categories (Yea/Nay/Not Voting)
- Balance visualization like a scale showing population weight on each side
- Make visualization interactive (click for details, hover states, etc.)
- Demonstrate how small populations can block legislation

## Tasks

### Completed ✅
- [x] Basic canvas-based visualization rendering
- [x] Integration with vote data
- [x] Basic interactivity

### In Progress 🚧
- [ ] Finalize grouping of vote categories
- [ ] Implement scale/balance visual metaphor
- [ ] Decide: Should senator size be proportional to population or inverted?

### Todo 📋
- [ ] Add legislator profile popups (see legislator-profiles.md)
- [ ] Improve mobile responsiveness
- [ ] Add keyboard navigation for accessibility
- [ ] Optimize canvas rendering performance
- [ ] Add E2E tests for visualization interaction

## Scope Changes
- **2026-02-27**: Visualization evolution ongoing; still deciding on population representation approach

## Technical Debt & Future Enhancements
- Canvas rendering could be optimized for performance
- Consider using WebGL for better performance with large datasets
- Mobile touch interactions need refinement
- Screen reader accessibility needs implementation
- Animation/transitions could enhance UX

## Implementation Notes
- Uses HTML Canvas API for rendering
- React integration via refs and useEffect (see README helpful reading)
- State population data comes from database
- Visualization recalculates on vote data changes

## Related Files
- `/packages/my-fat-senator/app/routes/votes.$id.tsx` - Vote detail route with visualization
- Canvas-related components (exact locations TBD)
- `/lib/models/state.ts` - State population data

## Testing
- [ ] Unit tests added
- [ ] Integration tests added
- [ ] E2E tests added

### Test Coverage
- Need E2E tests for:
  - Visualization renders correctly
  - Interactive elements respond to clicks
  - Vote categories display correctly
  - Population weighting calculates correctly

## Dependencies
- HTML Canvas API
- React (Remix v2)
- Vote and legislator data from database

## References
- [React and Canvas - Stack Overflow](https://stackoverflow.com/questions/72228029/accessing-and-updating-canvas-node-callback-inside-of-useeffect-react)
- [Vanilla JS Canvas to React](https://medium.com/@ruse.marshall/converting-a-vanilla-js-canvas-animation-to-react-78443bad6d7b)
