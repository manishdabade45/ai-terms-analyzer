const fs = require('fs');
const { execSync } = require('child_process');

console.log('Build script started. Working directory:', process.cwd());

if (fs.existsSync('frontend') && fs.existsSync('frontend/package.json')) {
  console.log('Detected frontend subfolder. Building from root...');
  execSync('cd frontend && npm install && npm run build', { stdio: 'inherit' });
  
  // Ensure dist is available at root as well
  try {
    if (fs.existsSync('frontend/dist')) {
      if (!fs.existsSync('dist')) {
        fs.mkdirSync('dist', { recursive: true });
      }
      fs.cpSync('frontend/dist', 'dist', { recursive: true });
      console.log('Mirrored frontend/dist -> dist');
    }
  } catch (err) {
    console.warn('Notice mirroring dist:', err.message);
  }
} else {
  console.log('Already inside frontend directory. Running vite build directly...');
  execSync('npx vite build', { stdio: 'inherit' });
  
  // Mirror dist to frontend/dist as well
  try {
    if (fs.existsSync('dist')) {
      if (!fs.existsSync('frontend/dist')) {
        fs.mkdirSync('frontend/dist', { recursive: true });
      }
      fs.cpSync('dist', 'frontend/dist', { recursive: true });
      console.log('Mirrored dist -> frontend/dist');
    }
  } catch (err) {
    console.warn('Notice mirroring frontend/dist:', err.message);
  }
}

console.log('Build completed successfully!');
