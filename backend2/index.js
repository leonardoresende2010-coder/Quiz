const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const questions = require('./questions.js');

const app = express();
app.use(cors());
const server = createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
});

const prisma = new PrismaClient();

// Game State
let gameState = 'LOBBY'; // LOBBY, QUESTION, REVEAL, PODIUM
let currentQuestionIndex = 0;
let timer = 30;
let timerInterval = null;
let currentAnswers = {}; // socketId -> { optionIndex, timeTaken, correct }
let playerScores = {}; // socketId -> { nickname, score }

// Start Timer Helper
const startTimer = () => {
    clearInterval(timerInterval);
    timer = 30;
    timerInterval = setInterval(() => {
        timer--;
        io.emit('time_tick', { timer });

        if (timer <= 0) {
            clearInterval(timerInterval);
            revealAnswer();
        }
    }, 1000);
};

// Reveal Answer and Calculate Scores
const revealAnswer = async () => {
    gameState = 'REVEAL';
    const currentQ = questions[currentQuestionIndex];

    // Calculate fastest time among correct answers
    let fastestTime = Infinity;
    let fastestSocketId = null;

    Object.entries(currentAnswers).forEach(([socketId, answer]) => {
        if (answer.correct && answer.timeTaken < fastestTime) {
            fastestTime = answer.timeTaken;
            fastestSocketId = socketId;
        }
    });

    // Apply points
    Object.entries(currentAnswers).forEach(([socketId, answer]) => {
        if (answer.correct) {
            if (!playerScores[socketId]) return;
            playerScores[socketId].score += currentQ.points;

            // Bonus point for fastest
            if (socketId === fastestSocketId) {
                playerScores[socketId].score += 1;
                io.to(socketId).emit('bonus_point');
            }
        }
    });

    // Broadcast reveal
    io.emit('game_state_change', {
        gameState,
        correctAnswerIndex: currentQ.correctAnswerIndex,
        scores: Object.values(playerScores),
        fastestPlayer: fastestSocketId ? playerScores[fastestSocketId].nickname : null
    });

    // Wait 7 seconds before next question
    setTimeout(() => {
        currentQuestionIndex++;
        if (currentQuestionIndex < questions.length) {
            startNextQuestion();
        } else {
            endGame();
        }
    }, 7000);
};

// Next Question
const startNextQuestion = () => {
    gameState = 'QUESTION';
    currentAnswers = {};

    io.emit('game_state_change', {
        gameState,
        question: questions[currentQuestionIndex]
    });

    startTimer();
};

// End Game and Save
const endGame = async () => {
    gameState = 'PODIUM';

    // Sort players by score
    const sortedPlayers = Object.values(playerScores).sort((a, b) => b.score - a.score);

    // Save to Database
    try {
        for (const player of sortedPlayers) {
            // Create or update user score
            await prisma.user.upsert({
                where: { nickname: player.nickname },
                update: { score: player.score },
                create: { nickname: player.nickname, score: player.score }
            });
        }
    } catch (error) {
        console.error("Error saving stats: ", error);
    }

    // Get Top Players from DB
    const allTimeRanking = await prisma.user.findMany({
        orderBy: { score: 'desc' },
        take: 10
    });

    io.emit('game_state_change', {
        gameState,
        podium: sortedPlayers.slice(0, 3), // Top 3 of current match
        fullRanking: sortedPlayers,
        allTimeRanking
    });

    // Reset Game completely after 20s
    setTimeout(() => {
        gameState = 'LOBBY';
        currentQuestionIndex = 0;
        playerScores = {};
        io.emit('game_state_change', { gameState, players: [] });
    }, 20000);
};

io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    // Send initial state
    socket.emit('game_state_change', {
        gameState,
        players: Object.values(playerScores),
        question: gameState === 'QUESTION' ? questions[currentQuestionIndex] : null,
        timer: gameState === 'QUESTION' ? timer : null
    });

    // Join Room
    socket.on('join_game', (nickname) => {
        if (gameState !== 'LOBBY') {
            socket.emit('error', 'Game already started!');
            return;
        }
        playerScores[socket.id] = { nickname, score: 0 };
        io.emit('game_state_change', { gameState, players: Object.values(playerScores) });
    });

    // Admin manually starts the game
    socket.on('admin_start_game', () => {
        if (gameState === 'LOBBY' && Object.keys(playerScores).length > 0) {
            currentQuestionIndex = 0;
            startNextQuestion();
        }
    });

    // Submit Answer
    socket.on('submit_answer', (optionIndex) => {
        if (gameState !== 'QUESTION') return;
        if (currentAnswers[socket.id]) return; // already answered

        const currentQ = questions[currentQuestionIndex];
        const isCorrect = optionIndex === currentQ.correctAnswerIndex;
        const timeTaken = 30 - timer;

        currentAnswers[socket.id] = {
            optionIndex,
            timeTaken,
            correct: isCorrect
        };

        // Check if everyone answered
        if (Object.keys(currentAnswers).length === Object.keys(playerScores).length) {
            clearInterval(timerInterval);
            revealAnswer();
        }
    });

    socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`);
        if (gameState === 'LOBBY') {
            delete playerScores[socket.id];
            io.emit('game_state_change', { gameState, players: Object.values(playerScores) });
        }
    });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
