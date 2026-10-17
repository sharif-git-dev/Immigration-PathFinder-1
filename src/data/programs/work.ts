/**
 * Work in Canada Programs (Temporary Work Permits)
 * Official Source (Verified October 2026): IRCC Work in Canada
 * https://www.canada.ca/en/immigration-refugees-citizenship/services/work-canada.html
 */

import type { Program } from '../../engine/types';
import {
  req,
  pass,
  warn,
  minCLB,
  canadaStatus,
  isPartnered,
  admissibilityChecks,
  alreadyCitizenOrPR,
} from '../../engine/helpers';
import { getCountry } from '../countries';

export const workPrograms: Program[] = [
  // ──────────────────────── 1. POST-GRADUATION WORK PERMIT (PGWP) ────────────────────────
  {
    id: 'work-pgwp',
    name: 'Post-Graduation Work Permit (PGWP)',
    category: 'work',
    kind: 'temporary',
    summary:
      'An open work permit (valid up to 3 years) for graduates of eligible Canadian Designated Learning Institutions (DLIs). Bachelor\'s, Master\'s, and Doctoral degree graduates need CLB/NCLC 7 (no field-of-study limit); college and non-degree university graduates need CLB/NCLC 5 (or 7) AND must graduate from an eligible shortage field of study.',
    goals: ['work', 'permanent'],
    officialUrl:
      'https://www.canada.ca/en/immigration-refugees-citizenship/services/study-canada/work/after-graduation/eligibility.html',
    links: [
      {
        label: 'PGWP Who Can Apply (2025/2026 Language & Field of Study Rules)',
        url: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/study-canada/work/after-graduation/eligibility.html',
      },
    ],
    availability: 'open',
    steps: [
      'Complete a full-time program of at least 8 months (or 900 hours in Quebec) at a PGWP-eligible Canadian DLI',
      'Pass an approved language test: CLB/NCLC 7 in all 4 areas for university degrees, or CLB/NCLC 5 in all 4 areas for college/polytechnic diplomas',
      'Apply within 180 days of receiving written confirmation of program completion',
    ],
    fees: 'CAD $255 (CAD $155 work permit fee + CAD $100 open work permit holder fee)',
    processingTime: 'Around 2 to 5 months',
    discretionary: false,
    lastVerified: '2026-10-16',
    appliesTo: (p) => !alreadyCitizenOrPR(p),
    evaluate: (p) => {
      const caEdu = p.canadianEducation as string | undefined;
      const hasCaEdu =
        caEdu === 'one_two_year' ||
        caEdu === 'one_year' ||
        caEdu === 'two_year' ||
        caEdu === 'three_plus' ||
        caEdu === 'masters_phd';
      const isDegree = caEdu === 'three_plus' || caEdu === 'masters_phd';
      const minLanguage = isDegree ? 7 : 5;

      const checks = [
        req(
          'Graduated from an eligible program (8+ months) at a PGWP-eligible Canadian DLI',
          caEdu !== undefined ? hasCaEdu : undefined,
          {
            pass: 'You completed a post-secondary credential in Canada.',
            fail: 'PGWP strictly requires graduating from an eligible full-time program of at least 8 months at a PGWP-eligible Canadian DLI.',
          },
        ),

        req(
          `Language test result of at least CLB/NCLC ${minLanguage} in all 4 abilities (${isDegree ? 'University Degree: CLB 7' : 'College/Diploma: CLB 5'})`,
          minCLB(p, minLanguage, 'either'),
          {
            fixable: true,
            pass: `Your language score meets the CLB/NCLC ${minLanguage} PGWP requirement.`,
            fail: `PGWP applicants must submit valid language test results (less than 2 years old) showing at least CLB/NCLC ${minLanguage} across all 4 skills.`,
          },
        ),

        isDegree
          ? pass('Field of Study Requirement', 'Graduates of Bachelor\'s, Master\'s, and Doctoral degree programs are exempt from field-of-study restrictions.')
          : warn(
              'Eligible Field of Study Requirement (College / Non-Degree Programs)',
              'If you applied for your study permit on or after November 1, 2024 for a college, polytechnic, or non-degree university program, you must have graduated in an IRCC-approved field of study linked to long-term labour shortages (Healthcare, STEM, Trades, Transport, Agriculture, or Early Childhood Education).',
            ),

        ...admissibilityChecks(p),
      ];

      return { checks };
    },
  },

  // ──────────────────────── 2. LMIA EMPLOYER-SPECIFIC WORK PERMIT ────────────────────────
  {
    id: 'work-lmia',
    name: 'Employer-Specific Work Permit (Temporary Foreign Worker Program — LMIA)',
    category: 'work',
    kind: 'temporary',
    summary:
      'A closed work permit tied to a specific Canadian employer that has obtained a positive Labour Market Impact Assessment (LMIA) from Employment and Social Development Canada (ESDC). Note: ESDC enforces strict caps and refuses low-wage LMIAs in census metropolitan areas with unemployment of 6% or higher.',
    goals: ['work', 'permanent'],
    officialUrl:
      'https://www.canada.ca/en/immigration-refugees-citizenship/services/work-canada.html',
    links: [
      {
        label: 'Work in Canada — Official IRCC Portal',
        url: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/work-canada.html',
      },
      {
        label: 'Hire a Temporary Foreign Worker (LMIA Rules — ESDC)',
        url: 'https://www.canada.ca/en/employment-social-development/services/foreign-workers.html',
      },
    ],
    availability: 'limited',
    availabilityNote: 'Requires a Canadian employer to obtain a positive LMIA (CAD $1,000 employer fee); low-wage LMIAs are suspended in cities with >=6% unemployment.',
    steps: [
      'Secure a formal job offer from a Canadian employer',
      'Employer applies to ESDC and obtains a positive Labour Market Impact Assessment (LMIA)',
      'Submit your employer-specific work permit application to IRCC with the LMIA number and job offer',
    ],
    fees: 'CAD $155 work permit fee (+ CAD $85 biometrics)',
    processingTime: 'Around 4 to 14 weeks depending on country of residence',
    discretionary: true,
    lastVerified: '2026-10-16',
    appliesTo: (p) => !alreadyCitizenOrPR(p),
    evaluate: (p) => {
      const hasJobOffer = p.jobOffer === 'yes' && p.jobOfferFullTime !== 'no';

      const checks = [
        req(
          'Full-time job offer from a Canadian employer',
          p.jobOffer !== undefined ? hasJobOffer : undefined,
          {
            fixable: true,
            pass: 'You indicated a full-time Canadian job offer.',
            fail: 'Requires a formal job offer from a Canadian employer.',
          },
        ),

        req(
          'Employer holds (or obtains) a positive Labour Market Impact Assessment (LMIA)',
          p.jobOfferType === 'lmia' ? true : p.jobOfferType === 'lmia_exempt' ? false : undefined,
          {
            fixable: true,
            pass: 'Your job offer is supported by a positive LMIA.',
            unknown: 'Your Canadian employer must apply to ESDC and receive an approved positive LMIA before you can apply for this work permit.',
            fail: 'Requires a positive LMIA (if your job offer is LMIA-exempt, check Mobilité Francophone or Intra-Company Transferee instead).',
          },
        ),

        ...admissibilityChecks(p),
      ];

      return { checks };
    },
  },

  // ──────────────────────── 3. FRANCOPHONE MOBILITY PROGRAM ────────────────────────
  {
    id: 'work-francophone-mobility',
    name: 'Francophone Mobility Work Permit (Mobilité Francophone — LMIA-Exempt)',
    category: 'work',
    kind: 'temporary',
    summary:
      'An LMIA-exempt employer-specific work permit (Exemption Code C16) for foreign nationals with intermediate French speaking and listening skills (NCLC 5 or higher) who have a job offer in any TEER 0–5 occupation (except primary agriculture TEER 4/5) outside the province of Quebec.',
    goals: ['work', 'permanent'],
    officialUrl:
      'https://www.canada.ca/en/immigration-refugees-citizenship/services/work-canada/special-instructions/francophone-mobility.html',
    links: [
      {
        label: 'Francophone Mobility Work Permit — Who Can Apply',
        url: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/work-canada/special-instructions/francophone-mobility/eligibility.html',
      },
    ],
    availability: 'open',
    steps: [
      'Demonstrate French speaking and listening skills at NCLC 5 or higher (TEF Canada or TCF Canada)',
      'Obtain a job offer in any occupation (except primary agriculture TEER 4/5) in any province or territory outside Quebec',
      'Have your employer submit an Offer of Employment in the IRCC Employer Portal (CAD $230 employer compliance fee, no LMIA required)',
      'Apply online for your work permit',
    ],
    fees: 'CAD $155 work permit fee (+ CAD $230 paid by employer)',
    processingTime: 'Around 4 to 10 weeks',
    discretionary: false,
    lastVerified: '2026-10-16',
    appliesTo: (p) => !alreadyCitizenOrPR(p),
    evaluate: (p) => {
      const frCLB = p.frenchCLB ?? 0;
      const isFrench5 = frCLB >= 5;
      const hasJobOffer = p.jobOffer === 'yes';
      const isOutsideQuebec = p.jobOfferProvince !== 'QC';

      const checks = [
        req(
          'French speaking and listening proficiency of at least NCLC 5',
          p.frenchCLB !== undefined ? isFrench5 : undefined,
          {
            fixable: true,
            pass: `Your French benchmark is NCLC ${frCLB} (meets NCLC 5 requirement).`,
            fail: `Requires at least NCLC 5 in French speaking and listening (your current score is NCLC ${frCLB}).`,
          },
        ),

        req(
          'Job offer from an employer outside Quebec',
          hasJobOffer && isOutsideQuebec
            ? true
            : hasJobOffer && !isOutsideQuebec
              ? false
              : p.jobOffer !== undefined
                ? false
                : undefined,
          {
            fixable: true,
            pass: 'You have a job offer outside Quebec.',
            fail: 'Requires an Offer of Employment from a Canadian employer located in one of the 9 provinces or 3 territories outside Quebec.',
          },
        ),

        ...admissibilityChecks(p),
      ];

      return { checks };
    },
  },

  // ──────────────────────── 4. INTRA-COMPANY TRANSFEREES (ICT) ────────────────────────
  {
    id: 'work-ict',
    name: 'Intra-Company Transferees (ICT — International Mobility Program)',
    category: 'work',
    kind: 'temporary',
    summary:
      'An LMIA-exempt work permit (R205(a) — C61, C62, C63) for executives, senior managers, or specialized proprietary knowledge workers transferring from a foreign enterprise to a parent, subsidiary, branch, or affiliate in Canada after at least 1 continuous year of full-time employment abroad.',
    goals: ['work'],
    officialUrl:
      'https://www.canada.ca/en/immigration-refugees-citizenship/corporate/publications-manuals/operational-bulletins-manuals/temporary-residents/foreign-workers/exemption-codes/intra-company-transferees.html',
    links: [
      {
        label: 'Intra-Company Transferees (R205(a) – C61, C62, C63) Official Manual',
        url: 'https://www.canada.ca/en/immigration-refugees-citizenship/corporate/publications-manuals/operational-bulletins-manuals/temporary-residents/foreign-workers/exemption-codes/intra-company-transferees.html',
      },
    ],
    availability: 'open',
    steps: [
      'Have at least 1 continuous year of full-time employment (within the past 3 years) with the foreign multinational enterprise',
      'Transfer to a qualifying Canadian parent, branch, subsidiary, or affiliate in an Executive (C61), Senior Managerial (C62), or Specialized Knowledge (C63) capacity',
      'Employer submits Offer of Employment in the IRCC Employer Portal (CAD $230 compliance fee)',
      'Apply for LMIA-exempt ICT work permit',
    ],
    fees: 'CAD $155 work permit fee (+ CAD $230 employer compliance fee)',
    processingTime: 'Around 4 to 8 weeks',
    discretionary: true,
    lastVerified: '2026-10-16',
    appliesTo: (p) => !alreadyCitizenOrPR(p),
    evaluate: (p) => {
      const isIct = p.intraCompany === 'yes';
      const isSenior = p.skillLevel === 'teer0_1';
      const has1YrForeign = (p.foreignExpYears ?? 0) >= 1;

      const checks = [
        req(
          'Currently employed (1+ continuous year) by a multinational company with a Canadian branch/affiliate',
          p.intraCompany !== undefined ? isIct && has1YrForeign : undefined,
          {
            pass: 'You indicated 1+ year of employment with a company that has a Canadian branch or affiliate.',
            fail: 'ICT requires at least 1 continuous year of full-time employment with a foreign enterprise that has a parent, branch, subsidiary, or affiliate in Canada.',
          },
        ),

        req(
          'Executive, senior managerial, or specialized knowledge role (TEER 0 or 1)',
          p.skillLevel !== undefined ? isSenior : undefined,
          {
            pass: 'Role is at the executive, managerial, or professional specialized knowledge level.',
            fail: 'ICT is strictly limited to executives, senior managers, or workers holding advanced proprietary knowledge.',
          },
        ),

        ...admissibilityChecks(p),
      ];

      return { checks };
    },
  },

  // ──────────────────────── 5. INTERNATIONAL EXPERIENCE CANADA (IEC) ────────────────────────
  {
    id: 'work-iec',
    name: 'International Experience Canada (IEC — Working Holiday & Young Professionals)',
    category: 'work',
    kind: 'temporary',
    summary:
      'Youth mobility work permits for citizens of 35+ partner countries (ages 18–30 or 18–35 depending on bilateral agreement). Includes Working Holiday (open work permit), Young Professionals (employer-specific), and International Co-op.',
    goals: ['work', 'visit'],
    officialUrl:
      'https://www.canada.ca/en/immigration-refugees-citizenship/services/work-canada/iec.html',
    links: [
      {
        label: 'IEC Official Portal & Country Eligibility',
        url: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/work-canada/iec.html',
      },
    ],
    availability: 'invitation_only',
    availabilityNote: 'Candidates enter an IEC pool and must receive an Invitation to Apply (ITA) before submitting a work permit application.',
    steps: [
      'Create an IEC profile for your country of citizenship and enter the pool',
      'Receive an Invitation to Apply (ITA) in an IEC round of invitations',
      'Submit work permit application within 20 days and show CAD $2,500+ settlement funds plus comprehensive health insurance',
    ],
    fees: 'CAD $179.75 IEC participation fee (+ CAD $100 open work permit fee for Working Holiday)',
    processingTime: 'Around 4 to 8 weeks after receiving ITA',
    discretionary: false,
    lastVerified: '2026-10-16',
    appliesTo: (p) => !alreadyCitizenOrPR(p),
    evaluate: (p) => {
      let matchingCountry = null;
      if (p.citizenships && p.citizenships.length > 0) {
        for (const code of p.citizenships) {
          const c = getCountry(code);
          if (c?.iec) {
            matchingCountry = c;
            break;
          }
        }
      }

      const hasIecCountry = matchingCountry !== null;
      const userAge = p.age ?? 25;
      const ageValid =
        matchingCountry && matchingCountry.iec
          ? userAge >= matchingCountry.iec.minAge && userAge <= matchingCountry.iec.maxAge
          : undefined;

      const checks = [
        req(
          'Citizen of an IEC bilateral Youth Mobility Agreement partner country',
          p.citizenships !== undefined ? hasIecCountry : undefined,
          {
            pass: `Your citizenship (${matchingCountry?.name}) has a bilateral IEC agreement with Canada.`,
            fail: 'Your country of citizenship does not have a bilateral IEC Youth Mobility Agreement with Canada.',
            fixable: false,
          },
        ),

        req(
          'Within your country\'s eligible age range (18–30 or 18–35)',
          p.age !== undefined && matchingCountry !== null ? ageValid : undefined,
          {
            pass: `Age ${userAge} is within the ${matchingCountry?.iec?.minAge}–${matchingCountry?.iec?.maxAge} age limit for ${matchingCountry?.name}.`,
            fail: `Age ${userAge} is outside the eligible age range (${matchingCountry?.iec?.minAge ?? 18}–${matchingCountry?.iec?.maxAge ?? 35}).`,
            fixable: false,
          },
        ),

        warn(
          'IEC Pool Lottery Invitation & Annual Country Quota',
          'Entering the IEC pool does not guarantee a work permit; you must receive an Invitation to Apply (ITA) before annual country quotas fill.',
        ),

        ...admissibilityChecks(p),
      ];

      return { checks };
    },
  },

  // ──────────────────────── 6. SPOUSAL OPEN WORK PERMIT (SOWP) ────────────────────────
  {
    id: 'work-sowp',
    name: 'Spousal Open Work Permit (Spouses of Eligible Workers & Graduate Students)',
    category: 'work',
    kind: 'temporary',
    summary:
      'Open work permit for the spouse or common-law partner of a foreign worker or student in Canada. Under strict 2025/2026 IRCC rules, eligible only if your spouse is: (1) a worker in TEER 0 or 1, or in select shortage TEER 2/3 occupations (with 16+ months left on their work permit), or on an economic PR pathway; OR (2) a student in a Master\'s (16+ months), Doctoral (PhD), or select professional degree program.',
    goals: ['work', 'join_family'],
    officialUrl:
      'https://www.canada.ca/en/immigration-refugees-citizenship/services/work-canada/permit/temporary/open-work-permit-spouses-dependent-children/eligibility.html',
    links: [
      {
        label: 'Open Work Permits for Spouses of Foreign Workers (Updated June 2026)',
        url: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/work-canada/permit/temporary/open-work-permit-spouses-dependent-children/eligibility.html',
      },
    ],
    availability: 'open',
    availabilityNote: 'Restricted in 2025/2026: Spouses of undergraduate/college students and spouses of low-skilled (TEER 4/5) or non-listed TEER 2/3 workers are no longer eligible.',
    steps: [
      'Confirm your spouse in Canada holds a qualifying study permit (Master\'s 16+ months, PhD, or eligible professional degree) OR qualifying work permit (TEER 0/1 or select TEER 2/3 with 16+ months remaining validity, or active PR application)',
      'Gather proof of genuine marriage/common-law relationship and proof of your spouse\'s occupation/study program and permit validity',
      'Apply online for an Open Work Permit (CAD $255)',
    ],
    fees: 'CAD $255 (CAD $155 work permit fee + CAD $100 open work permit holder fee)',
    processingTime: 'Around 2 to 4 months',
    discretionary: false,
    lastVerified: '2026-10-16',
    appliesTo: (p) => isPartnered(p) === true && !alreadyCitizenOrPR(p),
    evaluate: (p) => {
      const spWorkerOrStudent = p.spouseStatus === 'worker' || p.spouseStatus === 'student';

      const checks = [
        req(
          'Spouse or common-law partner holds a valid Canadian work permit or study permit',
          p.spouseStatus !== undefined ? spWorkerOrStudent : undefined,
          {
            pass: `Your spouse/partner holds a Canadian ${p.spouseStatus} permit.`,
            fail: 'Requires a spouse or common-law partner who holds a valid Canadian work permit or study permit.',
          },
        ),

        warn(
          '2025/2026 IRCC Restriction on Spouse\'s Occupation / Study Level & 16-Month Validity',
          'As of January 21, 2025 (updated June 2026): If your spouse is a worker, they must work in TEER 0/1 or a listed shortage TEER 2/3 occupation AND have at least 16 months remaining on their work permit (unless they have applied for economic PR). If your spouse is a student, they must be in a Master\'s (16+ months), PhD, or select professional degree program (MD, DDS, JD, PharmD, DVM, BScN, BEd, BEng).',
        ),

        ...admissibilityChecks(p),
      ];

      return { checks };
    },
  },

  // ──────────────────────── 7. WORK PERMITS FOR REFUGEE / ASYLUM CLAIMANTS ────────────────────────
  {
    id: 'work-refugee-claimant',
    name: 'Open Work Permit for In-Canada Refugee Claimants & Protected Persons',
    category: 'work',
    kind: 'temporary',
    summary:
      'Fee-exempt open work permit for individuals physically inside Canada whose refugee claim has been referred to the Immigration and Refugee Board (IRB) or who have been recognized as Protected Persons in Canada.',
    goals: ['work', 'protection'],
    officialUrl:
      'https://www.canada.ca/en/immigration-refugees-citizenship/services/refugees/protection.html',
    links: [
      {
        label: 'Refugee Protection in Canada — Official IRCC Guide',
        url: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/refugees/protection.html',
      },
    ],
    availability: 'open',
    steps: [
      'Must be physically inside Canada with an eligible refugee claim referred to the IRB (or Protected Person status)',
      'Complete your upfront Immigration Medical Exam (IME)',
      'Receive your open work permit (fee-exempt)',
    ],
    fees: 'Free (CAD $0)',
    processingTime: 'Around 1 to 3 months after medical exam is completed',
    discretionary: false,
    lastVerified: '2026-10-16',
    appliesTo: (p) =>
      canadaStatus(p) === 'asylum_claimant' ||
      canadaStatus(p) === 'protected_person' ||
      (p.residenceCountry === 'CA' && p.goals?.includes('protection') === true),
    evaluate: (p) => {
      const isInside = p.residenceCountry === 'CA';
      const isClaimant = canadaStatus(p) === 'asylum_claimant' || canadaStatus(p) === 'protected_person';

      const checks = [
        req(
          'Physically inside Canada as a registered refugee claimant or Protected Person',
          p.residenceCountry !== undefined ? isInside && isClaimant : undefined,
          {
            pass: 'You are in Canada as a refugee claimant or protected person.',
            fail: 'This work permit is strictly for refugee claimants and protected persons who are physically inside Canada.',
            fixable: false,
          },
        ),
        ...admissibilityChecks(p),
      ];

      return { checks };
    },
  },
];
