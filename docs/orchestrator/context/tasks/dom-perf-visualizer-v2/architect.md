# DOM Performance Visualizer v2 - Design

## Design Decisions
- Vite + React + TypeScript for fast dev
- useState hooks at App level (no external state library)
- Chrome's performance.memory API with MemoryService abstraction
- performance.now() for latency measurement
- Separate components: Controls, MetricsDisplay, DOMNodeRenderer, ReactComponentRenderer
- Recursive components with depth prop for nesting
- Tailwind CSS for styling

## File Structure (16 files)
```
poc/dom-perf-visualizer/
├── index.html
├── package.json
├── vite.config.ts
├── tsconfig.json
├── tailwind.config.js
├── postcss.config.js
└── src/
    ├── main.tsx
    ├── App.tsx
    ├── index.css
    ├── types/index.ts
    ├── components/
    │   ├── Controls.tsx
    │   ├── MetricsDisplay.tsx
    │   ├── DOMNodeRenderer.tsx
    │   └── ReactComponentRenderer.tsx
    └── services/
        ├── MemoryService.ts
        └── LatencyService.ts
```

## Key Interfaces
- AppState: domNodeCount, domNestingDepth, reactComponentCount, reactNestingDepth, metrics
- Metrics: usedJSHeapSize, totalJSHeapSize, lastNavigationLatency
- ControlsProps: onAddDOMNodes, onAddReactComponents, depth controls

## Constraints
- Chrome-only (performance.memory is non-standard)
- No charts - simple numeric displays
- No persistence
- Bulk add: 10, 100, 1000 nodes
- Max nesting depth: 50

## Implementation Steps (12)
1. Scaffold Vite + React + TypeScript
2. Add Tailwind CSS
3. Create types
4. Implement MemoryService
5. Implement LatencyService
6. Build Controls component
7. Build MetricsDisplay
8. Build DOMNodeRenderer
9. Build ReactComponentRenderer
10. Wire up App.tsx
11. Add useEffect for metrics
12. Test with Chrome DevTools
