import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Modal, Button } from '../components/ui';
import clsx from 'clsx';
import type { Child } from '../lib/types';

const COLORS = {
    primary: '#E67E22',
    text: '#2C3E50',
    secondary: '#3498DB',
    success: '#27AE60',
    border: '#E0E0E0',
    background: '#FDFBF7'
};

const MOOD_OPTIONS = [
    { value: 1, emoji: '😫', label: 'Difícil' },
    { value: 2, emoji: '😐', label: 'OK' },
    { value: 3, emoji: '🙂', label: 'Bom' },
    { value: 4, emoji: '😊', label: 'Muito Bom' },
    { value: 5, emoji: '🤩', label: 'Incrível!' },
];

// TypeScript Interfaces
interface SessionData {
    bookId?: string;
    selectedBook?: Child['currentBooks'][0];
    minutes?: number;
    pageEnd?: number;
    mood?: number;
    finishedBook?: boolean;
}

interface StepProps {
    data: SessionData;
    onChange: (data: SessionData) => void;
    onNext: () => void;
    onCancel?: () => void;
    onBack?: () => void;
}

interface Step1Props extends StepProps {
    currentBooks: Child['currentBooks'];
}

interface Step5Props extends Omit<StepProps, 'onNext'> {
    onSubmit: () => void;
    isLoading: boolean;
}

interface SuccessProps {
    data: SessionData;
    onClose: () => void;
}

interface LogReadingModalProps {
    isOpen: boolean;
    onClose: () => void;
    child: Child | null;
    currentBooks: Child['currentBooks'];
    onSuccess: () => void;
}

// Step 1: Select Book
const Step1SelectBook = ({ data, onChange, onNext, onCancel, currentBooks }: Step1Props) => {
    const hasBooks = currentBooks && currentBooks.length > 0;

    if (!hasBooks) {
        return (
            <div className="text-center py-8">
                <span className="text-6xl mb-4 block">📚</span>
                <h3 className="text-xl font-bold mb-2" style={{ color: COLORS.text }}>
                    Nenhum livro em progresso
                </h3>
                <p className="text-gray-500 mb-6">
                    Adiciona um livro primeiro para registar a leitura.
                </p>
                <Button onClick={onCancel} variant="secondary">
                    Voltar
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="text-center mb-4">
                <h3 className="text-lg font-bold" style={{ color: COLORS.text }}>
                    Que livro leste hoje?
                </h3>
                <p className="text-sm text-gray-500">Seleciona o livro</p>
            </div>

            <div className="space-y-3">
                {currentBooks.map((book) => (
                    <button
                        key={book.id}
                        onClick={() => onChange({ ...data, bookId: book.id, selectedBook: book })}
                        className={clsx(
                            "w-full p-4 rounded-xl border-2 transition-all flex items-center gap-3 text-left",
                            data.bookId === book.id
                                ? "border-primary bg-orange-50"
                                : "border-gray-200 hover:border-gray-300"
                        )}
                    >
                        <div
                            className="w-12 h-16 rounded-lg flex items-center justify-center text-2xl flex-shrink-0"
                            style={{ backgroundColor: '#f0f0f0' }}
                        >
                            📖
                        </div>
                        <div className="flex-1 min-w-0">
                            <h4 className="font-bold truncate" style={{ color: COLORS.text }}>
                                {book.title}
                            </h4>
                            <p className="text-sm text-gray-500 truncate">{book.author}</p>
                        </div>
                        {data.bookId === book.id && (
                            <span className="text-primary text-xl">✓</span>
                        )}
                    </button>
                ))}
            </div>

            <div className="flex gap-3 pt-4">
                <Button variant="secondary" onClick={onCancel} className="flex-1">
                    Cancelar
                </Button>
                <Button onClick={onNext} disabled={!data.bookId} className="flex-1">
                    Continuar →
                </Button>
            </div>
        </div>
    );
};

// Step 2: Enter Minutes
const Step2EnterMinutes = ({ data, onChange, onNext, onBack }: StepProps) => {
    const quickMinutes = [15, 30, 45, 60];

    return (
        <div className="space-y-6">
            <div className="text-center mb-4">
                <h3 className="text-lg font-bold" style={{ color: COLORS.text }}>
                    Quanto tempo leste?
                </h3>
                <p className="text-sm text-gray-500">Em minutos</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
                {quickMinutes.map((min) => (
                    <button
                        key={min}
                        onClick={() => onChange({ ...data, minutes: min })}
                        className={clsx(
                            "p-4 rounded-xl border-2 transition-all",
                            data.minutes === min
                                ? "border-primary bg-orange-50"
                                : "border-gray-200 hover:border-gray-300"
                        )}
                    >
                        <span className="text-2xl block mb-1">⏱️</span>
                        <span className="font-bold" style={{ color: COLORS.text }}>{min} min</span>
                    </button>
                ))}
            </div>

            <div className="relative">
                <label className="block text-sm font-medium mb-2" style={{ color: COLORS.text }}>
                    Ou escreve o tempo exato
                </label>
                <input
                    type="number"
                    min="1"
                    value={data.minutes || ''}
                    onChange={(e) => onChange({ ...data, minutes: parseInt(e.target.value) || undefined })}
                    placeholder="Ex: 25"
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary outline-none text-center text-2xl font-bold"
                />
            </div>

            <div className="flex gap-3 pt-4">
                <Button variant="secondary" onClick={onBack}>
                    ← Voltar
                </Button>
                <Button onClick={onNext} disabled={!data.minutes || data.minutes < 1} className="flex-1">
                    Continuar →
                </Button>
            </div>
        </div>
    );
};

// Step 3: Page Progress (Optional)
const Step3PageProgress = ({ data, onChange, onNext, onBack }: StepProps) => {
    const book = data.selectedBook;
    const hasPageTracking = book?.totalPages && book.totalPages > 0;

    return (
        <div className="space-y-6">
            <div className="text-center mb-4">
                <h3 className="text-lg font-bold" style={{ color: COLORS.text }}>
                    Em que página estás?
                </h3>
                <p className="text-sm text-gray-500">(Opcional)</p>
            </div>

            {hasPageTracking && (
                <div className="text-center p-4 bg-gray-50 rounded-xl">
                    <p className="text-sm text-gray-500">Total de páginas</p>
                    <p className="text-3xl font-bold" style={{ color: COLORS.text }}>
                        {book.totalPages}
                    </p>
                </div>
            )}

            <div>
                <input
                    type="number"
                    min="1"
                    max={book?.totalPages || undefined}
                    value={data.pageEnd || ''}
                    onChange={(e) => onChange({ ...data, pageEnd: parseInt(e.target.value) || undefined })}
                    placeholder={hasPageTracking ? `1-${book.totalPages}` : "Página atual"}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary outline-none text-center text-2xl font-bold"
                />
            </div>

            <button
                onClick={() => onChange({ ...data, pageEnd: undefined })}
                className="w-full text-sm text-gray-500 hover:text-gray-700"
            >
                Não sei / Não quero registar
            </button>

            <div className="flex gap-3 pt-4">
                <Button variant="secondary" onClick={onBack}>
                    ← Voltar
                </Button>
                <Button onClick={onNext} className="flex-1">
                    Continuar →
                </Button>
            </div>
        </div>
    );
};

// Step 4: Mood
const Step4Mood = ({ data, onChange, onNext, onBack }: StepProps) => {
    return (
        <div className="space-y-6">
            <div className="text-center mb-4">
                <h3 className="text-lg font-bold" style={{ color: COLORS.text }}>
                    Como foi a leitura?
                </h3>
                <p className="text-sm text-gray-500">Como te sentiste?</p>
            </div>

            <div className="flex justify-center gap-2">
                {MOOD_OPTIONS.map((mood) => (
                    <button
                        key={mood.value}
                        onClick={() => onChange({ ...data, mood: mood.value })}
                        className={clsx(
                            "flex flex-col items-center p-3 rounded-xl transition-all",
                            data.mood === mood.value
                                ? "bg-primary-light scale-110"
                                : "opacity-60 hover:opacity-100"
                        )}
                    >
                        <span className="text-4xl mb-1">{mood.emoji}</span>
                        <span className="text-xs font-medium text-gray-600">{mood.label}</span>
                    </button>
                ))}
            </div>

            <div className="flex gap-3 pt-4">
                <Button variant="secondary" onClick={onBack}>
                    ← Voltar
                </Button>
                <Button onClick={onNext} className="flex-1">
                    Continuar →
                </Button>
            </div>
        </div>
    );
};

// Step 5: Finished Book?
const Step5FinishedBook = ({ data, onChange, onSubmit, onBack, isLoading }: Step5Props) => {
    const book = data.selectedBook;

    return (
        <div className="space-y-6">
            <div className="text-center mb-4">
                <h3 className="text-lg font-bold" style={{ color: COLORS.text }}>
                    Terminaste este livro?
                </h3>
                <p className="text-sm text-gray-500">{book?.title}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <button
                    onClick={() => onChange({ ...data, finishedBook: false })}
                    className={clsx(
                        "p-6 rounded-xl border-2 transition-all flex flex-col items-center gap-2",
                        data.finishedBook === false
                            ? "border-primary bg-orange-50"
                            : "border-gray-200 hover:border-gray-300"
                    )}
                >
                    <span className="text-4xl">📖</span>
                    <span className="font-bold" style={{ color: COLORS.text }}>Ainda não</span>
                </button>

                <button
                    onClick={() => onChange({ ...data, finishedBook: true })}
                    className={clsx(
                        "p-6 rounded-xl border-2 transition-all flex flex-col items-center gap-2",
                        data.finishedBook === true
                            ? "border-success bg-green-50"
                            : "border-gray-200 hover:border-gray-300"
                    )}
                >
                    <span className="text-4xl">🎉</span>
                    <span className="font-bold" style={{ color: COLORS.text }}>Sim!</span>
                </button>
            </div>

            {data.finishedBook === true && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center animate-pulse">
                    <span className="text-3xl block mb-2">🏆</span>
                    <p className="font-bold text-green-800">Parabéns! Mais um livro concluído!</p>
                </div>
            )}

            <div className="flex gap-3 pt-4">
                <Button variant="secondary" onClick={onBack}>
                    ← Voltar
                </Button>
                <Button
                    onClick={onSubmit}
                    variant={data.finishedBook ? "success" : "primary"}
                    disabled={data.finishedBook === undefined || isLoading}
                    className="flex-1"
                >
                    {isLoading ? 'A Guardar...' : 'Concluir ✅'}
                </Button>
            </div>
        </div>
    );
};

// Success Screen
const SuccessScreen = ({ data, onClose }: SuccessProps) => {
    return (
        <div className="text-center py-8">
            <div className="text-6xl mb-6 animate-bounce">
                {data.finishedBook ? '🏆' : '✅'}
            </div>
            <h2 className="text-2xl font-bold mb-2" style={{ color: COLORS.text }}>
                {data.finishedBook ? 'Livro Terminado!' : 'Sessão Registada!'}
            </h2>
            <p className="text-gray-500 mb-2">
                {data.minutes} minutos de leitura
            </p>
            {data.finishedBook && (
                <p className="text-green-600 font-bold mb-6">
                    🎉 Parabéns por terminares "{data.selectedBook?.title}"!
                </p>
            )}

            <div className="flex justify-center">
                <Button onClick={onClose} className="w-full max-w-xs">
                    Voltar ao Passaporte
                </Button>
            </div>
        </div>
    );
};

// Main Component
export function LogReadingModal({ isOpen, onClose, child, currentBooks, onSuccess }: LogReadingModalProps) {
    const [step, setStep] = useState(1);
    const [sessionData, setSessionData] = useState<SessionData>({
        mood: 3 // Default mood
    });


    const createSessionMutation = useMutation({
        mutationFn: async () => {
            const response = await fetch('/api/reading-logs', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                },
                body: JSON.stringify({
                    childId: child?.id,
                    bookId: sessionData.bookId,
                    minutes: sessionData.minutes,
                    pageEnd: sessionData.pageEnd,
                    mood: sessionData.mood,
                    finishedBook: sessionData.finishedBook || false,
                })
            });
            if (!response.ok) throw new Error('Failed to create session');
            return response.json();
        }
    });

    const handleClose = () => {
        setStep(1);
        setSessionData({ mood: 3 });
        onClose();
    };

    const handleSubmit = async () => {
        if (!child || !sessionData.bookId) return;

        try {
            await createSessionMutation.mutateAsync();

            setStep(6); // Success screen
            onSuccess();
        } catch (err) {
            console.error(err);
        }
    };

    if (!isOpen) return null;

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title={<span>📝 Registar Leitura</span>}
            variant="white"
        >
            {step < 6 && (
                <div className="flex items-center justify-center gap-4 mb-8">
                    {[1, 2, 3, 4, 5].map((s) => (
                        <React.Fragment key={s}>
                            <div
                                className={clsx(
                                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all",
                                    s === step ? 'bg-primary text-white' :
                                        s < step ? 'bg-green-500 text-white' :
                                            'bg-gray-200 text-gray-400'
                                )}
                            >
                                {s < step ? '✓' : s}
                            </div>
                            {s < 5 && (
                                <div className={clsx("h-1 w-8 rounded-full", s < step ? 'bg-green-500' : 'bg-gray-200')} />
                            )}
                        </React.Fragment>
                    ))}
                </div>
            )}

            {step === 1 && (
                <Step1SelectBook
                    data={sessionData}
                    onChange={setSessionData}
                    onNext={() => setStep(2)}
                    onCancel={handleClose}
                    currentBooks={currentBooks}
                />
            )}

            {step === 2 && (
                <Step2EnterMinutes
                    data={sessionData}
                    onChange={setSessionData}
                    onNext={() => setStep(3)}
                    onBack={() => setStep(1)}
                />
            )}

            {step === 3 && (
                <Step3PageProgress
                    data={sessionData}
                    onChange={setSessionData}
                    onNext={() => setStep(4)}
                    onBack={() => setStep(2)}
                />
            )}

            {step === 4 && (
                <Step4Mood
                    data={sessionData}
                    onChange={setSessionData}
                    onNext={() => setStep(5)}
                    onBack={() => setStep(3)}
                />
            )}

            {step === 5 && (
                <Step5FinishedBook
                    data={sessionData}
                    onChange={setSessionData}
                    onSubmit={handleSubmit}
                    onBack={() => setStep(4)}
                    isLoading={createSessionMutation.isPending}
                />
            )}

            {step === 6 && (
                <SuccessScreen
                    data={sessionData}
                    onClose={handleClose}
                />
            )}
        </Modal>
    );
}
