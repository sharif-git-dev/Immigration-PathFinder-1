import type { Category, Check, EvalResult, Goal, Profile, Program, Status } from './types';
import { ALL_PROGRAMS } from '../data/programs';

export interface Outcome {
  program: Program;
  status: Status;
  result: EvalResult;
  /** True if the program serves one of the user's selected goals. */
  matchesGoal: boolean;
}

export const STATUS_RANK: Record<Status, number> = {
  eligible: 0,
  possible: 1,
  close: 2,
  not_eligible: 3,
};

export const STATUS_LABEL: Record<Status, string> = {
  eligible: 'Meets Baseline Criteria (Selective / Draw-Based)',
  possible: 'Potentially Eligible (Unverified Details)',
  close: 'Does Not Meet Criteria (Fixable Gaps)',
  not_eligible: 'Does Not Meet Criteria',
};

export const CATEGORY_LABEL: Record<Category, string> = {
  citizenship: 'Citizenship',
  express_entry: 'Express Entry (PR)',
  provincial: 'Provincial Streams (PNP & Quebec)',
  economic: 'Federal Economic PR Streams',
  family: 'Family Sponsorship',
  refugee: 'Refugee Protection',
  humanitarian: 'Humanitarian & Special Policies',
  work: 'Work Permits',
  study: 'Study Permits',
  visit: 'Visiting & Travel',
};

export function deriveStatus(checks: Check[]): Status {
  const fails = checks.filter((c) => c.result === 'fail');
  if (fails.some((c) => !c.fixable)) return 'not_eligible';
  if (fails.length > 0) return 'close';
  if (checks.some((c) => c.result === 'unknown')) return 'possible';
  return 'eligible';
}

export function normalizeProfile(input: Profile): Profile {
  const p: Profile = { ...input };
  if (p.residenceCountry && p.residenceCountry !== 'CA') {
    p.canadaStatus = 'not_in_canada';
    if (!p.residenceStatus && p.citizenships?.includes(p.residenceCountry)) p.residenceStatus = 'citizen';
  }
  if (p.citizenships?.includes('CA')) p.canadaStatus = p.residenceCountry === 'CA' ? 'citizen' : p.canadaStatus;
  if (p.usStatus === undefined && p.citizenships?.includes('US')) p.usStatus = 'us_citizen';
  return p;
}

export function evaluateAll(input: Profile, programs: Program[] = ALL_PROGRAMS): Outcome[] {
  const p = normalizeProfile(input);
  const goals: Goal[] = p.goals ?? [];
  const out: Outcome[] = [];

  for (const program of programs) {
    try {
      if (program.appliesTo && !program.appliesTo(p)) continue;
      const result = program.evaluate(p);
      const isClosedOrPaused = program.availability === 'closed' || program.availability === 'paused';
      const status: Status = isClosedOrPaused ? 'not_eligible' : (result.status ?? deriveStatus(result.checks));
      const matchesGoal = goals.length === 0 || program.goals.some((g) => goals.includes(g));
      out.push({ program, status, result, matchesGoal });
    } catch (err) {
      out.push({
        program,
        status: 'possible',
        matchesGoal: true,
        result: {
          checks: [
            {
              label: 'Could not evaluate automatically',
              result: 'unknown',
              detail: `Please check the official page. (${(err as Error).message})`,
            },
          ],
        },
      });
    }
  }

  const availPenalty = (o: Outcome) =>
    o.program.availability === 'closed' ? 3 : o.program.availability === 'paused' ? 2 : 0;

  out.sort(
    (a, b) =>
      availPenalty(a) - availPenalty(b) ||
      Number(b.matchesGoal) - Number(a.matchesGoal) ||
      STATUS_RANK[a.status] - STATUS_RANK[b.status] ||
      a.program.name.localeCompare(b.program.name),
  );
  return out;
}
