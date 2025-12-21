import { COLORS } from './constants';

interface MinutesInputProps {
    value: number;
    onChange: (minutes: number) => void;
    min?: number;
    max?: number;
    step?: number;
}

export const MinutesInput = ({
    value,
    onChange,
    min = 5,
    max = 120,
    step = 5
}: MinutesInputProps) => {
    return (
        <div>
            <div className="flex items-center gap-3">
                <input
                    type="range"
                    min={min}
                    max={max}
                    step={step}
                    value={value}
                    onChange={(e) => onChange(parseInt(e.target.value))}
                    className="flex-1 h-2 rounded-full appearance-none bg-gray-200"
                    style={{
                        background: `linear-gradient(to right, ${COLORS.primary} 0%, ${COLORS.primary} ${((value - min) / (max - min)) * 100}%, #E5E7EB ${((value - min) / (max - min)) * 100}%, #E5E7EB 100%)`
                    }}
                />
                <input
                    type="number"
                    value={value}
                    onChange={(e) => onChange(Math.max(min, Math.min(max, parseInt(e.target.value) || 0)))}
                    className="w-20 px-3 py-2 rounded-lg border border-gray-200 text-center font-bold text-orange-500"
                />
            </div>
        </div>
    );
};
