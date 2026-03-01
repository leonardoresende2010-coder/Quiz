// All background images available in /bg/
export const BG_IMAGES = [
    '/bg/poker-background-5.jpg',
    '/bg/cassino.jpg',
    '/bg/Geld-winnen-in-een-online-casino.jpg',
    '/bg/13183154.jpg',
    '/bg/881ab3cb22e2.jpg',
];

// Pick any random image
export function getRandomBg() {
    return BG_IMAGES[Math.floor(Math.random() * BG_IMAGES.length)];
}

// Pick a random image different from the current one
export function getNewBg(current) {
    const others = BG_IMAGES.filter(b => b !== current);
    if (others.length === 0) return BG_IMAGES[0];
    return others[Math.floor(Math.random() * others.length)];
}
