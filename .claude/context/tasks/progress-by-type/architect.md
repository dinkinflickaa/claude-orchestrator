# Architecture Design: Progress by Type

**Status**: Complete

**Date**: 2026-01-18

## Current Structure Issue

The existing progress system uses:
- Linear chapter-based progression with `currentChapter` and `completedChapters`
- Per-operation `currentDifficulty` exists (range 1-10) but is hidden from user
- UI shows chapters, not operation mastery
- Difficult to visualize per-operation skill levels

## Desired New Structure (ProgressV2)

Replace the chapter-based system with operation-level progression:

```typescript
type ProgressV2 = {
  schemaVersion: 2;
  operations: {
    add: OperationProgress;
    sub: OperationProgress;
    mul: OperationProgress;
    div: OperationProgress;
  };
}

type OperationProgress = {
  currentLevel: number;           // 1-10, current level player is on
  unlockedLevels: number[];       // Levels available to play
  completedLevels: number[];      // Levels with 100% completion
  stats: {
    attemptCount: number;
    correctCount: number;
    accuracy: number;             // 0-100
  };
  levelAttempts: Record<number, LevelAttempt[]>;
}

type LevelAttempt = {
  timestamp: number;
  problemsAttempted: number;
  problemsCorrect: number;
  accuracy: number;
}
```

## Design Principles

1. **Per-Operation Mastery**: Each operation (add, sub, mul, div) has independent progression
2. **Granular Tracking**: Know exactly which levels are completed/available
3. **Migration Friendly**: SchemaVersion allows detecting old vs. new data
4. **Backward Compatible**: Migration service converts old data to new format
5. **Stats Rich**: Track attempts per level for better UX insights

## Files to Create

| File | Purpose |
|------|---------|
| `/src/types/progress.ts` | New ProgressV2 types and interfaces |
| `/src/data/levels.ts` | Level difficulty configs (1-10) |
| `/src/services/progress-migration.ts` | V1 → V2 migration logic |
| `/src/services/level-progression.ts` | Level unlock/completion logic |
| `/src/components/map/OperationLevelMap.tsx` | Main level selection grid |
| `/src/components/map/OperationTrack.tsx` | Single operation progress track |
| `/src/components/map/LevelNode.tsx` | Individual level node (locked/available/completed) |

## Files to Modify

| File | Changes |
|------|---------|
| `/src/types/index.ts` | Export new ProgressV2 types |
| `/src/contexts/GameContext.tsx` | Update context to use ProgressV2 |
| `/src/hooks/useGame.ts` | Adapt hooks to new structure |
| `/src/pages/AdventureMapPage.tsx` | Replace chapter view with operation tracks |
| `/src/pages/ProblemPage.tsx` | Update progress tracking on problem solve |
| `/src/router/index.tsx` | Update navigation to level-based routing |

## Migration Strategy

**Trigger**: Detect missing `schemaVersion` field in stored progress

**Mapping**:
- `currentDifficulty` (1-10) → `currentLevel`
- `unlockedLevels = [1, 2, ..., currentDifficulty]`
- `completedLevels = [1, 2, ..., currentDifficulty - 1]`
- `stats` initialized with attempt history (if available)
- Default `levelAttempts` to empty object or reconstruct from session data if available

**Validation**:
- Ensure all 4 operations exist after migration
- Log warnings if data is incomplete
- Graceful fallback to level 1 if migration fails

## Next Steps

1. **Spec Writer** → Detailed spec for each file
2. **Implementer** → Create new types, services, components
3. **Test Writer** → Unit tests for migration, level progression logic
4. **Test Runner** → Verify migration doesn't break existing saves
