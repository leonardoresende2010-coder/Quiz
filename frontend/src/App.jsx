import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { io } from 'socket.io-client';
import Lobby from './components/Lobby';
import Question from './components/Question';
import Reveal from './components/Reveal';
import Podium from './components/Podium';
import AdminPanel from './components/AdminPanel';
import ParticipantList from './components/ParticipantList';
import LoginScreen from './components/LoginScreen';

import './App.css';
import './components/ParticipantList.css';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';
const socket = io(BACKEND_URL);

const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || 'admin123';

/* ── Tela de espera do jogador (admin ainda não entrou) ─────── */
const WaitingForAdmin = () => (
  <div className="player-wait-screen">
    <div className="wait-card">
      <div className="wait-icon" style={{ fontSize: '3rem', marginBottom: '16px' }}>🎰</div>
      <h2 style={{ color: '#c9a84c', fontFamily: 'Rajdhani, sans-serif', letterSpacing: '2px', marginBottom: '10px' }}>
        QuizArena
      </h2>
      <p style={{ color: 'rgba(255,255,255,0.55)', fontWeight: 700 }}>
        Aguardando o admin abrir a sessão...
      </p>
    </div>
  </div>
);

const PlayerWaitScreen = () => (
  <div className="player-wait-screen">
    <div className="wait-card">
      <p>Confira o resultado no telão oficial!</p>
      <div className="wait-icon">🎰</div>
    </div>
  </div>
);

/* ── Wrapper de Login do Admin ────────────────────────────── */
function AdminLoginWrapper({ children }) {
  const [authed, setAuthed] = useState(false);
  const [error, setError] = useState(null);

  const handleLogin = (pwd) => {
    if (pwd === ADMIN_PASSWORD) {
      setAuthed(true);
      setError(null);
    } else {
      setError('Senha incorreta. Tente novamente.');
    }
  };

  if (!authed) {
    return <LoginScreen mode="admin" onLogin={handleLogin} error={error} />;
  }

  return children;
}

/* ── App Principal ────────────────────────────────────────── */
function App() {
  const [gameState, setGameState] = useState('LOBBY');
  const [players, setPlayers] = useState([]);
  const [pendingPlayers, setPendingPlayers] = useState([]);
  const [question, setQuestion] = useState(null);
  const [timer, setTimer] = useState(null);
  const [correctAnswerIndex, setCorrectAnswerIndex] = useState(null);
  const [fastestPlayer, setFastestPlayer] = useState(null);
  const [correctPlayers, setCorrectPlayers] = useState([]);
  const [podium, setPodium] = useState([]);
  const [fullRanking, setFullRanking] = useState([]);
  const [allTimeRanking, setAllTimeRanking] = useState([]);
  const [playerAnswers, setPlayerAnswers] = useState({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);

  // Jogador
  const [nickname, setNickname] = useState('');
  const [isJoined, setIsJoined] = useState(false);
  const [isApproved, setIsApproved] = useState(false);
  const [registrationOpen, setRegistrationOpen] = useState(false);

  useEffect(() => {
    socket.on('game_state_change', (data) => {
      if (data.gameState) setGameState(data.gameState);
      if (data.players) setPlayers(data.players);
      if (data.pendingPlayers) setPendingPlayers(data.pendingPlayers);
      if (data.question !== undefined) setQuestion(data.question);
      if (data.timer !== undefined) setTimer(data.timer);
      if (data.correctAnswerIndex !== undefined) setCorrectAnswerIndex(data.correctAnswerIndex);
      if (data.fastestPlayer !== undefined) setFastestPlayer(data.fastestPlayer);
      if (data.correctPlayers) setCorrectPlayers(data.correctPlayers);
      if (data.podium) setPodium(data.podium);
      if (data.fullRanking) setFullRanking(data.fullRanking);
      if (data.allTimeRanking) setAllTimeRanking(data.allTimeRanking);
      if (data.answers) setPlayerAnswers(data.answers);
      if (data.currentQuestionIndex !== undefined) setCurrentQuestionIndex(data.currentQuestionIndex);
      if (data.totalQuestions !== undefined) setTotalQuestions(data.totalQuestions);
      if (data.registrationOpen !== undefined) setRegistrationOpen(data.registrationOpen);
    });

    socket.on('time_tick', (data) => setTimer(data.timer));
    socket.on('pending_approval', () => setIsApproved(false));
    socket.on('player_admitted', () => setIsApproved(true));
    socket.on('bonus_point', () => console.log('Turbo Bonus!'));
    socket.on('error', (msg) => alert(msg));
    socket.on('disconnect', () => { setIsJoined(false); setIsApproved(false); });

    return () => {
      socket.off('game_state_change');
      socket.off('time_tick');
      socket.off('pending_approval');
      socket.off('player_admitted');
      socket.off('bonus_point');
      socket.off('error');
      socket.off('disconnect');
    };
  }, []);

  /* Jogador digita apelido e entra */
  const handleJoin = (name) => {
    setNickname(name);
    socket.emit('join_game', name);
    setIsJoined(true);
  };

  const handleStartGame = () => socket.emit('admin_start_game');
  const handleSubmitAnswer = (index) => socket.emit('submit_answer', index);

  const showSidebar = gameState !== 'PODIUM' && isApproved;

  return (
    <BrowserRouter>
      <div className="app-container">
        <Routes>

          {/* ── Rota do Jogador ─────────────────────── */}
          <Route
            path="/"
            element={
              <div className={showSidebar ? 'game-with-sidebar' : 'game-without-sidebar'}>
                <div className="game-main-content">

                  {/* Admin ainda não entrou — tela de espera sem input */}
                  {!registrationOpen && <WaitingForAdmin />}

                  {/* Admin entrou mas jogador ainda não digitou apelido */}
                  {registrationOpen && gameState === 'LOBBY' && (
                    <Lobby
                      players={players}
                      isJoined={isJoined}
                      isApproved={isApproved}
                      onJoin={handleJoin}
                      myNickname={nickname}
                    />
                  )}

                  {registrationOpen && gameState === 'QUESTION' && (
                    <Question
                      question={question}
                      timer={timer}
                      onSubmitAnswer={handleSubmitAnswer}
                    />
                  )}

                  {registrationOpen && gameState === 'REVEAL' && <PlayerWaitScreen />}
                  {registrationOpen && gameState === 'PODIUM' && <PlayerWaitScreen />}
                </div>
              </div>
            }
          />

          {/* ── Rota do Admin ───────────────────────── */}
          <Route
            path="/admin"
            element={
              <AdminLoginWrapper>
                <AdminPanel
                  socket={socket}
                  gameState={gameState}
                  players={players}
                  pendingPlayers={pendingPlayers}
                  handleStartGame={handleStartGame}
                  question={question}
                  timer={timer}
                  correctAnswerIndex={correctAnswerIndex}
                  scores={players}
                  fastestPlayer={fastestPlayer}
                  correctPlayers={correctPlayers}
                  podium={podium}
                  fullRanking={fullRanking}
                  allTimeRanking={allTimeRanking}
                  playerAnswers={playerAnswers}
                  currentQuestionIndex={currentQuestionIndex}
                  totalQuestions={totalQuestions}
                />
              </AdminLoginWrapper>
            }
          />

        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
