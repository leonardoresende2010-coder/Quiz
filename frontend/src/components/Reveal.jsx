import { getAvatar } from '../utils/avatars';
import { getRandomBg } from '../utils/backgrounds';
import './Reveal.css';

const BG = getRandomBg();

const OPTION_LETTERS = ['A', 'B', 'C', 'D'];

function Reveal({ question, correctAnswerIndex, scores, fastestPlayer, myNickname, correctPlayers, playerAnswers }) {
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
                    <p className="correct-text">{OPTION_LETTERS[correctAnswerIndex]}: {correctText}</p>
                </div>

                <div className="participants-answers-grid">
                    <h3>Respostas dos Jogadores</h3>
                    <div className="answers-bubbles">
                        {scores.map(s => {
                            const av = getAvatar(s.nickname);
                            const chosenIdx = playerAnswers[s.nickname];
                            const isCorrect = chosenIdx === correctAnswerIndex;
                            const hasAnswered = chosenIdx !== undefined;

                            return (
                                <div key={s.nickname} className={`answer-bubble ${hasAnswered ? (isCorrect ? 'correct' : 'wrong') : 'no-answer'}`}>
                                    <div className="bubble-left">
                                        <span className="bubble-av" style={{ background: av.bg }}>{av.emoji}</span>
                                        <div className="bubble-info">
                                            <span className="bubble-name">{s.nickname}</span>
                                            {s.nickname === fastestPlayer && <span className="fastest-tag">🚀 Turbo</span>}
                                        </div>
                                    </div>
                                    <div className="bubble-right">
                                        <span className="bubble-letter">
                                            {hasAnswered ? OPTION_LETTERS[chosenIdx] : '—'}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {myNickname && (
                    <div className="my-score-footer">
                        Sua pontuação: <strong>{myScore} pts</strong>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Reveal;
