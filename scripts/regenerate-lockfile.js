// Regenerate package-lock.json with correct dependencies
// Run this to fix the picomatch version mismatch
const fs = require('fs');
const path = require('path');

const packagePath = path.join(__dirname, '..', 'package.json');
const lockPath = path.join(__dirname, '..', 'package-lock.json');

// Read package.json
const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));

// Create a basic lockfile structure that npm can regenerate properly
// This is just to remove the old one - npm install will create the proper one
if (fs.existsSync(lockPath)) {
  fs.unlinkSync(lockPath);
  console.log('✓ Removed stale package-lock.json');
  console.log('✓ Run: npm install');
  console.log('✓ This will generate a fresh lockfile with correct dependency versions');
}
