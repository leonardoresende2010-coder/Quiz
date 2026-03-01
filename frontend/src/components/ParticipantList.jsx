import { getAvatar } from '../utils/avatars';
import './ParticipantList.css';

function ParticipantList({ players = [] }) {
    const safePlayers = Array.isArray(players) ? players : [];
    const sortedPlayers = [...safePlayers].sort((a, b) => b.score - a.score);

    return (
        <div className="participant-sidebar">
            <div className="ranking-list">
                {sortedPlayers.map((player, index) => {
                    const avatar = getAvatar(player.nickname);
                    const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : null;
                    return (
                        <div key={player.nickname} className={`ranking-item rank-${Math.min(index, 3)}`}>
                            <span className="rank-avatar" style={{ background: avatar.bg }}>
                                {avatar.emoji}
                            </span>
                            <span className="rank-name">
                                {medal && <span className="rank-medal">{medal}</span>}
                                {player.nickname}
                            </span>
                            <span className="rank-score">{player.score} pts</span>
                        </div>
                    );
                })}
                {sortedPlayers.length === 0 && (
                    <p className="no-players">Nenhum jogador ainda 🎮</p>
                )}
            </div>
        </div>
    );
}

export default ParticipantList;
