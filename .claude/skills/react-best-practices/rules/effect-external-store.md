---
title: Use useSyncExternalStore for Subscriptions
impact: MEDIUM
impactDescription: provides correct subscription handling with automatic cleanup
tags: effect, useEffect, subscription, useSyncExternalStore
---

## Use useSyncExternalStore for Subscriptions

Use the `useSyncExternalStore` Hook instead of manual Effect-based subscriptions.

**Why it matters:** Manual subscriptions in Effects are error-prone—they require careful cleanup handling and can cause tearing (inconsistent UI) during concurrent rendering.

**Incorrect (manual subscription in effect):**

```tsx
function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    function handleOnline() { setIsOnline(true); }
    function handleOffline() { setIsOnline(false); }

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}
```

**Correct (useSyncExternalStore):**

```tsx
function subscribe(callback) {
  window.addEventListener('online', callback);
  window.addEventListener('offline', callback);
  return () => {
    window.removeEventListener('online', callback);
    window.removeEventListener('offline', callback);
  };
}

function useOnlineStatus() {
  return useSyncExternalStore(
    subscribe,
    () => navigator.onLine,      // Client snapshot
    () => true                   // Server snapshot
  );
}
```

**When to use useSyncExternalStore:**
- Browser APIs (online status, media queries, intersection observer)
- Third-party state libraries without React bindings
- Any external mutable data source

**Reference:** [React Docs - useSyncExternalStore](https://react.dev/reference/react/useSyncExternalStore)
