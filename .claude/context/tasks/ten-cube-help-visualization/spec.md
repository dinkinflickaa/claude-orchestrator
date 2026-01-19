# Implementation Spec: Ten Cube Help Visualization

## File Structure
```
src/
├── components/
│   ├── Manipulative.tsx (new)
│   ├── TenCubeVisualization.tsx (new)
│   ├── ProblemPage.tsx (modified - z-index fix)
│   └── HelpContext.tsx (modified - integration)
├── hooks/
│   ├── useBlockDrag.ts (new)
│   └── usePlaceValueDropZone.ts (new)
├── types/
│   └── manipulative.ts (new)
├── utils/
│   └── hint.ts (modified)
└── index.css (modified)
```

## Component APIs

### TenCubeVisualization
```typescript
interface TenCubeVisualizationProps {
  onClose?: () => void;
  initialBlocks?: BlockCount;
}

// Manages: workspace, block tray, place value mat
```

### Manipulative.tsx (Exports)
```typescript
export interface Block {
  id: string;
  type: BlockType; // 'UNIT' | 'ROD' | 'FLAT'
  position: { x: number; y: number };
  count: number;
}

export enum BlockType {
  UNIT = 'UNIT',
  ROD = 'ROD',
  FLAT = 'FLAT'
}

export const UnitCube: React.FC<{ block: Block; onDragStart: ... }>
export const TenRod: React.FC<{ block: Block; onDragStart: ... }>
export const BlockTray: React.FC<{ blocks: Block[]; onDragStart: ... }>
export const PlaceValueMat: React.FC<{ onDrop: ...; blocks: Block[] }>
export const Workspace: React.FC<{ ... }>
```

### Custom Hooks
```typescript
// useBlockDrag.ts
export const useBlockDrag = (blockId: string) => {
  return { isDragging, startDrag, endDrag, position };
}

// usePlaceValueDropZone.ts
export const usePlaceValueDropZone = (column: 'ones' | 'tens' | 'hundreds') => {
  return { isOver, canDrop, handleDrop };
}
```

## Z-Index Fix (ProblemPage.tsx)
- Current: Help button z-index < FeedbackAnimation z-40
- Fix: Set Help button to z-50 or higher
- Ensure clickability above all overlays

## Styling (index.css)
```css
/* Block styles */
.unit-cube { width: 30px; height: 30px; }
.ten-rod { width: 300px; height: 30px; }

/* Place value mat columns */
.place-value-mat { display: grid; grid-template-columns: 1fr 1fr 1fr; }
.column-ones { border-left: 3px solid #ff6b6b; }
.column-tens { border-left: 3px solid #4ecdc4; }
.column-hundreds { border-left: 3px solid #ffe66d; }

/* Drag-drop feedback */
.drop-zone-active { background: rgba(0, 0, 0, 0.1); }
```

## HelpContext Integration
- Add: TenCubeVisualization display toggle
- Add: Configuration (initial blocks, difficulty level)
- Pass: showTenCubes flag to help modal

## Testing Strategy
- Unit tests for BlockType and positioning logic
- Integration tests for drag-drop interactions
- Visual tests for component rendering
- Z-index verification in ProblemPage

## Success Criteria
1. Help button always visible and clickable
2. Blocks drag smoothly within workspace
3. Place value drops validate correctly
4. Responsive on mobile/tablet
5. No layout shift when help opens
