import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { booksApi, readingLogsApi } from '../lib/api';
import { Modal, Button, Input } from './ui';
import { GENRES, type Genre, type CreateBookInput } from '../lib/types';
import { useSelectedChild } from '../lib/store';
import { TimeInput, MoodSelector, COLORS } from './reading';

// TimeInput and MoodSelector now imported from './reading'
// ============================================================================
// STEP 1: BOOK INFO
// ============================================================================
const Step1BookInfo = ({ data, onChange, onNext, onCancel }: any) => {
    const isValid = data.title && data.genre;

    return (
        <div className="space-y-4">
            <div>
                <Input
                    label="Título do livro"
                    value={data.title}
                    onChange={(e) => onChange({ ...data, title: e.target.value })}
                    placeholder="Ex: Harry Potter e a Pedra Filosofal"
                    icon="📚"
                />
            </div>

            <div>
                <Input
                    label="Autor (opcional)"
                    value={data.author}
                    onChange={(e) => onChange({ ...data, author: e.target.value })}
                    placeholder="Ex: J.K. Rowling"
                    icon="✍️"
                />
            </div>

            <div>
                <label className="flex items-center gap-1 text-sm font-medium mb-2" style={{ color: COLORS.text }}>
                    <span>🎭</span>
                    Género
                </label>
                <select
                    value={data.genre || ''}
                    onChange={(e) => onChange({ ...data, genre: e.target.value as Genre })}
                    className="w-full px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-orange-400 focus:outline-none appearance-none bg-white text-lg"
                    style={{ color: data.genre ? COLORS.text : '#9CA3AF' }}
                >
                    <option value="" disabled>Seleciona o género...</option>
                    {(Object.keys(GENRES) as Genre[]).map((g) => {
                        const genreData = GENRES[g];
                        return (
                            <option key={g} value={g}>
                                {genreData.icon} {genreData.name}
                            </option>
                        );
                    })}
                </select>
            </div>

            <div>
                <Input
                    label="Número de páginas (opcional)"
                    type="number"
                    value={data.totalPages || ''}
                    onChange={(e) => onChange({ ...data, totalPages: parseInt(e.target.value) || undefined })}
                    placeholder="Ex: 250"
                    icon="📄"
                />
                <p className="text-xs text-gray-400 mt-1">Ajuda a acompanhar o progresso</p>
            </div>

            <div className="flex justify-between pt-4 gap-4">
                <Button
                    variant="secondary"
                    onClick={onCancel}
                    className="flex-1 bg-gray-100 text-gray-700 hover:bg-gray-200"
                >
                    Cancelar
                </Button>
                <Button
                    onClick={onNext}
                    disabled={!isValid}
                    className="flex-1 bg-primary text-white"
                >
                    Continuar →
                </Button>
            </div>
        </div>
    );
};

// ============================================================================
// STEP 2: READING STATUS
// ============================================================================
const Step2ReadingStatus = ({ data, onChange, onNext, onBack }: any) => {
    return (
        <div className="space-y-6">
            {/* Section Header */}
            <h2 className="text-lg font-bold text-gray-800 mb-4">📖 Estado do Livro</h2>

            {/* Status selection - Only 2 buttons */}
            <div className="grid grid-cols-2 gap-3 mb-6">
                <button
                    onClick={() => onChange({ ...data, status: 'reading' })}
                    type="button"
                    className={`p-4 rounded-xl text-center transition-all ${data.status === 'reading'
                        ? 'bg-orange-100 ring-2 ring-orange-500'
                        : 'bg-gray-100 hover:bg-gray-200'
                        }`}
                >
                    <span className="text-3xl block mb-2">📖</span>
                    <span className="font-bold text-gray-800">Estou a Ler</span>
                </button>

                <button
                    onClick={() => onChange({ ...data, status: 'finished' })}
                    type="button"
                    className={`p-4 rounded-xl text-center transition-all ${data.status === 'finished'
                        ? 'bg-green-100 ring-2 ring-green-500'
                        : 'bg-gray-100 hover:bg-gray-200'
                        }`}
                >
                    <span className="text-3xl block mb-2">✅</span>
                    <span className="font-bold text-gray-800">Já Li</span>
                </button>
            </div>

            {/* Conditional fields */}
            {data.status && (
                <div className="bg-gray-50 rounded-xl p-4">
                    <div className="mb-2.5">
                        <label className="flex items-center gap-1 text-sm font-medium mb-2" style={{ color: COLORS.text }}>
                            <span>📅</span>
                            Data de início
                        </label>
                        <input
                            type="date"
                            className="w-full px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-orange-400 focus:outline-none text-lg"
                            style={{ color: COLORS.text }}
                            value={data.startDate || new Date().toISOString().split('T')[0]}
                            onChange={(e) => onChange({ ...data, startDate: e.target.value })}
                        />
                    </div>

                    {data.status === 'finished' && (
                        <div className="mb-2.5">
                            <label className="flex items-center gap-1 text-sm font-medium mb-2" style={{ color: COLORS.text }}>
                                <span>🏁</span>
                                Data de fim
                            </label>
                            <input
                                type="date"
                                className="w-full px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-orange-400 focus:outline-none text-lg"
                                style={{ color: COLORS.text }}
                                value={data.finishDate || new Date().toISOString().split('T')[0]}
                                onChange={(e) => onChange({ ...data, finishDate: e.target.value })}
                            />
                        </div>
                    )}

                    {data.status === 'reading' && (
                        <div>
                            <label className="flex items-center gap-1 text-sm font-medium mb-2" style={{ color: COLORS.text }}>
                                <span>📄</span>
                                Página atual
                                <span className="text-gray-400 text-xs font-normal">(opcional)</span>
                            </label>
                            <input
                                type="number"
                                className="w-full px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-orange-400 focus:outline-none text-lg"
                                style={{ color: COLORS.text }}
                                value={data.currentPage || ''}
                                onChange={(e) => onChange({ ...data, currentPage: parseInt(e.target.value) || undefined })}
                                placeholder="Ex: 50"
                            />
                        </div>
                    )}
                </div>
            )}

            <div className="flex justify-between pt-4 border-t border-gray-100">
                <Button variant="secondary" onClick={onBack}>
                    ← Voltar
                </Button>
                <Button onClick={onNext}>
                    {data.status === 'finished' ? 'Continuar →' : 'Guardar ✅'}
                </Button>
            </div>
        </div>
    );
};

// ============================================================================
// STEP 3a: DID YOU READ TODAY? (for reading status)
// ============================================================================
const Step3ReadingToday = ({ data, onChange, onNext, onBack }: any) => {
    return (
        <div className="space-y-6">
            <div className="bg-orange-50 rounded-xl p-6 text-center mb-6">
                <span className="text-5xl block mb-4">🤔</span>
                <p className="text-lg font-medium text-gray-800">Leste hoje?</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <button
                    onClick={() => onChange({ ...data, readToday: true })}
                    type="button"
                    className={`p-6 rounded-xl text-center transition-all ${data.readToday === true
                        ? 'bg-green-100 ring-2 ring-green-500'
                        : 'bg-gray-100 hover:bg-gray-200'
                        }`}
                >
                    <span className="text-4xl block mb-2">😊</span>
                    <span className="font-bold text-gray-800">Sim!</span>
                </button>

                <button
                    onClick={() => onChange({ ...data, readToday: false })}
                    type="button"
                    className={`p-6 rounded-xl text-center transition-all ${data.readToday === false
                        ? 'bg-gray-200 ring-2 ring-gray-400'
                        : 'bg-gray-100 hover:bg-gray-200'
                        }`}
                >
                    <span className="text-4xl block mb-2">😴</span>
                    <span className="font-bold text-gray-800">Não</span>
                </button>
            </div>

            <div className="flex justify-between pt-4">
                <Button variant="secondary" onClick={onBack}>
                    ← Voltar
                </Button>
                <Button onClick={onNext} disabled={data.readToday === null}>
                    {data.readToday === false ? '✓ Concluir' : 'Continuar →'}
                </Button>
            </div>
        </div>
    );
};

// ============================================================================
// STEP 3b: REVIEW (for finished status)
// ============================================================================
const Step3Review = ({ data, onChange, onNext, onBack }: any) => {
    const isValid = data.rating;
    const today = new Date().toISOString().split('T')[0];
    const isEndDateToday = data.finishDate?.split('T')[0] === today;

    return (
        <div className="space-y-6">
            <div className="text-center mb-2">
                <h3 className="font-bold text-lg" style={{ color: COLORS.text }}>O que achaste?</h3>
                <p className="text-sm text-gray-500">A tua opinião é importante!</p>
            </div>

            <div className="flex justify-center gap-2 mb-6">
                {[1, 2, 3, 4, 5].map((star) => (
                    <button
                        key={star}
                        onClick={() => onChange({ ...data, rating: star })}
                        type="button"
                        className={`text-4xl transition-all ${(data.rating || 0) >= star ? 'scale-110 drop-shadow-md' : 'opacity-30 grayscale'
                            }`}
                    >
                        ⭐
                    </button>
                ))}
            </div>

            <div className="space-y-4">
                <Input
                    label="Personagem Favorita"
                    placeholder="Ex: O Raposo"
                    icon="🦊"
                    value={data.favoriteCharacter || ''}
                    onChange={(e) => onChange({ ...data, favoriteCharacter: e.target.value })}
                />

                <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: COLORS.text }}>
                        A tua crítica (opcional)
                    </label>
                    <textarea
                        className="w-full p-4 rounded-xl border-2 border-gray-200 focus:border-orange-500 outline-none h-24 resize-none"
                        placeholder="O que mais gostaste? O que aprendeste?"
                        value={data.notes || ''}
                        onChange={(e) => onChange({ ...data, notes: e.target.value })}
                    />
                </div>

                {isEndDateToday && (
                    <div className="bg-blue-50 rounded-xl p-4 text-center">
                        <span className="text-2xl">💡</span>
                        <p className="text-sm text-blue-700 mt-2">
                            Como terminaste o livro hoje, vamos registar a tua leitura a seguir!
                        </p>
                    </div>
                )}
            </div>

            <div className="flex justify-between pt-4 border-t border-gray-100">
                <Button variant="secondary" onClick={onBack}>
                    ← Voltar
                </Button>
                <Button onClick={onNext} disabled={!isValid}>
                    {isEndDateToday ? 'Continuar →' : '✓ Concluir'}
                </Button>
            </div>
        </div>
    );
};

// ============================================================================
// STEP 4: READING SESSION
// ============================================================================
const Step4ReadingSession = ({ data, onChange, onSubmit, isLoading }: any) => {
    return (
        <div className="space-y-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4">⏱️ Registo de Leitura</h2>

            <TimeInput
                value={data.readingMinutes || 15}
                onChange={(val) => onChange({ ...data, readingMinutes: val })}
                dailyGoal={15}
            />

            <MoodSelector
                value={data.mood || 0}
                onChange={(val) => onChange({ ...data, mood: val })}
            />

            <Button onClick={onSubmit} variant="success" disabled={isLoading} className="w-full">
                {isLoading ? 'A Guardar...' : '✓ Concluir 🎉'}
            </Button>
        </div>
    );
};

// ============================================================================
// SUCCESS SCREEN
// ============================================================================
const SuccessScreen = ({ data, onClose }: any) => {
    return (
        <div className="text-center py-8">
            <div className="text-6xl mb-6 animate-bounce">
                {data.status === 'finished' ? '🏆' : '📚'}
            </div>
            <h2 className="text-2xl font-bold mb-2" style={{ color: COLORS.text }}>
                {data.status === 'finished' ? 'Parabéns, Leitor!' : 'Livro Adicionado!'}
            </h2>
            <p className="text-gray-500 mb-8 max-w-xs mx-auto">
                {data.status === 'finished'
                    ? `Terminaste "${data.title}". Mais uma aventura para o teu passaporte!`
                    : `"${data.title}" já está na tua estante.`
                }
            </p>

            <div className="flex justify-center">
                <Button onClick={onClose} className="w-full max-w-xs">
                    Voltar ao Passaporte
                </Button>
            </div>
        </div>
    );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

interface AddBookModalProps {
    isOpen: boolean;
    onClose: () => void;
    child: ReturnType<typeof useSelectedChild>;
    onSuccess: () => void;
}

export function AddBookModal({ isOpen, onClose, child, onSuccess }: AddBookModalProps) {
    const [step, setStep] = useState(1);
    const [bookData, setBookData] = useState<Partial<CreateBookInput & { readToday: boolean | null; readingMinutes: number; mood: number }>>({
        status: 'to-read',
        startDate: new Date().toISOString().split('T')[0],
        readToday: null,
        readingMinutes: 15,
        mood: 0,
    });

    const createBookMutation = useMutation({
        mutationFn: booksApi.create,
    });

    const createReadingLogMutation = useMutation({
        mutationFn: readingLogsApi.create,
    });

    const handleClose = () => {
        setStep(1);
        setBookData({
            status: 'to-read',
            startDate: new Date().toISOString().split('T')[0],
            readToday: null,
            readingMinutes: 15,
            mood: 0,
        });
        onClose();
    };

    const today = new Date().toISOString().split('T')[0];
    const isEndDateToday = bookData.finishDate?.split('T')[0] === today;

    const getTotalSteps = () => {
        if (bookData.status === 'finished' && isEndDateToday) return 4;
        if (bookData.status === 'finished') return 3;
        if (bookData.status === 'reading' && bookData.readToday === true) return 4;
        return 3;
    };

    const handleSubmit = async (bookId?: string) => {
        if (!child || !bookData.title || !bookData.genre) return;

        try {
            let createdBookId = bookId;

            // Create book if not already created
            if (!createdBookId) {
                const result = await createBookMutation.mutateAsync({
                    childId: child.id,
                    title: bookData.title,
                    author: bookData.author || "Desconhecido",
                    genre: bookData.genre as Genre,
                    totalPages: bookData.totalPages,
                    status: bookData.status,
                    currentPage: bookData.currentPage,
                    startDate: bookData.startDate ? new Date(bookData.startDate).toISOString() : undefined,
                    finishDate: bookData.finishDate ? new Date(bookData.finishDate).toISOString() : undefined,
                    rating: bookData.rating,
                    notes: bookData.notes,
                    favoriteCharacter: bookData.favoriteCharacter,
                    dateRead: new Date().toISOString()
                } as CreateBookInput);
                createdBookId = result.book.id;
            }

            // Create reading session if applicable
            if ((bookData.readToday || isEndDateToday) && bookData.readingMinutes && createdBookId) {
                await createReadingLogMutation.mutateAsync({
                    childId: child.id,
                    bookId: createdBookId,
                    minutes: bookData.readingMinutes,
                    pageEnd: bookData.currentPage,
                    mood: bookData.mood || undefined,
                    finishedBook: bookData.status === 'finished' && isEndDateToday,
                    date: new Date().toISOString(),
                });
            }

            setStep(5);
            onSuccess();
        } catch (err) {
            console.error(err);
        }
    };

    const handleStepNavigation = async () => {
        if (step === 1) {
            setStep(2);
        } else if (step === 2) {
            if (bookData.status === 'to-read') {
                await handleSubmit();
                setStep(5);
            } else if (bookData.status === 'reading') {
                setStep(3);
            } else if (bookData.status === 'finished') {
                setStep(3);
            }
        } else if (step === 3) {
            if (bookData.status === 'reading') {
                if (bookData.readToday === false) {
                    await handleSubmit();
                    setStep(5);
                } else if (bookData.readToday === true) {
                    // Create book first, then go to reading session
                    const result = await createBookMutation.mutateAsync({
                        childId: child!.id,
                        title: bookData.title!,
                        author: bookData.author || "Desconhecido",
                        genre: bookData.genre as Genre,
                        totalPages: bookData.totalPages,
                        status: bookData.status,
                        currentPage: bookData.currentPage,
                        startDate: bookData.startDate ? new Date(bookData.startDate).toISOString() : undefined,
                        dateRead: new Date().toISOString()
                    } as CreateBookInput);
                    setBookData({ ...bookData, id: result.book.id } as any);
                    setStep(4);
                }
            } else if (bookData.status === 'finished') {
                if (!isEndDateToday) {
                    await handleSubmit();
                    setStep(5);
                } else {
                    // Create book first, then go to reading session
                    const result = await createBookMutation.mutateAsync({
                        childId: child!.id,
                        title: bookData.title!,
                        author: bookData.author || "Desconhecido",
                        genre: bookData.genre as Genre,
                        totalPages: bookData.totalPages,
                        status: bookData.status,
                        currentPage: bookData.currentPage,
                        startDate: bookData.startDate ? new Date(bookData.startDate).toISOString() : undefined,
                        finishDate: bookData.finishDate ? new Date(bookData.finishDate).toISOString() : undefined,
                        rating: bookData.rating,
                        notes: bookData.notes,
                        favoriteCharacter: bookData.favoriteCharacter,
                        dateRead: new Date().toISOString()
                    } as CreateBookInput);
                    setBookData({ ...bookData, id: result.book.id } as any);
                    setStep(4);
                }
            }
        } else if (step === 4) {
            await handleSubmit((bookData as any).id);
        }
    };

    if (!isOpen) return null;

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title={<span>📚 Adicionar Livro</span>}
            variant="white"
        >
            {step < 5 && (
                <div className="flex items-center justify-center gap-4 mb-8 select-none">
                    {Array.from({ length: getTotalSteps() }).map((_, i) => {
                        const s = i + 1;
                        return (
                            <React.Fragment key={s}>
                                <div
                                    className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold transition-all ${s === step ? 'bg-primary text-white shadow-lg' :
                                        s < step ? 'bg-green-500 text-white' :
                                            'bg-gray-200 text-gray-400'
                                        }`}
                                >
                                    {s < step ? '✓' : s}
                                </div>
                                {s < getTotalSteps() && (
                                    <div
                                        className={`h-1 w-12 rounded-full ${s < step ? 'bg-green-500' : 'bg-gray-200'}`}
                                    />
                                )}
                            </React.Fragment>
                        );
                    })}
                </div>
            )}

            {step === 1 && (
                <Step1BookInfo
                    data={bookData}
                    onChange={setBookData}
                    onNext={handleStepNavigation}
                    onCancel={handleClose}
                />
            )}

            {step === 2 && (
                <Step2ReadingStatus
                    data={bookData}
                    onChange={setBookData}
                    onNext={handleStepNavigation}
                    onBack={() => setStep(1)}
                />
            )}

            {step === 3 && bookData.status === 'reading' && (
                <Step3ReadingToday
                    data={bookData}
                    onChange={setBookData}
                    onNext={handleStepNavigation}
                    onBack={() => setStep(2)}
                />
            )}

            {step === 3 && bookData.status === 'finished' && (
                <Step3Review
                    data={bookData}
                    onChange={setBookData}
                    onNext={handleStepNavigation}
                    onBack={() => setStep(2)}
                />
            )}

            {step === 4 && (
                <Step4ReadingSession
                    data={bookData}
                    onChange={setBookData}
                    onSubmit={handleStepNavigation}
                    isLoading={createReadingLogMutation.isPending}
                />
            )}

            {step === 5 && (
                <SuccessScreen
                    data={bookData}
                    onClose={handleClose}
                />
            )}
        </Modal>
    );
}

