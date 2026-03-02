import { useState, useRef, useEffect } from 'react';
import './Intro.css';

function Intro({ onStart }) {
    const [showButton, setShowButton] = useState(false);
    const videoRef = useRef(null);

    // Try to auto-play on mount
    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.play().catch(e => {
                console.warn('Autoplay blocked by browser. User must interact.', e);
                // If autoplay is blocked, we might just show the button immediately 
                // or let the user click the screen to start the video.
                // For safety, let's just show the button so they aren't stuck.
                setShowButton(true);
            });
        }
    }, []);

    const handleVideoEnd = () => {
        setShowButton(true);
    };

    return (
        <div className="intro-container">
            <video
                ref={videoRef}
                className="intro-video"
                src="/bg/abertura.mp4"
                playsInline
                onEnded={handleVideoEnd}
            />

            {showButton && (
                <div className="intro-overlay">
                    <button className="iniciar-btn" onClick={onStart}>
                        INICIAR
                    </button>
                </div>
            )}
        </div>
    );
}

export default Intro;
