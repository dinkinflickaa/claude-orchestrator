---
title: Initialize App at Module Level
impact: MEDIUM
impactDescription: runs once reliably, avoids strict mode double-execution
tags: effect, useEffect, initialization, anti-pattern
---

## Initialize App at Module Level

Run app initialization code at module level or with a top-level guard, not in Effects.

**Why it matters:** Effects run twice in Strict Mode during development, and components should be resilient to remounting. Module-level code runs exactly once.

**Incorrect (effect for one-time init):**

```tsx
function App() {
  useEffect(() => {
    checkAuthToken();
    loadDataFromLocalStorage();
  }, []);

  return <Main />;
}
```

**Correct (module-level initialization):**

```tsx
if (typeof window !== 'undefined') {
  checkAuthToken();
  loadDataFromLocalStorage();
}

function App() {
  return <Main />;
}
```

**Alternative with guard variable:**

```tsx
let didInit = false;

function App() {
  useEffect(() => {
    if (!didInit) {
      didInit = true;
      checkAuthToken();
      loadDataFromLocalStorage();
    }
  }, []);

  return <Main />;
}
```

**When to use which:**
- **Module level:** Pure initialization with no DOM dependencies
- **Guarded Effect:** Initialization that needs the DOM or must run client-side only

**Reference:** [React Docs - You Might Not Need an Effect](https://react.dev/learn/you-might-not-need-an-effect)
