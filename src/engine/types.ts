/**
 * CORE CONTRACT — shared by the survey, the engine and every program rule file.
 *
 * A `Profile` is the user's survey answers. Every field is optional:
 *   `undefined` = "not answered / not asked", which rules must treat as UNKNOWN (never as "no").
 *
 * A `Program` is one immigration pathway with official links and an `evaluate()` function
 * that turns a Profile into a list of requirement checks.
 */

// ───────────────────────────── Answer value types ─────────────────────────────

export type Tri = 'yes' | 'no' | 'unsure';

export type Goal =
  | 'visit' // tourism / short visit
  | 'visit_family' // visit relatives (incl. long stays such as super visa)
  | 'business_visit' // meetings, conferences (no work)
  | 'transit' // passing through a Canadian airport
  | 'study'
  | 'work' // temporary work
  | 'permanent' // live permanently (PR)
  | 'join_family' // be sponsored by / reunite with family
  | 'protection' // refugee / asylum / humanitarian
  | 'citizenship' // claim/obtain Canadian citizenship (e.g. by descent)
  | 'start_business'; // start-up / self-employed / invest

/** Immigration status in the country where the person currently lives (outside Canada). */
export type ResidenceStatus =
  | 'citizen'
  | 'permanent_resident'
  | 'temp_work'
  | 'temp_study'
  | 'temp_visitor'
  | 'refugee_recognized' // recognized refugee (by UNHCR or the host state)
  | 'temporary_protection' // e.g. Syrians under Temporary Protection in Türkiye, Ukrainians under EU TPD
  | 'asylum_pending'
  | 'no_status';

/** Status if currently inside Canada. */
export type CanadaStatus =
  | 'not_in_canada'
  | 'visitor'
  | 'student'
  | 'worker'
  | 'pgwp' // holds a post-graduation work permit
  | 'asylum_claimant'
  | 'protected_person' // convention refugee / protected person decided in Canada
  | 'out_of_status'
  | 'permanent_resident'
  | 'citizen';

export type Education =
  | 'none'
  | 'secondary' // high school
  | 'one_year' // 1-year post-secondary program
  | 'two_year' // 2-year post-secondary program
  | 'bachelors' // bachelor's or 3+ year program
  | 'two_or_more' // two or more credentials, one of them 3+ years
  | 'masters'
  | 'professional' // professional degree needed to practise a licensed profession (medicine, law, …)
  | 'phd';

export type CanadianEducation = 'none' | 'one_two_year' | 'one_year' | 'two_year' | 'three_plus' | 'masters_phd';

export type OccupationField =
  | 'healthcare'
  | 'stem' // science, technology, engineering, math
  | 'trades' // construction, electrical, mechanical, welding …
  | 'transport' // truck drivers, aviation …
  | 'agriculture' // farm, agri-food, meat processing
  | 'education' // teachers, early childhood educators
  | 'business' // finance, admin, management, sales
  | 'hospitality' // food service, retail, hotels
  | 'caregiving' // home child care / home support
  | 'arts_culture_sports'
  | 'other';

/** TEER = Training, Education, Experience and Responsibilities (Canada's NOC 2021 skill levels). */
export type SkillLevel = 'teer0_1' | 'teer2_3' | 'teer4_5' | 'none';

export type Teer = 'teer0' | 'teer1' | 'teer2' | 'teer3' | 'teer4' | 'teer5' | 'unsure';

export type Relative =
  | 'spouse'
  | 'parent'
  | 'child' // son/daughter (any age)
  | 'sibling'
  | 'grandparent'
  | 'grandchild'
  | 'aunt_uncle'
  | 'niece_nephew'
  | 'cousin'
  | 'other';

export type MaritalStatus =
  | 'single'
  | 'married'
  | 'common_law' // lived together 12+ months
  | 'conjugal' // relationship 1+ year but can't live together / marry (e.g. legal barriers)
  | 'separated'
  | 'divorced'
  | 'widowed';

export type SpouseStatus =
  | 'citizen' // Canadian citizen
  | 'pr' // Canadian permanent resident
  | 'worker' // in Canada on a work permit
  | 'student' // in Canada on a study permit
  | 'none'; // not Canadian / not in Canada

export type HistoryItem =
  | 'visited_canada'
  | 'studied_canada'
  | 'worked_canada'
  | 'refused_canada_visa' // refused a Canadian visa/permit before
  | 'refused_canada_pr'
  | 'overstayed_canada'
  | 'removed_from_canada' // deported / removal order
  | 'misrepresentation' // found to have misrepresented (5-year bar)
  | 'asylum_claimed_canada_before'
  | 'asylum_claimed_elsewhere' // claimed asylum in another country (e.g. US)
  | 'refused_other_country_visa'; // e.g. refused US/UK/Schengen visa

export type Province =
  | 'AB' | 'BC' | 'MB' | 'NB' | 'NL' | 'NS' | 'ON' | 'PE' | 'QC' | 'SK' | 'NT' | 'NU' | 'YT';

export type RefugeeDocument =
  | 'unhcr' // UNHCR refugee status determination / registration document
  | 'state' // refugee status recognized by the host country government
  | 'temporary_protection_id' // e.g. Türkiye "Kimlik" temporary protection ID
  | 'none';

export type SponsorAvailable =
  | 'sah' // a Sponsorship Agreement Holder organization
  | 'g5' // a Group of Five Canadians/PRs
  | 'community' // a Community Sponsor organization
  | 'none'
  | 'unsure';

export type StudyPlan = 'none' | 'considering' | 'accepted_dli' | 'accepted_with_pal';

export type StudyLevel =
  | 'k12' // primary/secondary school
  | 'language' // language school
  | 'college' // college diploma/certificate
  | 'bachelors'
  | 'masters'
  | 'phd';

export type UsStatus = 'none' | 'us_nonimmigrant_visa' | 'us_green_card' | 'us_citizen';

export type BusinessPlan = 'none' | 'idea' | 'designated_support' | 'existing_business';

export type Criminality = 'none' | 'minor' | 'serious' | 'unsure';
export type Medical = 'none' | 'condition' | 'unsure';
export type PassportState = 'valid' | 'expired' | 'none';
export type TargetCountry = 'CA' | 'DE' | 'US';

export type DeResidenceStatus =
  | 'outside_de'
  | 'student'
  | 'worker_blue_card'
  | 'chancenkarte'
  | 'asylum_duldung'
  | 'pr_citizen';

export type DeDegreeRecognition =
  | 'full_anabin' // Fully equivalent / ANABIN H+ & equivalent degree
  | 'partial_adaptation' // Partially recognized (Bescheid) — awards +4 Chancenkarte points
  | 'home_recognized' // Recognized in country of origin (2+ yr vocational or university degree)
  | 'none';

export type DeJobOfferType =
  | 'none'
  | 'blue_card_50700' // Job offer >= €50,700/yr
  | 'shortage_it_45934' // Job offer >= €45,934.20/yr in shortage/IT/new grad
  | 'skilled_other' // Skilled job offer below Blue Card threshold
  | 'ausbildung_contract' // Vocational training contract (Ausbildungsvertrag)
  | 'uni_admission'; // German university admission (Zulassungsbescheid)

export type DeRelative =
  | 'spouse_partner' // Spouse or registered partner in Germany
  | 'minor_child_or_parent_of_minor' // Minor child in Germany or parent of minor in Germany
  | 'parent_of_skilled_worker' // Parent / in-law of a post-March-2024 EU Blue Card / Skilled Worker holder
  | 'other_relative'; // Sibling / uncle / cousin (not eligible for direct family visa, can sign Verpflichtungserklärung)

export type UsResidenceStatus =
  | 'outside_us'
  | 'f1_j1_student'
  | 'h1b_l1_o1_worker'
  | 'b1_b2_visitor'
  | 'asylum_tps_pending'
  | 'lpr_green_card'
  | 'us_citizen';

export type UsJobOfferType =
  | 'none'
  | 'h1b_cap' // Private US employer willing to sponsor H-1B lottery
  | 'cap_exempt_uni_nonprofit' // US university, teaching hospital, or nonprofit research institute (year-round H-1B / EB-1B)
  | 'l1_multinational' // Foreign company with US branch/subsidiary/parent or New US Office expansion (L-1A/L-1B/EB-1C)
  | 'perm_eb2_eb3' // US employer willing to sponsor permanent PERM Green Card (EB-2 / EB-3 / Schedule A Nurse)
  | 'i20_ds2019_admission'; // SEVP Form I-20 (F-1 Student) or Form DS-2019 (J-1 Exchange Visitor)

export type UsExtraordinaryItem =
  | 'niw_endeavor' // Proposed project/work of national importance to the US (STEM, Healthcare, AI, Business, Research)
  | 'publications_citations' // Published scholarly articles, citations, or peer-review/judging work
  | 'critical_role_high_salary' // Critical/leading role at a distinguished company/startup or high salary
  | 'awards_media_judging'; // Nationally/internationally recognized awards, VC funding, or major press coverage

export type UsRelative =
  | 'usc_spouse_fiance' // Spouse or Fiancé(e) is a US Citizen (Immediate Relative / K-1 — no backlog)
  | 'usc_parent_under21' // Parent is a US Citizen AND applicant is unmarried under 21 (Immediate Relative)
  | 'usc_child_21plus' // Child is a US Citizen age 21+ (Immediate Relative for Parents — no backlog)
  | 'lpr_spouse_or_unmarried_child' // Spouse or Parent is a US Green Card Holder (F2A / F2B Preference)
  | 'usc_sibling_or_adult_child'; // Sibling or Parent is a US Citizen (for adult 21+ or married children — F1/F3/F4 Preference)

// ───────────────────────────── The Profile ─────────────────────────────

export interface Profile {
  // ── Active single country selected by the user ('CA' | 'DE' | 'US')
  activeCountry?: TargetCountry;
  targetCountries?: TargetCountry[];

  // ── Shared / Core About You
  age?: number;
  /** ISO 3166-1 alpha-2 codes, e.g. ['SY'] or ['IN','GB']. 'XX' = stateless. */
  citizenships?: string[];
  /** Country where the person lives now (ISO2). 'CA' if inside Canada. */
  residenceCountry?: string;
  /** Status in residence country (only asked when residenceCountry is not CA/DE/US). */
  residenceStatus?: ResidenceStatus;
  passport?: PassportState;
  /** Status in Canada (asked if residenceCountry === 'CA'; otherwise treated as 'not_in_canada'). */
  canadaStatus?: CanadaStatus;
  usStatus?: UsStatus;
  /** Held a Canadian visitor visa (TRV) in the last 10 years. */
  heldCanadianVisa10y?: Tri;

  // ── Goals
  goals?: Goal[];
  preferredProvinces?: (Province | 'any')[];

  // ── Family (Canada)
  maritalStatus?: MaritalStatus;
  spouseStatus?: SpouseStatus;
  /** Would spouse/partner come to Canada with you? */
  spouseAccompanying?: Tri;
  spouseEducation?: Education;
  spouseEnglishCLB?: number;
  spouseCanadianExpYears?: number;
  /** Number of dependent children (under 22, not married/common-law). */
  dependentChildren?: number;
  /** Family size for proof of funds (you + spouse + dependent children). Engine computes if not given. */
  familySize?: number;
  /** Relatives who are Canadian CITIZENS or PERMANENT RESIDENTS. */
  relativesCitizenPR?: Relative[];
  /** Province(s) where those relatives live. */
  relativesProvinces?: Province[];
  /** Relatives in Canada on temporary status (work/study permit). */
  relativesTemporary?: Relative[];
  bornInCanada?: Tri;
  /** Is (or was) at least one of your parents a Canadian citizen? */
  parentCanadian?: Tri;
  /** How the parent became Canadian. */
  parentCitizenshipType?: 'born_in_canada' | 'naturalized' | 'born_abroad_by_descent' | 'unsure';
  /** Was a grandparent a Canadian citizen? */
  grandparentCanadian?: Tri;
  /** Under 18 and both parents deceased (orphan) — relevant for orphaned-relative sponsorship. */
  orphan?: Tri;

  // ── Education
  education?: Education;
  canadianEducation?: CanadianEducation;
  /** Educational Credential Assessment done (for foreign education). */
  ecaDone?: Tri;
  studyPlan?: StudyPlan;
  studyLevel?: StudyLevel;

  // ── Work
  occupationFields?: OccupationField[];
  /** Skill level of the main occupation. */
  skillLevel?: SkillLevel;
  /** Years of skilled (TEER 0-3) paid work OUTSIDE Canada in the last 10 years. */
  foreignExpYears?: number;
  /** Years of skilled (TEER 0-3) paid work INSIDE Canada (on a valid status) in the last 3 years. */
  canadianExpYears?: number;
  /** Years of ANY paid work in Canada (incl. TEER 4-5) — for pilots like AIP/RCIP/caregivers. */
  canadianAnyExpYears?: number;
  /** Holds a certificate of qualification in a skilled trade (Canadian or recognizable). */
  tradeCert?: Tri;
  /** Experience as a caregiver (home child care / home support). */
  caregiverExp?: Tri;
  /** Self-employed / world-class experience in cultural activities or athletics. */
  culturalAthleticExp?: Tri;
  /** Works for a company that has a branch/parent/affiliate in Canada (intra-company transfer). */
  intraCompany?: Tri;

  // ── Job offer (Canada)
  jobOffer?: Tri;
  jobOfferType?: 'lmia' | 'lmia_exempt' | 'unsure';
  jobOfferProvince?: Province;
  jobOfferTeer?: Teer;
  /** Employer designated under a federal pilot. */
  jobOfferDesignated?: ('aip' | 'rcip' | 'fcip' | 'none' | 'unsure')[];
  /** Job offer is full-time and non-seasonal. */
  jobOfferFullTime?: Tri;

  // ── Language (Canadian Language Benchmark equivalents; 0 = no test / below CLB 4)
  englishCLB?: number;
  frenchCLB?: number;
  /** German CEFR level: 0 = none, 1 = A1, 2 = A2, 3 = B1, 4 = B2, 5 = C1/C2 */
  germanLevel?: number;
  /** Has a valid approved language test result (IELTS General, CELPIP, PTE Core, TEF, TCF). */
  languageTest?: 'valid' | 'none' | 'expired';

  // ── Money (Canada)
  /** Available settlement funds in CAD (lower bound of chosen range). */
  fundsCAD?: number;
  /** Personal net worth in CAD (lower bound of chosen range). */
  netWorthCAD?: number;
  businessPlan?: BusinessPlan;
  /** Years of business ownership/management experience. */
  businessExpYears?: number;

  // ── Germany-Specific Variables (DE)
  deResidenceStatus?: DeResidenceStatus;
  deDegreeRecognition?: DeDegreeRecognition;
  deJobOfferType?: DeJobOfferType;
  deRelatives?: DeRelative[];
  deFundsEUR?: number;

  // ── USA-Specific Variables (US)
  usResidenceStatus?: UsResidenceStatus;
  usDvEligibleBirth?: Tri;
  usJobOfferType?: UsJobOfferType;
  usExtraordinaryProfile?: UsExtraordinaryItem[];
  usRelatives?: UsRelative[];
  usFundsUSD?: number;

  // ── Background
  history?: HistoryItem[];
  criminality?: Criminality;
  medical?: Medical;

  // ── Protection
  fearOfReturn?: Tri;
  unhcrRegistered?: Tri;
  refugeeDocument?: RefugeeDocument;
  sponsorAvailable?: SponsorAvailable[];
  /** Would enter Canada at a land border from the United States (Safe Third Country Agreement). */
  enteringFromUS?: Tri;

  /**
   * Extra answers for questions added by program-specific research
   * (key = question id, see survey/questions.ts). Read via helpers.extra().
   */
  extra?: Record<string, string | string[] | number | boolean | undefined>;
}

// ───────────────────────────── Program rules ─────────────────────────────

export type CheckResult = 'pass' | 'fail' | 'unknown' | 'info' | 'warn';

export interface Check {
  /** Short requirement, e.g. "CLB 7 in English or French". */
  label: string;
  result: CheckResult;
  /** Plain-language explanation tailored to the user's answer. */
  detail?: string;
  /** A failure the person could realistically fix (e.g. retake a language test, get an ECA). */
  fixable?: boolean;
}

export type Status =
  | 'eligible' // all requirements pass
  | 'possible' // nothing fails, but some answers unknown
  | 'close' // only fixable requirements fail
  | 'not_eligible';

export type Availability =
  | 'open'
  | 'invitation_only' // e.g. Express Entry draws, PGP invitations
  | 'limited' // caps / intake windows
  | 'paused' // temporarily not accepting
  | 'closed';

export type Category =
  | 'visit'
  | 'study'
  | 'work'
  | 'express_entry'
  | 'economic' // other federal economic PR (pilots, caregivers, start-up …)
  | 'provincial' // PNPs & Quebec
  | 'family'
  | 'refugee'
  | 'humanitarian'
  | 'citizenship';

export interface EvalResult {
  checks: Check[];
  /** Extra tailored notes (tips, warnings, what to do next). */
  notes?: string[];
  /** Optional score (e.g. CRS). */
  score?: { label: string; value: number; max?: number; detail?: string };
  /** Force a status (otherwise derived from checks). */
  status?: Status;
}

export interface Link {
  label: string;
  url: string;
}

export interface Program {
  /** Unique kebab-case id, e.g. "ee-fsw". */
  id: string;
  /** Destination country ('CA' | 'DE' | 'US'). Defaults to 'CA'. */
  country?: TargetCountry;
  name: string;
  category: Category;
  kind: 'temporary' | 'permanent' | 'citizenship' | 'document';
  /** 1–3 plain-language sentences: what is it, who is it for. */
  summary: string;
  /** Goals this program serves (used for ranking/filtering). */
  goals: Goal[];
  /** Main official page (canada.ca or official provincial site). */
  officialUrl: string;
  /** Further official pages: eligibility, how to apply, fees, processing times… */
  links: Link[];
  availability: Availability;
  availabilityNote?: string;
  /** Plain-language application steps. */
  steps?: string[];
  /** Government fees, e.g. "CAD 100 + CAD 85 biometrics". */
  fees?: string;
  /** Rough processing time or link text. */
  processingTime?: string;
  /** Outcome depends on an officer's judgment even if requirements are met. */
  discretionary?: boolean;
  /** Date (YYYY-MM-DD) the official page was last read to build this rule. */
  lastVerified: string;
  /**
   * Return false to hide the program entirely for this person (e.g. they are already a citizen).
   * If omitted, the program is always evaluated.
   */
  appliesTo?: (p: Profile) => boolean;
  evaluate: (p: Profile) => EvalResult;
}
