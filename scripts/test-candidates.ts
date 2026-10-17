const candidates = [
  // Citizenship Bill C-3
  'https://www.canada.ca/en/immigration-refugees-citizenship/services/canadian-citizenship/act-changes.html',
  'https://www.canada.ca/en/immigration-refugees-citizenship/corporate/mandate/policies-operational-instructions-agreements/ministerial-instructions.html',
  
  // Ontario OINP
  'https://www.ontario.ca/page/ontarios-express-entry-human-capital-priorities-stream',
  'https://www.ontario.ca/page/ontario-immigrant-nominee-program-oinp',

  // Saskatchewan
  'https://www.saskatchewan.ca/residents/moving-to-saskatchewan/live-in-saskatchewan/by-immigrating/saskatchewan-immigrant-nominee-program',
  'https://www.saskatchewan.ca/residents/moving-to-saskatchewan/live-in-saskatchewan/by-immigrating/saskatchewan-immigrant-nominee-program/international-skilled-worker',

  // EMPP
  'https://www.canada.ca/en/immigration-refugees-citizenship/services/refugees/economic-mobility-pathways-pilot.html',

  // Rural
  'https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/rural-northern-immigration-pilot.html',

  // Refugee Help Outside Canada
  'https://www.canada.ca/en/immigration-refugees-citizenship/services/refugees/help-outside-canada.html',
  'https://www.canada.ca/en/immigration-refugees-citizenship/services/refugees/help-outside-canada/private-sponsorship-program.html',

  // Claim protection
  'https://www.canada.ca/en/immigration-refugees-citizenship/services/refugees/claim-protection-inside-canada.html',

  // Humanitarian H&C
  'https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada.html',
  'https://www.canada.ca/en/immigration-refugees-citizenship/corporate/publications-manuals/operational-bulletins-manuals/permanent-residence/humanitarian-and-compassionate-considerations.html',

  // Americas
  'https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/humanitarian-pathways-americas.html',
  'https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada.html',

  // Sudan
  'https://www.canada.ca/en/immigration-refugees-citizenship/services/sudan.html',

  // Spousal Open Work Permit
  'https://www.canada.ca/en/immigration-refugees-citizenship/services/work-canada/permit/temporary/open-work-permit-spouses-partners.html',
  'https://www.canada.ca/en/immigration-refugees-citizenship/services/work-canada/permit/temporary/apply.html',

  // Study permits
  'https://www.canada.ca/en/immigration-refugees-citizenship/services/study-canada/study-permit.html',
  'https://www.canada.ca/en/immigration-refugees-citizenship/services/study-canada/study-permit/get-documents.html',
  'https://www.canada.ca/en/immigration-refugees-citizenship/services/study-canada/study-permit/prepare/minor-children.html',
  'https://www.canada.ca/en/immigration-refugees-citizenship/services/study-canada/study-permit/who-needs-study-permit.html'
];

async function check() {
  for (const url of candidates) {
    try {
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        signal: AbortSignal.timeout(6000)
      });
      console.log(`${res.status === 200 ? '✓' : '❌'} [${res.status}] ${url}`);
    } catch (e) {
      console.log(`❌ [ERROR] ${url}: ${e.message}`);
    }
  }
}

check();
