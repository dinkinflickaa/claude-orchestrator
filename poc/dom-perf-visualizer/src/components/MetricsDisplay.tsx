import { Metrics } from '../types';

interface MetricsDisplayProps {
  metrics: Metrics;
  domNodeCount: number;
  reactComponentCount: number;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

export function MetricsDisplay({ metrics, domNodeCount, reactComponentCount }: MetricsDisplayProps) {
  return (
    <div className="p-4 bg-white rounded-lg shadow space-y-4">
      <h2 className="text-xl font-bold">Performance Metrics</h2>

      <div className="grid grid-cols-2 gap-4">
        <div className="p-3 bg-blue-50 rounded">
          <div className="text-sm text-gray-600">DOM Nodes</div>
          <div className="text-2xl font-bold text-blue-600">{domNodeCount}</div>
        </div>

        <div className="p-3 bg-green-50 rounded">
          <div className="text-sm text-gray-600">React Components</div>
          <div className="text-2xl font-bold text-green-600">{reactComponentCount}</div>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between p-2 bg-gray-50 rounded">
          <span className="text-gray-600">Used JS Heap Size:</span>
          <span className="font-mono">{formatBytes(metrics.usedJSHeapSize)}</span>
        </div>

        <div className="flex justify-between p-2 bg-gray-50 rounded">
          <span className="text-gray-600">Total JS Heap Size:</span>
          <span className="font-mono">{formatBytes(metrics.totalJSHeapSize)}</span>
        </div>

        <div className="flex justify-between p-2 bg-gray-50 rounded">
          <span className="text-gray-600">Last Render Latency:</span>
          <span className="font-mono">{metrics.lastNavigationLatency.toFixed(2)} ms</span>
        </div>
      </div>

      {metrics.usedJSHeapSize === 0 && (
        <div className="text-xs text-amber-600">
          Note: Memory metrics require Chrome with --enable-precise-memory-info flag
        </div>
      )}
    </div>
  );
}
