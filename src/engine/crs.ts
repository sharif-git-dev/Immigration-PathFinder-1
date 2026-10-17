/**
 * Official Comprehensive Ranking System (CRS) Calculator for Canada Express Entry.
 * Source: IRCC Comprehensive Ranking System (CRS) Criteria
 * https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/eligibility/criteria-comprehensive-ranking-system/grid.html
 */

import type { Profile } from './types';
import { isPartnered } from './helpers';

export interface CrsLine {
  label: string;
  points: number;
  max?: number;
}

export interface CrsResult {
  total: number;
  breakdown: CrsLine[];
  assumptions: string[];
}

export function calculateCRS(p: Profile): CrsResult {
  const assumptions: string[] = [];
  const breakdown: CrsLine[] = [];

  // Determine if applying with spouse
  const hasSpouse = isPartnered(p) === true && p.spouseAccompanying !== 'no';

  // 1. AGE POINTS (Max: 110 without spouse, 100 with spouse)
  const age = p.age ?? 29;
  if (p.age === undefined) {
    assumptions.push('Age not specified (assumed optimal age 29 for maximum CRS calculation).');
  }

  let agePts = 0;
  if (hasSpouse) {
    if (age <= 17) agePts = 0;
    else if (age === 18) agePts = 90;
    else if (age === 19) agePts = 95;
    else if (age >= 20 && age <= 29) agePts = 100;
    else if (age === 30) agePts = 95;
    else if (age === 31) agePts = 90;
    else if (age === 32) agePts = 85;
    else if (age === 33) agePts = 80;
    else if (age === 34) agePts = 75;
    else if (age === 35) agePts = 70;
    else if (age === 36) agePts = 65;
    else if (age === 37) agePts = 60;
    else if (age === 38) agePts = 55;
    else if (age === 39) agePts = 50;
    else if (age === 40) agePts = 45;
    else if (age === 41) agePts = 35;
    else if (age === 42) agePts = 25;
    else if (age === 43) agePts = 15;
    else if (age === 44) agePts = 5;
    else agePts = 0;
  } else {
    if (age <= 17) agePts = 0;
    else if (age === 18) agePts = 99;
    else if (age === 19) agePts = 105;
    else if (age >= 20 && age <= 29) agePts = 110;
    else if (age === 30) agePts = 105;
    else if (age === 31) agePts = 99;
    else if (age === 32) agePts = 94;
    else if (age === 33) agePts = 88;
    else if (age === 34) agePts = 83;
    else if (age === 35) agePts = 77;
    else if (age === 36) agePts = 72;
    else if (age === 37) agePts = 66;
    else if (age === 38) agePts = 61;
    else if (age === 39) agePts = 55;
    else if (age === 40) agePts = 50;
    else if (age === 41) agePts = 39;
    else if (age === 42) agePts = 28;
    else if (age === 43) agePts = 17;
    else if (age === 44) agePts = 6;
    else agePts = 0;
  }
  breakdown.push({ label: `Age (${age} years)`, points: agePts, max: hasSpouse ? 100 : 110 });

  // 2. EDUCATION LEVEL (Max: 150 without spouse, 140 with spouse)
  const edu = p.education ?? 'none';
  if (p.education === undefined) {
    assumptions.push('Education level not specified (assumed no degree for conservative calculation).');
  }

  let eduPts = 0;
  switch (edu) {
    case 'secondary':
      eduPts = hasSpouse ? 28 : 30;
      break;
    case 'one_year':
      eduPts = hasSpouse ? 84 : 90;
      break;
    case 'two_year':
      eduPts = hasSpouse ? 91 : 98;
      break;
    case 'bachelors':
      eduPts = hasSpouse ? 112 : 120;
      break;
    case 'two_or_more':
      eduPts = hasSpouse ? 119 : 128;
      break;
    case 'masters':
    case 'professional':
      eduPts = hasSpouse ? 126 : 135;
      break;
    case 'phd':
      eduPts = hasSpouse ? 140 : 150;
      break;
    default:
      eduPts = 0;
  }
  breakdown.push({ label: 'Level of Education', points: eduPts, max: hasSpouse ? 140 : 150 });

  // 3. FIRST OFFICIAL LANGUAGE (English or French - whichever gives more)
  const enCLB = p.englishCLB ?? 0;
  const frCLB = p.frenchCLB ?? 0;
  const isEnFirst = enCLB >= frCLB;
  const firstCLB = isEnFirst ? enCLB : frCLB;
  const secondCLB = isEnFirst ? frCLB : enCLB;

  // First language points per ability (4 abilities assumed equal)
  const ptsPerFirstAbility = (clb: number): number => {
    if (hasSpouse) {
      if (clb < 4) return 0;
      if (clb <= 5) return 6;
      if (clb === 6) return 8;
      if (clb === 7) return 16;
      if (clb === 8) return 22;
      if (clb === 9) return 29;
      return 32; // CLB 10+
    } else {
      if (clb < 4) return 0;
      if (clb <= 5) return 6;
      if (clb === 6) return 9;
      if (clb === 7) return 17;
      if (clb === 8) return 23;
      if (clb === 9) return 31;
      return 34; // CLB 10+
    }
  };

  const firstLangPts = ptsPerFirstAbility(firstCLB) * 4;
  breakdown.push({
    label: `First Official Language (${isEnFirst ? 'English' : 'French'} CLB ${firstCLB})`,
    points: firstLangPts,
    max: hasSpouse ? 128 : 136,
  });

  // Second official language (Max: 22 with spouse, 24 without spouse)
  const ptsPerSecondAbility = (clb: number): number => {
    if (clb < 5) return 0;
    if (clb <= 6) return 1;
    if (clb <= 8) return 3;
    return 6; // CLB 9+
  };
  const secondLangPts = ptsPerSecondAbility(secondCLB) * 4;
  breakdown.push({
    label: `Second Official Language (${isEnFirst ? 'French' : 'English'} CLB ${secondCLB})`,
    points: secondLangPts,
    max: hasSpouse ? 22 : 24,
  });

  // 4. CANADIAN WORK EXPERIENCE (Max: 80 without spouse, 70 with spouse)
  const caExp = p.canadianExpYears ?? 0;
  let caExpPts = 0;
  if (hasSpouse) {
    if (caExp >= 5) caExpPts = 70;
    else if (caExp === 4) caExpPts = 63;
    else if (caExp === 3) caExpPts = 56;
    else if (caExp === 2) caExpPts = 46;
    else if (caExp === 1) caExpPts = 35;
  } else {
    if (caExp >= 5) caExpPts = 80;
    else if (caExp === 4) caExpPts = 72;
    else if (caExp === 3) caExpPts = 64;
    else if (caExp === 2) caExpPts = 53;
    else if (caExp === 1) caExpPts = 40;
  }
  breakdown.push({ label: `Canadian Work Experience (${caExp} yr${caExp === 1 ? '' : 's'})`, points: caExpPts, max: hasSpouse ? 70 : 80 });

  // 5. SPOUSE FACTORS (Max: 40 points total)
  if (hasSpouse) {
    let spouseEduPts = 0;
    const spEdu = p.spouseEducation ?? 'none';
    switch (spEdu) {
      case 'secondary': spouseEduPts = 2; break;
      case 'one_year': spouseEduPts = 6; break;
      case 'two_year': spouseEduPts = 7; break;
      case 'bachelors': spouseEduPts = 8; break;
      case 'two_or_more': spouseEduPts = 9; break;
      case 'masters':
      case 'professional':
      case 'phd': spouseEduPts = 10; break;
      default: spouseEduPts = 0;
    }
    breakdown.push({ label: 'Spouse Education', points: spouseEduPts, max: 10 });

    const spCLB = p.spouseEnglishCLB ?? 0;
    let spLangPtsPerBand = 0;
    if (spCLB >= 9) spLangPtsPerBand = 5;
    else if (spCLB >= 7) spLangPtsPerBand = 3;
    else if (spCLB >= 5) spLangPtsPerBand = 1;
    const spLangPts = spLangPtsPerBand * 4;
    breakdown.push({ label: `Spouse Language (CLB ${spCLB})`, points: spLangPts, max: 20 });

    const spCaExp = p.spouseCanadianExpYears ?? 0;
    const spCaExpPts =
      spCaExp >= 5 ? 10 :
      spCaExp === 4 ? 9 :
      spCaExp === 3 ? 8 :
      spCaExp === 2 ? 7 :
      spCaExp === 1 ? 5 : 0;
    breakdown.push({ label: 'Spouse Canadian Work Experience', points: spCaExpPts, max: 10 });
  }

  // 6. SKILL TRANSFERABILITY FACTORS (Max 100 points total across all combinations)
  const isPostSec = ['one_year', 'two_year', 'bachelors', 'two_or_more', 'masters', 'professional', 'phd'].includes(edu);
  const isHighEdu = ['two_or_more', 'masters', 'professional', 'phd'].includes(edu);
  const hasCLB7 = firstCLB >= 7;
  const hasCLB9 = firstCLB >= 9;

  // A. Education + Language
  let eduLangPts = 0;
  if (isPostSec) {
    if (hasCLB9) eduLangPts = isHighEdu ? 50 : 25;
    else if (hasCLB7) eduLangPts = isHighEdu ? 25 : 13;
  }

  // B. Education + Canadian Work
  let eduCaExpPts = 0;
  if (isPostSec) {
    if (caExp >= 2) eduCaExpPts = isHighEdu ? 50 : 25;
    else if (caExp >= 1) eduCaExpPts = isHighEdu ? 25 : 13;
  }
  const eduTransferPts = Math.min(50, eduLangPts + eduCaExpPts);

  // C. Foreign Work + Language
  const forExp = p.foreignExpYears ?? 0;
  let forLangPts = 0;
  if (forExp >= 3) {
    if (hasCLB9) forLangPts = 50;
    else if (hasCLB7) forLangPts = 25;
  } else if (forExp >= 1) {
    if (hasCLB9) forLangPts = 25;
    else if (hasCLB7) forLangPts = 13;
  }

  // D. Foreign Work + Canadian Work
  let forCaExpPts = 0;
  if (forExp >= 3) {
    if (caExp >= 2) forCaExpPts = 50;
    else if (caExp >= 1) forCaExpPts = 25;
  } else if (forExp >= 1) {
    if (caExp >= 2) forCaExpPts = 25;
    else if (caExp >= 1) forCaExpPts = 13;
  }
  const forTransferPts = Math.min(50, forLangPts + forCaExpPts);

  // E. Certificate of Qualification in Trades (Max 50)
  let tradeCertPts = 0;
  if (p.tradeCert === 'yes') {
    if (hasCLB7) tradeCertPts = 50;
    else if (firstCLB >= 5) tradeCertPts = 25;
  }

  // Enforce IRCC 100-point overall cap on Skill Transferability
  let remainingTransferCap = 100;
  const cappedEduTransfer = Math.min(remainingTransferCap, eduTransferPts);
  remainingTransferCap -= cappedEduTransfer;
  const cappedForTransfer = Math.min(remainingTransferCap, forTransferPts);
  remainingTransferCap -= cappedForTransfer;
  const cappedTradeTransfer = Math.min(remainingTransferCap, tradeCertPts);

  breakdown.push({ label: 'Skill Transferability: Education', points: cappedEduTransfer, max: 50 });
  breakdown.push({ label: 'Skill Transferability: Foreign Work', points: cappedForTransfer, max: 50 });
  if (tradeCertPts > 0) {
    breakdown.push({ label: 'Certificate of Qualification (Trade)', points: cappedTradeTransfer, max: 50 });
  }

  // 7. ADDITIONAL POINTS (Max 600)
  // Note: IRCC removed CRS Additional Points for Arranged Employment (job offers) in March 2025.
  let additionalPts = 0;

  // Sibling in Canada (15 pts)
  if (p.relativesCitizenPR?.includes('sibling')) {
    additionalPts += 15;
    breakdown.push({ label: 'Brother or Sister living in Canada (Citizen/PR)', points: 15, max: 15 });
  }

  // French language skills bonus (25 or 50 pts)
  if (frCLB >= 7) {
    const frenchBonusPts = enCLB >= 5 ? 50 : 25;
    additionalPts += frenchBonusPts;
    breakdown.push({ label: `French Language Skills Bonus (French NCLC ${frCLB} + English CLB ${enCLB})`, points: frenchBonusPts, max: 50 });
  }

  // Post-secondary education in Canada (15 or 30 pts)
  const caEdu = p.canadianEducation as string | undefined;
  if (caEdu === 'one_two_year' || caEdu === 'one_year' || caEdu === 'two_year') {
    additionalPts += 15;
    breakdown.push({ label: 'Canadian Post-Secondary Education (1–2 years)', points: 15, max: 30 });
  } else if (caEdu === 'three_plus' || caEdu === 'masters_phd') {
    additionalPts += 30;
    breakdown.push({ label: 'Canadian Post-Secondary Education (3+ years / Master\'s / PhD)', points: 30, max: 30 });
  }

  // Sum total
  const coreAndTransfer = breakdown
    .filter(item => !item.label.includes('Brother or Sister') && !item.label.includes('French Language Skills Bonus') && !item.label.includes('Canadian Post-Secondary Education'))
    .reduce((sum, item) => sum + item.points, 0);
  const total = coreAndTransfer + Math.min(600, additionalPts);

  return { total, breakdown, assumptions };
}
