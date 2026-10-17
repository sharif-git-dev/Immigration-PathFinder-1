import type { Check, Education, Profile, Program } from '../../engine/types';

function hasEduAtLeast(edu: Education | undefined, min: 'secondary' | 'one_year' | 'two_year' | 'bachelors' | 'masters'): boolean {
  if (!edu) return false;
  const rank: Record<Education, number> = {
    none: 0,
    secondary: 1,
    one_year: 2,
    two_year: 3,
    bachelors: 4,
    two_or_more: 5,
    masters: 6,
    professional: 6,
    phd: 7,
  };
  return rank[edu] >= rank[min];
}

export const usaPrograms: Program[] = [
  // 1. EB-2 National Interest Waiver (NIW) — Self-Petition Green Card
  {
    id: 'us-eb2-niw',
    country: 'US',
    name: 'US EB-2 National Interest Waiver (NIW) Green Card (Self-Petition)',
    category: 'express_entry',
    kind: 'permanent',
    summary:
      'One of the strongest direct US Green Card pathways for professionals with a Master’s/PhD (or Bachelor’s + 5 years progressive experience) whose proposed endeavor has substantial merit and national importance to the United States. Waives the US employer job offer and DOL PERM labor certification.',
    goals: ['permanent', 'work'],
    officialUrl:
      'https://www.uscis.gov/working-in-the-united-states/permanent-workers/employment-based-immigration-second-preference-eb-2',
    links: [
      {
        label: 'USCIS — EB-2 Second Preference & National Interest Waiver (NIW)',
        url: 'https://www.uscis.gov/working-in-the-united-states/permanent-workers/employment-based-immigration-second-preference-eb-2',
      },
      {
        label: 'USCIS — Visa Availability & Priority Dates (Visa Bulletin)',
        url: 'https://www.uscis.gov/green-card/green-card-processes-and-procedures/visa-availability-and-priority-dates',
      },
    ],
    availability: 'open',
    availabilityNote:
      'Active in 2026: Self-petitioners do NOT need a US employer sponsor or PERM labor certification, and only pay the reduced $300 Asylum Program Fee.',
    steps: [
      'Draft a detailed Professional Plan / Proposed Endeavor Statement showing how your work in STEM, healthcare, AI, infrastructure, business, education, or research benefits the US.',
      'Gather degree transcripts, credential evaluation, independent recommendation letters, and evidence of past impact (projects, patents, publications, revenue, or leadership).',
      'File Form I-140 (Immigrant Petition for Alien Workers) with USCIS, then complete Consular Processing (DS-260) or Adjustment of Status (Form I-485) once your priority date is current.',
    ],
    fees: 'Form I-140: $715 + $300 Asylum Program Fee ($1,015 total for self-petitioners) | Optional Premium Processing: $2,805 (45 business days) | Adjustment of Status (I-485): $1,440 or Consular DS-260: $345',
    processingTime:
      'I-140 Adjudication: 45 business days (with Premium Processing) or 8–14 months regular; plus Visa Bulletin priority date wait (~1.5–2.5 years for Rest of World)',
    lastVerified: '2026-04-17',
    evaluate: (p: Profile) => {
      const checks: Check[] = [];
      const totalExp = (p.foreignExpYears ?? 0) + (p.canadianExpYears ?? 0);
      const hasAdvDegree = hasEduAtLeast(p.education, 'masters');
      const hasBachPlus5 = hasEduAtLeast(p.education, 'bachelors') && totalExp >= 5;

      checks.push({
        label: 'Advanced Degree (Master’s / PhD) or Bachelor’s + 5 years experience',
        result:
          hasAdvDegree || hasBachPlus5
            ? 'pass'
            : p.education === undefined
              ? 'unknown'
              : 'fail',
        detail: hasAdvDegree
          ? 'You hold a Master’s, professional, or doctoral degree.'
          : hasBachPlus5
            ? 'You hold a Bachelor’s degree plus 5+ years of progressive experience (equivalent to an advanced degree under USCIS rules).'
            : 'Requires a Master’s/PhD, a Bachelor’s + 5 years progressive post-baccalaureate experience, or documented "Exceptional Ability" in sciences, arts, or business.',
        fixable: true,
      });

      checks.push({
        label: 'Matter of Dhanasar 3-Prong National Interest Test',
        result: totalExp >= 2 || hasAdvDegree ? 'pass' : 'unknown',
        detail:
          'Your proposed US endeavor must have (1) substantial merit and national importance, (2) you must be well-positioned to advance it, and (3) on balance, waiving the job offer/PERM requirement benefits the United States.',
        fixable: true,
      });

      checks.push({
        label: 'No US Employer Sponsor Required (Self-Petition)',
        result: 'pass',
        detail:
          'You file Form I-140 yourself from inside or outside the United States without needing a US employer.',
      });

      return { checks };
    },
  },

  // 2. EB-1A Extraordinary Ability — Self-Petition Green Card
  {
    id: 'us-eb1a',
    country: 'US',
    name: 'US EB-1A Extraordinary Ability Green Card (Self-Petition)',
    category: 'express_entry',
    kind: 'permanent',
    summary:
      'First-preference US Green Card for individuals at the top of their field in sciences, arts, education, business, or athletics. No job offer or employer required, fastest Green Card priority dates, and 15-business-day premium processing.',
    goals: ['permanent', 'work'],
    officialUrl:
      'https://www.uscis.gov/working-in-the-united-states/permanent-workers/employment-based-immigration-first-preference-eb-1',
    links: [
      {
        label: 'USCIS — EB-1 First Preference (Extraordinary Ability)',
        url: 'https://www.uscis.gov/working-in-the-united-states/permanent-workers/employment-based-immigration-first-preference-eb-1',
      },
    ],
    availability: 'open',
    steps: [
      'Audit your achievements against the 10 USCIS EB-1A criteria (aim to document 4–5 criteria strongly for the Kazarian two-step final merits review).',
      'File Form I-140 (with optional Form I-907 for 15-business-day Premium Processing).',
      'File Form I-485 concurrently (if in the US and priority date is current) or complete DS-260 immigrant visa processing at a US Embassy.',
    ],
    fees: 'Form I-140: $715 + $300 Asylum Program Fee ($1,015 total) | Optional Premium Processing: $2,805 (15 business days)',
    processingTime:
      '15 business days (I-140 with Premium Processing); priority date is typically Current for Rest of World',
    lastVerified: '2026-04-17',
    evaluate: (p: Profile) => {
      const checks: Check[] = [];
      const totalExp = (p.foreignExpYears ?? 0) + (p.canadianExpYears ?? 0);
      const strongProfile =
        (hasEduAtLeast(p.education, 'masters') && totalExp >= 3) ||
        p.culturalAthleticExp === 'yes';

      checks.push({
        label: 'Meet at least 3 of 10 USCIS Extraordinary Ability criteria (or a major international award)',
        result: strongProfile || totalExp >= 3 ? 'unknown' : 'fail',
        detail:
          'Criteria include: nationally/internationally recognized awards, judging others’ work, original contributions of major significance, scholarly articles, high salary compared to peers, leading/critical role in distinguished organizations, or press coverage.',
        fixable: true,
      });

      checks.push({
        label: 'No US Job Offer Required (Self-Petition)',
        result: 'pass',
        detail:
          'EB-1A allows direct self-petitioning without a sponsoring employer or PERM labor certification.',
      });

      return { checks };
    },
  },

  // 3. EB-1B / EB-1C Outstanding Researcher & Multinational Executive
  {
    id: 'us-eb1bc',
    country: 'US',
    name: 'US EB-1B / EB-1C Multinational Executive & Outstanding Researcher Green Card',
    category: 'economic',
    kind: 'permanent',
    summary:
      'First-preference US Green Card for multinational managers/executives transferring to a related US company (EB-1C) or internationally recognized professors/researchers with a permanent US university/R&D job offer (EB-1B). Exempt from PERM labor certification.',
    goals: ['permanent', 'work'],
    officialUrl:
      'https://www.uscis.gov/working-in-the-united-states/permanent-workers/employment-based-immigration-first-preference-eb-1',
    links: [
      {
        label: 'USCIS — EB-1B & EB-1C Eligibility Requirements',
        url: 'https://www.uscis.gov/working-in-the-united-states/permanent-workers/employment-based-immigration-first-preference-eb-1',
      },
    ],
    availability: 'open',
    steps: [
      'Confirm corporate relationship between the foreign and US entity (parent, subsidiary, or affiliate) for EB-1C, or tenure-track/permanent research offer for EB-1B.',
      'Have the US employer file Form I-140 directly without needing DOL PERM labor certification.',
    ],
    fees: 'Form I-140: $715 + Asylum Program Fee ($300 for small employers ≤25 FTE, $600 standard, $0 for nonprofits) | Optional Premium Processing: $2,805',
    processingTime: '15–45 business days (with Premium Processing) or 8–12 months regular',
    lastVerified: '2026-04-17',
    evaluate: (p: Profile) => {
      const checks: Check[] = [];
      const totalExp = (p.foreignExpYears ?? 0) + (p.canadianExpYears ?? 0);
      checks.push({
        label:
          'Experience (1+ yr as multinational manager/executive in last 3 yrs for EB-1C, or 3+ yrs research/teaching for EB-1B)',
        result:
          totalExp >= 1 || p.intraCompany === 'yes'
            ? 'pass'
            : p.foreignExpYears === undefined
              ? 'unknown'
              : 'fail',
        detail: `You reported ${totalExp} year(s) of experience.`,
        fixable: true,
      });
      checks.push({
        label: 'Qualifying US Employer Petition (Multinational Affiliate or University/Research Institution)',
        result: p.jobOffer === 'yes' || p.intraCompany === 'yes' ? 'pass' : 'fail',
        detail:
          p.jobOffer === 'yes' || p.intraCompany === 'yes'
            ? 'You indicated having a job offer or multinational company affiliation.'
            : 'Requires a petitioning US employer (either a related multinational entity for EB-1C or a university/research employer for EB-1B).',
        fixable: true,
      });
      return { checks };
    },
  },

  // 4. EB-3 Skilled Workers, Professionals & Other Workers Green Card
  {
    id: 'us-eb3',
    country: 'US',
    name: 'US EB-3 Skilled Workers & Professionals Green Card',
    category: 'economic',
    kind: 'permanent',
    summary:
      'Employer-sponsored permanent residency (Green Card) for Professionals (Bachelor’s degree), Skilled Workers (2+ years training or experience), and Other Workers. Requires a permanent full-time US job offer and Department of Labor PERM certification.',
    goals: ['permanent', 'work'],
    officialUrl:
      'https://www.uscis.gov/working-in-the-united-states/permanent-workers/employment-based-immigration-third-preference-eb-3',
    links: [
      {
        label: 'USCIS — EB-3 Third Preference (Skilled Workers & Professionals)',
        url: 'https://www.uscis.gov/working-in-the-united-states/permanent-workers/employment-based-immigration-third-preference-eb-3',
      },
    ],
    availability: 'open',
    steps: [
      'Secure a permanent full-time job offer from a US employer willing to sponsor an EB-3 Green Card (Registered Nurses and Physical Therapists qualify under Schedule A and skip PERM recruitment).',
      'Employer completes DOL Prevailing Wage Determination and PERM ETA-9089, then files Form I-140 with USCIS.',
    ],
    fees: 'PERM Labor Certification: $0 government fee (paid by employer) | Form I-140: $715 + $300/$600 Asylum Program Fee | DS-260 / I-485 fees',
    processingTime: 'PERM + I-140 + Visa Bulletin wait: ~24–42 months total',
    lastVerified: '2026-04-17',
    evaluate: (p: Profile) => {
      const checks: Check[] = [];
      const totalExp = (p.foreignExpYears ?? 0) + (p.canadianExpYears ?? 0);
      const hasEduOrExp = hasEduAtLeast(p.education, 'bachelors') || totalExp >= 2;

      checks.push({
        label: 'Bachelor’s Degree (Professional) OR 2+ Years Experience/Training (Skilled Worker)',
        result: hasEduOrExp
          ? 'pass'
          : p.education === undefined && p.foreignExpYears === undefined
            ? 'unknown'
            : 'fail',
        detail: hasEduOrExp
          ? 'You meet the education or experience threshold for EB-3.'
          : 'EB-3 Professionals require a Bachelor’s degree; EB-3 Skilled Workers require at least 2 years of experience or training (EB-3 Other Workers accepts <2 years but has longer backlogs).',
        fixable: true,
      });

      checks.push({
        label: 'Permanent Full-Time US Job Offer & Employer PERM Sponsorship',
        result: p.jobOffer === 'yes' ? 'pass' : 'fail',
        detail:
          p.jobOffer === 'yes'
            ? 'You indicated having a job offer.'
            : 'Requires a US employer willing to complete DOL prevailing wage determination, recruitment (PERM Form ETA-9089), and Form I-140.',
        fixable: true,
      });

      return { checks };
    },
  },

  // 5. Diversity Immigrant Visa Program (DV Lottery)
  {
    id: 'us-dv-lottery',
    country: 'US',
    name: 'US Diversity Visa Program (Green Card Lottery — 55,000 Visas/Year)',
    category: 'express_entry',
    kind: 'permanent',
    summary:
      'Annual US Department of State lottery awarding up to 55,000 Permanent Resident Green Cards to individuals born in countries with historically low rates of immigration to the United States (including almost all of the Middle East, Africa, Europe, and Central Asia).',
    goals: ['permanent', 'work'],
    officialUrl:
      'https://www.uscis.gov/green-card/green-card-eligibility/green-card-through-the-diversity-immigrant-visa-program',
    links: [
      {
        label: 'USCIS — Green Card Through the Diversity Immigrant Visa Program (DV Lottery)',
        url: 'https://www.uscis.gov/green-card/green-card-eligibility/green-card-through-the-diversity-immigrant-visa-program',
      },
    ],
    availability: 'open',
    availabilityNote:
      'Free official registration opens each autumn (October–November) exclusively at dvprogram.state.gov. No job offer, language test, or sponsor required.',
    steps: [
      'Submit one entry per person during the annual October–November registration window at dvprogram.state.gov (include your spouse and all unmarried children under 21, and spouse can submit a separate entry doubling a married couple’s odds).',
      'Save your Confirmation Number to check Entrant Status Check in May.',
      'If selected, submit Form DS-260 promptly and attend the US Embassy immigrant visa interview.',
    ],
    fees: 'Lottery Registration: $0 (Free on dvprogram.state.gov) | If Selected: $330 Diversity Visa fee + $235 USCIS Immigrant Fee upon Green Card issuance',
    processingTime:
      'Registration every October–November; results announced in May; visas issued October–September of the following fiscal year',
    lastVerified: '2026-04-17',
    evaluate: (p: Profile) => {
      const checks: Check[] = [];
      const totalExp = (p.foreignExpYears ?? 0) + (p.canadianExpYears ?? 0);
      const hasHighSchool = hasEduAtLeast(p.education, 'secondary');
      const hasWorkFallback = totalExp >= 2;

      checks.push({
        label: 'High School Diploma (12-year course) OR 2 years of qualifying O*NET Zone 4/5 work experience',
        result:
          hasHighSchool || hasWorkFallback
            ? 'pass'
            : p.education === undefined
              ? 'unknown'
              : 'fail',
        detail: hasHighSchool
          ? 'You hold at least a high school diploma or higher.'
          : 'Requires a high school diploma equivalent OR 2 years of work experience within the past 5 years in an occupation requiring at least 2 years of training (O*NET Job Zone 4 or 5).',
        fixable: true,
      });

      checks.push({
        label: 'Born in a DV-Eligible Country (or chargeable to spouse’s eligible country of birth)',
        result: 'pass',
        detail:
          'Most countries in the Middle East/MENA (e.g., Syria, Jordan, Egypt, Lebanon, Iraq, Saudi Arabia, UAE, Morocco, Algeria, Tunisia, Sudan, Yemen), Africa, and Europe are 100% eligible. Eligibility is based on country of birth, not citizenship.',
      });

      return { checks };
    },
  },

  // 6. H-1B Specialty Occupation Work Visa
  {
    id: 'us-h1b',
    country: 'US',
    name: 'US H-1B Specialty Occupation Work Visa (Dual-Intent)',
    category: 'work',
    kind: 'temporary',
    summary:
      'The primary US work visa for professionals holding a Bachelor’s degree or higher in a specific specialty (IT, engineering, finance, architecture, medicine, science). Valid up to 6 years (extendable beyond 6 years while a Green Card is pending) and allows "dual intent" to transition directly to a Green Card.',
    goals: ['work', 'permanent'],
    officialUrl:
      'https://www.uscis.gov/working-in-the-united-states/h-1b-specialty-occupations',
    links: [
      {
        label: 'USCIS — H-1B Specialty Occupations & Electronic Registration',
        url: 'https://www.uscis.gov/working-in-the-united-states/h-1b-specialty-occupations',
      },
    ],
    availability: 'open',
    availabilityNote:
      '2026 Beneficiary-Centric Lottery: Each worker gets 1 fair lottery entry regardless of how many employers register them (65,000 regular cap + 20,000 US Master’s cap). Universities & nonprofit research institutions are 100% exempt from the lottery cap.',
    steps: [
      'Target US employers that sponsor H-1B visas (or target Cap-Exempt employers like US universities, affiliated medical centers, and nonprofit research labs which can sponsor H-1B any month of the year without a lottery).',
      'For private-sector cap-subject roles, ensure your employer registers your passport in the March USCIS electronic registration window.',
    ],
    fees: 'Paid by Employer: $215 Electronic Lottery Registration + Form I-129 ($460–$780) + ACWIA ($750/$1,500) + $500 Fraud Fee | Visa Stamp (DS-160): $205',
    processingTime:
      'Cap Lottery in March (starts Oct 1); Cap-Exempt employers (universities, nonprofit research hospitals) can hire year-round in 15 business days with Premium Processing',
    lastVerified: '2026-04-17',
    evaluate: (p: Profile) => {
      const checks: Check[] = [];
      const totalExp = (p.foreignExpYears ?? 0) + (p.canadianExpYears ?? 0);
      const hasDegree = hasEduAtLeast(p.education, 'bachelors') || totalExp >= 6;

      checks.push({
        label:
          'Bachelor’s degree or higher in a specialty field (or 3 years experience per 1 year of missing college)',
        result: hasDegree
          ? 'pass'
          : p.education === undefined
            ? 'unknown'
            : 'fail',
        detail: hasEduAtLeast(p.education, 'bachelors')
          ? 'You hold a Bachelor’s degree or higher.'
          : 'Requires a Bachelor’s degree directly related to the specialty occupation (or equivalent combination of education and progressive experience).',
        fixable: true,
      });

      checks.push({
        label: 'US Employer Sponsor & Certified Labor Condition Application (LCA)',
        result: p.jobOffer === 'yes' ? 'pass' : 'fail',
        detail:
          p.jobOffer === 'yes'
            ? 'You indicated having a job offer.'
            : 'Requires a US employer to register you in the March H-1B lottery (or file year-round if the employer is a cap-exempt university, teaching hospital, or nonprofit research institute).',
        fixable: true,
      });

      return { checks };
    },
  },

  // 7. O-1A / O-1B Extraordinary Ability Work Visa
  {
    id: 'us-o1',
    country: 'US',
    name: 'US O-1 Visa for Extraordinary Ability (No Lottery Cap)',
    category: 'work',
    kind: 'temporary',
    summary:
      'High-priority US work visa for startup founders, researchers, engineers, physicians, creatives, and executives with extraordinary achievements. Has NO annual lottery cap, can be filed any day of the year, and allows unlimited extensions.',
    goals: ['work', 'permanent', 'start_business'],
    officialUrl:
      'https://www.uscis.gov/working-in-the-united-states/temporary-workers/o-1-visa-individuals-with-extraordinary-ability-or-achievement',
    links: [
      {
        label: 'USCIS — O-1 Visa: Extraordinary Ability or Achievement',
        url: 'https://www.uscis.gov/working-in-the-united-states/temporary-workers/o-1-visa-individuals-with-extraordinary-ability-or-achievement',
      },
    ],
    availability: 'open',
    steps: [
      'Compile evidence across at least 3 O-1 criteria and obtain a written peer/advisory consultation letter.',
      'Have your US employer, agent, or US startup file Form I-129 with USCIS anytime during the year (no lottery required).',
    ],
    fees: 'Form I-129: $530 (small employer/startup ≤25 employees) or $1,055 standard + $300/$600 Asylum Fee | Optional 15-Day Premium Processing: $2,805',
    processingTime: '15 business days with Premium Processing (2–4 months regular)',
    lastVerified: '2026-04-17',
    evaluate: (p: Profile) => {
      const checks: Check[] = [];
      const totalExp = (p.foreignExpYears ?? 0) + (p.canadianExpYears ?? 0);
      checks.push({
        label: 'Meet at least 3 of 8 O-1A criteria (or 3 of 6 O-1B Arts/Media criteria)',
        result:
          totalExp >= 2 || hasEduAtLeast(p.education, 'masters') || p.culturalAthleticExp === 'yes'
            ? 'unknown'
            : 'fail',
        detail:
          'Criteria include: critical role at distinguished organizations/startups, high remuneration, judging others’ work (hackathons, peer review), original contributions, press/media coverage, or awards (including VC funding/accelerator awards for startup founders).',
        fixable: true,
      });
      checks.push({
        label: 'US Employer or US Agent Petition (can be your own US startup)',
        result: p.jobOffer === 'yes' || (p.businessPlan && p.businessPlan !== 'none') ? 'pass' : 'fail',
        detail:
          'Requires a US employer, US agent, or your own Delaware/US startup entity to file Form I-129.',
        fixable: true,
      });
      return { checks };
    },
  },

  // 8. L-1A / L-1B Intracompany Transferee Work Visa
  {
    id: 'us-l1',
    country: 'US',
    name: 'US L-1A / L-1B Intracompany Transferee Visa (Multinational & Startup Expansion)',
    category: 'work',
    kind: 'temporary',
    summary:
      'Allows a company outside the US to transfer a manager/executive (L-1A, up to 7 years) or specialized-knowledge employee (L-1B, up to 5 years) to an existing US branch/subsidiary OR to open a brand-new US office. L-1A provides a direct fast-track to the EB-1C Green Card.',
    goals: ['work', 'permanent', 'start_business'],
    officialUrl:
      'https://www.uscis.gov/working-in-the-united-states/temporary-workers/l-1a-intracompany-transferee-executive-or-manager',
    links: [
      {
        label: 'USCIS — L-1A Intracompany Transferee Executive or Manager',
        url: 'https://www.uscis.gov/working-in-the-united-states/temporary-workers/l-1a-intracompany-transferee-executive-or-manager',
      },
      {
        label: 'USCIS — L-1B Intracompany Transferee Specialized Knowledge',
        url: 'https://www.uscis.gov/working-in-the-united-states/temporary-workers/l-1b-intracompany-transferee-specialized-knowledge',
      },
    ],
    availability: 'open',
    steps: [
      'Verify 12+ months of full-time payroll/employment with the foreign company within the preceding 3 years.',
      'File Form I-129 (or apply directly at a US Consulate if your employer holds an approved L-1 Blanket Petition).',
    ],
    fees: 'Form I-129: $695 (small employer) or $1,385 standard + $500 Fraud Fee + $300/$600 Asylum Fee | Spouses (L-2S) receive automatic unrestricted US work authorization',
    processingTime: '15 business days with Premium Processing (or 2–4 months regular)',
    lastVerified: '2026-04-17',
    evaluate: (p: Profile) => {
      const checks: Check[] = [];
      const totalExp = (p.foreignExpYears ?? 0) + (p.canadianExpYears ?? 0);
      checks.push({
        label: 'At least 1 continuous year of employment with the foreign company within the last 3 years',
        result:
          totalExp >= 1
            ? 'pass'
            : p.foreignExpYears === undefined
              ? 'unknown'
              : 'fail',
        detail: `You reported ${totalExp} year(s) of experience.`,
        fixable: true,
      });
      checks.push({
        label: 'Transferring to a US parent, branch, subsidiary, or affiliate (or opening a New US Office)',
        result: p.intraCompany === 'yes' || p.jobOffer === 'yes' ? 'pass' : 'fail',
        detail:
          'Requires an active qualifying relationship between the foreign company and the US entity (business owners can also use L-1A "New Office" to expand their foreign company to the US).',
        fixable: true,
      });
      return { checks };
    },
  },

  // 9. TN USMCA Professional Work Visa (For Canadian & Mexican Citizens)
  {
    id: 'us-tn',
    country: 'US',
    name: 'US TN USMCA Professional Work Visa (For Canadian & Mexican Citizens)',
    category: 'work',
    kind: 'temporary',
    summary:
      'Fast-track, lottery-free US work visa exclusively for Canadian and Mexican citizens in ~63 designated USMCA professions (engineers, computer systems analysts, accountants, nurses, scientists, architects, management consultants). Canadians can apply on the spot at the US border/airport.',
    goals: ['work'],
    officialUrl:
      'https://www.uscis.gov/working-in-the-united-states/temporary-workers/tn-usmca-professionals',
    links: [
      {
        label: 'USCIS — TN USMCA Professionals Eligibility & Process',
        url: 'https://www.uscis.gov/working-in-the-united-states/temporary-workers/tn-usmca-professionals',
      },
    ],
    availability: 'open',
    steps: [
      'Obtain a TN Support Letter from your US employer detailing your USMCA profession, duties, salary, and length of stay (up to 3 years per approval, indefinitely renewable).',
      'Present your passport, original degree, and employer letter at a US Port of Entry / Preclearance airport (Canadians) or US Consulate (Mexicans).',
    ],
    fees: 'Canadian Citizens at Port of Entry: $50 + $6 I-94 fee | Mexican Citizens at US Consulate: $185 DS-160 fee',
    processingTime:
      'Same day at US port of entry/airport preclearance (for Canadian citizens) or 2–6 weeks at US Embassy (for Mexican citizens)',
    lastVerified: '2026-04-17',
    evaluate: (p: Profile) => {
      const checks: Check[] = [];
      const isCaOrMx =
        p.citizenships?.includes('CA') ||
        p.citizenships?.includes('MX') ||
        p.canadaStatus === 'citizen';

      checks.push({
        label: 'Canadian or Mexican Citizenship (Permanent Residents must naturalize first)',
        result: isCaOrMx ? 'pass' : 'fail',
        detail: isCaOrMx
          ? 'You hold Canadian or Mexican citizenship.'
          : 'TN status is strictly limited to citizens of Canada or Mexico under the USMCA treaty.',
        fixable: false,
      });

      checks.push({
        label: 'Bachelor’s Degree (or applicable license) in one of ~63 USMCA professions + US Job Offer',
        result:
          hasEduAtLeast(p.education, 'bachelors') && p.jobOffer === 'yes' ? 'pass' : 'fail',
        detail:
          'Requires a US job offer letter in a listed USMCA profession and matching degree/credentials.',
        fixable: true,
      });

      return { checks };
    },
  },

  // 10. EB-5 Immigrant Investor Green Card & E-2 Treaty Investor Visa
  {
    id: 'us-eb5',
    country: 'US',
    name: 'US EB-5 Immigrant Investor Green Card & E-2 Treaty Investor Visa',
    category: 'economic',
    kind: 'permanent',
    summary:
      'Direct US Green Card for investing $800,000 in a Targeted Employment Area (Rural or High-Unemployment Regional Center project) or $1,050,000 standard and creating 10 US jobs (EB-5, available to all nationalities). Alternatively, citizens of E-2 treaty countries (e.g., Jordan, Egypt, Morocco, Turkey, Canada, UK, Germany) can obtain a renewable E-2 Investor Visa with ~$100,000+ active business investment.',
    goals: ['permanent', 'work', 'start_business'],
    officialUrl:
      'https://www.uscis.gov/working-in-the-united-states/permanent-workers/eb-5-immigrant-investor-program',
    links: [
      {
        label: 'USCIS — EB-5 Immigrant Investor Program ($800k / $1.05M)',
        url: 'https://www.uscis.gov/working-in-the-united-states/permanent-workers/eb-5-immigrant-investor-program',
      },
      {
        label: 'USCIS — E-2 Treaty Investors (Substantial Active Investment)',
        url: 'https://www.uscis.gov/working-in-the-united-states/temporary-workers/e-2-treaty-investors',
      },
    ],
    availability: 'open',
    steps: [
      'For a direct Green Card (any nationality): Select a USCIS-designated Rural or Infrastructure EB-5 Regional Center project ($800,000 USD) and document lawful source of funds for Form I-526E.',
      'For lower capital ($100k–$200k USD): Check if you hold citizenship of an E-2 Treaty Country and invest in an active US operating business or franchise.',
    ],
    fees: 'EB-5 Form I-526 / I-526E: $11,160 | E-2 Consular DS-160: $315',
    processingTime:
      'EB-5 Rural TEA: ~10–18 months (priority processing & reserved visas); E-2 Consular Visa: 1–3 months',
    lastVerified: '2026-04-17',
    evaluate: (p: Profile) => {
      const checks: Check[] = [];
      const wealth = Math.max(p.fundsCAD ?? 0, p.netWorthCAD ?? 0);
      const hasEb5Funds = wealth >= 1_000_000;
      const hasE2Funds = wealth >= 100_000;

      checks.push({
        label: 'Investment Capital ($800,000 USD for EB-5 Green Card OR ~$100,000+ USD for E-2 Treaty Visa)',
        result: hasEb5Funds
          ? 'pass'
          : hasE2Funds
            ? 'pass'
            : p.fundsCAD === undefined && p.netWorthCAD === undefined
              ? 'unknown'
              : 'fail',
        detail: hasEb5Funds
          ? 'Your reported capital meets the $800,000 USD (~$1.1M CAD) EB-5 Green Card threshold.'
          : hasE2Funds
            ? 'Your reported capital meets the typical $100,000+ USD E-2 Treaty Investor threshold (requires citizenship of a US E-2 treaty country such as Jordan, Egypt, Morocco, Turkey, Canada, or EU).'
            : 'EB-5 requires $800,000 USD; E-2 requires a substantial active investment (~$100,000+ USD) and treaty nationality.',
        fixable: true,
      });

      checks.push({
        label: 'Lawful Source of Funds & Job Creation (No English, Age, or Degree Required)',
        result: 'pass',
        detail: 'Neither EB-5 nor E-2 requires an English test, specific age, or university degree.',
      });

      return { checks };
    },
  },

  // 11. F-1 Academic Student Visa & OPT / 36-Month STEM OPT
  {
    id: 'us-f1-opt',
    country: 'US',
    name: 'US F-1 Student Visa + Post-Graduation OPT & 36-Month STEM OPT',
    category: 'study',
    kind: 'temporary',
    summary:
      'Study at a SEVP-certified US university, college, or intensive English program. Graduates earn 12 months of Optional Practical Training (OPT) open US work authorization—extended to 36 full months (3 years) for STEM degrees, giving multiple attempts at H-1B or direct EB-2 NIW / EB-3 Green Cards.',
    goals: ['study', 'work', 'permanent'],
    officialUrl:
      'https://www.uscis.gov/working-in-the-united-states/students-and-exchange-visitors/students-and-employment',
    links: [
      {
        label: 'USCIS — F-1 Students and Employment',
        url: 'https://www.uscis.gov/working-in-the-united-states/students-and-exchange-visitors/students-and-employment',
      },
      {
        label: 'USCIS — Optional Practical Training (OPT) & 24-Month STEM OPT Extension',
        url: 'https://www.uscis.gov/working-in-the-united-states/students-and-exchange-visitors/optional-practical-training-opt-for-f-1-students',
      },
    ],
    availability: 'open',
    steps: [
      'Prioritize STEM-designated degree programs (CIP codes on the DHS STEM Designated Degree Program List) so you qualify for 3 full years (36 months) of post-graduation US work authorization.',
      'Receive Form I-20 from the university, pay the $350 I-901 SEVIS fee, and schedule your F-1 interview via Form DS-160.',
    ],
    fees: 'I-901 SEVIS Fee: $350 | DS-160 Visa Fee: $185 | Post-Graduation OPT (Form I-765 online): $470',
    processingTime: '2–8 weeks (depending on US Embassy interview wait times)',
    lastVerified: '2026-04-17',
    evaluate: (p: Profile) => {
      const checks: Check[] = [];
      checks.push({
        label: 'High School Diploma or Bachelor’s Degree (for Undergraduate / Graduate Admission)',
        result: hasEduAtLeast(p.education, 'secondary')
          ? 'pass'
          : p.education === undefined
            ? 'unknown'
            : 'fail',
        detail: 'Requires at least secondary school completion.',
        fixable: true,
      });

      const hasAdmission =
        p.studyPlan === 'accepted_dli' || p.studyPlan === 'accepted_with_pal';
      checks.push({
        label: 'SEVP-Certified US School Admission (Form I-20) OR willingness to apply',
        result: hasAdmission ? 'pass' : 'unknown',
        detail: hasAdmission
          ? 'You indicated having an admission offer.'
          : 'You must apply to a SEVP-certified US college or university to receive Form I-20.',
        fixable: true,
      });

      const hasFunds = (p.fundsCAD ?? 0) >= 25_000;
      checks.push({
        label:
          'Proof of first-year tuition & living funds (personal/family funds, scholarship, or graduate assistantship)',
        result: hasFunds ? 'pass' : p.fundsCAD === undefined ? 'unknown' : 'fail',
        detail: hasFunds
          ? 'Your reported savings cover typical first-year I-20 financial proof.'
          : 'Requires proof of liquid funds, family sponsor, scholarship, or fully funded PhD/Master’s Teaching/Research Assistantship covering the first-year Form I-20 estimate.',
        fixable: true,
      });

      return { checks };
    },
  },

  // 12. J-1 Exchange Visitor Visa (Scholars, Interns, Physicians & Trainees)
  {
    id: 'us-j1',
    country: 'US',
    name: 'US J-1 Exchange Visitor Visa (Researchers, Interns, Medical Residents & Trainees)',
    category: 'work',
    kind: 'temporary',
    summary:
      'Covers university Research Scholars, Short-Term Scholars, Medical Residents (ECFMG clinical training), University Interns, Professional Trainees, and Au Pairs sponsored through a designated DS-2019 Exchange Visitor sponsor.',
    goals: ['work', 'study'],
    officialUrl:
      'https://www.uscis.gov/working-in-the-united-states/students-and-exchange-visitors/exchange-visitors',
    links: [
      {
        label: 'USCIS — J-1 Exchange Visitors Guide',
        url: 'https://www.uscis.gov/working-in-the-united-states/students-and-exchange-visitors/exchange-visitors',
      },
    ],
    availability: 'open',
    steps: [
      'Secure an internship, research postdoc, or medical residency with a designated J-1 sponsor organization to receive Form DS-2019.',
      'Check whether the revised 2024/2026 Exchange Visitor Skills List subjects your country to the 2-year home residency rule (§212(e))—many countries were removed in the December 2024 update.',
    ],
    fees: 'SEVIS I-901 Fee: $220 | DS-160 Visa Fee: $185 (Waived for US government-sponsored programs like Fulbright)',
    processingTime: '2–6 weeks',
    lastVerified: '2026-04-17',
    evaluate: (p: Profile) => {
      const checks: Check[] = [];
      checks.push({
        label: 'Academic, Research, Medical, or Professional Training Qualification',
        result: hasEduAtLeast(p.education, 'one_year')
          ? 'pass'
          : p.education === undefined
            ? 'unknown'
            : 'fail',
        detail:
          'Requires university student/graduate status, research appointment, or USMLE/ECFMG certification for physicians.',
        fixable: true,
      });
      checks.push({
        label: 'Form DS-2019 from a Designated US Exchange Sponsor',
        result:
          p.jobOffer === 'yes' ||
          p.studyPlan === 'accepted_dli' ||
          p.studyPlan === 'accepted_with_pal'
            ? 'pass'
            : 'unknown',
        detail:
          'Your host US university, hospital, or designated J-1 sponsor organization issues Form DS-2019.',
        fixable: true,
      });
      return { checks };
    },
  },

  // 13. US Family Sponsorship — Immediate Relatives & Family Preference (I-130) & K-1 Fiancé(e)
  {
    id: 'us-family-ir',
    country: 'US',
    name: 'US Family Green Card & K-1 Fiancé(e) Sponsorship (Spouse, Parent, Child or Sibling)',
    category: 'family',
    kind: 'permanent',
    summary:
      'US Citizens and Green Card holders (Lawful Permanent Residents) can sponsor family members for a US Green Card via Form I-130. Immediate Relatives of US Citizens (spouses, unmarried children under 21, and parents) have UNLIMITED annual visas with no quota backlog. Also includes K-1 Fiancé(e) visas for engaged partners of US Citizens.',
    goals: ['join_family', 'permanent'],
    officialUrl: 'https://www.uscis.gov/family/family-of-us-citizens',
    links: [
      {
        label: 'USCIS — Family of U.S. Citizens (Immediate Relatives & Preference Categories)',
        url: 'https://www.uscis.gov/family/family-of-us-citizens',
      },
      {
        label: 'USCIS — K-1 Visas for Fiancé(e)s of U.S. Citizens',
        url: 'https://www.uscis.gov/family/family-of-us-citizens/visas-for-fiancees-of-us-citizens',
      },
      {
        label: 'USCIS — Green Card for Family Preference Immigrants',
        url: 'https://www.uscis.gov/green-card/green-card-eligibility/green-card-for-family-preference-immigrants',
      },
    ],
    availability: 'open',
    steps: [
      'Have your US Citizen or Green Card holder relative file Form I-130 online with USCIS (or Form I-129F if applying as the fiancé(e) of a US Citizen).',
      'Once approved, complete National Visa Center (NVC) processing (Form DS-260 and Form I-864 Affidavit of Support) and attend the US Embassy medical exam and interview.',
    ],
    fees: 'Form I-130: $625 (online) / $675 (paper) | Form I-129F (K-1 Fiancé): $675 | NVC DS-260 ($325) + Affidavit of Support I-864 ($120) or I-485 ($1,440)',
    processingTime:
      'Immediate Relatives (Spouse/Parent/Minor Child of US Citizen): 11–16 months | K-1 Fiancé(e): 8–13 months | F2A (Spouse/Child of Green Card Holder): ~2–3.5 years',
    lastVerified: '2026-04-17',
    evaluate: (p: Profile) => {
      const checks: Check[] = [];
      const rels = p.relativesCitizenPR ?? [];
      const hasDirectFamily =
        rels.some((r) => ['spouse', 'parent', 'child', 'sibling'].includes(r)) ||
        p.spouseStatus === 'citizen' ||
        p.spouseStatus === 'pr';

      checks.push({
        label:
          'Qualifying US Citizen or Green Card Holder Relative (Spouse, Fiancé(e), Parent, Child, or Sibling)',
        result: hasDirectFamily ? 'pass' : 'fail',
        detail: hasDirectFamily
          ? 'You indicated having a qualifying close relative or spouse/partner.'
          : 'Requires a US Citizen spouse, fiancé(e), parent, adult child (21+), or sibling—or a US Green Card holder spouse or parent (for unmarried children).',
        fixable: false,
      });

      checks.push({
        label:
          'Sponsor Financial Affidavit of Support (Form I-864 — 125% of Federal Poverty Guidelines, ~$26,437/yr for household of 2)',
        result: 'pass',
        detail:
          'If the petitioner’s income is below 125% of the HHS poverty line, any US Citizen or Green Card holder can act as a Joint Sponsor.',
      });

      return { checks };
    },
  },

  // 14. US Asylum (Form I-589 Inside the US) & Overseas Refugee Resettlement (USRAP)
  {
    id: 'us-asylum-refugee',
    country: 'US',
    name: 'US Asylum (Form I-589) & Overseas Refugee Resettlement (USRAP / TPS)',
    category: 'refugee',
    kind: 'permanent',
    summary:
      'Protection for individuals fleeing persecution based on race, religion, nationality, political opinion, or membership in a particular social group. Includes Affirmative/Defensive Asylum (Form I-589 for those physically inside the US or at a port of entry) and Overseas US Refugee Admissions Program (USRAP) referrals via UNHCR/embassies, plus Temporary Protected Status (TPS) for designated conflict countries.',
    goals: ['protection', 'permanent'],
    officialUrl: 'https://www.uscis.gov/humanitarian/refugees-and-asylum',
    links: [
      {
        label: 'USCIS — Asylum in the United States (Form I-589)',
        url: 'https://www.uscis.gov/humanitarian/refugees-and-asylum/asylum',
      },
      {
        label: 'USCIS — Refugees & USRAP Overseas Resettlement',
        url: 'https://www.uscis.gov/humanitarian/refugees-and-asylum/refugees',
      },
      {
        label: 'USCIS — Temporary Protected Status (TPS Designated Countries)',
        url: 'https://www.uscis.gov/humanitarian/temporary-protected-status',
      },
    ],
    availability: 'open',
    steps: [
      'If physically inside the US: File Form I-589 (Application for Asylum and for Withholding of Removal) with USCIS within 1 year of your last arrival, and apply for your free C08 Work Permit (Form I-765) after 150 days.',
      'If displaced outside your country of origin: Register with UNHCR for USRAP Priority-1 referral, or check if a close relative with US Citizen/LPR/Asylee/Refugee status can file Form I-730 (Follow-to-Join Spouse/Child) or Priority-3 family referral.',
    ],
    fees: '$0 (Filing Form I-589 for Asylum, USRAP Refugee processing, and initial Asylum Employment Authorization Form I-765 are completely free)',
    processingTime:
      'Asylum Work Permit (EAD): eligible to apply 150 days after filing Form I-589 (issued at 180 days); eligible to apply for a US Green Card 1 year after asylum/refugee grant',
    lastVerified: '2026-04-17',
    evaluate: (p: Profile) => {
      const checks: Check[] = [];
      checks.push({
        label:
          'Well-founded fear of persecution on one of the 5 protected grounds (race, religion, nationality, political opinion, or social group)',
        result: p.fearOfReturn === 'yes' ? 'pass' : 'fail',
        detail:
          p.fearOfReturn === 'yes'
            ? 'You indicated fearing persecution or serious harm upon return.'
            : 'Requires a well-founded fear of persecution or eligibility under a designated TPS country.',
        fixable: false,
      });

      checks.push({
        label:
          'Physical Location Requirement (In-US for Form I-589 Asylum vs. Outside Home Country for UNHCR/USRAP Resettlement)',
        result: 'pass',
        detail:
          'Affirmative Asylum (Form I-589) requires physical presence in the US (filed within 1 year of arrival). If outside the US and displaced outside your home country, protection goes through UNHCR / USRAP Priority 1–3 referrals.',
      });

      return { checks };
    },
  },

  // 15. US B-1/B-2 Visitor Visa & ESTA Visa Waiver Program
  {
    id: 'us-b1b2-esta',
    country: 'US',
    name: 'US B-1/B-2 Visitor Visa & Visa Waiver Program (ESTA)',
    category: 'visit',
    kind: 'temporary',
    summary:
      'Short-term US entry for tourism, family visits, business meetings, conferences, or medical treatment (B-1/B-2 visa, typically valid up to 6 months per stay), or 90-day visa-free travel via ESTA for citizens of the 42 Visa Waiver Program countries.',
    goals: ['visit', 'visit_family', 'business_visit'],
    officialUrl:
      'https://www.uscis.gov/working-in-the-united-states/temporary-visitors-for-business/b-1-temporary-business-visitor',
    links: [
      {
        label: 'USCIS — B-1/B-2 Temporary Visitor Guide',
        url: 'https://www.uscis.gov/working-in-the-united-states/temporary-visitors-for-business/b-1-temporary-business-visitor',
      },
      {
        label: 'Official U.S. CBP ESTA Application Portal',
        url: 'https://esta.cbp.dhs.gov/',
      },
    ],
    availability: 'open',
    steps: [
      'Complete Form DS-160 online at ceac.state.gov, pay the $185 MRV fee, and schedule a consular interview (Canadian citizens generally enter visa-free as B-1/B-2 visitors at the border; VWP citizens apply online via esta.cbp.dhs.gov).',
    ],
    fees: 'B-1/B-2 Visa (Form DS-160): $185 | ESTA (for Visa Waiver Program citizens): $40.62',
    processingTime: 'ESTA: 72 hours | B-1/B-2 Embassy Interview: varies by consulate',
    lastVerified: '2026-04-17',
    evaluate: (p: Profile) => {
      const checks: Check[] = [];
      checks.push({
        label: 'Valid Passport & Non-Immigrant Intent (Strong Ties to Home/Residence Country)',
        result: p.passport === 'none' ? 'fail' : 'pass',
        detail:
          'Requires demonstrating a clear purpose of trip, financial ability to cover travel expenses, and strong employment/family/property ties outside the US under INA §214(b).',
        fixable: true,
      });
      const hasCrimOrOverstay =
        (p.criminality && p.criminality !== 'none') ||
        p.history?.includes('overstayed_canada') ||
        p.history?.includes('removed_from_canada');
      checks.push({
        label: 'Admissibility (No criminal or prior immigration overstay bars)',
        result: hasCrimOrOverstay ? 'fail' : 'pass',
        detail: hasCrimOrOverstay
          ? 'Prior overstays or criminal records may require a non-immigrant waiver (§212(d)(3)).'
          : 'No admissibility bars reported.',
        fixable: true,
      });
      return { checks };
    },
  },

  // 16. US Naturalization & Citizenship (Form N-400)
  {
    id: 'us-n400',
    country: 'US',
    name: 'US Citizenship by Naturalization (Form N-400 — 5-Year or 3-Year Rule)',
    category: 'citizenship',
    kind: 'citizenship',
    summary:
      'Lawful Permanent Residents (Green Card holders) can apply for full US Citizenship and a US Passport after 5 years of permanent residence (or 3 years if married to and living with a US Citizen), with at least 50% physical presence in the United States.',
    goals: ['citizenship'],
    officialUrl:
      'https://www.uscis.gov/citizenship/learn-about-citizenship/citizenship-and-naturalization',
    links: [
      {
        label: 'USCIS — Citizenship and Naturalization (Form N-400)',
        url: 'https://www.uscis.gov/citizenship/learn-about-citizenship/citizenship-and-naturalization',
      },
    ],
    availability: 'open',
    steps: [
      'File Form N-400 online via your USCIS account up to 90 calendar days before completing your 3-year or 5-year Green Card continuous residence period.',
      'Attend your USCIS interview and civics test, then take the Oath of Allegiance to receive your Certificate of Naturalization.',
    ],
    fees: 'Form N-400: $710 (online) / $760 (paper) | Reduced Fee: $380 (if household income is ≤400% of Federal Poverty Guidelines)',
    processingTime: '5–8 months on average (including naturalization interview and oath ceremony)',
    lastVerified: '2026-04-17',
    evaluate: (p: Profile) => {
      const checks: Check[] = [];
      const isUsPr = p.usStatus === 'us_green_card' || p.residenceCountry === 'US';

      checks.push({
        label:
          'Hold a US Green Card (Lawful Permanent Resident) for 5 years (or 3 years married to a US Citizen)',
        result: isUsPr ? 'pass' : 'fail',
        detail: isUsPr
          ? 'You hold US Lawful Permanent Resident (Green Card) status or reside in the US.'
          : 'You must first obtain a US Green Card (via EB-1/EB-2/EB-3, DV Lottery, Family, EB-5, or Asylum) and hold it for 5 years (or 3 years if married to a US Citizen). You can file Form N-400 up to 90 days early.',
        fixable: true,
      });

      checks.push({
        label: 'Basic English Reading/Writing/Speaking & US Civics Test + Good Moral Character',
        result: p.criminality && p.criminality !== 'none' ? 'fail' : 'pass',
        detail: 'Tested during the USCIS naturalization interview.',
        fixable: true,
      });

      return { checks };
    },
  },
];
