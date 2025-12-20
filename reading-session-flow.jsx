import React, { useState } from 'react';

// ============================================================================
// DESIGN TOKENS
// ============================================================================

const COLORS = {
  primary: '#E67E22',
  primaryLight: '#F39C12',
  primaryDark: '#D35400',
  secondary: '#3498DB',
  success: '#27AE60',
  background: '#FDF6E3',
  card: '#FFFFFF',
  text: '#2C3E50',
  textLight: '#7F8C8D',
  border: '#E8E0D5',
};

// ============================================================================
// MOCK DATA - Books being read
// ============================================================================

const MOCK_BOOKS = [
  {
    id: 'b1',
    name: 'Harry Potter e a Pedra Filosofal',
    author: 'J.K. Rowling',
    genre: 'fantasy',
    genreIcon: '🧙',
    pages: 320,
    currentPage: 150,
    cover: '📕',
  },
  {
    id: 'b2',
    name: 'O Diário de um Banana',
    author: 'Jeff Kinney',
    genre: 'humor',
    genreIcon: '😂',
    pages: 224,
    currentPage: 80,
    cover: '📗',
  },
  {
    id: 'b3',
    name: 'Os Cinco na Ilha do Tesouro',
    author: 'Enid Blyton',
    genre: 'adventure',
    genreIcon: '🗺️',
    pages: 180,
    currentPage: 45,
    cover: '📘',
  },
];

// ============================================================================
// MOODS
// ============================================================================

const MOODS = [
  { value: 1, emoji: '😴', label: 'Cansado' },
  { value: 2, emoji: '😐', label: 'Meh' },
  { value: 3, emoji: '🙂', label: 'Ok' },
  { value: 4, emoji: '😊', label: 'Gostei' },
  { value: 5, emoji: '🤩', label: 'Adorei!' },
];

// ============================================================================
// HELPER - Date formatting
// ============================================================================

const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (dateStr === today.toISOString().split('T')[0]) {
    return 'Hoje';
  } else if (dateStr === yesterday.toISOString().split('T')[0]) {
    return 'Ontem';
  } else {
    return date.toLocaleDateString('pt-PT', { weekday: 'short', day: 'numeric', month: 'short' });
  }
};

const getDaysAgo = (days) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().split('T')[0];
};

// ============================================================================
// COMPONENTS
// ============================================================================

// Input Field
const InputField = ({ label, type = 'text', value, onChange, placeholder, icon, error, optional }) => (
  <div className="mb-4">
    <label className="flex items-center gap-1 text-sm font-medium mb-2" style={{ color: COLORS.text }}>
      {icon && <span>{icon}</span>}
      {label}
      {optional && <span className="text-gray-400 text-xs font-normal">(opcional)</span>}
    </label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`w-full px-4 py-3 rounded-xl border-2 transition-colors ${error ? 'border-red-400' : 'border-gray-200 focus:border-orange-400'
        } focus:outline-none`}
      style={{ color: COLORS.text }}
    />
    {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
  </div>
);

// Textarea Field
const TextareaField = ({ label, value, onChange, placeholder, icon, optional, rows = 3 }) => (
  <div className="mb-4">
    <label className="flex items-center gap-1 text-sm font-medium mb-2" style={{ color: COLORS.text }}>
      {icon && <span>{icon}</span>}
      {label}
      {optional && <span className="text-gray-400 text-xs font-normal">(opcional)</span>}
    </label>
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-orange-400 focus:outline-none resize-none"
      style={{ color: COLORS.text }}
    />
  </div>
);

// Star Rating
const StarRating = ({ value, onChange, label }) => (
  <div className="mb-4">
    <label className="flex items-center gap-1 text-sm font-medium mb-2" style={{ color: COLORS.text }}>
      ⭐ {label}
    </label>
    <div className="flex gap-2">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          onClick={() => onChange(star)}
          className={`text-3xl transition-all ${star <= value ? 'scale-110' : 'grayscale opacity-40'
            }`}
        >
          ⭐
        </button>
      ))}
    </div>
  </div>
);

// Mood Selector
const MoodSelector = ({ value, onChange }) => (
  <div className="mb-4">
    <label className="flex items-center gap-1 text-sm font-medium mb-3" style={{ color: COLORS.text }}>
      😊 Como te sentiste com a leitura?
    </label>
    <div className="flex justify-between gap-2">
      {MOODS.map((mood) => (
        <button
          key={mood.value}
          onClick={() => onChange(mood.value)}
          className={`flex-1 py-3 rounded-xl text-center transition-all ${value === mood.value
              ? 'bg-orange-100 ring-2 ring-orange-500 scale-105'
              : 'bg-gray-100 hover:bg-gray-200'
            }`}
        >
          <span className="text-2xl block">{mood.emoji}</span>
          <span className="text-xs text-gray-600 mt-1 block">{mood.label}</span>
        </button>
      ))}
    </div>
  </div>
);

// ============================================================================
// TIME INPUT COMPONENT
// ============================================================================

const TimeInput = ({ value, onChange, dailyGoal = 15 }) => {
  const [isManualMode, setIsManualMode] = useState(false);
  const [manualValue, setManualValue] = useState(value.toString());

  const presetTimes = [5, 10, 15, 20, 30, 45, 60];

  const handleSliderChange = (newValue) => {
    onChange(newValue);
    setManualValue(newValue.toString());
  };

  const handleManualChange = (input) => {
    setManualValue(input);
    const num = parseInt(input);
    if (!isNaN(num) && num >= 0 && num <= 180) {
      onChange(num);
    }
  };

  const handleManualBlur = () => {
    const num = parseInt(manualValue);
    if (isNaN(num) || num < 1) {
      setManualValue(value.toString());
    } else if (num > 180) {
      setManualValue('180');
      onChange(180);
    }
  };

  const goalReached = value >= dailyGoal;

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <label className="flex items-center gap-1 text-sm font-medium" style={{ color: COLORS.text }}>
          ⏱️ Quanto tempo leste?
        </label>
        <button
          onClick={() => setIsManualMode(!isManualMode)}
          className="text-xs text-orange-500 hover:text-orange-600 font-medium flex items-center gap-1"
        >
          {isManualMode ? (
            <>
              <span>📊</span>
              <span>Usar slider</span>
            </>
          ) : (
            <>
              <span>✏️</span>
              <span>Escrever</span>
            </>
          )}
        </button>
      </div>

      {isManualMode ? (
        <div className="space-y-4">
          <div className="flex items-center justify-center gap-3">
            <input
              type="number"
              value={manualValue}
              onChange={(e) => handleManualChange(e.target.value)}
              onBlur={handleManualBlur}
              min="1"
              max="180"
              autoFocus
              className={`w-28 text-center text-3xl font-bold bg-white border-2 rounded-xl py-3 focus:outline-none ${goalReached ? 'border-green-400 text-green-600' : 'border-orange-300 text-orange-500'
                } focus:border-orange-500`}
            />
            <span className="text-lg text-gray-500">minutos</span>
          </div>

          <p className="text-xs text-gray-400 text-center">
            Introduz um valor entre 1 e 180 minutos
          </p>

          <div className="flex flex-wrap gap-2 justify-center">
            {[15, 30, 45, 60, 90, 120].map((time) => (
              <button
                key={time}
                onClick={() => {
                  handleManualChange(time.toString());
                  onChange(time);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${value === time
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
              >
                {time}m
              </button>
            ))}
          </div>

          <div className="text-center text-sm">
            {goalReached ? (
              <span className="text-green-600 font-medium">
                ✅ Meta diária atingida! ({dailyGoal} min)
              </span>
            ) : (
              <span className="text-gray-500">
                Meta: {dailyGoal} min (faltam {dailyGoal - value} min)
              </span>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="relative pt-6 px-2">
            <div
              className={`absolute -top-1 transform -translate-x-1/2 px-2 py-1 rounded-lg text-sm font-bold text-white ${goalReached ? 'bg-green-500' : 'bg-orange-500'
                }`}
              style={{
                left: `calc(${(Math.min(value, 90) / 90) * 100}%)`,
              }}
            >
              {value}m
            </div>

            <input
              type="range"
              min="5"
              max="90"
              step="5"
              value={Math.min(value, 90)}
              onChange={(e) => handleSliderChange(parseInt(e.target.value))}
              className="w-full h-3 rounded-full appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, ${goalReached ? '#27AE60' : COLORS.primary} 0%, ${goalReached ? '#27AE60' : COLORS.primary} ${(Math.min(value, 90) / 90) * 100}%, #E5E7EB ${(Math.min(value, 90) / 90) * 100}%, #E5E7EB 100%)`,
              }}
            />

            <div
              className="absolute top-6 w-0.5 h-5 bg-gray-800 rounded-full pointer-events-none"
              style={{
                left: `calc(${(dailyGoal / 90) * 100}%)`,
              }}
            />

            <div className="flex justify-between mt-1 text-xs text-gray-400">
              <span>5 min</span>
              <span className="text-gray-600 font-medium">Meta: {dailyGoal}m</span>
              <span>90 min</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 justify-center">
            {presetTimes.map((time) => (
              <button
                key={time}
                onClick={() => handleSliderChange(time)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${value === time
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
              >
                {time}m
              </button>
            ))}
            <button
              onClick={() => setIsManualMode(true)}
              className="px-3 py-2 rounded-lg text-sm font-medium bg-gray-100 text-orange-500 hover:bg-orange-50 border border-orange-200"
            >
              +90m
            </button>
          </div>

          <div className="text-center text-sm">
            {goalReached ? (
              <span className="text-green-600 font-medium">
                ✅ Meta diária atingida!
              </span>
            ) : (
              <span className="text-gray-500">
                Faltam {dailyGoal - value} min para a meta
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// DATE SELECTOR (Today and past days only)
// ============================================================================

const DateSelector = ({ value, onChange }) => {
  const today = new Date().toISOString().split('T')[0];

  // Generate last 7 days
  const recentDays = Array.from({ length: 4 }, (_, i) => ({
    date: getDaysAgo(i),
    label: i === 0 ? 'Hoje' : i === 1 ? 'Ontem' : formatDate(getDaysAgo(i)),
    isToday: i === 0,
  }));

  const [showCustomDate, setShowCustomDate] = useState(false);
  const isRecentDay = recentDays.some(d => d.date === value);

  return (
    <div className="mb-6">
      <label className="flex items-center gap-1 text-sm font-medium mb-3" style={{ color: COLORS.text }}>
        📅 Quando leste?
      </label>

      {/* Recent days grid */}
      <div className="grid grid-cols-4 gap-2 mb-3">
        {recentDays.slice(0, 4).map((day) => (
          <button
            key={day.date}
            onClick={() => {
              onChange(day.date);
              setShowCustomDate(false);
            }}
            className={`py-3 px-2 rounded-xl text-center transition-all ${value === day.date && !showCustomDate
                ? 'bg-orange-500 text-white'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
          >
            <span className="text-xs font-medium block">{day.label}</span>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-4 gap-2 mb-3">
        {recentDays.slice(4, 7).map((day) => (
          <button
            key={day.date}
            onClick={() => {
              onChange(day.date);
              setShowCustomDate(false);
            }}
            className={`py-3 px-2 rounded-xl text-center transition-all ${value === day.date && !showCustomDate
                ? 'bg-orange-500 text-white'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
          >
            <span className="text-xs font-medium block">{day.label}</span>
          </button>
        ))}
        <button
          onClick={() => setShowCustomDate(!showCustomDate)}
          className={`py-3 px-2 rounded-xl text-center transition-all ${showCustomDate || (!isRecentDay && value)
              ? 'bg-orange-500 text-white'
              : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}
        >
          <span className="text-xs font-medium block">📆 Outra</span>
        </button>
      </div>

      {/* Custom date picker */}
      {showCustomDate && (
        <div className="bg-gray-50 rounded-xl p-3">
          <input
            type="date"
            value={value}
            max={today}
            onChange={(e) => onChange(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-orange-400 focus:outline-none"
            style={{ color: COLORS.text }}
          />
          <p className="text-xs text-gray-400 mt-2 text-center">
            Só podes registar leitura até hoje
          </p>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// BOOK SELECTOR
// ============================================================================

const BookSelector = ({ books, selectedId, onSelect }) => (
  <div className="mb-6">
    <label className="flex items-center gap-1 text-sm font-medium mb-3" style={{ color: COLORS.text }}>
      📚 Que livro leste?
    </label>

    <div className="space-y-2">
      {books.map((book) => {
        const progress = book.pages ? Math.round((book.currentPage / book.pages) * 100) : 0;

        return (
          <button
            key={book.id}
            onClick={() => onSelect(book.id)}
            className={`w-full p-3 rounded-xl text-left transition-all flex items-center gap-3 ${selectedId === book.id
                ? 'bg-orange-100 ring-2 ring-orange-500'
                : 'bg-gray-50 hover:bg-gray-100'
              }`}
          >
            {/* Book cover */}
            <div className="w-12 h-14 bg-gray-200 rounded-lg flex items-center justify-center text-2xl flex-shrink-0">
              {book.cover}
            </div>

            {/* Book info */}
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-gray-800 text-sm truncate">{book.name}</h3>
              <p className="text-xs text-gray-500 truncate">{book.author}</p>

              {/* Progress bar */}
              {book.pages && (
                <div className="mt-1.5">
                  <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-orange-400 rounded-full"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <div className="flex justify-between mt-0.5">
                    <span className="text-xs text-gray-400">Pág. {book.currentPage}</span>
                    <span className="text-xs text-orange-500">{progress}%</span>
                  </div>
                </div>
              )}
            </div>

            {/* Selection indicator */}
            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${selectedId === book.id
                ? 'border-orange-500 bg-orange-500'
                : 'border-gray-300'
              }`}>
              {selectedId === book.id && (
                <span className="text-white text-xs">✓</span>
              )}
            </div>
          </button>
        );
      })}
    </div>
  </div>
);

// ============================================================================
// PAGE UPDATE INPUT
// ============================================================================

const PageUpdateInput = ({ currentPage, totalPages, newPage, onChange }) => {
  const progress = totalPages ? Math.round((newPage / totalPages) * 100) : 0;

  return (
    <div className="mb-6">
      <label className="flex items-center gap-1 text-sm font-medium mb-3" style={{ color: COLORS.text }}>
        📄 Em que página estás agora?
      </label>

      <div className="bg-gray-50 rounded-xl p-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 flex-1">
            <span className="text-gray-400 text-sm">Pág.</span>
            <input
              type="number"
              value={newPage}
              onChange={(e) => onChange(Math.min(parseInt(e.target.value) || 0, totalPages || 9999))}
              min={currentPage}
              max={totalPages || 9999}
              className="w-20 text-center text-xl font-bold bg-white border-2 border-gray-200 rounded-lg py-2 focus:border-orange-400 focus:outline-none"
              style={{ color: COLORS.primary }}
            />
            {totalPages && (
              <span className="text-gray-400 text-sm">/ {totalPages}</span>
            )}
          </div>

          {totalPages && (
            <div className="text-right">
              <span className="text-2xl font-bold text-orange-500">{progress}%</span>
            </div>
          )}
        </div>

        {/* Progress bar */}
        {totalPages && (
          <div className="mt-3">
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-orange-400 rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex justify-between mt-1 text-xs text-gray-400">
              <span>Início</span>
              <span>{totalPages - newPage} páginas restantes</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================================================
// STEP INDICATOR
// ============================================================================

const StepIndicator = ({ currentStep, totalSteps, labels }) => (
  <div className="flex items-center justify-center gap-2 mb-6">
    {Array.from({ length: totalSteps }).map((_, i) => (
      <React.Fragment key={i}>
        <div className="flex flex-col items-center">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${i + 1 <= currentStep
                ? 'bg-orange-500 text-white'
                : 'bg-gray-200 text-gray-400'
              }`}
          >
            {i + 1 < currentStep ? '✓' : i + 1}
          </div>
          <span className={`text-xs mt-1 ${i + 1 <= currentStep ? 'text-orange-500' : 'text-gray-400'
            }`}>
            {labels[i]}
          </span>
        </div>
        {i < totalSteps - 1 && (
          <div
            className={`w-8 h-1 rounded ${i + 1 < currentStep ? 'bg-orange-500' : 'bg-gray-200'
              }`}
          />
        )}
      </React.Fragment>
    ))}
  </div>
);

// ============================================================================
// MAIN READING SESSION FLOW
// ============================================================================

const ReadingSessionFlow = () => {
  // Step management
  const [currentStep, setCurrentStep] = useState(1);

  // Step 1: Select book
  const [selectedBookId, setSelectedBookId] = useState('');

  // Step 2: Select date
  const [readingDate, setReadingDate] = useState(new Date().toISOString().split('T')[0]);

  // Step 3: Reading time & mood
  const [readingMinutes, setReadingMinutes] = useState(15);
  const [mood, setMood] = useState(0);
  const [newPage, setNewPage] = useState(0);

  // Step 4: Finished book?
  const [finishedBook, setFinishedBook] = useState(null);

  // Step 5: Book review (if finished)
  const [favoriteCharacter, setFavoriteCharacter] = useState('');
  const [review, setReview] = useState('');
  const [rating, setRating] = useState(0);

  // Errors
  const [errors, setErrors] = useState({});

  // Get selected book
  const selectedBook = MOCK_BOOKS.find(b => b.id === selectedBookId);

  // Initialize new page when book is selected
  const handleBookSelect = (bookId) => {
    setSelectedBookId(bookId);
    const book = MOCK_BOOKS.find(b => b.id === bookId);
    if (book) {
      setNewPage(book.currentPage);
    }
  };

  // Validation
  const validateStep1 = () => {
    if (!selectedBookId) {
      setErrors({ book: 'Seleciona um livro' });
      return false;
    }
    setErrors({});
    return true;
  };

  const validateStep5 = () => {
    if (rating === 0) {
      setErrors({ rating: 'Dá uma classificação ao livro' });
      return false;
    }
    setErrors({});
    return true;
  };

  // Navigation
  const nextStep = () => {
    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2);
    } else if (currentStep === 2) {
      setCurrentStep(3);
    } else if (currentStep === 3) {
      setCurrentStep(4);
    } else if (currentStep === 4) {
      if (finishedBook === true) {
        setCurrentStep(5); // Go to review
      } else if (finishedBook === false) {
        handleSubmit(); // Finish without review
      }
    } else if (currentStep === 5) {
      if (validateStep5()) {
        handleSubmit();
      }
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      if (currentStep === 5) {
        setFinishedBook(null);
      }
    }
  };

  const handleSubmit = () => {
    console.log('Submitting:', {
      bookId: selectedBookId,
      date: readingDate,
      minutes: readingMinutes,
      mood,
      newPage,
      finished: finishedBook,
      review: finishedBook ? { favoriteCharacter, review, rating } : null,
    });
    setCurrentStep(6); // Success step
  };

  // Calculate steps
  const getTotalSteps = () => {
    if (finishedBook === true) return 5;
    return 4;
  };

  const getStepLabels = () => {
    const base = ['Livro', 'Data', 'Leitura', 'Acabou?'];
    if (finishedBook === true) return [...base, 'Review'];
    return base;
  };

  // ============================================================================
  // RENDER STEPS
  // ============================================================================

  // Step 1: Select Book
  const renderStep1 = () => (
    <div>
      <h2 className="text-lg font-bold text-gray-800 mb-4">📚 Registar Leitura</h2>

      <BookSelector
        books={MOCK_BOOKS}
        selectedId={selectedBookId}
        onSelect={handleBookSelect}
      />

      {errors.book && (
        <p className="text-red-500 text-sm text-center">{errors.book}</p>
      )}
    </div>
  );

  // Step 2: Select Date
  const renderStep2 = () => (
    <div>
      <h2 className="text-lg font-bold text-gray-800 mb-4">📅 Quando leste?</h2>

      {/* Selected book reminder */}
      {selectedBook && (
        <div className="bg-gray-50 rounded-xl p-3 mb-4 flex items-center gap-3">
          <span className="text-2xl">{selectedBook.cover}</span>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-gray-800 text-sm truncate">{selectedBook.name}</p>
            <p className="text-xs text-gray-500">{selectedBook.author}</p>
          </div>
        </div>
      )}

      <DateSelector
        value={readingDate}
        onChange={setReadingDate}
      />
    </div>
  );

  // Step 3: Reading Time & Mood
  const renderStep3 = () => (
    <div>
      <h2 className="text-lg font-bold text-gray-800 mb-4">⏱️ Sessão de Leitura</h2>

      {/* Date reminder */}
      <div className="bg-orange-50 rounded-xl p-3 mb-4 text-center">
        <span className="text-sm text-orange-700">
          📅 {formatDate(readingDate)} • {selectedBook?.name}
        </span>
      </div>

      <TimeInput
        value={readingMinutes}
        onChange={setReadingMinutes}
        dailyGoal={15}
      />

      <MoodSelector
        value={mood}
        onChange={setMood}
      />

      {/* Page update */}
      {selectedBook && (
        <PageUpdateInput
          currentPage={selectedBook.currentPage}
          totalPages={selectedBook.pages}
          newPage={newPage}
          onChange={setNewPage}
        />
      )}
    </div>
  );

  // Step 4: Finished Book?
  const renderStep4 = () => (
    <div>
      <h2 className="text-lg font-bold text-gray-800 mb-4">🏁 Acabaste o livro?</h2>

      {/* Book info */}
      {selectedBook && (
        <div className="bg-gray-50 rounded-xl p-4 mb-6 text-center">
          <span className="text-4xl block mb-2">{selectedBook.cover}</span>
          <p className="font-bold text-gray-800">{selectedBook.name}</p>
          <p className="text-sm text-gray-500">{selectedBook.author}</p>
          {selectedBook.pages && (
            <p className="text-xs text-orange-500 mt-2">
              Página {newPage} de {selectedBook.pages} ({Math.round((newPage / selectedBook.pages) * 100)}%)
            </p>
          )}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => setFinishedBook(true)}
          className={`p-6 rounded-xl text-center transition-all ${finishedBook === true
              ? 'bg-green-100 ring-2 ring-green-500'
              : 'bg-gray-100 hover:bg-gray-200'
            }`}
        >
          <span className="text-4xl block mb-2">🎉</span>
          <span className="font-bold text-gray-800">Sim, acabei!</span>
        </button>

        <button
          onClick={() => setFinishedBook(false)}
          className={`p-6 rounded-xl text-center transition-all ${finishedBook === false
              ? 'bg-orange-100 ring-2 ring-orange-500'
              : 'bg-gray-100 hover:bg-gray-200'
            }`}
        >
          <span className="text-4xl block mb-2">📖</span>
          <span className="font-bold text-gray-800">Ainda não</span>
        </button>
      </div>
    </div>
  );

  // Step 5: Book Review
  const renderStep5 = () => (
    <div>
      <h2 className="text-lg font-bold text-gray-800 mb-4">🎉 Parabéns! Review do Livro</h2>

      {/* Celebration */}
      <div className="bg-green-50 rounded-xl p-4 mb-6 text-center">
        <span className="text-4xl block mb-2">📚✨</span>
        <p className="font-bold text-green-700">Terminaste "{selectedBook?.name}"!</p>
      </div>

      <InputField
        label="Personagem favorita"
        icon="👤"
        value={favoriteCharacter}
        onChange={setFavoriteCharacter}
        placeholder="Ex: Hermione Granger"
        optional
      />

      <TextareaField
        label="O que achaste do livro?"
        icon="📝"
        value={review}
        onChange={setReview}
        placeholder="Escreve aqui a tua opinião..."
        optional
        rows={3}
      />

      <StarRating
        label="Gostaste?"
        value={rating}
        onChange={setRating}
      />
      {errors.rating && <p className="text-red-500 text-xs -mt-2 mb-4">{errors.rating}</p>}
    </div>
  );

  // Step 6: Success
  const renderSuccess = () => (
    <div className="text-center py-8">
      <div className="text-6xl mb-4">{finishedBook ? '🎉' : '✅'}</div>
      <h2 className="text-2xl font-bold text-gray-800 mb-2">
        {finishedBook ? 'Livro Terminado!' : 'Leitura Registada!'}
      </h2>
      <p className="text-gray-500 mb-6">
        {finishedBook
          ? `Parabéns! Terminaste "${selectedBook?.name}"!`
          : `+${readingMinutes} minutos de leitura em ${formatDate(readingDate)}`
        }
      </p>

      {/* Summary */}
      <div className="bg-gray-50 rounded-xl p-4 text-left mb-6">
        <div className="flex items-center gap-4 mb-3">
          <div className="w-14 h-16 bg-gray-200 rounded-lg flex items-center justify-center text-2xl">
            {selectedBook?.cover}
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-gray-800">{selectedBook?.name}</h3>
            <p className="text-sm text-gray-500">{selectedBook?.author}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 border-t pt-3">
          <div className="text-center">
            <span className="text-2xl font-bold text-orange-500">{readingMinutes}</span>
            <p className="text-xs text-gray-500">minutos</p>
          </div>
          <div className="text-center">
            <span className="text-2xl">{MOODS.find(m => m.value === mood)?.emoji || '😊'}</span>
            <p className="text-xs text-gray-500">{MOODS.find(m => m.value === mood)?.label || '-'}</p>
          </div>
        </div>

        {finishedBook && rating > 0 && (
          <div className="border-t pt-3 mt-3 text-center">
            <div className="flex items-center justify-center gap-1">
              {Array.from({ length: rating }).map((_, i) => (
                <span key={i}>⭐</span>
              ))}
            </div>
          </div>
        )}
      </div>

      <button
        onClick={() => {
          setCurrentStep(1);
          setSelectedBookId('');
          setReadingDate(new Date().toISOString().split('T')[0]);
          setReadingMinutes(15);
          setMood(0);
          setNewPage(0);
          setFinishedBook(null);
          setRating(0);
          setFavoriteCharacter('');
          setReview('');
        }}
        className="w-full py-3 bg-orange-500 text-white font-bold rounded-xl hover:bg-orange-600 transition-colors"
      >
        Registar Nova Leitura
      </button>
    </div>
  );

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  return (
    <div className="min-h-screen" style={{ backgroundColor: COLORS.background }}>
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10 px-4 py-4">
        <div className="max-w-md mx-auto flex items-center gap-3">
          {currentStep > 1 && currentStep < 6 && (
            <button
              onClick={prevStep}
              className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center"
            >
              ←
            </button>
          )}
          <h1 className="text-xl font-bold text-gray-800">
            {currentStep === 6 ? '✅ Concluído' : '📝 Registar Leitura'}
          </h1>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-md mx-auto p-4">
        {/* Step indicator */}
        {currentStep < 6 && (
          <StepIndicator
            currentStep={currentStep}
            totalSteps={getTotalSteps()}
            labels={getStepLabels()}
          />
        )}

        {/* Step content */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
          {currentStep === 4 && renderStep4()}
          {currentStep === 5 && renderStep5()}
          {currentStep === 6 && renderSuccess()}
        </div>

        {/* Navigation buttons */}
        {currentStep < 6 && (
          <div className="mt-4">
            <button
              onClick={nextStep}
              disabled={
                (currentStep === 1 && !selectedBookId) ||
                (currentStep === 4 && finishedBook === null)
              }
              className={`w-full py-4 rounded-xl font-bold text-white transition-colors ${(currentStep === 1 && !selectedBookId) ||
                  (currentStep === 4 && finishedBook === null)
                  ? 'bg-gray-300 cursor-not-allowed'
                  : 'bg-orange-500 hover:bg-orange-600'
                }`}
            >
              {currentStep === 5 || (currentStep === 4 && finishedBook === false)
                ? '✓ Concluir'
                : 'Continuar →'
              }
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReadingSessionFlow;

// Export components
export { TimeInput, MoodSelector, DateSelector, BookSelector, PageUpdateInput };
