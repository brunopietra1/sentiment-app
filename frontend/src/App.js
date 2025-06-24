import React, { useState } from 'react';
import axios from 'axios'; // Importa o axios para fazer requisições HTTP
import TextInput from './components/TextInput'; // Importa o novo componente
import AnalysisHistory from './components/AnalysisHistory';
import './App.css'; 

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function App() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const historyRef = React.useRef();

  const handleAnalyzeText = async (text) => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(
        `${API_BASE_URL}/analyze`, // URL do backend Flask
        { text: text },
        { headers: { 'Content-Type': 'application/json' } }
      );

      if (historyRef.current) {
        historyRef.current.fetchHistory();
      }

      alert(`Análise concluída! Atualize a página para ver o resultado`);
      
    } catch (err) {
      console.error('Erro ao analisar texto:', err);
      setError('Erro ao analisar texto. Verifique se o backend está rodando.');
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="App">
      <header className="App-header">
        <h1>Analisador de Sentimentos</h1>
      </header>
      <main className="App-main">
        <section className="sentiment-analysis-section">
          <h2>Análise de Texto</h2>
          <TextInput onAnalyze={handleAnalyzeText} />
          {loading && <p>Analisando...</p>}
          {error && <p className="error-message">{error}</p>}
        </section>

        <section className="results-history-section">
          <h2>Resultados e Histórico</h2>
          {/* Passa a ref para o componente AnalysisHistory */}
          <AnalysisHistory ref={historyRef} />
        </section>
      </main>
      <footer className="App-footer">
        <p>&copy; 2025 Analisador de Sentimentos. Desenvolvido por Manus AI.
        </p>
      </footer>
    </div>
  );
}

export default App;

