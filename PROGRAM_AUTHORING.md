# Program Authoring Guide (for research tasks)

The app is a **fully offline, rule-based** (NO AI) Canadian immigration eligibility checker.
A user answers a survey → every `Program` runs `evaluate(profile)` → the UI shows which programs they qualify for, with official links.

## Golden rules
1. **Only official sources.** Every URL must be on `canada.ca` (IRCC) or an official provincial/territorial government site (e.g. `ontario.ca`, `welcomebc.ca`, `quebec.ca`), or the official IRCC help centre. Never blogs, law firms or consultants.
2. **Verify every URL** by fetching it (`read_url_content`). If a page redirects or 404s, find the current one. Don't invent URLs.
3. **Rules come from the page text**, not memory. Immigration rules changed a lot in 2024–2026 (caps, paused streams, new pilots, ended pilots). If the official page says a program is closed/paused/ended, set `availability` accordingly (and keep the program so users learn it exists, unless it is long gone and irrelevant).
4. Set `lastVerified` to the date you read the page (today: see system time, format `YYYY-MM-DD`).
5. **Missing answer = UNKNOWN, never FAIL.** Use helpers in `src/engine/helpers.ts` — they return `undefined` when an answer is missing, and `req()` turns `undefined` into an "unknown" check.
6. Mark failures the person can realistically fix with `fixable: true` (language score, ECA, funds, getting a job offer). Things like age, citizenship or past history are not fixable.
7. **Plain language.** `summary`, check `label`s and `detail`s must be understandable by a non-expert. Explain acronyms the first time (e.g. "LMIA (Labour Market Impact Assessment)").
8. Tailor `detail` text to the user's answer when possible (e.g. "You said CLB 6; this program needs CLB 7").
9. Use `appliesTo` to hide programs that are irrelevant (e.g. hide visitor visa for Canadian citizens; hide "sponsor your parents" from people whose children aren't Canadian…). Be careful: when in doubt, show it and let checks explain.
10. Add `admissibilityChecks(p)` from helpers to the checks of most programs (spread it at the end).
11. **Unique situations matter.** Think about: refugees/temporary protection holders in third countries (e.g. Syrians in Türkiye, Afghans in Pakistan/Iran, Sudanese in Egypt, Rohingya, Palestinians), stateless people, people already in Canada with various statuses, out-of-status people, dual citizens, people whose passport is expired/unavailable, people applying from a country that isn't their own, people with US status, minors. Add notes/warnings for them where the official pages give specific guidance (e.g. where to apply, document alternatives, special public policies).

## Files
- Program files: `src/data/programs/<name>.ts` exporting a `Program[]` (already stubbed — fill them).
- Extra survey questions: `src/survey/extra/<name>.ts` exporting a `Question[]` (see `src/survey/types.ts`).
  - Only add a question if no existing `Profile` field covers it. **All `Profile` fields in `src/engine/types.ts` are asked by the core survey** (conditionally).
  - Use id `extra.<camelCaseName>` and read it with `extra<T>(p, 'camelCaseName')`.
  - Prefer `single`/`multi` multiple-choice. Use `showIf` so the question only appears for relevant people. Put them in the most relevant `section` (or `'special'`).
  - Keep it lean (aim ≤ 6 extra questions per file).
- **Do not edit any other file** (other agents are working in parallel). If you believe a shared type needs changing, say so in your final report instead.

## Program shape (see `src/engine/types.ts`)
```ts
import type { Program } from '../../engine/types';
import { req, info, warn, minCLB, ageBetween, admissibilityChecks, canadaStatus, tri } from '../../engine/helpers';

export const examplePrograms: Program[] = [
  {
    id: 'example-program',
    name: 'Example Program',
    category: 'work',
    kind: 'temporary',
    summary: 'A short, plain explanation of what this is and who it is for.',
    goals: ['work'],
    officialUrl: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/....html',
    links: [
      { label: 'Who can apply', url: 'https://www.canada.ca/...' },
      { label: 'How to apply', url: 'https://www.canada.ca/...' },
    ],
    availability: 'open',
    steps: ['Step 1 …', 'Step 2 …'],
    fees: 'CAD 155 + CAD 85 biometrics',
    processingTime: 'Varies by country — see official processing times tool',
    discretionary: true,
    lastVerified: '2026-10-15',
    appliesTo: (p) => canadaStatus(p) !== 'citizen',
    evaluate: (p) => ({
      checks: [
        req('Age 18–35', ageBetween(p, 18, 35), { fail: `You are ${p.age}; this program is for ages 18–35.` }),
        req('CLB 5 in English or French', minCLB(p, 5), { fixable: true, fail: 'Improve your test score to at least CLB 5.' }),
        ...admissibilityChecks(p),
      ],
      notes: ['Tailored tip…'],
    }),
  },
];
```
Status is derived automatically: any non-fixable `fail` → not eligible; only fixable fails → "close"; any `unknown` → "possible"; else eligible. `info`/`warn` checks don't affect status. You can force `status` in the returned object if needed.

## Before finishing
- Run `npx tsc --noEmit` in `canada-pathfinder/` and fix errors in YOUR files (ignore errors clearly caused by other agents' in-progress files).
- Final report (your last message): list of programs added (id + name + availability), extra questions added, any official facts you were unsure about, and suggested changes to shared types (if any).
