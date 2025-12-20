import { COLORS, MOODS } from './constants';

interface MoodSelectorProps {
    value: number;
    onChange: (mood: number) => void;
}

export const MoodSelector = ({ value, onChange }: MoodSelectorProps) => (
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
