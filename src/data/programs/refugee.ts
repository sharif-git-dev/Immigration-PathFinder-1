/**
 * Refugee Resettlement & In-Canada Asylum Programs
 * Official Sources (Verified October 2026):
 * - Private Sponsorship of Refugees: https://www.canada.ca/en/immigration-refugees-citizenship/services/refugees/sponsor-refugee/private-sponsorship-program.html
 * - Resettlement Outside Canada (GAR): https://www.canada.ca/en/immigration-refugees-citizenship/services/refugees/resettle-refugee/eligibility.html
 * - Refugee Protection in Canada: https://www.canada.ca/en/immigration-refugees-citizenship/services/refugees/protection.html
 */

import type { Program } from '../../engine/types';
import {
  req,
  pass,
  warn,
  unknown,
  hasRelative,
  admissibilityChecks,
  alreadyCitizenOrPR,
} from '../../engine/helpers';
import { countryName } from '../countries';

export const refugeePrograms: Program[] = [
  // ──────────────────────── 1. PRIVATELY SPONSORED REFUGEES (PSR) ────────────────────────
  {
    id: 'refugee-psr',
    name: 'Privately Sponsored Refugees Program (PSR — Sponsorship Agreement Holders)',
    category: 'refugee',
    kind: 'permanent',
    summary:
      'Allows incorporated Sponsorship Agreement Holder (SAH) organizations in Canada to sponsor refugees living outside Canada for permanent residence and provide 1 year of financial/settlement support. Note: IRCC has currently PAUSED new intake from Group of Five (G5) and Community Sponsors.',
    goals: ['permanent', 'protection'],
    officialUrl:
      'https://www.canada.ca/en/immigration-refugees-citizenship/services/refugees/sponsor-refugee/private-sponsorship-program.html',
    links: [
      {
        label: 'How to Sponsor a Refugee (PSR Official Status: SAH Open / G5 & CS Paused)',
        url: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/refugees/sponsor-refugee/private-sponsorship-program.html',
      },
      {
        label: 'How to Be Resettled in Canada as a Refugee',
        url: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/refugees/resettle-refugee/eligibility.html',
      },
    ],
    availability: 'limited',
    availabilityNote: 'Status on Canada.ca: Sponsorship Agreement Holders (SAH) are Open (subject to strict annual space caps). Group of Five (G5) and Community Sponsor (CS) streams are currently Paused by IRCC.',
    steps: [
      'Must be living outside your country of nationality and outside Canada, unable to return due to well-founded fear of persecution or armed conflict',
      'Connect with an approved Canadian Sponsorship Agreement Holder (SAH) organization (usually via family/co-sponsors in Canada)',
      'SAH submits the sponsorship undertaking within their annual IRCC allocation',
      'Complete overseas visa office interview, medical exam, and security screening',
    ],
    fees: 'Free (CAD $0 application fee; Canadian sponsors commit to funding first-year settlement costs)',
    processingTime: 'Around 24 to 48+ months depending on overseas visa office inventory',
    discretionary: false,
    lastVerified: '2026-10-16',
    appliesTo: (p) => !alreadyCitizenOrPR(p) && p.residenceCountry !== 'CA',
    evaluate: (p) => {
      const isOutside = p.residenceCountry !== 'CA';
      const hasFear = p.fearOfReturn === 'yes';
      const hasSah = p.sponsorAvailable?.includes('sah');
      const hasG5OrCsOnly =
        !hasSah &&
        (p.sponsorAvailable?.includes('g5') || p.sponsorAvailable?.includes('community'));
      const hasAnySponsor = p.sponsorAvailable && p.sponsorAvailable.some((s) => s !== 'none');

      const checks = [
        req('Living outside Canada and outside your country of origin', isOutside, {
          pass: 'You are living outside Canada.',
          fail: 'The PSR program only resettles individuals who are outside Canada and outside their country of origin.',
        }),

        req(
          'Well-founded fear of persecution or serious effect of armed conflict (Convention Refugee Abroad or Country of Asylum Class)',
          hasFear,
          {
            pass: 'You indicated a fear of persecution or conflict upon return to your home country.',
            fail: 'Refugee resettlement requires meeting the Convention Refugee Abroad or Country of Asylum Class definition ( Note: Officers assess current country conditions at the time of decision).',
          },
        ),

        req(
          'Active Canadian Sponsorship Agreement Holder (SAH) sponsor (Group of Five & Community Sponsors currently paused)',
          hasSah ? true : hasG5OrCsOnly ? undefined : hasAnySponsor === false ? false : undefined,
          {
            fixable: true,
            pass: 'You indicated support from a Sponsorship Agreement Holder (SAH) organization.',
            unknown: hasG5OrCsOnly
              ? 'Important 2025/2026 IRCC Update: IRCC has PAUSED new refugee sponsorship submissions from Groups of Five (G5) and Community Sponsors. Your Canadian supporters must partner with a Sponsorship Agreement Holder (SAH) organization that has available annual quota.'
              : 'You cannot apply to PSR on your own; a Canadian Sponsorship Agreement Holder (SAH) organization must agree to sponsor you within their annual IRCC space allocation.',
            fail: 'Requires a Canadian Sponsorship Agreement Holder (SAH) organization willing to submit a sponsorship undertaking for you.',
          },
        ),

        warn(
          'SAH Annual Allocation & Current Country Conditions Review',
          'Even with a willing SAH organization, spaces are strictly capped each year, and IRCC visa officers assess whether conditions in your home country (for example, post-December 2024 developments in Syria) still prevent safe return at the time your application is decided.',
        ),

        ...admissibilityChecks(p),
      ];

      return { checks };
    },
  },

  // ──────────────────────── 2. GOVERNMENT-ASSISTED REFUGEES (GAR) ────────────────────────
  {
    id: 'refugee-gar',
    name: 'Government-Assisted Refugees Program (GAR — UNHCR Referral Only)',
    category: 'refugee',
    kind: 'permanent',
    summary:
      'For Convention refugees abroad who are formally referred to Canada for resettlement by the United Nations Refugee Agency (UNHCR) or a designated referral organization. Individuals CANNOT apply directly to Canada.',
    goals: ['permanent', 'protection'],
    officialUrl:
      'https://www.canada.ca/en/immigration-refugees-citizenship/services/refugees/resettle-refugee/eligibility.html',
    links: [
      {
        label: 'How to Be Resettled in Canada as a Refugee (Official IRCC Page)',
        url: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/refugees/resettle-refugee/eligibility.html',
      },
    ],
    availability: 'invitation_only',
    availabilityNote: 'Referral only: You cannot apply directly to IRCC. Only UNHCR or a designated referral organization can refer your case.',
    steps: [
      'Register with UNHCR in your country of asylum',
      'UNHCR assesses vulnerability for third-country resettlement (fewer than 1% of registered refugees globally are referred)',
      'If selected, UNHCR refers your file directly to a Canadian visa office abroad',
      'Complete IRCC interview, medical exam, and security screening',
    ],
    fees: 'Free (CAD $0)',
    processingTime: 'Determined by UNHCR referral priority and visa post capacity (typically 18–36+ months)',
    discretionary: false,
    lastVerified: '2026-10-16',
    appliesTo: (p) => !alreadyCitizenOrPR(p) && p.residenceCountry !== 'CA',
    evaluate: (p) => {
      const isUnhcr = p.unhcrRegistered === 'yes' || p.refugeeDocument === 'unhcr';

      const checks = [
        req('Living outside Canada and outside your country of origin', p.residenceCountry !== 'CA'),

        req(
          'Well-founded fear of persecution in country of origin',
          p.fearOfReturn === 'yes',
        ),

        req(
          'Registered with UNHCR',
          p.unhcrRegistered !== undefined ? isUnhcr : undefined,
          {
            pass: 'You are registered with UNHCR.',
            fail: 'GAR resettlement requires registration with and referral from UNHCR.',
          },
        ),

        unknown(
          'Active UNHCR Resettlement Referral to Canada Required (Cannot Self-Apply)',
          'Being registered with UNHCR does NOT mean you are in the GAR pipeline. You cannot submit an application yourself — UNHCR must independently select your file for resettlement to Canada based on acute protection/vulnerability criteria.',
        ),

        ...admissibilityChecks(p),
      ];

      return { checks };
    },
  },

  // ──────────────────────── 3. IN-CANADA ASYLUM CLAIM ────────────────────────
  {
    id: 'refugee-in-canada-claim',
    name: 'Claim Refugee Protection from Inside Canada (Port of Entry or In-Canada Portal)',
    category: 'refugee',
    kind: 'permanent',
    summary:
      'Strictly for individuals who are physically inside Canada or arriving at an official Canadian port of entry who face persecution, torture, or risk to life upon return. Claims are heard by the Immigration and Refugee Board of Canada (IRB). The Safe Third Country Agreement (STCA) applies across the entire US land border.',
    goals: ['protection', 'permanent'],
    officialUrl:
      'https://www.canada.ca/en/immigration-refugees-citizenship/services/refugees/protection.html',
    links: [
      {
        label: 'Refugee Protection in Canada (Official IRCC Guide)',
        url: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/refugees/protection.html',
      },
      {
        label: 'Safe Third Country Agreement (STCA) Rules & Family Exceptions',
        url: 'https://www.canada.ca/en/immigration-refugees-citizenship/corporate/mandate/policies-operational-instructions-agreements/agreements/safe-third-country-agreement.html',
      },
    ],
    availability: 'open',
    steps: [
      'Must be physically inside Canada or at a Canadian port of entry',
      'Submit refugee claim online via the IRCC Portal (or to CBSA at a port of entry)',
      'Complete biometrics and eligibility determination',
      'Attend hearing before the Refugee Protection Division (RPD) of the IRB',
    ],
    fees: 'Free (CAD $0)',
    processingTime: 'Around 18 to 24+ months for IRB hearing',
    discretionary: false,
    lastVerified: '2026-10-16',
    appliesTo: (p) => !alreadyCitizenOrPR(p),
    evaluate: (p) => {
      const isInside = p.residenceCountry === undefined ? undefined : p.residenceCountry === 'CA';
      const isFromUs = p.enteringFromUS === 'yes';
      const hasAnchorRelative =
        hasRelative(p, 'spouse', 'child', 'parent', 'sibling', 'grandparent', 'aunt_uncle', 'niece_nephew') === true;

      const checks = [
        req('Physically present in Canada or at an official Canadian Port of Entry', isInside, {
          pass: 'You are physically inside Canada.',
          fail: `You are currently living in ${p.residenceCountry ? countryName(p.residenceCountry) : 'another country'}. Under Canadian law (IRPA s. 99), an asylum claim inside Canada can ONLY be made by someone physically present in Canada or at a Canadian port of entry — never from abroad or at an embassy.`,
          fixable: false,
        }),

        req('Well-founded fear of persecution, torture, or risk to life upon return', p.fearOfReturn === 'yes', {
          pass: 'You indicated fear of persecution or risk to life.',
          fail: 'Requires demonstrating a well-founded fear of persecution or personalized risk to life before the IRB.',
        }),

        isFromUs
          ? req(
              'Safe Third Country Agreement (STCA) Exception (Anchor Relative in Canada, Unaccompanied Minor, etc.)',
              hasAnchorRelative,
              {
                pass: 'You have an eligible anchor relative in Canada, which is a recognized STCA exception.',
                fail: 'Under the expanded Safe Third Country Agreement (applying across the entire US-Canada land border, including between ports of entry for 14 days after crossing), individuals entering from the US are ineligible to claim asylum unless they have a qualifying anchor family member in Canada or meet another strict exception.',
                fixable: false,
              },
            )
          : pass('Safe Third Country Agreement', 'Not entering at a land port of entry from the United States.'),

        req(
          'No prior refugee claim in Canada or information-sharing partner (US, UK, Australia, NZ)',
          p.history?.includes('asylum_claimed_canada_before') || p.history?.includes('asylum_claimed_elsewhere')
            ? false
            : true,
          {
            pass: 'No prior refugee claim reported.',
            fail: 'Under IRPA s. 101(1)(c) and (c.1), a prior refugee claim in Canada, the US, the UK, Australia, or New Zealand makes a new claim ineligible for referral to the IRB.',
            fixable: false,
          },
        ),

        ...admissibilityChecks(p),
      ];

      return { checks };
    },
  },
];
