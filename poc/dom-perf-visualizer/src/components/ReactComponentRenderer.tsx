import { memo } from 'react';

interface ReactComponentRendererProps {
  count: number;
  nestingDepth: number;
}

interface NestedComponentProps {
  depth: number;
  maxDepth: number;
  index: number;
}

const NestedComponent = memo(function NestedComponent({ depth, maxDepth, index }: NestedComponentProps) {
  if (depth >= maxDepth) {
    return <span className="text-xs">Component {index}</span>;
  }

  return (
    <div className="react-component-nested" data-depth={depth}>
      <NestedComponent depth={depth + 1} maxDepth={maxDepth} index={index} />
    </div>
  );
});

export function ReactComponentRenderer({ count, nestingDepth }: ReactComponentRendererProps) {
  const components = Array.from({ length: count }, (_, i) => (
    <div key={i} className="react-component" data-index={i}>
      <NestedComponent depth={1} maxDepth={nestingDepth} index={i} />
    </div>
  ));

  return (
    <div className="p-4 bg-green-50 rounded-lg">
      <h3 className="text-lg font-semibold mb-2 text-green-800">React Components Container</h3>
      <div className="max-h-40 overflow-auto text-xs font-mono">
        {components}
      </div>
    </div>
  );
}
