import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

const vite = spawn(
    join(__dirname, 'node_modules', '.bin', 'vite'),
    ['--port', '5174', '--host'],
    {
        cwd: __dirname,
        shell: true,
        stdio: 'inherit',
        env: { ...process.env, NODE_ENV: 'development' }
    }
);

vite.on('exit', (code) => process.exit(code));
