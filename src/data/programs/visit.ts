/**
 * Visiting and Entering Canada Programs
 * Official Source: IRCC Visit Canada
 * https://www.canada.ca/en/immigration-refugees-citizenship/services/visit-canada.html
 */

import type { Program } from '../../engine/types';
import {
  req,
  pass,
  fail,
  warn,
  info,
  entryRequirement,
  hasCitizenship,
  canadaStatus,
  hasRelative,
  admissibilityChecks,
  alreadyCitizenOrPR,
} from '../../engine/helpers';

export const visitPrograms: Program[] = [
  // ──────────────────────── 1. VISITOR VISA (TRV) ────────────────────────
  {
    id: 'visit-trv',
    name: 'Visitor Visa (Temporary Resident Visa - TRV)',
    category: 'visit',
    kind: 'temporary',
    summary:
      'Official document placed in your passport showing you meet the requirements to enter Canada as a temporary resident (tourist, visiting friends/family, or conducting business). Usually valid for up to 10 years or until passport expiry, allowing stays of up to 6 months per entry.',
    goals: ['visit', 'visit_family', 'business_visit'],
    officialUrl:
      'https://www.canada.ca/en/immigration-refugees-citizenship/services/visit-canada/apply-visitor-visa.html',
    links: [
      {
        label: 'Eligibility & Requirements',
        url: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/visit-canada/eligibility.html',
      },
      {
        label: 'Find a Visa Application Centre (VAC) for Biometrics',
        url: 'https://www.canada.ca/en/immigration-refugees-citizenship/corporate/contact-ircc/offices/find-visa-application-centre.html',
      },
      {
        label: 'Check Processing Times by Country',
        url: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/application/check-processing-times.html',
      },
    ],
    availability: 'open',
    steps: [
      'Gather documents: valid passport, proof of financial support, travel itinerary/purpose, ties to home/residence country (job, property, family)',
      'Apply online through the IRCC secure portal',
      'Give biometrics (fingerprints & photo) at your nearest Visa Application Centre (VAC)',
      'Submit your original passport upon receiving the passport request letter',
    ],
    fees: 'CAD 100 per person + CAD 85 biometrics fee',
    processingTime: 'Varies from 2 weeks to several months depending on country of residence',
    discretionary: true,
    lastVerified: '2026-10-15',
    appliesTo: (p) => !alreadyCitizenOrPR(p),
    evaluate: (p) => {
      const entry = entryRequirement(p);
      const isVisaReq = entry === 'visa' || entry === 'eta_conditional';

      const checks = [
        req(
          'Requires a Temporary Resident Visa based on nationality',
          entry !== undefined ? isVisaReq : undefined,
          {
            pass: `Your country of citizenship requires a Visitor Visa (TRV) to enter Canada.`,
            fail: entry === 'none'
              ? 'You are a US citizen or Canadian citizen/PR and do not need a visa or eTA to visit Canada.'
              : 'You are from a visa-exempt country. You should apply for an Electronic Travel Authorization (eTA) instead of a visitor visa.',
          },
        ),

        req(
          'Valid passport or recognized travel document',
          p.passport !== undefined ? p.passport === 'valid' : undefined,
          {
            pass: 'You have a valid passport.',
            fail: 'A valid passport or official travel document recognized by Canada is strictly required.',
          },
        ),

        req(
          'Proof of financial support for duration of stay',
          p.fundsCAD !== undefined ? p.fundsCAD >= 3000 : undefined,
          {
            fixable: true,
            pass: `Reported funds of CAD $${p.fundsCAD?.toLocaleString()} can support temporary travel.`,
            fail: 'Visitor visa applicants must prove they have adequate funds to cover all travel, accommodation, and living costs in Canada without working.',
          },
        ),

        // Discretionary assessment note on ties to home country
        warn(
          'Ties to country of residence & intent to leave',
          'Officers assess whether you will leave Canada at the end of your stay. Applicants living in third countries under temporary status (e.g. Syrians in Türkiye, refugees, or temporary residents) are scrutinized closely on their ties (employment, family, residence permit) to their country of residence.',
        ),

        ...admissibilityChecks(p),
      ];

      const notes: string[] = [
        'You can apply online from wherever you currently reside legally. Biometrics are collected at any authorized VAC (for example, in Istanbul or Ankara if residing in Türkiye).',
        'Dual Intent: Having an active immigration or refugee application does not automatically bar you from receiving a visitor visa, but you must satisfy the officer that you will leave when your authorized visitor stay ends.',
      ];

      return { checks, notes };
    },
  },

  // ──────────────────────── 2. ELECTRONIC TRAVEL AUTHORIZATION (eTA) ────────────────────────
  {
    id: 'visit-eta',
    name: 'Electronic Travel Authorization (eTA)',
    category: 'visit',
    kind: 'temporary',
    summary:
      'An entry requirement for visa-exempt foreign nationals travelling to Canada by air. Electronically linked to your passport and valid for up to 5 years or until your passport expires. Cost is only CAD $7 and approval is usually emailed within minutes.',
    goals: ['visit', 'visit_family', 'business_visit', 'transit'],
    officialUrl:
      'https://www.canada.ca/en/immigration-refugees-citizenship/services/visit-canada/eta.html',
    links: [
      {
        label: 'Apply Online for eTA',
        url: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/visit-canada/eta/apply.html',
      },
      {
        label: 'Who can apply for an eTA',
        url: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/visit-canada/eta/eligibility.html',
      },
    ],
    availability: 'open',
    steps: [
      'Have your valid passport from a visa-exempt country ready',
      'Fill out the simple online form on the official canada.ca website (takes ~5 minutes)',
      'Pay CAD $7 using a credit or debit card',
      'Receive authorization email (often within minutes)',
    ],
    fees: 'CAD 7',
    processingTime: 'Usually within minutes (up to 72 hours if additional documents requested)',
    discretionary: false,
    lastVerified: '2026-10-15',
    appliesTo: (p) => !alreadyCitizenOrPR(p),
    evaluate: (p) => {
      const entry = entryRequirement(p);
      const isEta = entry === 'eta';

      const checks = [
        req(
          'Citizen of a visa-exempt country',
          entry !== undefined ? isEta : undefined,
          {
            pass: 'Your country of citizenship is visa-exempt for air travel to Canada.',
            fail: entry === 'none'
              ? 'US citizens do not need an eTA or visa to enter Canada.'
              : 'Your country of citizenship requires a Visitor Visa (TRV) or meets conditional eTA criteria.',
          },
        ),
        req('Valid passport', p.passport !== undefined ? p.passport === 'valid' : undefined),
        ...admissibilityChecks(p),
      ];

      return {
        checks,
        notes: [
          'Beware of fraudulent third-party websites charging high fees. The official eTA costs only CAD $7 on canada.ca.',
        ],
      };
    },
  },

  // ──────────────────────── 3. EXPANDED / CONDITIONAL eTA (CAN+) ────────────────────────
  {
    id: 'visit-eta-conditional',
    name: 'Conditional eTA (Expanded eTA for Eligible Visa-Required Citizens)',
    category: 'visit',
    kind: 'temporary',
    summary:
      'Citizens from 14 select countries (including Brazil, Mexico, Philippines, Morocco, Costa Rica, Thailand, Panama, etc.) can apply for an eTA instead of a visa IF they are flying to Canada AND they either held a Canadian visitor visa in the past 10 years OR hold a valid US non-immigrant visa.',
    goals: ['visit', 'visit_family', 'business_visit', 'transit'],
    officialUrl:
      'https://www.canada.ca/en/immigration-refugees-citizenship/services/visit-canada/eta/eligibility/eta-x.html',
    links: [
      {
        label: 'Expanded eTA Eligible Countries and Rules',
        url: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/visit-canada/eta/eligibility/eta-x.html',
      },
    ],
    availability: 'open',
    steps: [
      'Confirm you hold a valid US non-immigrant visa OR a Canadian visitor visa issued in the past 10 years',
      'Ensure you are travelling to Canada by air',
      'Apply online on canada.ca for CAD $7',
    ],
    fees: 'CAD 7',
    processingTime: 'Usually minutes to 72 hours',
    discretionary: false,
    lastVerified: '2026-10-15',
    appliesTo: (p) => !alreadyCitizenOrPR(p),
    evaluate: (p) => {
      const entry = entryRequirement(p);
      const isCondCountry = entry === 'eta_conditional';
      const hasUsVisa = p.usStatus === 'us_nonimmigrant_visa' || p.usStatus === 'us_green_card';
      const hadCaVisa = p.heldCanadianVisa10y === 'yes';

      const checks = [
        req(
          'Citizen of an eligible expanded-eTA country (e.g. Philippines, Brazil, Mexico, Morocco, etc.)',
          entry !== undefined ? isCondCountry : undefined,
          {
            pass: 'Your country of citizenship is eligible for the expanded eTA program.',
            fail: 'This facilitation is only available to citizens of designated countries.',
          },
        ),

        req(
          'Holds a valid US non-immigrant visa OR held a Canadian visitor visa in past 10 years',
          hasUsVisa || hadCaVisa ? true : p.usStatus !== undefined && p.heldCanadianVisa10y !== undefined ? false : undefined,
          {
            pass: hasUsVisa
              ? 'You hold a valid US non-immigrant visa.'
              : 'You held a Canadian visitor visa within the last 10 years.',
            fail: 'You must hold either a valid US non-immigrant visa or have held a Canadian visitor visa in the last 10 years. Otherwise, you must apply for a standard Visitor Visa (TRV).',
          },
        ),

        ...admissibilityChecks(p),
      ];

      return {
        checks,
        notes: [
          'Note: If entering Canada by car, bus, train, or boat at a land border, you still need a regular visitor visa. The conditional eTA is valid ONLY when arriving by air.',
        ],
      };
    },
  },

  // ──────────────────────── 4. US CITIZENS & GREEN CARD HOLDERS ────────────────────────
  {
    id: 'visit-us-resident',
    name: 'Entry for US Citizens & Lawful Permanent Residents (Green Card)',
    category: 'visit',
    kind: 'temporary',
    summary:
      'United States citizens do not require a passport, visa, or eTA to enter Canada (though a valid US passport or WHTI document is recommended). Lawful permanent residents of the US (Green Card holders) are exempt from visa requirements and need only an official eTA and their Green Card.',
    goals: ['visit', 'visit_family', 'business_visit', 'transit'],
    officialUrl:
      'https://www.canada.ca/en/immigration-refugees-citizenship/services/visit-canada/entry-requirements-country.html#us-citizens',
    links: [
      {
        label: 'US Citizens & Green Card Holders Requirements',
        url: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/visit-canada/entry-requirements-country.html#us-citizens',
      },
    ],
    availability: 'open',
    steps: [
      'US Citizens: Present valid US passport or Western Hemisphere Travel Initiative compliant document at border',
      'US Green Card holders: Apply for an eTA online (CAD $7) and carry valid Green Card and passport',
    ],
    fees: 'Free for US Citizens; CAD 7 eTA for US Green Card holders',
    processingTime: 'Instant at Port of Entry',
    discretionary: false,
    lastVerified: '2026-10-15',
    appliesTo: (p) => hasCitizenship(p, 'US') === true || p.usStatus === 'us_green_card' || p.usStatus === 'us_citizen',
    evaluate: (p) => {
      const isUsCitizen = hasCitizenship(p, 'US') === true || p.usStatus === 'us_citizen';
      const isGreenCard = p.usStatus === 'us_green_card';

      const checks = [
        pass(
          'US Citizen or Green Card Holder',
          isUsCitizen
            ? 'As a US citizen, you are completely exempt from visa and eTA requirements.'
            : 'As a US Green Card holder, you are visa-exempt and only require an eTA to fly to Canada.',
        ),
        ...admissibilityChecks(p),
      ];

      return {
        checks,
        notes: [
          'Past DUI / impaired driving convictions in the US make individuals inadmissible to Canada. Ensure you check criminal admissibility before travelling.',
        ],
      };
    },
  },

  // ──────────────────────── 5. SUPER VISA (PARENTS & GRANDPARENTS) ────────────────────────
  {
    id: 'visit-super-visa',
    name: 'Super Visa for Parents and Grandparents (Up to 5 Years per Entry)',
    category: 'visit',
    kind: 'temporary',
    summary:
      'A multi-entry visa (valid up to 10 years) specifically for parents and grandparents of Canadian citizens and permanent residents. Lets you stay in Canada for up to 5 years at a time (plus 2-year extensions). With the PGP permanent residence stream currently paused by IRCC, the Super Visa is the main active pathway for parents and grandparents.',
    goals: ['visit_family', 'visit', 'join_family'],
    officialUrl:
      'https://www.canada.ca/en/immigration-refugees-citizenship/services/visit-canada/parent-grandparent-super-visa.html',
    links: [
      {
        label: 'Super Visa Official Eligibility & LICO Income Table',
        url: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/visit-canada/parent-grandparent-super-visa/eligibility.html',
      },
    ],
    availability: 'open',
    steps: [
      'Must be outside Canada when you submit your Super Visa application',
      'Get a signed invitation letter from your Canadian citizen or PR child/grandchild promising financial support',
      'Provide proof your child/grandchild meets the Minimum Necessary Income (LICO) for their household size',
      'Purchase qualifying medical insurance (minimum CAD $100,000 coverage for at least 1 year from a Canadian or approved international insurer)',
      'Complete an Immigration Medical Exam (IME)',
    ],
    fees: 'CAD $100 + CAD $85 biometrics (+ medical exam and mandatory health insurance)',
    processingTime: 'Around 1 to 4 months depending on country of residence',
    discretionary: false,
    lastVerified: '2026-10-16',
    appliesTo: (p) => !alreadyCitizenOrPR(p),
    evaluate: (p) => {
      const hasChildOrGrandchild = hasRelative(p, 'child', 'grandchild');
      const isOutside = p.residenceCountry !== 'CA';

      const checks = [
        req(
          'Parent or grandparent of a Canadian citizen or Permanent Resident',
          hasChildOrGrandchild !== undefined ? hasChildOrGrandchild : undefined,
          {
            pass: 'You have a child or grandchild who is a Canadian citizen or permanent resident.',
            fail: 'The Super Visa is strictly reserved for parents and grandparents of Canadian citizens or PRs.',
          },
        ),

        req('Applying from outside Canada', isOutside, {
          pass: 'You are currently outside Canada.',
          fail: 'Under IRCC rules, you must be outside Canada when you apply for a Super Visa and have it printed by a visa office outside Canada.',
        }),

        warn(
          'Host Child/Grandchild LICO Income & Mandatory $100,000 Medical Insurance',
          'Your child or grandchild in Canada must meet the Low-Income Cut-Off (LICO) household income threshold, and you must provide proof of paid or approved-quote medical insurance ($100,000+ coverage for 1 year) and pass an upfront medical exam.',
        ),

        ...admissibilityChecks(p),
      ];

      return {
        checks,
        notes: [
          'Because IRCC has paused new intake for the Parents and Grandparents permanent residence program (PGP), the Super Visa is the primary open pathway to live long-term with your children or grandchildren in Canada (5 years per entry + 2-year extensions).',
        ],
      };
    },
  },

  // ──────────────────────── 6. VISITOR RECORD (EXTENSION OF STAY) ────────────────────────
  {
    id: 'visit-visitor-record',
    name: 'Visitor Record (Extend Your Stay Inside Canada)',
    category: 'visit',
    kind: 'temporary',
    summary:
      'For temporary residents currently inside Canada who want to extend their authorized stay as a visitor (or change status from student/worker to visitor) before their current status expires.',
    goals: ['visit', 'visit_family'],
    officialUrl:
      'https://www.canada.ca/en/immigration-refugees-citizenship/services/visit-canada/extend-stay.html',
    links: [
      {
        label: 'Extend Your Stay in Canada (Visitor Record)',
        url: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/visit-canada/extend-stay.html',
      },
    ],
    availability: 'open',
    steps: [
      'Apply online from inside Canada before your current status expires',
      'Provide explanation and proof of financial support for your extended stay',
      'Remain legally in Canada on "maintained status" while awaiting a decision',
    ],
    fees: 'CAD $100',
    processingTime: 'Around 3 to 4 months online',
    discretionary: true,
    lastVerified: '2026-10-16',
    appliesTo: (p) => canadaStatus(p) === 'visitor' || canadaStatus(p) === 'student' || canadaStatus(p) === 'worker',
    evaluate: (p) => {
      const isInside = p.residenceCountry === 'CA';
      const checks = [
        req(
          'Currently inside Canada on valid temporary resident status',
          isInside,
          {
            pass: 'You are currently inside Canada and can apply to extend your stay.',
            fail: 'A Visitor Record can only be applied for from inside Canada before your current status expires.',
          },
        ),
        warn('Discretionary Officer Assessment & Financial Support', 'You must show sufficient funds to support yourself without working in Canada.'),
        ...admissibilityChecks(p),
      ];
      return { checks };
    },
  },

  // ──────────────────────── 7. TEMPORARY RESIDENT PERMIT (TRP) ────────────────────────
  {
    id: 'visit-trp',
    name: 'Temporary Resident Permit (TRP — For Inadmissible Individuals)',
    category: 'visit',
    kind: 'temporary',
    summary:
      'An exceptional discretionary permit for individuals who are legally inadmissible to Canada (due to criminality, medical inadmissibility, or misrepresentation) but have a compelling reason to enter Canada that outweighs any risk to Canadians.',
    goals: ['visit', 'work', 'study'],
    officialUrl:
      'https://www.canada.ca/en/immigration-refugees-citizenship/services/admissibility-enforcement/temporary-resident-permit.html',
    links: [
      {
        label: 'Temporary Resident Permits — Official IRCC Guide',
        url: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/admissibility-enforcement/temporary-resident-permit.html',
      },
      {
        label: 'Overcome Criminal Convictions (Rehabilitation)',
        url: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/inadmissibility/overcome-criminal-convictions.html',
      },
    ],
    availability: 'open',
    steps: [
      'Provide court/police records, rehabilitation evidence, and documentation proving a compelling need to enter Canada',
      'Pay the non-refundable TRP processing fee',
    ],
    fees: 'CAD $239.75 (non-refundable processing fee)',
    processingTime: 'Varies by visa office; discretionary review',
    discretionary: true,
    lastVerified: '2026-10-16',
    appliesTo: (p) =>
      p.criminality === 'minor' ||
      p.criminality === 'serious' ||
      p.history?.includes('misrepresentation') === true ||
      p.history?.includes('refused_canada_visa') === true,
    evaluate: (p) => {
      const checks = [
        warn(
          'Exceptional Discretionary Remedy for Inadmissibility',
          'A Temporary Resident Permit (TRP) is only issued when an officer determines your need to enter Canada is compelling and outweighs any health or safety risk to Canadian society.',
        ),
      ];
      return { checks };
    },
  },
];
