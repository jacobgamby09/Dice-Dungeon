# Dice Dungeon — Current Design State

*Last updated: 2026-05-01. Read this before making design or balance changes.*

---

## Current Focus

- Act 2 balance pass (enemy stat scaling, Thorns threshold tuning)
- The Mirror tuning (power level, first-draw dead-weight problem)
- The Rejuvenator tuning (all-HoT face composition, no downside)
- Meta-progression gating (too many powerful dice in base loot pool)
- UI clarity for the two new unique dice

---

## Core Design Pillars

- Push-your-luck must matter every turn — drawing one extra die should always feel like a real risk.
- The extraction decision is the spine of the game; knowing when to flee is as important as knowing how to fight.
- Dice identity should matter more than raw stat scaling — each die should feel mechanically distinct.
- Act modifiers must force strategic adaptation, not just increase difficulty numbers.
- Souls-only economy: Run Souls are at-risk in-run, Banked Souls are permanent at the Hub.
- Mobile-first portrait UI (384 px max-width), pixel-art aesthetic, no border-radius.
- Double-KO / simultaneous death: player death always takes priority over victory.

---

## Implemented State

### Acts & Flow
- Act 1 (Floors 1–15): no modifier, full draft loop, boss on Floor 15.
- Act 1 Boss → The Culling: auto-banks Run Souls, player picks 7 dice from inventory (`InterActScreen.tsx`), 3 Cursed dice forced in.
- Act 2 (Floors 16–30): modifier type in code is `'thorns' | 'damage_cap'`; enemies have `thorns`, `barbs`, and `corrosive` fields on the `Enemy` interface.
- **Venom (Act 2):** Safe draw limit is 5 (floors 16–20) or 4 (floors 21–30). Each die over the limit adds player poison (+1 on floors 16–25; +2 on floors 26–30). Poison ticks after enemy physical attack, decrements by 1 per turn. Draw button turns red with warning label. Counter shown above action buttons on all Act 2 floors.
- Flee the Depths: banks Run Souls → returns to Hub.
- Death: all Run Souls lost.

### Economy
- `runSouls` — at-risk in-run currency (spent at Forge, lost on death).
- `bankedSouls` — permanent meta-currency (spent on Skill Tree at Hub).
- Persisted state: `bankedSouls` + `unlockedNodes` only.

### Forge Actions
- Merge (two same-type + same-mergeLevel dice → one higher-level die).
- Craft (overwrite a specific face; marks `isCustomized`).
- Purify (skull → purified_skull; max 3 uses per Forge visit).
- Heal (spend Run Souls for HP).

### Dice Pool (as of this session)

| Die | Type | Notes |
|-----|------|-------|
| The Basic | white | Base |
| The Guard | blue | Base |
| The Mender | green | Base |
| The Cursed | cursed | Forced on boss floors / culling |
| The Heavy | heavy | Draft pool |
| The Paladin | paladin | Draft pool |
| The Gambler | gambler | Draft pool |
| The Scavenger | scavenger | Draft pool |
| The Wall | wall | Draft pool |
| The Blight | blight | Draft pool |
| The Jackpot | jackpot | Draft pool (should be skill-tree gated) |
| The Vampire | vampire | Draft pool (should be skill-tree gated) |
| The Priest | priest | Draft pool (should be skill-tree gated) |
| The Fortune Teller | fortune_teller | Draft pool (should be skill-tree gated) |
| The Joker | joker | Draft pool |
| The Multiplier ★ | unique | Unique (one per run); draft pool |
| The Rejuvenator | rejuvenator | Draft pool; all HoT faces |
| The Mirror ★ | mirror | Unique (one per run); draft pool |

`UNIQUE_DIE_TYPES` = `{ unique, mirror }` — enforced in all 4 draft generation sites.

### New Mechanics (recent)
- **HoT (Healing over Time):** `player.hot: { amount, turnsRemaining }[]`. Applied via `hot` face type. Ticks at the start of `runEnemyPhase` before enemy acts, then decrements and expires. Not scaled by `activeMultiplier`.
- **Mirror:** Copies the preceding played die's `currentFace` and re-executes it with the current `activeMultiplier`. Does nothing as the first die drawn.
- **Multiplier stacking:** Now multiplicative (`st.activeMultiplier * face.value`), not overwrite. Enables Multiplier → Mirror = ×9.
- **HoT craftable:** `hot` is in `CRAFTABLE_FACES`; `mirror` is not.

### Skill Tree (meta)
Nodes implemented (Banked Souls): Pocket Change, Vitality I/II, First Blood, Sharpened Edges, Haggler, Bounty Hunter, Thick Skin, Forge Master, Second Wind, Scouting, Auto Roll, New Dice unlocks (Priest, Jackpot, Vampire, Fortune Teller).

---

## Known Mismatches (GDD vs. Code)

- **Act 2 modifier:** GDD §5 describes `Venom` (drawing too many dice poisons the player). Code uses `thorns`, `barbs`, and `corrosive` — no Venom mechanic exists yet. Decision needed: implement Venom or formally replace it with the current Barbs/Corrosive system.
- **GDD DieFace type still lists `'gold'`** in the technical section. Code uses `'souls'`. GDD §10 data structures need updating.
- **GDD GameState uses `gold` and `totalGold`** field names. Code uses `runSouls` and `totalSouls`.
- **GDD colour palette (§11)** for several dice no longer matches actual `dieTypeStyle` values in `DieCard.tsx`.
- **Skill tree unlock dice** (Priest, Jackpot, Vampire, Fortune Teller) are currently in the base `getDiceLootPool()` — they appear in drafts even without skill tree nodes. GDD intends these to be gated.
- **GDD face table (§4)** doesn't list `hot` or `mirror` — GDD needs updating to include new face types.

---

## Current Balance Risks

- **Rejuvenator may be too safe:** All 6 faces are HoT — no skulls, no blanks, no downside. Every draw is a free buff.
- **HoT bypasses bust tension:** HoT is applied immediately on face resolution and persists between turns. A busted turn still grants all HoT buffs accumulated that turn.
- **Mirror is dead weight as the first draw:** With no preceding die, it does nothing. High variance — either useless or extremely strong.
- **Mirror + Multiplier ×9 combo** may be too swingy for Act 1 balance. Both dice are in the base draft pool.
- **Too many powerful dice in the base loot pool:** Jackpot, Vampire, Priest, Fortune Teller should be skill-tree gated (per GDD §9). Currently available from Floor 1.
- **Act 2 feels like a sudden wall:** The Cursed dice injection combined with enemy trait pressure may be too abrupt with no onboarding text. Raw HP/damage was reduced in the last pass (see Recent Decisions); difficulty should now come primarily from Thorns/Barbs/Corrosive mechanics.
- **Gambler in Act 2:** 12-damage spike hits Thorns hard. Either the Gambler needs a warning or Thorns thresholds need tuning.
- **Venom is implemented** (see Acts & Flow above). Balance risks: limit of 5 may be too generous on floors 16–20; penalty of +1 may be too mild to deter greedy draws — watch playtesting data.

---

## Recent Design Decisions

- Dice Dungeon is an **Extraction Runner Bag-Builder**, not a standard roguelike — the flee decision defines the game.
- Fleeing banks Run Souls into Banked Souls permanently.
- Death loses 100% of Run Souls accumulated that delve.
- Beating Act 1 Boss forces automatic banking, then The Culling (keep 7 of ~15 dice).
- Three Cursed dice are forced into the bag at Act 2 start — no opt-out.
- No Gold / Materials / Coins — everything is Souls. All player-facing copy must reflect this.
- Act 2 enemy base stats were reduced (HP, attack, Thorns/Barbs values) and scaling is now floor-relative (`baseHp + (floor - 16) * 4`; attack scaling `(floor - 16) * 0.45`) so Floor 16 starts at bare base stats. Act 1 scaling is unchanged.
- Venom is implemented. Act 2 difficulty modifier is now Thorns + Barbs + Corrosive + Venom (player poison on overdraw).
- The Mirror is a Unique die (one per run), same as The Multiplier.
- HoT does not scale with `activeMultiplier` — it's a status application, not a stat.
- Multiplier face now stacks multiplicatively on repeat rolls.

---

## Next Recommended Design Work

1. **Gate advanced dice behind skill tree** — remove Jackpot, Vampire, Priest, Fortune Teller from base `getDiceLootPool()`; add back only when nodes are unlocked.
2. **Tune Rejuvenator faces** — add at least one skull or blank face to introduce push-your-luck risk.
3. **Tune Mirror** — consider giving 1–2 faces a fallback effect (e.g. small shield) for when it's drawn first.
4. **Tune Venom limits** — limit of 5 on floors 16–20 may be too generous; +1 penalty may be too mild. Revisit after playtesting.
5. **Clean up Gold terminology** in GDD §10 data structures and any remaining player-facing copy.
6. **Update GDD §4 face table and §11 colour palette** to match current code.
7. **Add Act 2 onboarding** — short tooltip or interstitial explaining Thorns, Venom, and the new enemy traits before Floor 16.
8. **Review Run Souls reward curve** — check that Forge costs are achievable given expected income per floor.
9. **Review Forge costs vs. income** — Purify and Merge costs may need floor-scaling.
10. **Add a balance test checklist** for the Act 1 → Act 2 transition (target stats, expected bag size, soul balance).
11. **Rework skill tree into clearer branches** — current nodes are a flat list; GDD implies a tree shape.
12. **Remove any lingering `gold`/`totalGold` references** in comments or dead code.

---

## Claude / Codex Working Rules

- Run `npx tsc --noEmit` after every code change. Zero errors required before presenting a solution.
- Adding a new die or face type: update `DIE_TEMPLATES`, `DIE_NAMES`, `dieTypeStyle`, `faceColor`, `faceShadow`, and all `FaceIcon` helpers across `DieCard.tsx`, `DiceLibrary.tsx`, `DiceInspectorModal.tsx`, `DraftScreen.tsx`, `LoadoutScreen.tsx`, `ShopScreen.tsx`.
- Adding a unique die: add to `UNIQUE_DIE_TYPES` — all 4 draft sites filter via this set automatically.
- Player death always takes priority over enemy death in simultaneous-kill scenarios (Thorns, Poison).
- Never rename `runSouls` / `bankedSouls` back to `gold` or any gold-adjacent term.
- For design review tasks, do not edit code unless explicitly asked.
- Keep changes scoped — do not refactor surrounding code while fixing a specific bug.
- `hot` face is in `CRAFTABLE_FACES`; `mirror` is not — do not add `mirror` to Forge craft options.
