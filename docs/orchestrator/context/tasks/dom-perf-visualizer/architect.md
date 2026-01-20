# DOM Performance Visualizer - Design Document

## Overview
A standalone React app (Vite + TypeScript) that lets users dynamically add DOM nodes and React components to measure memory usage and render latency in real-time.

## Design Decisions
- Project Setup: Vite + React 18 + TypeScript (KISS)
- State Management: useState/useReducer only (YAGNI)
- Metrics Collection: Dedicated MetricsService class (SRP)
- Element Generation: Separate DOM and React generators (OCP)
- UI Structure: ControlPanel + MetricsDisplay + Sandbox (SRP)

## File Structure
```
/poc/dom-perf-visualizer/
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── types/index.ts
│   ├── services/MetricsService.ts
│   ├── hooks/useMetrics.ts
│   ├── hooks/useElementGenerator.ts
│   ├── components/ControlPanel.tsx
│   ├── components/MetricsDisplay.tsx
│   ├── components/Sandbox.tsx
│   ├── components/DOMNodeGenerator.tsx
│   ├── components/ReactComponentGenerator.tsx
│   └── styles/index.css
```

## Key Interfaces
- MemoryMetrics: usedJSHeapSize, totalJSHeapSize, jsHeapSizeLimit
- LatencyMetrics: lastRenderTime, averageRenderTime, peakRenderTime
- ElementConfig: domNodes, nestedDomDepth, reactComponents, nestedReactDepth
- IMetricsService: getMemory(), measureRender(), isMemoryApiAvailable()

## Implementation Steps
1. Project scaffolding (Vite + React + TS)
2. Types and MetricsService
3. Custom hooks (useMetrics, useElementGenerator)
4. UI Components (ControlPanel, MetricsDisplay, Sandbox, generators)
5. App assembly
6. Styling

## Constraints
- Chrome-only for memory metrics (show warning otherwise)
- Cap elements at 1000 per add, depth at 50
- No persistence - session only
