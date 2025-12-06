import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './OffersListPage.css';

interface OfferFile {
  id: number;
  fileName: string;
  companyName: string;
  source: 'e-zamowienia' | 'local';
  dateAdded: string;
}

// Przykładowe oferty z systemu e-zamówienia
const mockOffersFromSystem: OfferFile[] = [
  {
    id: 1,
    fileName: 'Oferta_BudMex_SA.pdf',
    companyName: 'BudMex S.A.',
    source: 'e-zamowienia',
    dateAdded: '2025-12-06',
  },
  {
    id: 2,
    fileName: 'Oferta_TechBud_Sp_z_oo.pdf',
    companyName: 'TechBud Sp. z o.o.',
    source: 'e-zamowienia',
    dateAdded: '2025-12-06',
  },
  {
    id: 3,
    fileName: 'Oferta_InfraPol_SA.pdf',
    companyName: 'InfraPol S.A.',
    source: 'e-zamowienia',
    dateAdded: '2025-12-05',
  },
];

export function OffersListPage() {
  const [offers, setOffers] = useState<OfferFile[]>(mockOffersFromSystem);
  const [nextId, setNextId] = useState(mockOffersFromSystem.length + 1);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const handleAddFromFile = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const newOffers: OfferFile[] = Array.from(files).map((file, index) => ({
        id: nextId + index,
        fileName: file.name,
        companyName: file.name.replace(/\.[^/.]+$/, '').replace(/_/g, ' '),
        source: 'local' as const,
        dateAdded: new Date().toISOString().split('T')[0],
      }));
      
      setOffers(prev => [...prev, ...newOffers]);
      setNextId(prev => prev + files.length);
      
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveOffer = (id: number) => {
    setOffers(prev => prev.filter(offer => offer.id !== id));
  };

  const handleGoToAnalysis = () => {
    navigate('/analysis');
  };

  const handleGoBack = () => {
    navigate('/upload-swz');
  };

  return (
    <div className="offers-list-page">
      <div className="offers-list-container">
        <div className="offers-list-header">
          <button className="btn-back-nav" onClick={handleGoBack}>
            ← Powrót
          </button>
          <h1>Pobrane oferty przetargowe</h1>
          <p className="offers-list-subtitle">
            Lista ofert pobranych z systemu e-zamówienia oraz dodanych lokalnie
          </p>
        </div>

        <div className="offers-stats">
          <div className="stat-item">
            <span className="stat-number">{offers.length}</span>
            <span className="stat-label">Wszystkich ofert</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{offers.filter(o => o.source === 'e-zamowienia').length}</span>
            <span className="stat-label">Z e-zamówień</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{offers.filter(o => o.source === 'local').length}</span>
            <span className="stat-label">Z plików lokalnych</span>
          </div>
        </div>

        <div className="offers-table-section">
          <div className="table-header">
            <h2>Lista ofert</h2>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept=".pdf,.doc,.docx,.xls,.xlsx"
              multiple
              className="hidden-file-input"
            />
            <button className="btn-add-from-file" onClick={handleAddFromFile}>
              📁 Dodaj oferty z pliku
            </button>
          </div>

          {offers.length > 0 ? (
            <div className="offers-table-wrapper">
              <table className="offers-table">
                <thead>
                  <tr>
                    <th>Lp.</th>
                    <th>Nazwa firmy</th>
                    <th>Nazwa pliku</th>
                    <th>Źródło</th>
                    <th>Data dodania</th>
                    <th>Akcje</th>
                  </tr>
                </thead>
                <tbody>
                  {offers.map((offer, index) => (
                    <tr key={offer.id}>
                      <td className="col-number">{index + 1}</td>
                      <td className="col-company">{offer.companyName}</td>
                      <td className="col-filename">
                        <span className="file-icon">📄</span>
                        {offer.fileName}
                      </td>
                      <td className="col-source">
                        <span className={`source-badge ${offer.source}`}>
                          {offer.source === 'e-zamowienia' ? '🌐 e-zamówienia' : '📁 Plik lokalny'}
                        </span>
                      </td>
                      <td className="col-date">{offer.dateAdded}</td>
                      <td className="col-actions">
                        <button 
                          className="btn-remove-offer"
                          onClick={() => handleRemoveOffer(offer.id)}
                          title="Usuń ofertę"
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="no-offers">
              <span className="no-offers-icon">📭</span>
              <p>Brak ofert do wyświetlenia</p>
              <p className="no-offers-hint">Dodaj oferty z pliku lub pobierz z systemu e-zamówienia</p>
            </div>
          )}
        </div>

        <div className="offers-list-actions">
          <button 
            className="btn-go-to-analysis" 
            onClick={handleGoToAnalysis}
            disabled={offers.length === 0}
          >
            <span>Przejdź do analizy wyników</span>
            <span className="arrow-icon">→</span>
          </button>
        </div>
      </div>
    </div>
  );
}
