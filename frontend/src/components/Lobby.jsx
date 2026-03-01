import { useState } from 'react';
import { getAvatar } from '../utils/avatars';
import { getRandomBg } from '../utils/backgrounds';
import './Lobby.css';

const BG = getRandomBg();

function Lobby({ players, isJoined, isApproved, onJoin, myNickname }) {
    const [name, setName] = useState('');

    const handleJoinClick = (e) => {
        e.preventDefault();
        if (name.trim()) onJoin(name.trim());
    };

    const displayName = myNickname || name;

    return (
        <div className="lobby-container" style={{ backgroundImage: `url(${BG})` }}>
            <div className="lobby-overlay" />

            {!isJoined ? (
                <div className="join-card">
                    <div className="join-logo">🎰</div>
                    <h1>QuizArena</h1>
                    <p className="subtitle">Teste seus conhecimentos — Entre na partida</p>
                    <form onSubmit={handleJoinClick}>
                        <input
                            type="text"
                            placeholder="Seu apelido..."
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            maxLength={15}
                            autoFocus
                        />
                        <button type="submit" className="join-btn">Entrar →</button>
                    </form>
                </div>
            ) : !isApproved ? (
                <div className="waiting-area">
                    <div className="waiting-card">
                        <div className="waiting-avatar" style={{ background: getAvatar(displayName).bg }}>
                            {getAvatar(displayName).emoji}
                        </div>
                        <h2>Aguardando aprovação</h2>
                        <p className="pulse-text">O admin vai te liberar em breve...</p>
                    </div>
                </div>
            ) : (
                <div className="waiting-area">
                    <div className="waiting-card">
                        <h2>✓ Você está dentro!</h2>
                        <p className="pulse-text">Aguardando o jogo começar...</p>
                        <div className="player-grid">
                            {players.map((p, idx) => {
                                const av = getAvatar(p.nickname);
                                return (
                                    <div key={idx} className="player-badge">
                                        <span className="badge-avatar" style={{ background: av.bg }}>{av.emoji}</span>
                                        <span>{p.nickname}</span>
                                    </div>
                                );
                            })}
                        </div>
                        <p className="player-count">Jogadores na sala: {players.length}</p>
                    </div>
                    <div className="approved-banner">🔓 Aprovado! Prepare-se para o quiz.</div>
                </div>
            )}
        </div>
    );
}

export default Lobby;
