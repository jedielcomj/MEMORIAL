import React from 'react';

export const MemorialHeroArt: React.FC<{ className?: string }> = ({ className = 'w-full h-48 md:h-64' }) => {
  return (
    <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-b from-[#1E232A] via-[#383B32] to-[#604938] text-white shadow-sm flex flex-col justify-end p-6 md:p-8 ${className}`}>
      {/* Mountain silhouettes & dawn glow in SVG */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none object-cover opacity-60"
        preserveAspectRatio="none"
        viewBox="0 0 1000 400"
        fill="none"
      >
        <defs>
          <linearGradient id="skyDawn" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#121820" />
            <stop offset="50%" stopColor="#2E3436" />
            <stop offset="75%" stopColor="#8C6542" />
            <stop offset="100%" stopColor="#D99B5B" />
          </linearGradient>
          <linearGradient id="sunGlow" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#F7DF94" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#D99B5B" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="roadGold" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFE0A3" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#C99757" stopOpacity="0.1" />
          </linearGradient>
        </defs>

        {/* Sky background */}
        <rect width="1000" height="400" fill="url(#skyDawn)" />

        {/* Stars */}
        <circle cx="120" cy="40" r="1.5" fill="#FFFFFF" opacity="0.6" />
        <circle cx="280" cy="70" r="1" fill="#FFFFFF" opacity="0.5" />
        <circle cx="450" cy="30" r="1.2" fill="#FFFFFF" opacity="0.7" />
        <circle cx="720" cy="50" r="1" fill="#FFFFFF" opacity="0.4" />
        <circle cx="890" cy="65" r="1.5" fill="#FFFFFF" opacity="0.6" />

        {/* Dawn sun behind mountains */}
        <circle cx="500" cy="240" r="70" fill="url(#sunGlow)" />

        {/* Mountains background */}
        <path d="M0,260 L90,210 L210,250 L340,190 L480,240 L620,180 L760,250 L880,200 L1000,260 L1000,400 L0,400 Z" fill="#20252A" opacity="0.8" />
        <path d="M0,280 L140,230 L290,270 L430,220 L580,270 L710,215 L860,265 L1000,270 L1000,400 L0,400 Z" fill="#14181D" />

        {/* Path across Jordan river */}
        <polygon points="495,240 505,240 760,400 240,400" fill="url(#roadGold)" opacity="0.45" />

        {/* Ripple reflections */}
        <line x1="480" y1="265" x2="520" y2="265" stroke="#FFF0D0" strokeWidth="1.5" opacity="0.7" />
        <line x1="465" y1="290" x2="535" y2="290" stroke="#FFF0D0" strokeWidth="1.5" opacity="0.6" />
        <line x1="440" y1="320" x2="560" y2="320" stroke="#FFF0D0" strokeWidth="2" opacity="0.6" />
        <line x1="410" y1="355" x2="590" y2="355" stroke="#FFF0D0" strokeWidth="2" opacity="0.5" />
      </svg>

      {/* Decorative Stones Memorial Cluster in bottom left */}
      <div className="relative z-10 max-w-2xl">
        <span className="text-[11px] tracking-[0.25em] uppercase text-[#E5DECE]/80 font-medium">
          Josué 4 · 1 Samuel 7:12
        </span>
        <h1 className="text-3xl md:text-4xl font-serif font-normal text-[#F4F0E7] mt-1 tracking-tight">
          Memorial dos Santos
        </h1>
        <p className="text-sm md:text-base text-[#E5DECE] font-serif italic mt-1 text-balance">
          “Até aqui nos ajudou o Senhor.” — Para lembrar, discernir e construir com Deus.
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
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <ellipse cx="12" cy="16" rx="8" ry="4.5" />
      <ellipse cx="11" cy="11.5" rx="5.5" ry="3.5" />
      <ellipse cx="13" cy="7.5" rx="3.5" ry="2.2" />
    </svg>
  );
};

export const TenStonesPyramidGraphic: React.FC<{
  selectedStones: Array<{ rank: number; title: string; category?: string }>;
  onSelectRank?: (rank: number) => void;
}> = ({ selectedStones, onSelectRank }) => {
  // Pyramid row layout:
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
    <div className="flex flex-col items-center gap-3 py-6 px-4 bg-[#F4F0E7]/60 border border-[#E5DECE] rounded-2xl">
      {rows.map((row, rIdx) => (
        <div key={rIdx} className="flex items-center justify-center gap-2 sm:gap-3">
          {row.map(rank => {
            const stone = selectedStones.find(s => s.rank === rank);
            const isAssigned = Boolean(stone);
            return (
              <button
                key={rank}
                type="button"
                onClick={() => onSelectRank?.(rank)}
                title={stone ? `${stone.title} (${stone.category || 'Pedra'})` : `Pedra ${String(rank).padStart(2, '0')} (Clique para definir)`}
                className={`relative group flex flex-col items-center justify-center w-14 sm:w-16 h-10 sm:h-11 rounded-full transition-all duration-200 cursor-pointer border ${
                  isAssigned
                    ? 'bg-[#B49A6A] text-white border-[#9A8052] shadow-sm hover:scale-105'
                    : 'bg-[#E5DECE]/70 text-[#383B32]/70 border-[#D5CEBE] hover:bg-[#D5CEBE]'
                }`}
              >
                <span className="font-mono text-xs font-semibold tracking-wider">
                  {String(rank).padStart(2, '0')}
                </span>
                {stone && (
                  <span className="text-[9px] truncate max-w-[48px] px-1 font-serif text-white/90">
                    {stone.title}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      ))}
      <span className="text-xs text-[#383B32]/70 font-serif italic mt-2">
        Pirâmide das 10 Pedras do Ano — Selecione as experiências fundamentais
      </span>
    </div>
  );
};
