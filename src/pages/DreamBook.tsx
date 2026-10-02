import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { storage } from '../lib/storage';
import { Dream, LegacyReflection } from '../types/memorial';
import { PageHeader } from '../components/PageHeader';
import { ConfirmModal } from '../components/ConfirmModal';
import { SaveIndicator, SaveStatus } from '../components/SaveIndicator';
import { 
  Sparkles, 
  Plus, 
  Trash2, 
  FolderGit2, 
  CheckCircle2, 
  HeartHandshake, 
  Compass, 
  BookOpen,
  ArrowRight,
  X,
  Scroll
} from 'lucide-react';

export const DreamBookPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'dreams' | 'legacy'>('dreams');
  
  // Dreams list
  const [dreams, setDreams] = useState<Dream[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  // New Dream Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [dreamForm, setDreamForm] = useState<{
    title: string;
    category: 'sonho' | 'um_dia' | 'sem_medo' | 'com_recursos' | 'geral';
    description: string;
    why_i_want: string;
    personal_meaning: string;
    time_horizon: string;
  }>({
    title: '',
    category: 'sonho',
    description: '',
    why_i_want: '',
    personal_meaning: '',
    time_horizon: 'médio prazo',
  });

  // Legacy Reflection State (Page 17)
  const [legacyForm, setLegacyForm] = useState<LegacyReflection>({
    id: '',
    user_id: '',
    build: '',
    discover: '',
    learn: '',
    provide_loved_ones: '',
    legacy_to_leave: '',
    created_at: '',
    updated_at: '',
  });
  const [legacySaveStatus, setLegacySaveStatus] = useState<SaveStatus>('idle');
  const [lastSavedTime, setLastSavedTime] = useState('');

  useEffect(() => {
    if (!user) return;
    loadData();
  }, [user]);

  const loadData = async () => {
    if (!user) return;
    setLoading(true);
    const [dr, leg] = await Promise.all([
      storage.getDreams(user.id),
      storage.getLegacy(user.id),
    ]);
    setDreams(dr);
    if (leg) {
      setLegacyForm(leg);
    } else {
      setLegacyForm({
        id: 'legacy_' + user.id,
        user_id: user.id,
        build: '',
        discover: '',
        learn: '',
        provide_loved_ones: '',
        legacy_to_leave: '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    }
    setLoading(false);
  };

  const handleOpenAddDream = (presetCategory?: 'sonho' | 'um_dia' | 'sem_medo' | 'com_recursos') => {
    setDreamForm({
      title: '',
      category: presetCategory || 'sonho',
      description: '',
      why_i_want: '',
      personal_meaning: '',
      time_horizon: 'médio prazo',
    });
    setIsModalOpen(true);
  };

  const handleSubmitDream = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !dreamForm.title.trim()) return;

    const newDream: Dream = {
      id: 'dream_' + Date.now(),
      user_id: user.id,
      title: dreamForm.title.trim(),
      category: dreamForm.category,
      description: dreamForm.description.trim(),
      why_i_want: dreamForm.why_i_want.trim(),
      personal_meaning: dreamForm.personal_meaning.trim(),
      time_horizon: dreamForm.time_horizon,
      status: 'ativo',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    await storage.saveDream(newDream);
    setDreams(prev => [newDream, ...prev]);
    setIsModalOpen(false);
  };

  const handleDeleteConfirm = async () => {
    if (!user || !deleteTargetId) return;
    await storage.deleteDream(user.id, deleteTargetId);
    setDreams(prev => prev.filter(d => d.id !== deleteTargetId));
    setDeleteTargetId(null);
  };

  const handleSaveLegacy = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!user) return;
    setLegacySaveStatus('saving');
    try {
      const toSave: LegacyReflection = {
        ...legacyForm,
        id: legacyForm.id || 'legacy_' + user.id,
        user_id: user.id,
        updated_at: new Date().toISOString(),
      };
      await storage.saveLegacy(toSave);
      setLegacyForm(toSave);
      setLegacySaveStatus('saved');
      setLastSavedTime(new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }));
    } catch {
      setLegacySaveStatus('error');
    }
  };

  const handleConvertToProject = (dream: Dream) => {
    // Navigate to projects with state prefilled
    navigate('/projetos', { state: { fromDream: dream } });
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-16">
      <PageHeader
        badge="Parte 4 · O Livro dos Sonhos"
        title="O Livro dos Sonhos"
        subtitle="“Aqui não existe a obrigação de saber como. É simplesmente um espaço para sonhar.” — Dias 46–60"
        action={
          <button
            type="button"
            onClick={() => handleOpenAddDream()}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-white bg-[#383B32] hover:bg-[#2A2C25] rounded-xl transition-colors shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Registrar Sonho</span>
          </button>
        }
      />

      {/* Tabs: Livro dos Sonhos vs Legado */}
      <div className="flex items-center gap-2 p-1 bg-[#E5DECE]/60 rounded-xl max-w-sm">
        <button
          type="button"
          onClick={() => setActiveTab('dreams')}
          className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
            activeTab === 'dreams'
              ? 'bg-white text-[#383B32] shadow-xs'
              : 'text-[#383B32]/70 hover:text-[#383B32]'
          }`}
        >
          Meus Sonhos ({dreams.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('legacy')}
          className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
            activeTab === 'legacy'
              ? 'bg-white text-[#383B32] shadow-xs'
              : 'text-[#383B32]/70 hover:text-[#383B32]'
          }`}
        >
          Legado (Página 17)
        </button>
      </div>

      {activeTab === 'legacy' ? (
        /* Section: Legado (Page 17 from PDF) */
        <form onSubmit={handleSaveLegacy} className="bg-white/85 border border-[#E5DECE] rounded-2xl p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E5DECE] pb-4">
            <div>
              <span className="text-[11px] uppercase tracking-wider font-semibold text-[#879579]">
                Parte 4 · O Livro dos Sonhos · Página 17
              </span>
              <h2 className="text-2xl font-serif text-[#383B32]">
                Legado
              </h2>
            </div>
            <SaveIndicator status={legacySaveStatus} lastSavedTime={lastSavedTime} />
          </div>

          <div className="space-y-5">
            {/* 01 O que gostaria de construir? */}
            <div className="space-y-1.5">
              <label className="text-xs font-serif font-semibold text-[#383B32] flex items-center gap-2">
                <span className="font-mono text-[#B49A6A]">01</span>
                <span>O que gostaria de construir?</span>
              </label>
              <textarea
                rows={2}
                value={legacyForm.build}
                onChange={e => setLegacyForm({ ...legacyForm, build: e.target.value })}
                placeholder="Uma obra, uma família, um negócio, uma comunidade, um lar..."
                className="w-full p-3 rounded-xl bg-[#F4F0E7]/40 border border-[#D5CEBE] text-sm text-[#383B32] focus:outline-none focus:border-[#B49A6A] font-sans"
              />
            </div>

            {/* 02 O que gostaria de conhecer? */}
            <div className="space-y-1.5">
              <label className="text-xs font-serif font-semibold text-[#383B32] flex items-center gap-2">
                <span className="font-mono text-[#B49A6A]">02</span>
                <span>O que gostaria de conhecer?</span>
              </label>
              <textarea
                rows={2}
                value={legacyForm.discover}
                onChange={e => setLegacyForm({ ...legacyForm, discover: e.target.value })}
                placeholder="Lugares, culturas, pessoas, profundezas espirituais..."
                className="w-full p-3 rounded-xl bg-[#F4F0E7]/40 border border-[#D5CEBE] text-sm text-[#383B32] focus:outline-none focus:border-[#B49A6A] font-sans"
              />
            </div>

            {/* 03 O que gostaria de aprender? */}
            <div className="space-y-1.5">
              <label className="text-xs font-serif font-semibold text-[#383B32] flex items-center gap-2">
                <span className="font-mono text-[#B49A6A]">03</span>
                <span>O que gostaria de aprender?</span>
              </label>
              <textarea
                rows={2}
                value={legacyForm.learn}
                onChange={e => setLegacyForm({ ...legacyForm, learn: e.target.value })}
                placeholder="Habilidades, línguas, instrumentos, sabedoria, teologia..."
                className="w-full p-3 rounded-xl bg-[#F4F0E7]/40 border border-[#D5CEBE] text-sm text-[#383B32] focus:outline-none focus:border-[#B49A6A] font-sans"
              />
            </div>

            {/* 04 O que gostaria de proporcionar às pessoas que amo? */}
            <div className="space-y-1.5">
              <label className="text-xs font-serif font-semibold text-[#383B32] flex items-center gap-2">
                <span className="font-mono text-[#B49A6A]">04</span>
                <span>O que gostaria de proporcionar às pessoas que amo?</span>
              </label>
              <textarea
                rows={2}
                value={legacyForm.provide_loved_ones}
                onChange={e => setLegacyForm({ ...legacyForm, provide_loved_ones: e.target.value })}
                placeholder="Paz, memórias inesquecíveis, segurança, apoio em seus próprios chamados..."
                className="w-full p-3 rounded-xl bg-[#F4F0E7]/40 border border-[#D5CEBE] text-sm text-[#383B32] focus:outline-none focus:border-[#B49A6A] font-sans"
              />
            </div>

            {/* 05 Que legado gostaria de deixar? */}
            <div className="space-y-1.5">
              <label className="text-xs font-serif font-semibold text-[#383B32] flex items-center gap-2">
                <span className="font-mono text-[#B49A6A]">05</span>
                <span>Que legado gostaria de deixar?</span>
              </label>
              <textarea
                rows={3}
                value={legacyForm.legacy_to_leave}
                onChange={e => setLegacyForm({ ...legacyForm, legacy_to_leave: e.target.value })}
                placeholder="O testemunho, a fé e o rastro de amor que você quer que permaneça nesta terra..."
                className="w-full p-3.5 rounded-xl bg-[#F4F0E7]/40 border border-[#D5CEBE] text-sm text-[#383B32] focus:outline-none focus:border-[#B49A6A] font-sans leading-relaxed"
              />
            </div>
          </div>

          <div className="flex items-center justify-end pt-3 border-t border-[#E5DECE]">
            <button
              type="submit"
              className="px-6 py-2.5 text-xs font-medium text-white bg-[#383B32] hover:bg-[#2A2C25] rounded-xl transition-colors cursor-pointer"
            >
              Salvar Reflexão de Legado
            </button>
          </div>
        </form>
      ) : (
        /* Section: Dreams List */
        <div className="space-y-6">
          {/* The 4 Prompts from PDF Page 16 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              {
                category: 'sonho' as const,
                title: '01. Eu sonho em...',
                prompt: 'Qual é aquele anseio puro do seu coração?',
              },
              {
                category: 'um_dia' as const,
                title: '02. Um dia eu gostaria de...',
                prompt: 'Experiências e horizontes que espera viver.',
              },
              {
                category: 'sem_medo' as const,
                title: '03. Se não tivesse medo, eu...',
                prompt: 'O que a ousadia e a fé fariam?',
              },
              {
                category: 'com_recursos' as const,
                title: '04. Se tivesse todos os recursos...',
                prompt: 'O que você construiria sem escassez?',
              },
            ].map(p => (
              <button
                key={p.category}
                type="button"
                onClick={() => handleOpenAddDream(p.category)}
                className="p-4 bg-white/70 hover:bg-white border border-[#E5DECE] hover:border-[#879579] rounded-xl text-left transition-all cursor-pointer flex flex-col justify-between group shadow-2xs"
              >
                <div>
                  <h4 className="font-serif font-medium text-sm text-[#383B32] group-hover:text-[#879579] transition-colors">
                    {p.title}
                  </h4>
                  <p className="text-[11px] text-[#383B32]/70 font-sans mt-1">
                    {p.prompt}
                  </p>
                </div>
                <span className="text-[10px] font-semibold text-[#879579] mt-3 inline-flex items-center gap-1">
                  <span>Adicionar este sonho</span>
                  <Plus className="w-3 h-3" />
                </span>
              </button>
            ))}
          </div>

          {/* List of Registered Dreams */}
          {dreams.length === 0 ? (
            <div className="text-center py-16 px-4 bg-white/50 border border-dashed border-[#D5CEBE] rounded-2xl space-y-3">
              <div className="w-12 h-12 rounded-full bg-[#E5DECE]/50 flex items-center justify-center mx-auto text-[#879579]">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-lg text-[#383B32]">
                Nenhum sonho registrado ainda.
              </h3>
              <p className="text-xs text-[#383B32]/70 font-serif italic max-w-sm mx-auto">
                “Sonho sem registro pode permanecer apenas como desejo. Sonho registrado pode se transformar em direção.”
              </p>
              <button
                type="button"
                onClick={() => handleOpenAddDream()}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-[#383B32] hover:bg-[#2A2C25] rounded-xl transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Escrever meu primeiro sonho</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {dreams.map(dream => (
                <div
                  key={dream.id}
                  className="bg-white/85 border border-[#E5DECE] hover:border-[#879579] rounded-2xl p-5 space-y-3 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-[#383B32]/60">
                      <span className="font-serif italic font-medium text-[#879579] bg-[#F4F0E7] px-2 py-0.5 rounded capitalize">
                        {dream.category.replace('_', ' ')}
                      </span>
                      <span>{dream.time_horizon || 'médio prazo'}</span>
                    </div>

                    <h3 className="font-serif text-lg font-medium text-[#383B32]">
                      {dream.title}
                    </h3>

                    {dream.description && (
                      <p className="text-xs text-[#383B32]/80 font-sans leading-relaxed">
                        {dream.description}
                      </p>
                    )}

                    {dream.why_i_want && (
                      <div className="text-xs text-[#383B32]/70 font-sans">
                        <strong className="font-serif italic font-semibold text-[#879579]">Por que quero: </strong>
                        {dream.why_i_want}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-3 border-t border-[#E5DECE]">
                    <button
                      type="button"
                      onClick={() => handleConvertToProject(dream)}
                      className="inline-flex items-center gap-1.5 text-xs font-medium text-[#B49A6A] hover:text-[#9A8052] transition-colors cursor-pointer"
                    >
                      <FolderGit2 className="w-3.5 h-3.5" />
                      <span>Transformar em Projeto →</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setDeleteTargetId(dream.id)}
                      className="p-1.5 text-[#383B32]/40 hover:text-red-700 rounded-lg transition-colors cursor-pointer"
                      title="Excluir sonho"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Add Dream Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-[#F4F0E7] border border-[#E5DECE] rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#E5DECE] pb-3">
              <div>
                <span className="text-[10px] uppercase font-semibold text-[#879579] tracking-wider">
                  O Livro dos Sonhos
                </span>
                <h3 className="text-xl font-serif text-[#383B32]">
                  Registrar Novo Sonho
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-[#383B32]/60 hover:text-[#383B32]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitDream} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#383B32]">
                  Tipo de Sonho (Manual)
                </label>
                <select
                  value={dreamForm.category}
                  onChange={e => setDreamForm({ ...dreamForm, category: e.target.value as any })}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-[#D5CEBE] text-sm text-[#383B32] focus:outline-none"
                >
                  <option value="sonho">01. Eu sonho em...</option>
                  <option value="um_dia">02. Um dia eu gostaria de...</option>
                  <option value="sem_medo">03. Se não tivesse medo, eu...</option>
                  <option value="com_recursos">04. Se tivesse todos os recursos, eu...</option>
                  <option value="geral">Sonho Geral</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#383B32]">
                  Nome / Resumo do Sonho *
                </label>
                <input
                  type="text"
                  required
                  value={dreamForm.title}
                  onChange={e => setDreamForm({ ...dreamForm, title: e.target.value })}
                  placeholder="Ex: Escrever um livro, Aprender hebraico, Abrir um ministério..."
                  className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#D5CEBE] text-sm text-[#383B32] focus:outline-none focus:border-[#879579]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#383B32]">
                  Descrição Livre
                </label>
                <textarea
                  rows={3}
                  value={dreamForm.description}
                  onChange={e => setDreamForm({ ...dreamForm, description: e.target.value })}
                  placeholder="Descreva este sonho com o coração leve..."
                  className="w-full p-3 rounded-xl bg-white border border-[#D5CEBE] text-sm text-[#383B32] focus:outline-none focus:border-[#879579]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#383B32]">
                  Por que quero isso?
                </label>
                <input
                  type="text"
                  value={dreamForm.why_i_want}
                  onChange={e => setDreamForm({ ...dreamForm, why_i_want: e.target.value })}
                  placeholder="Qual é a motivação profunda?"
                  className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#D5CEBE] text-sm text-[#383B32] focus:outline-none focus:border-[#879579]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E5DECE]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-[#383B32] hover:bg-[#E5DECE] rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-medium text-white bg-[#383B32] hover:bg-[#2A2C25] rounded-xl cursor-pointer"
                >
                  Guardar Sonho
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={Boolean(deleteTargetId)}
        title="Excluir Sonho?"
        description="Este sonho será removido do seu livro. Os projetos já criados a partir dele não serão excluídos."
        confirmLabel="Sim, excluir"
        cancelLabel="Cancelar"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTargetId(null)}
      />
    </div>
  );
};
