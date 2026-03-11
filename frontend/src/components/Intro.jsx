import { useState, useRef, useEffect } from 'react';
import './Intro.css';

function Intro({ onStart }) {
    const [started, setStarted] = useState(false);
    const [showFinalButton, setShowFinalButton] = useState(false);
    const videoRef = useRef(null);

    // Play video once it's rendered in the DOM after the click
    useEffect(() => {
        if (started && videoRef.current) {
            videoRef.current.play().catch(e => {
                console.warn('Playback failed:', e);
                setShowFinalButton(true);
            });
        }
    }, [started]);

    const handleStartIntro = () => {
        setStarted(true);
    };

    const handleVideoEnd = () => {
        setShowFinalButton(true);
    };

    return (
        <div className="intro-container">
            {!started ? (
                <div className="intro-overlay pre-start">
                    <button className="iniciar-btn" onClick={handleStartIntro}>
                        ENTRAR NO JOGO
                    </button>
                </div>
            ) : (
                <>
                    <video
                        ref={videoRef}
                        className="intro-video"
                        src="/bg/Fichas_sykesec.mp4"
                        playsInline
                        onEnded={handleVideoEnd}
                    />

                    {showFinalButton && (
                        <div className="intro-overlay">
                            <button className="iniciar-btn" onClick={onStart}>
                                INICIAR
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

export default Intro;
