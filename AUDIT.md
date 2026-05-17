# AttorneyVault · Demo Readiness Audit

**Audit date:** 2026-05-17 (Wednesday demo target)
**Audience:** Jeffrey Stanley (CEO) and Cindy Stanley
**Live URL:** https://attorneyvault-demo.vercel.app
**Credentials:** `CJS-0001` / `demomaster2026`
**Repo branch:** `main` (commit `a43e88e`)

---

## 1. Project Snapshot

| Item | Value |
|---|---|
| Project name | `attorneyvault-demo` |
| Framework | React 19.2 (Vite 8) |
| Language | TypeScript ~6.0 (strict) |
| Routing | `react-router-dom` 7.14 (BrowserRouter, single SPA) |
| Styling | Tailwind 3.4 (custom design tokens) |
| Animation | `framer-motion` 12.38 |
| Icons | `lucide-react` 1.8 |
| Drag & drop | `@dnd-kit/core` 6.3 + `sortable` 10.0 |
| Charts | `recharts` 3.8 |
| Utility | `clsx` 2.1 + `tailwind-merge` 3.5 |
| State / auth | None (no provider, no router guards, no Supabase) |
| Data layer | Hard-coded module exports in `src/lib/mockData.ts` |
| Backend | None |

**Scripts** (`package.json`):
- `dev` → `vite`
- `build` → `tsc -b && vite build` (passes clean, verified locally)
- `lint` → `eslint .`
- `preview` → `vite preview`

**Deployment**
- Vercel project: `attorneyvault-demo` (orgId `team_knt3XQKoFnyeESFyoSH9pTNv`, projectId `prj_8ywIMsw8slmFiWSrfG3ZzEYm6XmR`)
- `vercel.json` rewrites all routes to `/index.html` (correct SPA fallback)
- No environment variables — nothing in `.env`, no `import.meta.env.*` references in source
- Live URL is **not** stored in repo; it lives in Vercel project settings

**Public assets**
- `public/favicon.svg` — inline SVG vault icon
- `public/videos/vault-idle.mp4` — **3.1 MB**, used by login cinematic. No `<link rel="preload">` in `index.html`; only a runtime `canplaythrough` probe with 1.5 s fallback

---

## 2. File Tree

```
src/
├── App.tsx                                    Router + 8 routes, no auth guard
├── main.tsx                                   React 19 root, StrictMode
├── index.css                                  Tailwind base + custom utilities (label-eyebrow, hairlines, vault-pulse)
├── components/
│   ├── layout/
│   │   ├── PageShell.tsx                      Sidebar + TopBar + main + footer wrapper with page-fade
│   │   ├── Sidebar.tsx                        Fixed 220 px left nav, 7 items, CJS user card
│   │   ├── TopBar.tsx                         Fixed top bar: breadcrumb, SessionTimer, Lock indicator, "Lock Vault" button
│   │   └── FooterStrip.tsx                    Thin wrapper around IntegrityBar
│   ├── ui/
│   │   ├── Badge.tsx                          5 variants (neutral/forest/gold/oxblood/outline)
│   │   ├── Button.tsx                         5 variants × 3 sizes
│   │   ├── Card.tsx                           Paper card with hairline border
│   │   ├── Divider.tsx                        Labelled hairline divider
│   │   ├── Input.tsx                          Inline underline input
│   │   ├── StatTile.tsx                       Big-number tile with sparkline + count-up animation
│   │   └── Tag.tsx                            Tiny chip
│   ├── vault/
│   │   ├── CinematicVault.tsx                 Login-page video + decryption sequence
│   │   ├── IntegrityBar.tsx                   Bottom-fixed "VAULT INTEGRITY 100%" strip
│   │   ├── LockIndicator.tsx                  Unlocked/warning/locked pill
│   │   ├── SessionTimer.tsx                   10:00 countdown in TopBar (NOT shared with VaultMode timer)
│   │   ├── VaultPulse.tsx                     Pulsing dot
│   │   └── VaultSeal.tsx                      Animated circular seal
│   └── widgets/
│       └── KPITile.tsx                        Re-export of StatTile (dead wrapper)
├── hooks/
│   └── useVaultSession.ts                     10-minute countdown hook (not actually consumed anywhere)
├── lib/
│   ├── mockData.ts                            247 attorneys + timeline + bonds + audit (~1,460 LOC, deterministic seed)
│   └── utils.ts                               cn() + formatCurrency / formatCompactCurrency / formatRelativeTime
└── pages/
    ├── Login.tsx                              Cinematic vault unlock (auto-filled credentials, any input passes)
    ├── VaultHome.tsx                          ⚠ Mostly placeholder — "Full Vault Home experience shipping in next build"
    ├── Rolodex.tsx                            247 attorneys: search, filter, sort, grid/list, tier grouping
    ├── AttorneyProfile.tsx                    Per-attorney deep dive (hero, stats, timeline, bonds, AI sidebar, audit)
    ├── Pipeline.tsx                           5-column kanban with working drag-drop, filters, search
    ├── Intelligence.tsx                       5 tabs: Briefing, Dormant Watch, Court Signals, Drift scatter, Competitive
    ├── Enrichment.tsx                         4 pipeline cards + 18-event activity feed
    ├── VaultMode.tsx                          Audit trail, team, zones, export, version history, session
    └── Reports.tsx                            3 generators + 12-row archive + retention card
```

No `/app` directory (Vite, not Next.js).

---

## 3. Routes and Pages

| Route | Component | Purpose | Auth-gated? |
|---|---|---|---|
| `/` | `Login` | Cinematic vault unlock | Public |
| `/vault` | `VaultHome` | "Good evening, Jeffrey" stats overview | **NO — direct URL works** |
| `/rolodex` | `Rolodex` | 247-attorney directory | **NO** |
| `/attorney/:id` | `AttorneyProfile` | Single-attorney deep dive | **NO** |
| `/pipeline` | `Pipeline` | 5-stage kanban board | **NO** |
| `/intelligence` | `Intelligence` | 5-tab signals view | **NO** |
| `/enrichment` | `Enrichment` | 4-pipeline data-source view | **NO** |
| `/vault-mode` | `VaultMode` | Audit trail + team + export | **NO** |
| `/reports` | `Reports` | Report generators + archive | **NO** |
| `*` | `Navigate to /` | 404 → login | — |

**Auth gating:** there is none. Anyone with the deployed URL can hit `/vault` directly and bypass the cinematic. The "Lock Vault" button in TopBar simply navigates to `/`. The 10-min `SessionTimer` decrements but does not enforce a logout.

---

## 4. Auth Flow

**End-to-end:**
1. `Login.tsx` mounts with the two text fields pre-populated: `operatorId = "CJS-0001"`, `vaultKey = "demomaster2026"`.
2. Clicking "Unlock Vault" (or pressing Enter) runs `startUnlock()` — there is **no credential check**. The function ignores both field values and runs a 3.9 s cinematic state machine (`verifying → decrypting → opening → unlocked`), then `navigate("/vault")`.
3. A "SKIP INTRO →" button in the bottom-right of the login screen jumps straight to `/vault`.

**CJS-0001 / demomaster2026 confirmed:** works because **every** input works. Both fields could be left blank, or contain `asdf` / `asdf`, and the unlock sequence still completes successfully.

**Other test accounts:** none. There is no user store.

**Session persistence:** none. There is no `localStorage`, `sessionStorage`, cookie, or context. Refreshing any page keeps the user on that page (because there's no guard to redirect them).

**Logout behavior:** the "Lock Vault" button in `TopBar.tsx` simply calls `navigate("/")` — it does not clear anything because there is nothing to clear. The login form re-mounts with the credentials pre-filled.

---

## 5. Data Model

**Single source:** `src/lib/mockData.ts` (1,459 lines).

All data is generated deterministically at module-load time. **It does not persist across reloads** (each refresh regenerates the same set from the same seeds), and there is no mutation API — Pipeline drag-drop updates local React state only.

### Core shapes

```ts
type AttorneyTier   = "platinum" | "gold" | "silver" | "bronze" | "prospect" | "dormant";
type AttorneyStatus = "active" | "warm" | "cold" | "dormant" | "reactivation";
type BbbOffice      = "San Jose HQ" | "Oakland" | "Redwood City" | "Los Angeles" | "Santa Ana" | "San Diego";

interface Attorney {
  id, name, firm, city, county, phone, email, assistant,
  practiceAreas[], barNumber, yearsAdmitted,
  tier, lifetimeReferrals, lifetimeVolume,
  lastReferralDate, lastContactDate,
  averageBondSize, conversionRate,
  ownerOffice, tags[], status,
  avatarInitials, firmLogoColor
}

interface TimelineEntry  { id, attorneyId, type, timestamp, summary, channel, actor }
interface ReferredBond   { id, attorneyId, defendant, amount, status, postedDate, charge }
interface AuditLogEntry  { id, action, user, timestamp, target, details }
```

### Volumes

- **247 attorneys** total = 40 hand-curated "seeds" (including `C. Jeffrey Stanley`, the user's CEO, as `atty-001` Platinum) + 207 deterministically generated. Distribution: 12 Platinum, 35 Gold, 78 Silver, 62 Bronze, 34 Prospect, 26 Dormant.
- **30 global timeline entries**, plus a separate per-attorney generator (`buildTimeline` in `AttorneyProfile.tsx`) that produces 10 entries on demand
- **50 referred bonds** global, plus per-attorney generator that produces 8 on demand
- **20 global audit entries**, plus per-attorney generator (5 each) and a 28-row generator in `VaultMode`

### Sample seed (atty-001)

```ts
{
  name: "C. Jeffrey Stanley",
  firm: "Stanley & Reyes Defense Group",
  city: "San Jose",
  tier: "platinum",
  refs: 142, avgBond: 185000, conv: 0.84,
  tags: ["Trusted Circle", "Board Referred", "High Net Worth"]
}
```

⚠ **Conceptual issue:** Jeffrey Stanley is the principal *user* of the vault and also appears as Platinum attorney #1 with 142 referrals — i.e. the seed has him referring matters to himself. See §8.

---

## 6. Feature Inventory

Legend: ✅ works · 🎨 decorative only · ❌ dead button / broken

### Login (`/`)
- Cinematic video background, decryption sequence, gold burst, vault open transition — ✅ all working
- Operator ID + Vault Key fields auto-filled — ✅ render, ❌ not validated
- "Unlock Vault" button + Enter key — ✅ triggers sequence
- "SKIP INTRO →" — ✅ jumps to `/vault`
- "BIOMETRIC FALLBACK AVAILABLE · SESSION EXPIRES AFTER 10 MIN OF INACTIVITY" — 🎨 copy only

### Vault Home (`/vault`)
- "Good evening, Jeffrey." hero with VaultSeal — ✅
- Four StatTiles (Total Attorneys, Active Referrers, Lifetime Volume, Dormant) with animated count-up + sparklines — ✅
- ⚠ **"NEXT BUILD" card with copy: "Full Vault Home experience shipping in next build. Daily briefing. Reactivation queue. Relationship heatmap…"** — this is a placeholder card explicitly admitting the page is unfinished. **Demo killer.**

### Rolodex (`/rolodex`)
- Header + 4 StatTiles — ✅
- Search by name/firm/city/county — ✅
- Filter panel (Tier, Status, Office, Practice Area) with active-count chip — ✅
- Sort dropdown (6 options) — ✅
- Grid / List view toggle — ✅
- Tier grouping with divider zones — ✅
- Empty state with "Clear Filters" CTA — ✅
- Cards link to `/attorney/:id` — ✅

### Attorney Profile (`/attorney/:id`)
- Hero with tier eyebrow, name, firm, location, badges, tags, VaultSeal — ✅
- ZoneBanner for Platinum/Gold — ✅
- Stats strip (Volume, Referrals, Avg Bond, Conversion) — ✅
- Relationship Timeline (10 entries, deterministic per attorney) — ✅
- "View Full Timeline →" — ❌ no handler
- Referred Bonds ledger (8 rows) — ✅
- Vault Intelligence sidebar: Relationship Health, Recommended Next Action, AI-drafted email — ✅ all rendered with real data
- "Draft The Action →", "Edit & Send", "Regenerate" — ❌ no handlers
- Contact card (phone, email, assistant, address, prefers tag) — ✅
- Metadata card (Owner, Tier, Tags, Practice Areas, Bar No.) — ✅
- "Manage Tags" — ❌
- Audit Trail card (5 entries) — ✅
- "View Full Audit in Vault Mode →" — ❌
- Sticky right-edge action bar (Edit profile / Log new contact / Schedule follow-up / Download profile) — ❌ all four icons are dead
- "Back to Rolodex" — ✅

### Pipeline (`/pipeline`)
- 5-column kanban (Identified / Introduced / Engaged / Referring / At Risk) — ✅
- Drag-and-drop between columns (dnd-kit) — ✅ actually works
- DragOverlay preview — ✅
- Filter chips (All / My Territory / Flagged / At Risk) — ✅
- Search by name/firm/city — ✅
- Stat strip with per-stage counts — ✅
- Card click → AttorneyProfile — ✅
- "Add Attorney" + button — ❌

### Intelligence (`/intelligence`)
- 5-tab nav with animated underline — ✅
- **Briefing tab**: 5 briefing cards derived from real data + Vault Weather card (94/100 + sparkline) + Active Watches list + Signal Streams list — ✅
- **Dormant Watch tab**: 18-row reactivation queue — ✅; "SCHEDULE OUTREACH →" navigates to attorney profile ✅
- **Court Signals tab**: 8 hardcoded events with dates like `4/21`, `4/20` etc. — ✅ render, ⚠ dates look stale relative to today (2026-05-17, ~1 month old, no year shown so reads as "April this year")
- **Relationship Drift tab**: recharts scatter (recency × volume), color-coded — ✅
- **Competitive Index tab**: 6 office cards with share % + delta — ✅; competitor names ("SV Legal Bail Co", "Aladdin Bail Bonds", "All-Pro Bail Bonds") are realistic

### Enrichment (`/enrichment`)
- 4 StatTiles (Data Points 12,847 / Runs 3,221 / Updated 89 / New 14) — ✅
- 4 Pipeline cards: Bar Registry, Court Dockets, Editorial, Concierge — ✅
- "VIEW PIPELINE LOGS →" / "VIEW NOTES →" CTAs — ❌
- 18-row Activity feed with hardcoded `4/21 14:22` style timestamps — ✅ render, ⚠ frozen at April dates

### Vault Mode (`/vault-mode`)
- Vault Integrity / Encryption / Last Backup / Access Zones top card — ✅ (all static)
- Live Audit Trail with 28 rows (relative timestamps from page-load `Date.now()`) — ✅; "Filter Events" / "Export Log (CSV)" — ❌
- Team Access card (CJS, **Cindy Stanley**, Marta Beltran, Arman Elliott, Nia Waterston) — ✅; "+ Invite Team Member" — ❌
- Vault Zones expand/collapse — ✅
- Encrypted Export: password input + ALL/GOLD/CUSTOM scope toggle + "Initiate Encrypted Export" button — 🎨 UI only, button does nothing
- Version History (90-day bar chart) — ✅; "Restore From Snapshot" — ❌
- Active Session timer (counts down from 9:12) + "Extend Session" (resets to 10:00) — ✅ that one works
- ⚠ This timer is **not** synced with the TopBar's SessionTimer (separate component, separate interval, separate start value)

### Reports (`/reports`)
- 4 StatTiles — ✅
- 3 Generator cards (Quarterly Brief, Attorney Ledger, Office Snapshot) — ✅; "Generate Q1 2026 Brief" / "Select Attorney → Generate" / "Select Office → Generate" — ❌
- 12-row Recent Editions archive (includes a "DRAFT · AWAITING PRINCIPAL REVIEW" row for the Q1 2026 brief) — ✅
- DOWNLOAD / VIEW / REGENERATE row actions — ❌
- Archive & Retention card — ✅ static copy

---

## 7. Visual and UX Quality Pass

Scale: 1 (bad) to 10 (Linear/Stripe-tier polish).

### Login `/`
- Visual polish: **9** — cinematic video, gold underline focus state, staggered text entry. Genuinely premium.
- Theme: **9** — dark obsidian + gold accents, cohesive
- Mobile: **7** — split changes to top/bottom on `<lg`, text still readable; video keeps playing
- Loading: **8** — "LOADING VAULT ENVIRONMENT" eyebrow until video readies
- Animation: **10** — best surface in the app
- Issues: 3.1 MB MP4 with no `<link rel="preload">`. On hotel wifi the 1.5 s fallback fires before the video is ready and you see the static eyebrow longer than intended.

### Vault Home `/vault`
- Visual polish: **5** — typography is great, but the page is half-empty and one section literally says "shipping in next build"
- Theme: **9**
- Mobile: **8** — stats restack cleanly
- Loading / empty: N/A — content is static
- Animation: **8** — StatTile count-ups are nice
- Verdict: **the first thing the CEO sees after the cinematic, and it admits it's unfinished**

### Rolodex `/rolodex`
- Visual polish: **9** — tier grouping with editorial dividers reads like a coffee-table book
- Theme: **9**
- Mobile: **7** — filter panel is fixed-width 560 px, will horizontally overflow on phone widths
- Loading / empty: **9** — well-designed empty state
- Animation: **8** — card entries stagger nicely
- Issues: filter panel positioned `top-full` may be cut off by `overflow-x-auto` on the toolbar row at some viewports; need to verify on demo machine resolution

### Attorney Profile `/attorney/:id`
- Visual polish: **9** — this is the second-best surface after Login
- Theme: **9**
- Mobile: **6** — the right sidebar (Vault Intelligence + Contact + Metadata) becomes a full-width stack and the sticky action bar is `hidden lg:flex` (correctly hidden on mobile)
- Animation: **8**
- Issues: Sticky action bar's four icons are all dead. If CEO hovers and clicks, nothing happens. **High risk during demo.**

### Pipeline `/pipeline`
- Visual polish: **8**
- Theme: **9**
- Mobile: **5** — 5 columns of 280 px = 1,400 px min. Horizontal scroll is enabled but feels rough on touch
- Animation: **9** — drag preview, hover lift, column-over highlight are great
- Issues: huge column count for 247 attorneys; "Referring" column is dense. Scrolling works but volume can make it visually busy

### Intelligence `/intelligence`
- Visual polish: **8** — tab nav with `layoutId` underline is elegant
- Theme: **9**
- Mobile: **7** — recharts respond, tabs scroll horizontally
- Animation: **8**
- Issues: Court Signals dates (`4/21` etc.) feel stale on May 17. No year shown so they read as "April 21" — implies the platform hasn't ingested anything in 4 weeks

### Enrichment `/enrichment`
- Visual polish: **8**
- Theme: **9**
- Mobile: **8**
- Animation: **8**
- Issues: hardcoded `4/21 14:22` timestamps in the activity feed will look "stuck in time" on May 17. Same staleness problem as Court Signals

### Vault Mode `/vault-mode`
- Visual polish: **9** — top integrity strip + live audit trail is the most "private bank" feeling page
- Theme: **9**
- Mobile: **6** — right rail (4 cards) stacks below the audit trail and gets long
- Animation: **8**
- Issues: TopBar SessionTimer counts down from `10:00` on every page-mount; the in-page Active Session timer starts at `9:12`. The two are inconsistent — if CEO notices, it looks broken

### Reports `/reports`
- Visual polish: **8**
- Theme: **9**
- Mobile: **7** — table goes scroll-x
- Animation: **8**
- Issues: every primary button on the page is dead. Row "DOWNLOAD" looks meaningfully like it should produce a PDF

### Cross-cutting
- Typography (Fraunces display + Inter sans + JetBrains mono) is **excellent** — already past the "AI-generated" bar
- Editorial paper grain background, hairline borders, gold pulse dots — cohesive identity
- The "Bad Boys Bail Bonds dark/red premium aesthetic" called out in the prompt does **not** match the current build. The current palette is cream paper + forest green + gold + oxblood. Read it like a Hermès / Aesop / Black-AmEx aesthetic, not the Bad Boys neon-red website. **This is a strategic question, not a bug** — the editorial direction is gorgeous and probably the right call for the pitch, but it should be a deliberate choice you stand behind on the call.

---

## 8. Known Issues

### Console / build
- `tsc -b --noEmit` passes clean (verified). No TS errors.
- ESLint not run as part of this audit; not checking warnings.
- No runtime console errors observed in source review.

### Broken or dead interactions
The following look interactive but do nothing on click (full list):
- AttorneyProfile: sticky action bar (4 icons), "Draft The Action →", "Edit & Send", "Regenerate", "Manage Tags", "View Full Timeline →", "View Full Audit in Vault Mode →"
- Pipeline: "Add Attorney" + button
- Intelligence: no dead buttons (good)
- Enrichment: "VIEW PIPELINE LOGS →" ×3, "VIEW NOTES →"
- Vault Mode: "Filter Events", "Export Log (CSV)", "+ Invite Team Member", "Initiate Encrypted Export", "Restore From Snapshot"
- Reports: all 3 generator CTAs, all DOWNLOAD/VIEW/REGENERATE row actions

### Data realism
- `C. Jeffrey Stanley` (the CEO, the user) is also `atty-001` Platinum with 142 referrals. If the demo audience clicks his name in the Rolodex, the implication "he refers matters to himself" is conceptually awkward. Possibly intentional as flattery, but worth a deliberate decision.
- Names like "Marisol Castaneda", "Harold Okonkwo", "Priya Ramanathan" are well-chosen — no `John Doe` / `Sample Firm` / Lorem ipsum found anywhere.
- Defendant names (Miguel Delgado, Carlos Bravo, etc.) read as real California criminal-defense clientele.
- Court Signals events dated `4/21`, `4/20` etc. read as ~4 weeks old today.
- Enrichment activity feed dates `4/21 14:22` … `4/15` — same staleness.
- Reports archive dates run Jan–Apr 2026 — these read fine (a Q1 brief in April is reasonable).
- VaultHome greeting is hardcoded "Good evening, Jeffrey." If the demo runs in the morning or afternoon, it will say "evening" anyway.
- IntegrityBar footer: hardcoded "LAST BACKUP 2H AGO · DATA POINTS 12,847" — fine for a static demo.

### Layout / visual
- TopBar SessionTimer (`10:00` start) is desynced from VaultMode Active Session timer (`9:12` start). Two timers, two intervals.
- The 220 px fixed sidebar + 1,440 px max content = the app needs ≥ 1,400 px viewport to feel right. Below that, content compresses. Not designed for mobile.
- No skeleton states (the page just appears) — fine, because nothing is async.

### Auth
- No route guard. Anyone with the URL can hit `/vault` directly. The cinematic is purely theatrical — bookmark to `/rolodex` and you're in.

### Performance
- 3.1 MB MP4 on login, no preload tag. First-time visit on a slow network shows the loading eyebrow longer than expected.
- All 247 attorneys + 50 bonds + 30 timeline entries + 20 audit rows are generated synchronously at module load. Bundle is heavy with the seed data but not problematic.

---

## 9. Demo-Critical Risks

Top 5, ranked by what could most embarrass you Wednesday.

1. **VaultHome "NEXT BUILD" placeholder card.** First page after unlock. Reads verbatim: *"Full Vault Home experience shipping in next build."* If Jeffrey reads that copy, the entire credibility of the pitch craters — it signals "demo is half-built." **Highest-priority fix.**

2. **Cindy is in the demo audience and is named in the product as a "Lieutenant" with `GENERAL + GOLD` access.** This is *good* (intentional, flattering) — but only if you land on Vault Mode and show her name. If you skip Vault Mode, the nicest personalization in the build is invisible. Build the demo flow to *guarantee* a beat on Vault Mode → Team Access card.

3. **Dead buttons on Attorney Profile.** If the CEO clicks "Edit & Send" on the AI follow-up email, or any of the four sticky action icons, nothing happens. AttorneyProfile is your money page — set the expectation in your script ("In production this would draft into Outlook; today it's previewed inline") or fix the click handlers to show a toast.

4. **C. Jeffrey Stanley appears as Platinum attorney #001 with 142 referrals.** A keen-eyed CEO will notice his own name and laugh — or wince. Either rename the seed to a different prominent attorney, or own it in the script as a "this is your trusted-circle anchor."

5. **No route guard.** Low-probability risk on a controlled demo, but if Jeffrey grabs the URL and refreshes any deep page, he stays logged in forever with no countdown to lockout — undermining the "audited / encrypted / sealed" narrative the entire UI tells. Add even a trivial sessionStorage flag.

Honorable mentions: stale "4/21" dates on Intelligence + Enrichment; SessionTimer mismatch between TopBar and VaultMode; no auto-greet (always "evening").

---

## 10. Polish Recommendations

Ranked by impact-to-effort. Time estimates are conservative.

### 1. Replace the VaultHome "NEXT BUILD" card with a real briefing module
- **Why:** removes the only "this is unfinished" signal in the entire build. The page that opens after the unlock cinematic is currently the weakest page in the app.
- **What:** replace the placeholder card with three editorial blocks composed from existing mock data: "Today's Briefing" (3 cards = re-use `Intelligence.buildBriefing()`), "Reactivation Queue" (5 attorneys with the largest `daysSince(lastContactDate)`), and "Recent Inbound" (3 most-recent timeline `referral` entries). Same StatTiles up top stay.
- **Time:** 90 min
- **Files:** `src/pages/VaultHome.tsx` (rewrite the lower half)

### 2. Wire every dead button to a polished toast / inline acknowledgement
- **Why:** the moment the CEO clicks something and nothing happens, the spell breaks. A 200 ms "Drafted to Outbox — review in Vault Mode" toast preserves the illusion at near-zero cost.
- **What:** add a single `useToast()` hook + bottom-right toast component. Wire it to: AttorneyProfile sticky bar (4), "Edit & Send", "Regenerate", "Draft The Action", "Manage Tags", "View Full Timeline", "Pipeline → Add Attorney", "Enrichment → View Pipeline Logs ×3 / View Notes", "Vault Mode → Filter Events / Export Log / Invite Team / Initiate Export / Restore From Snapshot", "Reports → generators + row actions".
- **Time:** 2 h
- **Files:** new `src/components/ui/Toast.tsx`, `src/hooks/useToast.ts`, edits across all 7 pages

### 3. Bring Court Signals + Enrichment activity dates current to today
- **Why:** "4/21" on a May 17 demo reads as "this product hasn't ingested data in a month." A live-feeling demo needs near-now timestamps.
- **What:** compute event dates as `today − {1,2,3…}` days at module-load time instead of hardcoding `4/21`. Use the same `daysAgo()` helper that already exists.
- **Time:** 30 min
- **Files:** `src/pages/Intelligence.tsx` (`COURT_EVENTS`), `src/pages/Enrichment.tsx` (`ACTIVITY`)

### 4. Make the VaultHome greeting time-aware
- **Why:** "Good evening, Jeffrey" at 2 pm reads as a static mockup. "Good afternoon, Jeffrey" reads as a real product.
- **What:** `const hour = new Date().getHours(); const greet = hour < 12 ? "morning" : hour < 18 ? "afternoon" : "evening";`
- **Time:** 5 min
- **Files:** `src/pages/VaultHome.tsx`

### 5. Add a minimum-viable auth guard
- **Why:** the "sealed / audited / encrypted" narrative is sold by every page. A direct URL bypass undermines it. Cheap to fix.
- **What:** set `sessionStorage.setItem("vault_unlocked", "1")` at the end of the unlock sequence; wrap all non-`/` routes in a guard component that redirects to `/` if the flag is missing. Clear on "Lock Vault".
- **Time:** 30 min
- **Files:** `src/App.tsx` (wrap routes), `src/pages/Login.tsx` (set flag), `src/components/layout/TopBar.tsx` (clear on lock)

### 6. Sync the SessionTimer across TopBar and VaultMode
- **Why:** two timers showing different remaining time on the same screen looks broken. One shared timer looks legit.
- **What:** lift the countdown into a `VaultSessionContext` (the unused `useVaultSession` hook is the right shape — just wire it up). Both `SessionTimer.tsx` and `VaultMode.tsx`'s session card read from it.
- **Time:** 45 min
- **Files:** new `src/contexts/VaultSessionContext.tsx`, edits to `App.tsx`, `SessionTimer.tsx`, `VaultMode.tsx`

### 7. Rename `atty-001` away from "C. Jeffrey Stanley"
- **Why:** removes the self-referral oddity. The seed is otherwise great.
- **What:** swap `C. Jeffrey Stanley / Stanley & Reyes Defense Group` for a distinct Platinum anchor — e.g., `Augustin Mercer / Mercer Trial Group`. Cascade the change through any places the string appears (Enrichment activity feed mentions him by name; Court Signals "People v. Becerra" mentions Stanley & Reyes — those can stay or be relabeled).
- **Time:** 30 min
- **Files:** `src/lib/mockData.ts`, `src/pages/Enrichment.tsx`, `src/pages/Intelligence.tsx`

### 8. Preload the login video
- **Why:** removes the "LOADING VAULT ENVIRONMENT" eyebrow on first hit. First impression is the cinematic, not loading text.
- **What:** add `<link rel="preload" href="/videos/vault-idle.mp4" as="video" type="video/mp4">` to `index.html`. Optional: also prepare a low-res poster image.
- **Time:** 10 min
- **Files:** `index.html`

### 9. Smooth the Court Signals + Enrichment "live" feeling with a tiny tick
- **Why:** A real-time pulse on the activity feed ("indexed 4 s ago" updating to "8 s ago") is the cheapest way to feel "live."
- **What:** Compute the most recent activity row's `daysAgo` to seconds, increment with `setInterval(1000)` in the page mount. One row only — restraint matters.
- **Time:** 20 min
- **Files:** `src/pages/Enrichment.tsx`

### 10. Add a one-line "What you're looking at" subhead under each H1
- **Why:** every page already has one — but they're generic ("Signals derived from the vault. Updated continuously."). Sharpen them to be specific to the data on the page so any glance lands a takeaway. E.g., Pipeline → "247 attorneys plotted by maturity. 89 actively referring. 34 at risk."
- **What:** edit the `<p>` directly under each `<h1>`. Use live-derived counts where possible (mock data has the numbers).
- **Time:** 20 min
- **Files:** every page

---

## End of audit

Net read: this is **substantially complete** premium software with three demo killers — the VaultHome placeholder card, dead buttons on AttorneyProfile, and stale April dates on Intelligence / Enrichment. Fix those plus the auth guard and the time-aware greeting and you are bulletproof for Wednesday. Total surgical-fix budget: **~5 hours.**
