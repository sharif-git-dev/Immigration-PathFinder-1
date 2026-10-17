import type { Check, EvalResult, Profile, Program } from '../../engine/types';

export interface ChancenkartePoints {
  total: number;
  passed: boolean;
  directEligible: boolean;
  factors: { label: string; points: number }[];
}

/**
 * Official 2026 German Opportunity Card (Chancenkarte - § 20a / § 20b AufenthG) Points Calculator.
 * Minimum 6 points required (unless holding a fully recognized German-equivalent qualification).
 */
export function calculateChancenkartePoints(p: Profile): ChancenkartePoints {
  const factors: { label: string; points: number }[] = [];
  let total = 0;

  const hasDegreeOr2YrDiploma =
    p.education === 'two_year' ||
    p.education === 'bachelors' ||
    p.education === 'two_or_more' ||
    p.education === 'masters' ||
    p.education === 'professional' ||
    p.education === 'phd';

  // Direct route if qualification is fully recognized in Germany (ANABIN H+ / ZAB)
  const directEligible = Boolean(
    hasDegreeOr2YrDiploma && (p.deDegreeRecognition === 'full_anabin' || p.ecaDone === 'yes'),
  );

  // 1. Age (< 35 = 2 pts, 35–40 = 1 pt)
  if (p.age !== undefined) {
    if (p.age >= 18 && p.age < 35) {
      factors.push({ label: 'Age under 35 (+2 pts)', points: 2 });
      total += 2;
    } else if (p.age >= 35 && p.age <= 40) {
      factors.push({ label: 'Age 35–40 (+1 pt)', points: 1 });
      total += 1;
    }
  }

  // 2. German Language (B2+ = 3 pts, B1 = 2 pts, A2 = 1 pt)
  const de = p.germanLevel ?? 0;
  if (de >= 4) {
    factors.push({ label: 'German B2 or higher (+3 pts)', points: 3 });
    total += 3;
  } else if (de === 3) {
    factors.push({ label: 'German B1 (+2 pts)', points: 2 });
    total += 2;
  } else if (de === 2) {
    factors.push({ label: 'German A2 (+1 pt)', points: 1 });
    total += 1;
  }

  // 3. English Language C1+ (CLB 9+ = 1 pt)
  if ((p.englishCLB ?? 0) >= 9) {
    factors.push({ label: 'English C1 / CLB 9+ (+1 pt)', points: 1 });
    total += 1;
  }

  // 4. Professional Experience (5+ yrs = 3 pts, 2–4 yrs = 2 pts)
  const exp = (p.foreignExpYears ?? 0) + (p.canadianExpYears ?? 0);
  if (exp >= 5) {
    factors.push({ label: '5+ years skilled work experience (+3 pts)', points: 3 });
    total += 3;
  } else if (exp >= 2) {
    factors.push({ label: '2+ years skilled work experience (+2 pts)', points: 2 });
    total += 2;
  }

  // 5. Shortage Occupation (Mangelberuf: STEM, Healthcare, Trades, Education = +1 pt)
  const fields = p.occupationFields ?? [];
  const isShortage = fields.some((f) =>
    ['stem', 'healthcare', 'trades', 'education'].includes(f),
  );
  if (isShortage) {
    factors.push({ label: 'Shortage occupation (STEM / Healthcare / Trades / Education) (+1 pt)', points: 1 });
    total += 1;
  }

  // 6. Qualification equivalence / Regulated profession partial recognition (+4 pts)
  if (
    p.deDegreeRecognition === 'partial_adaptation' ||
    (p.deDegreeRecognition === undefined &&
      hasDegreeOr2YrDiploma &&
      (fields.includes('healthcare') || fields.includes('education') || fields.includes('trades')))
  ) {
    factors.push({
      label: 'Partial German credential recognition / Defizitbescheid (+4 pts)',
      points: 4,
    });
    total += 4;
  }

  const meetsBaselineLang = de >= 1 || (p.englishCLB ?? 0) >= 7;
  const passed = Boolean(hasDegreeOr2YrDiploma && meetsBaselineLang && (total >= 6 || directEligible));

  return { total, passed, directEligible, factors };
}

export const germanyPrograms: Program[] = [
  // 1. Chancenkarte (Opportunity Card)
  {
    id: 'de-chancenkarte',
    country: 'DE',
    name: 'Germany Opportunity Card (Chancenkarte — Job Seeker Points Visa)',
    category: 'express_entry',
    kind: 'temporary',
    summary:
      'A 1-year residence permit (§ 20a AufenthG) allowing non-EU citizens to come to Germany without a prior job offer to look for skilled employment, work up to 20 hours/week part-time, and do 2-week trial jobs. Requires either full German credential equivalence OR at least 6 points.',
    goals: ['work', 'permanent'],
    officialUrl: 'https://www.make-it-in-germany.com/en/visa-residence/opportunity-card',
    links: [
      {
        label: 'Chancenkarte Visa Requirements',
        url: 'https://www.make-it-in-germany.com/en/visa-residence/types/job-search-opportunity-card',
      },
      {
        label: 'Official Q&A & Points System',
        url: 'https://www.make-it-in-germany.com/en/visa-residence/opportunity-card/questions-answers',
      },
    ],
    availability: 'open',
    availabilityNote: 'Open in 2026; no job offer required. Allows working 20 hrs/week immediately upon arrival.',
    steps: [
      'Verify that your university degree or 2-year vocational diploma is state-recognized in its country of issue (via the ANABIN database or ZAB).',
      'Prove either German at level A1 OR English at level B2 (CLB 7 / IELTS 6.0+).',
      'Score at least 6 points (based on age, work experience, language, and shortage occupation) OR hold full German credential recognition.',
      'Open a German Blocked Account (Sperrkonto) with €13,092 (€1,091/month for 12 months) OR secure a 20 hr/week part-time job offer in Germany.',
      'Apply online via the German Consular Services Portal (digital.diplo.de) or your local German Embassy.',
    ],
    fees: '€75 national visa fee',
    processingTime: '4 to 12 weeks',
    lastVerified: '2026-10-17',
    evaluate: (p: Profile): EvalResult => {
      const ck = calculateChancenkartePoints(p);
      const hasQualification =
        p.deDegreeRecognition === 'full_anabin' ||
        p.deDegreeRecognition === 'partial_adaptation' ||
        p.deDegreeRecognition === 'home_recognized' ||
        p.education === 'two_year' ||
        p.education === 'bachelors' ||
        p.education === 'two_or_more' ||
        p.education === 'masters' ||
        p.education === 'professional' ||
        p.education === 'phd';
      const de = p.germanLevel ?? 0;
      const en = p.englishCLB ?? 0;
      const meetsLang = de >= 1 || en >= 7;
      const fundsEUR = p.deFundsEUR ?? (p.fundsCAD !== undefined ? Math.round(p.fundsCAD * 0.68) : undefined);
      const fundsOk = fundsEUR === undefined ? 'unknown' : fundsEUR >= 13092 ? 'pass' : 'fail';

      const checks: Check[] = [
        {
          label: 'University degree or 2+ year state-recognized vocational diploma (ANABIN / ZAB)',
          result:
            p.deDegreeRecognition === 'none'
              ? 'fail'
              : p.education === undefined && p.deDegreeRecognition === undefined
                ? 'unknown'
                : hasQualification
                  ? 'pass'
                  : 'fail',
          detail:
            p.deDegreeRecognition === 'full_anabin'
              ? 'Your degree is fully recognized in Germany (ANABIN H+) — qualifies directly without needing 6 points!'
              : hasQualification
                ? 'Your post-secondary qualification meets the baseline requirement.'
                : 'Requires at least a 2-year state-recognized vocational diploma or university degree.',
          fixable: false,
        },
        {
          label: 'German A1 OR English B2 (CLB 7 / IELTS 6.0+)',
          result: de === 0 && p.englishCLB === undefined ? 'unknown' : meetsLang ? 'pass' : 'fail',
          detail: meetsLang
            ? 'Meets the mandatory baseline language requirement.'
            : 'You need either basic German (A1) or upper-intermediate English (B2 / CLB 7).',
          fixable: true,
        },
        {
          label: 'Minimum 6 Points on the Chancenkarte Grid (or direct ANABIN H+ equivalence)',
          result: ck.total >= 6 || ck.directEligible ? 'pass' : 'fail',
          detail: ck.directEligible
            ? `Direct eligibility via full German credential recognition (plus ${ck.total} points on grid).`
            : `Your estimated Chancenkarte score is ${ck.total} points (6 required). ${
                ck.factors.map((f) => f.label).join(' · ') || 'Add experience, language, or age details.'
              }`,
          fixable: true,
        },
        {
          label: 'Blocked Account (Sperrkonto) of €13,092/yr (€1,091/mo) or 20 hr/wk job contract',
          result: fundsOk,
          detail:
            fundsEUR !== undefined
              ? `You reported ~€${fundsEUR.toLocaleString()} EUR (2026 Chancenkarte requirement: €13,092/year or part-time contract).`
              : '2026 requirement: €1,091/month (€13,092/year) in a blocked account, OR a 20 hr/week job contract in Germany.',
          fixable: true,
        },
      ];

      return {
        checks,
        score: {
          label: 'Chancenkarte Points',
          value: ck.total,
          max: 14,
          detail: 'Minimum 6 points required',
        },
      };
    },
  },

  // 2. EU Blue Card Germany
  {
    id: 'de-eu-blue-card',
    country: 'DE',
    name: 'EU Blue Card Germany (Blaue Karte EU — Fast-Track Skilled PR)',
    category: 'work',
    kind: 'temporary',
    summary:
      'Germany’s premier residence permit (§ 18g AufenthG) for university graduates (and IT specialists with 3+ years experience) with a German job offer. Leads to permanent residency in just 21 months (with B1 German) or 27 months (with A1 German).',
    goals: ['work', 'permanent'],
    officialUrl: 'https://www.make-it-in-germany.com/en/visa-residence/types/eu-blue-card',
    links: [
      {
        label: 'EU Blue Card Requirements & 2026 Salary Thresholds',
        url: 'https://www.make-it-in-germany.com/en/visa-residence/types/eu-blue-card',
      },
    ],
    availability: 'open',
    availabilityNote:
      '2026 Salary Thresholds: €50,700/yr standard OR €45,934.20/yr for STEM, Healthcare, Teachers, Recent Graduates, and IT Specialists.',
    steps: [
      'Hold a recognized university degree (checked via ANABIN as H+) OR 3+ years of professional IT experience.',
      'Secure a concrete German job offer matching your qualification with a gross annual salary of at least €45,934.20 (shortage/IT/recent graduate) or €50,700 (standard).',
      'Apply for the EU Blue Card visa at the German Embassy (no German language test required for the Blue Card itself).',
      'Apply for Permanent Settlement (Niederlassungserlaubnis) after 21 months (with B1 German) or 27 months (with A1 German).',
    ],
    fees: '€75 visa fee + €100 residence permit card in Germany',
    processingTime: '2 to 6 weeks',
    lastVerified: '2026-10-17',
    evaluate: (p: Profile): EvalResult => {
      const hasUniDegree =
        p.education === 'bachelors' ||
        p.education === 'two_or_more' ||
        p.education === 'masters' ||
        p.education === 'professional' ||
        p.education === 'phd';
      const isITWith3Yrs =
        (p.occupationFields ?? []).includes('stem') &&
        (p.foreignExpYears ?? 0) + (p.canadianExpYears ?? 0) >= 3;

      const hasBlueCardOffer =
        p.deJobOfferType === 'blue_card_50700' ||
        p.deJobOfferType === 'shortage_it_45934' ||
        (p.deJobOfferType === undefined && p.jobOffer === 'yes');

      const checks: Check[] = [
        {
          label: 'University degree (ANABIN H+) OR 3+ years of professional IT experience',
          result: p.education === undefined ? 'unknown' : hasUniDegree || isITWith3Yrs ? 'pass' : 'fail',
          detail:
            hasUniDegree || isITWith3Yrs
              ? 'Qualifies under the academic degree or IT specialist rule.'
              : 'Requires a university degree (bachelor’s or higher) or 3+ years of IT experience.',
          fixable: false,
        },
        {
          label: 'German job offer meeting 2026 salary threshold (€45,934.20 or €50,700/yr)',
          result: hasBlueCardOffer ? 'pass' : 'fail',
          detail: hasBlueCardOffer
            ? 'Your German job offer meets the 2026 EU Blue Card salary threshold.'
            : '2026 minimum gross salary: €45,934.20/yr for shortage fields (STEM, doctors, teachers, IT) & recent graduates, or €50,700/yr for other fields.',
          fixable: true,
        },
        {
          label: 'No German language certificate required at entry',
          result: 'pass',
          detail: 'Spouses also receive immediate unrestricted work rights without an A1 German test.',
        },
      ];

      return { checks };
    },
  },

  // 3. Skilled Worker Visa (Academic & Vocational)
  {
    id: 'de-skilled-worker',
    country: 'DE',
    name: 'Germany Skilled Worker Visa (Fachkräfte — Academic or Vocational, §§ 18a/18b)',
    category: 'work',
    kind: 'temporary',
    summary:
      'Work and residence permit for professionals with a recognized university degree (§ 18b) or recognized vocational training (§ 18a) who have a job offer in Germany in any qualified occupation, with no fixed statutory minimum salary under age 45.',
    goals: ['work', 'permanent'],
    officialUrl: 'https://www.make-it-in-germany.com/en/visa-residence/types/work-visa-qualified-professionals',
    links: [
      {
        label: 'Work Visa for Qualified Professionals',
        url: 'https://www.make-it-in-germany.com/en/visa-residence/types/work-visa-qualified-professionals',
      },
    ],
    availability: 'open',
    availabilityNote: 'Leads to German permanent residency in 36 months (3 years).',
    steps: [
      'Obtain German equivalence/recognition of your university degree or vocational diploma.',
      'Secure a qualified job offer in Germany (if aged 45+, 2026 minimum salary is €55,770/year or proof of adequate pension).',
      'Employer obtains pre-approval from the Federal Employment Agency (BA).',
      'Apply for the Skilled Worker Visa at the German mission.',
    ],
    fees: '€75 visa fee',
    processingTime: '4 to 10 weeks',
    lastVerified: '2026-10-17',
    evaluate: (p: Profile): EvalResult => {
      const hasQual =
        p.education !== undefined && p.education !== 'none' && p.education !== 'secondary';
      const hasDeJob =
        p.deJobOfferType === 'blue_card_50700' ||
        p.deJobOfferType === 'shortage_it_45934' ||
        p.deJobOfferType === 'skilled_other' ||
        (p.deJobOfferType === undefined && p.jobOffer === 'yes');

      const checks: Check[] = [
        {
          label: 'Recognized university degree or vocational diploma (2+ years)',
          result: p.education === undefined ? 'unknown' : hasQual ? 'pass' : 'fail',
          detail:
            p.deDegreeRecognition === 'full_anabin'
              ? 'Your qualification is already recognized in Germany.'
              : hasQual
                ? 'Eligible once recognized as equivalent in Germany.'
                : 'Requires post-secondary vocational training or a university degree.',
          fixable: false,
        },
        {
          label: 'Qualified job offer in Germany',
          result: hasDeJob ? 'pass' : 'fail',
          detail: hasDeJob
            ? 'You hold a qualifying German job offer.'
            : 'Requires a concrete job offer from a German employer.',
          fixable: true,
        },
      ];
      return { checks };
    },
  },

  // 4. Experienced Workers Visa (Erfahrungssäule)
  {
    id: 'de-experienced-worker',
    country: 'DE',
    name: 'Germany Experienced Worker Visa (No Formal Recognition Required — § 19c(2))',
    category: 'work',
    kind: 'temporary',
    summary:
      'Allows skilled professionals with at least 2 years of work experience and a foreign degree/2-year vocational diploma to work in Germany in non-regulated occupations WITHOUT needing formal German credential recognition first.',
    goals: ['work', 'permanent'],
    officialUrl: 'https://www.make-it-in-germany.com/en/visa-residence/types/visa-professionally-experienced-workers',
    links: [
      {
        label: 'Visa for Professionally Experienced Workers',
        url: 'https://www.make-it-in-germany.com/en/visa-residence/types/visa-professionally-experienced-workers',
      },
    ],
    availability: 'open',
    availabilityNote: '2026 salary requirement: €45,630/year gross (or collective bargaining wage).',
    steps: [
      'Hold a foreign degree or 2-year state-recognized vocational diploma (verified via ZAB).',
      'Prove at least 2 years of relevant professional experience within the last 5 years.',
      'Secure a job offer in Germany paying at least €45,630/year gross (2026 threshold) or covered by a union collective agreement.',
    ],
    fees: '€75 visa fee',
    processingTime: '4 to 8 weeks',
    lastVerified: '2026-10-17',
    evaluate: (p: Profile): EvalResult => {
      const hasQual =
        p.education !== undefined && p.education !== 'none' && p.education !== 'secondary';
      const exp = (p.foreignExpYears ?? 0) + (p.canadianExpYears ?? 0);
      const hasDeJob =
        p.deJobOfferType === 'blue_card_50700' ||
        p.deJobOfferType === 'shortage_it_45934' ||
        p.deJobOfferType === 'skilled_other' ||
        (p.deJobOfferType === undefined && p.jobOffer === 'yes');

      const checks: Check[] = [
        {
          label: 'Foreign degree or 2-year vocational diploma (recognized in country of origin)',
          result: p.education === undefined ? 'unknown' : hasQual ? 'pass' : 'fail',
          fixable: false,
        },
        {
          label: 'At least 2 years of professional work experience in the last 5 years',
          result: exp >= 2 ? 'pass' : 'fail',
          detail: `You reported ${exp} year(s) of experience.`,
          fixable: true,
        },
        {
          label: 'German job offer paying ≥ €45,630/yr (or union collective wage)',
          result: hasDeJob ? 'pass' : 'fail',
          fixable: true,
        },
      ];
      return { checks };
    },
  },

  // 5. Recognition Partnership (Anerkennungspartnerschaft)
  {
    id: 'de-recognition-partnership',
    country: 'DE',
    name: 'Germany Recognition Partnership Visa (Anerkennungspartnerschaft — § 16d)',
    category: 'work',
    kind: 'temporary',
    summary:
      'Start working in Germany immediately while completing the recognition of your foreign degree or vocational diploma after arrival, through a written agreement with your German employer.',
    goals: ['work', 'permanent'],
    officialUrl: 'https://www.make-it-in-germany.com/en/visa-residence/types/other/recognition-partnership',
    links: [
      {
        label: 'Official Recognition Partnership Guide',
        url: 'https://www.make-it-in-germany.com/en/visa-residence/types/other/recognition-partnership',
      },
    ],
    availability: 'open',
    steps: [
      'Hold a foreign university degree or 2-year state-recognized vocational qualification.',
      'Reach at least A2 level in German.',
      'Sign a job contract and written Recognition Partnership agreement with a German employer.',
    ],
    fees: '€75 visa fee',
    processingTime: '4 to 10 weeks',
    lastVerified: '2026-10-17',
    evaluate: (p: Profile): EvalResult => {
      const hasQual =
        p.education !== undefined && p.education !== 'none' && p.education !== 'secondary';
      const de = p.germanLevel ?? 0;
      const hasDeJob =
        p.deJobOfferType === 'blue_card_50700' ||
        p.deJobOfferType === 'shortage_it_45934' ||
        p.deJobOfferType === 'skilled_other' ||
        (p.deJobOfferType === undefined && p.jobOffer === 'yes');

      const checks: Check[] = [
        {
          label: 'Foreign university degree or 2-year vocational qualification',
          result: p.education === undefined ? 'unknown' : hasQual ? 'pass' : 'fail',
          fixable: false,
        },
        {
          label: 'German language at A2 level or higher',
          result: de >= 2 ? 'pass' : 'fail',
          detail: de >= 2 ? 'Meets A2 German requirement.' : 'Requires at least A2 German.',
          fixable: true,
        },
        {
          label: 'Job offer & recognition agreement with a German employer',
          result: hasDeJob ? 'pass' : 'fail',
          fixable: true,
        },
      ];
      return { checks };
    },
  },

  // 6. Study Visa Germany
  {
    id: 'de-study-visa',
    country: 'DE',
    name: 'Germany Student Visa (Visum zum Studium — § 16b AufenthG)',
    category: 'study',
    kind: 'temporary',
    summary:
      'Study at a German university (most public universities charge €0 tuition fees). Includes work rights of 140 full days/year (or 20 hrs/week) while studying, followed by an 18-month post-study job-seeker permit.',
    goals: ['study', 'permanent'],
    officialUrl: 'https://www.make-it-in-germany.com/en/visa-residence/types/studying',
    links: [
      {
        label: 'Study Visa Requirements & Blocked Account',
        url: 'https://www.make-it-in-germany.com/en/visa-residence/types/studying',
      },
    ],
    availability: 'open',
    availabilityNote: '2026 Blocked Account (Sperrkonto) requirement: €11,904/year (€992/month).',
    steps: [
      'Obtain an admission letter (Zulassungsbescheid) from a state-recognized German university or Studienkolleg.',
      'Deposit €11,904 (€992/month) into a German Blocked Account (Sperrkonto) or hold a recognized scholarship.',
      'Apply for the student visa at the German Embassy.',
      'After graduating, switch to the 18-month Post-Study Job Seeker Permit (§ 20 AufenthG) and Permanent Residency after 24 months of skilled work.',
    ],
    fees: '€75 student visa fee',
    processingTime: '4 to 10 weeks',
    lastVerified: '2026-10-17',
    evaluate: (p: Profile): EvalResult => {
      const hasHighSchool = p.education !== undefined && p.education !== 'none';
      const fundsEUR = p.deFundsEUR ?? (p.fundsCAD !== undefined ? Math.round(p.fundsCAD * 0.68) : undefined);
      const hasAdmission = p.deJobOfferType === 'uni_admission';

      const checks: Check[] = [
        {
          label: 'High school diploma or bachelor’s degree for university admission',
          result: p.education === undefined ? 'unknown' : hasHighSchool ? 'pass' : 'fail',
          fixable: false,
        },
        {
          label: 'German University Admission (Zulassungsbescheid) or application',
          result: hasAdmission ? 'pass' : 'unknown',
          detail: hasAdmission
            ? 'You hold a German university admission offer.'
            : 'Apply via uni-assist.de or directly to a German public university.',
          fixable: true,
        },
        {
          label: 'Blocked Account (Sperrkonto) of €11,904/year (€992/month)',
          result:
            fundsEUR === undefined
              ? 'unknown'
              : fundsEUR >= 11904
              ? 'pass'
              : 'fail',
          detail: '2026 requirement: €11,904/year (€992/month) in a blocked account or formal sponsor.',
          fixable: true,
        },
        {
          label: 'English (IELTS/TOEFL) or German (B2/C1) matching your degree program',
          result: (p.englishCLB ?? 0) >= 7 || (p.germanLevel ?? 0) >= 4 ? 'pass' : 'fail',
          fixable: true,
        },
      ];
      return { checks };
    },
  },

  // 7. Vocational Training Visa (Ausbildung)
  {
    id: 'de-ausbildung',
    country: 'DE',
    name: 'Germany Paid Vocational Training Visa (Ausbildung — § 16a AufenthG)',
    category: 'study',
    kind: 'temporary',
    summary:
      'Dual work-and-study vocational training in Germany (2 to 3.5 years) where the German company pays you a monthly training salary (~€1,000–€1,300/month) while you learn a profession.',
    goals: ['study', 'work', 'permanent'],
    officialUrl: 'https://www.make-it-in-germany.com/en/visa-residence/types/training',
    links: [
      {
        label: 'Vocational Training (Ausbildung) Visa Guide',
        url: 'https://www.make-it-in-germany.com/en/visa-residence/types/training',
      },
    ],
    availability: 'open',
    availabilityNote: 'No tuition fees; trainees receive a monthly salary (Ausbildungsvergütung).',
    steps: [
      'Complete at least secondary school (high school) and reach B1 German.',
      'Secure an Ausbildung training contract with a German company.',
      'Ensure the training salary covers at least €959/month net (or bridge the gap with a blocked account).',
    ],
    fees: '€75 visa fee',
    processingTime: '4 to 8 weeks',
    lastVerified: '2026-10-17',
    evaluate: (p: Profile): EvalResult => {
      const hasSchool = p.education !== undefined && p.education !== 'none';
      const de = p.germanLevel ?? 0;
      const hasContract = p.deJobOfferType === 'ausbildung_contract';
      const checks: Check[] = [
        {
          label: 'Secondary school completion',
          result: p.education === undefined ? 'unknown' : hasSchool ? 'pass' : 'fail',
          fixable: false,
        },
        {
          label: 'German language at B1 level (or B2 for Nursing/Healthcare)',
          result: de >= 3 ? 'pass' : 'fail',
          detail: de >= 3 ? 'Meets B1 German requirement.' : 'Ausbildung employers and visas require B1 German.',
          fixable: true,
        },
        {
          label: 'Training contract (Ausbildungsvertrag) with a German employer',
          result: hasContract ? 'pass' : 'unknown',
          detail: hasContract
            ? 'You hold an Ausbildung training contract.'
            : 'You can apply directly to German companies via Make it in Germany / Bundesagentur für Arbeit.',
          fixable: true,
        },
      ];
      return { checks };
    },
  },

  // 8. Family Reunification Germany
  {
    id: 'de-family-reunification',
    country: 'DE',
    name: 'Germany Family Reunification Visa (Familiennachzug — §§ 27–36 AufenthG)',
    category: 'family',
    kind: 'permanent',
    summary:
      'For spouses, minor children, and parents of German citizens, permanent residents, EU Blue Card holders, or skilled workers living in Germany.',
    goals: ['join_family', 'permanent'],
    officialUrl: 'https://www.make-it-in-germany.com/en/visa-residence/family-reunification',
    links: [
      {
        label: 'BAMF Family Reunification Rules',
        url: 'https://www.bamf.de/EN/Themen/MigrationAufenthalt/ZuwandererDrittstaaten/Familie/NachzugZuDrittstaatlern/nachzug-zu-drittstaatlern-node.html',
      },
    ],
    availability: 'open',
    availabilityNote:
      'Spouses of EU Blue Card & Skilled Worker holders are exempt from the A1 German test and housing size check.',
    steps: [
      'Sponsor in Germany holds German citizenship, PR, EU Blue Card, or Skilled Worker permit.',
      'Spouse proves A1 German (exempt if joining an EU Blue Card or Skilled Worker holder).',
      'Apply at the German Embassy with marriage/birth certificates.',
    ],
    fees: '€75 adult visa fee / €37.50 for minors',
    processingTime: '2 to 6 months',
    lastVerified: '2026-10-17',
    evaluate: (p: Profile): EvalResult => {
      const deRels = p.deRelatives ?? [];
      const hasQualifyingDeFamily = deRels.some((r) =>
        ['spouse_partner', 'minor_child_or_parent_of_minor', 'parent_of_skilled_worker'].includes(r),
      );
      const onlyExtendedRel = deRels.length > 0 && !hasQualifyingDeFamily;

      const checks: Check[] = [
        {
          label:
            'Qualifying family member in Germany (Spouse/Partner, Minor Child, or Parent of a post-March-2024 Skilled Worker)',
          result: hasQualifyingDeFamily ? 'pass' : 'fail',
          detail: hasQualifyingDeFamily
            ? 'You have an eligible nuclear family member (or skilled worker child) in Germany.'
            : onlyExtendedRel
              ? 'Siblings, grandparents, uncles, or adult children do NOT qualify for German family reunification (unless extreme hardship under § 36(2) AufenthG).'
              : 'Requires a spouse, minor child, or (for post-March-2024 Blue Card/Skilled Worker holders) parent in Germany.',
          fixable: false,
        },
        {
          label: 'Basic German A1 (waived for spouses/parents of EU Blue Card & Skilled Workers)',
          result: (p.germanLevel ?? 0) >= 1 ? 'pass' : 'info',
          fixable: true,
        },
      ];
      return { checks };
    },
  },

  // 9. UNHCR Resettlement & Humanitarian Admission to Germany
  {
    id: 'de-resettlement',
    country: 'DE',
    name: 'Germany UNHCR Refugee Resettlement & Humanitarian Admission (§ 23(4) AufenthG)',
    category: 'refugee',
    kind: 'permanent',
    summary:
      'Safe legal resettlement from outside Germany for vulnerable refugees registered with UNHCR in host countries (such as Türkiye, Lebanon, Jordan, Egypt), granting immediate German residence and work rights upon arrival.',
    goals: ['protection', 'permanent'],
    officialUrl: 'https://www.bamf.de/SharedDocs/ProjekteReportagen/EN/Forschung/Migration/resettlement-red.html?nn=2307876',
    links: [
      {
        label: 'BAMF Resettlement & Humanitarian Admission',
        url: 'https://www.bamf.de/SharedDocs/ProjekteReportagen/EN/Forschung/Migration/resettlement-red.html?nn=2307876',
      },
    ],
    availability: 'invitation_only',
    availabilityNote: 'Requires direct referral by UNHCR; individuals cannot self-apply directly to BAMF.',
    steps: [
      'Register with UNHCR in your current host country outside your country of origin.',
      'UNHCR assesses vulnerability and refers eligible cases to Germany’s Federal Office for Migration and Refugees (BAMF).',
      'Complete BAMF interview, security vetting, and IOM travel arrangements.',
    ],
    fees: '€0 (Free)',
    processingTime: '12 to 24+ months (subject to annual federal quotas)',
    lastVerified: '2026-10-17',
    evaluate: (p: Profile): EvalResult => {
      const outsideHome =
        p.residenceCountry !== undefined &&
        !(p.citizenships ?? []).includes(p.residenceCountry);
      const checks: Check[] = [
        {
          label: 'Living outside country of citizenship with fear of persecution/conflict',
          result: p.fearOfReturn === 'yes' && outsideHome ? 'pass' : p.fearOfReturn === 'no' ? 'fail' : 'warn',
          fixable: false,
        },
        {
          label: 'Registered with UNHCR for resettlement referral',
          result: p.unhcrRegistered === 'yes' ? 'pass' : 'warn',
          detail: 'UNHCR must refer your file to BAMF.',
          fixable: true,
        },
      ];
      return {
        checks,
        status: p.fearOfReturn === 'no' ? 'not_eligible' : p.unhcrRegistered === 'yes' && outsideHome ? 'possible' : 'close',
      };
    },
  },

  // 10. Asylum inside Germany (BAMF)
  {
    id: 'de-asylum-inland',
    country: 'DE',
    name: 'Claim Asylum & Refugee Protection Inside Germany (BAMF — Asylverfahren)',
    category: 'refugee',
    kind: 'permanent',
    summary:
      'Protection under Art. 16a GG, the Geneva Refugee Convention (§ 3 AsylG), or Subsidiary Protection (§ 4 AsylG) for individuals who are physically inside Germany or at a German border and face persecution or war.',
    goals: ['protection', 'permanent'],
    officialUrl: 'https://www.bamf.de/EN/Themen/Asyl/asyl-node.html',
    links: [
      {
        label: 'BAMF Asylum Procedure Guide',
        url: 'https://www.bamf.de/EN/Themen/Asyl/asyl-node.html',
      },
    ],
    availability: 'open',
    availabilityNote: 'Only available to individuals physically inside Germany (Dublin III rules apply).',
    steps: [
      'Report in person to a German reception facility (AnkER-Zentrum) or border authority.',
      'Receive proof of arrival (Ankunftsnachweis) and file the formal asylum application with BAMF.',
      'Attend the personal BAMF hearing explaining the reasons for persecution.',
    ],
    fees: '€0 (Free)',
    processingTime: '3 to 12 months',
    lastVerified: '2026-10-17',
    evaluate: (p: Profile): EvalResult => {
      const inGermany = p.residenceCountry === 'DE';
      const checks: Check[] = [
        {
          label: 'Physically present inside Germany',
          result: inGermany ? 'pass' : 'fail',
          detail: inGermany
            ? 'You are currently in Germany.'
            : 'Asylum applications cannot be filed at German embassies abroad; you must be physically in Germany.',
          fixable: false,
        },
        {
          label: 'Fear of persecution or armed conflict in home country',
          result: p.fearOfReturn === 'yes' ? 'pass' : p.fearOfReturn === 'no' ? 'fail' : 'unknown',
          fixable: false,
        },
      ];
      return {
        checks,
        status: inGermany && p.fearOfReturn === 'yes' ? 'eligible' : 'not_eligible',
      };
    },
  },

  // 11. Permanent Settlement Permit (Niederlassungserlaubnis) & Naturalization (Einbürgerung)
  {
    id: 'de-naturalization',
    country: 'DE',
    name: 'German Permanent Residency (21–36 Mo) & Citizenship (5-Year Einbürgerung)',
    category: 'citizenship',
    kind: 'citizenship',
    summary:
      'Under Germany’s reformed Skilled Immigration & Citizenship Acts: EU Blue Card holders get Permanent Residency (Niederlassungserlaubnis) in 21 months (with B1 German), Skilled Workers in 36 months, and full German Citizenship (with dual citizenship allowed) after 5 years.',
    goals: ['permanent', 'citizenship'],
    officialUrl: 'https://www.make-it-in-germany.com/en/visa-residence/living-permanently/naturalisation',
    links: [
      {
        label: 'Settlement Permit (PR) Rules',
        url: 'https://www.make-it-in-germany.com/en/visa-residence/living-permanently/settlement-permit',
      },
      {
        label: 'BAMF Naturalisation (5-Year Rule)',
        url: 'https://www.bamf.de/EN/Themen/Integration/ZugewanderteTeilnehmende/Einbuergerung/einbuergerung.html?nn=285728',
      },
    ],
    availability: 'open',
    availabilityNote: 'Dual citizenship is fully permitted under Germany’s reformed nationality law.',
    steps: [
      'Hold a qualified residence permit in Germany (21–27 months for Blue Card PR; 36 months for Skilled Worker PR; 5 years for Citizenship).',
      'Reach B1 German proficiency and pass the Living in Germany / Naturalisation test.',
      'Maintain independent livelihood without social welfare benefits.',
    ],
    fees: '€113 (Settlement Permit) / €255 (Naturalisation)',
    processingTime: '3 to 12 months',
    lastVerified: '2026-10-17',
    evaluate: (p: Profile): EvalResult => {
      const inGermany = p.residenceCountry === 'DE';
      const checks: Check[] = [
        {
          label: 'Legal residence in Germany (21–36 months for PR; 5 years for Citizenship)',
          result: inGermany ? 'pass' : 'info',
          detail: inGermany
            ? 'You currently reside in Germany.'
            : 'Future pathway once you move to Germany on a work or study visa.',
          fixable: true,
        },
        {
          label: 'German B1 level & independent income',
          result: (p.germanLevel ?? 0) >= 3 ? 'pass' : 'info',
          fixable: true,
        },
      ];
      return {
        checks,
        status: inGermany ? 'possible' : 'close',
      };
    },
  },
];
