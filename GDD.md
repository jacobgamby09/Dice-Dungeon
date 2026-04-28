# Dice Dungeon — Game Design Document

## 1. Core Vision

**Dice Dungeon** is a mobile-first **Tactical Bag-Building Roguelike**. The player builds a custom deck of dice before each Act, then draws and rolls them one at a time in a push-your-luck combat system. Strategic deckbuilding — not raw power — determines survival, because each Act introduces modifiers that actively punish naive strategies.

### Core Loop

```
Loadout (Build Start Deck)
  ↓
Combat (Push-Your-Luck — draw, roll, bank)
  ↓
Victory: Draft a new die → grow the active deck
  ↓
The Forge (Merge / Craft / Purify between bosses)
  ↓
Next floor — repeat until Act end or death
  ↓
(Act complete) → Loadout screen to rebuild deck for new Act modifiers
```

---

## 2. The Loadout & Deckbuilding System

### Philosophy: Classless by Design

There are no starter classes. The player's build identity comes entirely from the dice they choose to put in their deck. Two players on Floor 1 can have completely different strategies based on their loadout choices.

### Scouting Phase (Loadout Screen)

Before starting an Act, the player builds their **Start Deck** on the Loadout screen.

- **Deck Capacity:** Exactly `maxEquippedDice` dice (default: 10) for the Start Deck.
- **Infinite Base Pool:** The player has an unlimited supply of the three base dice types to draft from freely:
  - **The Basic** (white) — pure damage faces
  - **The Guard** (blue) — shield + light damage
  - **The Mender** (green) — heal + light damage
- **Reserved Modified Dice:** Any die the player acquired and modified in a previous Act appears in a reserve zone. These can be swapped in (at the cost of a base die slot).
- **Cursed Dice:** Cannot be unequipped. They are permanent fixtures in the deck for the duration of a run.
- **START COMBAT** is disabled until at least one die is equipped.

### In-Run Deck Growth

Once combat begins, the deck is no longer capped:

- **Draft rewards** after each non-boss encounter add the new die directly to the active deck.
- **Boss rewards** (a forced Cursed die) are also immediately added.
- **Shop purchases** enter the deck the same way.

The deck grows freely until the Act ends, at which point the Loadout screen reappears and the player can rebuild their Start Deck for the new Act's modifiers.

---

## 3. Combat Mechanics

### Turn Sequence

1. **Shuffle:** At the start of a turn, all equipped dice are shuffled into a `drawPile`.
2. **Draw & Roll:** The player draws and rolls one die at a time. The result (Damage, Shield, Heal, Gold, or special) is added to the turn's accumulator pool.
3. **The Bust Mechanic:** Cursed dice have Skull faces. Rolling **3 Skulls** in a single turn causes a **BUST**:
   - Accumulated Damage and Heal reset to 0 (Shield remains).
   - The enemy immediately attacks.
4. **Bank & Attack:** The player can stop drawing at any time. All accumulated stats are applied, and the turn passes to the Enemy.
5. **Enemy Phase:** The enemy performs its displayed Intent (attack, debuff, etc.), resolved against the player's current Shield.

### Special Face Types

| Face | Effect |
|------|--------|
| Damage | Added to total attack power for the turn |
| Shield | Absorbs incoming enemy damage this turn |
| Heal | Restores player HP (up to max) |
| Gold | Added to the player's gold immediately |
| Skull | Increments the bust counter |
| Purified Skull | Inert — a Skull that has been neutralised via the Forge |
| Lifesteal | Deals damage AND heals for the same amount |
| Choose Next | Opens a picker so the player manually selects the next die drawn |
| Wildcard | Copies the effect of the next die rolled |
| Multiplier ★ | Sets an active multiplier; the NEXT die rolled applies its effect × that value |

### The Multiplier ★ — Special Rules

- The `activeMultiplier` is reset to 1 at the start of each `bankAndAttack` call. A multiplier die played as the last die in a turn is **discarded** — it does not carry over.
- During Auto-Roll, the auto-roller **stops automatically** when The Multiplier is drawn, forcing the player to make a manual decision.

---

## 4. Acts & Enemy Modifiers

The dungeon is divided into three Acts. Each Act introduces a **modifier** that forces the player to adapt their deckbuilding strategy rather than simply scaling raw numbers.

| Act | Name | Floors | Modifier | Strategic Impact |
|-----|------|--------|----------|-----------------|
| 1 | The Brute Tunnels | 1–15 | None | Learn the baseline — any strategy works |
| 2 | The Spiked Depths | 16–30 | **Thorns** — damage reflection | High single-hit damage punishes the attacker; sustain/shield/multi-hit becomes essential |
| 3 | The Iron Fortress | 31–45 | **Damage Cap** — per-hit ceiling | Makes high-value single faces useless; rewards multi-die combos, lifesteal, and Unique dice |

Between Acts the Loadout screen reopens, letting the player rebuild their deck to counter the new modifier.

---

## 5. The Forge

After each boss floor, players visit **The Forge** — a shop where Gold is spent to upgrade and customise dice.

### Merge

Combine two identical dice (same type, same merge level) into one more powerful die.

- Faces scale by ×3 per merge level (non-Skull/Blank/Purified faces only).
- Merge Level is displayed as **+1**, **+2**, **+3** next to the die name.
- Joker dice can merge with any die (the Joker is consumed; the host die levels up).
- Cursed dice and Unique (★) dice cannot be merged.
- Two dice must share the same merge level to combine.

### Craft

Pay to overwrite a specific face on any die with a new face of your choice.

- Marks the die as `isCustomized = true`.
- Customised dice retain their modified faces through merges.

### Purify

Pay to neutralise a Skull face on a die, converting it to a Purified Skull (inert) or a Blank.

- Capped at 3 Purify uses per shop visit.
- A Purified Skull is rendered as a struck-through skull icon.

### Heal

Spend gold to restore HP (up to max).

---

## 6. Dice Catalogue

### Base Dice (Infinite Supply)

| Die | Faces |
|-----|-------|
| The Basic (white) | 1/2/3/4/5/6 Damage |
| The Guard (blue) | 1/2/3/4 Shield, 1/2 Damage |
| The Mender (green) | 1/2/3 Heal, 1/2/3 Damage |

### Advanced Dice (Draft / Shop Pool)

| Die | Notable Faces |
|-----|---------------|
| The Heavy | High damage (4–9), 2× Skull |
| The Paladin | Shield + Heal only, no offence |
| The Gambler | Two 12-damage faces, two Blank, two Skull |
| The Scavenger | Gold + Shield, one Skull |
| The Wall | Pure Shield (2–6), no offence |

### Unique Dice (★) — Cannot Merge, One Per Build

| Die | Faces | Effect |
|-----|-------|--------|
| The Jackpot ★ | 30 Damage × 1, Skull × 3, Blank × 2 | Massive spike damage; extremely high risk |
| The Vampire ★ | Lifesteal 1–4 × 4, Skull × 1 | Sustain through offence |
| The Priest ★ | Heal 1–4 × 6 | Pure healing engine |
| The Fortune Teller ★ | Choose Next × 4, Skull × 2 | Full deck control |
| The Joker ★ | Wildcard × 6 | Copies any die's effect |
| The Multiplier ★ | ×2 × 6 | Doubles the next die's effect |

### Cursed Dice (Forced / Penalties)

| Die | Faces |
|-----|-------|
| The Cursed | Skull × 6 — pure bust risk, added by boss floors |

---

## 7. Run Progression

### Floors & Enemies

Enemies appear sequentially per floor, with Boss fights every 5 floors. Stats scale dynamically with floor number.

| Enemy | Base HP | Intent |
|-------|---------|--------|
| Slime | 28 | 2–4 damage |
| Goblin | 42 | 4–6 damage |
| Skeleton | 50 | 3–7 damage |
| Orc | 60 | 6–9 damage |
| Demon (Boss) | Scales | Heavy damage; adds Cursed die to player bag |

### Draft Rewards (Non-Boss)

After defeating a non-boss enemy:
- Three dice from the loot pool are offered as draft choices.
- The player picks one; it immediately joins the active deck.
- Unwanted choices can be **locked** to carry forward to the next draft.
- A **Re-roll** option spends Gold (cost increases with each reroll: +5 per roll).

### Boss Rewards

- A **Cursed die** is forced into the deck.
- The player enters the Forge shop.
- The next encounter begins on the floor after the boss.

---

## 8. Meta-Progression (Talent Tree)

Between runs, players spend **Souls** (earned during runs) on permanent passive upgrades in the Talent Tree.

| Node | Effect |
|------|--------|
| Pocket Change | Start each run with 10 Gold |
| Vitality I | +10 Max HP |
| Vitality II | +15 Max HP |
| First Blood | First attack each encounter deals +1 Damage |
| Sharpened Edges | White dice: 1-damage faces become 2-damage faces |
| Haggler | Rest costs 5 Gold instead of 10 |
| Bounty Hunter | Bosses drop 10 extra Gold |
| Thick Skin | Heal 15% Max HP after defeating a boss |
| Forge Master | Merge costs 25 Gold instead of 40 |
| Second Wind | Once per run, revive with 20 HP instead of dying |
| Scouting | Always see which dice remain in the bag |
| Auto Roll | Auto-draws dice until 2 Skulls are rolled |
| New Dice: The Priest | Adds The Priest to the loot pool |
| New Dice: The Jackpot | Adds The Jackpot to the loot pool |
| New Dice: The Vampire | Adds The Vampire to the loot pool |
| New Dice: The Fortune Teller | Adds The Fortune Teller to the loot pool |

---

## 9. Technical Architecture

### Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 19 + Vite (TypeScript, strict mode) |
| State | Zustand 5 with `persist` middleware |
| Animations | Framer Motion |
| Icons | lucide-react |
| Styling | Inline styles (mobile-portrait, pixel-art aesthetic) |
| Platform | Mobile-first web app (384px max-width) |

### Persistence

Only `metaSouls` and `unlockedNodes` are persisted between sessions. All run state (inventory, floor, gold, etc.) is ephemeral.

### Data Structures

```typescript
interface DieFace {
  type:
    | 'damage' | 'shield' | 'heal' | 'skull' | 'gold'
    | 'lifesteal' | 'choose_next' | 'wildcard'
    | 'blank' | 'purified_skull' | 'multiplier'
  value: number
}

interface Die {
  id: string
  dieType: DieType
  sides: number
  faces: DieFace[]
  currentFace?: DieFace
  isMerged?: boolean
  mergeLevel?: number      // 0 = base, 1/2/3 = merged
  isCustomized?: boolean   // true if any face was Crafted
  isEquipped?: boolean     // undefined | true = in active deck; false = in reserve
}

type ActModifier = 'none' | 'thorns' | 'damage_cap'

interface Act {
  id: number
  name: string
  description: string
  modifier: ActModifier
  startFloor: number
  endFloor: number
}

interface GameState {
  // Combat
  player: { hp: number; maxHp: number; shield: number }
  enemy: Enemy
  turnPhase: 'loadout' | 'idle' | 'drawing' | 'player_attack' | 'enemy_attack' | 'draft' | 'shop'

  // Deck
  inventory: Die[]        // All dice owned this run
  drawPile: Die[]         // Equipped dice remaining this turn
  playedDice: Die[]       // Dice drawn and resolved this turn
  maxEquippedDice: number // Start-deck capacity (Loadout screen cap only)

  // Turn accumulators
  skullCount: number
  totalDamage: number
  totalShield: number
  totalHeal: number
  totalGold: number
  activeMultiplier: number  // Resets to 1 on bankAndAttack and each die resolution

  // Progression
  currentFloor: number
  gold: number
  draftChoices: Die[]
  lastGoldEarned: number

  // Meta (persisted)
  metaSouls: number
  unlockedNodes: string[]
}
```

---

## 10. Visual Style

### Aesthetic

Retro pixel-art with modern UI animation. Hard edges, no border-radius, chunky `box-shadow` offsets, and a dark colour palette.

### Layout (Portrait, 384px max-width)

```
┌─────────────────────────┐
│  [Souls]     [Act Dots] │  ← Header
├─────────────────────────┤
│       ENEMY ZONE        │  ← HP bar, intent, sprite
├─────────────────────────┤
│    PLAYER STATS ZONE    │  ← HP, shield, totals
├─────────────────────────┤
│       DICE TRAY         │  ← playedDice (flex-wrap)
├─────────────────────────┤
│  [DRAW & ROLL (N left)] │  ← Primary action
│  [BANK & ATTACK]        │  ← Safe action
└─────────────────────────┘
```

### Pixel Art Guidelines

- `image-rendering: pixelated` globally
- All fonts: pixel/monospace family
- Colours: high-contrast dark backgrounds (`#0a0a14`, `#1a1a2e`), vivid accent colours per die type
- Shadows: hard 2–5px offsets (e.g., `box-shadow: 4px 4px 0 #000`)
- No soft transitions in geometry; spring/ease animations reserved for Framer Motion UI juice
