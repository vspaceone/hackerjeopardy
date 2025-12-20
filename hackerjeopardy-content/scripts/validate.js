#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 Validating Hacker Jeopardy content...\n');

let errors = 0;
let warnings = 0;

// Validate manifest.json
function validateManifest() {
  console.log('📋 Checking manifest.json...');

  if (!fs.existsSync('manifest.json')) {
    console.error('❌ manifest.json not found');
    errors++;
    return;
  }

  try {
    const manifest = JSON.parse(fs.readFileSync('manifest.json', 'utf8'));

    if (!manifest.rounds || !Array.isArray(manifest.rounds)) {
      console.error('❌ manifest.rounds must be an array');
      errors++;
      return;
    }

    if (manifest.rounds.length === 0) {
      console.warn('⚠️  manifest contains no rounds');
      warnings++;
    }

    manifest.rounds.forEach((round, index) => {
      if (!round.id) {
        console.error(`❌ Round ${index} missing id`);
        errors++;
      }
      if (!round.name) {
        console.error(`❌ Round ${index} missing name`);
        errors++;
      }
    });

    console.log(`✅ Manifest valid (${manifest.rounds.length} rounds)`);
  } catch (e) {
    console.error('❌ Invalid JSON in manifest.json:', e.message);
    errors++;
  }
}

// Validate rounds
function validateRounds() {
  console.log('\n📁 Checking rounds...');

  if (!fs.existsSync('rounds')) {
    console.error('❌ rounds/ directory not found');
    errors++;
    return;
  }

  const roundDirs = fs.readdirSync('rounds').filter(dir =>
    fs.statSync(path.join('rounds', dir)).isDirectory()
  );

  roundDirs.forEach(roundId => {
    const roundPath = path.join('rounds', roundId);
    const roundJsonPath = path.join(roundPath, 'round.json');

    if (!fs.existsSync(roundJsonPath)) {
      console.error(`❌ ${roundJsonPath} not found`);
      errors++;
      return;
    }

    try {
      const round = JSON.parse(fs.readFileSync(roundJsonPath, 'utf8'));

      if (!round.categories || !Array.isArray(round.categories)) {
        console.error(`❌ ${roundId}/round.json: categories must be an array`);
        errors++;
        return;
      }

      // Check categories
      round.categories.forEach(categoryName => {
        const catPath = path.join(roundPath, categoryName, 'cat.json');
        if (!fs.existsSync(catPath)) {
          console.error(`❌ ${catPath} not found`);
          errors++;
        } else {
          try {
            const category = JSON.parse(fs.readFileSync(catPath, 'utf8'));
            if (!category.questions || !Array.isArray(category.questions)) {
              console.error(`❌ ${catPath}: questions must be an array`);
              errors++;
            } else if (category.questions.length === 0) {
              console.warn(`⚠️  ${catPath}: no questions in category`);
              warnings++;
            }
          } catch (e) {
            console.error(`❌ Invalid JSON in ${catPath}:`, e.message);
            errors++;
          }
        }
      });

      console.log(`✅ Round ${roundId} valid`);
    } catch (e) {
      console.error(`❌ Invalid JSON in ${roundJsonPath}:`, e.message);
      errors++;
    }
  });
}

// Run validation
validateManifest();
validateRounds();

console.log(`\n🎯 Validation complete:`);
console.log(`❌ Errors: ${errors}`);
console.log(`⚠️  Warnings: ${warnings}`);

if (errors > 0) {
  console.log('\n🔴 Content validation FAILED');
  process.exit(1);
} else {
  console.log('\n✅ Content validation PASSED');
  if (warnings > 0) {
    console.log('⚠️  Some warnings were found - review them before publishing');
  }
}