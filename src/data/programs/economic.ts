/**
 * Federal Economic Permanent Residence Programs Outside Express Entry
 * Official Source (Verified October 2026): IRCC Immigrate to Canada
 * https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada.html
 */

import type { Program } from '../../engine/types';
import {
  req,
  fail,
  warn,
  minCLB,
  educationAtLeast,
  admissibilityChecks,
  alreadyCitizenOrPR,
} from '../../engine/helpers';

export const economicPrograms: Program[] = [
  // ──────────────────────── 1. ECONOMIC MOBILITY PATHWAYS PILOT (EMPP — CLOSED) ────────────────────────
  {
    id: 'economic-empp',
    name: 'Economic Mobility Pathways Pilot (EMPP — Closed to New Applications)',
    category: 'economic',
    kind: 'permanent',
    summary:
      'Officially CLOSED by IRCC (March 2026). The EMPP previously connected skilled refugees and displaced people abroad with Canadian employers. IRCC is no longer accepting new applications under the federal EMPP.',
    goals: ['permanent', 'work', 'protection'],
    officialUrl:
      'https://www.canada.ca/en/immigration-refugees-citizenship/services/refugees/economic-mobility-pathways-pilot.html',
    links: [
      {
        label: 'Official IRCC Notice: Closed — Economic Mobility Pathways Pilot',
        url: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/refugees/economic-mobility-pathways-pilot.html',
      },
    ],
    availability: 'closed',
    availabilityNote: 'Status on Canada.ca (updated March 25, 2026): Closed to new applications.',
    steps: [
      'This pilot is closed to new applications on Canada.ca',
      'Skilled candidates should instead review Express Entry (FSW / Category Draws), the Atlantic Immigration Program (AIP), or the Rural and Francophone Community Immigration Pilots (RCIP / FCIP)',
    ],
    fees: 'N/A (Program Closed)',
    processingTime: 'N/A (Closed to new applications)',
    discretionary: false,
    lastVerified: '2026-10-16',
    appliesTo: (p) => !alreadyCitizenOrPR(p),
    evaluate: (p) => {
      const checks = [
        fail(
          'Program Status: Closed by IRCC',
          'According to Canada.ca (updated March 25, 2026), the Economic Mobility Pathways Pilot (EMPP) is officially closed to new applications. In addition, following the December 2024 political transition in Syria, country-of-origin protection assessments and host-country temporary protection rules have shifted.',
          false,
        ),
        ...admissibilityChecks(p),
      ];

      return {
        checks,
        notes: [
          'IRCC permanently closed the EMPP to new applications in 2026. If you have skilled work experience and language skills, check Express Entry, Provincial Nominee Programs, or employer-driven regional pilots (AIP / RCIP / FCIP).',
        ],
      };
    },
  },

  // ──────────────────────── 2. ATLANTIC IMMIGRATION PROGRAM (AIP) ────────────────────────
  {
    id: 'economic-aip',
    name: 'Atlantic Immigration Program (AIP)',
    category: 'economic',
    kind: 'permanent',
    summary:
      'An active, permanent employer-driven pathway for skilled workers and international graduates who have an official full-time job offer from a designated employer in New Brunswick, Nova Scotia, Prince Edward Island, or Newfoundland and Labrador.',
    goals: ['permanent', 'work'],
    officialUrl:
      'https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/atlantic-immigration.html',
    links: [
      {
        label: 'AIP Official Eligibility Requirements',
        url: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/atlantic-immigration/how-to-immigrate.html',
      },
    ],
    availability: 'open',
    availabilityNote: 'Active program; requires a job offer from an Atlantic-designated employer and a provincial endorsement certificate.',
    steps: [
      'Secure a full-time, non-seasonal job offer (TEER 0, 1, 2, 3, or 4) from an officially designated employer in NB, NS, PEI, or NL',
      'Complete a Settlement Plan with a designated settlement service provider organization',
      'Have your employer obtain a Provincial Certificate of Endorsement from the Atlantic province',
      'Submit your permanent residence application (and optional temporary work permit application) to IRCC',
    ],
    fees: 'CAD $1,525 per adult applicant',
    processingTime: 'Around 6 to 12 months',
    discretionary: false,
    lastVerified: '2026-10-16',
    appliesTo: (p) => !alreadyCitizenOrPR(p),
    evaluate: (p) => {
      const isAtlantic = ['NB', 'NS', 'PE', 'NL'].includes(p.jobOfferProvince ?? '');
      const hasJobOffer = p.jobOffer === 'yes' && p.jobOfferFullTime !== 'no';
      const totalExp = (p.foreignExpYears ?? 0) + (p.canadianExpYears ?? 0);

      const checks = [
        req(
          'Full-time job offer in an Atlantic province (NB, NS, PE, or NL)',
          hasJobOffer && isAtlantic ? true : p.jobOffer !== undefined ? false : undefined,
          {
            fixable: true,
            pass: `You indicated a full-time job offer in ${p.jobOfferProvince}.`,
            fail: 'AIP requires a valid full-time job offer located in New Brunswick, Nova Scotia, Prince Edward Island, or Newfoundland and Labrador.',
          },
        ),

        req(
          'At least 1 year of skilled/semi-skilled work experience in the last 5 years (or Atlantic graduate)',
          totalExp >= 1 || p.canadianEducation !== 'none',
          {
            pass: `You have ${totalExp} year(s) of work experience.`,
            fail: 'Requires at least 1 year (1,560 hours) of qualifying work experience within the past 5 years (exempt only for eligible graduates of recognized Atlantic post-secondary institutions).',
          },
        ),

        req(
          'Language minimum of CLB 5 (TEER 0–3) or CLB 4 (TEER 4)',
          minCLB(p, 4, 'either'),
          {
            fixable: true,
            pass: 'Meets baseline AIP language requirement (CLB 5 required for TEER 0–3; CLB 4 for TEER 4).',
            fail: 'Requires at least CLB 4 (for TEER 4 jobs) or CLB 5 (for TEER 0–3 jobs) in English or French.',
          },
        ),

        req('High school diploma or higher (with ECA if completed outside Canada)', educationAtLeast(p, 'secondary')),

        warn(
          'Designated Employer Status & Provincial Endorsement Certificate',
          'Your Atlantic employer must be officially designated by the provincial government, and the province must issue a Certificate of Endorsement for your specific job offer before you can apply to IRCC.',
        ),

        ...admissibilityChecks(p),
      ];

      return { checks };
    },
  },

  // ──────────────────────── 3. RURAL & FRANCOPHONE COMMUNITY IMMIGRATION PILOTS (RCIP / FCIP) ────────────────────────
  {
    id: 'economic-rcip',
    name: 'Rural and Francophone Community Immigration Pilots (RCIP & FCIP)',
    category: 'economic',
    kind: 'permanent',
    summary:
      'Active 2025/2026 community-driven permanent residence pilots replacing the former RNIP. Connects skilled candidates with designated employers across 18 participating rural and Francophone minority communities in NS, NB, ON, MB, SK, AB, and BC.',
    goals: ['permanent', 'work'],
    officialUrl:
      'https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/rural-franco-pilots.html',
    links: [
      {
        label: 'RCIP & FCIP Official Page & 18 Participating Communities',
        url: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/rural-franco-pilots.html',
      },
    ],
    availability: 'limited',
    availabilityNote: 'Requires a job offer from a designated employer in one of the 18 participating communities (e.g., Pictou County NS, North Bay/Sudbury/Timmins/Sault Ste. Marie/Thunder Bay ON, Steinbach/Brandon MB, Moose Jaw SK, Claresholm AB, West Kootenay/Kelowna BC) plus a community recommendation.',
    steps: [
      'Secure a genuine full-time, non-seasonal job offer from a designated employer in one of the 18 participating RCIP/FCIP communities',
      'Apply to the local economic development organization for an official Community Recommendation',
      'Submit your permanent residence application to IRCC (and apply for an optional pilot work permit while waiting)',
    ],
    fees: 'CAD $1,525 per adult applicant',
    processingTime: 'Around 6 to 12 months',
    discretionary: false,
    lastVerified: '2026-10-16',
    appliesTo: (p) => !alreadyCitizenOrPR(p),
    evaluate: (p) => {
      const hasJobOffer = p.jobOffer === 'yes' && p.jobOfferFullTime !== 'no';
      const totalExp = (p.foreignExpYears ?? 0) + (p.canadianExpYears ?? 0);

      const checks = [
        req(
          'Full-time job offer in Canada',
          p.jobOffer !== undefined ? hasJobOffer : undefined,
          {
            fixable: true,
            pass: 'You indicated a full-time job offer in Canada.',
            fail: 'RCIP/FCIP strictly requires a full-time, non-seasonal job offer from a designated employer inside one of the 18 participating communities.',
          },
        ),
        req(
          'At least 1 year of continuous work experience in the past 3 years (or eligible community graduate)',
          totalExp >= 1 || p.canadianEducation !== 'none',
          {
            pass: `You have ${totalExp} year(s) of work experience.`,
            fail: 'Requires at least 1 year (1,560 hours) of related work experience in the past 3 years (unless you graduated from a public post-secondary institution in the recommending community).',
          },
        ),
        req('Language test result of at least CLB 4 to CLB 6 (depending on job TEER)', minCLB(p, 4, 'either')),
        warn(
          'Designated Employer in 1 of 18 Communities & Community Recommendation',
          'Your job offer must be physically located inside one of the 18 participating RCIP/FCIP communities, from a community-designated employer, and backed by an official Community Recommendation certificate.',
        ),
        ...admissibilityChecks(p),
      ];
      return { checks };
    },
  },

  // ──────────────────────── 4. HOME CARE WORKER IMMIGRATION PILOTS (CLOSED) ────────────────────────
  {
    id: 'economic-caregivers',
    name: 'Home Care Worker Immigration Pilots (Currently Closed to New PR Applications)',
    category: 'economic',
    kind: 'permanent',
    summary:
      'IRCC\'s permanent residence caregiver pilots (including the Home Care Worker Immigration Pilots and former Home Child Care Provider / Home Support Worker Pilots) are currently listed as CLOSED to new applications on Canada.ca due to filled annual intake caps.',
    goals: ['permanent', 'work'],
    officialUrl:
      'https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/caregivers.html',
    links: [
      {
        label: 'Official IRCC Caregivers Page (Status: Closed)',
        url: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/caregivers.html',
      },
    ],
    availability: 'closed',
    availabilityNote: 'Status on Canada.ca (updated January 27, 2026): Home Care Worker Immigration pilots — Closed.',
    steps: [
      'Direct-to-PR caregiver pilots are currently closed to new applications on Canada.ca',
      'Caregivers with a Canadian employer willing to obtain a Labour Market Impact Assessment (LMIA) may instead check temporary work permit pathways',
    ],
    fees: 'N/A (Pilot intake currently closed)',
    processingTime: 'N/A',
    discretionary: false,
    lastVerified: '2026-10-16',
    appliesTo: (p) => !alreadyCitizenOrPR(p),
    evaluate: (p) => {
      const checks = [
        fail(
          'Program Status: Closed to New Applications on Canada.ca',
          'According to Canada.ca (updated January 27, 2026), the Home Care Worker Immigration Pilots (as well as the prior Home Child Care Provider and Home Support Worker Pilots) are currently closed to new permanent residence applications.',
          false,
        ),
        ...admissibilityChecks(p),
      ];

      return { checks };
    },
  },

  // ──────────────────────── 5. START-UP VISA PROGRAM (PAUSED / CLOSED) ────────────────────────
  {
    id: 'economic-suv',
    name: 'Start-Up Visa Program (SUV — Paused / Closed to New Applicants)',
    category: 'economic',
    kind: 'permanent',
    summary:
      'Officially PAUSED by IRCC (updated July 21, 2026). IRCC only accepted Start-Up Visa applications up to June 30, 2026 from holders of a valid 2025 commitment certificate. The program is closed to all other new applications, and Self-Employed Persons is also paused.',
    goals: ['permanent', 'start_business'],
    officialUrl:
      'https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/start-visa.html',
    links: [
      {
        label: 'Official IRCC Start-Up Visa Notice (Status: Paused)',
        url: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/start-visa.html',
      },
    ],
    availability: 'closed',
    availabilityNote: 'Status on Canada.ca (updated July 21, 2026): Paused — Closed to new applicants without a pre-existing 2025 commitment certificate submitted by June 30, 2026.',
    steps: [
      'New applications to the federal Start-Up Visa Program and Self-Employed Persons Program are currently paused by IRCC',
      'Entrepreneurs should instead explore Provincial Nominee Program (PNP) entrepreneur streams or Intra-Company Transferee (ICT) work permits',
    ],
    fees: 'N/A (Program Paused)',
    processingTime: 'N/A',
    discretionary: false,
    lastVerified: '2026-10-16',
    appliesTo: (p) => !alreadyCitizenOrPR(p),
    evaluate: (p) => {
      const checks = [
        fail(
          'Program Status: Paused / Closed to New Applications by IRCC',
          'According to Canada.ca (updated July 21, 2026), the Start-Up Visa Program is paused and closed to new applications (only applicants holding a 2025 commitment certificate who applied by June 30, 2026 were accepted). The federal Self-Employed Persons Program is also paused.',
          false,
        ),
        ...admissibilityChecks(p),
      ];

      return { checks };
    },
  },
];
