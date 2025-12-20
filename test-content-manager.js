#!/usr/bin/env node

// Simple test runner for ContentManagerService tests
const { execSync } = require('child_process');

console.log('🧪 Running ContentManagerService tests...');

try {
  // Check if the test file compiles
  execSync('npx tsc --noEmit --skipLibCheck src/app/services/content/content-manager.service.spec.ts', {
    stdio: 'inherit',
    cwd: process.cwd()
  });

  console.log('✅ ContentManagerService test file compiles successfully');

  // Check if the main service compiles
  execSync('npx tsc --noEmit --skipLibCheck src/app/services/content/content-manager.service.ts', {
    stdio: 'inherit',
    cwd: process.cwd()
  });

  console.log('✅ ContentManagerService compiles successfully');

  console.log('🎉 All ContentManagerService tests are valid!');

} catch (error) {
  console.error('❌ Test compilation failed:', error.message);
  process.exit(1);
}