import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './CriteriaPage.css';

interface Criterion {
  id: number;
  name: string;
  weight: number;
}

interface ValidityCondition {
  id: number;
  name: string;
  checked: boolean;
}

// Ustalone kryteria oceny (3 kryteria)
const fixedCriteria: Criterion[] = [
  { id: 1, name: 'Cena', weight: 60 },
  { id: 2, name: 'Gwarancja', weight: 20 },
  { id: 3, name: 'Termin realizacji', weight: 20 },
];

// Warunki ważności zamówienia
const defaultValidityConditions: ValidityCondition[] = [
  { id: 1, name: 'Obecność ubezpieczenia OC', checked: true },
  { id: 2, name: 'Wpis do rejestru działalności gospodarczej', checked: true },
  { id: 3, name: 'Brak zaległości podatkowych i ZUS', checked: true },
];

export function CriteriaPage() {
  const [validityConditions, setValidityConditions] = useState<ValidityCondition[]>(defaultValidityConditions);
  const navigate = useNavigate();

  const handleConditionChange = (id: number) => {
    setValidityConditions(prev =>
      prev.map(c => (c.id === id ? { ...c, checked: !c.checked } : c))
    );
  };

  const handleGoBack = () => {
    navigate('/offers-list');
  };

  const handleGoToAnalysis = () => {
    navigate('/analysis');
  };

  return (
    <div className="criteria-page">
      <div className="criteria-container">
        <div className="criteria-header">
          <button className="btn-back-nav" onClick={handleGoBack}>
            ← Powrót
          </button>
          <h1>Kryteria oceny ofert</h1>
          <p className="criteria-subtitle">
            Przegląd kryteriów oceny oraz warunków ważności zamówienia
          </p>
        </div>

        {/* Sekcja kryteriów oceny */}
        <div className="criteria-section">
          <div className="section-header">
            <span className="section-icon">⚖️</span>
            <h2>Kryteria oceny ofert</h2>
          </div>
          <p className="section-description">
            Poniższe kryteria będą brane pod uwagę przy ocenie ofert
          </p>

          <div className="criteria-list fixed">
            <div className="criteria-list-header">
              <span className="col-num">Lp.</span>
              <span className="col-name">Nazwa kryterium</span>
              <span className="col-weight">Waga</span>
            </div>

            {fixedCriteria.map((criterion, index) => (
              <div key={criterion.id} className="criterion-item fixed">
                <span className="col-num">{index + 1}</span>
                <div className="col-name">
                  <span className="criterion-name-display">{criterion.name}</span>
                </div>
                <div className="col-weight">
                  <span className="weight-display">{criterion.weight}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sekcja warunków ważności */}
        <div className="criteria-section">
          <div className="section-header">
            <span className="section-icon">✅</span>
            <h2>Warunki ważności zamówienia</h2>
          </div>
          <p className="section-description">
            Oferty muszą spełniać poniższe warunki formalne, aby być brane pod uwagę
          </p>

          <div className="criteria-list fixed">
            <div className="criteria-list-header validity-header">
              <span className="col-num">Lp.</span>
              <span className="col-name">Warunek</span>
              <span className="col-status">Status</span>
            </div>

            {validityConditions.map((condition, index) => (
              <div key={condition.id} className="criterion-item fixed validity-row">
                <span className="col-num">{index + 1}</span>
                <div className="col-name">
                  <span className="criterion-name-display">{condition.name}</span>
                </div>
                <div className="col-status">
                  <label className="validity-toggle">
                    <input
                      type="checkbox"
                      checked={condition.checked}
                      onChange={() => handleConditionChange(condition.id)}
                    />
                    <span className={`status-badge ${condition.checked ? 'active' : 'inactive'}`}>
                      {condition.checked ? '✓ Wymagane' : '✗ Niewymagane'}
                    </span>
                  </label>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="criteria-actions">
          <button
            className="btn-go-to-analysis"
            onClick={handleGoToAnalysis}
          >
            <span>Przejdź do analizy ofert</span>
            <span className="arrow-icon">→</span>
          </button>
        </div>
      </div>
    </div>
  );
}
