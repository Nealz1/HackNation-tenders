import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './UploadSWZPage.css';

export function UploadSWZPage() {
  const [fileAttached, setFileAttached] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      setFileAttached(true);
    }
  };

  const handleUploadFromDevice = () => {
    fileInputRef.current?.click();
  };

  const handleFetchFromEZamowienia = () => {
    // Symulacja pobrania danych z systemu e-zamówienia
    setFileName('SWZ_e-zamowienia.pdf');
    setFileAttached(true);
  };

  const handleGoToOffers = () => {
    navigate('/analysis');
  };

  return (
    <div className="upload-swz-page">
      <div className="upload-swz-container">
        <div className="upload-swz-header">
          <h1>Załącz plik SWZ przetargu</h1>
          <p className="upload-swz-subtitle">
            Wybierz sposób załączenia Specyfikacji Warunków Zamówienia
          </p>
        </div>

        <div className="upload-swz-box">
          <div className="swz-icon">📋</div>
          <h2>Specyfikacja Warunków Zamówienia</h2>
          <p>Załącz plik SWZ, aby rozpocząć analizę ofert przetargowych</p>
        </div>

        <div className="upload-buttons">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept=".pdf,.doc,.docx"
            className="hidden-file-input"
          />
          
          <button className="btn-upload-device" onClick={handleUploadFromDevice}>
            <span className="btn-icon">📁</span>
            <span className="btn-text">Z pliku</span>
            <span className="btn-description">Wybierz plik z urządzenia</span>
          </button>

          <button className="btn-upload-ezamowienia" onClick={handleFetchFromEZamowienia}>
            <span className="btn-icon">🌐</span>
            <span className="btn-text">Pobierz dane z systemu e-zamówienia</span>
            <span className="btn-description">Importuj automatycznie z platformy</span>
          </button>
        </div>

        {fileAttached && (
          <div className="file-attached-section">
            <div className="success-message">
              <span className="success-icon">✅</span>
              <span>Plik załączono poprawnie</span>
            </div>
            {fileName && (
              <div className="attached-file-info">
                <span className="file-icon">📄</span>
                <span className="file-name">{fileName}</span>
              </div>
            )}
            
            <button className="btn-go-to-offers" onClick={handleGoToOffers}>
              <span>Przejdź do załączania ofert</span>
              <span className="arrow-icon">→</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
