import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import { Document, Packer, Paragraph } from 'docx';
import { saveAs } from 'file-saver';
import './AnalysisForm.css';

interface FormData {
  companyName: string;
  offerDescription: string;
  price: string;
  warranty: string;
}

interface Offer extends FormData {
  id: number;
  pdfFile?: File | null;
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
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const handleGoBack = () => {
    if (offers.length > 0) {
      const confirmed = window.confirm(
        'Uwaga! Wszystkie wprowadzone dane ofert zostaną utracone. Czy na pewno chcesz kontynuować?'
      );
      if (confirmed) {
        navigate('/upload-swz');
      }
    } else {
      navigate('/upload-swz');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setPdfFile(file);
    } else if (file) {
      alert('Proszę wybrać plik w formacie PDF');
      e.target.value = '';
    }
  };

  const handleRemoveFile = () => {
    setPdfFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleAddOffer = (e: React.FormEvent) => {
    e.preventDefault();
    const newOffer: Offer = {
      ...formData,
      id: nextId,
      pdfFile: pdfFile,
    };
    setOffers(prev => [...prev, newOffer]);
    setNextId(prev => prev + 1);
    setFormData(emptyFormData);
    setPdfFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
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

  // Funkcja do iteracyjnego wyznaczania ofert poza zakresem ±30%
  const calculateOutliers = (offersList: Offer[]): Set<number> => {
    const excludedIds = new Set<number>();
    let remainingOffers = [...offersList];
    
    while (remainingOffers.length > 0) {
      // Oblicz średnią dla pozostałych ofert
      const avgPrice = remainingOffers.reduce((sum, o) => sum + Number(o.price), 0) / remainingOffers.length;
      const upperLimit = avgPrice * 1.3;
      const lowerLimit = avgPrice * 0.7;
      
      // Znajdź ofertę najbardziej odstającą
      let maxDeviation = 0;
      let mostOutlier: Offer | null = null;
      
      for (const offer of remainingOffers) {
        const price = Number(offer.price);
        if (price > upperLimit || price < lowerLimit) {
          const deviation = Math.abs((price - avgPrice) / avgPrice);
          if (deviation > maxDeviation) {
            maxDeviation = deviation;
            mostOutlier = offer;
          }
        }
      }
      
      // Jeśli nie ma już ofert poza zakresem, kończymy
      if (!mostOutlier) {
        break;
      }
      
      // Wyklucz najbardziej odstającą ofertę i powtórz
      excludedIds.add(mostOutlier.id);
      remainingOffers = remainingOffers.filter(o => o.id !== mostOutlier!.id);
      
      // Jeśli zostanie mniej niż 2 oferty, nie ma sensu dalej liczyć
      if (remainingOffers.length < 2) {
        break;
      }
    }
    
    return excludedIds;
  };

  const handleGenerateExplanationRequest = async (companyName: string) => {
    // Utwórz pusty dokument Word
    const doc = new Document({
      sections: [
        {
          properties: {},
          children: [
            new Paragraph({
              text: "",
            }),
          ],
        },
      ],
    });

    // Generuj plik i pobierz
    const blob = await Packer.toBlob(doc);
    const fileName = `prosba_o_wyjasnienia_${companyName.replace(/\s+/g, '_')}.docx`;
    saveAs(blob, fileName);
  };

  const handleExportToExcel = () => {
    // Przygotuj dane do eksportu
    const exportData = offers.map((offer, index) => ({
      'Nr oferty': index + 1,
      'Nazwa firmy': offer.companyName,
      'Opis oferty': offer.offerDescription,
      'Cena (PLN)': Number(offer.price),
      'Gwarancja (miesiące)': Number(offer.warranty),
      'Załącznik PDF': offer.pdfFile ? offer.pdfFile.name : 'Brak',
    }));

    // Utwórz arkusz
    const worksheet = XLSX.utils.json_to_sheet(exportData);

    // Ustaw szerokość kolumn
    worksheet['!cols'] = [
      { wch: 10 },  // Nr oferty
      { wch: 25 },  // Nazwa firmy
      { wch: 40 },  // Opis oferty
      { wch: 15 },  // Cena
      { wch: 20 },  // Gwarancja
      { wch: 25 },  // Załącznik PDF
    ];

    // Utwórz skoroszyt
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Oferty');

    // Dodaj arkusz z podsumowaniem
    const summaryData = [
      { 'Parametr': 'Liczba ofert', 'Wartość': offers.length },
      { 'Parametr': 'Najniższa cena (PLN)', 'Wartość': Math.min(...offers.map(o => Number(o.price))) },
      { 'Parametr': 'Najwyższa cena (PLN)', 'Wartość': Math.max(...offers.map(o => Number(o.price))) },
      { 'Parametr': 'Średnia cena (PLN)', 'Wartość': (offers.reduce((sum, o) => sum + Number(o.price), 0) / offers.length).toFixed(2) },
      { 'Parametr': 'Najdłuższa gwarancja (miesiące)', 'Wartość': Math.max(...offers.map(o => Number(o.warranty))) },
    ];
    const summaryWorksheet = XLSX.utils.json_to_sheet(summaryData);
    summaryWorksheet['!cols'] = [
      { wch: 30 },
      { wch: 20 },
    ];
    XLSX.utils.book_append_sheet(workbook, summaryWorksheet, 'Podsumowanie');

    // Zapisz plik
    const fileName = `analiza_ofert_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  const isFormValid = formData.companyName && formData.offerDescription && formData.price && formData.warranty;

  return (
    <div className="analysis-form-container">
      <div className="analysis-form-header">
        <button className="btn-go-back" onClick={handleGoBack}>
          ← Powrót
        </button>
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

        <div className="form-group">
          <label htmlFor="pdfFile">Załącznik PDF</label>
          <div className="file-upload-container">
            <input
              type="file"
              id="pdfFile"
              ref={fileInputRef}
              accept=".pdf,application/pdf"
              onChange={handleFileChange}
              className="file-input"
            />
            <label htmlFor="pdfFile" className="file-upload-button">
              📄 Wybierz plik PDF
            </label>
            {pdfFile && (
              <div className="file-selected">
                <span className="file-name">{pdfFile.name}</span>
                <button type="button" className="btn-remove-file" onClick={handleRemoveFile}>
                  ×
                </button>
              </div>
            )}
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
              <button className="btn-export" onClick={handleExportToExcel}>
                📥 Eksport do Excel
              </button>
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
              
              {(() => {
                // Oblicz wykluczone oferty iteracyjnie
                const excludedIds = calculateOutliers(offers);
                
                // Oferty które liczą się do średniej (nie wykluczone)
                const includedOffers = offers.filter(o => !excludedIds.has(o.id));
                
                // Średnia z ofert które się liczą
                const averagePrice = includedOffers.length > 0 
                  ? includedOffers.reduce((sum, o) => sum + Number(o.price), 0) / includedOffers.length
                  : 0;
                const upperLimit = averagePrice * 1.3;
                const lowerLimit = averagePrice * 0.7;

                return (
                  <>
                    <div className="analysis-content">
                      <h3>Analiza danych ofertowych</h3>
                      <div className="analysis-avg-info">
                        <span>Średnia cena (po wykluczeniu odstających): <strong>{averagePrice.toLocaleString('pl-PL', { style: 'currency', currency: 'PLN' })}</strong></span>
                        <span className="avg-range">
                          Zakres normalny (±30%): {lowerLimit.toLocaleString('pl-PL', { style: 'currency', currency: 'PLN' })} - {upperLimit.toLocaleString('pl-PL', { style: 'currency', currency: 'PLN' })}
                        </span>
                        <span className="avg-included">
                          Oferty uwzględnione w średniej: {includedOffers.length} z {offers.length}
                        </span>
                      </div>
                      
                      {offers.map((offer, index) => {
                        const price = Number(offer.price);
                        const isExcluded = excludedIds.has(offer.id);
                        const percentDiff = averagePrice > 0 
                          ? ((price - averagePrice) / averagePrice * 100).toFixed(1)
                          : '0';
                        
                        return (
                          <div 
                            key={offer.id} 
                            className={`analysis-offer-section ${isExcluded ? 'out-of-range' : ''}`}
                          >
                            <div className={`analysis-offer-header ${isExcluded ? 'warning' : ''}`}>
                              <h4>Oferta oferenta {index + 1}: {offer.companyName}</h4>
                              {isExcluded && (
                                <span className="warning-badge">
                                  ⚠️ WYKLUCZONA ({Number(percentDiff) > 0 ? '+' : ''}{percentDiff}%)
                                </span>
                              )}
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
                                  <tr className={`highlight-row ${isExcluded ? 'warning-row' : ''}`}>
                                    <td className="table-label">Cena:</td>
                                    <td className={`table-value price ${isExcluded ? 'warning-price' : ''}`}>
                                      {price.toLocaleString('pl-PL', { style: 'currency', currency: 'PLN' })}
                                      {isExcluded && (
                                        <span className="price-diff">
                                          ({Number(percentDiff) > 0 ? '+' : ''}{percentDiff}% od średniej)
                                        </span>
                                      )}
                                    </td>
                                  </tr>
                                  <tr className="highlight-row">
                                    <td className="table-label">Gwarancja:</td>
                                    <td className="table-value warranty">{offer.warranty} miesięcy</td>
                                  </tr>
                                  <tr>
                                    <td className="table-label">Status:</td>
                                    <td className={`table-value ${isExcluded ? 'status-excluded' : 'status-included'}`}>
                                      {isExcluded ? '❌ Wykluczona ze średniej' : '✓ Uwzględniona w średniej'}
                                    </td>
                                  </tr>
                                </tbody>
                              </table>
                              {isExcluded && (
                                <div className="explanation-request-section">
                                  <button 
                                    className="btn-explanation-request"
                                    onClick={() => handleGenerateExplanationRequest(offer.companyName)}
                                  >
                                    📄 Generuj prośbę o wyjaśnienia
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="offers-summary">
                      <h4>Podsumowanie analizy:</h4>
                      <div className="summary-grid">
                        <div className="summary-item">
                          <span className="summary-label">Najniższa cena (wszystkie):</span>
                          <span className="summary-value">
                            {Number(Math.min(...offers.map(o => Number(o.price)))).toLocaleString('pl-PL', { style: 'currency', currency: 'PLN' })}
                          </span>
                        </div>
                        <div className="summary-item">
                          <span className="summary-label">Najwyższa cena (wszystkie):</span>
                          <span className="summary-value">
                            {Number(Math.max(...offers.map(o => Number(o.price)))).toLocaleString('pl-PL', { style: 'currency', currency: 'PLN' })}
                          </span>
                        </div>
                        <div className="summary-item highlight-avg">
                          <span className="summary-label">Średnia cena (po wykluczeniu):</span>
                          <span className="summary-value">
                            {averagePrice.toLocaleString('pl-PL', { style: 'currency', currency: 'PLN' })}
                          </span>
                        </div>
                        <div className="summary-item">
                          <span className="summary-label">Najdłuższa gwarancja:</span>
                          <span className="summary-value">
                            {Math.max(...offers.map(o => Number(o.warranty)))} miesięcy
                          </span>
                        </div>
                      </div>
                      <div className="out-of-range-count">
                        <span className="warning-icon">⚠️</span>
                        <span>Oferty wykluczone (poza ±30%): <strong>{excludedIds.size}</strong> z {offers.length}</span>
                      </div>
                      {includedOffers.length > 0 && (
                        <div className="included-offers-info">
                          <span className="success-icon">✓</span>
                          <span>Oferty uwzględnione w średniej: <strong>{includedOffers.length}</strong></span>
                        </div>
                      )}
                    </div>
                  </>
                );
              })()}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
