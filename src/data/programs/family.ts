/**
 * Family Class Sponsorship Programs
 * Official Source: IRCC Sponsor your family members to immigrate to Canada
 * https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/family-sponsorship.html
 */

import type { Program } from '../../engine/types';
import {
  req,
  pass,
  fail,
  warn,
  info,
  unknown,
  isPartnered,
  partnerIsCanadian,
  hasRelative,
  canadaStatus,
  admissibilityChecks,
  alreadyCitizenOrPR,
} from '../../engine/helpers';

export const familyPrograms: Program[] = [
  // ──────────────────────── 1. SPOUSAL / COMMON-LAW SPONSORSHIP (OUTLAND) ────────────────────────
  {
    id: 'family-spouse-outland',
    name: 'Sponsor Your Spouse or Common-Law Partner (Outland / Family Class)',
    category: 'family',
    kind: 'permanent',
    summary:
      'For spouses or common-law partners of Canadian citizens or permanent residents who are currently living outside Canada (or who prefer outland processing with right of appeal). Sponsor must sign a 3-year financial undertaking. No minimum income is required unless sponsoring with dependent children who have dependent children.',
    goals: ['permanent', 'join_family'],
    officialUrl:
      'https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/family-sponsorship/spouse-partner-children.html',
    links: [
      {
        label: 'Spousal Sponsorship Official Guide (IMM 5289)',
        url: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/application/application-forms-guides/guide-5289-sponsor-your-spouse-common-law-partner-conjugal-partner-dependent-child-complete-guide.html',
      },
      {
        label: 'Who can be a sponsor',
        url: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/family-sponsorship/spouse-partner-children/eligibility.html',
      },
    ],
    availability: 'open',
    steps: [
      'Ensure sponsor is 18+, a Canadian citizen or PR, and not barred by the 5-year sponsorship rule',
      'Gather relationship proof: marriage certificate, photos, communications, joint finances/leases',
      'Submit the complete sponsorship and PR application online via the Permanent Residence Portal',
      'Complete medical exam, biometrics, and background checks',
      'Receive Confirmation of Permanent Residence (COPR)',
    ],
    fees: 'CAD 1,080 (CAD 75 sponsorship + CAD 490 processing + CAD 515 right of PR fee)',
    processingTime: 'Around 10 to 12 months',
    discretionary: false,
    lastVerified: '2026-10-15',
    appliesTo: (p) => !alreadyCitizenOrPR(p) && isPartnered(p) === true,
    evaluate: (p) => {
      const isCanadianSpouse = partnerIsCanadian(p);

      const checks = [
        req(
          'Spouse or Common-Law Partner is a Canadian Citizen or Permanent Resident',
          isCanadianSpouse,
          {
            pass: `Your spouse/partner is a Canadian citizen or permanent resident.`,
            fail: 'Spousal sponsorship requires a spouse or common-law partner who is already a Canadian citizen or permanent resident.',
          },
        ),

        req(
          'Legally married or established common-law relationship (12+ consecutive months cohabitation)',
          p.maritalStatus !== undefined
            ? p.maritalStatus === 'married' || p.maritalStatus === 'common_law'
            : undefined,
          {
            pass: `You are ${p.maritalStatus === 'married' ? 'legally married' : 'in an established common-law union'}.`,
            fail: 'Requires either a legal marriage recognized under Canadian law OR 12 continuous months of cohabitation.',
          },
        ),

        warn(
          '5-Year Sponsorship Bar',
          'If your Canadian sponsor was themselves sponsored as a spouse or partner to Canada, they cannot sponsor a new spouse until 5 years have passed since they became a permanent resident.',
        ),

        warn(
          'Non-Declared Family Members (Regulation 117(9)(d))',
          'If your spouse was already a Canadian citizen/PR when you married, ensure you were declared. In Canada, failure to declare a spouse or child on a prior PR application can permanently bar them from family sponsorship.',
        ),

        ...admissibilityChecks(p),
      ];

      return {
        checks,
        notes: [
          'No minimum income: Unlike parent sponsorship, there is NO minimum income required to sponsor a spouse or partner, as long as the sponsor is not receiving social assistance (welfare) for reasons other than disability.',
        ],
      };
    },
  },

  // ──────────────────────── 2. INLAND SPOUSAL SPONSORSHIP (+ OPEN WORK PERMIT) ────────────────────────
  {
    id: 'family-spouse-inland',
    name: 'Spouse or Common-Law Partner in Canada Class (Inland + Open Work Permit)',
    category: 'family',
    kind: 'permanent',
    summary:
      'For spouses and common-law partners who are already living together inside Canada. Eligible applicants can apply for a Spousal Open Work Permit at the same time, allowing them to work in Canada while their PR application is processed.',
    goals: ['permanent', 'join_family', 'work'],
    officialUrl:
      'https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/family-sponsorship/spouse-partner-children.html',
    links: [
      {
        label: 'Inland Sponsorship & Open Work Permit',
        url: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/family-sponsorship/spouse-partner-children/eligibility.html',
      },
    ],
    availability: 'open',
    steps: [
      'Live together in Canada with your Canadian citizen or PR spouse/partner',
      'Submit the sponsorship and PR application online',
      'Submit an Open Work Permit application concurrently or upon receiving the Acknowledgement of Receipt (AOR)',
      'Receive open work permit (usually within 3–4 months) while PR completes',
    ],
    fees: 'CAD 1,080 PR fee (+ CAD 255 for Open Work Permit)',
    processingTime: 'Around 10 to 12 months',
    discretionary: false,
    lastVerified: '2026-10-15',
    appliesTo: (p) => !alreadyCitizenOrPR(p) && isPartnered(p) === true,
    evaluate: (p) => {
      const isCanadianSpouse = partnerIsCanadian(p);
      const isInsideCanada = p.residenceCountry === 'CA';

      const checks = [
        req(
          'Living together inside Canada with Canadian Citizen or PR partner',
          isCanadianSpouse && isInsideCanada ? true : p.residenceCountry !== undefined ? false : undefined,
          {
            pass: 'You are living inside Canada with your Canadian spouse/partner.',
            fail: 'Inland sponsorship requires both partners to be physically cohabiting inside Canada. If living abroad, apply under the Outland class.',
          },
        ),

        info(
          'Open Work Permit Eligibility',
          'Inland applicants are eligible for an Open Work Permit allowing them to work full-time anywhere in Canada while the sponsorship application is processed.',
        ),

        ...admissibilityChecks(p),
      ];

      return { checks };
    },
  },

  // ──────────────────────── 3. CONJUGAL PARTNER SPONSORSHIP ────────────────────────
  {
    id: 'family-conjugal',
    name: 'Conjugal Partner Sponsorship (Exceptional Legal/Immigration Barriers)',
    category: 'family',
    kind: 'permanent',
    summary:
      'For committed couples who have maintained an interdependent relationship for at least 1 year, but could NOT marry or live together for 12 months due to significant persecution, legal barriers (e.g. same-sex relationships illegal in their country), or severe immigration restrictions. Only available from OUTSIDE Canada.',
    goals: ['permanent', 'join_family'],
    officialUrl:
      'https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/family-sponsorship/spouse-partner-children/eligibility.html#conjugal',
    links: [
      {
        label: 'Conjugal Partner Guidelines',
        url: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/family-sponsorship/spouse-partner-children/eligibility.html#conjugal',
      },
    ],
    availability: 'open',
    steps: [
      'Document the genuine, committed relationship of at least 1 year',
      'Provide clear, documented evidence showing why marriage and cohabitation were impossible (legal, cultural, religious, or immigration barriers)',
      'Submit Outland sponsorship application',
    ],
    fees: 'CAD 1,080',
    processingTime: 'Around 12 to 14 months',
    discretionary: true,
    lastVerified: '2026-10-15',
    appliesTo: (p) => !alreadyCitizenOrPR(p) && p.maritalStatus === 'conjugal',
    evaluate: (p) => {
      const isCanadianSpouse = partnerIsCanadian(p);
      const isOutside = p.residenceCountry !== 'CA';

      const checks = [
        req(
          'Partner is a Canadian citizen or Permanent Resident',
          isCanadianSpouse,
          {
            pass: 'Partner is Canadian citizen or PR.',
            fail: 'Requires a Canadian citizen or PR partner.',
          },
        ),

        req(
          'Living outside Canada with documented barrier to marriage or cohabitation',
          isOutside,
          {
            pass: 'You are living outside Canada.',
            fail: 'Conjugal partner class is strictly for partners living outside Canada who cannot marry or cohabit.',
          },
        ),

        warn(
          'High Burden of Proof',
          'Officers assess whether barriers to living together were truly beyond your control (such as laws prohibiting LGBTQ+ unions, religious barriers to divorce, or refusal of visas). Mere inconvenience does not qualify.',
        ),

        ...admissibilityChecks(p),
      ];

      return { checks };
    },
  },

  // ──────────────────────── 4. DEPENDENT CHILDREN SPONSORSHIP ────────────────────────
  {
    id: 'family-child',
    name: 'Sponsor Dependent Children',
    category: 'family',
    kind: 'permanent',
    summary:
      'Canadian citizens and permanent residents can sponsor their biological or legally adopted dependent children to become permanent residents of Canada. A dependent child is under 22 years of age and not married or in a common-law relationship.',
    goals: ['permanent', 'join_family'],
    officialUrl:
      'https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/family-sponsorship/spouse-partner-children/eligibility.html#child',
    links: [
      {
        label: 'Definition of Dependent Child',
        url: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/family-sponsorship/spouse-partner-children/eligibility.html#child',
      },
    ],
    availability: 'open',
    steps: [
      'Confirm child is under 22 and unmarried',
      'Canadian parent completes sponsorship application and undertakes financial support',
      'Submit application and obtain PR for the child',
    ],
    fees: 'CAD 150 per child',
    processingTime: 'Around 6 to 12 months',
    discretionary: false,
    lastVerified: '2026-10-15',
    appliesTo: (p) => !alreadyCitizenOrPR(p) && p.age !== undefined && p.age < 22,
    evaluate: (p) => {
      const hasParentCanadian = p.parentCanadian === 'yes';
      const isUnder22 = p.age !== undefined ? p.age < 22 : undefined;
      const isUnmarried = p.maritalStatus === 'single';

      const checks = [
        req('Parent is a Canadian citizen or Permanent Resident', hasParentCanadian, {
          pass: 'Parent is a Canadian citizen or PR.',
          fail: 'Requires at least one Canadian citizen or PR parent.',
        }),

        req('Under 22 years of age and unmarried', isUnder22 && isUnmarried, {
          pass: 'You meet the age and marital status definition of a dependent child.',
          fail: 'Dependent children must be under age 22 and unmarried.',
        }),

        ...admissibilityChecks(p),
      ];

      return {
        checks,
        notes: [
          'Important check: If your parent was ALREADY a Canadian citizen when you were born, you may already be a Canadian citizen by descent! Check the Citizenship by Descent program.',
        ],
      };
    },
  },

  // ──────────────────────── 5. PARENTS AND GRANDPARENTS PROGRAM (PGP — PAUSED) ────────────────────────
  {
    id: 'family-pgp',
    name: 'Parents and Grandparents Program (PGP — Currently Paused by IRCC)',
    category: 'family',
    kind: 'permanent',
    summary:
      'Officially PAUSED by IRCC (updated August 18, 2026). IRCC is not accepting new Interest to Sponsor forms or inviting new potential sponsors to apply for parent/grandparent permanent residence until further notice. Parents and grandparents should instead use the Super Visa (up to 5 years per stay).',
    goals: ['permanent', 'join_family'],
    officialUrl:
      'https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/family-sponsorship/sponsor-parents-grandparents.html',
    links: [
      {
        label: 'Official IRCC Notice: Sponsor Your Parents and Grandparents (Status: Paused)',
        url: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/family-sponsorship/sponsor-parents-grandparents.html',
      },
      {
        label: 'Super Visa for Parents and Grandparents (Active — 5-Year Stays)',
        url: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/visit-canada/parent-grandparent-super-visa.html',
      },
    ],
    availability: 'closed',
    availabilityNote: 'Status on Canada.ca (updated August 18, 2026): Paused — IRCC is not accepting new interest-to-sponsor forms or issuing new invitations until further notice.',
    steps: [
      'New PGP permanent residence sponsorship intake is currently paused by IRCC',
      'Apply instead for a Parent and Grandparent Super Visa, which allows stays of up to 5 years at a time (plus 2-year extensions inside Canada)',
    ],
    fees: 'N/A (Program Paused)',
    processingTime: 'N/A (Processing prior inventory only)',
    discretionary: false,
    lastVerified: '2026-10-16',
    appliesTo: (p) => !alreadyCitizenOrPR(p) && hasRelative(p, 'child', 'grandchild') === true,
    evaluate: (p) => {
      const hasCanadianChild = hasRelative(p, 'child', 'grandchild');

      const checks = [
        req('Child or grandchild is a Canadian Citizen or Permanent Resident (18+)', hasCanadianChild),
        fail(
          'Program Status: Paused by IRCC (No New Invitations)',
          'According to Canada.ca (updated August 18, 2026), IRCC has paused the Parents and Grandparents Program and is not accepting new Interest to Sponsor forms or issuing new invitations until further notice. IRCC recommends applying for a Super Visa instead.',
          false,
        ),
        ...admissibilityChecks(p),
      ];

      return {
        checks,
        notes: [
          'Active Alternative: Check the "Super Visa for Parents and Grandparents" in your results — it is open year-round with no lottery and lets you stay in Canada for 5 years at a time.',
        ],
      };
    },
  },

  // ──────────────────────── 6. LONELY CANADIAN (OTHER RELATIVE) ────────────────────────
  {
    id: 'family-lonely-canadian',
    name: 'Sponsor an "Other Relative" (The "Lonely Canadian" Exception)',
    category: 'family',
    kind: 'permanent',
    summary:
      'A very narrow exception under IRPR s. 117(1)(h). A Canadian citizen or PR who has NO living spouse, partner, child, parent, grandparent, or orphaned minor relative anywhere in the world, AND no aunt/uncle/relative who is a Canadian citizen or PR, may sponsor ONE blood/adopted relative of any age.',
    goals: ['permanent', 'join_family'],
    officialUrl:
      'https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/family-sponsorship/other-relatives/who-you-can-sponsor.html',
    links: [
      {
        label: 'Sponsor Your Relatives — Official IRCC Rules',
        url: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/family-sponsorship/other-relatives/who-you-can-sponsor.html',
      },
    ],
    availability: 'open',
    steps: [
      'Canadian sponsor must prove they have zero living close family members (spouse, partner, child, parent, grandparent) and zero relatives in Canada',
      'Submit sponsorship and PR application for one blood/adopted relative',
    ],
    fees: 'CAD $1,205 per adult',
    processingTime: 'Around 20 to 30+ months',
    discretionary: false,
    lastVerified: '2026-10-16',
    appliesTo: (p) =>
      !alreadyCitizenOrPR(p) &&
      p.relativesCitizenPR !== undefined &&
      p.relativesCitizenPR.some((r) => (r as string) !== 'none'),
    evaluate: (p) => {
      const hasAnyCanadianRelative =
        p.relativesCitizenPR !== undefined && p.relativesCitizenPR.some((r) => (r as string) !== 'none');

      const checks = [
        req('Related by blood or adoption to a Canadian citizen or permanent resident', hasAnyCanadianRelative),
        unknown(
          'Sponsor Must Have ZERO Other Living Close Family Anywhere (Strict "Lonely Canadian" Test)',
          'Under IRPR 117(1)(h), your Canadian relative is disqualified from using this stream if they have a living spouse, partner, child, parent, or grandparent anywhere in the world, OR if they have any other relative in Canada who is a citizen or PR.',
        ),
        ...admissibilityChecks(p),
      ];

      return { checks };
    },
  },
];
