import { ALL_PROGRAMS } from '../src/data/programs/index.ts';

async function checkUrl(url) {
  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      },
      signal: AbortSignal.timeout(8000)
    });
    return { status: res.status, ok: res.ok, redirected: res.redirected, url: res.url };
  } catch (err) {
    return { status: 0, ok: false, error: err.message };
  }
}

async function run() {
  console.log(`Checking ${ALL_PROGRAMS.length} programs for broken links...\n`);
  const allUrls = new Set();
  for (const p of ALL_PROGRAMS) {
    allUrls.add(p.officialUrl);
    for (const l of p.links) {
      allUrls.add(l.url);
    }
  }

  console.log(`Found ${allUrls.size} unique URLs to test.\n`);
  const broken = [];
  const valid = [];

  for (const url of allUrls) {
    process.stdout.write(`Testing: ${url.slice(0, 70)}... `);
    const result = await checkUrl(url);
    if (!result.ok) {
      console.log(`❌ ${result.status} ${result.error || ''}`);
      broken.push({ url, status: result.status, error: result.error });
    } else {
      console.log(`✓ ${result.status}`);
      valid.push(url);
    }
  }

  console.log(`\n========================================`);
  console.log(`Total URLs: ${allUrls.size}`);
  console.log(`Valid: ${valid.length}`);
  console.log(`Broken / Non-200: ${broken.length}`);
  console.log(`========================================`);

  if (broken.length > 0) {
    console.log(`\nBroken URLs list:`);
    for (const b of broken) {
      console.log(`- [${b.status}] ${b.url}`);
    }
  }
}

run();
