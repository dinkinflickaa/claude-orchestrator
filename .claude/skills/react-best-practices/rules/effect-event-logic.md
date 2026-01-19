---
title: Keep Event Logic in Event Handlers
impact: MEDIUM-HIGH
impactDescription: prevents unintended side effects and clarifies intent
tags: effect, useEffect, event-handler, anti-pattern
---

## Keep Event Logic in Event Handlers

Code that runs in response to a user action belongs in event handlers, not Effects.

**Why it matters:** Effects lose context about what triggered them and can fire unexpectedly on re-renders or state changes unrelated to the user action.

**Decision rule:** Ask "Why does this code run?"
- **Because the component was displayed** → Use Effect
- **Because the user did something specific** → Use event handler

**Incorrect (effect for user action):**

```tsx
function ProductItem({ product, onAdd }) {
  useEffect(() => {
    if (product.isInCart) {
      showNotification(`Added ${product.name} to cart!`);
    }
  }, [product]);

  return <button onClick={() => onAdd(product)}>Add to Cart</button>;
}
```

**Correct (event handler for user action):**

```tsx
function ProductItem({ product, onAdd }) {
  function handleBuyClick() {
    onAdd(product);
    showNotification(`Added ${product.name} to cart!`);
  }

  return <button onClick={handleBuyClick}>Add to Cart</button>;
}
```

**POST requests follow the same rule:**

```tsx
// ✅ Analytics on page view: Effect (display-triggered)
useEffect(() => {
  post('/analytics/event', { eventName: 'visit_form' });
}, []);

// ✅ Form submission: Event handler (user-triggered)
function handleSubmit(e) {
  e.preventDefault();
  post('/api/register', { firstName, lastName });
}
```

**Reference:** [React Docs - You Might Not Need an Effect](https://react.dev/learn/you-might-not-need-an-effect)
