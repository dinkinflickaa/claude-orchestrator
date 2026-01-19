---
title: Handle Race Conditions in Data Fetching
impact: MEDIUM-HIGH
impactDescription: prevents stale data from overwriting fresh data
tags: effect, useEffect, fetch, race-condition, async
---

## Handle Race Conditions in Data Fetching

When fetching data in Effects, implement cleanup to ignore stale responses.

**Why it matters:** If a user changes inputs quickly, earlier requests might resolve after later ones, displaying incorrect data.

**Incorrect (no race condition handling):**

```tsx
function SearchResults({ query }) {
  const [results, setResults] = useState([]);

  useEffect(() => {
    fetchResults(query).then(json => {
      setResults(json);
    });
  }, [query]);

  return <ResultsList items={results} />;
}
```

**Correct (cleanup ignores stale responses):**

```tsx
function SearchResults({ query }) {
  const [results, setResults] = useState([]);

  useEffect(() => {
    let ignore = false;

    fetchResults(query).then(json => {
      if (!ignore) {
        setResults(json);
      }
    });

    return () => {
      ignore = true;
    };
  }, [query]);

  return <ResultsList items={results} />;
}
```

**Better—use a data fetching library:**

```tsx
function SearchResults({ query }) {
  const { data: results } = useSWR(
    `/api/search?q=${query}`,
    fetcher
  );

  return <ResultsList items={results ?? []} />;
}
```

**Best options for data fetching:**
- **SWR or TanStack Query:** Client-side fetching with caching
- **React Server Components:** Server-side data loading
- **Framework data loaders:** Next.js, Remix, etc.

**Reference:** [React Docs - You Might Not Need an Effect](https://react.dev/learn/you-might-not-need-an-effect)
