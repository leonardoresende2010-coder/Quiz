import { useState, useRef, useEffect } from 'react';
import './Intro.css';

function Intro({ onStart }) {
    const [started, setStarted] = useState(false);
    const [showFinalButton, setShowFinalButton] = useState(false);
    const videoRef = useRef(null);

    const handleStartIntro = () => {
        setStarted(true);
        if (videoRef.current) {
            videoRef.current.play().catch(e => {
                console.warn('Playback failed:', e);
                setShowFinalButton(true);
            });
        }
    };

    const handleVideoEnd = () => {
        setShowFinalButton(true);
    };

    return (
        <div className="intro-container">
            {!started ? (
                <div className="intro-overlay pre-start">
                    <button className="iniciar-btn" onClick={handleStartIntro}>
                        ENTRAR NO CASSINO
                    </button>
                </div>
            ) : (
                <>
                    <video
                        ref={videoRef}
                        className="intro-video"
                        src="/bg/abertura.mp4"
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
