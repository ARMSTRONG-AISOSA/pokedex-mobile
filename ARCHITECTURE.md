# Architecture

> Read `PROGRESS.md` first for current status. This file records **how the app is built and why**. When a decision changes, update the Decision Log at the bottom instead of silently changing code.

Status legend used below: ✅ decided · 🟡 proposed (confirm with the user before building) · ❓ open question

---

## 1. What we are building

A portfolio-grade **Pokédex** mobile app (React Native + Expo, TypeScript) built on the free [PokéAPI](https://pokeapi.co/docs/v2).

Headline features, in priority order:

1. **Evolution chain viewer** (the signature feature): a family tree that handles straight lines (Charmander), a baby stage (Pichu → Pikachu → Raichu), and branches (Eevee has 5 evolutions).
2. **Pokédex list**: search, type filter, sort (Number / Name / Power), infinite scroll, skeleton loading.
3. **Detail screen**: stats, type matchups (weak / resists / immune), shiny toggle.
4. **Team builder**: up to 6 Pokémon, type weak-spot table, average stats.
5. **Saved (favorites)**.
6. **Offline support**: anything already viewed works without internet.
7. Polish: launch animation, screen transitions, haptics, dark mode.

The interactive HTML draft in `design-reference/pokedex-design.html` is the visual and behavioral reference. See `DESIGN.md`.

---

## 2. Version policy (important)

**Before installing or upgrading ANY package, verify the latest stable version and tell the user. Do not install from memory.**

How to verify:

- Expo-managed packages: install with `npx expo install <pkg>`. This picks the version that matches the installed Expo SDK. Never hand-pick a version for these.
- Other packages: run `npm view <pkg> version` and check the package's release notes and peer dependencies, then confirm with the user.
- After installing, record the package and exact version in `PROGRESS.md` → "Installed packages".

Known traps found while verifying (2026-11-04):

| Package | npm `latest` | Use instead | Why |
|---|---|---|---|
| `typescript` | 7.0.2 | `~6.0.3` | The SDK 58 template pins `~6.0.3`. Do not jump ahead of the template. |
| `@react-native-async-storage/async-storage` | 3.1.1 | `2.2.0` (via `npx expo install`) | SDK 58 bundles 2.2.0. |
| `react-native-gesture-handler` | 3.4.0 | `~3.3.0` (via template / `expo install`) | SDK 58 pins `~3.3.0`. |
| `react` | 19.3.1 | `19.3.0` | SDK 58 pins 19.3.0. |

Rule of thumb: for anything React Native native-module related, **the SDK's pinned version wins over npm `latest`.**

---

## 3. Platform and tooling

| Item | Value | Notes |
|---|---|---|
| Expo SDK | **58** (58.0.x), chosen by the user | Released 2026-10-15 (npm `expo@58.0.0` on 2026-09-29, latest patch `58.0.23` on 2026-11-03). See "Expo Go on Android" below. |
| React Native | 0.88.1 | Bundled with SDK 58. New Architecture only. |
| React | 19.3.0 | |
| TypeScript | ~6.0.3, `strict: true` | SDK 58 also makes React Native's **Strict TypeScript API** the default (no deep `react-native/Libraries/*` imports; refs use instance types like `ViewInstance`). |
| Node.js (dev machine) | **22.13+, 24.3+, or 26+** (even releases only; 23 and 25 are unsupported) | An earlier note in this project said "Node 20+". **That was wrong for SDK 58.** Check with `node -v`. |
| Package manager | npm | Keep one lockfile (`package-lock.json`). |
| Dev OS / device | Linux Mint, Android phone, VS Code | No Android Studio required if using Expo Go or an EAS cloud build. |
| React Compiler | On (template default: `experiments.reactCompiler: true`) | Do not hand-write `useMemo`/`useCallback`/`React.memo` for performance unless a profile shows a need. |
| Typed routes | On (`experiments.typedRoutes: true`) | |
| Import alias | `@/*` → `./src/*` | Already in the template `tsconfig.json`. |

### Expo Go on Android (resolved: the user's phone Expo Go shows SDK 58, see PROGRESS.md → OD-1)

As of Expo's SDK 58 announcement (2026-10-15), the **Play Store version of Expo Go still supported only SDK 57**, and a new Expo Go for SDK 58 was "coming within a few weeks". We could not confirm whether that has shipped. Options:

1. **SDK 58 + Expo Go**: if the Play Store Expo Go now supports SDK 58, `npx expo start` + QR scan just works.
2. **SDK 58 + Expo-installed Expo Go**: Expo CLI can install a matching Expo Go onto an Android device or emulator (needs USB debugging and `adb`). Verify against current Expo docs.
3. **SDK 58 + development build**: build via EAS (cloud) or locally (needs Android SDK). More setup, but it is what production apps use anyway.
4. **SDK 57** (previous stable, still patched, works with the Play Store Expo Go today). Run `npx expo install expo@^57 --fix` equivalents; **do not reuse the version numbers in this file**, re-verify them.

---

## 4. Tech stack (SDK 58 set, verified 2026-11-04)

Versions in the right column are what to expect from `npx expo install` / the SDK 58 template. Re-verify before installing (see §2).

### Included in the SDK 58 default template

| Purpose | Package | Version |
|---|---|---|
| Framework | `expo` | ~58.0.23 |
| Routing | `expo-router` | ~58.0.30 |
| Animation | `react-native-reanimated` | 4.7.1 |
| Animation worklets | `react-native-worklets` | 0.13.0 |
| Gestures | `react-native-gesture-handler` | ~3.3.0 |
| Safe areas | `react-native-safe-area-context` | ~5.11.1 |
| Native screens | `react-native-screens` | ~4.30.1 |
| Images | `expo-image` | ~58.0.18 |
| Fonts | `expo-font` | ~58.0.11 |
| Splash | `expo-splash-screen` | ~58.0.13 |
| Status bar / system UI | `expo-status-bar`, `expo-system-ui` | ~58.0.4 / ~58.0.7 |

### To add (each needs the user's confirmation at install time) 🟡

| Purpose | Package | Expected version | Install with |
|---|---|---|---|
| SQLite cache | `expo-sqlite` | ~58.0.15 | `npx expo install expo-sqlite` |
| Small key-value storage | `@react-native-async-storage/async-storage` | 2.2.0 | `npx expo install ...` |
| Haptics | `expo-haptics` | ~58.0.7 | `npx expo install expo-haptics` |
| Online/offline status | `expo-network` | ~58.0.4 | `npx expo install expo-network` |
| SVG icons and ball artwork | `react-native-svg` | 15.16.0 | `npx expo install react-native-svg` |
| Fonts (Bricolage Grotesque, Figtree) | `@expo-google-fonts/bricolage-grotesque`, `@expo-google-fonts/figtree` | 0.4.1 each | `npx expo install ...` (verify exported weight names after install) |
| Server-state cache | `@tanstack/react-query` | 5.105.3 | `npm install` (peer: react ^18 \|\| ^19, OK) |
| Runtime validation | `zod` | 4.6.7 | `npm install` |
| Later: Pokémon cries | `expo-audio` | ~58.0.11 | `npx expo install expo-audio` |

### Dev dependencies 🟡

| Purpose | Package | Expected version |
|---|---|---|
| Unit tests | `jest-expo` | ~58.0.14 |
| Component tests | `@testing-library/react-native` | 14.1.0 (check its peer deps at install) |
| Formatting | `prettier` | 3.9.10 |
| Linting | `expo lint` (installs ESLint + `eslint-config-expo` on first run) | let Expo choose |

### Deliberately NOT used (until a real need appears)

- Redux / Zustand / Jotai: server state is TanStack Query; user state is small (favorites, team, settings). Revisit only if state sharing becomes painful.
- An ORM (Drizzle, etc.): the schema is 4 small tables; raw SQL through `expo-sqlite` is clearer for a portfolio project and one less dependency.
- A backend or accounts: out of scope. No secrets, so `expo-secure-store` is not needed.
- `expo-sqlite/kv-store` as an AsyncStorage replacement: considered (would drop one dependency). Kept as an option; revisit if two storage libraries feels like too much (see D-004).

---

## 5. Folder structure 🟡

Follows the SDK 58 template: **`src/`** holds all code, and **only route files live in `src/app/`**.

```
pokedex-mobile/
├─ ARCHITECTURE.md  DESIGN.md  PROGRESS.md
├─ design-reference/pokedex-design.html     # interactive HTML draft (source of truth for look and feel)
├─ app.json  package.json  tsconfig.json
├─ assets/                                   # icon, splash, fonts if bundled
└─ src/
   ├─ app/                                   # ROUTES ONLY (thin: compose features, no business logic)
   │  ├─ _layout.tsx                         # providers, fonts, splash gate, root ErrorBoundary
   │  ├─ (tabs)/
   │  │  ├─ _layout.tsx                      # custom tab bar (sliding indicator)
   │  │  ├─ index.tsx                        # Pokédex list
   │  │  ├─ team.tsx
   │  │  └─ saved.tsx
   │  ├─ pokemon/[id].tsx                    # detail (stack screen above tabs)
   │  └─ add-to-team.tsx                     # picker (sheet presentation; verify option names in SDK 58 docs)
   ├─ features/
   │  ├─ pokedex/      (PokemonCard, TypeChipRow, SortBar, hooks)
   │  ├─ detail/       (Hero, StatBars, MatchupGroups, EvolutionTree, ShinyButton)
   │  ├─ team/         (TeamSlot, WeakSpotTable, AverageStats, PickerSheet)
   │  └─ saved/
   ├─ components/ui/                         # shared primitives: TypePill, Chip, Segmented, Skeleton, IconButton, PokeBall
   ├─ domain/                                # PURE TypeScript, zero React / Expo imports
   │  ├─ types.ts                            # Pokemon, TypeName, EvolutionNode, ...
   │  ├─ typeChart.ts                        # all 18 types + multiplier(attackType, defenderTypes)
   │  ├─ evolution.ts                        # API chain -> tree, condition labels
   │  └─ sorting.ts
   ├─ data/
   │  ├─ api/          client.ts (fetchJson), schemas.ts (zod), pokeapi.ts (endpoint functions)
   │  ├─ db/           database.ts, migrations.ts, pokemonRepo.ts, evolutionRepo.ts
   │  ├─ storage/      keys.ts, kv.ts (typed read/write), favorites.ts, team.ts, settings.ts
   │  └─ queries/      queryClient.ts, usePokemon.ts, useEvolutionChain.ts, usePokemonPages.ts
   ├─ theme/           tokens.ts, typography.ts, motion.ts, useTheme.ts
   └─ lib/             errors.ts (AppError), logger.ts, haptics.ts
```

**Layering rules**

```
app  ->  features  ->  data  ->  domain
              \________ components/ui, theme, lib (usable by features and app)
```

- `domain/` imports nothing from the other layers. This keeps the type chart and evolution logic unit-testable in plain Jest.
- UI code never calls `fetch`, `expo-sqlite`, or `AsyncStorage` directly. It uses hooks from `data/queries` and `data/storage`.
- Route files in `src/app` stay tiny.

---

## 6. Data flow

```
 Screen / component
        │  useQuery(...)
        ▼
 TanStack Query  (in-memory cache for this session; dedupes requests; retry rules)
        │  queryFn
        ▼
 Repository  (src/data/db/*Repo.ts)  ── read-through cache ──┐
        │ 1) read SQLite                                      │
        │ 2) hit → return (and optionally refresh later)      │
        │ 3) miss → fetch from network                        │
        ▼                                                     │
 PokéAPI client (fetchJson + zod validation) ── write result ─┘ into SQLite
```

### PokéAPI endpoints used

| Need | Endpoint | Cached in |
|---|---|---|
| Page of Pokémon names | `GET /pokemon?limit=20&offset=N` | SQLite `pokemon_index` |
| Pokémon detail (types, stats, artwork URLs) | `GET /pokemon/{id}` | SQLite `pokemon`, `pokemon_types` |
| Species (gives `evolution_chain.url`) | `GET /pokemon-species/{id}` | SQLite `species` |
| Evolution chain | `GET /evolution-chain/{id}` | SQLite `evolution_chain` (normalized tree as JSON) |

Base URL: `https://pokeapi.co/api/v2`. PokéAPI's **fair use policy asks clients to cache responses locally**, and abusive clients can be banned. The SQLite cache is therefore a requirement, not an extra. Limit concurrent requests (target: ≤ 5 in flight).

### Images

- Use the URLs from the API response, stored in SQLite: `sprites.other["official-artwork"].front_default` and `.front_shiny`. Verified pattern on 2026-11-04: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/{id}.png` and `.../official-artwork/shiny/{id}.png` both return PNGs.
- Render with `expo-image` using a disk cache policy so artwork also works offline after first view. **Images are never stored in SQLite.**
- The HTML draft uses a placeholder Poké Ball. In the app, the ball becomes the loading/error fallback for artwork.

### Evolution chain algorithm (domain/evolution.ts)

API shape (confirmed): `chain` → `{ species, evolution_details[], evolves_to[], is_baby }`, recursive.

1. Get species from `/pokemon-species/{id}`; read `evolution_chain.url`; fetch the chain.
2. Recursively map each `ChainLink` into `EvolutionNode { speciesName, id, via: string, children: EvolutionNode[] }`. `id` comes from the species URL's last path segment.
3. Pick the entry marked `is_default: true` from `evolution_details` (fall back to `[0]`), then convert it into a short label. *(Changed 2026-11-04, D-017: PokéAPI lists one entry per game, and `[0]` can be an old method, e.g. Leafeon's “level up in Eterna Forest” instead of Leaf Stone.)* Labels (examples: "Level 16", "Water Stone", "Friendship", "Friendship, daytime"). Handle at least: `min_level`, `item`, `min_happiness`, `time_of_day`, `trigger.name` (`trade`, `use-item`, `level-up`), `known_move`, `held_item`. Anything unrecognized falls back to a readable trigger name, never to an empty or "undefined" label.
4. Use a stable order for siblings (as returned by the API).
5. Layout: render recursively. A node with several children draws a vertical bracket (see the draft's `.evo-kids.multi`). Wrap the tree in a horizontal `ScrollView` for wide trees.
6. Test with: **Pichu** (baby start), **Charmander** (3 in a line), **Eevee** (5 branches), and a Pokémon with **no evolutions** (must render "does not evolve", not an empty box).

---

## 7. Storage: what lives where

This is the single source of truth for persistence. If you add data, add a row here.

| Data | Store | Shape | Why this store |
|---|---|---|---|
| Pokémon details (id, name, stats, artwork URLs) | **SQLite** `pokemon` | row per Pokémon | Large, structured, queryable (name search, sort by stats) |
| Pokémon types | **SQLite** `pokemon_types` | `(pokemon_id, slot, type)` + index on `type` | Filter by type with an indexed query |
| Pokémon list index (id, name) | **SQLite** `pokemon_index` | `(id, name)` | Search by name offline |
| Species → chain id | **SQLite** `species` | `(id, evolution_chain_id, fetched_at)` | Avoid the extra species call |
| Evolution chains | **SQLite** `evolution_chain` | `(id, tree_json, fetched_at)` | Normalized tree stored once, reused by every member of the family |
| Schema version | SQLite `PRAGMA user_version` | integer | Migrations (see §8) |
| **Favorites** | **AsyncStorage** `pokedex:v1:favorites` | `number[]` | Tiny, read all at once, needed at startup |
| **Team** (≤ 6) | **AsyncStorage** `pokedex:v1:team` | `number[]` | Tiny. Move to SQLite only if multiple named teams are added (see D-010) |
| **Settings** | **AsyncStorage** `pokedex:v1:settings` | `{ theme: "system"\|"light"\|"dark", sort: { key, asc }, hapticsEnabled: boolean }` | Tiny, needed before first render |
| Images | `expo-image` disk cache | n/a | Binary data belongs in the image cache |
| API responses during a session | TanStack Query memory cache | n/a | Dedupes and shares requests between screens |
| Transient UI state (search text, open sheet, current tab filter) | React state | n/a | Not persisted |
| Secrets | none | n/a | No auth, no keys |

**Rules**

- Pokémon data is effectively immutable. TanStack Query uses `staleTime: Infinity`. SQLite rows carry `fetched_at` so a future "refresh data" action can expire them.
- All AsyncStorage access goes through `data/storage/kv.ts`, which validates with zod on read and returns a safe fallback on failure (see §8).
- Keys are versioned (`pokedex:v1:`). A shape change bumps the version and migrates or resets that key.
- Favorites/team hydrate **before** the first screen renders (gate behind the splash/animation) to avoid a flash of empty state.

### SQLite schema (proposed) 🟡

```sql
CREATE TABLE pokemon_index (id INTEGER PRIMARY KEY, name TEXT NOT NULL);
CREATE INDEX idx_pokemon_index_name ON pokemon_index (name COLLATE NOCASE);

CREATE TABLE pokemon (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  hp INTEGER NOT NULL, attack INTEGER NOT NULL, defense INTEGER NOT NULL,
  sp_atk INTEGER NOT NULL, sp_def INTEGER NOT NULL, speed INTEGER NOT NULL,
  total INTEGER NOT NULL,
  artwork_url TEXT, artwork_shiny_url TEXT,
  fetched_at INTEGER NOT NULL
);
CREATE INDEX idx_pokemon_total ON pokemon (total);

CREATE TABLE pokemon_types (
  pokemon_id INTEGER NOT NULL REFERENCES pokemon(id),
  slot INTEGER NOT NULL,
  type TEXT NOT NULL,
  PRIMARY KEY (pokemon_id, slot)
);
CREATE INDEX idx_pokemon_types_type ON pokemon_types (type);

CREATE TABLE species (id INTEGER PRIMARY KEY, evolution_chain_id INTEGER NOT NULL, fetched_at INTEGER NOT NULL);
CREATE TABLE evolution_chain (id INTEGER PRIMARY KEY, tree_json TEXT NOT NULL, fetched_at INTEGER NOT NULL);
```

### Open data question ❓ (OQ-3): how to fill the list screen

The list needs name, number, artwork, and types per card, but `/pokemon?limit=N` returns only names and URLs. MVP approach: **page of 20 → fetch the 20 detail records with limited concurrency → store in SQLite → render.** Already-cached pages load instantly and offline. Alternatives to evaluate if this feels slow: GraphQL beta (single query, but rate-limited), or a build-time script that bundles a seed JSON for Gen 1 to make first launch instant. Decide when building the list; record the choice in the Decision Log.

---

## 8. Error handling

Principle: **catch at boundaries, throw typed errors inside, show a useful state in the UI. Never swallow silently.**

### 8.1 Typed errors (`lib/errors.ts`)

```ts
export type ErrorCode =
  | 'NETWORK'       // no connection, DNS, timeout
  | 'NOT_FOUND'     // 404
  | 'RATE_LIMITED'  // 429
  | 'SERVER'        // 5xx
  | 'PARSE'         // response did not match the zod schema
  | 'STORAGE'       // SQLite / AsyncStorage failure
  | 'UNKNOWN';

export class AppError extends Error {
  constructor(
    public code: ErrorCode,
    message: string,
    public options: { retryable: boolean; cause?: unknown } = { retryable: false },
  ) { super(message); this.name = 'AppError'; }
  get retryable() { return this.options.retryable; }
}
```

### 8.2 Where `try/catch` lives (and where it does not)

| Layer | Handling |
|---|---|
| `data/api/client.ts` `fetchJson` | **try/catch**. Wrap `fetch` with an `AbortController` timeout (10 s). Check `res.ok` (fetch does not throw on 404/500). Map: network failure/timeout → `NETWORK` (retryable), 404 → `NOT_FOUND`, 429 → `RATE_LIMITED` (retryable, with backoff), 5xx → `SERVER` (retryable). Parse JSON inside the try; a bad body → `PARSE`. |
| `data/api/schemas.ts` | zod `safeParse` on every response. Failure → `PARSE` (not retryable). Never trust the network shape. |
| `data/db/*Repo.ts` | **try/catch** around each SQLite call. Reads: on failure, log and **fall through to the network** (the cache is an optimization, not the source of truth). Writes: on failure, log and **continue** (do not fail the user's request because caching failed). |
| `data/db/migrations.ts` | If migration/open fails, log, mark the DB unavailable, and run **network-only** with a visible "Offline cache unavailable" notice. The app must still work. |
| `data/storage/kv.ts` | **try/catch** around AsyncStorage. On read failure or zod mismatch (corrupt/old data): log, return the typed fallback (`[]` or default settings), and overwrite on next write. On write failure: throw `STORAGE` so the UI can show a message ("Couldn't save your team. Try again."). |
| `domain/*` | No try/catch. Pure functions that throw on programmer error only. |
| TanStack Query | Receives thrown `AppError`s. Configured retry (below). Components read `isError` / `error`. |
| Components | No try/catch around data fetching. Render the error state from the query. Use try/catch only for imperative actions (e.g., share, haptics) and keep it local. |
| Render crashes | Expo Router `ErrorBoundary` export in `src/app/_layout.tsx` (root) and in `pokemon/[id].tsx`, with a fallback screen and a "Try again" button. |

Offline behavior of the repository:

- network fails **and** cache has the data → return cached data (no error shown, maybe a small "Offline" chip).
- network fails **and** no cache → throw `NETWORK` → screen shows the offline error state with Retry.

### 8.3 TanStack Query defaults 🟡

```ts
new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: Infinity,            // Pokémon data does not change
      gcTime: 24 * 60 * 60 * 1000,
      retry: (failureCount, error) =>
        error instanceof AppError && error.retryable && failureCount < 2,
      retryDelay: (n) => Math.min(1000 * 2 ** n, 8000),
    },
  },
});
```

Also wire `onlineManager` to `expo-network` so queries pause while offline and resume on reconnect (verify the exact recipe in the TanStack React Native docs at implementation time).

### 8.4 What the user sees

Every screen that loads data has four states, defined in `DESIGN.md`: **loading** (skeleton), **empty**, **error** (what happened + how to fix + Retry), **content**. Error copy never apologizes and never says only "Something went wrong".

### 8.5 Logging

`lib/logger.ts` wraps `console` (dev only). Single place to plug in crash reporting later. Never log secrets (there are none) or user free text.

---

## 9. State management

| Kind of state | Tool |
|---|---|
| Server/API data | TanStack Query |
| Favorites, team, settings (persisted) | Small React context providers + hooks, backed by `data/storage/*`, hydrated at startup |
| Screen-local UI (search text, selected filter, sheet open) | `useState` in the owning component |
| Navigation | Expo Router |

No global store library unless this table stops being enough (log the decision first).

---

## 10. Navigation 🟡

- `(tabs)`: **Pokédex**, **Team**, **Saved**. The draft uses a custom bar with a sliding indicator and a lifting active icon. Build with Expo Router's JS tabs plus a custom `tabBar` to match the design. SDK 58 marks `NativeTabs` stable, which gives a platform-native look; we chose custom to match the design (D-008). Revisit if the custom bar causes problems.
- `pokemon/[id]`: stack screen pushed above the tabs. Slide-from-right with the underlying tab screen shifting and dimming (see motion spec).
- `add-to-team`: presented as a bottom sheet over the Team tab. Verify the current `presentation` options for formSheet-style routes in the SDK 58 Expo Router docs before implementing; fall back to a `Modal` component if needed.
- Typed routes are on: use `href` objects and `useLocalSearchParams<{ id: string }>()`.

---

## 11. Features → data → storage map

| Feature | Data source | Persisted where | Domain logic |
|---|---|---|---|
| List + infinite scroll | `/pokemon` pages + detail | SQLite | `sorting.ts` |
| Search | SQLite `pokemon_index` (name LIKE), works offline | n/a | n/a |
| Type filter | SQLite `pokemon_types` index | last filter not persisted | n/a |
| Sort (Number / Name / Power) | SQLite `ORDER BY` | `settings.sort` | `sorting.ts` |
| Detail stats | `pokemon` | SQLite | n/a |
| Type matchups | computed from types | n/a | `typeChart.ts` (all 18 types) |
| Shiny toggle | `artwork_shiny_url` | not persisted (resets per Pokémon) | n/a |
| Evolution chain | species + chain | SQLite | `evolution.ts` |
| Favorites | local | AsyncStorage | n/a |
| Team + weak spots + average stats | local + `pokemon` | AsyncStorage (ids) | `typeChart.ts` |
| Dark mode | system or override | `settings.theme` | n/a |
| Haptics | n/a | `settings.hapticsEnabled` | `lib/haptics.ts` |
| Launch animation | n/a | n/a (plays every cold launch) | n/a |
| Offline | SQLite + image cache | see above | n/a |

### Type chart note

The HTML draft only knows 9 types. The app must implement **all 18** (add fighting, ground, rock, bug, ghost, steel, ice, dragon, fairy) using PokéAPI's `/type/{name}` `damage_relations` as the reference, with a hand-checked unit-test table (e.g., Charizard: 4× Rock, 2× Water/Electric, 0× Ground; Umbreon: immune to Psychic). Multiplier for a dual type = product of both.

---

## 12. Testing 🟡

| What | Tool | Examples |
|---|---|---|
| Domain logic | `jest-expo` (plain Jest tests) | type multipliers, evolution tree mapping + labels, sorting |
| Repositories | Jest with mocked `fetchJson` and an in-memory/mocked SQLite | cache hit, cache miss, network failure with cache, network failure without cache |
| Storage helpers | Jest with mocked AsyncStorage | corrupt JSON returns fallback; write failure throws `STORAGE` |
| Components | `@testing-library/react-native` | list shows skeleton → cards; error state shows Retry; team full disables add |

Run `npx expo lint` and `npx tsc --noEmit` before every commit. Target: domain logic ≥ 90% covered; do not chase coverage on UI.

---

## 13. Performance and accessibility baseline

- List: `FlatList` with `numColumns={2}`, stable `keyExtractor`, `expo-image` for artwork, paging with `onEndReached`. Do not add `getItemLayout` or manual memoization without measuring.
- Animations on the UI thread with Reanimated; avoid animating layout props on big lists.
- Respect **reduced motion** (skip or shorten animations) and **dark mode**.
- Touch targets ≥ 44 pt; every icon-only button has an `accessibilityLabel`; type is never conveyed by color alone (pills always show the type name).
- Support system font scaling; do not set `allowFontScaling={false}` globally.

---

## 14. Conventions

- TypeScript `strict`, no `any` (use `unknown` + narrowing). No non-null `!` assertions without a comment.
- Named exports for components; one component per file; file names `kebab-case.tsx` (matches the template).
- Imports via `@/…`. No relative `../../..` chains.
- Commit messages: Conventional Commits (`feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`). The user prefers **no AI attribution** in commits, README, or code comments.
- Prettier on save. No commented-out code in commits.
- Strings the user sees follow the voice rules in `DESIGN.md`.

---

## 15. Decision log

| ID | Decision | Status | Date | Alternatives considered |
|---|---|---|---|---|
| D-001 | Expo (managed workflow) + Expo Router | ✅ | 2026-11-04 | Bare React Native CLI (more setup, no benefit here) |
| D-002 | TypeScript strict | ✅ | 2026-11-04 | JS (user is experienced with TS) |
| D-003 | TanStack Query for server state | ✅ | 2026-11-04 | SWR; hand-rolled fetch hooks |
| D-004 | SQLite (cache) + AsyncStorage (small user data) | ✅ | 2026-11-04 | SQLite only via `expo-sqlite/kv-store` (fewer deps); revisit if desired |
| D-005 | zod validates every API response and stored blob | 🟡 | 2026-11-04 | Trust types only (unsafe); hand-written guards |
| D-006 | Typed `AppError` + boundary try/catch + Expo Router `ErrorBoundary` | 🟡 | 2026-11-04 | Throw raw errors (poor UX) |
| D-007 | Reanimated for all animation | ✅ | 2026-11-04 | Animated API (less capable) |
| D-008 | Custom tab bar to match the design (not `NativeTabs`) | 🟡 | 2026-11-04 | `NativeTabs` (stable in SDK 58, native look) |
| D-009 | `expo-image` for artwork with disk cache | ✅ | 2026-11-04 | RN `Image` (no disk cache control) |
| D-010 | Team stored as id array in AsyncStorage; move to SQLite if named teams are added | 🟡 | 2026-11-04 | SQLite `teams` table now |
| D-011 | Implement all 18 types in the type chart | ✅ | 2026-11-04 | Keep draft's 9 (incorrect results) |
| D-012 | Target Expo SDK 58 | ✅ chosen by the user; Play Store Expo Go on their phone confirmed to show SDK 58 | 2026-11-04 | SDK 57 |
| D-013 | Version policy: verify latest stable and confirm with the user before every install | ✅ | 2026-11-04 | n/a |
| D-014 | `expo-network` for online status (not `@react-native-community/netinfo`) | 🟡 | 2026-11-04 | NetInfo (also bundled by Expo) |
| D-015 | No global state library, no ORM, no backend | ✅ | 2026-11-04 | Zustand, Drizzle |
| D-016 | List fill strategy: 20 per page + detail fetches, cached | ❓ OQ-3 | 2026-11-04 | GraphQL beta; bundled seed JSON |
| D-017 | Evolution label uses the `is_default` entry of `evolution_details`, not `[0]` | ✅ | 2026-11-04 | `[0]` (shows outdated methods for Leafeon, Glaceon, Sylveon) |
| D-018 | `TypeName` / `TYPE_NAMES` live in `domain/types.ts`; `theme/tokens.ts` re-exports them | ✅ | 2026-11-04 | Keep in theme (would make `domain` import `theme`) |
