---
title: Don't Use Effects for Derived State
impact: MEDIUM-HIGH
impactDescription: eliminates unnecessary render cycles
tags: effect, useEffect, derived-state, anti-pattern
---

## Don't Use Effects for Derived State

Calculate derived values directly during rendering instead of using Effects to update state.

**Why it matters:** Using Effects for derived state causes two render cycles—first with stale data, then again after the Effect updates state.

**Incorrect (extra render cycle):**

```tsx
const [firstName, setFirstName] = useState('');
const [lastName, setLastName] = useState('');
const [fullName, setFullName] = useState('');

useEffect(() => {
  setFullName(firstName + ' ' + lastName);
}, [firstName, lastName]);
```

**Correct (calculate during render):**

```tsx
const [firstName, setFirstName] = useState('');
const [lastName, setLastName] = useState('');

const fullName = firstName + ' ' + lastName;
```

**For expensive calculations, use useMemo:**

```tsx
const visibleTodos = useMemo(
  () => getFilteredTodos(todos, filter),
  [todos, filter]
);
```

**Reference:** [React Docs - You Might Not Need an Effect](https://react.dev/learn/you-might-not-need-an-effect)
