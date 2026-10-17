/**
 * Humanitarian & Compassionate (H&C) and Special Public Policy Measures
 * Official Source (Verified October 2026): IRCC Humanitarian and Compassionate Grounds
 * https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada.html
 */

import type { Program } from '../../engine/types';
import {
  req,
  pass,
  fail,
  warn,
  info,
  hasCitizenship,
  admissibilityChecks,
  alreadyCitizenOrPR,
} from '../../engine/helpers';

export const humanitarianPrograms: Program[] = [
  // ──────────────────────── 1. HUMANITARIAN & COMPASSIONATE (H&C) ────────────────────────
  {
    id: 'hc-pr',
    name: 'Humanitarian and Compassionate Considerations (H&C — Section 25 IRPA)',
    category: 'humanitarian',
    kind: 'permanent',
    summary:
      'An exceptional discretionary measure primarily for individuals already living inside Canada who do not qualify under any standard immigration stream, have strong establishment in Canada, and would face unusual and disproportionate hardship if forced to leave.',
    goals: ['permanent', 'protection'],
    officialUrl:
      'https://www.canada.ca/en/immigration-refugees-citizenship/services/application/application-forms-guides/guide-5291-humanitarian-compassionate-considerations.html',
    links: [
      {
        label: 'Official Guide 5291: Humanitarian & Compassionate Considerations',
        url: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/application/application-forms-guides/guide-5291-humanitarian-compassionate-considerations.html',
      },
    ],
    availability: 'open',
    availabilityNote: 'Exceptional, discretionary relief — not a routine immigration pathway.',
    steps: [
      'Must be physically inside Canada with documented long-term establishment (employment, community integration, family ties)',
      'Provide objective evidence of unusual, undeserved, or disproportionate hardship upon return',
      'Document the Best Interests of any Child (BIOC) directly affected by the decision',
      'Submit H&C application online via the Permanent Residence Portal',
    ],
    fees: 'CAD $1,210 per adult applicant (processing + right of permanent residence fee)',
    processingTime: 'Around 20 to 36+ months',
    discretionary: true,
    lastVerified: '2026-10-16',
    appliesTo: (p) => !alreadyCitizenOrPR(p),
    evaluate: (p) => {
      const isInside = p.residenceCountry === undefined ? undefined : p.residenceCountry === 'CA';
      const hasChildren = (p.dependentChildren ?? 0) > 0;

      const checks = [
        req('Physically present and established inside Canada', isInside, {
          pass: 'You are living inside Canada.',
          fail: 'Under IRCC Guide 5291, Humanitarian and Compassionate (H&C) applications are designed for people already living inside Canada who would face exceptional hardship if required to leave.',
          fixable: false,
        }),

        warn(
          'Exceptional & Discretionary Assessment (Plus 12-Month Bar After Refused Asylum Claim)',
          'H&C is an exceptional discretionary remedy, not a standard immigration program. Also, you cannot apply for H&C if you have a pending refugee claim or if less than 12 months have passed since a negative IRB refugee decision (unless a child\'s best interests or a life-threatening medical risk applies).',
        ),

        hasChildren
          ? pass('Best Interests of the Child (BIOC)', 'You have dependent children; officers are legally required to examine the best interests of any child directly affected.')
          : info('Best Interests of the Child (BIOC)', 'If children are directly affected, their welfare carries significant weight in an H&C assessment.'),

        ...admissibilityChecks(p),
      ];

      return {
        checks,
        notes: [
          'Important: Submitting an H&C application does NOT grant temporary legal status in Canada and does NOT stop an enforceable removal order.',
        ],
      };
    },
  },

  // ──────────────────────── 2. AMERICAS HUMANITARIAN PATHWAY (CLOSED) ────────────────────────
  {
    id: 'hc-americas',
    name: 'Family-Based Humanitarian Pathway for Colombian, Haitian, and Venezuelan Nationals (Closed)',
    category: 'humanitarian',
    kind: 'permanent',
    summary:
      'Officially CLOSED by IRCC after reaching its intake cap. IRCC is no longer accepting applications under this temporary public policy.',
    goals: ['permanent', 'protection', 'join_family'],
    officialUrl:
      'https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada.html',
    links: [
      {
        label: 'IRCC Programs That Are Paused or Closed',
        url: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada.html',
      },
    ],
    availability: 'closed',
    availabilityNote: 'Status on Canada.ca: Closed (intake cap reached).',
    steps: ['Program is closed to new applications'],
    fees: 'N/A (Closed)',
    processingTime: 'N/A',
    discretionary: false,
    lastVerified: '2026-10-16',
    appliesTo: (p) =>
      !alreadyCitizenOrPR(p) &&
      hasCitizenship(p, 'CO', 'HT', 'VE') === true,
    evaluate: (p) => {
      const checks = [
        fail(
          'Program Status: Closed by IRCC',
          'According to Canada.ca, the family-based humanitarian pathway for Colombian, Haitian, and Venezuelan nationals is officially closed after reaching its application cap.',
          false,
        ),
        ...admissibilityChecks(p),
      ];

      return { checks };
    },
  },

  // ──────────────────────── 3. SUDAN CRISIS FAMILY PATHWAY (CLOSED) ────────────────────────
  {
    id: 'hc-sudan',
    name: 'Family-Based Permanent Residence Pathway for People Affected by the Conflict in Sudan (Closed)',
    category: 'humanitarian',
    kind: 'permanent',
    summary:
      'Officially CLOSED by IRCC on Canada.ca after reaching its intake cap. No new applications are being accepted under this temporary public policy.',
    goals: ['permanent', 'protection', 'join_family'],
    officialUrl:
      'https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada.html',
    links: [
      {
        label: 'IRCC Programs That Are Paused or Closed',
        url: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada.html',
      },
    ],
    availability: 'closed',
    availabilityNote: 'Status on Canada.ca (updated October 2026): Closed.',
    steps: ['Program is closed to new applications'],
    fees: 'N/A (Closed)',
    processingTime: 'N/A',
    discretionary: false,
    lastVerified: '2026-10-16',
    appliesTo: (p) => !alreadyCitizenOrPR(p) && hasCitizenship(p, 'SD') === true,
    evaluate: (p) => {
      const checks = [
        fail(
          'Program Status: Closed by IRCC',
          'According to Canada.ca (Live in Canada permanently — Programs that are paused or closed), the pathway for people affected by the conflict in Sudan is officially closed to new applications.',
          false,
        ),
        ...admissibilityChecks(p),
      ];

      return { checks };
    },
  },
];
