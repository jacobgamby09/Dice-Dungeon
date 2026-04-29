# Dice Dungeon — Game Design Document

## 1. Core Vision

**Dice Dungeon** is a mobile-first **Extraction Runner Bag-Builder**. The player assembles a bag of dice at the Hub, then descends into a procedural dungeon to fight enemies and accumulate **Run Souls**. After each floor they face a critical decision: push deeper for greater rewards, or **Flee the Depths** to safely bank what they've earned. Each Act introduces new enemy mechanics that demand strategic adaptation — not just raw power.

### Core Loop

```
Hub / Base
  ↓
Build Loadout (equip dice from personal collection)
  ↓
Enter Dungeon
  ↓
  ┌─ Combat (Push-Your-Luck — draw, roll, bank)
  │    ↓ Victory
  ├─ Draft (choose a new die to add to the bag)
  │    ↓
  └─ The Forge (merge / craft / purify — spend Run Souls)
       ↓
  *** CRUCIAL DECISION ***
  ├─ [FLEE THE DEPTHS] → Safely bank Run Souls → Return to Hub
  └─ [PUSH DEEPER]     → Next floor (greater rewards, greater risk)
```

### Risk & Reward

| Outcome | Effect |
|---------|--------|
| **Flee the Depths** | All Run Souls gathered this delve are converted to **Banked Souls** |
| **Die in combat** | **100% of Run Souls** gathered this delve are lost |
| **Complete a boss floor** | Significant Run Soul bonus; forced Cursed die added to bag |

The extraction decision is the spine of the game. Knowing when to leave is as important as knowing how to fight.

---

## 2. Economy — Souls

There is a single unified currency: **Souls**.

| Type | Description | How Earned | How Spent |
|------|-------------|------------|-----------|
| **Run Souls** | Risk currency; held in-run, lost on death | Defeating enemies, gold die faces, boss bonuses | The Forge (merge, craft, purify, heal) |
| **Banked Souls** | Safe currency; stored at the Hub permanently | Surviving a delve (Flee the Depths) | Hub meta-progression Skill Tree |

Run Souls become Banked Souls only when the player successfully extracts. Dying forfeits all Run Souls accrued during that delve.

---

## 3. The Loadout & Bag-Building System

### Philosophy: Classless by Design

There are no starter classes. Build identity comes entirely from the dice in the bag. Two players on Floor 1 can have completely different strategies.

### Loadout Screen (Hub)

Before descending, the player selects their **Start Bag** on the Loadout screen.

- **Bag Capacity:** `maxEquippedDice` dice (default: 10) for the Start Bag.
- **Infinite Base Pool:** The player always has access to the three base dice types:
  - **The Basic** (white) — pure damage
  - **The Guard** (blue) — shield + light damage
  - **The Mender** (green) — heal + light damage
- **Personal Collection:** Dice acquired or upgraded in previous runs appear in a reserve zone and can be swapped into the bag.
- **Cursed Dice:** Cannot be unequipped. Permanent fixtures for the duration of a run.

### In-Run Bag Growth

Once combat begins, the bag is uncapped:

- **Draft rewards** after non-boss encounters add one new die directly to the active bag.
- **Boss rewards** force a Cursed die into the bag.
- **Forge purchases** enter the bag immediately.

---

## 4. Combat Mechanics

### Turn Sequence

1. **Shuffle:** All equipped dice are shuffled into a `drawPile`.
2. **Draw & Roll:** The player draws and rolls one die at a time. Results (Damage, Shield, Heal, Souls, Poison, or special) accumulate in the turn pool.
3. **The Bust Mechanic:** Rolling **3 Skulls** in a single turn causes a **BUST**:
   - Accumulated Damage and Heal reset to 0 (Shield and Poison stack persist).
   - The enemy immediately attacks.
4. **Bank & Attack:** The player stops drawing. All accumulated stats are applied and the turn passes to the enemy.
5. **Enemy Phase:** The enemy performs its displayed Intent. Damage is applied against the player's current Shield, then HP. Then all active Poison ticks (see §5.2).

### Face Types

| Face | Effect |
|------|--------|
| Damage | Added to attack power for the turn |
| Shield | Absorbs incoming enemy damage this turn |
| Heal | Restores player HP (up to max) |
| Souls | Adds Run Souls immediately |
| Skull | Increments the bust counter |
| Purified Skull | Inert — a neutralised Skull (from the Forge) |
| Lifesteal | Deals damage AND heals for the same amount |
| Poison | Adds to the `totalPoison` accumulator; applied to the enemy at bank |
| Choose Next | Opens a picker: player manually selects the next die drawn |
| Wildcard | Copies the effect of the next die rolled |
| Multiplier ★ | Sets an active multiplier; the NEXT die rolled applies its effect × that value |

### The Multiplier ★ — Special Rules

- `activeMultiplier` resets to 1 at the start of each `bankAndAttack`. A Multiplier die played as the last die in a turn is discarded — it does not carry over.
- During Auto-Roll, the auto-roller stops automatically when The Multiplier is drawn, forcing a manual decision.

---

## 5. Acts & Enemy Modifiers

The dungeon is divided into Acts. Each Act introduces mechanics that punish naive strategies and demand adaptation.

### Act 1 — The Brute Tunnels (Floors 1–15)

**Modifier:** None

The baseline Act. Any strategy is viable. Players learn push-your-luck tension and draft fundamentals without special pressure.

### Act 2 — The Spiked Depths (Floors 16–30)

**Modifier:** Sustain Check

Act 2 enemies enforce two simultaneous punishments that together demand a balanced, sustained approach:

#### Thorns — Punishes Rocket Tag

Enemies in the Spiked Depths have a Thorns aura. When the player banks a very high single-attack (above a per-floor threshold), the excess damage is reflected back as direct HP damage, bypassing the player's shield.

**Strategic implication:** Spiking 40+ damage in one turn becomes self-destructive. Multi-die sustained damage, lifesteal, and shield builds outperform single-hit spike strategies.

#### Venom — Punishes Push-Your-Luck Greed

Drawing too many dice in a single turn (above a per-floor threshold) causes the enemy to release Venom. Each die drawn over the safe limit stacks Poison on the player.

**Strategic implication:** Reckless bag-emptying is punished. Players must find the sweet spot: draw enough to deal meaningful damage without triggering Venom.

---

## 5.2 Poison — Status Effect

Poison is a delayed-damage status that bypasses shields entirely.

| Property | Rule |
|----------|------|
| **Source** | Player: Poison die faces. Enemy: Venom (Act 2), certain enemy abilities. |
| **Application** | At `bankAndAttack`, the player's accumulated `totalPoison` is added to the enemy's `poison` stack (and vice versa for the player). |
| **Tick** | During the Enemy Phase, after the enemy's physical attack resolves, all active Poison stacks tick — dealing that many HP of unblockable damage. |
| **Decay** | After ticking, the Poison stack decreases by 1 each turn. It does not reset to 0. |
| **Death check** | If a Poison tick reduces HP to 0, it counts as a kill (full victory resolution applies). |

### The Blight — Player Counterplay Die

| Property | Value |
|----------|-------|
| Die type | `blight` |
| Bag colour | Toxic green (`#4d7c0f`) |
| Faces | Poison 1 / Poison 2 / Poison 2 / Shield 2 / Skull / Skull |
| Role | Slow but unblockable damage engine; bypasses even heavily shielded enemies |
| Synergies | Pairs with sustain dice (Paladin, Priest, Vampire) to outlast enemies while Poison stacks accumulate |

---

## 6. The Forge

After each boss floor, players visit **The Forge** — a shop where **Run Souls** are spent to upgrade and customise dice.

### Merge

Combine two dice of the same type and merge level into one more powerful die.

- Non-Skull/Blank/Purified faces scale by ×3 per merge level.
- Merge Level is displayed as **+1**, **+2**, **+3**.
- **The Joker** can merge with any die (Joker is consumed; the host die levels up).
- Cursed dice and Unique (★) dice cannot be merged.

### Craft

Pay to overwrite a specific face on any die with a chosen face type.

- Marks the die as `isCustomized = true`.
- Customised faces survive through subsequent merges.

### Purify

Pay to neutralise a Skull face, converting it to a Purified Skull (inert) or Blank.

- Capped at 3 Purify uses per Forge visit.
- Purified Skull renders as a struck-through skull icon.

### Heal

Spend Run Souls to restore HP (up to max).

---

## 7. Dice Catalogue

### Base Dice (Infinite Supply)

| Die | Faces |
|-----|-------|
| The Basic (white) | 1 / 2 / 3 / 4 / 5 / 6 Damage |
| The Guard (blue) | 1 / 2 / 3 / 4 Shield, 1 / 2 Damage |
| The Mender (green) | 1 / 2 / 3 Heal, 1 / 2 / 3 Damage |

### Advanced Dice (Draft / Shop Pool)

| Die | Notable Faces | Role |
|-----|---------------|------|
| The Heavy | 4 / 6 / 7 / 9 Damage, 2× Skull | Spike damage; high bust risk |
| The Paladin | Shield + Heal only | Pure sustain; zero offence |
| The Gambler | 12 Damage × 2, Blank × 2, Skull × 2 | Boom-or-bust; Thorns-risky in Act 2 |
| The Scavenger | Souls × 2, Shield × 3, Skull | Economy + light defence |
| The Wall | Shield 2–6 × 6 | Turtle strategy; zero offence |
| **The Blight** | Poison 1, Poison 2 × 2, Shield 2, Skull × 2 | Act 2 counterplay; unblockable damage |

### Unique Dice (★) — Cannot Merge, One Per Build

| Die | Faces | Effect |
|-----|-------|--------|
| The Jackpot | 30 Damage × 1, Skull × 3, Blank × 2 | Massive spike; suicidal with Thorns |
| The Vampire | Lifesteal 1–4 × 4, Skull × 1 | Sustain through offence |
| The Priest | Heal 1–4 × 6 | Pure healing engine |
| The Fortune Teller | Choose Next × 4, Skull × 2 | Full bag control |
| The Joker | Wildcard × 6 | Copies any die's effect; universal merger |
| The Multiplier | ×2 × 6 | Doubles the next die's output |

### Cursed Dice (Forced / Penalty)

| Die | Faces | Notes |
|-----|-------|-------|
| The Cursed | Skull × 6 | Added by boss floors; cannot be removed or unequipped |

---

## 8. Run Progression

### Floors & Enemies

Enemies appear sequentially per floor. Boss fights occur every 5 floors. Stats scale with floor number.

| Enemy | Base HP | Intent |
|-------|---------|--------|
| Slime | 28 | 2–4 damage |
| Goblin | 42 | 4–6 damage |
| Skeleton | 50 | 3–7 damage |
| Orc | 60 | 6–9 damage |
| Demon (Boss) | Scales | Heavy damage; forces Cursed die into bag |

### Draft Rewards (Non-Boss)

- Three dice from the loot pool are offered.
- Player picks one; it joins the active bag immediately.
- Unwanted choices can be **locked** to carry forward to the next draft.
- **Re-roll** spends Run Souls (cost increases: +5 per reroll).

### Boss Rewards

- A Cursed die is forced into the bag.
- The player enters the Forge.
- The extraction decision follows.

---

## 9. Meta-Progression (Skill Tree)

Between delves, players spend **Banked Souls** on permanent passive upgrades.

| Node | Effect |
|------|--------|
| Pocket Change | Start each delve with bonus Run Souls |
| Vitality I | +10 Max HP |
| Vitality II | +15 Max HP |
| First Blood | First attack each encounter deals +1 Damage |
| Sharpened Edges | White dice: 1-damage faces become 2-damage |
| Haggler | Heal at Forge costs fewer Souls |
| Bounty Hunter | Bosses drop bonus Run Souls |
| Thick Skin | Heal 15% Max HP after defeating a boss |
| Forge Master | Merge costs fewer Souls |
| Second Wind | Once per delve, revive with 20 HP instead of dying |
| Scouting | Always see which dice remain in the bag |
| Auto Roll | Auto-draws dice until 2 Skulls are rolled |
| New Dice: The Priest | Adds The Priest to the loot pool |
| New Dice: The Jackpot | Adds The Jackpot to the loot pool |
| New Dice: The Vampire | Adds The Vampire to the loot pool |
| New Dice: The Fortune Teller | Adds The Fortune Teller to the loot pool |

---

## 10. Technical Architecture

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

Only `metaSouls` (Banked Souls) and `unlockedNodes` are persisted between sessions. All run state (bag, floor, run souls, enemy, etc.) is ephemeral — lost on death, converted on extraction.

### Key Data Structures

```typescript
interface DieFace {
  type:
    | 'damage' | 'shield' | 'heal' | 'skull' | 'gold'
    | 'lifesteal' | 'choose_next' | 'wildcard'
    | 'blank' | 'purified_skull' | 'multiplier' | 'poison'
  value: number
}

interface Die {
  id: string
  dieType: DieType
  name: string            // Display name — sourced from DIE_NAMES in gameStore
  sides: number
  faces: DieFace[]
  currentFace?: DieFace
  isMerged?: boolean
  mergeLevel?: number     // 0 = base, 1/2/3 = merged
  isCustomized?: boolean  // true if any face was Crafted
  isEquipped?: boolean    // undefined | true = in active bag; false = in reserve
}

interface Enemy {
  hp: number
  maxHp: number
  name: string
  intent: EnemyIntent
  isBoss: boolean
  poison: number          // Active poison stacks; ticks each enemy phase, decays by 1
}

type ActModifier = 'none' | 'thorns' | 'damage_cap'

interface GameState {
  // Combat
  player: { hp: number; maxHp: number; shield: number }
  enemy: Enemy
  turnPhase: 'loadout' | 'idle' | 'drawing' | 'player_attack' | 'enemy_attack' | 'draft' | 'shop'

  // Bag
  inventory: Die[]         // All dice owned this run
  drawPile: Die[]          // Equipped dice remaining this turn
  playedDice: Die[]        // Dice drawn and resolved this turn
  maxEquippedDice: number  // Start-bag capacity (Loadout screen cap only)

  // Turn accumulators
  skullCount: number
  totalDamage: number
  totalShield: number
  totalHeal: number
  totalGold: number        // Run Souls earned via die faces this turn
  totalPoison: number      // Poison stacked this turn; applied to enemy at bank
  activeMultiplier: number // Resets to 1 on bankAndAttack and each die resolution

  // Progression
  currentFloor: number
  gold: number             // Total Run Souls held this delve
  draftChoices: Die[]

  // Meta (persisted)
  metaSouls: number        // Banked Souls — safe, permanent
  unlockedNodes: string[]
}
```

---

## 11. Visual Style

### Aesthetic

Retro pixel-art with modern UI animation. Hard edges, no border-radius, chunky `box-shadow` offsets, dark colour palette.

### Die Type Colour Palette

| Die | Background | Accent |
|-----|-----------|--------|
| The Basic (white) | `#d1d5db` | `#6b7280` |
| The Guard (blue) | `#1e40af` | `#1e3a8a` |
| The Mender (green) | `#16a34a` | `#14532d` |
| The Cursed | `#6d28d9` | `#4c1d95` |
| The Heavy | `#b91c1c` | `#7f1d1d` |
| The Paladin | `#d97706` | `#92400e` |
| The Gambler | `#0891b2` | `#0e7490` |
| The Scavenger | `#b45309` | `#78350f` |
| The Wall | `#374151` | `#1f2937` |
| The Jackpot | `#ca8a04` | `#713f12` |
| The Vampire | `#9d174d` | `#831843` |
| The Priest | `#0284c7` | `#075985` |
| The Fortune Teller | `#7c3aed` | `#4c1d95` |
| The Joker | `#0f766e` | `#134e4a` |
| The Multiplier ★ | `#4d7c0f` | `#1a2e05` |
| **The Blight** | `#4d7c0f` | `#1a2e05` |

### Layout (Portrait, 384px max-width)

```
┌─────────────────────────┐
│  [Run Souls]   [Banked] │  ← Header HUD
├─────────────────────────┤
│       ENEMY ZONE        │  ← HP bar, intent, poison badge, sprite
├─────────────────────────┤
│    PLAYER STATS ZONE    │  ← HP, shield, damage total, stat badges
│  [♥ heal] [⬡ shield]   │
│  [$ souls] [☠ poison]  │
├─────────────────────────┤
│       DICE TRAY         │  ← playedDice (flex-wrap)
├─────────────────────────┤
│  [DRAW (N left)]        │  ← Primary action
│  [ATTACK!]              │  ← Commit action
└─────────────────────────┘
```

### Pixel Art Guidelines

- `image-rendering: pixelated` globally
- All fonts: pixel/monospace family
- Backgrounds: `#0a0a14`, `#1a1a2e`
- Shadows: hard 2–5px offsets (`box-shadow: 4px 4px 0 #000`)
- Animations: Framer Motion spring/ease for UI feedback only; no CSS transitions on layout
