#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const distAssetsDir = path.join(__dirname, '..', 'dist', 'assets');
const symlinkPath = path.join(distAssetsDir, 'apps');
const symlinkTarget = '../apps';

// Create dist/assets directory if it does not exist
if (!fs.existsSync(distAssetsDir)) {
  fs.mkdirSync(distAssetsDir, { recursive: true });
  console.log('✓ Created dist/assets directory');
}

// Check if the symlink exists and points to the correct target
try {
  const stats = fs.lstatSync(symlinkPath);
  if (stats.isSymbolicLink()) {
    const target = fs.readlinkSync(symlinkPath);
    if (target === symlinkTarget) {
      console.log('✓ Symlink already correct: dist/assets/apps -> ../apps');
      process.exit(0);
    } else {
      console.log(`⚠ Symlink exists but points to wrong target: ${target}. Removing and recreating.`);
      fs.unlinkSync(symlinkPath);
    }
  } else {
    console.log('⚠ Entry exists at dist/assets/apps but is not a symlink. Removing and recreating.');
    fs.rmSync(symlinkPath, { recursive: true, force: true });
  }
} catch (err) {
  if (err.code !== 'ENOENT') {
    console.error('✗ Error checking symlink:', err.message);
    process.exit(1);
  }
}

// Create the symlink
try {
  fs.symlinkSync(symlinkTarget, symlinkPath, 'dir');
  console.log('✓ Created symlink: dist/assets/apps -> ../apps');
} catch (err) {
  console.error('✗ Failed to create symlink:', err.message);
  process.exit(1);
}
