import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { storage } from '../lib/storage';
import { Prayer, Stone } from '../types/memorial';
import { PageHeader } from '../components/PageHeader';
import { ConfirmModal } from '../components/ConfirmModal';
import { StoneIconSVG } from '../components/MemorialArt';
import { 
  Heart, 
  Plus, 
  Trash2, 
  CheckCircle, 
  Calendar, 
  Sparkles, 
  ArrowRight,
  X,
  MessageCircle
} from 'lucide-react';

export const PrayerJournalPage: React.FC = () => {
  const { user } = useAuth();
  const [prayers, setPrayers] = useState<Prayer[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'em_oracao' | 'respondida'>('all');
  
  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [answerTargetPrayer, setAnswerTargetPrayer] = useState<Prayer | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  // New Prayer Form
  const [form, setForm] = useState({
    title: '',
    asking: '',
    delivering: '',
    thanking: '',
  });

  // Answer Form (Page 21 from PDF)
  const [answerForm, setAnswerForm] = useState({
    answered_at: new Date().toISOString().split('T')[0],
    answered_story: '',
    answered_feeling: '',
    answered_lesson: '',
    createStone: true,
    stoneTitle: '',
  });

  useEffect(() => {
    if (!user) return;
    loadPrayers();
  }, [user]);

  const loadPrayers = async () => {
    if (!user) return;
    setLoading(true);
    const data = await storage.getPrayers(user.id);
    setPrayers(data);
    setLoading(false);
  };

  const handleCreatePrayer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || (!form.asking.trim() && !form.delivering.trim() && !form.thanking.trim())) return;

    const newPrayer: Prayer = {
      id: 'prayer_' + Date.now(),
      user_id: user.id,
      title: form.title.trim() || form.asking.slice(0, 40) + '...',
      asking: form.asking.trim(),
      delivering: form.delivering.trim(),
      thanking: form.thanking.trim(),
      status: 'em_oracao',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    await storage.savePrayer(newPrayer);
    setPrayers(prev => [newPrayer, ...prev]);
    setForm({ title: '', asking: '', delivering: '', thanking: '' });
    setIsCreateOpen(false);
  };

  const handleOpenAnswerModal = (prayer: Prayer) => {
    setAnswerTargetPrayer(prayer);
    setAnswerForm({
      answered_at: new Date().toISOString().split('T')[0],
      answered_story: prayer.answered_story || '',
      answered_feeling: prayer.answered_feeling || '',
      answered_lesson: prayer.answered_lesson || '',
      createStone: true,
      stoneTitle: prayer.title || 'Resposta de Oração',
    });
  };

  const handleSubmitAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !answerTargetPrayer) return;

    let resultingStoneId = answerTargetPrayer.resulting_stone_id;

    // Create a new stone if requested
    if (answerForm.createStone && answerForm.answered_story.trim()) {
      const newStone: Stone = {
        id: 'stone_' + Date.now(),
        user_id: user.id,
        title: answerForm.stoneTitle.trim() || 'Resposta de Oração',
        category: 'Resposta',
        event_date: answerForm.answered_at,
        story: answerForm.answered_story.trim(),
        expected_or_asked: answerTargetPrayer.asking,
        personal_meaning: answerForm.answered_feeling.trim(),
        lessons_learned: answerForm.answered_lesson.trim(),
        future_strength: 'Deus respondeu a esta oração fielmente.',
        is_favorite: true,
        prayer_id: answerTargetPrayer.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      await storage.saveStone(newStone);
      resultingStoneId = newStone.id;
    }

    const updatedPrayer: Prayer = {
      ...answerTargetPrayer,
      status: 'respondida',
      answered_at: answerForm.answered_at,
      answered_story: answerForm.answered_story.trim(),
      answered_feeling: answerForm.answered_feeling.trim(),
      answered_lesson: answerForm.answered_lesson.trim(),
      resulting_stone_id: resultingStoneId,
      updated_at: new Date().toISOString(),
    };

    await storage.savePrayer(updatedPrayer);
    setPrayers(prev => prev.map(p => (p.id === updatedPrayer.id ? updatedPrayer : p)));
    setAnswerTargetPrayer(null);
  };

  const handleDeleteConfirm = async () => {
    if (!user || !deleteTargetId) return;
    await storage.deletePrayer(user.id, deleteTargetId);
    setPrayers(prev => prev.filter(p => p.id !== deleteTargetId));
    setDeleteTargetId(null);
  };

  const filteredPrayers = prayers.filter(p => {
    if (selectedFilter === 'em_oracao') return p.status === 'em_oracao';
    if (selectedFilter === 'respondida') return p.status === 'respondida';
    return true;
  });

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-16">
      <PageHeader
        badge="Parte 6 · O Caderno das Orações"
        title="O Caderno das Orações"
        subtitle="“Não escreva apenas pedidos. Registre também aquilo que está entregando e aquilo pelo que está agradecendo.” — Dias 76–90"
        action={
          <button
            type="button"
            onClick={() => setIsCreateOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-white bg-[#383B32] hover:bg-[#2A2C25] rounded-xl transition-colors shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Escrever Oração</span>
          </button>
        }
      />

      {/* Filter Tabs */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 p-1 bg-[#E5DECE]/60 rounded-xl">
          <button
            type="button"
            onClick={() => setSelectedFilter('all')}
            className={`py-1 px-3 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
              selectedFilter === 'all'
                ? 'bg-white text-[#383B32] shadow-xs'
                : 'text-[#383B32]/70 hover:text-[#383B32]'
            }`}
          >
            Todas ({prayers.length})
          </button>
          <button
            type="button"
            onClick={() => setSelectedFilter('em_oracao')}
            className={`py-1 px-3 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
              selectedFilter === 'em_oracao'
                ? 'bg-white text-[#383B32] shadow-xs'
                : 'text-[#383B32]/70 hover:text-[#383B32]'
            }`}
          >
            Em Oração ({prayers.filter(p => p.status === 'em_oracao').length})
          </button>
          <button
            type="button"
            onClick={() => setSelectedFilter('respondida')}
            className={`py-1 px-3 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
              selectedFilter === 'respondida'
                ? 'bg-white text-[#383B32] shadow-xs'
                : 'text-[#383B32]/70 hover:text-[#383B32]'
            }`}
          >
            Respondidas ({prayers.filter(p => p.status === 'respondida').length})
          </button>
        </div>
      </div>

      {/* Prayers List */}
      {filteredPrayers.length === 0 ? (
        <div className="text-center py-16 px-4 bg-white/50 border border-dashed border-[#D5CEBE] rounded-2xl space-y-4">
          <div className="w-12 h-12 rounded-full bg-[#E5DECE]/50 flex items-center justify-center mx-auto text-red-600/80">
            <Heart className="w-6 h-6" />
          </div>
          <h3 className="font-serif text-lg text-[#383B32]">
            Nenhuma oração nesta lista.
          </h3>
          <p className="text-xs text-[#383B32]/70 font-serif italic max-w-sm mx-auto">
            “Não andeis ansiosos de coisa alguma; em tudo, porém, sejam conhecidas as vossas petições diante de Deus pela oração e súplica, com ações de graças.”
          </p>
          <button
            type="button"
            onClick={() => setIsCreateOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-[#383B32] hover:bg-[#2A2C25] rounded-xl transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Adicionar Oração</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredPrayers.map(prayer => {
            const isAnswered = prayer.status === 'respondida';
            return (
              <div
                key={prayer.id}
                className="bg-white/85 border border-[#E5DECE] hover:border-red-200 rounded-2xl p-6 space-y-4 transition-all shadow-2xs flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs text-[#383B32]/60">
                    <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded ${
                      isAnswered ? 'bg-emerald-100 text-emerald-800' : 'bg-[#E5DECE]/60 text-[#879579]'
                    }`}>
                      {isAnswered ? '✓ Oração Respondida' : 'Em Oração'}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(prayer.created_at).toLocaleDateString('pt-BR')}
                    </span>
                  </div>

                  {prayer.title && (
                    <h3 className="font-serif text-lg text-[#383B32] font-semibold">
                      {prayer.title}
                    </h3>
                  )}

                  {/* 01 Pedindo */}
                  {prayer.asking && (
                    <div className="text-xs space-y-0.5">
                      <span className="font-serif italic font-semibold text-[#B49A6A]">
                        01. O que estou pedindo:
                      </span>
                      <p className="text-[#383B32]/85 font-sans leading-relaxed">
                        {prayer.asking}
                      </p>
                    </div>
                  )}

                  {/* 02 Entregando */}
                  {prayer.delivering && (
                    <div className="text-xs space-y-0.5">
                      <span className="font-serif italic font-semibold text-[#879579]">
                        02. O que estou entregando:
                      </span>
                      <p className="text-[#383B32]/85 font-sans leading-relaxed">
                        {prayer.delivering}
                      </p>
                    </div>
                  )}

                  {/* 03 Agradecendo */}
                  {prayer.thanking && (
                    <div className="text-xs space-y-0.5">
                      <span className="font-serif italic font-semibold text-[#383B32]">
                        03. O que estou agradecendo:
                      </span>
                      <p className="text-[#383B32]/85 font-sans leading-relaxed">
                        {prayer.thanking}
                      </p>
                    </div>
                  )}

                  {/* Answer card if already answered */}
                  {isAnswered && (
                    <div className="mt-3 p-3 bg-emerald-50/70 border border-emerald-200/80 rounded-xl text-xs space-y-1.5">
                      <div className="flex items-center justify-between text-emerald-900 font-semibold font-serif">
                        <span>Quando a Resposta Chegou</span>
                        {prayer.answered_at && (
                          <span className="font-sans text-[11px] font-normal">
                            {new Date(prayer.answered_at + 'T00:00:00').toLocaleDateString('pt-BR')}
                          </span>
                        )}
                      </div>
                      <p className="text-emerald-950 font-sans">
                        {prayer.answered_story}
                      </p>
                      {prayer.resulting_stone_id && (
                        <div className="inline-flex items-center gap-1.5 text-[11px] font-medium text-emerald-800 pt-1">
                          <StoneIconSVG className="w-3.5 h-3.5 text-[#B49A6A]" />
                          <span>Guardada como pedra no Memorial</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Footer Actions */}
                <div className="flex items-center justify-between pt-3 border-t border-[#E5DECE] mt-2">
                  {!isAnswered ? (
                    <button
                      type="button"
                      onClick={() => handleOpenAnswerModal(prayer)}
                      className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-800 hover:text-emerald-900 bg-emerald-50 px-2.5 py-1.5 rounded-lg border border-emerald-200 transition-colors cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Registrar Resposta de Oração</span>
                    </button>
                  ) : (
                    <span className="text-[11px] text-[#383B32]/60 font-serif italic">
                      Testemunho preservado
                    </span>
                  )}

                  <button
                    type="button"
                    onClick={() => setDeleteTargetId(prayer.id)}
                    className="p-1.5 text-[#383B32]/40 hover:text-red-700 rounded-lg transition-colors cursor-pointer"
                    title="Excluir oração"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal: Escrever Oração (Página 20) */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-[#F4F0E7] border border-[#E5DECE] rounded-2xl max-w-xl w-full p-6 sm:p-8 shadow-2xl space-y-5">
            <div className="border-b border-[#E5DECE] pb-3 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-semibold text-[#879579] tracking-wider">
                  O Caderno das Orações · Página 20
                </span>
                <h3 className="text-2xl font-serif text-[#383B32] mt-0.5">
                  Escrever no Caderno de Oração
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateOpen(false)}
                className="p-1 text-[#383B32]/60 hover:text-[#383B32]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePrayer} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#383B32]">
                  Título ou Motivo da Oração (Opcional)
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  placeholder="Ex: Pela saúde da minha mãe, Pelo novo trabalho..."
                  className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#D5CEBE] text-sm text-[#383B32] focus:outline-none focus:border-[#383B32]"
                />
              </div>

              {/* 01 O que estou pedindo */}
              <div className="space-y-1">
                <label className="text-xs font-serif font-semibold text-[#383B32] flex items-center gap-1.5">
                  <span className="font-mono text-[#B49A6A]">01</span>
                  <span>O que estou pedindo?</span>
                </label>
                <textarea
                  rows={3}
                  value={form.asking}
                  onChange={e => setForm({ ...form, asking: e.target.value })}
                  placeholder="Abra o coração diante de Deus com simplicidade e verdade..."
                  className="w-full p-3 rounded-xl bg-white border border-[#D5CEBE] text-sm text-[#383B32] focus:outline-none focus:border-[#383B32] font-sans"
                />
              </div>

              {/* 02 O que estou entregando */}
              <div className="space-y-1">
                <label className="text-xs font-serif font-semibold text-[#383B32] flex items-center gap-1.5">
                  <span className="font-mono text-[#879579]">02</span>
                  <span>O que estou entregando?</span>
                </label>
                <textarea
                  rows={2}
                  value={form.delivering}
                  onChange={e => setForm({ ...form, delivering: e.target.value })}
                  placeholder="Ansiedades, controle, prazos, pessoas, medos..."
                  className="w-full p-3 rounded-xl bg-white border border-[#D5CEBE] text-sm text-[#383B32] focus:outline-none focus:border-[#383B32] font-sans"
                />
              </div>

              {/* 03 O que estou agradecendo */}
              <div className="space-y-1">
                <label className="text-xs font-serif font-semibold text-[#383B32] flex items-center gap-1.5">
                  <span className="font-mono text-[#383B32]">03</span>
                  <span>O que estou agradecendo?</span>
                </label>
                <textarea
                  rows={2}
                  value={form.thanking}
                  onChange={e => setForm({ ...form, thanking: e.target.value })}
                  placeholder="Agradeça pelo que Ele já fez e pela Sua presença fiel..."
                  className="w-full p-3 rounded-xl bg-white border border-[#D5CEBE] text-sm text-[#383B32] focus:outline-none focus:border-[#383B32] font-sans"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E5DECE]">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-[#383B32] hover:bg-[#E5DECE] rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-medium text-white bg-[#383B32] hover:bg-[#2A2C25] rounded-xl cursor-pointer"
                >
                  Guardar Oração
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Quando a Resposta Chegar (Página 21) */}
      {answerTargetPrayer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-[#F4F0E7] border border-[#E5DECE] rounded-2xl max-w-xl w-full p-6 sm:p-8 shadow-2xl space-y-5">
            <div className="border-b border-[#E5DECE] pb-3 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-semibold text-emerald-800 tracking-wider">
                  Parte 6 · Página 21
                </span>
                <h3 className="text-2xl font-serif text-[#383B32] mt-0.5">
                  Quando a Resposta Chegar
                </h3>
                <p className="text-xs font-serif italic text-[#383B32]/75">
                  “Volte à mesma página. Transforme a resposta em uma nova pedra.”
                </p>
              </div>
              <button
                type="button"
                onClick={() => setAnswerTargetPrayer(null)}
                className="p-1 text-[#383B32]/60 hover:text-[#383B32]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitAnswer} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#383B32]">
                  Data da Resposta
                </label>
                <input
                  type="date"
                  value={answerForm.answered_at}
                  onChange={e => setAnswerForm({ ...answerForm, answered_at: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#D5CEBE] text-sm text-[#383B32]"
                />
              </div>

              {/* 01 O que aconteceu? */}
              <div className="space-y-1">
                <label className="text-xs font-serif font-semibold text-[#383B32] flex items-center gap-1.5">
                  <span className="font-mono text-emerald-800">01</span>
                  <span>O que aconteceu? (Como Deus respondeu?) *</span>
                </label>
                <textarea
                  required
                  rows={3}
                  value={answerForm.answered_story}
                  onChange={e => setAnswerForm({ ...answerForm, answered_story: e.target.value })}
                  placeholder="Relate como a resposta de Deus se manifestou..."
                  className="w-full p-3 rounded-xl bg-white border border-[#D5CEBE] text-sm text-[#383B32] focus:outline-none focus:border-emerald-600 font-sans"
                />
              </div>

              {/* 02 Como me senti? */}
              <div className="space-y-1">
                <label className="text-xs font-serif font-semibold text-[#383B32] flex items-center gap-1.5">
                  <span className="font-mono text-emerald-800">02</span>
                  <span>Como me senti?</span>
                </label>
                <input
                  type="text"
                  value={answerForm.answered_feeling}
                  onChange={e => setAnswerForm({ ...answerForm, answered_feeling: e.target.value })}
                  placeholder="Paz, alívio, reverência, alegria indizível..."
                  className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#D5CEBE] text-sm text-[#383B32] focus:outline-none"
                />
              </div>

              {/* 03 O que aprendi? */}
              <div className="space-y-1">
                <label className="text-xs font-serif font-semibold text-[#383B32] flex items-center gap-1.5">
                  <span className="font-mono text-emerald-800">03</span>
                  <span>O que aprendi sobre Deus e sobre a oração?</span>
                </label>
                <textarea
                  rows={2}
                  value={answerForm.answered_lesson}
                  onChange={e => setAnswerForm({ ...answerForm, answered_lesson: e.target.value })}
                  placeholder="O aprendizado que não quero esquecer..."
                  className="w-full p-3 rounded-xl bg-white border border-[#D5CEBE] text-sm text-[#383B32] focus:outline-none font-sans"
                />
              </div>

              {/* 04 Minha nova pedra */}
              <div className="p-3.5 bg-amber-50/80 border border-amber-200 rounded-xl space-y-2">
                <label className="flex items-center gap-2 text-xs font-semibold text-[#383B32] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={answerForm.createStone}
                    onChange={e => setAnswerForm({ ...answerForm, createStone: e.target.checked })}
                    className="rounded text-[#B49A6A] focus:ring-[#B49A6A]"
                  />
                  <span>04. Minha nova pedra: Guardar automaticamente no Livro das Pedras</span>
                </label>

                {answerForm.createStone && (
                  <input
                    type="text"
                    value={answerForm.stoneTitle}
                    onChange={e => setAnswerForm({ ...answerForm, stoneTitle: e.target.value })}
                    placeholder="Título da pedra no memorial..."
                    className="w-full px-3 py-1.5 rounded-lg bg-white border border-amber-300 text-xs text-[#383B32] focus:outline-none"
                  />
                )}
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E5DECE]">
                <button
                  type="button"
                  onClick={() => setAnswerTargetPrayer(null)}
                  className="px-4 py-2 text-xs font-medium text-[#383B32] hover:bg-[#E5DECE] rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-medium text-white bg-emerald-800 hover:bg-emerald-900 rounded-xl cursor-pointer"
                >
                  Confirmar Resposta & Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      <ConfirmModal
        isOpen={Boolean(deleteTargetId)}
        title="Excluir Oração?"
        description="Esta oração será removida do seu caderno. Caso ela tenha gerado uma pedra no Livro das Pedras, a pedra permanecerá guardada."
        confirmLabel="Sim, excluir"
        cancelLabel="Cancelar"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTargetId(null)}
      />
    </div>
  );
};
