const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const Fontmin = require('fontmin');

const PUBLIC_DIR = path.resolve(__dirname, '../public');

// ============================================================
// Part 1: PNG → WebP conversion
// ============================================================
async function convertPngToWebp() {
  console.log('🖼️  Converting PNG to WebP...');
  
  const pngFiles = [
    // Damage sidebar PNGs
    { src: 'damage/damage-hero-left.png', dest: 'damage/damage-hero-left.webp' },
    { src: 'damage/damage-hero-right.png', dest: 'damage/damage-hero-right.webp' },
    // Support sidebar PNGs
    { src: 'support/support-hero-left.png', dest: 'support/support-hero-left.webp' },
    { src: 'support/support-hero-right.png', dest: 'support/support-hero-right.webp' },
    // Tank sidebar PNGs
    { src: 'tank/tank-hero-left.png', dest: 'tank/tank-hero-left.webp' },
    { src: 'tank/tank-hero-right.png', dest: 'tank/tank-hero-right.webp' },
    // Avatar placeholder
    { src: 'default-avatar.png', dest: 'default-avatar.webp' },
  ];

  for (const file of pngFiles) {
    const srcPath = path.join(PUBLIC_DIR, file.src);
    const destPath = path.join(PUBLIC_DIR, file.dest);
    
    if (!fs.existsSync(srcPath)) {
      console.warn(`  ⚠️  Source not found: ${file.src}`);
      continue;
    }

    try {
      const inputStat = fs.statSync(srcPath);
      const inputSizeMB = (inputStat.size / (1024 * 1024)).toFixed(2);

      await sharp(srcPath)
        .webp({ quality: 85 })
        .toFile(destPath);

      const outputStat = fs.statSync(destPath);
      const outputSizeMB = (outputStat.size / (1024 * 1024)).toFixed(2);
      const ratio = ((1 - outputStat.size / inputStat.size) * 100).toFixed(0);

      console.log(`  ✅ ${file.src}: ${inputSizeMB}MB → ${outputSizeMB}MB (${ratio}% smaller)`);
    } catch (err) {
      console.error(`  ❌ Failed to convert ${file.src}: ${err.message}`);
    }
  }
}

// ============================================================
// Part 2: Font subsetting (REMOVED — use full fonts instead)
// ============================================================
// Font subsetting has been removed. The project now uses full
// font files to ensure all characters are properly displayed.
async function subsetFonts() {
  console.log('🔤  Font subsetting is disabled — using full fonts.');
}

// ============================================================
// Main
// ============================================================
async function main() {
  console.log('🚀 Starting asset optimization...\n');
  
  await convertPngToWebp();
  await subsetFonts();
  
  console.log('\n✅ All done!');
}

main().catch(console.error);