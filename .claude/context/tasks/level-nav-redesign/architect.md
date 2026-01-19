# Level Navigation Redesign - Architecture

## Navigation Flow
- 3-layer: AdventureHub → OperationDetailPage → ProblemPage
- Routes: /adventure (hub), /adventure/:operation (levels), /play/:operation/:level

## New Components
1. OperationCard - Shows operation with progress ring
2. LevelCard - Shows level name, status, gem reward
3. StatusBadge - Locked/unlocked/current/completed indicator
4. ProgressRing - Circular progress for operation cards
5. Breadcrumb - Navigation trail

## New Pages
1. OperationSelectPage - Grid of 4 operation cards
2. LevelSelectPage - Grid of level cards for one operation

## New Hook
- useOperationSummary - Derives progress stats from existing data

## Grid Layout
- Mobile: 1 column
- Tablet: 2 columns
- Desktop: 3-4 columns

## Key Requirements
- Level NAMES prominent (not numbers)
- Card-based grid (not circles)
- Show progress and gem rewards
- Min 48px touch targets
