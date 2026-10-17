import { ALL_PROGRAMS } from '../src/data/programs/index';

// Replacement dictionary for all broken links
export const LINK_FIXES: Record<string, string> = {
  // Citizenship
  'https://www.canada.ca/en/immigration-refugees-citizenship/corporate/mandate/policies-operational-instructions-agreements/ministerial-instructions/bill-c-3.html':
    'https://www.canada.ca/en/immigration-refugees-citizenship/services/canadian-citizenship/act-changes.html',
  'https://eservices.cic.gc.ca/rescalc/resCalcStartNew.do':
    'https://www.canada.ca/en/immigration-refugees-citizenship/services/canadian-citizenship/become-canadian-citizen/eligibility.html',

  // Ontario OINP
  'https://www.ontario.ca/page/oinp-express-entry-human-capital-priorities-stream':
    'https://www.ontario.ca/page/ontarios-express-entry-human-capital-priorities-stream',

  // Saskatchewan
  'https://www.saskatchewan.ca/residents/moving-to-saskatchewan/immigrating-to-saskatchewan/saskatchewan-immigrant-nominee-program':
    'https://www.saskatchewan.ca/residents/moving-to-saskatchewan/live-in-saskatchewan/by-immigrating/saskatchewan-immigrant-nominee-program',
  'https://www.saskatchewan.ca/residents/moving-to-saskatchewan/immigrating-to-saskatchewan/saskatchewan-immigrant-nominee-program/applicants-international-skilled-workers':
    'https://www.saskatchewan.ca/residents/moving-to-saskatchewan/live-in-saskatchewan/by-immigrating/saskatchewan-immigrant-nominee-program',
  'https://www.saskatchewan.ca/residents/moving-to-saskatchewan/immigrating-to-saskatchewan/saskatchewan-immigrant-nominee-program/applicants-international-skilled-workers/international-skilled-worker-occupations-in-demand':
    'https://www.saskatchewan.ca/residents/moving-to-saskatchewan/live-in-saskatchewan/by-immigrating/saskatchewan-immigrant-nominee-program',

  // EMPP subpages -> consolidate to the official live master page on canada.ca
  'https://www.canada.ca/en/immigration-refugees-citizenship/services/refugees/economic-mobility-pathways-pilot/eligibility.html':
    'https://www.canada.ca/en/immigration-refugees-citizenship/services/refugees/economic-mobility-pathways-pilot.html',
  'https://www.canada.ca/en/immigration-refugees-citizenship/services/refugees/economic-mobility-pathways-pilot/partners.html':
    'https://www.canada.ca/en/immigration-refugees-citizenship/services/refugees/economic-mobility-pathways-pilot.html',
  'https://www.canada.ca/en/immigration-refugees-citizenship/services/refugees/economic-mobility-pathways-pilot/facilitations.html':
    'https://www.canada.ca/en/immigration-refugees-citizenship/services/refugees/economic-mobility-pathways-pilot.html',

  // Rural
  'https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/rural-community-immigration.html':
    'https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/rural-northern-immigration-pilot.html',

  // Refugee outside & inside
  'https://www.canada.ca/en/immigration-refugees-citizenship/services/refugees/help-outside-canada/government-assisted-refugees.html':
    'https://www.canada.ca/en/immigration-refugees-citizenship/services/refugees/help-outside-canada.html',
  'https://www.unhcr.org/resettlement':
    'https://www.unhcr.org',
  'https://www.canada.ca/en/immigration-refugees-citizenship/services/refugees/claim-protection-inside-canada/how-to-apply.html':
    'https://www.canada.ca/en/immigration-refugees-citizenship/services/refugees/claim-protection-inside-canada.html',

  // Humanitarian
  'https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/humanitarian-compassionate.html':
    'https://www.canada.ca/en/immigration-refugees-citizenship/services/application/application-forms-guides/guide-5291-humanitarian-compassionate-considerations.html',
  'https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/humanitarian-pathway-americas.html':
    'https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada.html',
  'https://www.canada.ca/en/immigration-refugees-citizenship/services/sudan/immigration-measures.html':
    'https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada.html',

  // Spousal Open Work Permit
  'https://www.canada.ca/en/immigration-refugees-citizenship/services/work-canada/permit/temporary/open-work-permit-spouses.html':
    'https://www.canada.ca/en/immigration-refugees-citizenship/services/work-canada/permit/temporary/apply.html',

  // Study
  'https://www.canada.ca/en/immigration-refugees-citizenship/services/study-canada/study-permit/provincial-attestation-letter.html':
    'https://www.canada.ca/en/immigration-refugees-citizenship/services/study-canada/study-permit/get-documents.html',
  'https://www.canada.ca/en/immigration-refugees-citizenship/services/study-canada/study-permit/who-needs-study-permit.html#short-term':
    'https://www.canada.ca/en/immigration-refugees-citizenship/services/study-canada/study-permit.html',
  'https://www.canada.ca/en/immigration-refugees-citizenship/services/study-canada/study-permit/minor-children.html':
    'https://www.canada.ca/en/immigration-refugees-citizenship/services/study-canada/study-permit/prepare/minor-children.html',
  'https://www.canada.ca/en/immigration-refugees-citizenship/services/study-canada/study-permit/minor-children/custodian-declaration.html':
    'https://www.canada.ca/en/immigration-refugees-citizenship/services/study-canada/study-permit/prepare/minor-children.html',
};

async function testAllFixed() {
  const fixedUrls = Object.values(LINK_FIXES);
  let allPass = true;
  for (const url of fixedUrls) {
    try {
      const res = await fetch(url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
        signal: AbortSignal.timeout(6000)
      });
      if (res.status === 200) {
        console.log(`✓ [200] ${url}`);
      } else {
        console.log(`❌ [${res.status}] ${url}`);
        allPass = false;
      }
    } catch (e) {
      console.log(`❌ [FAIL] ${url}: ${e.message}`);
      allPass = false;
    }
  }
  console.log(`\nResult: ${allPass ? 'ALL 100% WORKING!' : 'SOME FAILED'}`);
}

testAllFixed();
