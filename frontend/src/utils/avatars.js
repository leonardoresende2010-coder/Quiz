// Deterministic avatar assignment based on nickname hash
// Same nickname always gets same avatar + color combo

const AVATARS = [
    { emoji: '🦊', name: 'raposa', bg: '#FF6B35' },
    { emoji: '🐼', name: 'panda', bg: '#4ECDC4' },
    { emoji: '🦁', name: 'leão', bg: '#FFD93D' },
    { emoji: '🐙', name: 'polvo', bg: '#A855F7' },
    { emoji: '🦋', name: 'borboleta', bg: '#EC4899' },
    { emoji: '🐸', name: 'sapo', bg: '#22C55E' },
    { emoji: '🦄', name: 'unicórnio', bg: '#8B5CF6' },
    { emoji: '🐯', name: 'tigre', bg: '#F97316' },
    { emoji: '🦅', name: 'águia', bg: '#0EA5E9' },
    { emoji: '🐺', name: 'lobo', bg: '#6B7280' },
    { emoji: '🦖', name: 'dino', bg: '#16A34A' },
    { emoji: '🐲', name: 'dragão', bg: '#DC2626' },
    { emoji: '🦈', name: 'tubarão', bg: '#0369A1' },
    { emoji: '🦝', name: 'guaxinim', bg: '#78716C' },
    { emoji: '🐧', name: 'pinguim', bg: '#1D4ED8' },
    { emoji: '🦜', name: 'papagaio', bg: '#15803D' },
    { emoji: '🐻‍❄️', name: 'urso polar', bg: '#BAE6FD' },
    { emoji: '🦩', name: 'flamingo', bg: '#F472B6' },
    { emoji: '🐊', name: 'croc', bg: '#4D7C0F' },
    { emoji: '🦔', name: 'ouriço', bg: '#92400E' },
];

// Simple hash function for string
function hashNickname(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
}

export function getAvatar(nickname) {
    if (!nickname) return AVATARS[0];
    const index = hashNickname(nickname) % AVATARS.length;
    return AVATARS[index];
}

export default AVATARS;
