import { useState } from 'react';
import { COLORS } from './constants';

interface TimeInputProps {
    value: number;
    onChange: (val: number) => void;
    dailyGoal?: number;
}

export const TimeInput = ({ value, onChange, dailyGoal = 15 }: TimeInputProps) => {
    const [isManualMode, setIsManualMode] = useState(false);
    const [manualValue, setManualValue] = useState(value.toString());

    const presetTimes = [5, 10, 15, 20, 30, 45, 60];

    const handleSliderChange = (newValue: number) => {
        onChange(newValue);
        setManualValue(newValue.toString());
    };

    const handleManualChange = (input: string) => {
        setManualValue(input);
        const num = parseInt(input);
        if (!isNaN(num) && num >= 0 && num <= 120) {
            onChange(num);
        }
    };

    const handleManualBlur = () => {
        const num = parseInt(manualValue);
        if (isNaN(num) || num < 1) {
            setManualValue(value.toString());
        } else if (num > 120) {
            setManualValue('120');
            onChange(120);
        }
    };

    const goalReached = value >= dailyGoal;

    return (
        <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
                <label className="flex items-center gap-1 text-sm font-medium" style={{ color: COLORS.text }}>
                    ⏱️ Quanto tempo leste?
                </label>
            </div>

            <div className="space-y-4">
                <div className="flex items-center justify-center gap-3">
                    <input
                        type="number"
                        value={manualValue}
                        onChange={(e) => handleManualChange(e.target.value)}
                        onBlur={handleManualBlur}
                        min="1"
                        max="120"
                        autoFocus
                        className={`w-28 text-center text-3xl font-bold bg-white border-2 rounded-xl py-3 focus:outline-none ${goalReached ? 'border-green-400 text-green-600' : 'border-orange-300 text-orange-500'
                            } focus:border-orange-500`}
                    />
                    <span className="text-lg text-gray-500">minutos</span>
                </div>

                <p className="text-xs text-gray-400 text-center">
                    Introduz um valor entre 1 e 120 minutos
                </p>

                <div className="flex flex-wrap gap-2 justify-center">
                    {[5, 10, 15, 30, 45, 60, 90, 120].map((time) => (
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
        </div>
    );
};
