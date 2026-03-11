import { useState, useEffect } from 'react';
import ParticipantList from './ParticipantList';
import Question from './Question';
import Reveal from './Reveal';
import Podium from './Podium';
import { getAvatar } from '../utils/avatars';
import './AdminPanel.css';

function AdminPanel({
    socket,
    gameState,
    players,
    pendingPlayers,
    handleStartGame,
    question,
    timer,
    correctAnswerIndex,
    fastestPlayer,
    correctPlayers,
    podium,
    fullRanking,
    allTimeRanking,
    playerAnswers,
    currentQuestionIndex,
    totalQuestions
}) {
    // Show "Novo Jogo?" modal on first load
    const [showNewGameModal, setShowNewGameModal] = useState(true);
    const [answerStats, setAnswerStats] = useState({ answered: 0, total: 0 });

    useEffect(() => {
        socket.on('answer_stats', (stats) => {
            setAnswerStats(stats);
        });

        return () => {
            socket.off('answer_stats');
        };
    }, [socket]);

    // Reset stats when question code changes
    useEffect(() => {
        if (gameState === 'QUESTION') {
            // eslint-disable-next-line
            setAnswerStats(prev => ({ ...prev, answered: 0 }));
        }
    }, [question?.id, gameState]);

    const admitPlayer = (nickname) => socket.emit('admin_admit_player', nickname);
    const admitAll = () => socket.emit('admin_admit_all');
    const handleReveal = () => socket.emit('admin_reveal_answer');
    const handleNext = () => socket.emit('admin_next_question');

    const handleNewGame = () => {
        socket.emit('admin_new_game');
        setShowNewGameModal(false);
    };

    const handleContinue = () => {
        setShowNewGameModal(false);
    };

    return (
        <div className="admin-root">
            {/* ── New Game Modal ── */}
            {showNewGameModal && (
                <div className="ng-backdrop">
                    <div className="ng-modal">
                        <div className="ng-icon">🎰</div>
                        <h2 className="ng-title">Novo Jogo?</h2>
                        <p className="ng-desc">
                            Deseja iniciar uma sessão completamente nova?<br />
                            <span>Todos os jogadores cadastrados serão removidos.</span>
                        </p>
                        <div className="ng-actions">
                            <button className="ng-btn ng-btn-yes" onClick={handleNewGame}>
                                ✓ Sim, novo jogo
                            </button>
                            <button className="ng-btn ng-btn-no" onClick={handleContinue}>
                                Continuar sessão atual
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Sidebar ── */}
            <div className="admin-sidebar-left">
                <div className="sidebar-header">Ranking 🏆</div>
                <ParticipantList players={players} />
            </div>

            {/* ── Main Content ── */}
            <div className="admin-center-view">
                {gameState === 'LOBBY' && (
                    <div className="admin-lobby-controls">
                        <h1>Lobby Control</h1>
                        <div className="admin-layout">
                            <div className="admin-card">
                                <h2>Pendentes ({pendingPlayers?.length || 0})</h2>
                                {pendingPlayers?.length > 0 && (
                                    <button className="admit-all-btn" onClick={admitAll}>
                                        Admitir Todos
                                    </button>
                                )}
                                <ul className="player-list">
                                    {pendingPlayers?.map(p => {
                                        const av = getAvatar(p.nickname);
                                        return (
                                            <li key={p.nickname}>
                                                <span className="player-av" style={{ background: av.bg }}>{av.emoji}</span>
                                                {p.nickname}
                                                <button onClick={() => admitPlayer(p.nickname)} className="admit-btn">Admitir</button>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </div>
                        </div>
                        {players.length > 0 && (
                            <button className="start-game-btn" onClick={handleStartGame}>
                                🚀 Iniciar Jogo
                            </button>
                        )}
                    </div>
                )}

                {gameState === 'QUESTION' && (
                    <div className="admin-game-view">
                        <div className="answer-counter-bar">
                            <div className="counter-item">
                                <span className="counter-label">Respondido:</span>
                                <span className="counter-value">{answerStats.answered} / {answerStats.total}</span>
                            </div>
                            <div className="counter-item">
                                <span className="counter-label">Faltam:</span>
                                <span className="counter-value urgent">{Math.max(0, answerStats.total - answerStats.answered)}</span>
                            </div>
                            <div className="counter-item">
                                <span className="counter-label">Questão:</span>
                                <span className="counter-value">{(currentQuestionIndex || 0) + 1} / {totalQuestions || 30}</span>
                            </div>
                        </div>
                        <Question question={question} timer={timer} readOnly={true} />
                        <div className="admin-floating-actions">
                            <button className="reveal-btn" onClick={handleReveal}>
                                🔓 Revelar Resposta
                            </button>
                        </div>
                    </div>
                )}

                {gameState === 'REVEAL' && (
                    <div className="admin-game-view">
                        <Reveal
                            question={question}
                            correctAnswerIndex={correctAnswerIndex}
                            scores={players}
                            fastestPlayer={fastestPlayer}
                            correctPlayers={correctPlayers}
                            playerAnswers={playerAnswers}
                            isAdmin={true}
                        />
                        <div className="admin-floating-actions">
                            <button className="next-btn" onClick={handleNext}>
                                Próxima Questão »
                            </button>
                        </div>
                    </div>
                )}

                {gameState === 'PODIUM' && (
                    <Podium podium={podium} fullRanking={fullRanking} allTimeRanking={allTimeRanking} isAdmin={true} />
                )}
            </div>
        </div>
    );
}

export default AdminPanel;
