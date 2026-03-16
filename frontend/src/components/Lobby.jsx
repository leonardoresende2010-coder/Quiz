import { getAvatar } from '../utils/avatars';
import { getRandomBg } from '../utils/backgrounds';
import './Lobby.css';

const BG = getRandomBg();

function Lobby({ players, isApproved, myNickname }) {
    const displayName = myNickname || '?';

    return (
        <div className="lobby-container" style={{ backgroundImage: `url(${BG})` }}>
            <div className="lobby-overlay" />

            {!isApproved ? (
                <div className="waiting-area">
                    <div className="waiting-card">
                        <div
                            className="waiting-avatar"
                            style={{ background: getAvatar(displayName).bg }}
                        >
                            {getAvatar(displayName).emoji}
                        </div>
                        <h2>Olá, {displayName}!</h2>
                        <p className="pulse-text">Aguardando aprovação do admin...</p>
                    </div>
                </div>
            ) : (
                <div className="waiting-area">
                    <div className="waiting-card">
                        <div
                            className="waiting-avatar"
                            style={{ background: getAvatar(displayName).bg }}
                        >
                            {getAvatar(displayName).emoji}
                        </div>
                        <h2>✓ Você está dentro!</h2>
                        <p className="pulse-text">Aguardando o jogo começar...</p>
                        <div className="player-grid">
                            {players.map((p, idx) => {
                                const av = getAvatar(p.nickname);
                                return (
                                    <div key={idx} className="player-badge">
                                        <span
                                            className="badge-avatar"
                                            style={{ background: av.bg }}
                                        >
                                            {av.emoji}
                                        </span>
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
