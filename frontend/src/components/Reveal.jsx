import { getAvatar } from '../utils/avatars';
import { getRandomBg } from '../utils/backgrounds';
import './Reveal.css';

const BG = getRandomBg();

const OPTION_LETTERS = ['A', 'B', 'C', 'D'];

function Reveal({ question, correctAnswerIndex, scores, fastestPlayer, myNickname, playerAnswers, isAdmin }) {
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

                {isAdmin && (
                    <div className="reveal-groups">
                        {OPTION_LETTERS.map((letter, lIdx) => {
                            const playersForThisLetter = scores.filter(s => playerAnswers[s.nickname] === lIdx);
                            if (playersForThisLetter.length === 0) return null;

                            return (
                                <div key={letter} className={`reveal-group-column ${lIdx === correctAnswerIndex ? 'group-correct' : 'group-wrong'}`}>
                                    <div className="group-header">
                                        <span className="group-letter">{letter}</span>
                                        <span className="group-count">{playersForThisLetter.length}</span>
                                    </div>
                                    <div className="group-players">
                                        {playersForThisLetter.map(s => {
                                            const av = getAvatar(s.nickname);
                                            return (
                                                <div key={s.nickname} className="group-player-item">
                                                    <span className="player-av-mini" style={{ background: av.bg }}>{av.emoji}</span>
                                                    <span className="player-name-mini">{s.nickname}</span>
                                                    {s.nickname === fastestPlayer && <span className="mini-turbo">🚀</span>}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })}

                        {/* Show those who didn't answer */}
                        {Object.keys(playerAnswers).length < scores.length && (
                            <div className="reveal-group-column group-no-answer">
                                <div className="group-header">
                                    <span className="group-letter">—</span>
                                    <span className="group-count">{scores.filter(s => playerAnswers[s.nickname] === undefined).length}</span>
                                </div>
                                <div className="group-players">
                                    {scores.filter(s => playerAnswers[s.nickname] === undefined).map(s => {
                                        const av = getAvatar(s.nickname);
                                        return (
                                            <div key={s.nickname} className="group-player-item">
                                                <span className="player-av-mini" style={{ background: av.bg }}>{av.emoji}</span>
                                                <span className="player-name-mini">{s.nickname}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                )}

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
