const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const { synthesize } = require('../services/ttsService');

// Hardcoded strings from the app
const extraStrings = [
  'আমি বুঝিনি, আবার দেখাও?',
  'তোমার ছবি বেছে নাও',
  'আমি বাংলায় কথা বলতে পারি।'
];

async function extractStrings() {
  const texts = new Set([...extraStrings]);

  const clientDataPath = path.join(__dirname, '../../client/src/data');
  
  // Extract from words.js
  const wordsContent = fs.readFileSync(path.join(clientDataPath, 'words.js'), 'utf-8');
  const products = [...wordsContent.matchAll(/product:\s*["']([^"']+)["']/g)].map(m => m[1]);
  const clues = [...wordsContent.matchAll(/audioClue:\s*["']([^"']+)["']/g)].map(m => m[1]);
  products.forEach(p => texts.add(p));
  clues.forEach(c => texts.add(c));

  // Extract from sentences.js
  const sentencesContent = fs.readFileSync(path.join(clientDataPath, 'sentences.js'), 'utf-8');
  const reqs = [...sentencesContent.matchAll(/customerRequest:\s*["']([^"']+)["']/g)].map(m => m[1]);
  const prods = [...sentencesContent.matchAll(/productName:\s*["']([^"']+)["']/g)].map(m => m[1]);
  // shopkeeperResponse is an array of strings like ['এই', 'নিন,', 'তাজা', 'দুধ।']
  const responses = [...sentencesContent.matchAll(/shopkeeperResponse:\s*\[([^\]]+)\]/g)].map(m => {
    return m[1].replace(/["']/g, '').split(',').map(s => s.trim()).join(' ');
  });
  reqs.forEach(t => texts.add(t));
  prods.forEach(t => texts.add(t));
  responses.forEach(t => texts.add(t));

  // Extract from customers.js
  const customersContent = fs.readFileSync(path.join(clientDataPath, 'customers.js'), 'utf-8');
  const greetings = [...customersContent.matchAll(/greeting:\s*["']([^"']+)["']/g)].map(m => m[1]);
  const farewells = [...customersContent.matchAll(/farewell:\s*["']([^"']+)["']/g)].map(m => m[1]);
  greetings.forEach(t => texts.add(t));
  farewells.forEach(t => texts.add(t));

  // Extract from letters.js
  const lettersContent = fs.readFileSync(path.join(clientDataPath, 'letters.js'), 'utf-8');
  const chars = [...lettersContent.matchAll(/char:\s*["']([^"']+)["']/g)].map(m => m[1]);
  const names = [...lettersContent.matchAll(/name:\s*["']([^"']+)["']/g)].map(m => m[1]);
  chars.forEach(t => texts.add(t));
  names.forEach(t => texts.add(t));

  return Array.from(texts);
}

async function run() {
  const texts = await extractStrings();
  console.log(`Found ${texts.length} unique texts to precache.`);
  
  let cachedCount = 0;
  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < texts.length; i++) {
    const text = texts[i];
    console.log(`\n[${i+1}/${texts.length}] Processing: "${text}"`);
    
    try {
      const result = await synthesize(text);
      if (result.cached) {
        console.log(`-> Already cached: ${result.cacheKey}`);
        cachedCount++;
      } else if (result.source === 'local' || result.source === 'huggingface') {
        console.log(`-> Successfully generated: ${result.cacheKey} (Source: ${result.source})`);
        successCount++;
      } else {
        console.log(`-> Failed to generate`);
        failCount++;
      }
    } catch (e) {
      console.error(`-> Error:`, e.message);
      failCount++;
    }
  }

  console.log(`\n=== Precaching Complete ===`);
  console.log(`Already cached: ${cachedCount}`);
  console.log(`Generated now: ${successCount}`);
  console.log(`Failed: ${failCount}`);
  process.exit(0);
}

run();
