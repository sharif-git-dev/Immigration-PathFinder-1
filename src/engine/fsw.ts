/**
 * Federal Skilled Worker Program (FSW) 67-point Selection Grid Calculator.
 * Source: IRCC Federal Skilled Worker Program (Express Entry) Six Selection Factors
 * https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/eligibility/federal-skilled-workers/six-selection-factors-federal-skilled-workers.html
 */

import type { Profile } from './types';
import { isPartnered } from './helpers';

export interface FswFactor {
  label: string;
  points: number;
  max: number;
  detail?: string;
}

export interface FswResult {
  total: number;
  passed: boolean; // Needs 67 / 100
  factors: FswFactor[];
  assumptions: string[];
}

/** Official Proof of Funds (Settlement Funds) requirement for FSW / FST without valid job offer (Updated July 7, 2025 / 2026 IRCC table) */
export function getMinimumFundsRequired(familySize: number): number {
  if (familySize <= 1) return 15263;
  if (familySize === 2) return 19001;
  if (familySize === 3) return 23360;
  if (familySize === 4) return 28362;
  if (familySize === 5) return 32168;
  if (familySize === 6) return 36280;
  if (familySize === 7) return 40392;
  return 40392 + (familySize - 7) * 4112;
}

export function calculateFSWPoints(p: Profile): FswResult {
  const assumptions: string[] = [];
  const factors: FswFactor[] = [];

  // 1. Language skills (Max 28 points)
  const enCLB = p.englishCLB ?? 0;
  const frCLB = p.frenchCLB ?? 0;
  const isEnFirst = enCLB >= frCLB;
  const firstCLB = isEnFirst ? enCLB : frCLB;
  const secondCLB = isEnFirst ? frCLB : enCLB;

  let firstLangPtsPerBand = 0;
  if (firstCLB >= 9) firstLangPtsPerBand = 6;
  else if (firstCLB === 8) firstLangPtsPerBand = 5;
  else if (firstCLB === 7) firstLangPtsPerBand = 4;
  else firstLangPtsPerBand = 0;

  const firstLangTotal = firstLangPtsPerBand * 4;
  const secondLangTotal = secondCLB >= 5 ? 4 : 0;
  const langTotal = firstLangTotal + secondLangTotal;

  factors.push({
    label: 'Language Skills',
    points: langTotal,
    max: 28,
    detail: `First language CLB ${firstCLB} (${firstLangTotal} pts) + Second language CLB ${secondCLB} (${secondLangTotal} pts)`,
  });

  // 2. Education (Max 25 points)
  let eduPts = 0;
  const edu = p.education ?? 'none';
  switch (edu) {
    case 'secondary': eduPts = 5; break;
    case 'one_year': eduPts = 15; break;
    case 'two_year': eduPts = 19; break;
    case 'bachelors': eduPts = 21; break;
    case 'two_or_more': eduPts = 22; break;
    case 'masters':
    case 'professional': eduPts = 23; break;
    case 'phd': eduPts = 25; break;
    default: eduPts = 0;
  }
  factors.push({ label: 'Education', points: eduPts, max: 25 });

  // 3. Work Experience (Max 15 points)
  // Total skilled years (foreign + Canadian)
  const totalSkilledYears = (p.foreignExpYears ?? 0) + (p.canadianExpYears ?? 0);
  let expPts = 0;
  if (totalSkilledYears >= 6) expPts = 15;
  else if (totalSkilledYears >= 4) expPts = 13;
  else if (totalSkilledYears >= 2) expPts = 11;
  else if (totalSkilledYears >= 1) expPts = 9;

  factors.push({
    label: 'Work Experience',
    points: expPts,
    max: 15,
    detail: `${totalSkilledYears} year(s) of skilled work experience`,
  });

  // 4. Age (Max 12 points)
  const age = p.age ?? 29;
  if (p.age === undefined) assumptions.push('Age not specified (assumed 29 for calculation).');
  let agePts = 0;
  if (age >= 18 && age <= 35) agePts = 12;
  else if (age === 36) agePts = 11;
  else if (age === 37) agePts = 10;
  else if (age === 38) agePts = 9;
  else if (age === 39) agePts = 8;
  else if (age === 40) agePts = 7;
  else if (age === 41) agePts = 6;
  else if (age === 42) agePts = 5;
  else if (age === 43) agePts = 4;
  else if (age === 44) agePts = 3;
  else if (age === 45) agePts = 2;
  else if (age === 46) agePts = 1;
  else agePts = 0;

  factors.push({ label: `Age (${age} years)`, points: agePts, max: 12 });

  // 5. Arranged Employment in Canada (Max 10 points)
  const hasJobOffer = p.jobOffer === 'yes' && p.jobOfferFullTime !== 'no';
  const jobOfferPts = hasJobOffer ? 10 : 0;
  factors.push({ label: 'Arranged Employment in Canada', points: jobOfferPts, max: 10 });

  // 6. Adaptability (Max 10 points)
  let adaptPts = 0;
  if (isPartnered(p) && (p.spouseEnglishCLB ?? 0) >= 4) adaptPts += 5;
  if (p.canadianEducation && p.canadianEducation !== 'none') adaptPts += 5;
  if ((p.canadianExpYears ?? 0) >= 1) adaptPts += 10;
  if (hasJobOffer) adaptPts += 5;
  if (p.relativesCitizenPR && p.relativesCitizenPR.some(r => (r as string) !== 'none')) adaptPts += 5;

  const adaptCapped = Math.min(10, adaptPts);
  factors.push({ label: 'Adaptability', points: adaptCapped, max: 10 });

  const total = factors.reduce((sum, f) => sum + f.points, 0);
  return {
    total,
    passed: total >= 67,
    factors,
    assumptions,
  };
}
