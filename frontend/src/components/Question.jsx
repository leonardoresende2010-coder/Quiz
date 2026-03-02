import { useState, useEffect, useRef } from 'react';
import { getRandomBg, getNewBg } from '../utils/backgrounds';
import './Question.css';

const OPTION_LETTERS = ['A', 'B', 'C', 'D'];
const OPT_VARS = ['--opt-a', '--opt-b', '--opt-c', '--opt-d'];

function Question({ question, timer, onSubmitAnswer, readOnly }) {
    const [bg, setBg] = useState(getRandomBg());
    const [answered, setAnswered] = useState(false);
    const [showIntro, setShowIntro] = useState(false);
    const videoRef = useRef(null);

    // Initial load / question change
    useEffect(() => {
        if (question?.id) {
            setBg(prev => getNewBg(prev));
            setAnswered(false);

            // Only show intro if it's not the initial mount of the same question
            setShowIntro(true);
        }
    }, [question?.id]);

    useEffect(() => {
        if (showIntro && videoRef.current) {
            videoRef.current.play().catch(e => {
                console.warn("Autoplay blocked or video missing:", e);
                setShowIntro(false);
            });
        }
    }, [showIntro]);

    if (!question) return <div className="qscreen" style={{ backgroundImage: `url(${bg})` }}></div>;

    const isUrgent = timer !== null && timer <= 10;

    const handleAnswer = (idx) => {
        if (readOnly || answered || timer === 0) return;
        setAnswered(true);
        onSubmitAnswer && onSubmitAnswer(idx);
    };

    return (
        <div className="qscreen" style={{ backgroundImage: `url(${bg})` }}>
            <div className="qscreen-overlay" />

            {/* Intro Video Overlay */}
            {showIntro && (
                <div className="qintro-overlay">
                    <video
                        ref={videoRef}
                        className="qintro-video"
                        src="/bg/casino.mp4"
                        playsInline
                        onEnded={() => setShowIntro(false)}
                    />
                </div>
            )}

            {/* Top bar */}
            <div className="qscreen-topbar">
                <div className={`qtimer${isUrgent ? ' urgent' : ''}`}>
                    {timer ?? '–'}
                </div>
                <div className="qpoints-badge">
                    🎰 {question.points} pts
                </div>
            </div>

            {/* Question card */}
            <div className="qcard-wrap">
                <div className="qcard">
                    <div className="qcard-chip">?</div>
                    <div className="qcard-body">
                        <p className="qcard-text">{question.question}</p>
                        <span className={`qdiff qdiff-${question.difficultyStr?.toLowerCase()}`}>
                            {question.difficultyStr}
                        </span>
                    </div>
                </div>
            </div>

            {/* Options */}
            <div className="qoptions">
                {question.options.map((opt, idx) => {
                    const clean = opt.replace(/^[A-D]\)\s*/i, '');
                    return (
                        <button
                            key={idx}
                            className={`qopt${answered ? ' qopt-answered' : ''}`}
                            style={{ '--tab-color': `var(${OPT_VARS[idx]})` }}
                            onClick={() => handleAnswer(idx)}
                            disabled={readOnly || answered || timer === 0}
                        >
                            <span className="qopt-letter">{OPTION_LETTERS[idx]}</span>
                            <span className="qopt-text">{clean}</span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

export default Question;
