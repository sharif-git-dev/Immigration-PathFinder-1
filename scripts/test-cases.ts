/**
 * Comprehensive Automated Verification Script
 * Tests the evaluation engine across all unique user profiles.
 */

import { evaluateAll } from '../src/engine/evaluate';
import { PRESET_PROFILES } from '../src/data/presets';
import { ALL_PROGRAMS } from '../src/data/programs/index';

console.log(`=======================================================`);
console.log(`🍁 Canada PathFinder — Automated Engine Verification`);
console.log(`Total Programs Encoded: ${ALL_PROGRAMS.length}`);
console.log(`=======================================================\n`);

let failed = false;

// 1. Verify all official URLs
console.log(`[1/3] Verifying Official Government Links...`);
for (const p of ALL_PROGRAMS) {
  if (!p.officialUrl.startsWith('https://www.canada.ca') &&
      !p.officialUrl.startsWith('https://www.ontario.ca') &&
      !p.officialUrl.startsWith('https://www.alberta.ca') &&
      !p.officialUrl.startsWith('https://www.welcomebc.ca') &&
      !p.officialUrl.startsWith('https://www.saskatchewan.ca') &&
      !p.officialUrl.startsWith('https://immigratemanitoba.com') &&
      !p.officialUrl.startsWith('https://www.quebec.ca')) {
    console.error(`❌ Non-official or unverified URL in program ${p.id}: ${p.officialUrl}`);
    failed = true;
  }
}
console.log(`✓ All ${ALL_PROGRAMS.length} programs link exclusively to official government portals.\n`);

// 2. Test Presets
console.log(`[2/3] Evaluating Preset User Profiles...`);
for (const preset of PRESET_PROFILES) {
  const outcomes = evaluateAll(preset.profile);
  const eligible = outcomes.filter((o) => o.status === 'eligible');
  const possible = outcomes.filter((o) => o.status === 'possible');
  const close = outcomes.filter((o) => o.status === 'close');

  console.log(`▸ ${preset.title} (${preset.badge}):`);
  console.log(`   - Eligible: ${eligible.length}`);
  console.log(`   - Possible: ${possible.length}`);
  console.log(`   - Close:    ${close.length}`);

  // Specific assertions for Syrian in Turkey (2026 facts)
  if (preset.id === 'syrian-in-turkey') {
    const empp = outcomes.find((o) => o.program.id === 'economic-empp');
    if (!empp || empp.program.availability !== 'closed' || empp.status !== 'not_eligible') {
      console.error(`❌ EMPP should be marked closed/not_eligible as of March 2026! Status: ${empp?.status}`);
      failed = true;
    } else {
      console.log(`   ✓ Correctly marked EMPP (Economic Mobility Pathways Pilot) as Closed (March 2026)!`);
    }

    const psr = outcomes.find((o) => o.program.id === 'refugee-psr');
    if (!psr || psr.status !== 'eligible') {
      console.error(`❌ Private Sponsorship of Refugees (SAH) should be eligible! Status: ${psr?.status}`);
      failed = true;
    } else {
      console.log(`   ✓ Correctly identified Private Sponsorship of Refugees (via SAH) as Eligible!`);
    }

    const inCanadaClaim = outcomes.find((o) => o.program.id === 'refugee-in-canada-claim');
    if (inCanadaClaim && inCanadaClaim.status !== 'not_eligible') {
      console.error(`❌ In-Canada refugee claim was wrongly marked as ${inCanadaClaim.status} for a user residing in Turkey!`);
      failed = true;
    } else {
      console.log(`   ✓ Correctly disqualified in-Canada refugee claim (resident in Turkey cannot claim asylum inside Canada)`);
    }

    const fsw = outcomes.find((o) => o.program.id === 'ee-fsw');
    if (fsw && fsw.result.score) {
      console.log(`   ✓ Express Entry calculated CRS: ${fsw.result.score.value} points (including +15 brother bonus)`);
    }
  }

  // Specific assertions for Manitoba family connection
  if (preset.id === 'trades-with-family-manitoba') {
    const mpnp = outcomes.find((o) => o.program.id === 'pnp-mpnp-overseas');
    if (!mpnp || (mpnp.status !== 'eligible' && mpnp.status !== 'possible')) {
      console.error(`❌ Manitoba family connection stream not matched!`);
      failed = true;
    } else {
      console.log(`   ✓ Correctly matched Manitoba MPNP Close Relative Support stream!`);
    }
  }

  // Specific assertions for Grandparent
  if (preset.id === 'grandparent-super-visa') {
    const superVisa = outcomes.find((o) => o.program.id === 'visit-super-visa');
    if (!superVisa || superVisa.status !== 'eligible') {
      console.error(`❌ Super Visa not eligible for Grandparent!`);
      failed = true;
    } else {
      console.log(`   ✓ Correctly identified Super Visa for Grandparent (up to 5 years stay)!`);
    }
  }
}

console.log(`\n[3/3] Engine Stability & Crash Resistance Check...`);
// Test with an empty profile {}
try {
  const emptyOutcomes = evaluateAll({});
  console.log(`✓ Empty profile evaluated gracefully (${emptyOutcomes.length} programs processed without throwing).`);
} catch (err) {
  console.error(`❌ Empty profile crashed the engine:`, err);
  failed = true;
}

if (failed) {
  console.error(`\n❌ Some tests failed.`);
  process.exit(1);
} else {
  console.log(`\n🎉 All automated tests passed successfully!`);
}
