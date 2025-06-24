import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaSync, FaCheckCircle, FaTimesCircle, FaEdit, FaTrash, FaFileCsv,
FaFileAlt } from 'react-icons/fa'; // Importa novos ícones
import './AnalysisHistory.css';
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
function AnalysisHistory() {
const [history, setHistory] = useState([]);
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);
const [editingId, setEditingId] = useState(null);
const [correctedSentiment, setCorrectedSentiment] = useState('');
const fetchHistory = async () => {
setLoading(true);
setError(null);
try {
const response = await axios.get(`${API_BASE_URL}/history`);
setHistory(response.data);
} catch (err) {
console.error('Erro ao buscar histórico:', err);
setError('Erro ao carregar histórico. Verifique se o backend está rodando.');
} finally {
setLoading(false);
}
};
useEffect(() => {
fetchHistory();
}, []);
const handleFeedbackSubmit = async (id) => {
if (!correctedSentiment.trim()) {
alert('Por favor, insira um sentimento corrigido.');
return;
}
try {
await axios.put(`${API_BASE_URL}/feedback/${id}`, {
corrected_sentiment: correctedSentiment
});
alert('Feedback enviado com sucesso!');
setEditingId(null);
setCorrectedSentiment('');
fetchHistory();
} catch (err) {
console.error('Erro ao enviar feedback:', err);
alert('Erro ao enviar feedback.');
}
};
const handleDeleteHistory = async (id) => {
if (window.confirm('Tem certeza que deseja apagar este registro?')) {
try {
// Implementar rota de exclusão no backend (RF04)
// await axios.delete(`http://localhost:5000/history/${id}`);
alert('Funcionalidade de exclusão não implementada no backend ainda.');
// fetchHistory(); // Recarrega o histórico após exclusão
} catch (err) {
console.error('Erro ao apagar registro:', err);
alert('Erro ao apagar registro.');
}
}
};
const handleExport = async (format) => {
try {
const response = await axios.get(`${API_BASE_URL}/export? format=${format}`, {
responseType: 'blob', // Importante: para baixar arquivos binários
});
// Cria um URL para o blob e um link temporário para download
const url = window.URL.createObjectURL(new Blob([response.data]));
const link = document.createElement('a');
link.href = url;
link.setAttribute('download', `sentiment_history.${format}`); // Define o nome do arquivo
document.body.appendChild(link);
link.click();
link.parentNode.removeChild(link); // Remove o link temporário
window.URL.revokeObjectURL(url); // Libera o URL do blob
alert(`Histórico exportado para ${format.toUpperCase()} com sucesso!`);
} catch (err) {
console.error(`Erro ao exportar para ${format}:`, err);
alert(`Erro ao exportar histórico para ${format.toUpperCase()}.`);
}
};
const getSentimentColor = (sentiment) => {
if (!sentiment) return '#6c757d';
const lowerSentiment = sentiment.toLowerCase();
if (lowerSentiment.includes('positive') || lowerSentiment.includes('5 stars') || lowerSentiment.includes('4 stars')) return '#28a745';
if (lowerSentiment.includes('negative') || lowerSentiment.includes('1 star') || lowerSentiment.includes('2 stars')) return '#dc3545';
if (lowerSentiment.includes('neutral') || lowerSentiment.includes('3 stars')) return '#ffc107';
return '#6c757d';
};
return (
<div className="analysis-history-container">
<div className="history-header">
<h3>Histórico de Análises</h3>
<div className="history-actions-top">
<button onClick={fetchHistory} className="refresh-button" disabled=
{loading}>
<FaSync className={loading ? 'spin' : ''} /> {loading ?
'Carregando...' : 'Atualizar Histórico'}
</button>
<button onClick={() => handleExport('csv')} className="export-button
csv-button" disabled={history.length === 0}>
<FaFileCsv /> Exportar CSV
</button>
<button onClick={() => handleExport('txt')} className="export-button
txt-button" disabled={history.length === 0}>
<FaFileAlt /> Exportar TXT
</button>
</div>
</div>
{error && <p className="error-message">{error}</p>}
{history.length === 0 && !loading && !error && <p>Nenhuma análise no
histórico ainda.</p>}
<div className="history-list">
{history.map((entry) => (
<div key={entry.id} className="history-item">
<p><strong>Texto:</strong> {entry.text}</p>
<p>
<strong>Sentimento:</strong>
<span style={{ color: getSentimentColor(entry.sentiment),
fontWeight: 'bold' }}>
{entry.sentiment}
</span>
{' '}({(entry.score * 100).toFixed(2)}%)
</p>
{entry.corrected_sentiment && (
<p>
<strong>Sentimento Corrigido:</strong>
<span style={{ color:
getSentimentColor(entry.corrected_sentiment), fontWeight: 'bold' }}>
{entry.corrected_sentiment}
</span>
</p>
)}
<p><strong>Data/Hora:</strong> {new
Date(entry.timestamp).toLocaleString()}</p>
<div className="history-actions">
{editingId === entry.id ? (
<div className="feedback-edit-mode">
<input
type="text"
value={correctedSentiment}
onChange={(e) => setCorrectedSentiment(e.target.value)}
placeholder="Sentimento correto (ex: positive)"
/>
<button onClick={() => handleFeedbackSubmit(entry.id)}
className="submit-feedback-button">
<FaCheckCircle /> Salvar
</button>
<button onClick={() => setEditingId(null)} className="cancelfeedback-button">
<FaTimesCircle /> Cancelar
</button>
</div>
) : (
<button onClick={() => { setEditingId(entry.id);
setCorrectedSentiment(entry.sentiment); }} className="edit-feedback-button">
<FaEdit /> Corrigir Sentimento
</button>
)}
<button onClick={() => handleDeleteHistory(entry.id)}
className="delete-history-button">
<FaTrash /> Apagar
</button>
</div>
</div>
))}
</div>
</div>
);
}
export default AnalysisHistory;