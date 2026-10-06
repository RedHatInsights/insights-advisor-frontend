#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const distAssetsDir = path.join(__dirname, '..', 'dist', 'assets');
const symlinkPath = path.join(distAssetsDir, 'apps');
const symlinkTarget = '../apps';

try {
  // Create dist/assets directory if it doesn't exist
  if (!fs.existsSync(distAssetsDir)) {
    fs.mkdirSync(distAssetsDir, { recursive: true });
    console.log('✓ Created dist/assets directory');
  }

  // Check if symlink exists
  if (fs.existsSync(symlinkPath) || fs.lstatSync(symlinkPath).isSymbolicLink()) {
    console.log('✓ Symlink already exists at dist/assets/apps');
    return;
  }
} catch (err) {
  // lstatSync throws if symlink doesn't exist, that's fine
}

// Create the symlink
try {
  fs.symlinkSync(symlinkTarget, symlinkPath, 'dir');
  console.log('✓ Created symlink: dist/assets/apps -> ../apps');
} catch (err) {
  if (err.code === 'EEXIST') {
    console.log('✓ Symlink already exists');
  } else {
    console.error('✗ Failed to create symlink:', err.message);
    process.exit(1);
  }
}
