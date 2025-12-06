import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import { Document, Packer, Paragraph } from 'docx';
import { saveAs } from 'file-saver';
import './AnalysisForm.css';

interface Offer {
  id: number;
  companyName: string;
  price: number;
  warranty: number;
  completionTime: number;
  experience: number;
}

interface AnalysisFormProps {
  onClose?: () => void;
}

// Przykładowe dane ofert (w przyszłości będą przekazywane z poprzednich kroków)
const mockOffers: Offer[] = [
  {
    id: 1,
    companyName: 'BudMex S.A.',
    price: 150000,
    warranty: 24,
    completionTime: 90,
    experience: 15,
  },
  {
    id: 2,
    companyName: 'TechBud Sp. z o.o.',
    price: 280000,
    warranty: 36,
    completionTime: 120,
    experience: 8,
  },
  {
    id: 3,
    companyName: 'InfraPol S.A.',
    price: 165000,
    warranty: 24,
    completionTime: 75,
    experience: 20,
  },
];

export function AnalysisForm({ onClose }: AnalysisFormProps) {
  const [offers, setOffers] = useState<Offer[]>(mockOffers);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [editingOffer, setEditingOffer] = useState<Offer | null>(null);
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate('/criteria');
  };

  const handleAnalyze = () => {
    setShowAnalysis(true);
  };

  const handleBackToOffers = () => {
    setShowAnalysis(false);
  };

  const handleEditOffer = (offer: Offer) => {
    setEditingOffer({ ...offer });
  };

  const handleEditChange = (field: keyof Offer, value: string | number) => {
    if (!editingOffer) return;
    setEditingOffer(prev => prev ? { ...prev, [field]: value } : null);
  };

  const handleSaveEdit = () => {
    if (!editingOffer) return;
    setOffers(prev => prev.map(o => o.id === editingOffer.id ? editingOffer : o));
    setEditingOffer(null);
  };

  const handleCancelEdit = () => {
    setEditingOffer(null);
  };

  // Funkcja do iteracyjnego wyznaczania ofert poza zakresem ±30%
  const calculateOutliers = (offersList: Offer[]): Set<number> => {
    const excludedIds = new Set<number>();
    let remainingOffers = [...offersList];
    
    while (remainingOffers.length > 0) {
      const avgPrice = remainingOffers.reduce((sum, o) => sum + o.price, 0) / remainingOffers.length;
      const upperLimit = avgPrice * 1.3;
      const lowerLimit = avgPrice * 0.7;
      
      let maxDeviation = 0;
      let mostOutlier: Offer | null = null;
      
      for (const offer of remainingOffers) {
        const price = offer.price;
        if (price > upperLimit || price < lowerLimit) {
          const deviation = Math.abs((price - avgPrice) / avgPrice);
          if (deviation > maxDeviation) {
            maxDeviation = deviation;
            mostOutlier = offer;
          }
        }
      }
      
      if (!mostOutlier) {
        break;
      }
      
      excludedIds.add(mostOutlier.id);
      remainingOffers = remainingOffers.filter(o => o.id !== mostOutlier!.id);
      
      if (remainingOffers.length < 2) {
        break;
      }
    }
    
    return excludedIds;
  };

  const handleGenerateExplanationRequest = async (companyName: string) => {
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

    const blob = await Packer.toBlob(doc);
    const fileName = `prosba_o_wyjasnienia_${companyName.replace(/\s+/g, '_')}.docx`;
    saveAs(blob, fileName);
  };

  const handleExportToExcel = () => {
    const exportData = offers.map((offer, index) => ({
      'Nr oferty': index + 1,
      'Nazwa firmy': offer.companyName,
      'Cena (PLN)': offer.price,
      'Gwarancja (miesiące)': offer.warranty,
      'Termin realizacji (dni)': offer.completionTime,
      'Doświadczenie wykonawcy (lata)': offer.experience,
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    worksheet['!cols'] = [
      { wch: 10 },
      { wch: 25 },
      { wch: 15 },
      { wch: 20 },
      { wch: 25 },
      { wch: 30 },
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Oferty');

    const summaryData = [
      { 'Parametr': 'Liczba ofert', 'Wartość': offers.length },
      { 'Parametr': 'Najniższa cena (PLN)', 'Wartość': Math.min(...offers.map(o => o.price)) },
      { 'Parametr': 'Najwyższa cena (PLN)', 'Wartość': Math.max(...offers.map(o => o.price)) },
      { 'Parametr': 'Średnia cena (PLN)', 'Wartość': (offers.reduce((sum, o) => sum + o.price, 0) / offers.length).toFixed(2) },
      { 'Parametr': 'Najdłuższa gwarancja (miesiące)', 'Wartość': Math.max(...offers.map(o => o.warranty)) },
      { 'Parametr': 'Najkrótszy termin realizacji (dni)', 'Wartość': Math.min(...offers.map(o => o.completionTime)) },
      { 'Parametr': 'Największe doświadczenie (lata)', 'Wartość': Math.max(...offers.map(o => o.experience)) },
    ];
    const summaryWorksheet = XLSX.utils.json_to_sheet(summaryData);
    summaryWorksheet['!cols'] = [
      { wch: 35 },
      { wch: 20 },
    ];
    XLSX.utils.book_append_sheet(workbook, summaryWorksheet, 'Podsumowanie');

    const fileName = `analiza_ofert_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

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

      <div className="offers-counter">
        <span className="counter-badge">{offers.length}</span>
        <span>ofert do analizy</span>
      </div>

      <div className="analysis-results">
        <div className="results-header">
          <h3>Lista ofert ({offers.length}):</h3>
          <div className="results-header-actions">
            <button className="btn-export" onClick={handleExportToExcel}>
              📥 Eksport do Excel
            </button>
            <button className="btn-analyze" onClick={handleAnalyze} disabled={showAnalysis}>
              📊 Analizuj dane
            </button>
          </div>
        </div>
        
        {!showAnalysis ? (
          <div className="offers-list">
            {offers.map((offer, index) => (
              <div key={offer.id} className="offer-card">
                <div className="offer-card-header">
                  <span className="offer-number">Oferta #{index + 1}</span>
                  <div className="offer-card-actions">
                    <button 
                      className="btn-view-file" 
                      onClick={() => {/* TODO: wyświetl plik oferty */}}
                      title="Wyświetl plik oferty"
                    >
                      📄 Plik
                    </button>
                    <button 
                      className="btn-edit-offer" 
                      onClick={() => handleEditOffer(offer)}
                      title="Edytuj dane oferty"
                    >
                      ✏️ Edytuj
                    </button>
                  </div>
                </div>
                <div className="offer-card-content">
                  <div className="offer-field">
                    <span className="offer-label">Firma:</span>
                    <span className="offer-value">{offer.companyName}</span>
                  </div>
                  <div className="offer-field highlight">
                    <span className="offer-label">Cena:</span>
                    <span className="offer-value">
                      {offer.price.toLocaleString('pl-PL', { style: 'currency', currency: 'PLN' })}
                    </span>
                  </div>
                  <div className="offer-field highlight">
                    <span className="offer-label">Gwarancja:</span>
                    <span className="offer-value">{offer.warranty} miesięcy</span>
                  </div>
                  <div className="offer-field">
                    <span className="offer-label">Termin realizacji:</span>
                    <span className="offer-value">{offer.completionTime} dni</span>
                  </div>
                  <div className="offer-field">
                    <span className="offer-label">Doświadczenie wykonawcy:</span>
                    <span className="offer-value">{offer.experience} lat</span>
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
              const excludedIds = calculateOutliers(offers);
              const includedOffers = offers.filter(o => !excludedIds.has(o.id));
              const averagePrice = includedOffers.length > 0 
                ? includedOffers.reduce((sum, o) => sum + o.price, 0) / includedOffers.length
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
                      const price = offer.price;
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
                                  <td className="table-label">Termin realizacji:</td>
                                  <td className="table-value">{offer.completionTime} dni</td>
                                </tr>
                                <tr>
                                  <td className="table-label">Doświadczenie wykonawcy:</td>
                                  <td className="table-value">{offer.experience} lat</td>
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
                          {Math.min(...offers.map(o => o.price)).toLocaleString('pl-PL', { style: 'currency', currency: 'PLN' })}
                        </span>
                      </div>
                      <div className="summary-item">
                        <span className="summary-label">Najwyższa cena (wszystkie):</span>
                        <span className="summary-value">
                          {Math.max(...offers.map(o => o.price)).toLocaleString('pl-PL', { style: 'currency', currency: 'PLN' })}
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
                          {Math.max(...offers.map(o => o.warranty))} miesięcy
                        </span>
                      </div>
                      <div className="summary-item">
                        <span className="summary-label">Najkrótszy termin realizacji:</span>
                        <span className="summary-value">
                          {Math.min(...offers.map(o => o.completionTime))} dni
                        </span>
                      </div>
                      <div className="summary-item">
                        <span className="summary-label">Największe doświadczenie:</span>
                        <span className="summary-value">
                          {Math.max(...offers.map(o => o.experience))} lat
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

      {/* Modal edycji oferty */}
      {editingOffer && (
        <div className="edit-modal-overlay" onClick={handleCancelEdit}>
          <div className="edit-modal" onClick={(e) => e.stopPropagation()}>
            <div className="edit-modal-header">
              <h3>Edytuj ofertę</h3>
              <button className="btn-close-modal" onClick={handleCancelEdit}>×</button>
            </div>
            <div className="edit-modal-content">
              <div className="edit-form-group">
                <label>Nazwa firmy</label>
                <input
                  type="text"
                  value={editingOffer.companyName}
                  onChange={(e) => handleEditChange('companyName', e.target.value)}
                />
              </div>
              <div className="edit-form-group">
                <label>Cena (PLN)</label>
                <input
                  type="number"
                  value={editingOffer.price}
                  onChange={(e) => handleEditChange('price', Number(e.target.value))}
                  min="0"
                  step="0.01"
                />
              </div>
              <div className="edit-form-group">
                <label>Gwarancja (miesiące)</label>
                <input
                  type="number"
                  value={editingOffer.warranty}
                  onChange={(e) => handleEditChange('warranty', Number(e.target.value))}
                  min="0"
                />
              </div>
              <div className="edit-form-group">
                <label>Termin realizacji (dni)</label>
                <input
                  type="number"
                  value={editingOffer.completionTime}
                  onChange={(e) => handleEditChange('completionTime', Number(e.target.value))}
                  min="0"
                />
              </div>
              <div className="edit-form-group">
                <label>Doświadczenie wykonawcy (lata)</label>
                <input
                  type="number"
                  value={editingOffer.experience}
                  onChange={(e) => handleEditChange('experience', Number(e.target.value))}
                  min="0"
                />
              </div>
            </div>
            <div className="edit-modal-actions">
              <button className="btn-cancel" onClick={handleCancelEdit}>
                Anuluj
              </button>
              <button className="btn-save" onClick={handleSaveEdit}>
                💾 Zapisz zmiany
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
