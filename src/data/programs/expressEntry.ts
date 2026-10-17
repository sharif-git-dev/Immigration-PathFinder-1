/**
 * Express Entry Programs (FSW, CEC, FST, and Category-Based Selection Streams)
 * Official Sources (Verified October 2026):
 * - https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry.html
 * - https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/who-can-apply/federal-skilled-workers.html
 * - https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/who-can-apply/canadian-experience-class.html
 * - https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/who-can-apply/federal-skilled-trades.html
 * - https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/rounds-invitations/category-based-selection.html
 */

import type { Program, Profile } from '../../engine/types';
import {
  req,
  pass,
  warn,
  unknown,
  info,
  minCLB,
  educationAtLeast,
  familySize,
  admissibilityChecks,
  alreadyCitizenOrPR,
} from '../../engine/helpers';
import { calculateCRS } from '../../engine/crs';
import { calculateFSWPoints, getMinimumFundsRequired } from '../../engine/fsw';
import { EE_DRAWS } from '../eeDraws';

/** Helper to check if candidate meets baseline Express Entry pool entry (FSW or CEC) */
function meetsExpressEntryPoolBaseline(p: Profile): boolean | undefined {
  if (p.foreignExpYears === undefined && p.canadianExpYears === undefined) return undefined;
  const totalSkilledExp = (p.foreignExpYears ?? 0) + (p.canadianExpYears ?? 0);
  const isSkilled = p.skillLevel !== 'teer4_5' && p.skillLevel !== 'none';
  if (!isSkilled || totalSkilledExp < 1) return false;

  // CEC path: 1+ yr Canadian work + CLB 7 (TEER 0/1) or CLB 5 (TEER 2/3)
  if ((p.canadianExpYears ?? 0) >= 1) {
    const reqClb = p.skillLevel === 'teer0_1' ? 7 : 5;
    if (minCLB(p, reqClb, 'either') === true) return true;
  }

  // FSW path: 1+ yr skilled work + CLB 7 + secondary education + 67 points + settlement funds
  const fsw = calculateFSWPoints(p);
  const famSize = familySize(p) ?? 1;
  const minFunds = getMinimumFundsRequired(famSize);
  const hasInCanadaJobOffer = p.jobOffer === 'yes' && p.jobOfferFullTime !== 'no' && p.residenceCountry === 'CA';
  const fundsOk = hasInCanadaJobOffer || p.fundsCAD === undefined || p.fundsCAD >= minFunds;
  if (minCLB(p, 7, 'either') === true && educationAtLeast(p, 'secondary') === true && fsw.passed && fundsOk) {
    return true;
  }

  return false;
}

export const expressEntryPrograms: Program[] = [
  // ──────────────────────── 1. FEDERAL SKILLED WORKER (FSW) ────────────────────────
  {
    id: 'ee-fsw',
    name: 'Federal Skilled Worker Program (FSW)',
    category: 'express_entry',
    kind: 'permanent',
    summary:
      'Canada\'s primary economic stream for skilled professionals with foreign or Canadian work experience. Requires 1+ year of continuous skilled work (TEER 0–3), CLB 7 language scores, 67/100 on the FSW grid, and a competitive CRS score to receive an Invitation to Apply (ITA).',
    goals: ['permanent', 'work'],
    officialUrl:
      'https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/who-can-apply/federal-skilled-workers.html',
    links: [
      {
        label: 'Six Selection Factors (67-Point Grid)',
        url: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/eligibility/federal-skilled-workers/six-selection-factors-federal-skilled-workers.html',
      },
      {
        label: 'Proof of Funds Table (Updated July 2025 / 2026)',
        url: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/documents/proof-funds.html',
      },
      {
        label: 'Comprehensive Ranking System (CRS) Criteria',
        url: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/check-score/crs-criteria.html',
      },
    ],
    availability: 'invitation_only',
    availabilityNote: 'Meeting the 67-point grid lets you enter the Express Entry pool; you must also exceed a CRS draw cutoff (or qualify for a category/PNP draw) to be invited to apply.',
    steps: [
      'Take an approved language test (IELTS General, CELPIP, PTE Core, TEF Canada, or TCF Canada)',
      'Get an Educational Credential Assessment (ECA) for foreign degrees/diplomas',
      'Submit an Express Entry profile online (free; valid for 12 months)',
      'Receive an Invitation to Apply (ITA) in an IRCC round of invitations',
      'Submit complete PR application within 60 days',
    ],
    fees: 'CAD $1,525 per adult (CAD $950 processing + CAD $575 right of permanent residence fee)',
    processingTime: 'Around 6 months after receiving an ITA',
    discretionary: false,
    lastVerified: '2026-10-16',
    appliesTo: (p) => !alreadyCitizenOrPR(p),
    evaluate: (p) => {
      const crs = calculateCRS(p);
      const fsw = calculateFSWPoints(p);
      const famSize = familySize(p) ?? 1;
      const minFunds = getMinimumFundsRequired(famSize);
      const hasJobOffer = p.jobOffer === 'yes' && p.jobOfferFullTime !== 'no' && p.residenceCountry === 'CA';
      const generalCutoff = EE_DRAWS.find((d) => d.stream.includes('General'))?.crsCutoff ?? 524;

      const checks = [
        req(
          'At least 1 year of continuous skilled work experience (TEER 0, 1, 2, or 3)',
          p.foreignExpYears !== undefined || p.canadianExpYears !== undefined
            ? ((p.foreignExpYears ?? 0) >= 1 || (p.canadianExpYears ?? 0) >= 1) &&
                p.skillLevel !== 'teer4_5' &&
                p.skillLevel !== 'none'
            : undefined,
          {
            pass: `You have ${(p.foreignExpYears ?? 0) + (p.canadianExpYears ?? 0)} year(s) of skilled work experience.`,
            fail: 'FSW requires at least 1 continuous year (1,560 hours) of paid skilled work (TEER 0, 1, 2, or 3) within the last 10 years.',
          },
        ),

        req(
          'Language test score of at least CLB 7 in English or French',
          minCLB(p, 7, 'either'),
          {
            fixable: true,
            pass: `Your best official language benchmark is CLB ${Math.max(p.englishCLB ?? 0, p.frenchCLB ?? 0)} (meets CLB 7 minimum).`,
            fail: `Your current language score is below CLB 7 (English: CLB ${p.englishCLB ?? 0}, French: CLB ${p.frenchCLB ?? 0}). CLB 7 across all 4 abilities is mandatory for FSW.`,
          },
        ),

        req(
          'Completed secondary (high school) or post-secondary education with ECA',
          educationAtLeast(p, 'secondary'),
          {
            pass: `Education level meets minimum requirement (an ECA is required for credentials completed outside Canada).`,
            fail: 'Requires at least a completed secondary school diploma or higher.',
          },
        ),

        req(
          'Score at least 67 / 100 on the FSW Selection Factors Grid',
          fsw.passed,
          {
            fixable: true,
            pass: `You scored ${fsw.total} / 100 on the FSW 67-point grid (eligible to enter the Express Entry pool).`,
            fail: `You scored ${fsw.total} / 100 on the FSW grid (minimum 67 required to enter the pool).`,
          },
        ),

        hasJobOffer
          ? pass('Proof of Settlement Funds', 'Exempt because you are authorized to work in Canada with a valid job offer.')
          : req(
              `Settlement funds of at least CAD $${minFunds.toLocaleString()} (family of ${famSize})`,
              p.fundsCAD !== undefined ? p.fundsCAD >= minFunds : undefined,
              {
                fixable: true,
                pass: `Reported funds (CAD $${p.fundsCAD?.toLocaleString()}) meet the 2025/2026 IRCC threshold of CAD $${minFunds.toLocaleString()} for a family of ${famSize}.`,
                fail: `For a family of ${famSize}, IRCC requires at least CAD $${minFunds.toLocaleString()} in unencumbered liquid funds (updated July 2025/2026 LICO table).`,
              },
            ),

        crs.total >= generalCutoff
          ? pass(
              `Competitive CRS Score for General Draws (~${generalCutoff}+)`,
              `Your CRS score of ${crs.total} meets or exceeds recent General draw cutoffs (~${generalCutoff}).`,
            )
          : unknown(
              `Competitive CRS Score for General Draws (~${generalCutoff}+)`,
              `Your CRS score is ${crs.total}. Even if you meet the 67-point FSW minimum to enter the pool, recent General draws require ~${generalCutoff}+ CRS. To receive an invitation, you will likely need Category-Based Selection (French NCLC 7+, Healthcare, Trades, STEM) or a Provincial Nomination (+600 CRS).`,
            ),

        ...admissibilityChecks(p),
      ];

      return {
        checks,
        notes: [
          `CRS Score: ${crs.total} / 1200 | FSW Grid Score: ${fsw.total} / 100 (67 required for pool entry).`,
          `Note: As of March 2025, IRCC removed the 50/200 CRS bonus points for arranged employment (job offers), though a valid job offer still counts for up to 15 points on the FSW 67-point grid.`,
        ],
        score: { label: 'CRS Score', value: crs.total, max: 1200 },
      };
    },
  },

  // ──────────────────────── 2. CANADIAN EXPERIENCE CLASS (CEC) ────────────────────────
  {
    id: 'ee-cec',
    name: 'Canadian Experience Class (CEC)',
    category: 'express_entry',
    kind: 'permanent',
    summary:
      'For skilled workers who have at least 1 year (1,560 hours) of authorized full-time skilled work experience in Canada (TEER 0, 1, 2, or 3) within the last 3 years. Exempt from proof of settlement funds.',
    goals: ['permanent', 'work'],
    officialUrl:
      'https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/who-can-apply/canadian-experience-class.html',
    links: [
      {
        label: 'CEC Official Eligibility Rules',
        url: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/who-can-apply/canadian-experience-class.html',
      },
      {
        label: 'Express Entry Rounds of Invitations',
        url: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/rounds-invitations.html',
      },
    ],
    availability: 'invitation_only',
    availabilityNote: 'IRCC holds frequent CEC-specific draws; competitive CRS scores are typically 507–539.',
    steps: [
      'Complete at least 1 year (1,560 hours) of authorized paid skilled work in Canada within the past 3 years (self-employment and work during full-time study do not count)',
      'Take an approved English or French language test (CLB 7 for TEER 0/1; CLB 5 for TEER 2/3)',
      'Submit an Express Entry profile and receive an ITA in a CEC or category draw',
    ],
    fees: 'CAD $1,525 per adult applicant',
    processingTime: 'Around 5–6 months after receiving an ITA',
    discretionary: false,
    lastVerified: '2026-10-16',
    appliesTo: (p) => !alreadyCitizenOrPR(p),
    evaluate: (p) => {
      const crs = calculateCRS(p);
      const caYears = p.canadianExpYears ?? 0;
      const isHighTeer = p.skillLevel === 'teer0_1';
      const minClbNeeded = isHighTeer ? 7 : 5;
      const cecCutoff = EE_DRAWS.find((d) => d.stream.includes('CEC'))?.crsCutoff ?? 509;

      const checks = [
        req(
          'At least 1 year of authorized Canadian skilled work experience in the last 3 years',
          p.canadianExpYears !== undefined
            ? caYears >= 1 && p.skillLevel !== 'teer4_5' && p.skillLevel !== 'none'
            : undefined,
          {
            pass: `You have ${caYears} year(s) of skilled Canadian work experience.`,
            fail: 'CEC strictly requires at least 1 year (1,560 hours) of authorized skilled work inside Canada within the last 3 years.',
          },
        ),

        req(
          `Language proficiency of at least CLB ${minClbNeeded} (${isHighTeer ? 'TEER 0 or 1' : 'TEER 2 or 3'})`,
          minCLB(p, minClbNeeded, 'either'),
          {
            fixable: true,
            pass: `Your language benchmark is CLB ${Math.max(p.englishCLB ?? 0, p.frenchCLB ?? 0)} (meets CLB ${minClbNeeded} requirement).`,
            fail: `CEC requires CLB 7 for TEER 0/1 occupations or CLB 5 for TEER 2/3 occupations.`,
          },
        ),

        crs.total >= cecCutoff
          ? pass(
              `Competitive CRS Score for CEC Draws (~${cecCutoff}+)`,
              `Your CRS score (${crs.total}) meets or exceeds recent CEC draw cutoffs (~${cecCutoff}).`,
            )
          : unknown(
              `Competitive CRS Score for CEC Draws (~${cecCutoff}+)`,
              `Your CRS score (${crs.total}) is below recent CEC draw cutoffs (~${cecCutoff}). Additional Canadian experience, higher language scores, or French proficiency can raise your score.`,
            ),

        info('Proof of Settlement Funds', 'Exempt: CEC applicants do not need to provide proof of settlement funds.'),

        ...admissibilityChecks(p),
      ];

      return {
        checks,
        notes: [
          `CRS Score: ${crs.total} / 1200.`,
          `Work experience gained while studying full-time on a study permit or through self-employment cannot be counted toward the 1-year CEC requirement.`,
        ],
        score: { label: 'CRS Score', value: crs.total, max: 1200 },
      };
    },
  },

  // ──────────────────────── 3. FEDERAL SKILLED TRADES (FST) ────────────────────────
  {
    id: 'ee-fst',
    name: 'Federal Skilled Trades Program (FST)',
    category: 'express_entry',
    kind: 'permanent',
    summary:
      'For tradespeople with at least 2 years of full-time work experience in an eligible skilled trade within the past 5 years, plus either a valid 1-year full-time job offer in Canada or a Canadian provincial/territorial Certificate of Qualification.',
    goals: ['permanent', 'work'],
    officialUrl:
      'https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/who-can-apply/federal-skilled-trades.html',
    links: [
      {
        label: 'FST Official Eligibility Criteria',
        url: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/who-can-apply/federal-skilled-trades.html',
      },
    ],
    availability: 'invitation_only',
    availabilityNote: 'Candidates enter the Express Entry pool and are typically invited via Trade occupation category draws.',
    steps: [
      'Have at least 2 years of full-time paid experience in an eligible skilled trade within the last 5 years',
      'Score at least CLB 5 in Speaking/Listening and CLB 4 in Reading/Writing',
      'Obtain a provincial/territorial Certificate of Qualification OR a full-time Canadian job offer lasting at least 1 year',
      'Submit an Express Entry profile',
    ],
    fees: 'CAD $1,525 per adult applicant',
    processingTime: 'Around 6 months after receiving an ITA',
    discretionary: false,
    lastVerified: '2026-10-16',
    appliesTo: (p) => !alreadyCitizenOrPR(p),
    evaluate: (p) => {
      const crs = calculateCRS(p);
      const isTradeOccupation = p.occupationFields?.includes('trades');
      const totalExp = (p.foreignExpYears ?? 0) + (p.canadianExpYears ?? 0);
      const hasTradeCert = p.tradeCert === 'yes';
      const hasJobOffer = p.jobOffer === 'yes' && p.jobOfferFullTime !== 'no';
      const tradeCutoff = EE_DRAWS.find((d) => d.stream.includes('Trade'))?.crsCutoff ?? 433;

      const checks = [
        req(
          'At least 2 years of experience in an eligible skilled trade occupation',
          isTradeOccupation !== undefined ? isTradeOccupation && totalExp >= 2 : undefined,
          {
            pass: `You indicated ${totalExp} year(s) of experience in skilled trades.`,
            fail: 'FST requires at least 2 years of full-time experience in an eligible skilled trade within the past 5 years.',
          },
        ),

        req(
          'Language level of at least CLB 5 (Speaking/Listening) and CLB 4 (Reading/Writing)',
          minCLB(p, 5, 'either'),
          {
            fixable: true,
            pass: `Your language benchmark meets FST minimums.`,
            fail: 'FST requires at least CLB 5 in speaking/listening and CLB 4 in reading/writing.',
          },
        ),

        req(
          'Valid 1-year Canadian job offer OR Canadian Trade Certificate of Qualification',
          hasTradeCert || hasJobOffer ? true : p.tradeCert !== undefined && p.jobOffer !== undefined ? false : undefined,
          {
            fixable: true,
            pass: hasTradeCert
              ? 'You hold a provincial/territorial Certificate of Qualification.'
              : 'You have a full-time job offer in Canada.',
            fail: 'FST requires either a full-time Canadian job offer (at least 1 year) OR a Canadian Certificate of Qualification in your trade.',
          },
        ),

        crs.total >= tradeCutoff
          ? pass(`Competitive CRS Score for Trade Draws (~${tradeCutoff}+)`, `Your CRS score (${crs.total}) meets or exceeds recent Trade draw cutoffs (~${tradeCutoff}).`)
          : unknown(`Competitive CRS Score for Trade Draws (~${tradeCutoff}+)`, `Your CRS score (${crs.total}) is below recent Trade draw cutoffs (~${tradeCutoff}).`),

        ...admissibilityChecks(p),
      ];

      return {
        checks,
        notes: [
          `CRS Score: ${crs.total} / 1200.`,
          `Express Entry Trade category draws have lower CRS cutoffs (~${tradeCutoff}) than general rounds.`,
        ],
        score: { label: 'CRS Score', value: crs.total, max: 1200 },
      };
    },
  },

  // ──────────────────────── 4. CATEGORY: FRENCH-LANGUAGE PROFICIENCY ────────────────────────
  {
    id: 'ee-category-french',
    name: 'Express Entry: French-Language Proficiency Category',
    category: 'express_entry',
    kind: 'permanent',
    summary:
      'IRCC\'s highest-volume category-based selection stream. Requires baseline Express Entry pool eligibility (FSW, CEC, or FST) plus a minimum of NCLC 7 in all 4 French abilities. Offers the lowest CRS cutoffs in Express Entry (~394–446).',
    goals: ['permanent', 'work'],
    officialUrl:
      'https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/rounds-invitations/category-based-selection.html',
    links: [
      {
        label: 'Category-Based Selection Official Criteria',
        url: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/rounds-invitations/category-based-selection.html',
      },
    ],
    availability: 'invitation_only',
    availabilityNote: 'Frequent dedicated French proficiency draws with large invitation quotas and CRS cutoffs around 394–446.',
    steps: [
      'Take TEF Canada or TCF Canada and score at least NCLC 7 in all 4 language abilities',
      'Meet baseline requirements for FSW, CEC, or FST to enter the Express Entry pool',
      'Receive an ITA in a French-language category round',
    ],
    fees: 'CAD $1,525 per adult applicant',
    processingTime: 'Around 6 months after receiving an ITA',
    discretionary: false,
    lastVerified: '2026-10-16',
    appliesTo: (p) => !alreadyCitizenOrPR(p),
    evaluate: (p) => {
      const crs = calculateCRS(p);
      const fr = p.frenchCLB ?? 0;
      const isFrench7 = fr >= 7;
      const poolOk = meetsExpressEntryPoolBaseline(p);
      const frenchCutoff = EE_DRAWS.find((d) => d.stream.includes('French'))?.crsCutoff ?? 420;

      const checks = [
        req(
          'French proficiency of NCLC 7 or higher in all 4 skills',
          p.frenchCLB !== undefined ? isFrench7 : undefined,
          {
            fixable: true,
            pass: `Your French benchmark is NCLC ${fr} (meets NCLC 7 minimum).`,
            fail: `Your French benchmark is NCLC ${fr}. You need at least NCLC 7 across all 4 bands on TEF Canada or TCF Canada.`,
          },
        ),

        req(
          'Meet baseline Express Entry pool eligibility (FSW, CEC, or FST)',
          poolOk,
          {
            fixable: true,
            pass: 'You meet the baseline work, education, and points criteria to enter the Express Entry pool.',
            fail: 'To be invited in a category draw, you must first qualify to enter the Express Entry pool under FSW (67 points + 1 yr skilled work + settlement funds), CEC, or FST.',
          },
        ),

        crs.total >= frenchCutoff
          ? pass(`Competitive CRS Score for French Draws (~${frenchCutoff}+)`, `Your CRS score (${crs.total}) meets or exceeds recent French category draw cutoffs (~${frenchCutoff}).`)
          : unknown(`Competitive CRS Score for French Draws (~${frenchCutoff}+)`, `Your CRS score (${crs.total}) is below recent French category cutoffs (~${frenchCutoff}).`),

        ...admissibilityChecks(p),
      ];

      return {
        checks,
        notes: [
          `CRS Score: ${crs.total} / 1200.`,
          `Scoring NCLC 7+ in French adds +50 bonus CRS points (if English is CLB 5+) and unlocks French category draws (~394–446 CRS).`,
        ],
        score: { label: 'CRS Score', value: crs.total, max: 1200 },
      };
    },
  },

  // ──────────────────────── 5. CATEGORY: HEALTHCARE & SOCIAL SERVICES ────────────────────────
  {
    id: 'ee-category-healthcare',
    name: 'Express Entry: Healthcare & Social Services Occupations Category',
    category: 'express_entry',
    kind: 'permanent',
    summary:
      'Targeted Express Entry draws for healthcare and social services workers (nurses, physicians, pharmacists, dentists, medical lab technologists, social workers, therapists, nurse aides) with at least 12 months of full-time experience in an eligible NOC within the past 3 years.',
    goals: ['permanent', 'work'],
    officialUrl:
      'https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/rounds-invitations/category-based-selection.html',
    links: [
      {
        label: 'Eligible Healthcare & Social Services NOCs (2026)',
        url: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/rounds-invitations/category-based-selection.html',
      },
    ],
    availability: 'invitation_only',
    availabilityNote: 'Updated 2026 rule: IRCC now requires at least 12 months (up from 6 months) of experience within the past 3 years in an eligible healthcare or social services NOC.',
    steps: [
      'Qualify for FSW, CEC, or FST to enter the Express Entry pool',
      'Have at least 12 months of full-time (or equivalent part-time) work experience in an eligible healthcare or social services NOC within the past 3 years',
      'Receive an ITA in a Healthcare & Social Services category draw',
    ],
    fees: 'CAD $1,525 per adult applicant',
    processingTime: 'Around 6 months after receiving an ITA',
    discretionary: false,
    lastVerified: '2026-10-16',
    appliesTo: (p) => !alreadyCitizenOrPR(p),
    evaluate: (p) => {
      const crs = calculateCRS(p);
      const isHealth = p.occupationFields?.includes('healthcare');
      const totalExp = (p.foreignExpYears ?? 0) + (p.canadianExpYears ?? 0);
      const poolOk = meetsExpressEntryPoolBaseline(p);
      const healthCutoff = EE_DRAWS.find((d) => d.stream.includes('Healthcare'))?.crsCutoff ?? 445;

      const checks = [
        req(
          'At least 12 months of experience in an eligible Healthcare or Social Services occupation (within last 3 years)',
          isHealth !== undefined ? isHealth && totalExp >= 1 : undefined,
          {
            pass: 'You indicated 1+ year of experience in healthcare or social services.',
            fail: 'As of 2026, this category requires at least 12 months of work experience within the past 3 years in an eligible healthcare or social services occupation.',
          },
        ),

        req(
          'Meet baseline Express Entry pool eligibility (FSW, CEC, or FST)',
          poolOk,
          {
            fixable: true,
            pass: 'You meet baseline Express Entry pool entry requirements.',
            fail: 'You must first qualify for FSW (CLB 7 + 67/100 points + settlement funds), CEC, or FST to enter the Express Entry pool.',
          },
        ),

        crs.total >= healthCutoff
          ? pass(`Competitive CRS Score for Healthcare Draws (~${healthCutoff}+)`, `Your CRS score (${crs.total}) meets or exceeds recent Healthcare category cutoffs (~${healthCutoff}).`)
          : unknown(`Competitive CRS Score for Healthcare Draws (~${healthCutoff}+)`, `Your CRS score (${crs.total}) is below recent Healthcare category cutoffs (~${healthCutoff}). Improving language scores or gaining additional experience can bridge this gap.`),

        ...admissibilityChecks(p),
      ];

      return {
        checks,
        notes: [
          `CRS Score: ${crs.total} / 1200.`,
          `In 2026, IRCC expanded this category to include social workers (NOC 41300), counselling therapists (41301), and social/community service workers (42201), and increased the work experience requirement to 12 months within the past 3 years.`,
        ],
        score: { label: 'CRS Score', value: crs.total, max: 1200 },
      };
    },
  },

  // ──────────────────────── 6. CATEGORY: STEM OCCUPATIONS ────────────────────────
  {
    id: 'ee-category-stem',
    name: 'Express Entry: STEM Occupations Category',
    category: 'express_entry',
    kind: 'permanent',
    summary:
      'Targeted Express Entry category for select engineering, architecture/science management, cybersecurity, and technical occupations. Requires at least 12 months of experience within the past 3 years in an eligible 2026 STEM NOC code.',
    goals: ['permanent', 'work'],
    officialUrl:
      'https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/rounds-invitations/category-based-selection.html',
    links: [
      {
        label: '2026 Eligible STEM Occupations Table (11 NOCs)',
        url: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/rounds-invitations/category-based-selection.html',
      },
    ],
    availability: 'invitation_only',
    availabilityNote: 'Important 2026 update: General software developers/programmers were removed from the STEM list. Eligible NOCs are now Civil, Mechanical, Electrical, Industrial, and Geological Engineers/Technologists, Cybersecurity Specialists (21220), Architecture/Science Managers (20011), and Insurance Agents/Brokers (63100). Requires 12 months experience.',
    steps: [
      'Verify your NOC is one of the 11 eligible 2026 STEM codes on Canada.ca',
      'Have at least 12 months of work experience in that NOC within the past 3 years',
      'Qualify for FSW, CEC, or FST and submit an Express Entry profile',
    ],
    fees: 'CAD $1,525 per adult applicant',
    processingTime: 'Around 6 months after receiving an ITA',
    discretionary: false,
    lastVerified: '2026-10-16',
    appliesTo: (p) => !alreadyCitizenOrPR(p),
    evaluate: (p) => {
      const crs = calculateCRS(p);
      const isStem = p.occupationFields?.includes('stem');
      const totalExp = (p.foreignExpYears ?? 0) + (p.canadianExpYears ?? 0);
      const poolOk = meetsExpressEntryPoolBaseline(p);
      const stemCutoff = 480;

      const checks = [
        req(
          'At least 12 months of experience in an eligible STEM occupation (within last 3 years)',
          isStem !== undefined ? isStem && totalExp >= 1 : undefined,
          {
            pass: 'You indicated 1+ year of experience in a STEM field.',
            fail: 'Requires at least 12 months of experience within the past 3 years in an eligible STEM occupation.',
          },
        ),

        req(
          'Meet baseline Express Entry pool eligibility (FSW, CEC, or FST)',
          poolOk,
          {
            fixable: true,
            pass: 'You meet baseline Express Entry pool entry requirements.',
            fail: 'You must first qualify for FSW (CLB 7 + 67/100 points + settlement funds), CEC, or FST to enter the Express Entry pool.',
          },
        ),

        crs.total >= stemCutoff
          ? pass(
              'Confirm occupation is on the narrowed 2026 IRCC STEM list & meets draw cutoff (~480+ CRS)',
              `Your CRS score (${crs.total}) meets the typical STEM draw range (~480+), provided your occupation is one of the 11 eligible 2026 STEM NOCs.`,
            )
          : unknown(
              'Confirm occupation is on the narrowed 2026 IRCC STEM list & meets draw cutoff (~480+ CRS)',
              `Your CRS score is ${crs.total} (below ~480 cutoff). Note that in 2025/2026 IRCC narrowed the STEM category to 11 specific NOCs (Civil/Mechanical/Electrical/Industrial/Geological Engineers & Technologists, Cybersecurity Specialists 21220, Architecture/Science Managers 20011) and removed general software developers.`,
            ),

        ...admissibilityChecks(p),
      ];

      return {
        checks,
        notes: [
          `CRS Score: ${crs.total} / 1200.`,
          `In 2026, IRCC also introduced an Education Occupations category (teachers, early childhood educators, teacher assistants) and Transport category (aircraft mechanics, pilots, automotive/truck mechanics) — all requiring 12 months of experience within the last 3 years.`,
        ],
        score: { label: 'CRS Score', value: crs.total, max: 1200 },
      };
    },
  },
];
