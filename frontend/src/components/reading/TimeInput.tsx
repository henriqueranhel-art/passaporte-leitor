import { MinutesInput } from './MinutesInput';
import { COLORS } from './constants';

interface TimeInputProps {
    value: number;
    onChange: (val: number) => void;
    dailyGoal?: number;
}

export const TimeInput = ({ value, onChange, dailyGoal = 15 }: TimeInputProps) => {
    const goalReached = value >= dailyGoal;

    return (
        <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
                <label className="flex items-center gap-1 text-sm font-medium" style={{ color: COLORS.text }}>
                    ⏱️ Quanto tempo leste?
                </label>
            </div>

            <div className="space-y-4">
                <MinutesInput
                    value={value}
                    onChange={onChange}
                    min={5}
                    max={120}
                    step={5}
                />

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
