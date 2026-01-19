# UX Redesign - Architect Output

**Status**: Complete
**Task Slug**: ux-redesign

---

## Design Decisions

### 1. Color System Architecture
**Guidance:** Replace the entire Tailwind color palette with soft, muted tones. Create a semantic color layer that maps purpose to colors. Keep current color token structure (50-900 scale) but shift all values to the new palette.

**SOLID:** OCP - Color tokens as abstractions allow palette changes without component modifications

### 2. Typography System
**Guidance:** Add Nunito via Google Fonts in index.html. Update :root in index.css to use Nunito as primary font-family. Avoid adding a second font - Nunito works for both display and body.

**SOLID:** SRP - Typography defined in one place (index.css + tailwind.config.js)

### 3. Border Radius Strategy
**Guidance:** Define custom border-radius tokens: 'rounded-soft' (24px), 'rounded-blob' (32px), 'rounded-pill' (9999px). Apply 'rounded-blob' to cards/modals, 'rounded-soft' to buttons.

**SOLID:** DIP - Components depend on abstract radius tokens, not hardcoded values

### 4. Animation Timing Overhaul
**Guidance:** Create CSS custom properties for animation durations: --duration-fast (300ms), --duration-normal (500ms), --duration-slow (800ms). Replace all 150ms/200ms transitions with 300ms minimum. Add spring-like easing via cubic-bezier(0.34, 1.56, 0.64, 1).

**SOLID:** OCP - Centralized timing allows global feel adjustments

### 5. Shadow System
**Guidance:** Replace sharp drop-shadows with diffuse, warm shadows. Create 'shadow-soft' (0 4px 20px rgba(139, 90, 43, 0.08)), 'shadow-float' (0 8px 30px rgba(139, 90, 43, 0.12)).

**SOLID:** ISP - Small, focused shadow utilities

### 6. NumberPad Blob Buttons
**Guidance:** Add 'squish' animation on press: scale(0.92) with 100ms ease-out. Use softer colors and larger border-radius for organic feel.

### 7. Feedback Animation Calming
**Guidance:** Slow confetti animation from 2s to 4s. Reduce confetti count from 20 to 10 particles. Replace bounce with gentle float animation.

---

## New Color Palette

```javascript
{
  background: "#FFF8F0",  // warm cream
  primary: {
    50: "#F0F7FF", 100: "#E0EFFF", 200: "#B8D9F7", 300: "#8CC2F0",
    400: "#6AADE8", 500: "#5B9BD5", 600: "#4A85C2", 700: "#3A6FA8",
    800: "#2A5A8F", 900: "#1A4575"
  },
  success: {
    50: "#F0F9F1", 100: "#DCF2DE", 200: "#B8E5BC", 300: "#94D89A",
    400: "#7BC47F", 500: "#6BB36F", 600: "#5A9F5E", 700: "#4A8B4E",
    800: "#3A773E", 900: "#2A632E"
  },
  warning: {
    50: "#FFF8F0", 100: "#FEEFD8", 200: "#FDE0B5", 300: "#FBD092",
    400: "#F5A962", 500: "#E89850", 600: "#D4873F", 700: "#BF762E",
    800: "#AA651D", 900: "#95540C"
  },
  gem: {
    50: "#F5F0FA", 100: "#EBE0F5", 200: "#D7C2EB", 300: "#C3A4E1",
    400: "#AF86D7", 500: "#9B7ED9", 600: "#8A6CC7", 700: "#7A5AB5",
    800: "#6A48A3", 900: "#5A3691"
  },
  accent: {
    50: "#FDF5FA", 100: "#FBEAF5", 200: "#F5D5EB", 300: "#EFC0E1",
    400: "#E8B4D9", 500: "#DDA3CC", 600: "#D292BF", 700: "#C781B2",
    800: "#BC70A5", 900: "#B15F98"
  },
  text: "#4A4A4A"  // soft charcoal (not pure black)
}
```

---

## Files to Modify (Priority Order)

| Priority | File | Changes |
|----------|------|---------|
| 1 | tailwind.config.js | Color palette, border-radius (soft: 24px, blob: 32px), shadows (soft, float), fonts |
| 2 | index.html | Google Fonts link for Nunito |
| 3 | src/index.css | CSS variables (--ease-spring, --duration-*), updated animation keyframes, :root font |
| 4 | src/components/layouts/MainLayout.tsx | Background gradient to warm cream tones |
| 5 | src/components/common/Button.tsx | Colors, rounded-soft, transitions 300ms |
| 6 | src/components/common/NumberPad.tsx | Blob buttons, squish animation, soft colors |
| 7 | src/components/problem/ProblemCard.tsx | Colors, soft shadows |
| 8 | src/components/problem/FeedbackAnimation.tsx | Slower animations (4s confetti), 10 particles |
| 9 | src/components/common/Modal.tsx | rounded-blob, softer backdrop |
| 10 | src/components/map/LevelNode.tsx | Colors, softer pulse animation |
| 11 | src/components/common/GemCounter.tsx | New gem purple color |
| 12 | src/components/common/Avatar.tsx | Warmer gradient tones |

---

## Animation Timing Changes

| Animation | Current | Target |
|-----------|---------|--------|
| confetti-fall | 2s | 4s |
| block-bounce | 0.3s | 0.6s |
| block-pulse | 0.5s | 1s |
| block-pop | 0.2s | 0.4s |
| transitions | 150-200ms | 300ms |

**New easing:** `cubic-bezier(0.34, 1.56, 0.64, 1)` (spring-like)

---

## CSS Custom Properties (for index.css)

```css
:root {
  --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
  --ease-soft: cubic-bezier(0.4, 0, 0.2, 1);
  --duration-fast: 300ms;
  --duration-normal: 500ms;
  --duration-slow: 800ms;

  font-family: 'Nunito', system-ui, sans-serif;
  color: #4A4A4A;
  background-color: #FFF8F0;
}
```

---

## New Animation Keyframes

```css
@keyframes squish {
  0% { transform: scale(1); }
  50% { transform: scale(0.92); }
  100% { transform: scale(1); }
}

.animate-squish {
  animation: squish 0.15s var(--ease-spring);
}

@keyframes float-up {
  0% { opacity: 1; transform: translateY(0) scale(1); }
  100% { opacity: 0; transform: translateY(-60px) scale(1.2); }
}
```

---

## Constraints

- No new npm dependencies (Google Fonts via HTML link only)
- Maintain backwards compatibility - existing variant names must work
- Touch targets minimum 48px (preserve min-h-touch, min-w-touch)
- All colors through Tailwind config - no hardcoded hex in components
- Preserve accessibility attributes (aria-label, role, etc.)
- Test on mobile viewport

---

## Google Fonts Link (for index.html)

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&display=swap" rel="stylesheet">
```
