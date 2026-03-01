module.exports = {
    apps: [
        {
            name: 'quiz-backend',
            script: 'index.js',
            cwd: 'D:/Quiz/backend',
            watch: false,
        },
        {
            name: 'quiz-frontend',
            script: 'start-vite.mjs',
            cwd: 'D:/Quiz/frontend',
            watch: false,
        }
    ]
};
