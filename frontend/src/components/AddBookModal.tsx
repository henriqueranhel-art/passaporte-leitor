import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { booksApi } from '../lib/api';
import { Modal, Button, Input } from './ui'; // Assuming Select is exported from ui
import { GENRES, type Genre, type CreateBookInput } from '../lib/types';
import clsx from 'clsx';
import { useSelectedChild } from '../lib/store';

const COLORS = {
    primary: '#E67E22',
    text: '#2C3E50',
    secondary: '#3498DB',
    success: '#27AE60',
    border: '#E0E0E0',
    background: '#FDFBF7'
};

// ============================================================================
// STEP 1: INFO - Title, Author, Genre, Pages
// ============================================================================
const Step1BookInfo = ({ data, onChange, onNext, onCancel }: any) => {
    // Author is now optional in this UI step, but validation logic might still be desired by user preference
    // Based on "style provided", we allow it to be empty here? The backend allows optional pages but not author. 
    // We will assume backend update is coming or we enforce it here but show "optional" in label.
    // Actually, I will enforced title but let author be empty if user insists, risking backend error? 
    // No, I should make it required if backend requires it.
    // Wait, I updated backend to be optional? No, I decided to update backend but haven't done it yet.
    // I will check task status. I haven't updated backend yet. I will enforce it for now or update backend next.
    // For UI match:
    const isValid = data.title && data.genre;

    return (
        <div className="space-y-6">
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

            {/* Genre Grid */}
            <div>
                <label className="block text-sm font-medium mb-2 text-gray-800">
                    Género / Território
                </label>
                <div className="grid grid-cols-4 gap-2">
                    {(Object.keys(GENRES) as Genre[]).map((g) => {
                        const genreData = GENRES[g];
                        const isSelected = data.genre === g;
                        return (
                            <button
                                key={g}
                                onClick={() => onChange({ ...data, genre: g })}
                                className={clsx(
                                    "p-3 rounded-2xl border transition-all flex flex-col items-center justify-center gap-2 aspect-square",
                                    isSelected ? "shadow-md ring-2 ring-primary border-transparent" : "border-transparent bg-gray-50 hover:bg-gray-100"
                                )}
                                style={{
                                    // Apply custom text color based on genre color if selected or hovered?
                                    // The design shows colored text.
                                }}
                            >
                                <span className="text-3xl">{genreData.icon}</span>
                                <span
                                    className="text-xs font-bold"
                                    style={{ color: genreData.color }}
                                >
                                    {genreData.name}
                                </span>
                            </button>
                        );
                    })}
                </div>
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
// STEP 2: STATUS - To Read, Reading, Finished
// ============================================================================
const Step2ReadingStatus = ({ data, onChange, onNext, onBack }: any) => {
    return (
        <div className="space-y-6">
            <div className="text-center mb-6">
                <h3 className="font-bold text-lg" style={{ color: COLORS.text }}>{data.title}</h3>
                <p className="text-sm text-gray-500">{data.author}</p>
            </div>

            {/* Status Selection */}
            <div className="grid grid-cols-3 gap-3">
                {[
                    { id: 'to-read', label: 'Vou ler', icon: '📋', color: '#3498DB' },
                    { id: 'reading', label: 'Estou a ler', icon: '📖', color: '#F39C12' },
                    { id: 'finished', label: 'Jà li!', icon: '✅', color: '#27AE60' },
                ].map((s) => (
                    <button
                        key={s.id}
                        onClick={() => onChange({ ...data, status: s.id })}
                        className={clsx(
                            "p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2",
                            data.status === s.id ? "ring-2 ring-offset-2" : "opacity-60 hover:opacity-100 bg-white"
                        )}
                        style={{
                            borderColor: data.status === s.id ? s.color : '#e5e7eb',
                            backgroundColor: data.status === s.id ? `${s.color}10` : 'white'
                        }}
                    >
                        <span className="text-3xl">{s.icon}</span>
                        <span className="font-bold text-sm" style={{ color: data.status === s.id ? s.color : 'gray' }}>
                            {s.label}
                        </span>
                    </button>
                ))}
            </div>

            {/* Conditional Inputs */}
            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                {data.status === 'to-read' && (
                    <div className="text-center text-gray-500 py-4">
                        <p>Boa escolha! O livro vai para a tua lista de desejos.</p>
                    </div>
                )}

                {data.status === 'reading' && (
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Comecei dia</label>
                                <input
                                    type="date"
                                    className="w-full px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-orange-500 outline-none"
                                    value={data.startDate || new Date().toISOString().split('T')[0]} // Default today
                                    onChange={(e) => onChange({ ...data, startDate: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Página atual</label>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="number"
                                        className="w-full px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-orange-500 outline-none"
                                        value={data.currentPage || ''}
                                        onChange={(e) => onChange({ ...data, currentPage: parseInt(e.target.value) })}
                                        placeholder="0"
                                    />
                                    <span className="text-xs text-gray-400 font-medium">/ {data.totalPages}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {data.status === 'finished' && (
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Comecei dia</label>
                                <input
                                    type="date"
                                    className="w-full px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-orange-500 outline-none"
                                    value={data.startDate || ''}
                                    onChange={(e) => onChange({ ...data, startDate: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Acabei dia</label>
                                <input
                                    type="date"
                                    className="w-full px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-orange-500 outline-none"
                                    value={data.finishDate || new Date().toISOString().split('T')[0]}
                                    onChange={(e) => onChange({ ...data, finishDate: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>

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
// STEP 3: REVIEW - Rating, Character, Opinion
// ============================================================================
const Step3Review = ({ data, onChange, onSubmit, onBack, isLoading }: any) => {
    const isValid = data.rating;

    return (
        <div className="space-y-6">
            <div className="text-center mb-2">
                <h3 className="font-bold text-lg" style={{ color: COLORS.text }}>O que achaste?</h3>
                <p className="text-sm text-gray-500">A tua opinião é importante!</p>
            </div>

            {/* Rating */}
            <div className="flex justify-center gap-2 mb-6">
                {[1, 2, 3, 4, 5].map((star) => (
                    <button
                        key={star}
                        onClick={() => onChange({ ...data, rating: star })}
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

                <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl border border-blue-100">
                    <input
                        type="checkbox"
                        id="recommend"
                        className="w-5 h-5 text-orange-500 rounded focus:ring-orange-500"
                        checked={data.recommended || false}
                        onChange={(e) => onChange({ ...data, recommended: e.target.checked })}
                    />
                    <label htmlFor="recommend" className="font-medium text-gray-700 cursor-pointer select-none">
                        Recomendarias este livro a um amigo?
                    </label>
                </div>
            </div>

            <div className="flex justify-between pt-4 border-t border-gray-100">
                <Button variant="secondary" onClick={onBack}>
                    ← Voltar
                </Button>
                <Button onClick={onSubmit} variant="success" disabled={!isValid || isLoading}>
                    {isLoading ? 'A Guardar...' : 'Concluir 🎉'}
                </Button>
            </div>
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

            <Button onClick={onClose} className="w-full max-w-xs">
                Voltar ao Passaporte
            </Button>
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
    const [bookData, setBookData] = useState<Partial<CreateBookInput>>({
        status: 'to-read',
        startDate: new Date().toISOString().split('T')[0]
    });

    const createBookMutation = useMutation({
        mutationFn: booksApi.create,
    });

    const handleClose = () => {
        setStep(1);
        setBookData({ status: 'to-read', startDate: new Date().toISOString().split('T')[0] });
        onClose();
    };

    const handleSubmit = async () => {
        if (!child || !bookData.title || !bookData.genre) return; // Author removed from requirement check

        try {
            await createBookMutation.mutateAsync({
                childId: child.id,
                title: bookData.title,
                author: bookData.author || "Desconhecido", // Fallback for now until backend updated
                genre: bookData.genre as Genre,
                totalPages: bookData.totalPages,
                status: bookData.status,
                currentPage: bookData.currentPage,
                startDate: bookData.startDate ? new Date(bookData.startDate).toISOString() : undefined,
                finishDate: bookData.finishDate ? new Date(bookData.finishDate).toISOString() : undefined,
                rating: bookData.rating,
                notes: bookData.notes,
                favoriteCharacter: bookData.favoriteCharacter,
                recommended: bookData.recommended,
                dateRead: new Date().toISOString()
            } as CreateBookInput);

            setStep(4);
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
            title={<span>📚 Adicionar Livro</span>}
            variant="white"
        >
            {step < 4 && (
                <div className="flex items-center justify-center gap-4 mb-8 select-none">
                    {[1, 2, 3].map((s) => (
                        <React.Fragment key={s}>
                            <div
                                className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold transition-all ${s === step ? 'bg-primary text-white shadow-lg' :
                                    s < step ? 'bg-green-500 text-white' :
                                        'bg-gray-200 text-gray-400'
                                    }`}
                            >
                                {s < step ? '✓' : s}
                            </div>
                            {s < 3 && (
                                <div
                                    className={`h-1 w-12 rounded-full ${s < step ? 'bg-green-500' : 'bg-gray-200'}`}
                                />
                            )}
                        </React.Fragment>
                    ))}
                </div>
            )}

            {step === 1 && (
                <Step1BookInfo
                    data={bookData}
                    onChange={setBookData}
                    onNext={() => setStep(2)}
                    onCancel={handleClose}
                />
            )}

            {/* Step 2 and 3 render logic remains same */}
            {step === 2 && (
                <Step2ReadingStatus
                    data={bookData}
                    onChange={setBookData}
                    onNext={() => {
                        if (bookData.status === 'finished') {
                            setStep(3);
                        } else {
                            handleSubmit();
                        }
                    }}
                    onBack={() => setStep(1)}
                />
            )}

            {step === 3 && (
                <Step3Review
                    data={bookData}
                    onChange={setBookData}
                    onSubmit={handleSubmit}
                    onBack={() => setStep(2)}
                    isLoading={createBookMutation.isPending}
                />
            )}

            {step === 4 && (
                <SuccessScreen
                    data={bookData}
                    onClose={handleClose}
                />
            )}
        </Modal>
    );
}

