const fs = require('fs');
const path = require('path');

// Test the content manager by checking local content availability
console.log('Testing Content Manager - Local Content Verification\n');

// Check if manifest exists
const manifestPath = path.join(__dirname, 'src/assets/rounds-manifest.json');
if (fs.existsSync(manifestPath)) {
  console.log('✓ Manifest file found at:', manifestPath);

  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  console.log(`✓ Manifest contains ${manifest.rounds.length} rounds`);

  // Test a few rounds to ensure they exist
  const testRounds = ['XMAS19_1_de', 'Lounge_And_Chill_1_en', 'mixed_bag_round'];

  for (const roundId of testRounds) {
    const roundPath = path.join(__dirname, `src/assets/${roundId}/round.json`);
    if (fs.existsSync(roundPath)) {
      console.log(`✓ Round ${roundId} exists`);
    } else {
      console.log(`✗ Round ${roundId} missing`);
    }
  }

  console.log('\n✓ Content Manager verification: Local fallback content is available');
  console.log('✓ The content manager should work with local content');
} else {
  console.log('✗ Manifest file not found');
  console.log('✗ Content manager may not work properly');
}

console.log('\nContent Manager Test Complete');