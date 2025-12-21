import { ReactNode } from 'react';

// ============================================================================
// TYPES
// ============================================================================

export interface Child {
    id: string;
    name: string;
    avatar: string;
}

export interface ChildSelectorProps {
    children: Child[];
    selectedId: string;
    onChange: (id: string) => void;
    allLabel?: string;
    allId?: string;
    renderBadge?: (child: Child) => ReactNode;
}

// ============================================================================
// CHILD SELECTOR COMPONENT
// ============================================================================

export const ChildSelector = ({
    children,
    selectedId,
    onChange,
    allLabel = 'Família',
    allId = 'all',
    renderBadge,
}: ChildSelectorProps) => {
    return (
        <div className="flex gap-2 overflow-x-auto pb-1">
            <button
                onClick={() => onChange(allId)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all flex-shrink-0 ${selectedId === allId
                        ? 'bg-orange-100 shadow-sm scale-105'
                        : 'bg-gray-100 opacity-70 hover:opacity-100'
                    }`}
            >
                <span className="text-xl">👨‍👩‍👧‍👦</span>
                <span className={`text-sm font-medium ${selectedId === allId ? 'text-orange-700' : 'text-gray-600'}`}>
                    {allLabel}
                </span>
            </button>

            {children.map((child) => {
                const isSelected = selectedId === child.id;
                return (
                    <button
                        key={child.id}
                        onClick={() => onChange(child.id)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all flex-shrink-0 ${isSelected
                                ? 'bg-orange-100 shadow-sm scale-105'
                                : 'bg-gray-100 opacity-70 hover:opacity-100'
                            }`}
                    >
                        <span className="text-xl">{child.avatar}</span>
                        <span className={`text-sm font-medium ${isSelected ? 'text-orange-700' : 'text-gray-600'}`}>
                            {child.name}
                        </span>
                        {renderBadge && renderBadge(child)}
                    </button>
                );
            })}
        </div>
    );
};
