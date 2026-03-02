import { useState } from 'react';
import SlotMachine from './SlotMachine';
import './Podium.css';

function Podium({ podium, fullRanking }) {
    const [showRanking, setShowRanking] = useState(false);

    // If fullRanking is not available, use podium as a fallback to ensure we show results
    const rankingData = fullRanking && fullRanking.length > 0 ? fullRanking : podium;

    return (
        <div className="podium-container">
            <h1>🏆 Ranking Final 🏆</h1>

            <SlotMachine
                podium={podium}
                onComplete={() => setShowRanking(true)}
            />

            {showRanking && (
                <div className="rankings-columns">
                    <div className="ranking-card">
                        <h3>Classificação da Partida</h3>
                        {rankingData.map((p, idx) => (
                            <div key={idx} className="podium-ranking-item">
                                <span className="podium-rank-number">#{idx + 1}</span>
                                <span className="podium-rank-name">{p.nickname || p.name || '---'}</span>
                                <span className="podium-rank-score">{p.score} pts</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

export default Podium;
