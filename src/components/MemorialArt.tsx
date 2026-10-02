import React from 'react';

export const MemorialHeroArt: React.FC<{ className?: string }> = ({ className = 'w-full h-56 md:h-72' }) => {
  return (
    <div className={`relative overflow-hidden rounded-3xl bg-[#1C2128] text-white shadow-sm flex flex-col justify-end p-6 sm:p-10 border border-[#3A4235]/40 ${className}`}>
      {/* Mountain silhouettes & dawn glow in SVG */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none object-cover opacity-85"
        preserveAspectRatio="none"
        viewBox="0 0 1200 480"
        fill="none"
      >
        <defs>
          <linearGradient id="skyDawn" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#141820" />
            <stop offset="40%" stopColor="#252B35" />
            <stop offset="68%" stopColor="#4A3B36" />
            <stop offset="85%" stopColor="#8C5C38" />
            <stop offset="100%" stopColor="#D99B5B" />
          </linearGradient>

          <linearGradient id="sunGlow" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFF2C6" stopOpacity="0.9" />
            <stop offset="50%" stopColor="#E5A65D" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#D99B5B" stopOpacity="0" />
          </linearGradient>

          <linearGradient id="riverPath" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFE7B3" stopOpacity="0.85" />
            <stop offset="40%" stopColor="#E2B777" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#B48A50" stopOpacity="0.15" />
          </linearGradient>

          <radialGradient id="cairnGlow" cx="20%" cy="80%" r="50%">
            <stop offset="0%" stopColor="#FAF4E8" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#FAF4E8" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Sky background */}
        <rect width="1200" height="480" fill="url(#skyDawn)" />

        {/* Constellations and Stars of Promise */}
        <circle cx="160" cy="50" r="1.5" fill="#FFFFFF" opacity="0.8" />
        <circle cx="340" cy="80" r="1.2" fill="#FFFFFF" opacity="0.6" />
        <circle cx="560" cy="40" r="1.8" fill="#FFF7DE" opacity="0.9" />
        <circle cx="780" cy="65" r="1.2" fill="#FFFFFF" opacity="0.7" />
        <circle cx="980" cy="45" r="1.5" fill="#FFFFFF" opacity="0.8" />
        <circle cx="1110" cy="90" r="1" fill="#FFFFFF" opacity="0.5" />

        {/* Dawn Horizon Sun */}
        <circle cx="600" cy="300" r="95" fill="url(#sunGlow)" />

        {/* Layer 1: Distant jagged mountain ranges */}
        <path
          d="M0,320 L120,265 L260,310 L410,240 L580,300 L730,225 L880,310 L1040,250 L1200,320 L1200,480 L0,480 Z"
          fill="#1C2129"
          opacity="0.95"
        />

        {/* Layer 2: Closer mountain ridges */}
        <path
          d="M0,345 L160,285 L320,335 L480,270 L660,330 L810,260 L970,325 L1120,280 L1200,330 L1200,480 L0,480 Z"
          fill="#13171D"
        />

        {/* River Jordan glowing pathway through the dry riverbed */}
        <polygon points="596,298 604,298 940,480 260,480" fill="url(#riverPath)" opacity="0.65" />

        {/* Water ripples and golden steps */}
        <line x1="585" y1="320" x2="615" y2="320" stroke="#FFF7DE" strokeWidth="1.5" opacity="0.85" />
        <line x1="565" y1="345" x2="635" y2="345" stroke="#FFF7DE" strokeWidth="2" opacity="0.75" />
        <line x1="535" y1="380" x2="665" y2="380" stroke="#FFF7DE" strokeWidth="2.5" opacity="0.65" />
        <line x1="490" y1="425" x2="710" y2="425" stroke="#FFF7DE" strokeWidth="2.5" opacity="0.55" />

        {/* Cairn Altar (Memorial Stones Mound at Gilgal) */}
        <circle cx="150" cy="420" r="120" fill="url(#cairnGlow)" />
        {/* Natural river stones clustered */}
        <ellipse cx="140" cy="435" rx="36" ry="16" fill="#8C887B" opacity="0.9" />
        <ellipse cx="185" cy="440" rx="32" ry="14" fill="#6E6B62" opacity="0.95" />
        <ellipse cx="105" cy="442" rx="28" ry="13" fill="#58564F" opacity="0.9" />
        <ellipse cx="150" cy="418" rx="30" ry="14" fill="#B4A68F" opacity="0.95" />
        <ellipse cx="120" cy="422" rx="24" ry="12" fill="#7D7A6F" opacity="0.9" />
        <ellipse cx="170" cy="420" rx="25" ry="12" fill="#9C927F" opacity="0.9" />
        <ellipse cx="142" cy="398" rx="22" ry="11" fill="#D2C4AE" opacity="0.95" />
      </svg>

      {/* Editorial Typographic Composition */}
      <div className="relative z-10 max-w-2xl">
        <span className="text-xs font-serif italic tracking-wide text-[#EAE4D7]/85 block">
          Uma jornada de 90 dias com Josué 4
        </span>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif text-[#FAF7F0] mt-1 tracking-tight font-medium">
          Memorial dos Santos
        </h1>
        <p className="text-sm sm:text-base text-[#EAE4D7] font-serif italic mt-2 text-balance leading-relaxed">
          “Até aqui nos ajudou o Senhor.” — 1 Samuel 7:12
        </p>
      </div>
    </div>
  );
};

export const StoneIconSVG: React.FC<{ className?: string; color?: string }> = ({ 
  className = 'w-5 h-5', 
  color = 'currentColor' 
}) => {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <ellipse cx="12" cy="16.5" rx="8.5" ry="4" />
      <ellipse cx="11" cy="11.5" rx="6" ry="3.2" />
      <ellipse cx="13" cy="7.2" rx="3.8" ry="2.2" />
    </svg>
  );
};

export const TenStonesPyramidGraphic: React.FC<{
  selectedStones: Array<{ rank: number; title: string; category?: string }>;
  onSelectRank?: (rank: number) => void;
}> = ({ selectedStones, onSelectRank }) => {
  // Pyramid row layout matching PDF Page 27:
  // Row 4 (top): 10
  // Row 3: 08, 09
  // Row 2: 05, 06, 07
  // Row 1 (base): 01, 02, 03, 04
  const rows = [
    [10],
    [8, 9],
    [5, 6, 7],
    [1, 2, 3, 4],
  ];

  return (
    <div className="flex flex-col items-center gap-3.5 py-8 px-4 bg-[#FAF7F0] border border-[#EAE4D7] rounded-3xl">
      {rows.map((row, rIdx) => (
        <div key={rIdx} className="flex items-center justify-center gap-3 sm:gap-4">
          {row.map(rank => {
            const stone = selectedStones.find(s => s.rank === rank);
            const isAssigned = Boolean(stone);
            return (
              <button
                key={rank}
                type="button"
                onClick={() => onSelectRank?.(rank)}
                title={stone ? `${stone.title} (${stone.category || 'Pedra'})` : `Pedra ${String(rank).padStart(2, '0')} (Clique para definir)`}
                className={`relative group flex flex-col items-center justify-center w-16 sm:w-20 h-11 sm:h-13 transition-all duration-200 cursor-pointer border ${
                  rank % 2 === 0 ? 'stone-contour-1' : 'stone-contour-2'
                } ${
                  isAssigned
                    ? 'bg-[#B49A6A] text-white border-[#937B4E] shadow-xs hover:scale-105'
                    : 'bg-[#EAE4D7]/75 text-[#363932]/75 border-[#D9D2C3] hover:bg-[#D9D2C3]'
                }`}
              >
                <span className="font-mono text-xs font-semibold tracking-wider">
                  {String(rank).padStart(2, '0')}
                </span>
                {stone && (
                  <span className="text-[10px] truncate max-w-[56px] px-1 font-serif text-white/95">
                    {stone.title}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      ))}
      <span className="text-xs text-[#475344] font-serif italic mt-3 text-center">
        As 10 Pedras do Ano — O memorial edificado pelas mãos da gratidão
      </span>
    </div>
  );
};

