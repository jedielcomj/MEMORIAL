import React from 'react';
import { Check, Loader2, AlertCircle } from 'lucide-react';

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

export const SaveIndicator: React.FC<{ status: SaveStatus; lastSavedTime?: string }> = ({
  status,
  lastSavedTime,
}) => {
  if (status === 'idle' && !lastSavedTime) return null;

  return (
    <div className="inline-flex items-center gap-1.5 text-xs text-[#383B32]/70 font-sans transition-all">
      {status === 'saving' && (
        <>
          <Loader2 className="w-3.5 h-3.5 animate-spin text-[#B49A6A]" />
          <span>Salvando...</span>
        </>
      )}
      {status === 'saved' && (
        <>
          <Check className="w-3.5 h-3.5 text-[#879579]" />
          <span>Salvo {lastSavedTime ? `às ${lastSavedTime}` : ''}</span>
        </>
      )}
      {status === 'error' && (
        <>
          <AlertCircle className="w-3.5 h-3.5 text-red-600" />
          <span className="text-red-700">Não foi possível salvar</span>
        </>
      )}
      {status === 'idle' && lastSavedTime && (
        <span className="text-[#383B32]/50">Salvo às {lastSavedTime}</span>
      )}
    </div>
  );
};
