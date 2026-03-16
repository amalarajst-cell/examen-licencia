import React, { useState, useEffect } from 'react';
import questionsData from './questions.json';

function App() {
  const [step, setStep] = useState('landing'); // 'landing', 'quiz', 'results'
  const [examQuestions, setExamQuestions] = useState([]);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);

  const startQuiz = () => {
    // Shuffle and pick 30 questions for a standard exam
    const shuffled = [...questionsData].sort(() => 0.5 - Math.random());
    setExamQuestions(shuffled.slice(0, 30));
    setStep('quiz');
    setCurrentQuestionIdx(0);
    setScore(0);
    setSelectedOption(null);
  };

  const handleOptionSelect = (option) => {
    if (showFeedback) return;
    setSelectedOption(option);
  };

  const checkAnswer = () => {
    if (selectedOption === examQuestions[currentQuestionIdx].answer) {
      setScore(score + 1);
    }
    setShowFeedback(true);
    setTimeout(() => {
      setShowFeedback(false);
      setSelectedOption(null);
      if (currentQuestionIdx + 1 < examQuestions.length) {
        setCurrentQuestionIdx(currentQuestionIdx + 1);
      } else {
        setStep('results');
      }
    }, 1200);
  };

  if (step === 'landing') {
    return (
      <div className="premium-container">
        <div className="card fade-in">
          <h1 className="title">Examen de Licencia</h1>
          <p style={{ color: 'var(--text-dim)', textAlign: 'center', marginBottom: '2rem' }}>
            Simulador oficial con las preguntas actualizadas. Prepárate para aprobar.
          </p>
          <div style={{ textAlign: 'center', color: 'var(--primary)', marginBottom: '1.5rem', fontWeight: 'bold' }}>
            {questionsData.length} preguntas disponibles
          </div>
          <button className="button" onClick={startQuiz}>Empezar Examen (30 Qs)</button>
        </div>
      </div>
    );
  }

  if (step === 'quiz') {
    const question = examQuestions[currentQuestionIdx];
    const progress = ((currentQuestionIdx + 1) / examQuestions.length) * 100;

    return (
      <div className="premium-container">
        <div className="card fade-in" style={{ maxWidth: '700px' }}>
          <div className="progress">
            <div className="progress-bar" style={{ width: `${progress}%` }}></div>
          </div>
          <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
            Pregunta {currentQuestionIdx + 1} de {examQuestions.length}
          </p>
          <h2 style={{ marginBottom: '1.5rem', fontSize: '1.3rem', lineHeight: '1.4' }}>{question.question}</h2>
          
          {question.image && (
            <div style={{ width: '100%', marginBottom: '1.5rem', borderRadius: '15px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
              <img 
                src={question.image} 
                alt="Imagen de referencia" 
                style={{ width: '100%', display: 'block', maxHeight: '300px', objectFit: 'contain', background: '#fff' }} 
              />
            </div>
          )}

          <div className="options-container">
            {question.options.map((option, idx) => {
              const isCorrect = option === question.answer;
              const isSelected = selectedOption === option;
              let className = `option ${isSelected ? 'selected' : ''}`;
              
              if (showFeedback) {
                if (isCorrect) className += ' correct';
                if (isSelected && !isCorrect) className += ' wrong';
              }

              return (
                <div 
                  key={idx}
                  className={className}
                  onClick={() => handleOptionSelect(option)}
                >
                  <span style={{ fontWeight: '700', marginRight: '0.8rem', color: 'var(--primary)' }}>
                    {String.fromCharCode(65 + idx)}.
                  </span>
                  {option}
                </div>
              );
            })}
          </div>

          <button 
            className="button" 
            style={{ marginTop: '1rem', opacity: selectedOption ? 1 : 0.5 }}
            disabled={!selectedOption || showFeedback}
            onClick={checkAnswer}
          >
            {showFeedback ? 'Verificando...' : 'Siguiente'}
          </button>
        </div>
      </div>
    );
  }

  if (step === 'results') {
    const percentage = Math.round((score / examQuestions.length) * 100);
    const passed = percentage >= 80;

    return (
      <div className="premium-container">
        <div className="card fade-in">
          <h1 className="title">{passed ? '¡Aprobado!' : 'Sigue Practicando'}</h1>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{ fontSize: '4rem', fontWeight: '800', color: passed ? 'var(--success)' : 'var(--error)' }}>
              {percentage}%
            </div>
            <p style={{ color: 'var(--text-dim)' }}>
              Has acertado {score} de {examQuestions.length} preguntas.
            </p>
            {!passed && <p style={{ marginTop: '1rem', fontSize: '0.9rem' }}>Necesitas al menos 80% para aprobar.</p>}
          </div>
          <button className="button" onClick={() => setStep('landing')}>Volver al Inicio</button>
        </div>
      </div>
    );
  }

  return null;
}

export default App;
