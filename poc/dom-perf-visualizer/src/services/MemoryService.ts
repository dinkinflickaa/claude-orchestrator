interface MemoryInfo {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
}

export function getMemoryInfo(): MemoryInfo | null {
  const perf = performance as { memory?: MemoryInfo };
  return perf.memory ?? null;
}
