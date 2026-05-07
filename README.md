# Dice Dungeon

A mobile-first **Extraction Runner Bag-Builder**. Assemble a bag of dice, fight through procedurally-generated dungeon floors, and decide when to flee with your Run Souls before you lose everything.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 19 + Vite (TypeScript strict mode) |
| State | Zustand 5 with `persist` middleware |
| Animations | Framer Motion |
| Icons | lucide-react |
| Styling | Inline styles only — mobile portrait, pixel-art aesthetic, 384px max-width |

## Build & Dev

```bash
npm install
npm run dev        # Vite dev server
npm run build      # tsc -b && vite build (zero TypeScript errors required)
npx tsc --noEmit   # type-check only
```

## Project Structure

```
src/
  store/
    gameStore.ts          # All game state, actions, and bestiary
  components/
    CombatScreen.tsx      # Main combat UI (draw, roll, bank, enemy phase)
    ShopScreen.tsx        # The Forge (merge, craft, purify, heal)
    DraftScreen.tsx       # Post-combat die draft
    LoadoutScreen.tsx     # Pre-run bag setup
    InterActScreen.tsx    # The Culling (Act 1 → Act 2 transition)
    ActIntroModal.tsx     # Act 2 intro overlay (Venom + boss briefing)
    DieCard.tsx           # Die rendering + faceColor / dieTypeStyle maps
    DiceInspectorModal.tsx
    DiceLibrary.tsx
    EnemySprite.tsx
    HubScreen.tsx
    SkillTreeScreen.tsx
  App.tsx
public/
  sprites/
    enemies/
      <enemy>/             # Enemy animation sheets: Idle, Attack01, Hurt, Death
```

## Enemy Sprite Assets

Animated enemy sprites live under `public/sprites/enemies/<enemy>/` as horizontal PNG sprite sheets:

- `<Enemy>-Idle.png`
- `<Enemy>-Attack01.png`
- `<Enemy>-Hurt.png`
- `<Enemy>-Death.png`
- optional `<Enemy>-GeneratedSource.png`

`EnemySprite.tsx` maps enemy names to sheet configs. Keep frames in 100x100 cells, remove magenta/chroma-key fringe, and keep feet/anchor stable across frames. Current animated set: Slime, Goblin, Skeleton, Orc, Demon.

## Design Documents

- **[GDD.md](GDD.md)** — Full game design document: core loop, economy, face types, acts, dice catalogue, skill tree, data structures, open questions.
- **[DESIGN_STATE.md](DESIGN_STATE.md)** — Living state doc: what's implemented, known mismatches, balance risks, recent decisions, next work. Read this before making design changes.
- **[CLAUDE.md](CLAUDE.md)** — AI working rules for this codebase.

## Key Design Constraints

- **Zero Gold / Materials / Coins** — everything is `runSouls` (at-risk) or `bankedSouls` (permanent).
- **Souls only.** Never rename these fields.
- **TypeScript zero-error policy** — `npx tsc --noEmit` must pass before any change is considered done.
- **Mobile-first portrait, 384px max-width** — inline styles only, no Tailwind, no border-radius.
- **Player death takes priority over enemy death** in simultaneous-kill scenarios (Thorns, Poison).
- **Unique dice** (`unique`, `mirror`) — one per run; filtered at all 4 draft generation sites via `UNIQUE_DIE_TYPES`.
- **Adding a new die** requires updates to: `DIE_TEMPLATES`, `DIE_NAMES`, `dieTypeStyle`, `faceColor`, `faceShadow`, and `FaceIcon` helpers in `DieCard.tsx`, `DiceLibrary.tsx`, `DiceInspectorModal.tsx`, `DraftScreen.tsx`, `LoadoutScreen.tsx`, `ShopScreen.tsx`, `diceDescriptions.ts`, `DiePresentationModal.tsx`, and (for Culling display) `InterActScreen.tsx`.
- **Adding or replacing enemy sprites** requires updating `public/sprites/enemies/<enemy>/` and `EnemySprite.tsx`, then checking in-game that the sprite stays inside frame during idle, attack, hurt, and death animations.
