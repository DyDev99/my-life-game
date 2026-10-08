# ADR-0003: One Zustand store, to be split into slices

- Status: Accepted
- Date: 2026-10-08

## Context
`useGameStore` holds UI routing, player, time, vehicles, activities and minigames, and 28 files consume it.

## Decision
Keep a single store and a single `useGameStore` hook. When it is refactored, split it internally into slices with pure rule functions, without introducing multiple stores, an event bus, or DI.

## Consequences
Consumers don't change during the split. Game rules become unit-testable without React.
