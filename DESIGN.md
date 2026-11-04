# Design

> Source of truth for look and behavior: `design-reference/pokedex-design.html` (open it in a browser, it is fully interactive). This file turns that draft into rules and numbers for the React Native build. If the two disagree, **ask the user**, then update both.

Approved by the user: overall look, launch animation ("the animation is good by me"), team builder, motion pass, extra features (type matchups, shiny, sort, haptics, skeletons). **Dropped:** the Compare screen.

---

## 1. Design idea

- **One brand moment per screen.** Everything else stays quiet. The memorable thing is color: **each Pokémon takes over its screen with its first type's color** (card tint, detail header, stat bars, evolution highlight). There is no single global accent.
- **The evolution tree is the hero feature.** Give it room, make it legible, make every node tappable.
- **Plain, friendly voice.** Sentence case, active verbs, no filler.
- Avoid: gradient washes, identical shadows on everything, all-caps labels, accenting a single word in a headline.

---

## 2. Color tokens

React Native has no CSS variables or `color-mix`. Put these in `src/theme/tokens.ts` as `light` and `dark` objects, chosen by `useColorScheme()` unless the user override in settings says otherwise. Tints are computed in code (see §2.3).

### 2.1 Neutrals

| Token | Light | Dark | Used for |
|---|---|---|---|
| `bg` | `#ffffff` | `#0e1618` | Screen background |
| `surface` | `#ffffff` | `#162226` | Tab bar, evolution nodes, tint base for cards |
| `field` | `#e9f0ee` | `#162226` | Search input, filter chips, sort control, round icon buttons |
| `ink` | `#13222b` | `#e8f1f0` | Primary text, active indicators |
| `muted` | `#55666e` | `#94a7ac` | Secondary text |
| `line` | `#d3dfdc` | `#263a3f` | Borders, stat bar tracks, skeleton base |
| `rule` | `#94a9a9` | `#4a666b` | Evolution connectors, table header rule |
| `bad` | `#b3261e` | `#ff9a90` | "Needs cover" / weak counts |
| `heart` | `#d63a5c` | `#d63a5c` | Favorite heart on cards |
| `allChipOn` | `#13222b` | `#3b5a64` | Selected "All" type chip (text is always `#ffffff`) |

Notes:
- In light mode the page is **white** and inputs/chips/icon buttons use the soft green-grey `field`. This was an explicit user request.
- Dark mode bug fixed in the draft: the selected "All" chip must never be light-on-light. Background `allChipOn`, text white.

### 2.2 Type colors

`c` = bright (dots, stat bars, tints). `d` = deep (headers, selected chips, evolution highlight border; white text on `d` must be ≥ 4.5:1).

| Type | `c` | `d` | White on `d` |
|---|---|---|---|
| grass | `#4caf6a` | `#2f7d4a` | 5.06 |
| poison | `#9b59b6` | `#6f3a86` | 8.00 |
| fire | `#ee6b3a` | `#b8431a` | 5.45 |
| flying | `#7b9de0` | `#4a6cb8` | 5.09 |
| water | `#3b8fe0` | `#1f68b8` | 5.63 |
| electric | `#f2c230` | `#8a6500` | 5.33 |
| normal | `#9a9a8a` | `#636355` | 6.09 |
| psychic | `#e85d8f` | `#b32f66` | 5.97 |
| dark | `#6a5a55` | `#3d3431` | 12.11 |
| **proposed for the 9 missing types** (contrast checked 2026-11-04. Fighting, ground and fairy were revised after the user's review so they don't look like fire, electric and psychic. Final OK pending, see PROGRESS OD-5) | | | |
| fighting | `#d64236` | `#c03028` | 5.68 |
| ground | `#d4a065` | `#9a6b3f` | 4.62 |
| rock | `#a8a07a` | `#6e6742` | 5.70 |
| bug | `#9bbf3a` | `#5f7d1c` | 4.73 |
| ghost | `#7a62a8` | `#523f80` | 8.82 |
| steel | `#8da5b5` | `#4f6878` | 5.86 |
| ice | `#6fc7d6` | `#2a7f90` | 4.63 |
| dragon | `#5b6ee0` | `#3a47b0` | 7.75 |
| fairy | `#e391d4` | `#a3449a` | 5.45 |

Dual-typed Pokémon use their **first** type for theming; the second type shows in pills and in the bottom half of the Poké Ball placeholder.

### 2.3 Tints (replace CSS `color-mix`)

Write `mix(colorA, colorB, percentA)` (sRGB linear blend) in `theme/color.ts`. Recipes from the draft:

| Element | Recipe |
|---|---|
| Card / team slot / picker row background | `mix(type.c, surface, 16%)` (picker row: 14%) |
| Card / slot border | `mix(type.c, line, 30%)` (picker row: 28%) |
| Type pill background | `mix(type.c, surface, 24%)` |
| Selected evolution node background | `mix(type.c, surface, 20%)`, 2 px border `type.d` |
| Skeleton highlight | `mix(line, bg, 45%)` |
| Tab-slot "×" button | `ink` at 10% opacity |

### 2.4 Fixed brand colors (launch screen)

Background `#13222b` · ball top `#e8453c` · ball bottom `#f4f7f6` · belt and button ring `#0b1417` · wordmark `#ffffff`. These do **not** change with light/dark mode.

---

## 3. Typography

Two families: **Bricolage Grotesque** (display) and **Figtree** (body). Load with `expo-font` via the `@expo-google-fonts/*` packages (verify exported names after install). Hold the splash screen until fonts and storage have loaded.

| Role | Family / weight | Size / line height | Letter spacing (RN px) |
|---|---|---|---|
| Screen title (h1) | Bricolage 800 | 36 / 36 | −1.08 (−0.03em) |
| Detail name (hero h2) | Bricolage 800 | 46 / 44 | −1.6 (−0.035em) |
| Section title (h3) | Bricolage 700 | 22 / 26 | −0.44 (−0.02em) |
| Card name | Bricolage 700 | 18 / 22 | −0.18 |
| Wordmark (launch) | Bricolage 800 | 48 | −1.44; animates from +3.84 |
| Body | Figtree 400 | 16 / 22 | 0 |
| Subtitle / notes | Figtree 400 | 14–14.5 / 20 | 0 |
| Labels, chip text | Figtree 500–600 | 13–14 | 0 |
| Pills | Figtree 600 | 12 (13 in matchups) | 0 |
| Dex numbers | Figtree 500, tabular numbers | 12.5 | 0 (`fontVariant: ['tabular-nums']`) |

Keep line lengths short. No all-caps labels.

---

## 4. Layout, spacing, shape

| Token | Value |
|---|---|
| Screen horizontal padding | 20 |
| Grid gap | 12, two columns |
| Section gap on detail | 30 |
| Touch target minimum | 44 × 44 |

| Component | Size | Radius |
|---|---|---|
| Pokémon card | min height 176, padding 14 | 22 |
| Filter chip | height 38, padding-x 14 | 19 (pill) |
| Search input | height 48, left padding 44 (icon) | 14 |
| Sort control (segmented) | outer 44 (3 px padding, 3 px gap), buttons 36 | outer 14, inner 11 |
| Round icon button | 44 | circle (the sort-direction button uses radius 14) |
| Type pill | height 24 (28 in matchup groups) | 12 / 14 |
| Detail sheet | overlaps hero by 40, padding 26/20/40 | 32 top corners |
| Add-to-team sheet | 80% of screen height | 28 top corners |
| Stat bar | height 9 | 5 |
| Evolution node | 70 × 92 | 18 |
| Evolution edge (arrow + label) | width 66 | n/a |
| Team slot | min height 168 | 22 |
| Tab bar | height 64 + bottom safe area | n/a |
| Detail hero | padding 18/20/96 | n/a |

Safe areas: use `react-native-safe-area-context`; the tab bar and the hero's top bar must clear notches and the gesture bar.

---

## 5. Screens

### 5.1 Pokédex (list)
Title "Pokédex" + subtitle "Find a Pokémon, then follow its evolutions." → search → type chips (horizontal scroll; "All" first) → sort row (segmented Number / Name / Power + direction button) → count text → 2-column grid of cards.
- Card: dex number (muted), artwork 78, name, type pills; filled heart in the corner if saved.
- Sort defaults: Number and Name start low→high; **Power starts high→low**. Tapping the direction button reverses.
- Search matches name or number (`#25`, `25`, `025`).
- Empty result: **"Nothing matches"** / "Try another name, or clear the type filter."

### 5.2 Detail
Hero (type `d` color): back button, shiny button, heart button, name, dex number, type pills, large artwork lower right, faint Poké Ball outline behind. Sheet below, in order: **Add to team** button → **Evolution chain** → **Base stats** → **Type matchups**.
- Evolution note text: branching families say "{Name} can become N different Pokémon. Tap one to open it."; others say "N stages. Tap any Pokémon to open it."
- Stats: six bars scaled to 150 max, plus Total.
- Matchups: groups **Weak to**, **Resists**, **Immune to** (only shown if any). Pills show multipliers `4×`, `2×`, `½×`, `¼×`. The draft shows "None in this draft" for empty groups; in the app use "None".
- Shiny toggle swaps artwork (and in the draft recolors the placeholder). Resets when you open another Pokémon.

### 5.3 Team
Title "My team", subtitle "N of 6 chosen. Pick up to 6 and see how well they cover each other." 2×3 slots (filled or dashed "Add Pokémon"). Below, when the team has members: **Type weak spots** table (Attack type | Weak | Resist | status), a sentence summary, **Average stats** bars, **Clear team** button.
- A type is flagged "Needs cover" when more team members are weak to it than resist it. Immune counts as resist. The status column uses text, not color alone.
- Summary: "Your team is weak to Fire, Water. Add a Pokémon that resists them." / "No type hits your team harder than your team resists. Nice balance." Append " Based on N of 6 Pokémon." if fewer than 6.

### 5.4 Saved
Same grid as the list, filtered to favorites. Empty: **"No saved Pokémon yet"** / "Open a Pokémon and tap the heart to keep it here."

### 5.5 Add to team (sheet)
Title, close button, search, list rows (artwork 44, name, number, pills, action). Rows already on the team are disabled and say "On team".

### 5.6 Launch screen
Dark `#13222b` full screen; Poké Ball drops in, wobbles, splits open with a flash, wordmark appears where the ball was, screen fades out. **Plays once per cold launch.** It never replays when switching tabs or when returning from the background. Tap to skip. Skipped with reduced motion.

---

## 6. Components to build (shared first)

`TypePill`, `TypeChip`, `SegmentedControl`, `IconButton`, `Skeleton` (and `PokemonCardSkeleton`), `PokeBall` (SVG placeholder and artwork fallback), `Sparkles`, `StatBar`, `EmptyState`, `ErrorState`, `HapticPressable`.

Feature components: `PokemonCard`, `TypeChipRow`, `SortBar`, `DetailHero`, `EvolutionTree` (+ `EvolutionNode`, `EvolutionEdge`), `MatchupGroup`, `TeamSlot`, `WeakSpotTable`, `PickerSheet`, `TabBar`, `LaunchAnimation`.

HTML → React Native cheat sheet:

| Draft (HTML/CSS) | React Native |
|---|---|
| `div`, `button` | `View`, `Pressable` |
| CSS classes / `color-mix` | `StyleSheet.create` + `theme/color.ts` `mix()` |
| 2-column grid | `FlatList numColumns={2}` |
| Horizontal chip row | horizontal `ScrollView` / `FlatList` |
| `position: sticky` / frame | not needed; use safe areas |
| Inline SVG | `react-native-svg` |
| Slide-in detail | Expo Router stack screen |
| Bottom sheet | route with sheet presentation, or `Modal` |
| `localStorage` | AsyncStorage (see ARCHITECTURE §7) |
| `navigator.vibrate` | `expo-haptics` |

---

## 7. Motion spec

Implement with **Reanimated**. Put the curves in `theme/motion.ts`:

```ts
export const ease = {
  out: Easing.bezier(0.22, 1, 0.36, 1),     // smooth settle; default for entrances and sheets
  overshoot: Easing.bezier(0.3, 1.4, 0.5, 1) // small springy overshoot; pops and bounces
};
```

Rule: motion happens **in response to a tap or to loading finishing**, with one exception, the launch animation. No idle looping animation except skeleton shimmer.

| Name | Trigger | What happens | Duration / delay / curve |
|---|---|---|---|
| Launch: drop | App cold start | Ball falls from −130 px, scale .7 → 1, fades in | 450 ms, `overshoot` |
| Launch: wobble | after drop | Rotate 0 → −14° → 12° → −6° → 3° → 0 | 600 ms, delay 450 ms, ease-in-out |
| Launch: open | after wobble | Lid moves up 34 and rotates −20°, base moves down 30 and rotates 6°, both fade; belt and button fade in 150 ms; glow circle scales .3 → 3.2 while fading out | 400 ms, delay 1050 ms |
| Launch: wordmark | during open | Fades in, scale .9 → 1, letter spacing +3.84 → −1.44 | 500 ms, delay 1200 ms, `out` |
| Launch: exit | end | Whole screen fades out | 400 ms, delay 2000 ms (total ≈ 2.4 s) |
| Tab switch | Tap a tab | New screen slides in 40 px from the direction of the tab (going to a later tab: from the right) while fading in | 400 ms, `out` |
| Tab indicator | Tap a tab | Bar under the active tab slides to the new tab; active icon lifts 2 px and scales 1.1 | 380 ms `out`; icon 300 ms `overshoot` |
| Open detail | Tap a card | Detail slides in from the right. The screen underneath moves left 22% and dims to 50% opacity | 340 ms, `out` |
| Close detail | Back | Reverse of the above (the draft had a bug where the slide-out was invisible; make sure the exit animation actually plays) | 340 ms, `out` |
| Detail entrance | Detail appears or you tap another Pokémon in the tree | Artwork rolls in (+70 px, −140° rotation, scale .6 → 1); name and number rise 14 px and fade in; sheet rises 44 px and fades in | art 650 ms delay 100 `overshoot`-ish; text 450 ms delay 120; sheet 500 ms delay 80, `out` |
| Stat bars | Stats appear | Each bar width 0 → value | 700 ms, `out` |
| Add sheet | Tap an empty slot | Sheet slides up, scrim fades in. Closing slides it down and fades the scrim | 400 ms / 350 ms, `out` |
| Slot pop | After choosing a Pokémon | New slot scales .82 → 1 and fades in once the sheet is closing | 500 ms, delay 300, `overshoot` |
| Shiny swap | Tap shiny | Artwork pops (scale .7 → 1, rotate −30° → 0). Three sparkles scale 0 → 1 with a −90° → 0 twist, staggered 0 / 120 / 240 ms | 500 ms; sparkles 700 ms |
| Card press | Press and hold a card | Scale to .97 | 150 ms |
| Sort direction | Tap the arrow | Arrow rotates 180° | 300 ms, `overshoot` |
| Sort segment | Tap a segment | Active background and text color change | 200 ms |
| Skeleton shimmer | Real request pending | Light band sweeps across, looping | 1300 ms linear, infinite |

**Reduced motion:** if the user has reduced motion enabled (`useReducedMotion()` from Reanimated or `AccessibilityInfo.isReduceMotionEnabled()`), skip the launch animation, replace slides and pops with an instant change or a 150 ms fade, and show skeletons without shimmer.

---

## 8. Loading states (skeletons)

Show a skeleton **only while a real request is pending**; never add an artificial delay (the draft briefly had one and the user asked for it to be removed).

| Where | Skeleton |
|---|---|
| List | 6 placeholder cards (number bar, 78 px circle, name bar, pill bar) while the first page loads; a small spinner row at the end while the next page loads |
| Detail header | None. Name, types and artwork come from the already-loaded list data |
| Detail stats, matchups | Six label+bar rows; two rows of label + three pills |
| Evolution chain | Three node-sized blocks joined by short bars (the chain needs two extra requests, so it can resolve after the stats) |

Already-cached data renders instantly with no skeleton.

---

## 9. Haptics

Use `expo-haptics`. Respect `settings.hapticsEnabled`. All calls go through `lib/haptics.ts`.

| Draft name | When | expo-haptics call (verify names in docs) |
|---|---|---|
| selection | Switch tab, change filter or sort | `selectionAsync()` |
| light | Open a Pokémon, open the add sheet, remove from Saved, un-shiny, back | `impactAsync(ImpactFeedbackStyle.Light)` |
| medium | Remove from team, clear team | `impactAsync(ImpactFeedbackStyle.Medium)` |
| success | Save a Pokémon, add to team, shiny on | `notificationAsync(NotificationFeedbackType.Success)` |

The floating "Haptic: …" label in the draft exists only so reviewers on a laptop can see where haptics would fire. **Do not port it.**

---

## 10. Voice and copy

- Sentence case. Plain verbs. No filler. Name things the way a player would.
- Buttons say exactly what happens: "Add to team", "Remove from team", "Clear team". The same action keeps the same name everywhere.
- Errors say what happened and what to do. They do not apologize and are never just "Something went wrong".
- Empty states invite the next action.

| Situation | Copy |
|---|---|
| Offline, nothing cached | "No connection. Check your internet and try again." + **Retry** |
| Rate limited | "Too many requests right now. Wait a moment, then try again." + **Retry** |
| Server error | "The Pokémon server isn’t responding. Try again in a minute." + **Retry** |
| Unexpected data | "This Pokémon’s data couldn’t be read. Try again, or open another one." |
| Save failed | "Couldn’t save your team. Try again." |
| Team full | "Team is full (6 of 6)" (disabled button) |
| Does not evolve | "{Name} does not evolve." |

Use the typographic apostrophe ’ and quotes “ ” in user-facing text.

---

## 11. Accessibility

- Contrast ≥ 4.5:1 for text (type `d` colors are pre-checked against white).
- Type is never shown by color alone: pills always include the name; weak-spot rows have a "Needs cover" text flag.
- Every icon-only button has an `accessibilityLabel` that describes the action and state ("Show shiny colors" / "Show normal colors", "Remove from saved", "Sorted low to high. Tap to reverse").
- Toggle buttons expose `accessibilityState={{ selected }}` or `checked`.
- Touch targets ≥ 44 × 44.
- Decorative artwork has `accessible={false}`; cards announce "{Name}, number {id}".
- Support dynamic type: layouts must not clip when text scales.
- The count text on the list is a live region (announces "N Pokémon" as filters change).

---

## 12. Things in the draft that must NOT be ported

- Phone frame and desktop centering.
- The haptic label overlay.
- The 9-type chart (use all 18).
- Placeholder Poké Ball as the main artwork (use official artwork; keep the ball as the fallback).
- The sample data of 18 Pokémon (use the API).
- The `localStorage` keys (`dex-favs`, `dex-team`).
- The removed replay button and any artificial loading delays.
- Dead skeleton code paths in the draft's `enhanceDetail` (an early `return` skips them). Skeleton *visuals* are specified in §8.
