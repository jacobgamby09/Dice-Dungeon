# Dice Dungeon - Game Design Document & Technical Specification

## 1. Core Vision
**Dice Dungeon** is a mobile-first bag-building dice battler with roguelite elements. The game combines the tactical "push-your-luck" tension of board games like *Quacks of Quedlinburg* with the visual satisfaction, dopamine-inducing counters, and meta-progression of modern mobile roguelites.

### Core Loop
1. **Bag Building:** Build a bag of dice with various stats and effects.
2. **Push Your Luck (Combat):** Draw and roll dice one by one. Accumulate power, but risk "Busting" if you draw too many cursed dice.
3. **Run Progression:** Defeat monsters, earn gold, and buy new dice in the shop between floors.
4. **Meta-Progression (Base Hub):** Die, return to base with materials, and permanently upgrade your starter bag, unlock new dice pools, or buy passive base buffs.

---

## 2. Combat Mechanics
Combat is driven by risk assessment and bag manipulation. The player does not roll a set hand, but draws from their bag sequentially.

### Turn Sequence (Bag-Building & Push-Your-Luck)
1. **The Bag:** The player has an inventory of dice (the "Bag"). At the start of a turn, the bag is shuffled into a `drawPile`.
2. **Draw & Roll:** The player actively chooses to draw and roll *one die at a time*. The rolled result (Damage, Shield, Heal, or Loot) is added to a temporary accumulated pool.
3. **The Bust Mechanic (Skulls):** "Cursed" dice in the bag have 'Skull' faces. If a Skull is rolled, it increments a danger counter. If the player rolls **3 Skulls** in a single turn, they **BUST**. 
   - A bust immediately ends the player's drawing phase.
   - Accumulated Damage and Heal for that turn are reduced to 0 (Shield remains).
   - The enemy immediately attacks.
4. **Bank & Attack:** After any safe roll, the player can choose to "Bank" (stop drawing). All accumulated stats in the pool are locked in and applied, and the turn passes to the Enemy.
5. **Enemy Phase:** The monster performs its "Intent" (Attack, Debuff, Shield) calculated against the player's current Shield.

### Enemy Intent & Behavior
- **Intent Display:** The UI must clearly display the enemy's intended action for the current turn (e.g., an icon and a damage number) *before* the player rolls, allowing for tactical risk assessment.
- **Attack Animation:** When the enemy attacks, its UI element performs a physical "lunge" animation (using Framer Motion), accompanied by a projectile/orb flying down to the player's HP bar.

---

## 3. Dungeon & Base Progression

### Run Progression (The Roguelike Layer)
- **Floors:** The dungeon is divided into sequential floors.
- **The Shop:** Between encounters, players can spend Gold earned from monsters to buy new dice for their bag, remove cursed dice, or heal.
- **Game Over:** If the player's HP reaches 0, the run ends. The current bag is lost, but the player keeps "Meta-Materials" collected during the run.

### Meta-Progression (The Roguelite Layer)
Upon death, players return to the Base Hub to spend Materials:
- **Starter Bag Upgrades:** Permanently remove a Skull face from a starter die, or upgrade a basic Damage die to a Shield die so every future run starts stronger.
- **Loot Pool Expansion:** Unlock entirely new, crazy dice types (e.g., Poison Die, Vampire Die) so they can appear in the Shop during future runs.
- **Base Buildings:** Purchase passive buffs (e.g., "The Forge" grants +10 starting Max HP, "The Bank" grants +15 starting Gold).

### Bestiary & Encounters
Enemies appear sequentially based on the Floor number, culminating in Boss fights every 5 floors. Enemy stats scale up dynamically.
- **Slime (Floor 1):** Low HP, weak but consistent damage.
- **Goblin (Floor 2):** Medium HP, balanced damage.
- **Skeleton (Floor 3):** Medium HP, erratic/unpredictable damage.
- **Orc (Floor 4):** High HP, heavy predictable damage.
- **Demon Boss (Floor 5, 10, etc.):** Massive HP, massive damage, and potentially adds "Curse Dice" directly into the player's bag.

---

## 4. Technical Architecture
The game is built as a modern web-native application optimized for mobile portrait mode.

### Tech Stack
- **Framework:** React + Vite (TypeScript)
- **State Management:** Zustand (Event-driven architecture)
- **Styling:** Tailwind CSS (Optimized for mobile aspect ratios)
- **Animations:** Framer Motion (For UI juice, spring transitions, and number counters)
- **Icons:** `lucide-react` for scalable, clean iconography.

---

## 5. Visual Style & UI/UX (Mobile First)
The game utilizes a **Retro Pixel Art Aesthetic** combined with modern, fluid animations. 

### UI Layout (Push-Your-Luck Optimized)
The layout is designed for portrait mode with thumb-friendly navigation.
- **Zone A (Top - Enemy):** Enemy 8-bit sprite, HP bar, and Intent indicator. (Takes up ~1/3 of screen).
- **Zone B (Middle - Player & Dopamine):** Player HP, Total Damage counter, Secondary counters (Shield/Heal/Loot). Includes a highly visible **Skull Tracker (e.g., 2/3)** that glows red when in danger.
- **Zone C (Dice Tray):** A `flex-wrap` container showing the `playedDice` drawn this turn. Dice wrap to new lines as the player pushes their luck.
- **Zone D (Actions):** Two primary buttons side-by-side:
  - **[ DRAW & ROLL (X left) ]** (The risky action)
  - **[ BANK & ATTACK ]** (The safe action)

### Pixel Art Guidelines
- **Typography:** Use a web-based pixel font.
- **Crisp Rendering:** Ensure all global CSS includes `image-rendering: pixelated;`.
- **Geometry:** Avoid soft corners. Use sharp edges, hard CSS box-shadows, and chunky borders to create an 8-bit 3D effect.

### Data Structure (Zustand Store)
```typescript
interface DieFace {
  type: 'damage' | 'shield' | 'heal' | 'loot' | 'skull';
  value: number; // For skulls, value is usually 1
}

interface Die {
  id: string;
  sides: number;
  faces: DieFace[];
  currentValue?: number;
  currentFaceType?: DieFace['type'];
  rarity: 'common' | 'uncommon' | 'rare' | 'legendary';
  type: 'white' | 'blue' | 'green' | 'cursed';
}

interface GameState {
  player: { hp: number; maxHp: number; shield: number };
  enemy: { hp: number; maxHp: number; name: string; intent: any };
  
  // Bag-building state
  inventory: Die[];      // All dice the player owns this run
  drawPile: Die[];       // Dice remaining in the bag this turn
  playedDice: Die[];     // Dice drawn and rolled this turn
  skullCount: number;    // Number of skulls rolled this turn
  
  // Progression
  currentFloor: number;
  runMaterials: number;  // Meta-currency kept after death
  gold: number;          // Run-currency used in the Shop
  
  // Turn accumulators
  totalDamage: number;
  totalShield: number;
  totalHeal: number;
}