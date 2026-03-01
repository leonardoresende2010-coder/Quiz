import './Podium.css';

function Podium({ podium, fullRanking }) {
    // If fullRanking is not available, use podium as a fallback to ensure we show results
    const rankingData = fullRanking && fullRanking.length > 0 ? fullRanking : podium;

    return (
        <div className="podium-container">
            <h1>🏆 Ranking Final 🏆</h1>

            <div className="podium-display">
                {/* Silver */}
                {podium[1] && (
                    <div className="podium-spot silver">
                        <div className="podium-name">{podium[1].nickname || '...'}</div>
                        <div className="podium-bar">
                            <span className="podium-score">{podium[1].score} pts</span>
                            <span className="medal">🥈</span>
                        </div>
                    </div>
                )}

                {/* Gold */}
                {podium[0] && (
                    <div className="podium-spot gold">
                        <div className="podium-name">{podium[0].nickname || '...'}</div>
                        <div className="podium-bar">
                            <span className="podium-score">{podium[0].score} pts</span>
                            <span className="medal">🥇</span>
                        </div>
                    </div>
                )}

                {/* Bronze */}
                {podium[2] && (
                    <div className="podium-spot bronze">
                        <div className="podium-name">{podium[2].nickname || '...'}</div>
                        <div className="podium-bar">
                            <span className="podium-score">{podium[2].score} pts</span>
                            <span className="medal">🥉</span>
                        </div>
                    </div>
                )}
            </div>

            <div className="rankings-columns">
                <div className="ranking-card">
                    <h3>Classificação da Partida</h3>
                    <div className="ranking-list">
                        {rankingData.map((p, idx) => (
                            <div key={idx} className="ranking-item">
                                <span className="rank-number">#{idx + 1}</span>
                                <span className="rank-name">{p.nickname || p.name || '---'}</span>
                                <span className="rank-score">{p.score} pts</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Podium;
