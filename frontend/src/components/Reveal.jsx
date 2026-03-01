import { getAvatar } from '../utils/avatars';
import { getRandomBg } from '../utils/backgrounds';
import './Reveal.css';

const BG = getRandomBg();

function Reveal({ question, correctAnswerIndex, scores, fastestPlayer, myNickname, correctPlayers }) {
    if (!question) return null;

    const myScoreObj = scores.find(s => s.nickname === myNickname);
    const myScore = myScoreObj ? myScoreObj.score : 0;
    const correctText = question.options[correctAnswerIndex]?.replace(/^[A-D]\)\s*/i, '');

    return (
        <div className="reveal-container" style={{ backgroundImage: `url(${BG})` }}>
            <div className="reveal-card">
                <h1>⏱ Tempo Esgotado!</h1>
                <h2 className="reveal-question">{question.question}</h2>

                <div className="correct-answer-box">
                    <h3>Resposta Correta</h3>
                    <p className="correct-text">{correctText}</p>
                </div>

                {fastestPlayer && (
                    <div className="fastest-banner">
                        <span className="fastest-av" style={{ background: getAvatar(fastestPlayer).bg }}>
                            {getAvatar(fastestPlayer).emoji}
                        </span>
                        <strong>{fastestPlayer}</strong> foi o mais rápido! 🚀
                    </div>
                )}

                <div className="correct-list-section">
                    <h3>Quem acertou</h3>
                    <div className="winner-bubbles">
                        {scores.filter(s => correctPlayers?.includes(s.nickname)).map(s => {
                            const av = getAvatar(s.nickname);
                            return (
                                <div key={s.nickname} className="winner-bubble">
                                    <span className="winner-av" style={{ background: av.bg }}>{av.emoji}</span>
                                    <span>{s.nickname}</span>
                                    <span className="winner-score">{s.score} pts</span>
                                </div>
                            );
                        })}
                        {(!correctPlayers || correctPlayers.length === 0) && (
                            <p style={{ color: 'rgba(255,255,255,0.5)', fontWeight: 700 }}>Ninguém acertou... 😱</p>
                        )}
                    </div>
                </div>

                {myNickname && (
                    <div className="my-score">
                        Sua pontuação: <strong>{myScore} pts</strong>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Reveal;
