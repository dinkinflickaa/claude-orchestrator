import { useState, useEffect, useCallback } from 'react';
import { Controls } from './components/Controls';
import { MetricsDisplay } from './components/MetricsDisplay';
import { DOMNodeRenderer } from './components/DOMNodeRenderer';
import { ReactComponentRenderer } from './components/ReactComponentRenderer';
import { getMemoryInfo } from './services/MemoryService';
import { markStart, measureLatency } from './services/LatencyService';
import { Metrics } from './types';

function App() {
  const [domNodeCount, setDomNodeCount] = useState(0);
  const [domNestingDepth, setDomNestingDepth] = useState(1);
  const [reactComponentCount, setReactComponentCount] = useState(0);
  const [reactNestingDepth, setReactNestingDepth] = useState(1);
  const [metrics, setMetrics] = useState<Metrics>({
    usedJSHeapSize: 0,
    totalJSHeapSize: 0,
    lastNavigationLatency: 0,
  });

  const updateMemoryMetrics = useCallback(() => {
    const memInfo = getMemoryInfo();
    if (memInfo) {
      setMetrics((prev) => ({
        ...prev,
        usedJSHeapSize: memInfo.usedJSHeapSize,
        totalJSHeapSize: memInfo.totalJSHeapSize,
      }));
    }
  }, []);

  // Measure latency after render
  useEffect(() => {
    const latency = measureLatency();
    if (latency > 0) {
      setMetrics((prev) => ({
        ...prev,
        lastNavigationLatency: latency,
      }));
    }
    updateMemoryMetrics();
  }, [domNodeCount, reactComponentCount, domNestingDepth, reactNestingDepth, updateMemoryMetrics]);

  // Periodic memory updates
  useEffect(() => {
    const interval = setInterval(updateMemoryMetrics, 1000);
    return () => clearInterval(interval);
  }, [updateMemoryMetrics]);

  const handleAddDOMNodes = useCallback((count: number) => {
    markStart();
    setDomNodeCount((prev) => prev + count);
  }, []);

  const handleAddReactComponents = useCallback((count: number) => {
    markStart();
    setReactComponentCount((prev) => prev + count);
  }, []);

  const handleDomNestingChange = useCallback((depth: number) => {
    markStart();
    setDomNestingDepth(depth);
  }, []);

  const handleReactNestingChange = useCallback((depth: number) => {
    markStart();
    setReactNestingDepth(depth);
  }, []);

  const handleReset = useCallback(() => {
    markStart();
    setDomNodeCount(0);
    setReactComponentCount(0);
    setDomNestingDepth(1);
    setReactNestingDepth(1);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-800">DOM Performance Visualizer</h1>
          <button
            onClick={handleReset}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
          >
            Reset All
          </button>
        </div>

        <MetricsDisplay
          metrics={metrics}
          domNodeCount={domNodeCount}
          reactComponentCount={reactComponentCount}
        />

        <Controls
          onAddDOMNodes={handleAddDOMNodes}
          onAddReactComponents={handleAddReactComponents}
          domNestingDepth={domNestingDepth}
          reactNestingDepth={reactNestingDepth}
          onDomNestingChange={handleDomNestingChange}
          onReactNestingChange={handleReactNestingChange}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <DOMNodeRenderer count={domNodeCount} nestingDepth={domNestingDepth} />
          <ReactComponentRenderer count={reactComponentCount} nestingDepth={reactNestingDepth} />
        </div>
      </div>
    </div>
  );
}

export default App;
