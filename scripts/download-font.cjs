const https = require('https');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const AdmZip = require('adm-zip');

const PUBLIC = path.resolve(__dirname, '../public');

// MapleMono CN download URLs - these are zip files from releases
const urls = [
  { zip: 'https://github.com/subframe7536/Maple-font/releases/download/v7.0/MapleMono-CN-unhinted.zip', ttf: 'MapleMono-CN-Regular.ttf' },
  { zip: 'https://github.com/subframe7536/Maple-font/releases/download/v6.5/MapleMono-CN-unhinted.zip', ttf: 'MapleMono-CN-Regular.ttf' },
  { zip: 'https://github.com/subframe7536/Maple-font/releases/download/v6.4/MapleMono-CN-unhinted.zip', ttf: 'MapleMono-CN-Regular.ttf' },
];

function download(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, (res) => {
      if (res.statusCode === 302 || res.statusCode === 301) {
        file.close();
        fs.unlinkSync(dest);
        download(res.headers.location, dest).then(resolve).catch(reject);
        return;
      }
      if (res.statusCode !== 200) {
        file.close();
        if (fs.existsSync(dest)) fs.unlinkSync(dest);
        reject(new Error(`HTTP ${res.statusCode}`));
        return;
      }
      res.pipe(file);
      file.on('finish', () => { file.close(); resolve(); });
    }).on('error', (err) => { file.close(); if (fs.existsSync(dest)) fs.unlinkSync(dest); reject(err); });
  });
}

async function main() {
  // Check existing font sizes
  const currentMaple = path.join(PUBLIC, 'font-maple-mono.ttf');
  if (fs.existsSync(currentMaple)) {
    const size = fs.statSync(currentMaple).size;
    console.log(`Current font-maple-mono.ttf size: ${(size / 1024 / 1024).toFixed(2)} MB`);
    if (size > 2000000) {
      console.log('Font appears to be full version already (>2MB).');
      return;
    }
  }

  // SmileySans was already done
  console.log('Checking SmileySans...');
  const smileySize = fs.statSync(path.join(PUBLIC, 'font-smiley-sans.ttf')).size;
  console.log(`font-smiley-sans.ttf size: ${(smileySize / 1024 / 1024).toFixed(2)} MB`);
  if (smileySize > 1000000) {
    console.log('SmileySans is full version ✓');
  }

  console.log('\nDownloading full MapleMono CN font...');
  for (const entry of urls) {
    const zipDest = path.join(PUBLIC, 'maple-temp.zip');
    try {
      console.log(`Trying: ${entry.zip}`);
      await download(entry.zip, zipDest);
      console.log('  Downloaded zip, extracting...');
      
      try {
        const zip = new AdmZip(zipDest);
        const entry2 = zip.getEntry(entry.ttf);
        if (entry2) {
          zip.extractEntryTo(entry2, PUBLIC, false, true, 'font-maple-mono.ttf');
          const newSize = fs.statSync(currentMaple).size;
          console.log(`  Extracted! Size: ${(newSize / 1024 / 1024).toFixed(2)} MB`);
          if (fs.existsSync(zipDest)) fs.unlinkSync(zipDest);
          return;
        }
        // Try other entry names
        const entries = zip.getEntries().filter(e => e.name.endsWith('.ttf') && e.name.includes('CN'));
        for (const e of entries) {
          console.log(`  Found entry: ${e.entryName}`);
          zip.extractEntryTo(e, PUBLIC, false, true, 'font-maple-mono.ttf');
          const newSize = fs.statSync(currentMaple).size;
          console.log(`  Extracted! Size: ${(newSize / 1024 / 1024).toFixed(2)} MB`);
          if (fs.existsSync(zipDest)) fs.unlinkSync(zipDest);
          return;
        }
      } catch (zipErr) {
        console.log(`  Zip error: ${zipErr.message}`);
      }
      if (fs.existsSync(zipDest)) fs.unlinkSync(zipDest);
    } catch (e) {
      console.log(`  Failed: ${e.message}`);
      if (fs.existsSync(zipDest)) fs.unlinkSync(zipDest);
    }
  }
  
  console.log('\nCould not download MapleMono automatically. Please manually download from:');
  console.log('https://github.com/subframe7536/Maple-font/releases');
  console.log('Get the CN unhinted zip, extract the Regular .ttf, and save as:');
  console.log('  public/font-maple-mono.ttf');
  console.log('\nOr run: npm install adm-zip then re-run this script');
}

main().catch(console.error);