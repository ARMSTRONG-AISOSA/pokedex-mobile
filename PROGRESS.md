# Progress

> **Any AI assistant or developer picking this project up: read this file top to bottom first.** Then read `ARCHITECTURE.md` (how it is built) and `DESIGN.md` (how it looks and moves). Update this file before you stop working.

Last updated: **2026-11-04** · Session: **2**

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
| Test device | Android phone (no iPhone) |
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
| 5. Data layer (API client, schemas, repositories, hooks) | ⏳ Code + 137 tests pass. **Waiting on a device check** of the SQLite repositories |
| 6. Pokédex list screen | ⬜ |
| 7. Detail screen (hero, stats, matchups, evolution tree, shiny) | ⬜ |
| 8. Team builder, Saved, add-to-team sheet | ⬜ |
| 9. Motion and navigation polish (tab slide, parallax, launch animation, haptics) | ⬜ |
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
- [ ] Repositories `pokemonRepo.ts`, `evolutionRepo.ts` (SQLite) — **needs the device check below** (SQLite can't run in Jest)
- [ ] Query hooks (`usePokemon`, `usePokemonPages`, `useEvolutionChain`) + refresh events wired in `queryClient.ts` — device check
- [x] Storage tests for `kv.ts` (corrupt data → default; failed save → `STORAGE`)

**Device check for Phase 5** (temporary screen in `src/app/index.tsx`):
1. Online: Eevee's 8 evolutions appear with labels (Water Stone … Friendship, Fairy move). “Loaded 20 of 1025 Pokémon” shows Bulbasaur…Raticate, and “Saved on this phone” reaches 20.
2. “Load 20 more” adds #021–#040, and the saved count grows to 40.
3. Reload the app (`r` in the terminal). The saved count stays at 40 and the list comes back quickly (read from SQLite).
4. With the app open, turn on airplane mode and tap “Load 20 more”. The “No connection” message appears and nothing crashes. Turn airplane mode off and tap again: it loads.
*A cold start with no internet can't be tested in Expo Go, because Expo Go loads the code from the computer. Do that test with the APK in Phase 10/11.*

**Open for Phase 6 (ask the user):** sorting by Name/Power and filtering by type across *all* 1025 Pokémon needs data we haven't downloaded yet (paging only fetches what you scroll to). Options to discuss when Phase 6 starts.

**Phase 6, List**
- [ ] Cards, search (name or number), type chips, sort row, count, 2-column `FlatList`, infinite scroll, skeletons, empty and error states, offline works for visited pages

**Phase 7, Detail**
- [ ] Hero + back/shiny/heart; stats; matchups (18 types); evolution tree (branching, tap to navigate); skeletons per section; entrance motion

**Phase 8, Team / Saved / Picker**
- [ ] Six slots, picker sheet, remove, clear, weak-spot table, average stats; Saved grid; persistence across app restarts; disabled add when full

**Phase 9, Motion and haptics**
- [ ] Tab slide + indicator, detail parallax and a *visible* close animation, slot pop, shiny swap and sparkles, launch animation (once per cold start, skippable), haptics map, reduced-motion behavior

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
- **Next action:** device check for Phase 5 (§7), then Phase 6 (list screen). Raise the Phase 6 open question about sort/filter across all Pokémon.
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
