import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './CriteriaPage.css';

interface Criterion {
  id: number;
  name: string;
  weight: number;
}

const defaultCriteria: Criterion[] = [
  { id: 1, name: 'Cena', weight: 60 },
  { id: 2, name: 'Gwarancja', weight: 20 },
  { id: 3, name: 'Termin realizacji', weight: 10 },
  { id: 4, name: 'Doświadczenie wykonawcy', weight: 10 },
];

export function CriteriaPage() {
  const [criteria, setCriteria] = useState<Criterion[]>(defaultCriteria);
  const [nextId, setNextId] = useState(defaultCriteria.length + 1);
  const navigate = useNavigate();

  const handleNameChange = (id: number, newName: string) => {
    setCriteria(prev =>
      prev.map(c => (c.id === id ? { ...c, name: newName } : c))
    );
  };

  const handleWeightChange = (id: number, newWeight: number) => {
    setCriteria(prev =>
      prev.map(c => (c.id === id ? { ...c, weight: newWeight } : c))
    );
  };

  const handleAddCriterion = () => {
    const newCriterion: Criterion = {
      id: nextId,
      name: `Nowe kryterium ${nextId}`,
      weight: 0,
    };
    setCriteria(prev => [...prev, newCriterion]);
    setNextId(prev => prev + 1);
  };

  const handleRemoveCriterion = (id: number) => {
    if (criteria.length <= 1) {
      alert('Musisz mieć przynajmniej jedno kryterium!');
      return;
    }
    setCriteria(prev => prev.filter(c => c.id !== id));
  };

  const handleGoBack = () => {
    navigate('/offers-list');
  };

  const handleGoToAnalysis = () => {
    navigate('/analysis');
  };

  const totalWeight = criteria.reduce((sum, c) => sum + c.weight, 0);
  const isWeightValid = totalWeight === 100;

  return (
    <div className="criteria-page">
      <div className="criteria-container">
        <div className="criteria-header">
          <button className="btn-back-nav" onClick={handleGoBack}>
            ← Powrót
          </button>
          <h1>Kryteria oceny ofert</h1>
          <p className="criteria-subtitle">
            Zdefiniuj kryteria, na podstawie których będą analizowane oferty
          </p>
        </div>

        <div className="criteria-info-box">
          <div className="info-icon">⚖️</div>
          <div className="info-content">
            <h3>Wagi kryteriów</h3>
            <p>Suma wag wszystkich kryteriów powinna wynosić 100%</p>
          </div>
          <div className={`weight-indicator ${isWeightValid ? 'valid' : 'invalid'}`}>
            <span className="weight-value">{totalWeight}%</span>
            <span className="weight-label">{isWeightValid ? '✓ Poprawne' : '⚠ Suma ≠ 100%'}</span>
          </div>
        </div>

        <div className="criteria-list">
          <div className="criteria-list-header">
            <span className="col-num">Lp.</span>
            <span className="col-name">Nazwa kryterium</span>
            <span className="col-weight">Waga (%)</span>
            <span className="col-actions">Akcje</span>
          </div>

          {criteria.map((criterion, index) => (
            <div key={criterion.id} className="criterion-item">
              <span className="col-num">{index + 1}</span>
              <div className="col-name">
                <input
                  type="text"
                  value={criterion.name}
                  onChange={(e) => handleNameChange(criterion.id, e.target.value)}
                  className="criterion-name-input"
                  placeholder="Nazwa kryterium"
                />
              </div>
              <div className="col-weight">
                <input
                  type="number"
                  value={criterion.weight}
                  onChange={(e) => handleWeightChange(criterion.id, Number(e.target.value))}
                  className="criterion-weight-input"
                  min="0"
                  max="100"
                />
                <span className="weight-suffix">%</span>
              </div>
              <div className="col-actions">
                <button
                  className="btn-remove-criterion"
                  onClick={() => handleRemoveCriterion(criterion.id)}
                  title="Usuń kryterium"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>

        <button className="btn-add-criterion" onClick={handleAddCriterion}>
          <span className="btn-icon">➕</span>
          <span>Dodaj nowe kryterium</span>
        </button>

        <div className="criteria-actions">
          <button
            className="btn-go-to-analysis"
            onClick={handleGoToAnalysis}
            disabled={!isWeightValid}
            title={!isWeightValid ? 'Suma wag musi wynosić 100%' : ''}
          >
            <span>Przejdź do analizy ofert</span>
            <span className="arrow-icon">→</span>
          </button>
          {!isWeightValid && (
            <p className="weight-warning">
              ⚠️ Suma wag kryteriów musi wynosić 100%, aby kontynuować
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
