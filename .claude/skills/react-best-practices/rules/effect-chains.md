---
title: Avoid Chains of Effects
impact: MEDIUM-HIGH
impactDescription: prevents cascading re-renders and brittle code
tags: effect, useEffect, chain, anti-pattern
---

## Avoid Chains of Effects

Don't use multiple Effects that trigger each other in sequence via state updates.

**Why it matters:** Effect chains cause cascading re-renders, are difficult to follow, and become brittle as requirements change.

**Incorrect (effect chain):**

```tsx
function Game() {
  const [card, setCard] = useState(null);
  const [goldCardCount, setGoldCardCount] = useState(0);
  const [round, setRound] = useState(1);

  useEffect(() => {
    if (card?.gold) {
      setGoldCardCount(c => c + 1);
    }
  }, [card]);

  useEffect(() => {
    if (goldCardCount > 3) {
      setGoldCardCount(0);
      setRound(r => r + 1);
    }
  }, [goldCardCount]);

  useEffect(() => {
    if (round > 5) {
      alert('Good game!');
    }
  }, [round]);
}
```

**Correct (calculate in event handler):**

```tsx
function Game() {
  const [card, setCard] = useState(null);
  const [goldCardCount, setGoldCardCount] = useState(0);
  const [round, setRound] = useState(1);

  function handlePlaceCard(nextCard) {
    setCard(nextCard);

    if (nextCard.gold) {
      if (goldCardCount < 3) {
        setGoldCardCount(goldCardCount + 1);
      } else {
        setGoldCardCount(0);
        setRound(round + 1);
        if (round === 5) {
          alert('Good game!');
        }
      }
    }
  }
}
```

**Key insight:** If you can calculate the next state from the event that triggered the change, do it there instead of spreading the logic across Effects.

**Reference:** [React Docs - You Might Not Need an Effect](https://react.dev/learn/you-might-not-need-an-effect)
