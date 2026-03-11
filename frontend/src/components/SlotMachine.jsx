import { useState, useEffect, useRef } from 'react';
import './SlotMachine.css';

// Base64 sounds for fallback if no files are provided
const SOUNDS = {
    spin: "/audio/cacaniquelaudio.m4a", // New real audio file
    stop: "data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAAABmYWN0BAAAAAAAAABkYXRhAAAAAA==", // Placeholder beep
    win: "data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAAABmYWN0BAAAAAAAAABkYXRhAAAAAA=="   // Placeholder beep
};

function SlotMachine({ podium, onComplete }) {
    // 0: All spinning, 1: Bronze stopped, 2: Silver stopped, 3: Gold stopped (Done)
    const [revealedCount, setRevealedCount] = useState(0);
    const [leverPulled, setLeverPulled] = useState(false);
    const [celebrate, setCelebrate] = useState(false);

    const audioRefSpin = useRef(new Audio(SOUNDS.spin));
    const audioRefStop = useRef(new Audio(SOUNDS.stop));
    const audioRefWin = useRef(new Audio(SOUNDS.win));

    const [players, setPlayers] = useState([null, null, null]);
    const hasStarted = useRef(false);

    // Confetti styles generated outside of render
    const [confetti, setConfetti] = useState([]);

    useEffect(() => {
        if (celebrate) {
            // eslint-disable-next-line
            setConfetti(Array.from({ length: 30 }).map(() => ({
                left: `${Math.random() * 100}%`,
                delay: `${Math.random() * 2}s`
            })));
        }
    }, [celebrate]);

    useEffect(() => {
        if (hasStarted.current) return;
        hasStarted.current = true;

        const p1 = podium[1] || { nickname: '---', score: 0 }; // Silver
        const p0 = podium[0] || { nickname: '---', score: 0 }; // Gold
        const p2 = podium[2] || { nickname: '---', score: 0 }; // Bronze

        // eslint-disable-next-line
        setPlayers([p1, p0, p2]);

        const sequence = async () => {
            await new Promise(r => setTimeout(r, 1000));
            setLeverPulled(true);

            audioRefSpin.current.loop = true;
            audioRefSpin.current.play().catch(e => console.warn('Audio blocked', e));

            await new Promise(r => setTimeout(r, 3000));
            setRevealedCount(1);
            playSound(audioRefStop.current);

            await new Promise(r => setTimeout(r, 2000));
            setRevealedCount(2);
            playSound(audioRefStop.current);

            await new Promise(r => setTimeout(r, 2500));
            setRevealedCount(3);
            audioRefSpin.current.pause();
            playSound(audioRefWin.current);
            setCelebrate(true);

            if (onComplete) {
                setTimeout(onComplete, 3000);
            }
        };

        const playSound = (audio) => {
            audio.currentTime = 0;
            audio.play().catch(e => console.warn('Audio blocked', e));
        };

        sequence();

        return () => {
            audioRefSpin.current.pause();
            audioRefStop.current.pause();
            audioRefWin.current.pause();
        };
    }, [podium, onComplete]);

    // Calculate spinning state for each reel (array index: 0=Silver, 1=Gold, 2=Bronze)
    const isSpinning = [
        revealedCount < 2, // Silver stops 2nd
        revealedCount < 3, // Gold stops 3rd
        revealedCount < 1  // Bronze stops 1st
    ];

    // Dummy items for the spinning blur effect
    const blurItems = Array.from({ length: 10 }).map((_, i) => <div key={i} className="slot-blur-item">???</div>);

    return (
        <div className={`slot-machine-container ${celebrate ? 'celebrating' : ''}`}>

            {/* The Machine Body */}
            <div className="slot-machine">
                {/* Top Dome */}
                <div className="slot-dome">
                    <div className={`slot-light ${celebrate ? 'slot-light-flash' : ''}`}></div>
                </div>

                {/* Main Body */}
                <div className="slot-body">
                    {/* Screen wrapper */}
                    <div className="slot-screen-bezel">
                        <div className="slot-screen">

                            {/* Reel 1: Silver (Left) */}
                            <div className="slot-reel-container">
                                <div className={`slot-reel ${isSpinning[0] ? 'spinning' : 'stopped'}`}>
                                    {isSpinning[0] ? blurItems : (
                                        <div className="slot-result silver-result">
                                            <span className="slot-medal">🥈</span>
                                            <span className="slot-name">{players[0].nickname}</span>
                                            <span className="slot-score">{players[0].score}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Reel 2: Gold (Center) */}
                            <div className="slot-reel-container highlight-reel">
                                <div className={`slot-reel ${isSpinning[1] ? 'spinning fast' : 'stopped'}`}>
                                    {isSpinning[1] ? blurItems : (
                                        <div className="slot-result gold-result">
                                            <span className="slot-medal">🥇</span>
                                            <span className="slot-name">{players[1].nickname}</span>
                                            <span className="slot-score">{players[1].score}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Reel 3: Bronze (Right) */}
                            <div className="slot-reel-container">
                                <div className={`slot-reel ${isSpinning[2] ? 'spinning slow' : 'stopped'}`}>
                                    {isSpinning[2] ? blurItems : (
                                        <div className="slot-result bronze-result">
                                            <span className="slot-medal">🥉</span>
                                            <span className="slot-name">{players[2].nickname}</span>
                                            <span className="slot-score">{players[2].score}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                        </div>
                    </div>
                </div>

                {/* Base */}
                <div className="slot-base"></div>

                {/* Lever */}
                <div className={`slot-lever-assembly ${leverPulled ? 'pulled' : ''}`}>
                    <div className="slot-lever-base"></div>
                    <div className="slot-lever-arm"></div>
                    <div className="slot-lever-knob"></div>
                </div>
            </div>

            {/* Confetti Elements */}
            {celebrate && (
                <div className="confetti-container">
                    {confetti.map((style, i) => (
                        <div key={i} className={`confetti c-${i % 5}`} style={{
                            left: style.left,
                            animationDelay: style.delay
                        }}></div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default SlotMachine;
