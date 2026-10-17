/**
 * Canadian Citizenship & Proof of Citizenship Programs
 * Official Source (Verified October 2026): IRCC Canadian Citizenship
 * - Proof of Citizenship: https://www.canada.ca/en/immigration-refugees-citizenship/services/canadian-citizenship/proof-citizenship/about.html
 * - Apply for Citizenship (Adults & Minors): https://www.canada.ca/en/immigration-refugees-citizenship/services/canadian-citizenship/adult-minor.html
 */

import type { Program } from '../../engine/types';
import {
  req,
  pass,
  canadaStatus,
  minCLB,
  admissibilityChecks,
} from '../../engine/helpers';

export const citizenshipPrograms: Program[] = [
  // ──────────────────────── 1. CITIZENSHIP BY DESCENT (PROOF OF CITIZENSHIP) ────────────────────────
  {
    id: 'citizenship-descent',
    name: 'Claim Canadian Citizenship by Descent (Proof of Citizenship Certificate)',
    category: 'citizenship',
    kind: 'citizenship',
    summary:
      'If at least one of your biological or legal parents was a Canadian citizen when you were born, you may already be a Canadian citizen by law. Under the updated Citizenship Act (effective December 15, 2025), individuals born outside Canada before Dec 15, 2025 to a Canadian parent are eligible even beyond the first generation, while those born on or after Dec 15, 2025 to a Canadian parent born abroad require their parent to have 1,095 days of physical presence in Canada before their birth.',
    goals: ['citizenship', 'permanent'],
    officialUrl:
      'https://www.canada.ca/en/immigration-refugees-citizenship/services/canadian-citizenship/proof-citizenship/about.html',
    links: [
      {
        label: 'Proof of Citizenship — Who Can Apply (Dec 15, 2025 Rules)',
        url: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/canadian-citizenship/proof-citizenship/eligibility.html',
      },
    ],
    availability: 'open',
    steps: [
      'Gather your official long-form birth certificate showing your Canadian parent\'s name',
      'Gather proof of your parent\'s Canadian citizenship (Canadian birth certificate or citizenship certificate)',
      'Submit an application for a Canadian Citizenship Certificate (Proof of Citizenship) online or on paper',
      'Once issued, apply directly for a Canadian passport',
    ],
    fees: 'CAD $75',
    processingTime: 'Around 3 to 6 months',
    discretionary: false,
    lastVerified: '2026-10-16',
    appliesTo: (p) => p.parentCanadian === 'yes' || p.grandparentCanadian === 'yes' || p.bornInCanada === 'yes',
    evaluate: (p) => {
      const parentIsCanadian = p.parentCanadian === 'yes' || p.grandparentCanadian === 'yes';
      const parentType = p.parentCitizenshipType;
      const isBornInCaOrNat = parentType === 'born_in_canada' || parentType === 'naturalized';
      const isAdultOrBornBeforeDec2025 = (p.age ?? 20) >= 1;

      const checks = [
        req(
          'Biological or legal parent was a Canadian citizen at the time of your birth',
          p.parentCanadian !== undefined ? parentIsCanadian : undefined,
          {
            pass: 'You indicated a Canadian citizen parent (or grandparent through whom your parent derived citizenship).',
            fail: 'Requires at least one biological or legal parent who was a Canadian citizen when you were born.',
          },
        ),

        isBornInCaOrNat || isAdultOrBornBeforeDec2025
          ? pass(
              'December 15, 2025 Citizenship by Descent Rule',
              isBornInCaOrNat
                ? 'Your Canadian parent was born in Canada or naturalized before your birth.'
                : 'Because you were born before December 15, 2025, the former first-generation limit no longer bars your claim to citizenship by descent.',
            )
          : req(
              'Parent\'s 1,095-day physical presence in Canada (for births on/after Dec 15, 2025 to a parent born abroad)',
              undefined,
              {
                unknown: 'For children born outside Canada on or after December 15, 2025 to a Canadian parent who was also born outside Canada, the parent must prove 1,095 days of physical presence in Canada prior to the child\'s birth.',
              },
            ),

        ...admissibilityChecks(p),
      ];

      return { checks };
    },
  },

  // ──────────────────────── 2. GRANT OF CITIZENSHIP FOR PERMANENT RESIDENTS ────────────────────────
  {
    id: 'citizenship-grant',
    name: 'Grant of Canadian Citizenship (Naturalization for Permanent Residents)',
    category: 'citizenship',
    kind: 'citizenship',
    summary:
      'For Canadian Permanent Residents who have lived physically in Canada for at least 1,095 days (3 years) during the 5 years before applying, filed Canadian income taxes (if required), and passed language (CLB 4) and citizenship knowledge requirements (if aged 18–54).',
    goals: ['citizenship'],
    officialUrl:
      'https://www.canada.ca/en/immigration-refugees-citizenship/services/canadian-citizenship/adult-minor.html',
    links: [
      {
        label: 'Apply for Canadian Citizenship: Adults and Minor Children',
        url: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/canadian-citizenship/adult-minor.html',
      },
    ],
    availability: 'open',
    steps: [
      'Hold valid Permanent Resident (PR) status in Canada',
      'Accumulate at least 1,095 days of physical presence in Canada within the last 5 years',
      'File Canadian income taxes for at least 3 tax years within the 5-year period',
      'Prove CLB/NCLC 4 speaking and listening and pass the Canadian citizenship test (if aged 18–54)',
      'Take the Oath of Citizenship',
    ],
    fees: 'CAD $649.75 per adult (CAD $530 processing + CAD $119.75 right of citizenship fee); CAD $100 for minors under 18',
    processingTime: 'Around 7 to 10 months',
    discretionary: false,
    lastVerified: '2026-10-16',
    appliesTo: (p) => canadaStatus(p) === 'permanent_resident' || p.goals?.includes('citizenship') === true,
    evaluate: (p) => {
      const isPR = canadaStatus(p) === 'permanent_resident';
      const hasExp = (p.canadianExpYears ?? 0) >= 3;
      const age = p.age ?? 30;
      const isLanguageExempt = age < 18 || age >= 55;
      const meetsLanguage = isLanguageExempt || minCLB(p, 4, 'either') === true;

      const checks = [
        req('Hold Canadian Permanent Resident (PR) status', isPR ? true : p.canadaStatus !== undefined ? false : undefined, {
          pass: 'You are a Canadian Permanent Resident.',
          fail: 'Naturalization requires holding Canadian Permanent Resident (PR) status first.',
        }),

        req('Physical presence in Canada for at least 1,095 days (3 years) in the past 5 years', hasExp ? true : undefined, {
          pass: 'You indicated 3+ years of presence in Canada.',
          unknown: 'You must document at least 1,095 days of physical presence in Canada within the 5 years immediately before your application.',
          fail: 'Requires at least 1,095 days physically in Canada in the last 5 years.',
        }),

        req('Language benchmark of at least CLB/NCLC 4 in speaking & listening (if aged 18 to 54)', meetsLanguage),
        ...admissibilityChecks(p),
      ];

      return { checks };
    },
  },
];
