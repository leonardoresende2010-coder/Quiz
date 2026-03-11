import { useState } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import SlotMachine from './SlotMachine';
import './Podium.css';

function Podium({ podium, fullRanking, isAdmin }) {
    const [showRanking, setShowRanking] = useState(false);
    const [adminName, setAdminName] = useState('');

    // If fullRanking is not available, use podium as a fallback to ensure we show results
    const rankingData = fullRanking && fullRanking.length > 0 ? fullRanking : podium;

    const exportToPDF = () => {
        const doc = new jsPDF();

        // Title
        doc.setFontSize(18);
        doc.text('Relatório Final do Quiz', 14, 22);

        // Metadata
        doc.setFontSize(12);
        const dataAtual = new Date().toLocaleString('pt-BR');
        doc.text(`Data e Hora: ${dataAtual}`, 14, 32);
        doc.text(`Administrador: ${adminName || 'Não informado'}`, 14, 40);

        // Table
        const tableData = rankingData.map((p, idx) => [
            idx + 1,
            p.nickname || p.name || '---',
            p.score
        ]);

        autoTable(doc, {
            startY: 50,
            head: [['Posição', 'Participante', 'Pontuação']],
            body: tableData,
            theme: 'striped',
            headStyles: { fillColor: [201, 168, 76] }
        });

        // Save
        const dateStr = new Date().toISOString().split('T')[0];
        doc.save(`Placar_Quiz_${dateStr}.pdf`);
    };

    return (
        <div className="podium-container">
            <h1>🏆 Ranking Final 🏆</h1>

            <SlotMachine
                podium={podium}
                onComplete={() => setShowRanking(true)}
            />

            {showRanking && (
                <div className="rankings-columns">
                    <div className="ranking-card">
                        <h3>Classificação da Partida</h3>
                        {rankingData.map((p, idx) => (
                            <div key={idx} className="podium-ranking-item">
                                <span className="podium-rank-number">#{idx + 1}</span>
                                <span className="podium-rank-name">{p.nickname || p.name || '---'}</span>
                                <span className="podium-rank-score">{p.score} pts</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {showRanking && isAdmin && (
                <div className="admin-export-section">
                    <h3>Exportar Relatório Final</h3>
                    <div className="export-controls">
                        <input
                            type="text"
                            placeholder="Nome do Administrador"
                            value={adminName}
                            onChange={(e) => setAdminName(e.target.value)}
                            className="admin-name-input"
                        />
                        <button onClick={exportToPDF} className="export-pdf-btn">
                            📄 Exportar PDF
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Podium;
