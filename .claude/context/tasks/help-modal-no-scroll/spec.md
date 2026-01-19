# Spec: Help Modal No-Scroll Redesign

## Overview

Redesign the "Need help" modal component to eliminate the requirement for vertical scrolling. The modal should fit within the viewport while maintaining all content and the modal presentation style.

## Requirements

### Functional Requirements

1. Modal displays all help content without requiring vertical scroll
2. Modal maintains presentation style user prefers
3. Content remains visible and readable
4. Modal responsive across different viewport sizes

### Layout Optimization Strategies

**Option 1: Reduce Content Height**
- Make font sizes smaller within modal
- Reduce padding/margins
- Use more compact spacing

**Option 2: Increase Available Space**
- Increase modal max-height closer to viewport height
- Adjust top/bottom offsets
- Use max-height: calc() to fit viewport better

**Option 3: Content Restructuring**
- If content is lengthy, consider tabs or accordion
- Collapse less critical sections
- Use scrollable regions within modal only for specific sections (if necessary)

**Option 4: Hybrid Approach**
- Combine spacing/font adjustments with better max-height calculation
- Ensure scroll only appears if absolutely necessary

## Implementation Tasks

1. **Identify Modal Component**
   - Locate HelpModal component (likely in src/components/)
   - Document current styling (max-height, padding, font-size, etc.)
   - Identify all content sections

2. **Analyze Content**
   - Measure current modal height at different viewport sizes
   - Identify why scrolling is needed
   - Determine which content can be compacted

3. **Apply Layout Fixes**
   - Adjust modal max-height using viewport-aware values
   - Reduce padding/margins strategically
   - Ensure readability is maintained

4. **Test Across Viewports**
   - Mobile (small, medium, large)
   - Tablet
   - Desktop
   - Verify no scroll appears

## Testing

- Modal renders without scrollbar on standard viewport sizes
- Content is still fully visible and readable
- Responsive behavior works across mobile/tablet/desktop
- No layout breaks or overflow issues

## Success Criteria

- Modal fits viewport without vertical scrollbar
- All content remains visible and readable
- User sees the modal as they expect (same general presentation)
- Works on mobile, tablet, and desktop viewports
