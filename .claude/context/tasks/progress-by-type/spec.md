# Spec: Progress by Type Feature

**Status**: Complete - Spec written by spec-writer

**Date**: 2026-01-18

## Overview

Restructure progress tracking to have levels per problem type (addition, subtraction, division, multiplication) instead of the current flat structure.

## Implementation Strategy

### 18 Implementation Tasks in 4 Groups

#### Group A: Data Layer (Parallel)

1. **Create types in /src/types/progress.ts**
   - Define ProgressV2 data structure
   - Problem types: addition, subtraction, multiplication, division
   - Level structure with difficulty progression

2. **Create level config in /src/data/levels.ts**
   - Level definitions per operation type
   - Difficulty curves
   - Problem generation parameters

3. **Create migration service in /src/services/progress-migration.ts**
   - Migrate from old progress format to ProgressV2
   - Handle legacy data

4. **Create level progression service in /src/services/level-progression.ts**
   - Calculate next level
   - Track completion status
   - Progression logic

#### Group B: UI Components (Parallel after Group A)

5. **Create LevelNode.tsx**
   - Individual level node display
   - Lock/unlock states
   - Completion indicators

6. **Create OperationTrack.tsx**
   - Track for single operation type
   - Level nodes layout
   - Navigation

7. **Create OperationLevelMap.tsx**
   - Grid layout of operation tracks
   - All four operation types
   - Interactive map

16. **Add CSS animations**
    - Level completion animations
    - Transitions between levels
    - Visual feedback

17. **Create level-complete modal**
    - Level completion screen
    - Rewards display
    - Next level button

#### Group C: Context/Storage (Parallel after Group A)

8. **Update GameContext.tsx for ProgressV2**
   - New state structure
   - Progress update handlers

9. **Update LocalStorageAdapter for migration**
   - Save/load ProgressV2
   - Migration on load

14. **Update gem calculation**
    - Recalculate based on level completion
    - Award logic

15. **Update stats tracking**
    - Problem attempts per level
    - Completion times

#### Group D: Integration (Sequential)

10. **Update useGame.ts hook**
    - Expose ProgressV2 state
    - Helper functions

11. **Update AdventureMapPage.tsx**
    - Render new level map
    - Navigation

12. **Update ProblemPage.tsx**
    - Track level progress
    - Level completion detection

13. **Update router/index.tsx**
    - Route to level map
    - Pass level context

18. **Integration testing**
    - End-to-end flows
    - Edge cases

## Parallelization

- **Phase 1**: Groups A, B, C can start in parallel after architecture review
- **Phase 2**: Group B can start once Group A is complete
- **Phase 3**: Group C can start once Group A is complete
- **Phase 4**: Group D executes sequentially with integration

## Next Phase

Ready for implementer + test-writer dispatch on Group A tasks (1-4).
