/* global require, __dirname, process */
const { spawn } = require('child_process');
const path = require('path');

const vite = spawn(
    path.join(__dirname, 'node_modules', '.bin', 'vite'),
    ['--port', '5174', '--host'],
    {
        cwd: __dirname,
        shell: true,
        stdio: 'inherit',
        env: { ...process.env, NODE_ENV: 'development' }
    }
);

vite.on('exit', (code) => {
    process.exit(code);
});
