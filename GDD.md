# Dice Dungeon - Game Design Document & Technical Specification

## 1. Core Vision
**Dice Dungeon** is a mobile-first dice auto-battler with roguelite elements. The game combines the tactical depth of dice-builders (like Dicey Dungeons) with the visual satisfaction and "juice" of games like Balatro.

### Core Loop
1. **Combat:** Roll dice to defeat monsters in an automated turn-based sequence.
2. **Loot:** Gain new dice, upgrades, and resources from defeated enemies.
3. **Base Hub:** Return to your mobile base to upgrade your loadout.
4. **Progression:** Push deeper into the dungeon (Floor-based progression).

---

## 2. Combat Mechanics
Combat is automated but driven by the strategic choices made in the player's loadout.

### Dice-as-Units
- Players start with a "Hand" of 5 standard white D6 dice.
- Each die face contains a specific action (Damage, Shield, Heal).
- **Dice Types:**
  - **Standard (White):** Balanced damage.
  - **Defense (Blue):** Higher probability of Shields.
  - **Chaos (Purple):** High variance, potential for massive critical hits.
  - **Utility (Green):** Provides rerolls or buffs to other dice.

### Turn Sequence (The "Slot Machine" Flow)
1. **Roll Phase:** All dice are rolled onto the screen with physical-feeling movement.
2. **Resolution Phase:**
   - Dice land one by one or in sequence.
   - System checks for **Combos** (Pairs, Three-of-a-kind, Straights).
   - Multipliers and passive buffs are applied.
3. **Damage Phase (The Juice):** Particles fly from the dice to the enemy. The "Total Damage" counter MUST use a rapid "Slot Machine Count-up" effect powered by Framer Motion's spring physics. It should snap/bounce slightly when landing on the final number to maximize tactile feedback.
4. **Enemy Phase:** Monsters perform their "Intent" (Attack, Debuff, Shield).
5. **Cleanup:** Check for victory or defeat.

---

## 3. Dungeon & Base Progression
### Floor System
- The dungeon is divided into "Floors".
- Checkpoints are reached every 10 or 20 floors.
- Dying before a checkpoint results in a "Game Over," resetting current run progress (Roguelite).

### The Mobile HQ (Meta-progression)
Upon reaching a checkpoint, the player's base moves down to that floor.
- **The Laboratory:** Permanent upgrades to dice stats and face values.
- **The Forge:** Merge lower-tier dice into higher-tier types (D6 -> D8 -> D12).
- **The Market:** Purchase rare dice and passive relics.

---

## 4. Technical Architecture
The game is built as a modern web-native application optimized for mobile portrait mode.

### Tech Stack
- **Framework:** React + Vite (TypeScript)
- **State Management:** Zustand (Event-driven architecture)
- **Styling:** Tailwind CSS (Optimized for mobile aspect ratios)
- **Animations:** Framer Motion (For UI juice, spring transitions, and number counters)
- **Rendering:** HTML5/CSS for UI, Canvas API / PixiJS (For high-performance particle systems later)

## 5. Visual Style & UI/UX (Mobile First)
The game utilizes a **Retro Pixel Art Aesthetic** combined with modern, fluid animations.

### UI Layout
The layout is designed for portrait mode with thumb-friendly navigation.
- **Zone A (Top):** Enemy stats, health bars, and intent indicators.
- **Zone B (Middle):** Player avatar and the "Total Damage" dopamine counter.
- **Zone C (Dice Tray):** The central area where dice are rolled and displayed.
- **Zone D (Actions):** Large primary "Roll/Submit" button and secondary menu shortcuts.

### Pixel Art Guidelines
- **Typography:** Use a web-based pixel font (e.g., 'Pixelify Sans', 'VT323', or 'Press Start 2P').
- **Crisp Rendering:** Ensure all global CSS includes `image-rendering: pixelated;` to prevent blurring on high-res mobile screens.
- **Geometry:** Avoid soft, rounded corners (`rounded-lg`, etc.). Use sharp edges and hard CSS box-shadows to create a chunky, 8-bit 3D effect for buttons and dice.
- **Asset Pipeline:** Future graphical assets (monsters, custom dice) will be sourced as external sprite sheets (e.g., from Itch.io) and handled via CSS steps or standard canvas drawing.

### Data Structure (Zustand Store)
```typescript
interface Die {
  id: string;
  sides: number;
  faces: Array<{ type: 'damage' | 'shield' | 'heal', value: number }>;
  currentValue?: number;
  rarity: 'common' | 'uncommon' | 'rare' | 'legendary';
}

interface GameState {
  player: { hp: number; maxHp: number; shield: number };
  enemy: { hp: number; maxHp: number; name: string; intent: any };
  dicePool: Die[];
  currentFloor: number;
  currency: number;
}