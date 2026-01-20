import { ControlsProps } from '../types';

const BULK_COUNTS = [1, 10, 100, 1000];

export function Controls({
  onAddDOMNodes,
  onAddReactComponents,
  domNestingDepth,
  reactNestingDepth,
  onDomNestingChange,
  onReactNestingChange,
}: ControlsProps) {
  const handleDomDepthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.min(50, Math.max(1, parseInt(e.target.value) || 1));
    onDomNestingChange(value);
  };

  const handleReactDepthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.min(50, Math.max(1, parseInt(e.target.value) || 1));
    onReactNestingChange(value);
  };

  return (
    <div className="p-4 bg-gray-100 rounded-lg space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">DOM Nodes</h3>
        <div className="flex gap-2 mb-2">
          {BULK_COUNTS.map((count) => (
            <button
              key={`dom-${count}`}
              onClick={() => onAddDOMNodes(count)}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              +{count}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <label htmlFor="dom-depth" className="text-sm">
            Nesting Depth:
          </label>
          <input
            id="dom-depth"
            type="number"
            min="1"
            max="50"
            value={domNestingDepth}
            onChange={handleDomDepthChange}
            className="w-20 px-2 py-1 border rounded"
          />
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-2">React Components</h3>
        <div className="flex gap-2 mb-2">
          {BULK_COUNTS.map((count) => (
            <button
              key={`react-${count}`}
              onClick={() => onAddReactComponents(count)}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
            >
              +{count}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <label htmlFor="react-depth" className="text-sm">
            Nesting Depth:
          </label>
          <input
            id="react-depth"
            type="number"
            min="1"
            max="50"
            value={reactNestingDepth}
            onChange={handleReactDepthChange}
            className="w-20 px-2 py-1 border rounded"
          />
        </div>
      </div>
    </div>
  );
}
