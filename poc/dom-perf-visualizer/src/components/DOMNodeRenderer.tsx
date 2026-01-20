import { useEffect, useRef } from 'react';

interface DOMNodeRendererProps {
  count: number;
  nestingDepth: number;
}

export function DOMNodeRenderer({ count, nestingDepth }: DOMNodeRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Clear existing nodes
    container.innerHTML = '';

    // Create nested DOM nodes
    for (let i = 0; i < count; i++) {
      let currentNode: HTMLElement = document.createElement('div');
      currentNode.className = 'dom-node';
      currentNode.setAttribute('data-index', String(i));

      const rootNode = currentNode;

      // Create nested structure
      for (let depth = 1; depth < nestingDepth; depth++) {
        const childNode = document.createElement('div');
        childNode.className = 'dom-node-nested';
        childNode.setAttribute('data-depth', String(depth));
        currentNode.appendChild(childNode);
        currentNode = childNode;
      }

      // Add leaf content
      currentNode.textContent = `Node ${i}`;
      container.appendChild(rootNode);
    }
  }, [count, nestingDepth]);

  return (
    <div className="p-4 bg-blue-50 rounded-lg">
      <h3 className="text-lg font-semibold mb-2 text-blue-800">DOM Nodes Container</h3>
      <div
        ref={containerRef}
        className="max-h-40 overflow-auto text-xs font-mono"
      />
    </div>
  );
}
