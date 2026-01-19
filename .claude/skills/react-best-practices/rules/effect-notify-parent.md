---
title: Notify Parents in Handlers, Not Effects
impact: MEDIUM
impactDescription: eliminates extra render pass
tags: effect, useEffect, callback, parent, anti-pattern
---

## Notify Parents in Handlers, Not Effects

Call parent callbacks directly in event handlers instead of using Effects to watch state.

**Why it matters:** Using Effects to notify parents adds an extra render pass—the parent updates its state after receiving the callback, causing another re-render.

**Incorrect (effect watches state to notify parent):**

```tsx
function Toggle({ onChange }) {
  const [isOn, setIsOn] = useState(false);

  useEffect(() => {
    onChange(isOn);
  }, [isOn, onChange]);

  function handleClick() {
    setIsOn(!isOn);
  }

  return <button onClick={handleClick}>{isOn ? 'On' : 'Off'}</button>;
}
```

**Correct (notify parent in same event):**

```tsx
function Toggle({ onChange }) {
  const [isOn, setIsOn] = useState(false);

  function handleClick() {
    const nextIsOn = !isOn;
    setIsOn(nextIsOn);
    onChange(nextIsOn);
  }

  return <button onClick={handleClick}>{isOn ? 'On' : 'Off'}</button>;
}
```

**Even better—lift state if parent needs to control it:**

```tsx
function Toggle({ isOn, onChange }) {
  return (
    <button onClick={() => onChange(!isOn)}>
      {isOn ? 'On' : 'Off'}
    </button>
  );
}
```

**Reference:** [React Docs - You Might Not Need an Effect](https://react.dev/learn/you-might-not-need-an-effect)
