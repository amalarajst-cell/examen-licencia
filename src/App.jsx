import React, { useState, useCallback, useMemo } from 'react';
import questionsData from './questions.json';

const BASE = import.meta.env.BASE_URL;

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function App() {
  const [step, setStep] = useState('landing');
  const [examQuestions, setExamQuestions] = useState([]);
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState(null);
  const [feedback, setFeedback] = useState(false);
  const [wrongAnswers, setWrongAnswers] = useState([]);

  const totalCount = questionsData.length;

  const uniqueCategories = useMemo(() => {
    return [...new Set(questionsData.map(q => q.category).filter(Boolean))].sort();
  }, []);

  const uniqueTopics = useMemo(() => {
    return [...new Set(questionsData.map(q => q.topic).filter(Boolean))].sort();
  }, []);

  const startQuiz = useCallback(({ type, value }) => {
    let pool = questionsData;
    if (value !== "Todas las preguntas") {
      pool = questionsData.filter(q => q[type] === value);
    }
    const picked = shuffle(pool).slice(0, Math.min(30, pool.length));
    setExamQuestions(picked);
    setStep('quiz');
    setIdx(0);
    setScore(0);
    setSelected(null);
    setFeedback(false);
    setWrongAnswers([]);
  }, []);

  const handleSelect = useCallback((opt) => {
    if (feedback) return;
    setSelected(opt);
  }, [feedback]);

  const handleNext = useCallback(() => {
    if (!selected || feedback) return;
    const q = examQuestions[idx];
    const selectedIndex = q.options.indexOf(selected);
    const isCorrect = selectedIndex === q.correctAnswer;
    if (isCorrect) {
      setScore(s => s + 1);
    } else {
      setWrongAnswers(prev => [...prev, { question: q.question, selected, correct: q.options[q.correctAnswer] }]);
    }
    setFeedback(true);
    setTimeout(() => {
      setFeedback(false);
      setSelected(null);
      if (idx + 1 < examQuestions.length) {
        setIdx(i => i + 1);
      } else {
        setStep('results');
      }
    }, 1000);
  }, [selected, feedback, examQuestions, idx]);

  // ── Landing ──
  if (step === 'landing') {
    return (
      <div className="app-wrapper">
        <div className="card fade-in">
          <img src={`${BASE}hero-image.png`} alt="Examen de Licencia" className="landing-image" />
          <h1 className="landing-title">Examen de Licencia de Conducir</h1>
          <p className="landing-subtitle">
            Simulador con preguntas oficiales actualizadas. 
            Praticá las veces que quieras hasta sentirte seguro.
          </p>
          <div className="stat-row">
            <div className="stat-item">
              <div className="stat-value">{totalCount}</div>
              <div className="stat-label">Preguntas</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">30</div>
              <div className="stat-label">Por examen</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">80%</div>
              <div className="stat-label">Para aprobar</div>
            </div>
          </div>
          <div className="btn-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', marginTop: '1.5rem', width: '100%' }}>
            
            <h3 style={{ margin: '0', fontSize: '1.05rem', color: 'var(--text-dim)', textAlign: 'center', textTransform: 'uppercase', letterSpacing: '1px' }}>Por Tipo de Vehículo</h3>
            {uniqueCategories.map(cat => (
              <button key={cat} className="btn" onClick={() => startQuiz({ type: 'category', value: cat })}>
                {cat} ({questionsData.filter(q => q.category === cat).length} preg.)
              </button>
            ))}

            <h3 style={{ margin: '1rem 0 0', fontSize: '1.05rem', color: 'var(--text-dim)', textAlign: 'center', textTransform: 'uppercase', letterSpacing: '1px' }}>Por Área Temática</h3>
            {uniqueTopics.map(topic => (
              <button key={topic} className="btn btn-outline" onClick={() => startQuiz({ type: 'topic', value: topic })}>
                {topic} ({questionsData.filter(q => q.topic === topic).length} preg.)
              </button>
            ))}

            <button className="btn" style={{marginTop: '0.5rem', background: 'var(--card-bg)', border: '1px solid var(--text-dim)', color: 'var(--text)'}} onClick={() => startQuiz({ type: 'category', value: 'Todas las preguntas' })}>
              Mezclar Todas las Preguntas ({totalCount} preg.)
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Quiz ──
  if (step === 'quiz') {
    const q = examQuestions[idx];
    const progress = ((idx + 1) / examQuestions.length) * 100;

    return (
      <div className="app-wrapper">
        <div className="card fade-in" key={q.id}>
          <div className="quiz-header">
            <div className="quiz-counter">
              Pregunta <span>{idx + 1}</span> / {examQuestions.length}
            </div>
            <div className="quiz-score">
              Correctas: <span>{score}</span>
            </div>
          </div>

          <div className="progress">
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>

          <h2 className="question-text">{q.question}</h2>

          {q.image && (
            <div className="question-image">
              <img
                src={`${BASE}${q.image}`}
                alt="Imagen de referencia"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            </div>
          )}

          <div className="options-list">
            {q.options.map((opt, i) => {
              const isCorrect = i === q.correctAnswer;
              const isSel = selected === opt;
              let cls = 'opt';
              if (isSel) cls += ' selected';
              if (feedback && isCorrect) cls += ' correct';
              if (feedback && isSel && !isCorrect) cls += ' wrong';

              return (
                <div key={i} className={cls} onClick={() => handleSelect(opt)}>
                  <div className="opt-letter">{String.fromCharCode(65 + i)}</div>
                  <div className="opt-text">{opt}</div>
                </div>
              );
            })}
          </div>

          <button
            className="btn"
            disabled={!selected || feedback}
            onClick={handleNext}
          >
            {feedback ? (q.options.indexOf(selected) === q.correctAnswer ? '✓ Correcto' : '✗ Incorrecto') : 'Confirmar'}
          </button>
        </div>
      </div>
    );
  }

  // ── Results ──
  if (step === 'results') {
    const pct = Math.round((score / examQuestions.length) * 100);
    const passed = pct >= 80;

    return (
      <div className="app-wrapper">
        <div className="card fade-in">
          <div className="results-icon">{passed ? '🎉' : '📚'}</div>
          <div className={`results-score ${passed ? 'passed' : 'failed'}`}>{pct}%</div>
          <div className="results-label">
            {passed ? '¡Felicidades, aprobaste!' : 'No alcanzaste el mínimo'}
          </div>
          <div className="results-detail">
            Acertaste {score} de {examQuestions.length} preguntas.
            {!passed && <><br />Necesitás al menos 80% para aprobar.</>}
          </div>

          <div className="results-bar">
            <div
              className={`results-bar-fill ${passed ? 'passed' : 'failed'}`}
              style={{ width: `${pct}%` }}
            />
          </div>

          <div className="btn-group">
            <button className="btn" onClick={() => setStep('landing')}>
              Volver al Inicio / Otra categoría
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

export default App;
