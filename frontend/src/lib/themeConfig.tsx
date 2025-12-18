import type { LevelCategory } from './types';

// ============================================================================
// THEME CONFIGURATIONS
// ============================================================================

export const THEME_CONFIG: Record<LevelCategory, {
    headerBg: string;
    gradient: string;
    badgeTextColor: string;
    BackgroundElements: () => JSX.Element;
}> = {
    MAGIC: {
        headerBg: '#7D3C98',
        gradient: 'linear-gradient(135deg, #9B59B6 0%, #8E44AD 50%, #6C3483 100%)',
        badgeTextColor: '#7D3C98',
        BackgroundElements: () => (
            <>
                {[...Array(12)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute text-yellow-300"
                        style={{
                            left: `${10 + Math.random() * 80}%`,
                            top: `${10 + Math.random() * 80}%`,
                            fontSize: `${8 + Math.random() * 10}px`,
                            opacity: 0.4 + Math.random() * 0.3,
                        }}
                    >
                        ✦
                    </div>
                ))}
                <div className="absolute top-2 right-4 text-xl opacity-40">✨</div>
                <div className="absolute bottom-2 left-6 text-lg opacity-30">⭐</div>
                <div className="absolute top-1/2 right-12 text-2xl opacity-25">🪄</div>
                <div className="absolute w-24 h-24 rounded-full opacity-20" style={{
                    background: 'radial-gradient(circle, rgba(255,255,255,0.5) 0%, transparent 70%)',
                    top: '-20%',
                    right: '5%',
                }} />
            </>
        ),
    },
    EXPLORERS: {
        headerBg: '#D35400',
        gradient: 'linear-gradient(135deg, #F39C12 0%, #E67E22 50%, #D35400 100%)',
        badgeTextColor: '#D35400',
        BackgroundElements: () => (
            <>
                <svg className="absolute inset-0 w-full h-full opacity-15">
                    <defs>
                        <pattern id="grid-exp-card" width="30" height="30" patternUnits="userSpaceOnUse">
                            <path d="M 30 0 L 0 0 0 30" fill="none" stroke="white" strokeWidth="1" />
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#grid-exp-card)" />
                </svg>
                <svg className="absolute inset-0 w-full h-full opacity-20">
                    <path d="M 20 60 Q 80 20 140 50 T 260 30 T 380 60" fill="none" stroke="white" strokeWidth="2" strokeDasharray="8 6" strokeLinecap="round" />
                </svg>
                <div className="absolute top-2 right-6 text-2xl opacity-30">🧭</div>
                <div className="absolute bottom-2 left-4 text-xl opacity-25">🗺️</div>
                <div className="absolute top-1/2 left-3 text-lg opacity-20">🏔️</div>
                <div className="absolute bottom-3 right-16 text-lg opacity-20">🌲</div>
            </>
        ),
    },
    KNIGHTS: {
        headerBg: '#1A5276',
        gradient: 'linear-gradient(135deg, #2980B9 0%, #1A5276 50%, #154360 100%)',
        badgeTextColor: '#1A5276',
        BackgroundElements: () => (
            <>
                <svg className="absolute inset-0 w-full h-full opacity-10">
                    <defs>
                        <pattern id="diamonds-k-card" width="50" height="35" patternUnits="userSpaceOnUse">
                            <polygon points="25,0 50,17.5 25,35 0,17.5" fill="none" stroke="white" strokeWidth="1" />
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#diamonds-k-card)" />
                </svg>
                <div className="absolute w-48 h-48 opacity-15" style={{
                    background: 'linear-gradient(135deg, transparent 40%, rgba(255,255,255,0.4) 50%, transparent 60%)',
                    top: '-40%',
                    right: '0%',
                    transform: 'rotate(-30deg)',
                }} />
                <div className="absolute top-2 right-4 text-2xl opacity-30">⚔️</div>
                <div className="absolute bottom-2 left-4 text-xl opacity-25">🛡️</div>
                <div className="absolute top-3 left-1/4 text-lg opacity-20">🏰</div>
                <div className="absolute bottom-3 right-1/4 text-lg opacity-25">👑</div>
            </>
        ),
    },
    SPACE: {
        headerBg: '#1a1a3e',
        gradient: 'linear-gradient(135deg, #2E1A47 0%, #1a1a3e 50%, #0a0a20 100%)',
        badgeTextColor: '#4338CA',
        BackgroundElements: () => (
            <>
                {[...Array(25)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute rounded-full bg-white"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            width: `${1 + Math.random() * 3}px`,
                            height: `${1 + Math.random() * 3}px`,
                            opacity: 0.3 + Math.random() * 0.5,
                        }}
                    />
                ))}
                <div className="absolute w-20 h-20 rounded-full opacity-25" style={{
                    background: 'radial-gradient(circle, rgba(147,112,219,0.5) 0%, transparent 70%)',
                    top: '10%',
                    left: '10%',
                    filter: 'blur(8px)',
                }} />
                <div className="absolute w-14 h-14 rounded-full opacity-20" style={{
                    background: 'radial-gradient(circle, rgba(100,149,237,0.5) 0%, transparent 70%)',
                    bottom: '15%',
                    right: '15%',
                    filter: 'blur(6px)',
                }} />
                <div className="absolute top-2 right-6 text-2xl opacity-40">🚀</div>
                <div className="absolute bottom-2 left-4 text-xl opacity-35">🪐</div>
                <div className="absolute top-1/2 right-1/4 text-lg opacity-30">🌙</div>
                <div className="absolute bottom-3 right-10 text-sm opacity-30">🛸</div>
            </>
        ),
    },
};
