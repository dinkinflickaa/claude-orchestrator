let startTime: number | null = null;

export function markStart(): void {
  startTime = performance.now();
}

export function measureLatency(): number {
  if (startTime === null) {
    return 0;
  }
  const latency = performance.now() - startTime;
  startTime = null;
  return latency;
}
