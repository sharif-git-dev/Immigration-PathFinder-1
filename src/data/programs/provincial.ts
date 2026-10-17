/**
 * Provincial Nominee Programs (PNPs) and Quebec Pathways
 * Official Sources (Verified October 2026): Official provincial immigration portals & IRCC
 * https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/provincial-nominees.html
 */

import type { Program } from '../../engine/types';
import {
  req,
  pass,
  warn,
  unknown,
  info,
  minCLB,
  educationAtLeast,
  hasRelative,
  relativeInProvince,
  wantsProvince,
  admissibilityChecks,
  alreadyCitizenOrPR,
} from '../../engine/helpers';
import { calculateCRS } from '../../engine/crs';

export const provincialPrograms: Program[] = [
  // ──────────────────────── 1. ONTARIO: HUMAN CAPITAL PRIORITIES (OINP) ────────────────────────
  {
    id: 'pnp-oinp-hcp',
    name: 'Ontario (OINP) — Express Entry Human Capital Priorities Stream',
    category: 'provincial',
    kind: 'permanent',
    summary:
      'Ontario searches the federal Express Entry pool and invites candidates with a Bachelor\'s degree, CLB 7+, 1+ year of continuous skilled work experience, and a competitive CRS score (typically 460–515+) in targeted Healthcare, Tech, or Skilled Trade occupations.',
    goals: ['permanent', 'work'],
    officialUrl: 'https://www.ontario.ca/page/ontario-immigrant-nominee-program-oinp',
    links: [
      {
        label: 'Ontario Immigrant Nominee Program (OINP) Official Page',
        url: 'https://www.ontario.ca/page/ontario-immigrant-nominee-program-oinp',
      },
    ],
    availability: 'invitation_only',
    availabilityNote: 'You cannot apply directly; Ontario issues Notifications of Interest (NOIs) to Express Entry profiles meeting targeted occupation and CRS score ranges (~460–515+).',
    steps: [
      'Qualify for and submit a federal Express Entry profile (FSW or CEC) indicating Ontario',
      'Receive a Notification of Interest (NOI) from Ontario in a targeted draw',
      'Submit your OINP application within 45 calendar days of the NOI',
      'Receive provincial nomination (+600 CRS points) and apply for PR to IRCC',
    ],
    fees: 'CAD $1,500 OINP application fee (+ federal PR fees)',
    processingTime: 'Around 3 to 5 months for provincial nomination',
    discretionary: false,
    lastVerified: '2026-10-16',
    appliesTo: (p) => !alreadyCitizenOrPR(p) && wantsProvince(p, 'ON') !== false,
    evaluate: (p) => {
      const crs = calculateCRS(p);
      const hasDegree = educationAtLeast(p, 'bachelors');
      const hasCLB7 = minCLB(p, 7, 'either');
      const totalExp = (p.foreignExpYears ?? 0) + (p.canadianExpYears ?? 0);
      const isTargetSector =
        p.occupationFields?.includes('stem') ||
        p.occupationFields?.includes('healthcare') ||
        p.occupationFields?.includes('business') ||
        p.occupationFields?.includes('trades');

      const checks = [
        req('Bachelor\'s degree or higher (with ECA if foreign)', hasDegree, {
          pass: 'You hold a Bachelor\'s degree or higher.',
          fail: 'OINP Human Capital Priorities strictly requires at least a Bachelor\'s degree or equivalent.',
        }),

        req('Language test score of at least CLB 7 in English or French', hasCLB7, {
          fixable: true,
          pass: 'Meets CLB 7 minimum.',
          fail: 'Requires at least CLB 7 across all 4 language abilities.',
        }),

        req(
          'At least 1 year of continuous full-time skilled work experience in a targeted sector',
          isTargetSector !== undefined ? isTargetSector && totalExp >= 1 : undefined,
          {
            pass: 'You have 1+ year of experience in an Ontario targeted sector.',
            fail: 'Requires at least 1 year of continuous skilled work experience in an Ontario priority sector (Healthcare, Tech/STEM, Trades, or Finance/Management).',
          },
        ),

        crs.total >= 460
          ? warn(
              'Ontario Notification of Interest (NOI) Required',
              `Your CRS score (${crs.total}) is in the typical competitive range for Ontario NOI draws (~460–515), but you cannot apply unless Ontario selects your Express Entry profile.`,
            )
          : req(
              'Competitive Express Entry CRS score for Ontario NOI draws (~460+ CRS)',
              false,
              {
                fixable: true,
                fail: `Your current CRS score is ${crs.total}. Ontario's Human Capital Priorities draws typically invite candidates with CRS scores between 460 and 515+.`,
              },
            ),

        ...admissibilityChecks(p),
      ];

      return {
        checks,
        notes: [
          `CRS Score: ${crs.total} / 1200. Receiving an Ontario provincial nomination adds +600 CRS points.`,
        ],
        score: { label: 'CRS Score', value: crs.total, max: 1200 },
      };
    },
  },

  // ──────────────────────── 2. SASKATCHEWAN: INTERNATIONAL SKILLED WORKER (SINP) ────────────────────────
  {
    id: 'pnp-sinp-isw',
    name: 'Saskatchewan (SINP) — International Skilled Worker Stream',
    category: 'provincial',
    kind: 'permanent',
    summary:
      'Expression of Interest (EOI) stream for skilled workers in non-excluded occupations who score at least 60/100 on the SINP grid. Due to reduced provincial quotas, overseas draws heavily favour candidates with a close relative in Saskatchewan (+20 pts) or Saskatchewan job/study ties.',
    goals: ['permanent', 'work'],
    officialUrl:
      'https://www.saskatchewan.ca/residents/moving-to-saskatchewan/live-in-saskatchewan/by-immigrating/saskatchewan-immigrant-nominee-program',
    links: [
      {
        label: 'SINP Official Portal & Points Grid',
        url: 'https://www.saskatchewan.ca/residents/moving-to-saskatchewan/live-in-saskatchewan/by-immigrating/saskatchewan-immigrant-nominee-program',
      },
    ],
    availability: 'invitation_only',
    availabilityNote: 'Candidate profiles are ranked in Saskatchewan\'s EOI pool; recent overseas draws require very high SINP points or specific priority occupations.',
    steps: [
      'Verify your occupation is eligible and score at least 60/100 on the SINP points assessment grid',
      'Submit an Expression of Interest (EOI) profile on Saskatchewan\'s OASIS portal',
      'Receive an Invitation to Apply (ITA) in an SINP EOI draw',
      'Submit full nomination application (CAD $350 fee) within 60 days',
    ],
    fees: 'CAD $350 SINP application fee (+ federal PR fees)',
    processingTime: 'Around 3 to 6 months for provincial nomination',
    discretionary: false,
    lastVerified: '2026-10-16',
    appliesTo: (p) => !alreadyCitizenOrPR(p) && wantsProvince(p, 'SK') !== false,
    evaluate: (p) => {
      const hasRelativeInSK = relativeInProvince(p, 'SK');
      const hasJobInSK = p.jobOffer === 'yes' && p.jobOfferProvince === 'SK';
      const hasOneYearExp = (p.foreignExpYears ?? 0) >= 1 || (p.canadianExpYears ?? 0) >= 1;
      const hasCLB4 = minCLB(p, 4, 'either');
      const hasPostSec = educationAtLeast(p, 'one_year');

      const checks = [
        req('At least 1 year of skilled work experience in the past 10 years', hasOneYearExp, {
          pass: 'You have 1+ year of work experience.',
          fail: 'Requires at least 1 continuous year of full-time paid work experience in a skilled occupation (TEER 0, 1, 2, or 3) directly related to your field of education/training.',
        }),

        req('Post-secondary education (at least 1 year diploma, degree, or certificate)', hasPostSec, {
          pass: 'You hold a post-secondary credential.',
          fail: 'SINP International Skilled Worker requires at least 1 year of post-secondary education or training comparable to the Canadian system.',
        }),

        req('Language score of at least CLB 4 (or CLB 7 for Express Entry sub-category)', hasCLB4, {
          fixable: true,
          pass: 'Meets minimum CLB 4 threshold.',
          fail: 'Requires at least CLB 4 across all 4 language abilities.',
        }),

        hasRelativeInSK || hasJobInSK
          ? pass(
              'Saskatchewan Connection (Relative or Job Offer in SK)',
              hasJobInSK
                ? 'You have a job offer in Saskatchewan.'
                : 'You have a close relative in Saskatchewan (+20 points on the 100-point SINP grid).',
            )
          : unknown(
              'SINP EOI Draw Competitiveness (Saskatchewan Connection Strongly Needed)',
              'While a job offer is not strictly required to enter the SINP EOI pool (minimum 60/100 points), recent overseas SINP draws generally require 80+ SINP points — which is very difficult to reach without a close relative in Saskatchewan (+20 pts), previous Saskatchewan work/study experience, or a Saskatchewan job offer.',
            ),

        ...admissibilityChecks(p),
      ];

      return { checks };
    },
  },

  // ──────────────────────── 3. MANITOBA: SKILLED WORKER OVERSEAS (MPNP) ────────────────────────
  {
    id: 'pnp-mpnp-overseas',
    name: 'Manitoba (MPNP) — Skilled Worker Overseas (Family Support Stream)',
    category: 'provincial',
    kind: 'permanent',
    summary:
      'For skilled workers abroad who have an established connection to Manitoba — such as a close relative (parent, sibling, child, grandparent, aunt/uncle, niece/nephew, or first cousin) who is a Canadian citizen or PR living in Manitoba for at least 1 year.',
    goals: ['permanent', 'join_family', 'work'],
    officialUrl: 'https://immigratemanitoba.com/mpnp/skilled-worker/swo/',
    links: [
      {
        label: 'MPNP Skilled Worker Overseas Official Page',
        url: 'https://immigratemanitoba.com/mpnp/skilled-worker/swo/',
      },
    ],
    availability: 'invitation_only',
    availabilityNote: 'Requires an Expression of Interest (EOI) invitation (Letter of Advice to Apply) from Manitoba.',
    steps: [
      'Have your close relative in Manitoba endorse your Settlement Plan as a qualified Manitoba Supporter',
      'Score at least 60/100 on the MPNP assessment grid and submit an Expression of Interest (EOI)',
      'Receive a Letter of Advice to Apply (LAA) in an MPNP EOI draw',
      'Submit full MPNP application (CAD $500 fee) and apply to IRCC once nominated',
    ],
    fees: 'CAD $500 MPNP application fee (+ federal PR fees)',
    processingTime: 'Around 4 to 6 months for nomination',
    discretionary: false,
    lastVerified: '2026-10-16',
    appliesTo: (p) => !alreadyCitizenOrPR(p) && wantsProvince(p, 'MB') !== false,
    evaluate: (p) => {
      const hasRelativeInMB = relativeInProvince(p, 'MB');
      const hasCloseRel = hasRelative(p, 'parent', 'child', 'sibling', 'grandparent', 'aunt_uncle', 'niece_nephew', 'cousin');
      const hasOneYearExp = (p.foreignExpYears ?? 0) >= 1 || (p.canadianExpYears ?? 0) >= 1;
      const hasCLB5 = minCLB(p, 5, 'either');

      const checks = [
        req(
          'Close relative (parent, sibling, aunt/uncle, niece/nephew, or first cousin) living in Manitoba',
          hasRelativeInMB && hasCloseRel
            ? true
            : p.relativesCitizenPR !== undefined && p.relativesProvinces !== undefined
              ? false
              : undefined,
          {
            pass: 'You have an eligible relative living in Manitoba who can act as your Manitoba Supporter.',
            fail: 'MPNP Skilled Worker Overseas requires a verified connection to Manitoba (such as a close relative who is a Canadian citizen/PR residing in Manitoba for 1+ year).',
          },
        ),

        req('At least 1 year of full-time work experience in the past 5 years', hasOneYearExp),
        req('Language test result of at least CLB 5 in English or French', hasCLB5, { fixable: true }),
        warn(
          'MPNP Expression of Interest (EOI) Draw Selection',
          'Meeting minimum requirements allows you to enter the MPNP EOI pool; you must still be invited via a Letter of Advice to Apply (LAA) based on Manitoba\'s EOI draw cutoffs.',
        ),

        ...admissibilityChecks(p),
      ];

      return { checks };
    },
  },

  // ──────────────────────── 4. BRITISH COLUMBIA: BC PNP SKILLED WORKER ────────────────────────
  {
    id: 'pnp-bcpnp-skilled',
    name: 'British Columbia (BC PNP) — Skilled Worker Stream',
    category: 'provincial',
    kind: 'permanent',
    summary:
      'For skilled workers with an indeterminate, full-time job offer in TEER 0, 1, 2, or 3 from an eligible British Columbia employer and at least 2 years of directly related skilled work experience.',
    goals: ['permanent', 'work'],
    officialUrl: 'https://www.welcomebc.ca/immigrate-to-b-c/for-workers',
    links: [
      {
        label: 'BC PNP Skills Immigration (For Workers) Official Page',
        url: 'https://www.welcomebc.ca/immigrate-to-b-c/for-workers',
      },
    ],
    availability: 'invitation_only',
    availabilityNote: 'BC PNP uses a points-based registration system and prioritizes high-economic-impact candidates and healthcare/construction/childcare/tech workers.',
    steps: [
      'Secure an indeterminate, full-time job offer in TEER 0, 1, 2, or 3 from a qualifying BC employer',
      'Register in the BC PNP Online SIRS scoring pool',
      'Receive an Invitation to Apply in a BC PNP draw',
      'Submit nomination application (CAD $1,475 fee)',
    ],
    fees: 'CAD $1,475 BC PNP application fee',
    processingTime: 'Around 3 months for nomination',
    discretionary: false,
    lastVerified: '2026-10-16',
    appliesTo: (p) => !alreadyCitizenOrPR(p) && wantsProvince(p, 'BC') !== false,
    evaluate: (p) => {
      const hasJobOfferInBC = p.jobOffer === 'yes' && p.jobOfferProvince === 'BC' && p.jobOfferFullTime !== 'no';
      const isSkilledTeer = p.skillLevel === 'teer0_1' || p.skillLevel === 'teer2_3';
      const totalExp = (p.foreignExpYears ?? 0) + (p.canadianExpYears ?? 0);

      const checks = [
        req(
          'Full-time, indeterminate job offer from an eligible BC employer',
          hasJobOfferInBC ? true : p.jobOffer !== undefined ? false : undefined,
          {
            fixable: true,
            pass: 'You have a full-time job offer in British Columbia.',
            fail: 'BC PNP Skilled Worker strictly requires an indeterminate full-time job offer from a BC employer.',
          },
        ),
        req('At least 2 years of full-time skilled work experience (TEER 0, 1, 2, or 3)', isSkilledTeer && totalExp >= 2, {
          pass: `You have ${totalExp} years of skilled work experience.`,
          fail: 'BC PNP Skilled Worker requires at least 2 years of directly related full-time work experience in TEER 0, 1, 2, or 3.',
        }),
        req('Language minimum of CLB 4 (for TEER 2/3) or competitive language score', minCLB(p, 4, 'either')),
        warn(
          'BC PNP SIRS Draw Invitation Required',
          'Registration in BC PNP Online is not an application; you must meet the wage, language, and occupation points cutoff in a BC PNP round of invitations.',
        ),
        ...admissibilityChecks(p),
      ];

      return { checks };
    },
  },

  // ──────────────────────── 5. ALBERTA: ALBERTA ADVANTAGE IMMIGRATION (AAIP) ────────────────────────
  {
    id: 'pnp-aaip-aos',
    name: 'Alberta (AAIP) — Alberta Opportunity Stream & Dedicated Worker Streams',
    category: 'provincial',
    kind: 'permanent',
    summary:
      'For temporary foreign workers who are already living and working full-time in Alberta with a valid work permit and a full-time job offer from an Alberta employer, selected through Alberta\'s Worker Expression of Interest (EOI) system.',
    goals: ['permanent', 'work'],
    officialUrl: 'https://www.alberta.ca/alberta-advantage-immigration-program',
    links: [
      {
        label: 'AAIP Official Portal & Worker EOI Streams',
        url: 'https://www.alberta.ca/alberta-advantage-immigration-program',
      },
    ],
    availability: 'invitation_only',
    availabilityNote: 'Alberta selects candidates from its Worker Expression of Interest (EOI) pool based on points and sector priorities.',
    steps: [
      'Work full-time in Alberta on a valid work permit with a qualifying Alberta job offer',
      'Submit a Worker Expression of Interest (EOI) in the AAIP portal',
      'Receive an invitation to apply from AAIP and submit your nomination application (CAD $840 fee)',
    ],
    fees: 'CAD $840 AAIP application fee',
    processingTime: 'Around 4 to 6 months',
    discretionary: false,
    lastVerified: '2026-10-16',
    appliesTo: (p) => !alreadyCitizenOrPR(p) && wantsProvince(p, 'AB') !== false,
    evaluate: (p) => {
      const inAlbertaWithWork =
        (p.residenceCountry === 'CA' && p.preferredProvinces?.includes('AB') && (p.canadianExpYears ?? 0) >= 1) ||
        (p.jobOffer === 'yes' && p.jobOfferProvince === 'AB');

      const checks = [
        req(
          'Currently working in Alberta OR holding a full-time Alberta job offer with work authorization',
          inAlbertaWithWork,
          {
            fixable: true,
            pass: 'You indicated an employment connection or job offer in Alberta.',
            fail: 'Alberta Opportunity Stream requires valid work authorization and a full-time job offer in Alberta (plus 12 months of work experience in Alberta within the last 18 months, or 24 months in Canada/abroad within the last 30 months).',
          },
        ),
        req('Language test result of at least CLB 4 or CLB 5 (depending on TEER)', minCLB(p, 4, 'either')),
        warn(
          'AAIP Worker Expression of Interest (EOI) Invitation Required',
          'Candidates must submit an EOI profile and be invited in an Alberta draw.',
        ),
        ...admissibilityChecks(p),
      ];
      return { checks };
    },
  },

  // ──────────────────────── 6. QUEBEC: PSTQ / ARRIMA ────────────────────────
  {
    id: 'pnp-quebec-pstq',
    name: 'Quebec — Skilled Worker Selection Program (PSTQ / Arrima)',
    category: 'provincial',
    kind: 'permanent',
    summary:
      'Quebec\'s independent economic immigration stream (Programme de sélection des travailleurs qualifiés — PSTQ). Requires French proficiency (minimum oral level 7 and written level 5 on the Échelle québécoise / NCLC) and an invitation through Quebec\'s Arrima portal.',
    goals: ['permanent', 'work'],
    officialUrl: 'https://www.quebec.ca/en/immigration/work-quebec',
    links: [
      {
        label: 'Work & Immigrate to Québec Official Portal',
        url: 'https://www.quebec.ca/en/immigration/work-quebec',
      },
    ],
    availability: 'invitation_only',
    availabilityNote: 'Invitations are issued through the Arrima portal based on Quebec\'s human capital and labour market needs.',
    steps: [
      'Pass an approved French test (TEF, TEFAQ, TCF, or TCF-Québec) meeting level 7 oral and level 5 written',
      'Submit an Expression of Interest in the Arrima portal',
      'Receive an invitation from MIFI and apply for a Certificat de sélection du Québec (CSQ)',
      'Apply to IRCC for permanent residence once your CSQ is issued',
    ],
    fees: 'CAD $906 CSQ fee for principal applicant (+ federal PR fees)',
    processingTime: 'Around 6 months for CSQ + federal processing',
    discretionary: false,
    lastVerified: '2026-10-16',
    appliesTo: (p) => !alreadyCitizenOrPR(p) && wantsProvince(p, 'QC') !== false,
    evaluate: (p) => {
      const fr = p.frenchCLB ?? 0;
      const isFrench7 = fr >= 7;

      const checks = [
        req(
          'French proficiency of at least Level 7 (NCLC 7 / B2)',
          p.frenchCLB !== undefined ? isFrench7 : undefined,
          {
            fixable: true,
            pass: `Your French benchmark is NCLC ${fr} (meets Quebec's PSTQ language requirement).`,
            fail: `Quebec's PSTQ strictly requires French proficiency of at least Level 7 oral (and Level 5 written). Your current French benchmark is NCLC ${fr}.`,
          },
        ),

        req('Completed secondary or post-secondary diploma', educationAtLeast(p, 'secondary')),
        warn(
          'Arrima Invitation Required for CSQ',
          'You must submit an Expression of Interest in Quebec\'s Arrima portal and receive an invitation from the Ministère de l\'Immigration, de la Francisation et de l\'Intégration (MIFI).',
        ),
        ...admissibilityChecks(p),
      ];

      return { checks };
    },
  },
];
