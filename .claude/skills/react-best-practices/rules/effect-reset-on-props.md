---
title: Use Key Prop to Reset State
impact: MEDIUM-HIGH
impactDescription: avoids cascading re-renders from effect-based resets
tags: effect, useEffect, key-prop, state-reset, anti-pattern
---

## Use Key Prop to Reset State

Use the `key` prop to reset component state when props change, instead of Effects.

**Why it matters:** Effects run after render, causing children to briefly display stale values before the reset triggers another render cycle.

**Incorrect (effect-based reset):**

```tsx
function ProfilePage({ userId }) {
  const [comment, setComment] = useState('');

  useEffect(() => {
    setComment('');
  }, [userId]);

  return <Comment value={comment} onChange={setComment} />;
}
```

**Correct (key prop resets entire subtree):**

```tsx
function ProfilePage({ userId }) {
  return <Profile userId={userId} key={userId} />;
}

function Profile({ userId }) {
  const [comment, setComment] = useState('');
  return <Comment value={comment} onChange={setComment} />;
}
```

**For partial state adjustments, store IDs instead:**

```tsx
function List({ items }) {
  const [selectedId, setSelectedId] = useState(null);
  // Calculate selection during render—automatically handles removed items
  const selection = items.find(item => item.id === selectedId) ?? null;

  return (/* ... */);
}
```

**Reference:** [React Docs - You Might Not Need an Effect](https://react.dev/learn/you-might-not-need-an-effect)
