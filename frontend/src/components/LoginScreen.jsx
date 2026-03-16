import { useState, useRef, useEffect } from 'react';
import { getRandomBg } from '../utils/backgrounds';
import './LoginScreen.css';

const BG = getRandomBg();

/**
 * LoginScreen — reutilizável para jogador e admin.
 *
 * Props:
 *   mode: 'player' | 'admin'
 *   onLogin(value): chamado com o apelido (player) ou senha (admin)
 *   error: string | null  — mensagem de erro opcional
 */
function LoginScreen({ mode = 'player', onLogin, error }) {
    const [value, setValue] = useState('');
    const [shake, setShake] = useState(false);
    const inputRef = useRef(null);

    const isAdmin = mode === 'admin';

    // Quando erro chega, acionar animação de shake
    useEffect(() => {
        if (error) {
            setShake(true);
            const t = setTimeout(() => setShake(false), 500);
            return () => clearTimeout(t);
        }
    }, [error]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (value.trim()) onLogin(value.trim());
    };

    return (
        <div
            className="ls-root"
            style={{ backgroundImage: `url(${BG})` }}
        >
            <div className="ls-overlay" />

            {/* Partículas decorativas */}
            <div className="ls-particles" aria-hidden="true">
                {Array.from({ length: 12 }).map((_, i) => (
                    <div key={i} className={`ls-particle ls-particle--${i % 4}`} />
                ))}
            </div>

            <div className={`ls-card ${shake ? 'ls-card--shake' : ''}`}>
                {/* Cabeçalho */}
                <div className="ls-logo-wrap">
                    <div className="ls-logo-ring">
                        <span className="ls-logo-icon">{isAdmin ? '🛡️' : '🎰'}</span>
                    </div>
                </div>

                <h1 className="ls-title">QuizArena</h1>

                <div className={`ls-badge ${isAdmin ? 'ls-badge--admin' : 'ls-badge--player'}`}>
                    {isAdmin ? 'Painel Admin' : 'Área do Jogador'}
                </div>

                <p className="ls-subtitle">
                    {isAdmin
                        ? 'Digite a senha de administrador para continuar'
                        : 'Escolha um apelido para entrar na partida'}
                </p>

                <form className="ls-form" onSubmit={handleSubmit}>
                    <div className="ls-field-wrap">
                        <label className="ls-label" htmlFor="ls-input">
                            {isAdmin ? 'Senha' : 'Seu apelido'}
                        </label>
                        <input
                            id="ls-input"
                            ref={inputRef}
                            className="ls-input"
                            type={isAdmin ? 'password' : 'text'}
                            placeholder={isAdmin ? '••••••••' : 'Ex: CyberWolf99'}
                            value={value}
                            onChange={(e) => setValue(e.target.value)}
                            maxLength={isAdmin ? 64 : 15}
                            autoFocus
                            autoComplete={isAdmin ? 'current-password' : 'off'}
                            spellCheck="false"
                        />
                        {error && <p className="ls-error">{error}</p>}
                    </div>

                    <button
                        type="submit"
                        className={`ls-btn ${isAdmin ? 'ls-btn--admin' : 'ls-btn--player'}`}
                        disabled={!value.trim()}
                    >
                        {isAdmin ? '🔓 Entrar como Admin' : '→ Entrar na Partida'}
                    </button>
                </form>

                {/* Rodapé decorativo */}
                <div className="ls-footer">
                    {isAdmin
                        ? 'Acesso restrito — apenas administradores'
                        : 'Teste seus conhecimentos · Compete ao vivo'}
                </div>
            </div>
        </div>
    );
}

export default LoginScreen;
