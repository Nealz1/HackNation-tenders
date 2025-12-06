import { useState } from 'react';
import './AnalysisForm.css';

interface FormData {
  companyName: string;
  offerDescription: string;
  price: string;
  warranty: string;
}

interface Offer extends FormData {
  id: number;
}

interface AnalysisFormProps {
  onClose?: () => void;
}

const emptyFormData: FormData = {
  companyName: '',
  offerDescription: '',
  price: '',
  warranty: '',
};

export function AnalysisForm({ onClose }: AnalysisFormProps) {
  const [formData, setFormData] = useState<FormData>(emptyFormData);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [nextId, setNextId] = useState(1);
  const [showAnalysis, setShowAnalysis] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddOffer = (e: React.FormEvent) => {
    e.preventDefault();
    const newOffer: Offer = {
      ...formData,
      id: nextId,
    };
    setOffers(prev => [...prev, newOffer]);
    setNextId(prev => prev + 1);
    setFormData(emptyFormData);
    setShowAnalysis(false); // Reset analysis view when adding new offer
  };

  const handleDeleteOffer = (id: number) => {
    setOffers(prev => prev.filter(offer => offer.id !== id));
    setShowAnalysis(false);
  };

  const handleReset = () => {
    setFormData(emptyFormData);
  };

  const handleClearAll = () => {
    setOffers([]);
    setFormData(emptyFormData);
    setNextId(1);
    setShowAnalysis(false);
  };

  const handleAnalyze = () => {
    setShowAnalysis(true);
  };

  const handleBackToOffers = () => {
    setShowAnalysis(false);
  };

  const isFormValid = formData.companyName && formData.offerDescription && formData.price && formData.warranty;

  return (
    <div className="analysis-form-container">
      <div className="analysis-form-header">
        <h2>Analiza Ofert Przetargowych</h2>
        {onClose && (
          <button className="close-button" onClick={onClose}>
            ×
          </button>
        )}
      </div>

      {offers.length > 0 && (
        <div className="offers-counter">
          <span className="counter-badge">{offers.length}</span>
          <span>dodanych ofert</span>
        </div>
      )}

      <form className="analysis-form" onSubmit={handleAddOffer}>
        <div className="form-group">
          <label htmlFor="companyName">Nazwa firmy</label>
          <input
            type="text"
            id="companyName"
            name="companyName"
            value={formData.companyName}
            onChange={handleChange}
            placeholder="Wprowadź nazwę firmy"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="offerDescription">Opis oferty</label>
          <textarea
            id="offerDescription"
            name="offerDescription"
            value={formData.offerDescription}
            onChange={handleChange}
            placeholder="Opisz szczegóły oferty"
            rows={3}
            required
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="price">Cena (PLN)</label>
            <input
              type="number"
              id="price"
              name="price"
              value={formData.price}
              onChange={handleChange}
              placeholder="0.00"
              min="0"
              step="0.01"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="warranty">Gwarancja (miesiące)</label>
            <input
              type="number"
              id="warranty"
              name="warranty"
              value={formData.warranty}
              onChange={handleChange}
              placeholder="12"
              min="0"
              required
            />
          </div>
        </div>

        <div className="form-actions">
          <button type="button" className="btn-secondary" onClick={handleReset}>
            Wyczyść
          </button>
          <button type="submit" className="btn-primary" disabled={!isFormValid}>
            + Dodaj ofertę
          </button>
        </div>
      </form>

      {offers.length > 0 && (
        <div className="analysis-results">
          <div className="results-header">
            <h3>Dodane oferty ({offers.length}):</h3>
            <div className="results-header-actions">
              <button className="btn-analyze" onClick={handleAnalyze} disabled={showAnalysis}>
                📊 Analizuj dane
              </button>
              <button className="btn-clear-all" onClick={handleClearAll}>
                Usuń wszystkie
              </button>
            </div>
          </div>
          
          {!showAnalysis ? (
            <div className="offers-list">
              {offers.map((offer, index) => (
                <div key={offer.id} className="offer-card">
                  <div className="offer-card-header">
                    <span className="offer-number">Oferta #{index + 1}</span>
                    <button 
                      className="btn-delete-offer" 
                      onClick={() => handleDeleteOffer(offer.id)}
                      title="Usuń ofertę"
                    >
                      ×
                    </button>
                  </div>
                  <div className="offer-card-content">
                    <div className="offer-field">
                      <span className="offer-label">Firma:</span>
                      <span className="offer-value">{offer.companyName}</span>
                    </div>
                    <div className="offer-field">
                      <span className="offer-label">Opis:</span>
                      <span className="offer-value">{offer.offerDescription}</span>
                    </div>
                    <div className="offer-field highlight">
                      <span className="offer-label">Cena:</span>
                      <span className="offer-value">
                        {Number(offer.price).toLocaleString('pl-PL', { style: 'currency', currency: 'PLN' })}
                      </span>
                    </div>
                    <div className="offer-field highlight">
                      <span className="offer-label">Gwarancja:</span>
                      <span className="offer-value">{offer.warranty} miesięcy</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="analysis-view">
              <button className="btn-back" onClick={handleBackToOffers}>
                ← Wróć do listy ofert
              </button>
              
              <div className="analysis-content">
                <h3>Analiza danych ofertowych</h3>
                
                {offers.map((offer, index) => (
                  <div key={offer.id} className="analysis-offer-section">
                    <div className="analysis-offer-header">
                      <h4>Oferta oferenta {index + 1}: {offer.companyName}</h4>
                    </div>
                    <div className="analysis-offer-details">
                      <table className="analysis-table">
                        <tbody>
                          <tr>
                            <td className="table-label">Nazwa firmy:</td>
                            <td className="table-value">{offer.companyName}</td>
                          </tr>
                          <tr>
                            <td className="table-label">Opis oferty:</td>
                            <td className="table-value">{offer.offerDescription}</td>
                          </tr>
                          <tr className="highlight-row">
                            <td className="table-label">Cena:</td>
                            <td className="table-value price">
                              {Number(offer.price).toLocaleString('pl-PL', { style: 'currency', currency: 'PLN' })}
                            </td>
                          </tr>
                          <tr className="highlight-row">
                            <td className="table-label">Gwarancja:</td>
                            <td className="table-value warranty">{offer.warranty} miesięcy</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
              </div>

              <div className="offers-summary">
                <h4>Podsumowanie analizy:</h4>
                <div className="summary-grid">
                  <div className="summary-item">
                    <span className="summary-label">Najniższa cena:</span>
                    <span className="summary-value">
                      {Number(Math.min(...offers.map(o => Number(o.price)))).toLocaleString('pl-PL', { style: 'currency', currency: 'PLN' })}
                    </span>
                  </div>
                  <div className="summary-item">
                    <span className="summary-label">Najwyższa cena:</span>
                    <span className="summary-value">
                      {Number(Math.max(...offers.map(o => Number(o.price)))).toLocaleString('pl-PL', { style: 'currency', currency: 'PLN' })}
                    </span>
                  </div>
                  <div className="summary-item">
                    <span className="summary-label">Średnia cena:</span>
                    <span className="summary-value">
                      {(offers.reduce((sum, o) => sum + Number(o.price), 0) / offers.length).toLocaleString('pl-PL', { style: 'currency', currency: 'PLN' })}
                    </span>
                  </div>
                  <div className="summary-item">
                    <span className="summary-label">Najdłuższa gwarancja:</span>
                    <span className="summary-value">
                      {Math.max(...offers.map(o => Number(o.warranty)))} miesięcy
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
