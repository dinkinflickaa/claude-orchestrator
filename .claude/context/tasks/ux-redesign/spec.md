# UX Redesign - Implementation Spec

**Status**: Ready for Implementation
**Task Slug**: ux-redesign
**Spec Version**: 1.0

---

## Overview

The UX redesign implements a comprehensive visual system refresh with soft, muted colors (warm cream backgrounds), Typography upgrades via Nunito, custom border-radius tokens, enhanced animations with longer durations and spring-like easing, and a new shadow system. The redesign maintains backwards compatibility and preserves all accessibility features while improving visual cohesion across 12 component files through centralized Tailwind configuration and CSS custom properties.

---

## Architecture

### Design Pattern: Token-Based System
- **Color tokens**: Semantic palette (primary, success, warning, gem, accent) with 50-900 scale
- **CSS custom properties**: Animation timing and easing defined once in :root
- **Border-radius abstractions**: Named tokens (rounded-soft, rounded-blob, rounded-pill) instead of hardcoded values
- **Shadow utilities**: Predefined soft and float shadows replace sharp drop-shadows

### Constraints
- No new npm dependencies (Google Fonts via HTML link only)
- Maintain backwards compatibility with existing Tailwind variant names
- All colors sourced from Tailwind config (no hardcoded hex in components)
- Preserve accessibility attributes and touch targets (48px minimum)

---

## Implementation Batches

### Batch 1: Foundation [parallel]
Foundation layer updates that enable all other batches. No dependencies.

#### Task 001: Update Tailwind Configuration [parallel]
**Creates:** N/A
**Modifies:** `/Users/sachinjain/work/mathy/tailwind.config.js`

**Changes:**
1. Replace `theme.colors` with new palette:
   - `colors.background: "#FFF8F0"` (warm cream)
   - `colors.primary`: 50-900 scale (blue tones)
   - `colors.success`: 50-900 scale (green tones)
   - `colors.warning`: 50-900 scale (orange tones)
   - `colors.gem`: 50-900 scale (purple tones)
   - `colors.accent`: 50-900 scale (pink tones)
   - `colors.text: "#4A4A4A"` (soft charcoal)

2. Add custom border-radius tokens to `theme.extend.borderRadius`:
   - `'rounded-soft': '24px'`
   - `'rounded-blob': '32px'`
   - `'rounded-pill': '9999px'`

3. Add custom shadow tokens to `theme.extend.boxShadow`:
   - `'shadow-soft': '0 4px 20px rgba(139, 90, 43, 0.08)'`
   - `'shadow-float': '0 8px 30px rgba(139, 90, 43, 0.12)'`

4. Ensure `fontFamily` extends to include `'sans': ['Nunito', 'system-ui', 'sans-serif']`

**Test Considerations:**
- Verify all 5 color scales render correctly (primary, success, warning, gem, accent)
- Confirm each color from 50-900 exists and matches architect specs exactly
- Test border-radius tokens apply correctly to test elements
- Validate shadow tokens render with correct rgba values
- Check font-family cascade defaults to Nunito

---

#### Task 002: Add Google Fonts Link to HTML [parallel]
**Creates:** N/A
**Modifies:** `/Users/sachinjain/work/mathy/index.html`

**Changes:**
1. Add within `<head>` section (before other stylesheets):
   ```html
   <link rel="preconnect" href="https://fonts.googleapis.com">
   <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
   <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&display=swap" rel="stylesheet">
   ```

**Test Considerations:**
- Verify Nunito font loads without FOUT/FOIT flashing
- Confirm weights 400, 600, 700, 800 are available
- Test preconnect DNS hints reduce font load latency

---

#### Task 003: Update CSS Custom Properties and Animations [parallel]
**Creates:** N/A
**Modifies:** `/Users/sachinjain/work/mathy/src/index.css`

**Changes:**
1. Update `:root` block with new CSS custom properties:
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

2. Add new animation keyframes:
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

   .animate-float-up {
     animation: float-up var(--duration-slow) var(--ease-soft) forwards;
   }
   ```

3. Update existing animation keyframes:
   - `confetti-fall`: Change duration from 2s to 4s
   - `block-bounce`: Change duration from 0.3s to 0.6s
   - `block-pulse`: Change duration from 0.5s to 1s
   - `block-pop`: Change duration from 0.2s to 0.4s
   - Replace all easing with `var(--ease-spring)` or `var(--ease-soft)` as appropriate

4. Update all transition utilities to use `transition: all var(--duration-fast)` instead of hardcoded 150ms/200ms

**Test Considerations:**
- Verify CSS custom properties resolve correctly in computed styles
- Test spring easing renders smooth (cubic-bezier values correct)
- Confirm squish animation scales to 0.92 at 50% keyframe
- Validate float-up animation moves up 60px and scales 1.2x
- Check confetti-fall now takes 4s (not 2s)
- Verify all transitions use var(--duration-fast) = 300ms

---

### Batch 2: Core Components [sequential:after-1,2,3]
Core structural components that depend on Batch 1 foundation.

#### Task 004: Update Button Component [sequential:after-1,2,3]
**Creates:** N/A
**Modifies:** `/Users/sachinjain/work/mathy/src/components/common/Button.tsx`

**Changes:**
1. Update className to use new color tokens from Tailwind config:
   - Primary button variant: `bg-primary-500` instead of previous color
   - Secondary/outline variants: Use new primary scale (200, 300, 400 for borders/text)
   - Disabled state: `bg-primary-100 text-primary-300`

2. Replace border-radius: Use `rounded-soft` instead of hardcoded values

3. Update transition timing: Use `transition-all duration-300` (from var(--duration-fast))

4. Update hover/active states to use new color scale:
   - Hover: `bg-primary-600`
   - Active: `bg-primary-700`

**TypeScript Signature:**
```typescript
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  disabled?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}
```

**Test Considerations:**
- Verify primary button renders with `bg-primary-500` color
- Test disabled state uses `bg-primary-100`
- Confirm hover applies `bg-primary-600`
- Check border-radius is 24px (rounded-soft)
- Validate transition duration is 300ms
- Test all variants (primary, secondary, outline, ghost) with new colors
- Verify touch target is at least 48px

---

#### Task 005: Update MainLayout Component [sequential:after-1,2,3]
**Creates:** N/A
**Modifies:** `/Users/sachinjain/work/mathy/src/components/layouts/MainLayout.tsx`

**Changes:**
1. Update background gradient to use warm cream tones:
   - Replace current gradient with: `from-background to-primary-50`
   - Or use: `bg-gradient-to-br from-[#FFF8F0] to-[#F0F7FF]`

2. Ensure text color uses `text-text` (which maps to #4A4A4A)

3. Update any child component shadow props to use `shadow-soft` instead of default shadow

**Test Considerations:**
- Verify background renders as warm cream-to-light-blue gradient
- Test gradient direction (to-br = bottom-right) renders correctly
- Confirm text color is #4A4A4A (not pure black)
- Check component layout structure unchanged
- Validate responsive behavior preserved

---

### Batch 3: Feature Components [sequential:after-1,2,3]
Feature-specific components that depend on Batch 1 foundation.

#### Task 006: Update NumberPad Component [sequential:after-1,2,3]
**Creates:** N/A
**Modifies:** `/Users/sachinjain/work/mathy/src/components/common/NumberPad.tsx`

**Changes:**
1. Update button colors to new palette:
   - Primary buttons: `bg-primary-500 hover:bg-primary-600`
   - Success buttons: `bg-success-500 hover:bg-success-600`
   - Warning buttons: `bg-warning-500 hover:bg-warning-600`

2. Add squish animation on button press:
   - Add `active:animate-squish` to button className
   - Requires CSS keyframe `squish` from Task 003

3. Update border-radius to `rounded-blob` (32px) for organic feel

4. Update shadows to `shadow-soft`

5. Increase padding for larger touch targets (ensure 48px+ minimum)

**Test Considerations:**
- Verify number buttons render with correct colors
- Test squish animation triggers on active state (0.15s duration)
- Confirm border-radius is 32px (rounded-blob)
- Check shadow is soft shadow (0 4px 20px rgba(...))
- Validate touch targets are at least 48px
- Test color feedback for different button types (primary, success, warning)

---

#### Task 007: Update ProblemCard Component [sequential:after-1,2,3]
**Creates:** N/A
**Modifies:** `/Users/sachinjain/work/mathy/src/components/problem/ProblemCard.tsx`

**Changes:**
1. Update text colors to use new palette:
   - Problem statement: `text-text` (#4A4A4A)
   - Headings: `text-primary-800`
   - Secondary text: `text-text/60` (60% opacity)

2. Update background to `bg-white` with `shadow-soft` instead of sharp shadows

3. Update border-radius to `rounded-blob` (32px)

4. Update any internal button colors to use new primary/success colors

5. Update transitions to use `transition-all duration-300`

**Test Considerations:**
- Verify text colors match new palette
- Test shadow renders as soft shadow, not sharp
- Confirm border-radius is 32px
- Check card layout structure preserved
- Validate button colors within card updated correctly
- Test responsive behavior on mobile

---

#### Task 008: Update FeedbackAnimation Component [sequential:after-1,2,3]
**Creates:** N/A
**Modifies:** `/Users/sachinjain/work/mathy/src/components/problem/FeedbackAnimation.tsx`

**Changes:**
1. Update confetti animation:
   - Change animation duration from 2s to 4s (already updated in Task 003 CSS)
   - Reduce particle count from 20 to 10

2. Replace bounce animation with gentle float animation:
   - Use new `float-up` keyframe defined in Task 003
   - Each particle should float up 60px and scale to 1.2x while fading

3. Update particle colors to use new palette:
   - Use success-400, success-500, gem-400, gem-500, accent-400 colors

4. Ensure animation easing uses `var(--ease-spring)` for spring-like feel

**Test Considerations:**
- Verify confetti animation lasts 4s (not 2s)
- Count particle renders = 10 (not 20)
- Test float-up animation moves particles 60px upward
- Confirm scale reaches 1.2x at end of animation
- Verify opacity fades from 1 to 0
- Check particle colors use new gem/success/accent palette
- Test animation timing feels gentle, not bouncy

---

### Batch 4: Secondary Components [sequential:after-1,2,3]
UI elements that depend on Batch 1 foundation.

#### Task 009: Update Modal Component [sequential:after-1,2,3]
**Creates:** N/A
**Modifies:** `/Users/sachinjain/work/mathy/src/components/common/Modal.tsx`

**Changes:**
1. Update modal background to `bg-white`

2. Update border-radius to `rounded-blob` (32px)

3. Update shadow to `shadow-float` (larger, warmer shadow for elevation)

4. Update backdrop color to softer overlay:
   - Change to `bg-black/20` (instead of black/40 if darker)
   - Or use `bg-text/10` for warm tint

5. Update text colors:
   - Title: `text-primary-800`
   - Body: `text-text`
   - Secondary: `text-text/60`

6. Update close button to use new primary colors

7. Update transitions to `transition-all duration-300`

**Test Considerations:**
- Verify modal background is white
- Check border-radius is 32px
- Test shadow is float shadow (larger, warmer)
- Confirm backdrop is semi-transparent (not too dark)
- Validate text colors match new palette
- Test close button color updated
- Check modal animations use 300ms duration
- Verify mobile responsiveness

---

#### Task 010: Update LevelNode Component [sequential:after-1,2,3]
**Creates:** N/A
**Modifies:** `/Users/sachinjain/work/mathy/src/components/map/LevelNode.tsx`

**Changes:**
1. Update node background colors:
   - Locked: `bg-primary-100`
   - Unlocked: `bg-primary-400`
   - Completed: `bg-success-500`
   - Current: `bg-warning-400`

2. Update text colors:
   - Title: `text-white` (on colored backgrounds)
   - Secondary: `text-primary-700` (for light backgrounds)

3. Update pulse animation to slower, gentler version:
   - Use `animate-pulse` with custom timing (2s instead of default)
   - Or define custom `level-pulse` keyframe: 0% scale(1), 50% scale(1.05), 100% scale(1) over 1s

4. Update border-radius to `rounded-soft` (24px)

5. Update shadows to `shadow-soft`

6. Update transitions to `transition-all duration-300`

**Test Considerations:**
- Verify colors match level states (locked, unlocked, completed, current)
- Test text contrast on new background colors (WCAG AA minimum)
- Check pulse animation duration is slower (2s or custom 1s)
- Confirm border-radius is 24px
- Validate shadow is soft shadow
- Test transitions use 300ms
- Verify interactive states (hover, active) use new colors

---

#### Task 011: Update GemCounter Component [sequential:after-1,2,3]
**Creates:** N/A
**Modifies:** `/Users/sachinjain/work/mathy/src/components/common/GemCounter.tsx`

**Changes:**
1. Update gem icon color to `text-gem-500` (new gem purple from palette)

2. Update counter background to `bg-gem-50` with `text-gem-600`

3. Update border to `border-gem-200`

4. Update border-radius to `rounded-pill` (9999px) for pill shape

5. Update any animated glow effect:
   - Use `shadow-soft` with gem-colored shadow: `0 4px 20px rgba(155, 126, 217, 0.15)` (gem purple with custom alpha)

6. Update transitions to `transition-all duration-300`

**Test Considerations:**
- Verify gem icon color is gem-500 (purple)
- Test background is light gem-50
- Check border color is gem-200
- Confirm border-radius is 9999px (pill shape)
- Validate shadow glow uses gem colors
- Test transitions use 300ms
- Check responsiveness on mobile

---

#### Task 012: Update Avatar Component [sequential:after-1,2,3]
**Creates:** N/A
**Modifies:** `/Users/sachinjain/work/mathy/src/components/common/Avatar.tsx`

**Changes:**
1. Update avatar background gradient to use warmer tones:
   - Replace with: `from-primary-300 to-accent-400`
   - Or if using orange: `from-warning-300 to-accent-300`

2. Update text color to `text-white` (high contrast on gradient)

3. Update border-radius to `rounded-blob` (32px) or `rounded-pill` (9999px) depending on style

4. Update any border/ring colors to use new primary/accent palette

5. Update shadow to `shadow-soft`

6. Update transitions to `transition-all duration-300`

**Test Considerations:**
- Verify gradient uses warmer primary and accent colors
- Test text color contrast (white on gradient background)
- Check border-radius matches design (32px or pill)
- Validate shadow is soft shadow
- Test transitions use 300ms
- Verify responsiveness on different sizes
- Check avatar renders correctly in all contexts

---

## Implementation Order

### Parallel Execution Map

```
Batch 1 (Tasks 001-003)         ← All parallel
  ↓
Batch 2 (Tasks 004-005)         ← Both parallel, depends on Batch 1
Batch 3 (Tasks 006-008)         ← All parallel, depends on Batch 1
Batch 4 (Tasks 009-012)         ← All parallel, depends on Batch 1

Total critical path: 2 dependency levels
```

### Recommended Dispatch Order
1. Start all Batch 1 tasks (001, 002, 003) simultaneously
2. Wait for Batch 1 completion
3. Start all remaining tasks (004-012) simultaneously in two batches:
   - Batch 2 & 3 & 4 can all start together after Batch 1

---

## Acceptance Criteria

### Per-Task Verification
1. All color tokens appear in computed styles when classes applied
2. Border-radius values match specs (soft: 24px, blob: 32px, pill: 9999px)
3. Animation durations use CSS custom properties and match targets (300ms, 500ms, 800ms)
4. Shadow values match architect specs (soft, float)
5. All transitions use 300ms duration
6. Text remains accessible (WCAG AA contrast minimum)
7. Touch targets maintain 48px minimum

### System-Wide Verification
1. Entire UI renders without console errors
2. Tailwind production build includes all new color variants
3. Google Fonts Nunito loads without FOUT/FOIT
4. All 12 modified components render correctly together
5. Mobile responsiveness preserved
6. No hardcoded hex colors in component files
7. All accessibility attributes (aria-*, role, etc.) preserved

---

## Risk Mitigation

### Color Palette Changes
- **Risk**: Component tests may fail if expecting old colors
- **Mitigation**: Update all color assertions in component tests
- **Verification**: Run full test suite after Batch 1 completes

### Animation Duration Changes
- **Risk**: Existing test timeouts may be too short
- **Mitigation**: Update jest timers/vitest timing expectations
- **Verification**: Test confetti animation actually lasts 4s

### Font Loading
- **Risk**: FOUT (Flash of Unstyled Text) if Google Fonts slow to load
- **Mitigation**: Preconnect hints in index.html reduce latency
- **Verification**: Lighthouse performance audit

### Mobile Responsiveness
- **Risk**: Larger border-radius (blob: 32px) may look odd on small screens
- **Mitigation**: Design already vetted for mobile by architect
- **Verification**: Visual testing on iPhone 12/14 sizes

---

## Success Metrics

- All 12 components implement spec changes without regressions
- Zero color/spacing/animation bugs in test suite
- Lighthouse accessibility score remains 90+
- Visual regression tests pass (if available)
- Mobile UX feels smooth with new spring easing
