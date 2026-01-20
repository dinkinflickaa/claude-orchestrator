export interface Metrics {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  lastNavigationLatency: number;
}

export interface AppState {
  domNodeCount: number;
  domNestingDepth: number;
  reactComponentCount: number;
  reactNestingDepth: number;
  metrics: Metrics;
}

export interface ControlsProps {
  onAddDOMNodes: (count: number) => void;
  onAddReactComponents: (count: number) => void;
  domNestingDepth: number;
  reactNestingDepth: number;
  onDomNestingChange: (depth: number) => void;
  onReactNestingChange: (depth: number) => void;
}
