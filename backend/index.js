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
    cors: { origin: '*', methods: ['GET', 'POST'] }
});

const prisma = new PrismaClient();

// Game State
let gameState = 'LOBBY';
let currentQuestionIndex = 0;
let timer = 30;
let timerInterval = null;

// FIX: Store answers with nickname directly, not socketId
// socketId -> { nickname, optionIndex, timeTaken, correct }
let currentAnswers = {};

// socketId -> nickname (kept in sync as long as socket is alive)
let socketToNickname = {};

// --- Timer ---
const startTimer = () => {
    clearInterval(timerInterval);
    timer = 30;
    timerInterval = setInterval(() => {
        timer--;
        io.emit('time_tick', { timer });
        if (timer <= 0) {
            clearInterval(timerInterval);
            io.emit('timer_ended');
        }
    }, 1000);
};

// --- Reveal Answer ---
const revealAnswer = async () => {
    gameState = 'REVEAL';
    const currentQ = questions[currentQuestionIndex];

    console.log('[revealAnswer] currentAnswers:', currentAnswers);
    console.log('[revealAnswer] socketToNickname:', socketToNickname);

    // Find fastest correct answer
    let fastestTime = Infinity;
    let fastestNickname = null;

    Object.entries(currentAnswers).forEach(([socketId, answer]) => {
        if (answer.correct && answer.timeTaken < fastestTime) {
            fastestTime = answer.timeTaken;
            fastestNickname = answer.nickname;
        }
    });

    // Apply points
    for (const [socketId, answer] of Object.entries(currentAnswers)) {
        if (!answer.correct) continue;

        let pointsToAdd = currentQ.points;
        if (answer.nickname === fastestNickname) {
            pointsToAdd += 1;
            io.to(socketId).emit('bonus_point');
        }

        console.log(`[revealAnswer] Adding ${pointsToAdd} pts to ${answer.nickname}`);

        try {
            await prisma.user.update({
                where: { nickname: answer.nickname },
                data: { score: { increment: pointsToAdd } }
            });
        } catch (err) {
            console.error(`[revealAnswer] Error updating score for ${answer.nickname}:`, err.message);
        }
    }

    const updatedPlayers = await prisma.user.findMany({
        where: { isApproved: true },
        orderBy: { score: 'desc' }
    });

    const correctPlayers = Object.values(currentAnswers)
        .filter(a => a.correct)
        .map(a => a.nickname);

    console.log('[revealAnswer] Updated players:', updatedPlayers);

    const answersByNickname = {};
    Object.values(currentAnswers).forEach(a => {
        answersByNickname[a.nickname] = a.optionIndex;
    });

    io.emit('game_state_change', {
        gameState,
        correctAnswerIndex: currentQ.correctAnswerIndex,
        players: updatedPlayers,
        fastestPlayer: fastestNickname,
        correctPlayers,
        answers: answersByNickname
    });
};

// --- Next Question ---
const startNextQuestion = async () => {
    gameState = 'QUESTION';
    currentAnswers = {};

    const currentPlayers = await prisma.user.findMany({
        where: { isApproved: true },
        orderBy: { score: 'desc' }
    });

    console.log('[startNextQuestion] Players:', currentPlayers);

    io.emit('game_state_change', {
        gameState,
        question: questions[currentQuestionIndex],
        players: currentPlayers
    });

    // Delay timer to account for intro video (approx 4s)
    setTimeout(() => {
        if (gameState === 'QUESTION') startTimer();
    }, 4000);
};

// --- End Game ---
const endGame = async () => {
    gameState = 'PODIUM';

    const sortedPlayers = await prisma.user.findMany({
        where: { isApproved: true },
        orderBy: { score: 'desc' }
    });

    const allTimeRanking = await prisma.user.findMany({
        orderBy: { score: 'desc' },
        take: 10
    });

    io.emit('game_state_change', {
        gameState,
        podium: sortedPlayers.slice(0, 3),
        fullRanking: sortedPlayers,
        allTimeRanking,
        players: sortedPlayers
    });

    setTimeout(async () => {
        gameState = 'LOBBY';
        currentQuestionIndex = 0;
        await prisma.user.updateMany({ data: { isApproved: false, score: 0 } });
        io.emit('game_state_change', { gameState, players: [], pendingPlayers: [] });
    }, 40000);
};

// --- Lobby Broadcast ---
const broadcastLobbyState = async () => {
    const admitted = await prisma.user.findMany({ where: { isApproved: true } });
    const pending = await prisma.user.findMany({ where: { isApproved: false } });
    io.emit('game_state_change', { gameState, players: admitted, pendingPlayers: pending });
};

// --- Reset Game (New Game) ---
const resetGame = async () => {
    clearInterval(timerInterval);
    gameState = 'LOBBY';
    currentQuestionIndex = 0;
    timer = 30;
    currentAnswers = {};
    socketToNickname = {};

    // Clear ALL users from DB
    await prisma.user.deleteMany({});
    console.log('[resetGame] All users deleted, game reset to LOBBY.');

    io.emit('game_state_change', {
        gameState: 'LOBBY',
        players: [],
        pendingPlayers: [],
        question: null,
        timer: null
    });
};

// --- Socket Connections ---
io.on('connection', async (socket) => {
    console.log(`User connected: ${socket.id}`);

    const admitted = await prisma.user.findMany({ where: { isApproved: true } });
    const pending = await prisma.user.findMany({ where: { isApproved: false } });

    socket.emit('game_state_change', {
        gameState,
        players: admitted,
        pendingPlayers: pending,
        question: gameState === 'QUESTION' ? questions[currentQuestionIndex] : null,
        timer: gameState === 'QUESTION' ? timer : null
    });

    socket.on('join_game', async (nickname) => {
        if (gameState !== 'LOBBY') {
            socket.emit('error', 'Game already started!');
            return;
        }

        await prisma.user.upsert({
            where: { nickname },
            update: { isApproved: false, score: 0 },
            create: { nickname, isApproved: false, score: 0 }
        });

        socketToNickname[socket.id] = nickname;
        socket.emit('pending_approval');
        await broadcastLobbyState();
    });

    socket.on('admin_admit_player', async (targetNickname) => {
        await prisma.user.update({
            where: { nickname: targetNickname },
            data: { isApproved: true }
        });
        const sid = Object.keys(socketToNickname).find(k => socketToNickname[k] === targetNickname);
        if (sid) io.to(sid).emit('player_admitted');
        await broadcastLobbyState();
    });

    socket.on('admin_admit_all', async () => {
        await prisma.user.updateMany({ where: { isApproved: false }, data: { isApproved: true } });
        Object.entries(socketToNickname).forEach(([sid]) => io.to(sid).emit('player_admitted'));
        await broadcastLobbyState();
    });

    socket.on('admin_new_game', async () => {
        console.log('[admin_new_game] Reset requested by admin.');
        await resetGame();
    });

    socket.on('admin_start_game', async () => {
        const admittedCount = await prisma.user.count({ where: { isApproved: true } });
        if (gameState !== 'LOBBY' || admittedCount === 0) return;

        // Reset scores to 0 (keep users, just zero out scores)
        await prisma.user.updateMany({
            where: { isApproved: true },
            data: { score: 0 }
        });

        // Delete users who are NOT currently connected (stale from old sessions)
        const connectedNicknames = Object.values(socketToNickname);
        await prisma.user.deleteMany({
            where: { isApproved: true, nickname: { notIn: connectedNicknames } }
        });

        // Ensure all connected approved sockets remain approved
        for (const [sid, nick] of Object.entries(socketToNickname)) {
            await prisma.user.upsert({
                where: { nickname: nick },
                update: { isApproved: true, score: 0 },
                create: { nickname: nick, isApproved: true, score: 0 }
            });
            io.to(sid).emit('player_admitted');
        }

        currentQuestionIndex = 0;
        startNextQuestion();
    });

    socket.on('admin_reveal_answer', async () => {
        if (gameState === 'QUESTION') {
            clearInterval(timerInterval);
            await revealAnswer();
        }
    });

    socket.on('admin_next_question', async () => {
        if (gameState === 'REVEAL') {
            currentQuestionIndex++;
            if (currentQuestionIndex < questions.length) {
                await startNextQuestion();
            } else {
                await endGame();
            }
        }
    });

    socket.on('submit_answer', async (optionIndex) => {
        if (gameState !== 'QUESTION') return;
        if (currentAnswers[socket.id]) return; // already answered

        const nickname = socketToNickname[socket.id];
        if (!nickname) {
            console.warn(`[submit_answer] No nickname for socket ${socket.id}`);
            return;
        }

        const user = await prisma.user.findUnique({ where: { nickname } });
        if (!user || !user.isApproved) {
            console.warn(`[submit_answer] User not approved: ${nickname}`);
            return;
        }

        const currentQ = questions[currentQuestionIndex];
        const isCorrect = optionIndex === currentQ.correctAnswerIndex;
        const timeTaken = 30 - timer;

        console.log(`[submit_answer] ${nickname} answered option ${optionIndex}, correct=${isCorrect}`);

        // FIX: Store nickname with the answer directly
        currentAnswers[socket.id] = { nickname, optionIndex, timeTaken, correct: isCorrect };

        const admittedCount = await prisma.user.count({ where: { isApproved: true } });
        if (Object.keys(currentAnswers).length === admittedCount) {
            clearInterval(timerInterval);
            io.emit('all_answered');
        }
    });

    socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`);
        delete socketToNickname[socket.id];
    });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));
