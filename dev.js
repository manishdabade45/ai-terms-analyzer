const { spawn } = require('child_process');
const path = require('path');

console.log('========================================================');
console.log('Starting Full-Stack AI Terms & Conditions Analyzer');
console.log('Backend API:  http://127.0.0.1:5001');
console.log('Web Frontend: http://localhost:3000');
console.log('========================================================\n');

// 1. Start Python Flask Backend on port 5001
const pyCmd = process.platform === 'win32' ? 'python' : 'python3';
const backend = spawn(pyCmd, ['backend/app.py'], {
  stdio: 'inherit',
  shell: true
});

backend.on('error', (err) => {
  console.error('[Backend Error] Failed to start Python backend:', err.message);
  console.log('Please ensure Python 3.10+ is installed and on your PATH.');
});

// 2. Start Vite React Frontend
const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const frontend = spawn(npmCmd, ['run', 'dev'], {
  cwd: path.join(__dirname, 'frontend'),
  stdio: 'inherit',
  shell: true
});

frontend.on('error', (err) => {
  console.error('[Frontend Error] Failed to start Vite dev server:', err.message);
});

frontend.on('close', (code) => {
  backend.kill();
  process.exit(code || 0);
});

process.on('SIGINT', () => {
  console.log('\nShutting down full-stack servers...');
  backend.kill();
  frontend.kill();
  process.exit(0);
});
