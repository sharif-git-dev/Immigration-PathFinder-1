/**
 * Helpers for writing program rules. Every helper that reads an answer returns
 * `undefined` when the answer is missing, so rules can produce an UNKNOWN check
 * instead of wrongly failing the person.
 */
import type {
  CanadaStatus,
  Check,
  Education,
  Goal,
  HistoryItem,
  Profile,
  Province,
  Relative,
  Tri,
} from './types';
import { getCountry } from '../data/countries';

// ───────────── Check builders ─────────────

export const pass = (label: string, detail?: string): Check => ({ label, result: 'pass', detail });
export const fail = (label: string, detail?: string, fixable = false): Check => ({
  label,
  result: 'fail',
  detail,
  fixable,
});
export const unknown = (label: string, detail?: string): Check => ({ label, result: 'unknown', detail });
export const info = (label: string, detail?: string): Check => ({ label, result: 'info', detail });
export const warn = (label: string, detail?: string): Check => ({ label, result: 'warn', detail });

/**
 * Turn a tri-state condition into a check.
 *   true → pass, false → fail, undefined → unknown
 */
export function req(
  label: string,
  cond: boolean | undefined,
  d: { pass?: string; fail?: string; unknown?: string; fixable?: boolean } = {},
): Check {
  if (cond === true) return pass(label, d.pass);
  if (cond === false) return fail(label, d.fail, d.fixable ?? false);
  return unknown(label, d.unknown ?? 'You did not answer this question (or chose "not sure").');
}

// ───────────── Tri-state logic ─────────────

/** 'yes' → true, 'no' → false, 'unsure'/undefined → undefined */
export function tri(v: Tri | undefined): boolean | undefined {
  if (v === 'yes') return true;
  if (v === 'no') return false;
  return undefined;
}

/** Logical AND over tri-state values (false wins, then undefined). */
export function and(...vals: (boolean | undefined)[]): boolean | undefined {
  if (vals.some((v) => v === false)) return false;
  if (vals.some((v) => v === undefined)) return undefined;
  return true;
}

/** Logical OR over tri-state values (true wins, then undefined). */
export function or(...vals: (boolean | undefined)[]): boolean | undefined {
  if (vals.some((v) => v === true)) return true;
  if (vals.some((v) => v === undefined)) return undefined;
  return false;
}

export function not(v: boolean | undefined): boolean | undefined {
  return v === undefined ? undefined : !v;
}

// ───────────── Identity / location ─────────────

/** True if the person holds ANY of the given citizenships (ISO2). */
export function hasCitizenship(p: Profile, ...codes: string[]): boolean | undefined {
  if (!p.citizenships || p.citizenships.length === 0) return undefined;
  return p.citizenships.some((c) => codes.includes(c));
}

export function isStateless(p: Profile): boolean | undefined {
  if (!p.citizenships || p.citizenships.length === 0) return undefined;
  return p.citizenships.includes('XX');
}

/** True if the person is physically in Canada. */
export function inCanada(p: Profile): boolean | undefined {
  if (p.residenceCountry === undefined) return undefined;
  return p.residenceCountry === 'CA';
}

/** Status in Canada ('not_in_canada' when living elsewhere). */
export function canadaStatus(p: Profile): CanadaStatus | undefined {
  if (p.residenceCountry === undefined) return undefined;
  if (p.residenceCountry !== 'CA') return 'not_in_canada';
  return p.canadaStatus;
}

export function isCanadaStatus(p: Profile, ...statuses: CanadaStatus[]): boolean | undefined {
  const s = canadaStatus(p);
  if (s === undefined) return undefined;
  return statuses.includes(s);
}

/** Already a Canadian citizen or PR → most immigration programs don't apply. */
export function alreadyCitizenOrPR(p: Profile): boolean {
  return hasCitizenship(p, 'CA') === true || canadaStatus(p) === 'citizen' || canadaStatus(p) === 'permanent_resident';
}

/**
 * Does the person need a visitor visa (TRV)? Uses the best of their citizenships.
 *   'none'           → US citizen (no visa, no eTA)
 *   'eta'            → visa-exempt, eTA needed to fly
 *   'eta_conditional'→ visa-required BUT may use an eTA when flying if conditions are met
 *   'visa'           → visitor visa required
 */
export function entryRequirement(p: Profile): 'none' | 'eta' | 'eta_conditional' | 'visa' | undefined {
  if (!p.citizenships || p.citizenships.length === 0) return undefined;
  const rank = { none: 0, eta: 1, eta_conditional: 2, visa: 3 } as const;
  let best: keyof typeof rank = 'visa';
  for (const code of p.citizenships) {
    const c = getCountry(code);
    const e = c?.entry ?? 'visa';
    if (rank[e] < rank[best]) best = e;
  }
  return best;
}

// ───────────── Age / language / education ─────────────

export function ageBetween(p: Profile, min: number, max: number): boolean | undefined {
  if (p.age === undefined) return undefined;
  return p.age >= min && p.age <= max;
}

export function clb(p: Profile, lang: 'en' | 'fr'): number | undefined {
  return lang === 'en' ? p.englishCLB : p.frenchCLB;
}

/** Highest CLB across English/French (undefined if neither answered). */
export function bestCLB(p: Profile): number | undefined {
  const vals = [p.englishCLB, p.frenchCLB].filter((v): v is number => typeof v === 'number');
  return vals.length ? Math.max(...vals) : undefined;
}

/** Meets a minimum CLB in the given language ('either' = English OR French). */
export function minCLB(p: Profile, min: number, lang: 'en' | 'fr' | 'either' = 'either'): boolean | undefined {
  if (lang === 'either') {
    return or(
      p.englishCLB === undefined ? undefined : p.englishCLB >= min,
      p.frenchCLB === undefined ? undefined : p.frenchCLB >= min,
    );
  }
  const v = clb(p, lang);
  return v === undefined ? undefined : v >= min;
}

export const EDU_ORDER: Education[] = [
  'none',
  'secondary',
  'one_year',
  'two_year',
  'bachelors',
  'two_or_more',
  'masters',
  'professional',
  'phd',
];

export function educationAtLeast(p: Profile, level: Education): boolean | undefined {
  if (p.education === undefined) return undefined;
  return EDU_ORDER.indexOf(p.education) >= EDU_ORDER.indexOf(level);
}

// ───────────── Family ─────────────

export function hasRelative(p: Profile, ...rels: Relative[]): boolean | undefined {
  if (p.relativesCitizenPR === undefined) return undefined;
  return p.relativesCitizenPR.some((r) => rels.includes(r));
}

export function hasTemporaryRelative(p: Profile, ...rels: Relative[]): boolean | undefined {
  if (p.relativesTemporary === undefined) return undefined;
  return p.relativesTemporary.some((r) => rels.includes(r));
}

export function relativeInProvince(p: Profile, ...provs: Province[]): boolean | undefined {
  if (p.relativesProvinces === undefined) return undefined;
  return p.relativesProvinces.some((r) => provs.includes(r));
}

export function isPartnered(p: Profile): boolean | undefined {
  if (p.maritalStatus === undefined) return undefined;
  return ['married', 'common_law', 'conjugal'].includes(p.maritalStatus);
}

/** Has a spouse/common-law/conjugal partner who is a Canadian citizen or PR. */
export function partnerIsCanadian(p: Profile): boolean | undefined {
  const partnered = isPartnered(p);
  if (partnered === false) return false;
  if (p.spouseStatus === undefined) return partnered === undefined ? undefined : undefined;
  return and(partnered, p.spouseStatus === 'citizen' || p.spouseStatus === 'pr');
}

/** You + accompanying spouse + dependent children. */
export function familySize(p: Profile): number | undefined {
  if (p.familySize !== undefined) return p.familySize;
  if (p.maritalStatus === undefined && p.dependentChildren === undefined) return undefined;
  const spouse = isPartnered(p) && p.spouseAccompanying !== 'no' ? 1 : 0;
  return 1 + spouse + (p.dependentChildren ?? 0);
}

// ───────────── Goals / history ─────────────

export function hasGoal(p: Profile, ...goals: Goal[]): boolean {
  return (p.goals ?? []).some((g) => goals.includes(g));
}

export function hasHistory(p: Profile, ...items: HistoryItem[]): boolean | undefined {
  if (p.history === undefined) return undefined;
  return p.history.some((h) => items.includes(h));
}

export function wantsProvince(p: Profile, prov: Province): boolean | undefined {
  if (!p.preferredProvinces || p.preferredProvinces.length === 0) return undefined;
  return p.preferredProvinces.includes('any') || p.preferredProvinces.includes(prov);
}

/** Read an extra (program-specific) answer. */
export function extra<T = string>(p: Profile, id: string): T | undefined {
  return p.extra?.[id] as T | undefined;
}

// ───────────── Common admissibility checks ─────────────

/**
 * Standard admissibility warnings shared by most programs (criminality, medical,
 * misrepresentation, prior removal). These are warnings, not hard failures,
 * because outcomes depend on details (rehabilitation, waivers, time passed).
 */
export function admissibilityChecks(p: Profile): Check[] {
  const out: Check[] = [];
  if (p.criminality === 'serious') {
    out.push(
      warn(
        'Criminal admissibility',
        'A serious criminal record can make you inadmissible to Canada. You may need criminal rehabilitation or a Temporary Resident Permit — get professional advice.',
      ),
    );
  } else if (p.criminality === 'minor') {
    out.push(
      warn(
        'Criminal admissibility',
        'Even minor offences (including impaired driving) can cause inadmissibility. Check whether you are "deemed rehabilitated" or need to apply for rehabilitation.',
      ),
    );
  }
  if (p.medical === 'condition') {
    out.push(
      warn(
        'Medical admissibility',
        'A medical exam may be required. Conditions that are a danger to public health/safety or would cause excessive demand on health services can lead to refusal (some family and refugee classes are exempt from excessive demand).',
      ),
    );
  }
  if (p.history?.includes('misrepresentation')) {
    out.push(
      fail(
        'No misrepresentation finding in the last 5 years',
        'A misrepresentation finding bars you from applying for 5 years.',
      ),
    );
  }
  if (p.history?.includes('removed_from_canada')) {
    out.push(
      warn(
        'Prior removal from Canada',
        'If you were deported or removed, you may need an Authorization to Return to Canada (ARC) before you can come back.',
      ),
    );
  }
  return out;
}
