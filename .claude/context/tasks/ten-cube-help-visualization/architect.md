# Architecture: Ten Cube Help Visualization

## Feature Overview
Interactive ten cube (base-10 block) visualization for the help system, allowing users to see place value concepts through manipulatives.

## Bug Fix Required
**Help Button Z-Index Issue**: Help button buried under FeedbackAnimation z-40
- Location: ProblemPage.tsx
- Solution: Increase Help button z-index above FeedbackAnimation layer

## New Components

### Core Manipulative Components
1. **UnitCube**
   - Single unit cube (1x1x1)
   - Draggable block type
   - Visual representation: small square/cube

2. **TenRod**
   - Ten unit cubes in a row (10x1x1)
   - Represents place value: tens
   - Draggable block type

3. **BlockTray**
   - Container for available blocks (units, rods, flats)
   - Shows inventory of manipulatives
   - Source for drag-drop operations

4. **PlaceValueMat**
   - Drop zone for place value organization
   - Columns for ones, tens, hundreds
   - Validates placement based on block type

5. **Workspace**
   - Main interaction area
   - Canvas for manipulatives
   - Combines BlockTray + PlaceValueMat

6. **TenCubeVisualization**
   - Top-level component orchestrating the visualization
   - Manages state and interactions
   - Integrates with HelpContext

## Modified Files

### ProblemPage.tsx
- Fix Help button z-index (currently buried)
- Ensure Help button appears above FeedbackAnimation

### HelpContext.tsx
- Integrate TenCubeVisualization
- Manage help state and display logic
- Pass configuration to visualization

### Manipulative.tsx
- Define base block interfaces/types
- Export UnitCube, TenRod components
- Handle block rendering and properties

### hint.ts
- Update hints to reference ten cube visualization
- Add contextual help content

### index.css
- Styling for all new components
- Z-index management for layers
- Responsive design for different screen sizes

## Architecture Patterns

### Modular Block Types
- Enum or type: BlockType (UNIT, ROD, FLAT)
- Each block has size, count, drag properties
- Composable: rods made of units, flats made of rods

### Custom Drag-Drop Hooks
- useBlockDrag: Dragging block state and position
- usePlaceValueDropZone: Drop zone validation and logic
- Integrate with HTML5 drag-drop or library (react-dnd)

### Place Value Columns
- Three columns: ones, tens, hundreds
- Auto-drop logic: 10 units → 1 rod, 10 rods → 1 flat
- Visual feedback on valid drop zones

## State Management
- HelpContext provides feature flag and configuration
- Local component state for manipulative positions
- Undo/redo for user interactions (optional)

## Styling & UX
- Clear visual distinction between block types
- Color-coded columns (ones, tens, hundreds)
- Hover effects on draggable blocks
- Drop zone highlighting on drag-over

## Implementation Priority
1. Fix Help button z-index (ProblemPage.tsx)
2. Create base Manipulative types and styles
3. Build TenCubeVisualization orchestrator
4. Implement TenRod and UnitCube components
5. Create PlaceValueMat drop zones
6. Integrate HelpContext
7. Add drag-drop logic and interactions
8. Polish styling and animations
