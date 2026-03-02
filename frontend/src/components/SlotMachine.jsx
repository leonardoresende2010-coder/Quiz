import { useState, useEffect, useRef } from 'react';
import './SlotMachine.css';

// Base64 sounds for fallback if no files are provided
const SOUNDS = {
    spin: "data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAAABmYWN0BAAAAAAAAABkYXRhAAAAAA==", // Placeholder beep 
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

    useEffect(() => {
        // Map podium data to the 3 slots (0: Gold, 1: Silver, 2: Bronze)
        // The display order left-to-right is usually Silver(1), Gold(0), Bronze(2) 
        // to match the original podium layout, or we can just do 1, 2, 3 straight.
        // Let's do Gold in middle, Silver left, Bronze right.
        const p1 = podium[1] || { nickname: '---', score: 0 }; // Silver
        const p0 = podium[0] || { nickname: '---', score: 0 }; // Gold
        const p2 = podium[2] || { nickname: '---', score: 0 }; // Bronze

        setPlayers([p1, p0, p2]);

        // Start animation sequence
        const sequence = async () => {
            // Wait a moment before pulling lever
            await new Promise(r => setTimeout(r, 1000));
            setLeverPulled(true);

            // Loop spin sound
            audioRefSpin.current.loop = true;
            audioRefSpin.current.play().catch(e => console.warn('Audio blocked', e));

            // Stop Bronze (reels[2])
            await new Promise(r => setTimeout(r, 3000));
            setRevealedCount(1);
            playSound(audioRefStop.current);

            // Stop Silver (reels[0])
            await new Promise(r => setTimeout(r, 2000));
            setRevealedCount(2);
            playSound(audioRefStop.current);

            // Stop Gold (reels[1])
            await new Promise(r => setTimeout(r, 2500));
            setRevealedCount(3);
            audioRefSpin.current.pause();
            playSound(audioRefWin.current);
            setCelebrate(true);

            // Notify parent
            if (onComplete) {
                setTimeout(onComplete, 3000);
            }
        };

        sequence();

        return () => {
            audioRefSpin.current.pause();
        };
    }, [podium, onComplete]);

    const playSound = (audio) => {
        audio.currentTime = 0;
        audio.play().catch(e => console.warn('Audio blocked', e));
    };

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
                    {Array.from({ length: 30 }).map((_, i) => (
                        <div key={i} className={`confetti c-${i % 5}`} style={{
                            left: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 2}s`
                        }}></div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default SlotMachine;
