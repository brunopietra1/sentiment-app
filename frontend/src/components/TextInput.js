import React, { useState } from 'react';
import { FaFileUpload, FaPaperPlane } from 'react-icons/fa'; 
import './TextInput.css'; 

function TextInput({ onAnalyze }) {
    const [text, setText] = useState('');
    const [fileName, setFileName] = useState('');

    const handleTextChange = (event) => {
        setText(event.target.value);
    };

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            setFileName(file.name);
            const reader = new FileReader();
            reader.onload = (e) => {
                setText(e.target.result); 
            };
            reader.readAsText(file); 
        }
    };

    const handleSubmit = () => {
        if (text.trim()) {
            onAnalyze(text); 
            setText(''); 
            setFileName(''); 
        }
    };

    return (
        <div className="text-input-container">
            <textarea
                className="text-input-textarea"
                placeholder="Digite seu texto aqui para análise de sentimentos..."
                value={text}
                onChange={handleTextChange}
                rows="10"
            ></textarea>
            <div className="text-input-actions">
                <label htmlFor="file-upload" className="file-upload-button">
                    <FaFileUpload /> {fileName || 'Upload de Arquivo (.txt)'}
                    <input
                        id="file-upload"
                        type="file"
                        accept=".txt"
                        onChange={handleFileChange}
                        style={{ display: 'none' }} 
                    />
                </label>
                <button
                    className="analyze-button"
                    onClick={handleSubmit}
                    disabled={!text.trim()}
                >
                    <FaPaperPlane /> Analisar
                </button>
            </div>
        </div>
    );
}

export default TextInput;