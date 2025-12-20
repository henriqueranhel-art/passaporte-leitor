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
