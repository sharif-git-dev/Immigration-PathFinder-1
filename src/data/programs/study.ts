/**
 * Study in Canada Programs
 * Official Source (Verified October 2026): IRCC Study in Canada as an International Student
 * https://www.canada.ca/en/immigration-refugees-citizenship/services/study-canada/study-permit.html
 * Financial Support Table (Effective Sept 1, 2026):
 * https://www.canada.ca/en/immigration-refugees-citizenship/services/study-canada/study-permit/get-documents/financial-support.html
 */

import type { Program } from '../../engine/types';
import {
  req,
  warn,
  familySize,
  admissibilityChecks,
  alreadyCitizenOrPR,
} from '../../engine/helpers';

/** Official IRCC Study Permit Living Expenses Table (Effective September 1, 2026, outside Quebec, excluding tuition & travel) */
function getStudyLivingFundsRequired(famSize: number): number {
  if (famSize <= 1) return 23448;
  if (famSize === 2) return 29192;
  if (famSize === 3) return 35888;
  if (famSize === 4) return 43572;
  if (famSize === 5) return 49419;
  if (famSize === 6) return 55736;
  if (famSize === 7) return 62054;
  return 62054 + (famSize - 7) * 6318;
}

export const studyPrograms: Program[] = [
  // ──────────────────────── 1. STUDY PERMIT (POST-SECONDARY) ────────────────────────
  {
    id: 'study-permit',
    name: 'Study Permit (Post-Secondary College & University)',
    category: 'study',
    kind: 'temporary',
    summary:
      'Authorization to study at a Designated Learning Institution (DLI) in Canada. Requires a Letter of Acceptance, a Provincial/Territorial Attestation Letter (PAL/TAL — exempt for Master\'s and PhD degrees at public DLIs), and proof of living expenses (CAD $23,448+ for a single student as of Sept 1, 2026) on top of first-year tuition.',
    goals: ['study'],
    officialUrl:
      'https://www.canada.ca/en/immigration-refugees-citizenship/services/study-canada/study-permit.html',
    links: [
      {
        label: 'Proof of Financial Support (Updated Sept 1, 2026: $23,448+)',
        url: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/study-canada/study-permit/get-documents/financial-support.html',
      },
      {
        label: 'Provincial or Territorial Attestation Letter (PAL/TAL) Rules',
        url: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/study-canada/study-permit/get-documents/provincial-attestation-letter.html',
      },
      {
        label: 'Post-Graduation Work Permit (PGWP) Eligibility Rules',
        url: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/study-canada/work/after-graduation/eligibility.html',
      },
    ],
    availability: 'limited',
    availabilityNote: 'Subject to Canada\'s annual international student intake cap; undergraduate/college applicants require a PAL/TAL, while Master\'s and Doctoral degree students at public DLIs are exempt from PAL/TAL.',
    steps: [
      'Obtain an official Letter of Acceptance (LOA) from a Canadian Designated Learning Institution (DLI)',
      'Obtain a Provincial/Territorial Attestation Letter (PAL/TAL) if required for your study level',
      'Prepare proof of financial support: CAD $23,448+ (single student living expenses as of Sept 1, 2026) PLUS first-year tuition and travel costs',
      'Submit your study permit application online to IRCC',
    ],
    fees: 'CAD $150 study permit fee (+ CAD $85 biometrics)',
    processingTime: 'Around 6 to 12 weeks outside Canada',
    discretionary: true,
    lastVerified: '2026-10-16',
    appliesTo: (p) => !alreadyCitizenOrPR(p) && (p.goals === undefined || p.goals.length === 0 || p.goals.includes('study') || p.studyPlan !== 'none'),
    evaluate: (p) => {
      const isMasterOrPhd = p.studyLevel === 'masters' || p.studyLevel === 'phd';
      const hasAccepted = p.studyPlan === 'accepted_dli' || p.studyPlan === 'accepted_with_pal';
      const famSize = familySize(p) ?? 1;
      const minLivingFunds = getStudyLivingFundsRequired(famSize);
      // Realistic minimum including modest first-year tuition (~$15,000) is higher, but we check living expenses + note tuition
      const checks = [
        req(
          'Official Letter of Acceptance (LOA) from a Designated Learning Institution (DLI)',
          hasAccepted ? true : p.studyPlan === 'considering' ? undefined : p.studyPlan === 'none' ? false : undefined,
          {
            fixable: true,
            pass: 'You hold a Letter of Acceptance from a Canadian DLI.',
            unknown: 'You must first apply to and receive an official Letter of Acceptance (LOA) from a Canadian Designated Learning Institution (DLI).',
            fail: 'A study permit requires an official Letter of Acceptance from a Canadian DLI.',
          },
        ),

        req(
          'Provincial/Territorial Attestation Letter (PAL/TAL) or Graduate Degree Exemption',
          isMasterOrPhd
            ? true
            : p.studyPlan === 'accepted_with_pal'
              ? true
              : p.studyPlan === 'accepted_dli'
                ? false
                : undefined,
          {
            fixable: true,
            pass: isMasterOrPhd
              ? 'Master\'s and Doctoral degree students at public DLIs are exempt from the PAL/TAL requirement.'
              : 'You have secured a Provincial/Territorial Attestation Letter (PAL/TAL).',
            unknown: 'College and undergraduate applicants must obtain a PAL/TAL from their province before applying (Master\'s and PhD students at public DLIs are exempt).',
            fail: 'College and undergraduate study permit applications submitted without a required PAL/TAL are returned unprocessed by IRCC.',
          },
        ),

        req(
          `Proof of living expenses of at least CAD $${minLivingFunds.toLocaleString()} (family of ${famSize}, effective Sept 1, 2026) — plus 1st-year tuition`,
          p.fundsCAD !== undefined ? p.fundsCAD >= minLivingFunds : undefined,
          {
            fixable: true,
            pass: `Your reported funds (CAD $${p.fundsCAD?.toLocaleString()}) cover the minimum CAD $${minLivingFunds.toLocaleString()} living expense threshold (ensure you also have funds or a receipt for first-year tuition).`,
            fail: `Effective September 1, 2026, IRCC requires at least CAD $${minLivingFunds.toLocaleString()} for living expenses alone for a family of ${famSize} (up from $22,895), IN ADDITION to first-year tuition and travel costs.`,
          },
        ),

        warn(
          'Temporary Resident Intent & Post-Graduation Work Permit (PGWP) Rules',
          'Officers assess your ties to your country of residence and bona fide student intent. Also note: Bachelor\'s/Master\'s/PhD graduates need CLB 7 for a PGWP, while college graduates need CLB 5 AND must graduate from an eligible shortage field of study.',
        ),

        ...admissibilityChecks(p),
      ];

      return { checks };
    },
  },

  // ──────────────────────── 2. SHORT-TERM STUDY (NO PERMIT NEEDED) ────────────────────────
  {
    id: 'study-short-term',
    name: 'Short-Term Course or Program (6 Months or Less — Study Permit Exempt)',
    category: 'study',
    kind: 'temporary',
    summary:
      'Courses or programs lasting 6 months or less that will be completed within your authorized visitor stay do not require a study permit. However, you still need a valid Visitor Visa (TRV) or eTA to enter Canada, and short-term study does not allow off-campus work or a PGWP.',
    goals: ['study'],
    officialUrl:
      'https://www.canada.ca/en/immigration-refugees-citizenship/services/study-canada/study-permit.html',
    links: [
      {
        label: 'Study Permit Exemptions (Short-Term Studies)',
        url: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/study-canada/study-permit.html',
      },
    ],
    availability: 'open',
    steps: [
      'Enroll in a standalone course of 6 months or less (not a prerequisite or module of a longer program)',
      'Obtain a Visitor Visa (TRV) or Electronic Travel Authorization (eTA) to enter Canada',
      'Complete the course before your authorized visitor stay expires',
    ],
    fees: 'CAD $100 Visitor Visa or CAD $7 eTA',
    processingTime: 'Varies by country (Visitor Visa / eTA processing time)',
    discretionary: true,
    lastVerified: '2026-10-16',
    appliesTo: (p) => !alreadyCitizenOrPR(p) && p.goals?.includes('study') === true,
    evaluate: (p) => {
      const checks = [
        warn(
          'Program Must Be 6 Months or Less & Visitor Visa (TRV) / eTA Still Required',
          'While a study permit is not needed for a course of 6 months or less, you must still qualify for a Visitor Visa (TRV) or eTA, prove sufficient funds and home-country ties, and you cannot work in Canada or qualify for a PGWP.',
        ),
        ...admissibilityChecks(p),
      ];
      return { checks };
    },
  },

  // ──────────────────────── 3. MINOR CHILDREN STUDYING IN CANADA ────────────────────────
  {
    id: 'study-minor',
    name: 'Study in Canada as a Minor Child (Primary & Secondary School)',
    category: 'study',
    kind: 'temporary',
    summary:
      'For children under the age of majority (18 or 19) attending elementary or secondary school (Kindergarten to Grade 12) in Canada. Requires either an accompanying parent with a valid study/work permit or a notarized Canadian citizen/PR custodian.',
    goals: ['study'],
    officialUrl:
      'https://www.canada.ca/en/immigration-refugees-citizenship/services/study-canada/study-permit/prepare/minor-children.html',
    links: [
      {
        label: 'Studying in Canada as a Minor — Official IRCC Guide',
        url: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/study-canada/study-permit/prepare/minor-children.html',
      },
    ],
    availability: 'open',
    steps: [
      'Enroll minor child in a Canadian elementary or secondary school',
      'Designate a custodian in Canada (if unaccompanied) or accompany a parent holding a valid Canadian work or study permit',
      'Apply for minor study permit (minor K–12 students are exempt from the PAL/TAL cap)',
    ],
    fees: 'CAD $150',
    processingTime: 'Around 6 to 12 weeks',
    discretionary: true,
    lastVerified: '2026-10-16',
    appliesTo: (p) => !alreadyCitizenOrPR(p) && p.age !== undefined && p.age < 18,
    evaluate: (p) => {
      const isMinor = p.age !== undefined ? p.age < 18 : undefined;
      const checks = [
        req('Applicant is a minor under age 18', isMinor),
        warn(
          'Canadian Custodian or Parent on Work/Study Permit + School Tuition/Funds Required',
          'Unaccompanied minors must have a notarized Custodianship Declaration (IMM 5646) signed by parents and a Canadian citizen/PR custodian, plus proof of school enrollment and financial support.',
        ),
        ...admissibilityChecks(p),
      ];
      return { checks };
    },
  },
];
