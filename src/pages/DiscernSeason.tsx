import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { storage } from '../lib/storage';
import { SeasonDiscernment } from '../types/memorial';
import { PageHeader } from '../components/PageHeader';
import { SaveIndicator, SaveStatus } from '../components/SaveIndicator';
import { Clock, CheckCircle2, Compass } from 'lucide-react';

export const DiscernSeasonPage: React.FC = () => {
  const { user } = useAuth();
  const [form, setForm] = useState<SeasonDiscernment>({
    id: '',
    user_id: '',
    asking_attention: '',
    needs_to_end: '',
    needs_preserved: '',
    placed_before_me: '',
    can_wait: '',
    created_at: '',
    updated_at: '',
  });
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [lastSavedTime, setLastSavedTime] = useState<string>('');

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const data = await storage.getSeason(user.id);
      if (data) {
        setForm(data);
      } else {
        setForm({
          id: 'season_' + user.id,
          user_id: user.id,
          asking_attention: '',
          needs_to_end: '',
          needs_preserved: '',
          placed_before_me: '',
          can_wait: '',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      }
    };
    load();
  }, [user]);

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!user) return;

    setSaveStatus('saving');
    try {
      const toSave: SeasonDiscernment = {
        ...form,
        id: form.id || 'season_' + user.id,
        user_id: user.id,
        updated_at: new Date().toISOString(),
      };
      await storage.saveSeason(toSave);
      setForm(toSave);
      setSaveStatus('saved');
      setLastSavedTime(new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }));
    } catch {
      setSaveStatus('error');
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-16">
      <PageHeader
        badge="Parte 3 · Discernir a Estação"
        title="Discernir a Estação"
        subtitle="“Nem todo sonho precisa virar projeto agora. Nem toda oportunidade precisa receber um 'sim'. Antes de construir, aprenda a reconhecer a estação.”"
      />

      <form onSubmit={handleSave} className="bg-white/85 border border-[#E5DECE] rounded-2xl p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E5DECE] pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#E5DECE]/60 flex items-center justify-center text-[#B49A6A]">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-mono font-semibold text-[#B49A6A]">
                Dias 31–45 · Reflexão de Discernimento
              </span>
              <h3 className="font-serif text-xl text-[#383B32]">
                O que Deus está ensinando no tempo presente
              </h3>
            </div>
          </div>
          <SaveIndicator status={saveStatus} lastSavedTime={lastSavedTime} />
        </div>

        <div className="space-y-6">
          {/* 01 O que está pedindo minha atenção neste momento? */}
          <div className="space-y-2">
            <label className="text-sm font-serif font-semibold text-[#383B32] flex items-center gap-2">
              <span className="font-mono text-xs text-[#B49A6A]">01</span>
              <span>O que está pedindo minha atenção neste momento?</span>
            </label>
            <textarea
              rows={3}
              value={form.asking_attention}
              onChange={e => setForm({ ...form, asking_attention: e.target.value })}
              placeholder="Pessoas, saúde, projeto vital, silêncio, família..."
              className="w-full p-3.5 rounded-xl bg-[#F4F0E7]/40 border border-[#D5CEBE] text-sm text-[#383B32] focus:outline-none focus:border-[#B49A6A] font-sans leading-relaxed"
            />
          </div>

          {/* 02 O que precisa ser encerrado? */}
          <div className="space-y-2">
            <label className="text-sm font-serif font-semibold text-[#383B32] flex items-center gap-2">
              <span className="font-mono text-xs text-[#B49A6A]">02</span>
              <span>O que precisa ser encerrado?</span>
            </label>
            <textarea
              rows={3}
              value={form.needs_to_end}
              onChange={e => setForm({ ...form, needs_to_end: e.target.value })}
              placeholder="Ciclos que se cumpriram, hábitos que drenam, culpas ou projetos que já não têm vida..."
              className="w-full p-3.5 rounded-xl bg-[#F4F0E7]/40 border border-[#D5CEBE] text-sm text-[#383B32] focus:outline-none focus:border-[#B49A6A] font-sans leading-relaxed"
            />
          </div>

          {/* 03 O que precisa ser preservado? */}
          <div className="space-y-2">
            <label className="text-sm font-serif font-semibold text-[#383B32] flex items-center gap-2">
              <span className="font-mono text-xs text-[#B49A6A]">03</span>
              <span>O que precisa ser preservado?</span>
            </label>
            <textarea
              rows={3}
              value={form.needs_preserved}
              onChange={e => setForm({ ...form, needs_preserved: e.target.value })}
              placeholder="Valores, devocional, descanso, convicções, relacionamentos preciosos..."
              className="w-full p-3.5 rounded-xl bg-[#F4F0E7]/40 border border-[#D5CEBE] text-sm text-[#383B32] focus:outline-none focus:border-[#B49A6A] font-sans leading-relaxed"
            />
          </div>

          {/* 04 O que Deus já colocou diante de mim? */}
          <div className="space-y-2">
            <label className="text-sm font-serif font-semibold text-[#383B32] flex items-center gap-2">
              <span className="font-mono text-xs text-[#B49A6A]">04</span>
              <span>O que Deus já colocou diante de mim?</span>
            </label>
            <textarea
              rows={3}
              value={form.placed_before_me}
              onChange={e => setForm({ ...form, placed_before_me: e.target.value })}
              placeholder="A responsabilidade atual, o chamado presente, as pessoas que hoje dependem de mim..."
              className="w-full p-3.5 rounded-xl bg-[#F4F0E7]/40 border border-[#D5CEBE] text-sm text-[#383B32] focus:outline-none focus:border-[#B49A6A] font-sans leading-relaxed"
            />
          </div>

          {/* 05 O que pode esperar? */}
          <div className="space-y-2">
            <label className="text-sm font-serif font-semibold text-[#383B32] flex items-center gap-2">
              <span className="font-mono text-xs text-[#B49A6A]">05</span>
              <span>O que pode esperar?</span>
            </label>
            <textarea
              rows={3}
              value={form.can_wait}
              onChange={e => setForm({ ...form, can_wait: e.target.value })}
              placeholder="Sonhos futuros que não pertencem a esta semana ou mês; pressões que não vêm de Deus..."
              className="w-full p-3.5 rounded-xl bg-[#F4F0E7]/40 border border-[#D5CEBE] text-sm text-[#383B32] focus:outline-none focus:border-[#B49A6A] font-sans leading-relaxed"
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-[#E5DECE]">
          <span className="text-xs text-[#383B32]/55 font-serif italic">
            Memorial dos Santos · Página 15
          </span>
          <button
            type="submit"
            className="px-6 py-2.5 text-xs font-medium text-white bg-[#383B32] hover:bg-[#2A2C25] rounded-xl transition-colors cursor-pointer"
          >
            Salvar Discernimento da Estação
          </button>
        </div>
      </form>
    </div>
  );
};
