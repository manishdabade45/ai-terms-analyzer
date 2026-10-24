const fs = require('fs');
const { execSync } = require('child_process');

console.log('Frontend build script started. Working directory:', process.cwd());

if (fs.existsSync('frontend') && fs.existsSync('frontend/package.json')) {
  console.log('Detected frontend subfolder. Building from root...');
  execSync('cd frontend && npm install && npm run build', { stdio: 'inherit' });
  try {
    if (fs.existsSync('frontend/dist')) {
      if (!fs.existsSync('dist')) {
        fs.mkdirSync('dist', { recursive: true });
      }
      fs.cpSync('frontend/dist', 'dist', { recursive: true });
    }
  } catch (err) {}
} else {
  console.log('Running vite build directly in current folder...');
  execSync('npx vite build', { stdio: 'inherit' });
  try {
    if (fs.existsSync('dist') && !fs.existsSync('frontend/dist')) {
      fs.mkdirSync('frontend/dist', { recursive: true });
      fs.cpSync('dist', 'frontend/dist', { recursive: true });
    }
  } catch (err) {}
}

console.log('Frontend build finished!');
