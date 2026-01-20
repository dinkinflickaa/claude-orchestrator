# Architect: hello-world-greeting

## Design Decisions

| Aspect | Guidance | SOLID Principle |
|--------|----------|-----------------|
| Module Organization | Create src/hello.ts as a simple utility module. | SRP |
| Function Design | Export a pure function greet(name: string): string. | SRP |
| Type Safety | Use TypeScript with explicit string parameter and return type. | Explicit contracts |

## File Placement

**New Files:**
- src/hello.ts

**Modified Files:**
- None

## Design Patterns

**Required Patterns:**
- Export named function
- Use simple string interpolation

## Constraints

- Keep it simple
- No external dependencies
- Pure function

## Task Breakdown

| ID | Name | Files | Dependencies | Description |
|----|------|-------|--------------|-------------|
| 1 | Create hello.ts with greet function | src/hello.ts | None | Create src/hello.ts with greet(name: string) function |

## Implementation Notes

This is a straightforward utility module with a single pure function. The greet function should accept a name parameter and return a greeting string using simple string interpolation. All type contracts are explicit via TypeScript annotations.
