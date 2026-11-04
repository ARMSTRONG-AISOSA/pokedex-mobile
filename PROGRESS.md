# Progress

> **Any AI assistant or developer picking this project up: read this file top to bottom first.** Then read `ARCHITECTURE.md` (how it is built) and `DESIGN.md` (how it looks and moves). Update this file before you stop working.

Last updated: **2026-11-05** · Session: **3**

---

## 0. Rules for whoever continues

1. **Confirm versions before installing anything.** Verify the latest stable version (`npm view <pkg> version`, release notes, peer deps), tell the user what you found, and get a yes before installing. Expo-managed packages go in with `npx expo install` so the SDK picks the compatible version. Record every install in §5. (Policy detail: `ARCHITECTURE.md` §2.)
2. **Do not change a decision silently.** Add or update a row in the `ARCHITECTURE.md` decision log and mention it in the session log below.
3. **Update this file at the end of every working session**: tick tasks, add a session-log entry, list new open questions. Keep it short and factual.
4. **The HTML draft is the visual reference** (`design-reference/pokedex-design.html`). Match it, using the tokens in `DESIGN.md`. If you want to deviate, ask first.
5. **Explain things simply.** The user asked for simple words and a short analogy when concepts are explained. Do not assume React Native knowledge; do assume solid JavaScript, TypeScript, React and Next.js knowledge.
6. **No AI attribution** in commits, the README, or code comments (user preference).
7. Do not mark something done unless it has been run on a real device or emulator, or (for pure logic) covered by a passing test.

---

## 1. Project snapshot

| | |
|---|---|
| Goal | A portfolio-quality Pokédex in React Native with a standout **evolution chain viewer**, a **team builder**, and **offline support** |
| Audience | Portfolio reviewers and interviewers; the user must be able to explain every part |
| Data | PokéAPI (free, no key, fair use = cache locally) |
| Working name | "Pokédex" (final app name and Android package id not chosen yet, see OD-6) |
| Project folder | `pokedex-mobile` (git branch `master`) |
| Developer | Experienced with JavaScript, TypeScript, React, Next.js. New to React Native |
| Dev machine | Linux Mint PC, VS Code |
| Test devices | Samsung Galaxy A07 (SM-A075F, Android 16, 720×1600) and Maxwest MX-A10R (Android 12, 800×1280). Connected to the laptop over **Wi-Fi adb** (see §9 Session 3) |
| Design reference | `design-reference/pokedex-design.html`; also published as a (possibly private) claude.ai artifact: https://claude.ai/artifact/DmV2kx56owwDXjZDaJgvnd |

---

## 2. Status at a glance

| Phase | Status |
|---|---|
| 0. Product idea, feature list, design draft (HTML) | ✅ Done |
| 1. Project documents (this folder) | ✅ Done |
| 2. Environment check, SDK decision, scaffold | ✅ Done (2026-11-04). Blank app, docs, ESLint, Phase 3 packages installed; lint + typecheck pass |
| 3. Foundations (theme, fonts, errors, storage, DB, query client) | ✅ Done 2026-11-04 (checked on the user's phone) |
| 4. Domain logic with tests (type chart ×18, evolution mapping, sorting) | ✅ Done 2026-11-04 (97 tests pass, 99% coverage of `src/domain`) |
| 5. Data layer (API client, schemas, repositories, hooks) | ✅ Done 2026-11-04 (137 tests; SQLite checked on the user's phone) |
| 6. Pokédex list screen | ✅ Done 2026-11-04 (checked on the user's phone) |
| 7. Detail screen (hero, stats, matchups, evolution tree, shiny) | ✅ Done 2026-11-04 (checked on the user's phone). Extra: **About** section (see below) |
| 8. Team builder, Saved, add-to-team sheet | ✅ Done 2026-11-05 (checked on both devices after the sheet fix) |
| 9. Motion and navigation polish (tab slide, parallax, launch animation, haptics) | ⏳ Built 2026-11-05, spot-checked over adb on both devices. **Waiting on the user's device check** |
| 10. Offline and error QA, accessibility, dark mode pass | ⬜ |
| 11. Release: README with screenshots/GIF, APK via EAS, GitHub | ⬜ |

---

## 3. Open decisions (ask the user before acting on these)

| ID | Question | What we know | Recommendation |
|---|---|---|---|
| ~~OD-1~~ | **RESOLVED 2026-11-04: use SDK 58, run it with the Play Store Expo Go.** The user confirmed Expo Go on their phone shows SDK 58. *(Original question: which Expo SDK, and how to run it on the Android phone?)* | SDK 58 is the latest stable (React Native 0.88). On 2026-10-15 Expo said the **Play Store Expo Go would still support only SDK 57** for "a few weeks". We could not confirm whether the Play Store Expo Go now supports SDK 58. Also: `npx create-expo-app` may default to SDK 57 or ask which to use. | Nothing more to do. If a later Expo Go update ever stops matching the project, ask the user before changing the SDK. |
| ~~OD-2~~ | **RESOLVED 2026-11-04: option 1** (20 per page, ≤ 5 requests at once, SQLite cache), see D-016. *(Original: how to fill the list without hammering PokéAPI?)* | | Done |
| OD-3 | Custom tab bar vs Expo Router `NativeTabs` | Design uses a custom sliding indicator | Custom first (matches the approved design) |
| OD-4 | Keep AsyncStorage next to SQLite, or use `expo-sqlite/kv-store` for everything small? | One fewer dependency with kv-store | Keep AsyncStorage for now (user agreed to both earlier); revisit |
| ~~OD-5~~ | **RESOLVED 2026-11-04: all 18 type colors approved** (after revising fighting, ground, fairy). In `src/theme/tokens.ts`. *(Original: approve the 9 proposed type colors)* | Contrast-checked. Swatch page: `design-reference/type-colors.html` (shown 2026-11-04). Round 1: the user asked for Fighting → brick red `#c03028`, Ground → `#9a6b3f`, and Fairy moved away from Psychic (Fairy changed, since Psychic was already approved). Revised in `DESIGN.md` §2.2 | Done |
| OD-6 | App name, Android package id (e.g. `com.<name>.pokedex`), icon | Not discussed | Ask once before the first EAS build |
| OD-7 | GitHub repo name and README approach | Not discussed | Ask at the release phase |

---

## 4. Environment facts (verified 2026-11-04 from the npm registry and Expo's published release notes)

| Item | Finding |
|---|---|
| Expo SDK 58 | `expo@58.0.0` published 2026-09-29, announced 2026-10-15, **latest patch 58.0.23 (2026-11-03)**. SDK 57's last patch seen: 57.0.31 (2026-10-21) |
| React Native | 0.88.1 (bundled). Strict TypeScript API is default |
| Node required | **22.13+, 24.3+, or 26+** (even versions only). *Correction:* earlier advice in this project said "Node 20 or newer". That is **wrong for SDK 58**. **User's Node: v24.19.0 ✅ (checked 2026-11-04)** |
| Default template | `expo-template-default@58.0.32`: uses `src/app` and `src/` layout, `@/*` path alias, TypeScript `~6.0.3`, `reactCompiler` and `typedRoutes` enabled, includes Reanimated 4.7.1 + worklets 0.13.0, gesture-handler ~3.3.0, expo-image, expo-font, expo-router ~58.0.30 |
| Scaffold command (from Expo's SDK 58 changelog) | `npx create-expo-app@latest pokedex --template default@sdk-58` |
| `reset-project` | `npm run reset-project` moves the template's `src` and `scripts` to `app-example/` (or deletes them) and creates a minimal `src/app/index.tsx` + `_layout.tsx` |
| Not to use despite being npm `latest` | `typescript@7.0.2`, `@react-native-async-storage/async-storage@3.1.1`, `react-native-gesture-handler@3.4.0`, `react@19.3.1` (the SDK pins older ones; see `ARCHITECTURE.md` §2) |
| PokéAPI artwork URLs | `…/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/{id}.png` and `…/official-artwork/shiny/{id}.png` return PNG (checked for id 25) |
| PokéAPI fair use | Cache resources locally; abusive clients can be banned |

---

## 5. Installed packages

Template packages come from the SDK 58 default template (see `package.json`). Added since:

| Package | Version installed | Date | Confirmed by user | Notes |
|---|---|---|---|---|
| `eslint` (dev) | 9.39.5 (`^9.0.0`) | 2026-11-04 | ✅ | Added by `npx expo lint`. Expo chose v9, not npm-latest 10.14.0 |
| `eslint-config-expo` (dev) | 58.0.4 | 2026-11-04 | ✅ | `eslint.config.js` (flat config) created |
| `expo-sqlite` | 58.0.15 | 2026-11-04 | ✅ | Config plugin added to `app.json` |
| `@react-native-async-storage/async-storage` | 2.2.0 | 2026-11-04 | ✅ | SDK 58 pin (npm latest 3.1.1) |
| `@tanstack/react-query` | 5.105.3 | 2026-11-04 | ✅ | `npm install` |
| `zod` | 4.6.7 | 2026-11-04 | ✅ | `npm install` |
| `react-native-svg` | 15.16.0 | 2026-11-04 | ✅ | |
| `@expo-google-fonts/bricolage-grotesque` | 0.4.1 | 2026-11-04 | ✅ | Weights 200–800. Imports like `BricolageGrotesque_800ExtraBold` |
| `@expo-google-fonts/figtree` | 0.4.1 | 2026-11-04 | ✅ | Weights 300–900 (+ italics). Imports like `Figtree_400Regular` |
| `expo-haptics` | 58.0.7 | 2026-11-04 | ✅ | |
| `expo-network` | 58.0.4 | 2026-11-04 | ✅ | |

| `jest-expo` (dev) | 58.0.14 | 2026-11-04 | ✅ | SDK pin. `"jest": { "preset": "jest-expo" }` in package.json, `npm test` |
| `jest` (dev) | 30.5.2 | 2026-11-04 | ✅ | |
| `@types/jest` (dev) | 30.0.0 | 2026-11-04 | ✅ | TypeScript 6 needs `"types": ["jest"]` in tsconfig (it no longer loads @types automatically) |
| `@testing-library/react-native` (dev) | 14.1.0 | 2026-11-04 | ✅ | For component tests later |
| `@react-native/jest-preset` (dev) | 0.88.1 | 2026-11-04 | ✅ | Peer of jest-expo; matches React Native 0.88.1 |
| `test-renderer` (dev) | 1.3.0 | 2026-11-04 | ✅ | Peer of Testing Library; same version jest-expo pins |

`npm audit` reports 12 moderate vulnerabilities. Do **not** run `npm audit fix --force`, because it can break SDK pins. Review this at the QA phase.

**Network quirk on the dev machine:** IPv6 to the npm registry hangs, so npm/npx time out (`ETIMEDOUT`). Fix: run them with
`NODE_OPTIONS="--dns-result-order=ipv4first --network-family-autoselection-attempt-timeout=2000"`. Even then, downloads are slow (an install can take ~10 min).

Planned (not installed): see `ARCHITECTURE.md` §4 for the full verified list.

---

## 6. What the first working session should do (Phase 2)

Do these in order. Stop and ask where marked.

1. ~~Check the machine.~~ ✅ Node **v24.19.0**, npm **11.17.0**, git **2.43.0**.
2. ~~Resolve OD-1~~ ✅ Done: the user's phone Expo Go shows SDK 58.
3. ~~Scaffold~~ ✅ Created as `pokedex-mobile` (create-expo 5.1.7, `expo ~58.0.23`). User confirmed the template ran on the phone.
4. ~~Docs into the project root~~ ✅ `ARCHITECTURE.md`, `DESIGN.md`, `PROGRESS.md` in the root, draft in `design-reference/`. Commit `chore: add project docs and design reference`.
5. ~~`npm run reset-project`~~ ✅ Run with the "delete" option (no `app-example/`). Commit `chore: reset template to blank app`.
6. Install VS Code extensions: ESLint, Prettier, Expo Tools, Error Lens (the template recommends Expo Tools in `.vscode/extensions.json`). *(User's machine; not checked.)*
7. ~~Install the Phase 3 packages~~ ✅ All four groups confirmed and installed 2026-11-04 (see §5). Original note (§2 policy): storage and DB (`expo-sqlite`, async-storage), data (`@tanstack/react-query`, `zod`), UI (`react-native-svg`, fonts, `expo-haptics`, `expo-network`). Record versions in §5.
8. Run `npx expo lint` and `npx tsc --noEmit`; both must pass. Update this file. Commit. ✅ Both pass (2026-11-04, after all installs).

**Definition of done for Phase 2:** project runs on the Android phone, blank screen with the correct fonts or system fonts, git initialised, docs in place, lint and type-check pass, §5 filled in.

---

## 7. Phase checklists (acceptance criteria)

**Phase 3, Foundations**
*Checked on the user's Android phone 2026-11-04.*
- [x] `theme/tokens.ts`, `typography.ts`, `motion.ts`, `color.ts` (`mix()`), `useTheme()` returning light/dark by system setting or override
- [x] Fonts load; splash held until fonts + storage are ready (+ DB opened)
- [x] `lib/errors.ts` (`AppError`, `errorCopy()`), `lib/logger.ts`, `lib/haptics.ts`
- [x] `data/storage/kv.ts` with zod-validated reads and safe fallbacks; favorites/team/settings modules; `user-data-provider.tsx` (context, optimistic save with rollback)
- [x] `data/db/database.ts` + migrations using `PRAGMA user_version`; app still works if DB open fails
- [x] `data/queries/queryClient.ts` with the retry rules from `ARCHITECTURE.md` §8.3, `onlineManager` wired to `expo-network`
- [x] Root `ErrorBoundary` (uses `components/ui/error-state.tsx`)

**Device check for Phase 3** (temporary test screen in `src/app/index.tsx`): title in Bricolage, subtitle in Figtree; 18 pills + 18 headers in the right colors; the theme button cycles system → light → dark with a haptic tick; the chosen theme **survives a full app restart**; no red error screens.

**Phase 4, Domain (pure TypeScript, tests first)**
- [x] `typeChart.ts`: all 18 types, dual-type product, `matchupsFor`, `teamWeakSpots`, `formatMultiplier`. Tests include a cell-by-cell check against a saved copy of PokéAPI's `damage_relations`, plus Charizard, Umbreon, Eevee, Gyarados, Bulbasaur
- [x] `evolution.ts`: chain → tree; label builder (uses the `is_default` entry, D-017); `evolutionNote`; tests on real saved chains for Pichu, Charmander, Eevee (8 branches), Tauros (no evolution)
- [x] `sorting.ts` (sort + name/number search) and `names.ts` (display names like “Mr. Mime”, `#025`)

**Phase 5, Data**
- [x] `fetchJson` with timeout and error mapping, ≤ 5 in flight; zod schemas (tested with saved PokéAPI responses)
- [x] Read-through cache policy `data/cache.ts` with the 30-day refresh (D-019); tests for the four cache/network combinations + old data + storage failures
- [x] Repositories `pokemonRepo.ts`, `evolutionRepo.ts` (SQLite), checked on the phone 2026-11-04
- [x] Query hooks (`usePokemon`, `usePokemonPages`, `useEvolutionChain`) + refresh events wired in `queryClient.ts`
- [x] Storage tests for `kv.ts` (corrupt data → default; failed save → `STORAGE`)

**Device check for Phase 5** (temporary screen in `src/app/index.tsx`):
1. Online: Eevee's 8 evolutions appear with labels (Water Stone … Friendship, Fairy move). “Loaded 20 of 1025 Pokémon” shows Bulbasaur…Raticate, and “Saved on this phone” reaches 20.
2. “Load 20 more” adds #021–#040, and the saved count grows to 40.
3. Reload the app (`r` in the terminal). The saved count stays at 40 and the list comes back quickly (read from SQLite).
4. With the app open, turn on airplane mode and tap “Load 20 more”. The “No connection” message appears and nothing crashes. Turn airplane mode off and tap again: it loads.
*A cold start with no internet can't be tested in Expo Go, because Expo Go loads the code from the computer. Do that test with the APK in Phase 10/11.*

**Open for Phase 6 (ask the user):** sorting by Name/Power and filtering by type across *all* 1025 Pokémon needs data we haven't downloaded yet (paging only fetches what you scroll to). Options to discuss when Phase 6 starts.

**Phase 6, List**
*Checked on the user's phone 2026-11-04.*
- [x] Cards (artwork via expo-image disk cache, Poké Ball while loading/failed, heart if saved, press scale), search (name or number), type chips, sort row (persisted in settings; arrow flips), count (live region), 2-column `FlatList` over all 1025 (virtualized), skeletons, empty and error states, light/dark toggle in the header
- [x] Data: one GraphQL summary (D-021), falls back to 20-per-page paging with a note if it fails
- [x] Tabs with a custom bar (D-022); Team/Saved are placeholders until Phase 8; tapping a card opens a temporary detail screen (Phase 7)

**Device check for Phase 6:**
1. First launch after this update: 6 shimmering skeleton cards, then “1025 Pokémon” and the grid. (The summary is one request; on slow internet allow up to ~45 s.)
2. Scroll fast to the bottom (#1025 Pecharunt). Artwork loads as you go; any that fail show the tinted Poké Ball.
3. Search “pika”, “25”, “#025”, “mr mime”. Tap a type chip (e.g. Fire), then combine it with a search. A search with no results shows “Nothing matches”.
4. Sort by Name (A first), Power (Eternatus/Arceus first, high→low), tap the arrow to reverse. Close and reopen the app: the sort choice is remembered.
5. Moon/sun button switches light/dark. Tabs switch with a small vibration. Tapping a card opens the temporary detail screen; Back returns.
6. Reload the app (`r`): the list appears quickly with no skeletons (read from SQLite).

**Phase 7, Detail**
*Checked on the user's phone 2026-11-04.*
- [x] Hero (type color, faint ball ring, back/shiny/heart, name, number, pills) + large artwork drawn as an overlay so it overlaps the sheet like the draft
- [x] “Add to team” / “Remove from team” / disabled “Team is full (6 of 6)” (works now; uses the saved team) + heart saves favorites; a failed save shows “Couldn’t save…”
- [x] Evolution tree: recursive, branching bracket, labeled arrows, current node highlighted, tap a node to open it in place (`router.setParams`), sideways scroll for wide trees, skeleton while loading, inline error + Retry
- [x] Stats (bars scaled to 150, grow 0→value in 700 ms) + Total; Type matchups (Weak to / Resists / Immune to, all 18 types)
- [x] Entrance motion (art rolls in, name rises, sheet rises), shiny swap pop + 3 staggered sparkles; reduced motion skips them
- [x] Route-level `ErrorBoundary` for the detail screen

**Device check for Phase 7:**
1. Open Bulbasaur: green header, artwork rolls in from the right, name rises, sheet slides up. The artwork overlaps the sheet's top edge slightly.
2. Evolution chain: Bulbasaur → (Level 16) Ivysaur → (Level 32) Venusaur, Bulbasaur highlighted. Tap Venusaur: the screen switches to Venusaur in place. Back returns to the list (not to Bulbasaur).
3. Open Eevee: 8 branches stacked with a bracket line; labels such as “Friendship, night” and “Leaf Stone”. Open Tauros: “Tauros does not evolve.”
4. Shiny button: artwork pops with 3 sparkles; tap again for normal colors. Open another Pokémon: shiny is off again.
5. Heart: fills, vibrates; back on the list the card shows a heart. Add to team: the button flips to “Remove from team”. Add 6 different Pokémon, then a 7th shows “Team is full (6 of 6)” (disabled).
6. Charizard's matchups: Weak to Rock 4×, Water 2×, Electric 2×; Immune to Ground.
7. Open a Pokémon you haven't opened before with slow internet: the evolution section shows skeleton blocks until it loads.

**Phase 7b, About section (user request 2026-11-04)**
*Checked on the user's phone 2026-11-04.*
- [x] Category + Baby badge, Pokédex entry (cleaned), Height / Weight / Generation boxes, ability chips (hidden marked), “Evolves from {Name}” link / “First stage of its family.”; skeleton while loading; inline error + Retry
- [x] Data: GraphQL per species (D-024), SQLite `pokemon_about` (migration 3), 30-day refresh. Domain helpers + mapping tested (158 tests)

**Device check for the About section:**
1. Bulbasaur: “Seed Pokémon”, an entry about the seed on its back, 0.7 m, 6.9 kg, Generation I, Overgrow + Chlorophyll (hidden), “First stage of its family.”
2. Tap Ivysaur in the tree: the About text, height and weight change; it says “Evolves from Bulbasaur”. Tap that link: back to Bulbasaur in place.
3. Pichu shows a **Baby** badge and Generation II. Eevee lists three abilities.
4. A Pokémon you've never opened shows grey skeleton lines first, then the text fades in.

**Phase 8, Team / Saved / Picker**
*Built 2026-11-04 (session 2). Device check passed 2026-11-05 on both devices.*
- [x] Team tab: six slots (filled: tinted card + “×”; empty: dashed “Add Pokémon”), tip when empty, “Type weak spots” table over 18 types with “Needs cover” in words, summary sentence, “Average stats” bars, “Clear team”; save failures show “Couldn’t save your team. Try again.”
- [x] Add-to-team sheet (D-025): slides up (400 ms) over a dimmed background, search over all Pokémon, rows say “Add” or “On team” (disabled); Android back / tap outside / × close it (350 ms)
- [x] Saved tab = the list screen in “saved” mode: title “Saved”, count “N Pokémon saved”, empty “No saved Pokémon yet”
- [x] Domain: `teamSummary`, `averageStats` (tests)
- [x] Persistence across app restarts (team + favorites)

**Device check for Phase 8:**
1. Team tab with an empty team: six dashed slots and the tip. Tap a slot: the sheet slides up; search “char”, tap Charizard: the sheet slides down and Charizard fills slot 1.
2. The table now shows Rock with Weak 1 and “Needs cover”; the sentence lists the weak types and ends “Based on 1 of 6 Pokémon.” Average stats match Charizard's stats.
3. Open the sheet again: Charizard's row is greyed out and says “On team”. Android back closes the sheet.
4. Fill all six: no empty slots left and the sentence has no “Based on” part. Tap “×” on one: it disappears. “Clear team” empties everything.
5. Tap a team card: its detail screen opens.
6. Saved tab: hearts you saved earlier appear here; search and type chips work within them. Unsave everything: “No saved Pokémon yet”.
7. Close Expo Go fully and reopen: team and saved Pokémon are still there.

**Phase 9, Motion and haptics**
*Built 2026-11-05 (session 3). Tick after the device check.*
- [ ] Tab switch: the new tab slides in 40 px from its side while fading in (400 ms); the bar above the tabs slides to the new tab (380 ms) and the active icon lifts 2 px and grows to 1.1 (`features/navigation/tab-transitions.ts`, `tab-bar.tsx`)
- [ ] Only the focused tab takes taps (`focus-gate.tsx`); found over adb: during the slide the tab you just left caught taps
- [ ] Open detail: slides in from the right, the tabs underneath shift left and dim to 50%; Back plays it in reverse, visibly (D-027, `detail-dim.tsx`)
- [ ] Slot pop: a Pokémon chosen in the sheet pops into its slot (.82 → 1, 500 ms, after 300 ms)
- [ ] Launch animation (`features/launch/launch-animation.tsx`): ball drops, wobbles, splits with a flash, “Pokédex” wordmark, fade out (~2.4 s). Once per cold start, tap to skip, skipped with reduced motion. Splash colour in `app.json` is now `#13222b` (only visible in a real build; Expo Go shows its own loading screen)
- [x] Already built in earlier phases: detail entrance, stat bars, shiny swap + sparkles, card press, sort arrow, sheet slide, skeleton shimmer
- [x] Haptics map (DESIGN.md §9) audited: every call matches the table
- [ ] Reduced motion: tabs cross-fade (150 ms), no launch animation, slot and sparkles fade instead of popping (sparkles fixed this phase)

**Device check for Phase 9:**
1. Close Expo Go fully and reopen: the dark launch screen plays (ball drop → wobble → flash → “Pokédex”) and fades into the list. Reopen from the background: it does **not** replay. Cold start again and tap during it: it skips.
2. Tap Team, then Saved, then Pokédex: each new tab slides in from its side; the bar above the tab glides across; the icon lifts. Tap a card straight after switching: the right Pokémon opens.
3. Open a Pokémon: it slides in from the right while the list moves left and dims. Back: the detail slides away and the list comes back undimmed. Same from a Team card.
4. Add a Pokémon from the Team sheet: the sheet slides down and the new slot pops in.
5. Turn on Android's “Remove animations” (Settings → Accessibility → Visibility enhancements, wording varies): no launch animation, tabs just fade, the slot fades in. Turn it off again.
6. Haptics: tab switch, filters and sort tick lightly; save/add to team/shiny on give a “success” buzz; remove from team a firmer tap.

**Phase 10, QA**
- [ ] Airplane-mode test: visited Pokémon and their evolution chains open offline
- [ ] Force failures: 404, 429, bad JSON, corrupt AsyncStorage value, DB open failure, each shows the right state
- [ ] Dark mode and light mode on every screen
- [ ] TalkBack pass on the main flow; font scaling at 130%
- [ ] No console errors or warnings

**Phase 11, Release**
- [ ] README with a GIF/screenshots, feature list, architecture summary, "what I learned"
- [ ] Android build via EAS; APK linked in the README
- [ ] Clean commit history

---

## 8. State of the design draft (what was approved)

The HTML draft implements (and the user approved): list with search, type chips, sort (Number/Name/Power + direction), 2-column cards with favorites; detail with hero, shiny toggle, stats, type matchups, evolution tree (Bulbasaur, Charmander, Squirtle, Pichu and Eevee families); Team tab with six slots, add-to-team sheet, weak-spot table, average stats; Saved tab; dark mode; launch animation; tab, detail and sheet transitions; haptics cue; skeleton visuals.

Late changes made on request:
- Light mode background is **white**; inputs, chips and round buttons use `#e9f0ee`.
- Selected **All** chip in dark mode fixed (white text on a dark slate background).
- Launch animation plays **once per launch** only; replay button removed.
- Artificial loading delays **removed**.
- Compare screen **cancelled**.

Draft-only data limits (do not copy): 18 Pokémon, 9 types, placeholder Poké Ball artwork.

---

## 9. Session log

### Session 3, 2026-11-05 (adb device access, add-to-team bug, Phase 9 motion)
- The user reported: (1) tab switches aren't smooth (planned for Phase 9), (2) tapping “Add Pokémon” on the Team tab did nothing after an app refresh, on both devices.
- An attempt to reproduce (2) with Testing Library screen tests went badly (Reanimated 4 / Worklets Jest mocks wouldn't load; a hand-made mock hung). The user stopped it and asked for a cheaper way to see the app.
- **Set up Wi-Fi adb** (`sudo apt install adb`, 34.0.4; phone: Developer options → Wireless debugging → pair with code → `adb connect IP:PORT`). Ports change after a phone restart; re-run `adb connect` with the new port. Now possible: `adb exec-out screencap -p` (screenshots), `adb shell input tap/text/keyevent` (drive the app), `adb logcat -s ReactNativeJS:V` (JS logs), `am start -d exp://LAPTOP-IP:8081` / `am force-stop host.exp.exponent` (open / fresh-restart Expo Go). Decision D-026.
- **Bug (2) found and fixed with logs on the phone:** the picker kept its own “mounted” state alongside the parent's `visible`; after a fresh start it flipped back to unmounted ~0.2 s after opening (likely the render-time state pattern under React Compiler). Rewritten so the parent alone controls `visible`; the sheet animates in on open, and on close slides out first, then calls `onClose`. Verified on the Samsung: open after a fresh restart, Android back closes it, reopen, add, and the team survives a restart.
- Removed the unfinished screen-test setup (`jest.setup.js`, test file, `package.json` Jest change). 163 unit tests still pass.
- The user confirmed Phase 8 on both devices. **Phase 8 done.**
- **Phase 9 built:** tab slide + fade and the sliding indicator/icon lift (via the js-tabs `sceneStyleInterpolator`/`transitionSpec`), detail push as native `ios_from_right` plus a dim layer over the tabs (D-027), slot pop, launch animation, splash colour `#13222b`, reduced-motion fixes (sparkles). Haptics already matched DESIGN.md §9.
- **Bug found over adb while testing:** after switching tabs, the tab you just left stayed on top (invisible) for over a second and caught taps (tapping an empty spot on the Pokédex opened a Team member). Fixed with `FocusGate` (only the focused tab takes touches); re-tested on the Samsung.
- Tip: a change to a `_layout.tsx` file may not hot-reload; force-stop and reopen Expo Go before judging it. To see fast animations over adb, temporarily multiply the durations in `theme/motion.ts` (adb screenshots come ~0.4 s apart), then put them back.
- Spot-checked on both devices with adb: launch animation, tab slide, indicator, detail open/close (tabs undimmed after back), slot pop. 163 tests, tsc and lint pass.
- **Next action:** the user runs the Phase 9 device check (§7) on both devices. Then Phase 10 (offline/error QA, accessibility, dark mode pass).

### Session 2, 2026-11-04 (docs in place, blank app committed)
- Moved the docs to the project root and the HTML draft to `design-reference/`. Project folder is `pokedex-mobile` (user confirmed).
- Commits: `chore: add project docs and design reference`, `chore: reset template to blank app`. Added `.claude/settings.local.json` to `.gitignore` (personal settings).
- The user confirmed the template ran on the Android phone before the reset.
- `npx tsc --noEmit` passes. Lint not run yet (ESLint not installed).
- Re-verified the planned package versions on 2026-11-04. All match `ARCHITECTURE.md` §4, and SDK 58 still pins async-storage 2.2.0 (npm latest is 3.1.1). Also found: `eslint-config-expo` 58.0.4, `eslint` 10.14.0.
- Problem: `npm view` can't reach the registry from the assistant's sandboxed shell (curl works). Installs may need to run outside the sandbox or in the user's own terminal.
- Fixed the npm problem: it is IPv6, not the sandbox (see the §5 network note). Installed ESLint plus all Phase 3 groups (user approved all four). Recorded in §5. One commit per group.
- `npx expo lint` and `npx tsc --noEmit` both pass. **Phase 2 done.** The user confirmed the app still loads in Expo Go after the installs.
- The user's internet is slow on 2026-11-04 and should improve around 03:00–07:00 on 2026-11-05. Until then, keep big downloads to a minimum.
- Added `design-reference/type-colors.html` (OD-5 swatch page: 9 approved + 9 proposed type colors, light and dark). I noted that Fighting≈Fire and Ground≈Electric (deep colors) look alike. The user asked for changes. Revised Fighting (`#d64236`/`#c03028`), Ground (`#d4a065`/`#9a6b3f`) and Fairy (`#e391d4`/`#a3449a`) in `DESIGN.md` and the swatch page.
- Tip: the draft can be screenshotted offline with Playwright's headless Chromium (`~/.cache/ms-playwright/chromium_headless_shell-*/…/chrome-headless-shell --screenshot=out.png --window-size=412,915 file://…`).
- OD-5 resolved: the user approved all 18 type colors.
- **Phase 3 code written:** `src/theme/*`, `src/lib/*`, `src/data/storage/*`, `src/data/db/*`, `src/data/queries/queryClient.ts`, `src/components/ui/error-state.tsx`, new root `_layout.tsx` (providers, font + data + DB splash gate, `ErrorBoundary`, status bar, root background) and a temporary test screen. APIs checked against the installed SDK 58 type definitions, not memory.
- Choices made while building (small, no decision-log row needed): fonts are imported per weight (`@expo-google-fonts/figtree/400Regular`), so only 5 font files are bundled; `lib/haptics` keeps an on/off flag that the settings provider syncs, so `lib` doesn't import from `data`; the user-data context lives in `data/storage/user-data-provider.tsx`.
- Checks: `npx tsc --noEmit` ✅, `npx expo lint` ✅, `npx expo export --platform android` ✅ (bundle builds).
- Test tooling checked (not installed): `jest-expo` ~58.0.14 (SDK pin; peers jest ^29||^30, `@react-native/jest-preset` ^0.88.1), `jest` 30.5.2, `@testing-library/react-native` 14.1.0 (new peer: `test-renderer` ^1.0.0), `@types/jest` 30.0.0.
- The user confirmed the Phase 3 device check passed. **Phase 3 done.**
- Installed the test tooling (§5). `npx expo install … -- --save-dev` put jest/jest-expo/@types/jest in `dependencies`; moved them to `devDependencies` by hand.
- **Phase 4 done:** `src/domain/` (`types.ts`, `typeChart.ts`, `evolution.ts`, `sorting.ts`, `names.ts`) with 97 passing tests and 99% coverage. Test data was saved from the real PokéAPI into `src/domain/__tests__/fixtures/`.
- Decisions: D-017 (evolution label uses the `is_default` entry; `[0]` gave Leafeon “level up in Eterna Forest”), D-018 (`TypeName` moved to `domain/`).
- **Phase 5 code done** (session 2, later): `data/api/` (client, schemas, pokeapi), `data/cache.ts` (30-day refresh, D-019), `data/events.ts`, `data/db/pokemonRepo.ts` + `evolutionRepo.ts`, migration 2 (`meta` table), query hooks, `lib/limit.ts`. OQ-3 resolved as option 1 (D-016); Pokédex = species 1…N (D-020). 137 tests pass; tsc, lint and Android bundle pass. The temporary screen now shows Eevee's tree and the first pages.
- The user raised a concern about stale data → D-019.
- **Phase 6 built** (session 2, later). The user chose **one GraphQL summary request** for all Pokémon (D-021) so sort/filter/search cover everything. New: `components/ui/*` (icon, icon-button, type-pill, type-chip, segmented-control, poke-ball, skeleton, empty-state), `features/pokedex/*`, `features/navigation/tab-bar.tsx`, routes `(tabs)/index|team|saved`, temporary `pokemon/[id]`. Tabs come from `expo-router/js-tabs` (D-022); shared values use `.set()` (D-023).
- Resilience fixes found while trying a web preview: the database open now gives up after 8 s (a *hung* open would have kept the splash up forever), and the network listener is skipped during web server rendering. The web preview itself never rendered in headless Chrome (web isn't a target; it was only for screenshots), so it was abandoned and all temporary changes reverted.
- 143 tests pass; tsc, lint, Android bundle pass.
- The user confirmed the Phase 6 device check passed. **Phase 6 done.** The user noticed there's no startup animation yet; it's planned for Phase 9 (launch animation). Expo Go never shows the app's own splash; that needs a real build.
- **Phase 7 built** (session 2, later): `features/detail/*` (detail-screen, detail-hero + HeroArtwork overlay, evolution-tree, stat-bars, matchup-groups, team-button, sparkles), real `pokemon/[id]` route with its own ErrorBoundary. `TypePill` got `onColor`/`large`/`suffix`; `IconButton` got `tone="onColor"`; new sparkle icon. Team/favorite toggles work from the detail screen already (Phase 8 builds the Team and Saved tabs).
- No component tests yet (provider/mocking setup is still to do); covered by the device check.
- The user confirmed the Phase 7 device check passed. **Phase 7 done.**
- **New feature (user request):** an **About** section on the detail screen. The user added it to the HTML draft (committed as `design: add About section…`). Built: `domain/about.ts` (+ `parentOf` in evolution.ts), GraphQL `fetchAbout`/`toAbout`, `data/db/aboutRepo.ts`, migration 3 (`pokemon_about`), `useAbout`, `features/detail/about-section.tsx`. DESIGN.md §5.2 and ARCHITECTURE.md §7 updated; D-024.
- The user confirmed the About section works. **Phase 7b done.**
- **Phase 8 built:** `domain/team.ts` (+ tests), `useTeamMembers`, `features/team/*` (team-screen, team-slot, weak-spot-table, picker-sheet), Saved mode in `PokedexScreen`, `StatBars` moved to `components/ui` (with `showTotal`). Placeholder screen removed. D-025 (picker as Modal).
- **Next action:** Phase 8 device check (§7), then Phase 9 (motion polish + the launch animation the user asked about).
- *(Earlier:)* device check for the About section (§7 “Phase 7b”), then Phase 8 (Team, Saved, add-to-team sheet).
- *(Earlier:)* Phase 7 device check (§7), then Phase 8 (Team, Saved, add-to-team sheet).
- *(Earlier:)* Phase 7 (detail screen), unless the user wants the launch animation pulled forward.
- *(Earlier:)* Phase 6 device check (§7), then Phase 7 (detail screen).
- *(Earlier next action, done:)* device check for Phase 5 (§7), then Phase 6 (list screen). Raise the Phase 6 open question about sort/filter across all Pokémon.
- *(Earlier next action, done:)* Phase 5 (data layer): `fetchJson` + zod schemas + repositories + query hooks. Decide OQ-3 (how to fill the list) at the start.
- *(Old next action, done:)* the user runs the Phase 3 device check (§7). Then, with the user's OK, install the test tooling and start Phase 4 (domain logic, tests first). Also worth noting: the splash background in `app.json` is still the template blue `#208AEF`; change it to `#13222b` in Phase 9 with the launch animation. Start with `theme/tokens.ts` from `DESIGN.md`, and show the user the type-color swatch page for OD-5 before building on those colors.

### Session 1, 2026-11-04 (planning and design)
- Chose the stack direction: Expo + Expo Router + TypeScript, TanStack Query, SQLite for cached API data, AsyncStorage for favorites/team/settings.
- Chose the project: Pokédex with an **evolution chain viewer** as the signature feature, plus Team builder.
- Built and iterated the HTML design draft (see §8).
- Wrote `ARCHITECTURE.md`, `DESIGN.md`, `PROGRESS.md`.
- Verified current versions against the npm registry and Expo's release notes (§4). Found that **Expo Go on the Play Store may not yet support SDK 58** and that the **Node requirement is 22.13+** (earlier note of "Node 20+" was wrong). Nothing was installed or scaffolded.
- **Decision:** the user chose **Expo SDK 58**. Checks passed: Node v24.19.0, and Expo Go on their Android phone shows SDK 58 (OD-1 resolved).
- **Next action:** Phase 2 step 3: scaffold with `npx create-expo-app@latest pokedex --template default@sdk-58`, run it on the phone before changing anything.

<!-- Add new sessions above this line, newest first. Template:

### Session N, YYYY-MM-DD (short title)
- What changed (files, features)
- Decisions made (and the ARCHITECTURE decision-log IDs)
- Packages installed (and the §5 rows)
- Problems hit and fixes
- Next action
-->
