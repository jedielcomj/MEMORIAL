import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { storage } from '../lib/storage';
import { Stone, StoneCategory } from '../types/memorial';
import { PageHeader } from '../components/PageHeader';
import { ConfirmModal } from '../components/ConfirmModal';
import { SaveIndicator, SaveStatus } from '../components/SaveIndicator';
import { StoneIconSVG } from '../components/MemorialArt';
import { 
  Plus, 
  Search, 
  Star, 
  Trash2, 
  Edit3, 
  Filter, 
  Calendar, 
  BookMarked,
  ArrowRight,
  X,
  Share2
} from 'lucide-react';

const CATEGORIES: StoneCategory[] = [
  'Provisão',
  'Resposta',
  'Livramento',
  'Espera',
  'Direção',
  'Porta aberta',
  'Reconciliação',
  'Superação',
  'Uma pedra que ainda não sei nomear',
  'Encontro com Deus',
  'Deserto',
  'Jordão',
];

export const StonesPage: React.FC = () => {
  const { user } = useAuth();
  const [stones, setStones] = useState<Stone[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  
  // Reflection "De Onde Deus me Tirou" state
  const [activeTab, setActiveTab] = useState<'stones' | 'origin'>('stones');
  const [originAnswers, setOriginAnswers] = useState({
    q1: '',
    q2: '',
    q3: '',
    q4: '',
    q5: '',
    story: ''
  });
  const [originSaveStatus, setOriginSaveStatus] = useState<SaveStatus>('idle');

  // Modal / Form state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingStone, setEditingStone] = useState<Stone | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  // Form Fields
  const [formData, setFormData] = useState<{
    title: string;
    category: StoneCategory;
    event_date: string;
    story: string;
    expected_or_asked: string;
    personal_meaning: string;
    lessons_learned: string;
    future_strength: string;
    is_favorite: boolean;
  }>({
    title: '',
    category: 'Provisão',
    event_date: new Date().toISOString().split('T')[0],
    story: '',
    expected_or_asked: '',
    personal_meaning: '',
    lessons_learned: '',
    future_strength: '',
    is_favorite: false,
  });

  useEffect(() => {
    if (!user) return;
    loadStones();
    loadOriginReflection();
  }, [user]);

  const loadStones = async () => {
    if (!user) return;
    setLoading(true);
    const data = await storage.getStones(user.id);
    setStones(data);
    setLoading(false);
  };

  const loadOriginReflection = async () => {
    if (!user) return;
    const activities = await storage.getActivities(user.id, 'stage_1');
    const act = activities.find(a => a.activity_key === 'de_onde_deus_me_tirou');
    if (act?.response_data) {
      setOriginAnswers({
        q1: act.response_data.q1 || '',
        q2: act.response_data.q2 || '',
        q3: act.response_data.q3 || '',
        q4: act.response_data.q4 || '',
        q5: act.response_data.q5 || '',
        story: act.response_data.story || ''
      });
    }
  };

  const handleSaveOrigin = async () => {
    if (!user) return;
    setOriginSaveStatus('saving');
    try {
      await storage.saveActivity({
        id: 'origin_' + user.id,
        user_id: user.id,
        stage_id: 'stage_1',
        activity_key: 'de_onde_deus_me_tirou',
        response_data: originAnswers,
        completed: true,
        updated_at: new Date().toISOString(),
      });
      setOriginSaveStatus('saved');
    } catch {
      setOriginSaveStatus('error');
    }
  };

  const handleOpenCreate = (presetCategory?: StoneCategory) => {
    setEditingStone(null);
    setFormData({
      title: '',
      category: presetCategory || 'Provisão',
      event_date: new Date().toISOString().split('T')[0],
      story: '',
      expected_or_asked: '',
      personal_meaning: '',
      lessons_learned: '',
      future_strength: '',
      is_favorite: false,
    });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (stone: Stone) => {
    setEditingStone(stone);
    setFormData({
      title: stone.title,
      category: stone.category,
      event_date: stone.event_date || new Date().toISOString().split('T')[0],
      story: stone.story,
      expected_or_asked: stone.expected_or_asked || '',
      personal_meaning: stone.personal_meaning || '',
      lessons_learned: stone.lessons_learned || '',
      future_strength: stone.future_strength || '',
      is_favorite: stone.is_favorite,
    });
    setIsFormOpen(true);
  };

  const handleSubmitStone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !formData.title.trim() || !formData.story.trim()) return;

    const stoneToSave: Stone = {
      id: editingStone ? editingStone.id : 'stone_' + Date.now(),
      user_id: user.id,
      title: formData.title.trim(),
      category: formData.category,
      event_date: formData.event_date,
      story: formData.story.trim(),
      expected_or_asked: formData.expected_or_asked.trim(),
      personal_meaning: formData.personal_meaning.trim(),
      lessons_learned: formData.lessons_learned.trim(),
      future_strength: formData.future_strength.trim(),
      is_favorite: formData.is_favorite,
      created_at: editingStone ? editingStone.created_at : new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    await storage.saveStone(stoneToSave);
    await loadStones();
    setIsFormOpen(false);
  };

  const handleToggleFavorite = async (stone: Stone) => {
    if (!user) return;
    const updated = { ...stone, is_favorite: !stone.is_favorite, updated_at: new Date().toISOString() };
    await storage.saveStone(updated);
    setStones(prev => prev.map(s => (s.id === stone.id ? updated : s)));
  };

  const handleDeleteConfirm = async () => {
    if (!user || !deleteTargetId) return;
    await storage.deleteStone(user.id, deleteTargetId);
    setStones(prev => prev.filter(s => s.id !== deleteTargetId));
    setDeleteTargetId(null);
  };

  // Filtered list
  const filteredStones = stones.filter(stone => {
    const matchesSearch =
      stone.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      stone.story.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (stone.lessons_learned && stone.lessons_learned.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory =
      selectedCategory === 'all' || stone.category === selectedCategory;

    const matchesFav = !onlyFavorites || stone.is_favorite;

    return matchesSearch && matchesCategory && matchesFav;
  });

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-16">
      <PageHeader
        badge="Parte 1 · Minhas Pedras"
        title="O Livro das Pedras"
        subtitle="“Toda conquista, aprendizado, livramento ou resposta significativa pode se tornar uma pedra.” — Josué 4"
        action={
          <button
            type="button"
            onClick={() => handleOpenCreate()}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-white bg-[#383B32] hover:bg-[#2A2C25] rounded-xl transition-colors shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Guardar Nova Pedra</span>
          </button>
        }
      />

      {/* Tab Switcher: As Pedras vs De Onde Deus me Tirou */}
      <div className="flex items-center gap-2 p-1 bg-[#EAE4D7]/70 rounded-2xl max-w-md">
        <button
          type="button"
          onClick={() => setActiveTab('stones')}
          className={`flex-1 py-2 px-4 rounded-xl text-xs font-sans font-medium transition-colors cursor-pointer ${
            activeTab === 'stones'
              ? 'bg-white text-[#232521] shadow-xs'
              : 'text-[#232521]/70 hover:text-[#232521]'
          }`}
        >
          Minhas Pedras ({stones.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('origin')}
          className={`flex-1 py-2 px-4 rounded-xl text-xs font-sans font-medium transition-colors cursor-pointer ${
            activeTab === 'origin'
              ? 'bg-white text-[#232521] shadow-xs'
              : 'text-[#232521]/70 hover:text-[#232521]'
          }`}
        >
          De Onde Deus me Tirou
        </button>
      </div>

      {activeTab === 'origin' ? (
        /* Section: De Onde Deus Me Tirou (Page 07 from PDF) */
        <div className="bg-[#FAF7F0] border border-[#EAE4D7] rounded-3xl p-6 sm:p-10 space-y-6">
          <div className="border-b border-[#EAE4D7] pb-4">
            <span className="text-xs font-serif italic text-[#475344]">
              Josué 4 · Lembrar
            </span>
            <h2 className="text-2xl font-serif text-[#232521] font-medium mt-0.5">
              De Onde Deus me Tirou
            </h2>
            <p className="text-sm font-serif italic text-[#363932]/80 mt-1 leading-relaxed max-w-3xl">
              “Antes de escrever sobre aquilo que ainda quero conquistar, olhe para aquilo que já aconteceu. Em Josué 4, depois da travessia do Jordão, pedras foram retiradas do rio para formar um memorial. Este caderno assume essa imagem como prática: guardar aquilo que não queremos esquecer.”
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5">
            {[
              { key: 'q1', num: '1.', label: 'O que existia na minha vida que ficou para trás?' },
              { key: 'q2', num: '2.', label: 'Que ciclos foram encerrados?' },
              { key: 'q3', num: '3.', label: 'Que situações Deus me ajudou a superar?' },
              { key: 'q4', num: '4.', label: 'Que versão de mim ficou pelo caminho?' },
              { key: 'q5', num: '5.', label: 'Que portas foram fechadas para que outras pudessem se abrir?' },
            ].map(item => (
              <div key={item.key} className="space-y-1.5">
                <label className="flex items-center gap-2 text-xs font-serif font-medium text-[#232521]">
                  <span className="font-mono text-[#B49A6A]">{item.num}</span>
                  <span>{item.label}</span>
                </label>
                <input
                  type="text"
                  value={(originAnswers as any)[item.key]}
                  onChange={e =>
                    setOriginAnswers({ ...originAnswers, [item.key]: e.target.value })
                  }
                  placeholder="Sua resposta sincera..."
                  className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#D9D2C3] text-sm text-[#232521] focus:outline-none focus:border-[#B49A6A] font-sans"
                />
              </div>
            ))}

            <div className="space-y-1.5 pt-2">
              <label className="text-xs font-serif font-medium text-[#232521] block">
                Minha história (O relato de gratidão da travessia)
              </label>
              <textarea
                value={originAnswers.story}
                onChange={e => setOriginAnswers({ ...originAnswers, story: e.target.value })}
                rows={5}
                placeholder="Conte com suas palavras a história de onde Deus te tirou até o dia de hoje..."
                className="w-full p-4 rounded-2xl bg-white border border-[#D9D2C3] text-sm text-[#232521] focus:outline-none focus:border-[#B49A6A] font-sans leading-relaxed"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-[#EAE4D7]">
            <SaveIndicator status={originSaveStatus} />
            <button
              type="button"
              onClick={handleSaveOrigin}
              className="px-6 py-2.5 text-xs font-medium text-white bg-[#232521] hover:bg-[#363932] rounded-xl transition-colors cursor-pointer"
            >
              Salvar Reflexão
            </button>
          </div>
        </div>
      ) : (
        /* Section: Stones List & Filters */
        <div className="space-y-6">
          {/* Quick Category Templates from PDF */}
          <div className="bg-[#FAF7F0] border border-[#EAE4D7] rounded-3xl p-5 sm:p-6">
            <span className="text-xs font-serif italic text-[#475344] block mb-3">
              Categorias do Livro das Pedras:
            </span>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => handleOpenCreate(cat)}
                  className="text-xs px-3 py-1.5 rounded-xl bg-white hover:bg-[#FAF7F0] text-[#232521] border border-[#EAE4D7] hover:border-[#B49A6A] transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <StoneIconSVG className="w-3.5 h-3.5 text-[#B49A6A]" />
                  <span>{cat}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Search, Filter Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#FAF7F0] border border-[#EAE4D7] p-3 rounded-2xl">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[#232521]/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Pesquisar pedras por título, relato ou aprendizado..."
                className="w-full pl-10 pr-4 py-2 text-xs text-[#232521] bg-transparent border-none focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2 border-t sm:border-t-0 sm:border-l border-[#EAE4D7] pt-2 sm:pt-0 sm:pl-3">
              <select
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value)}
                className="text-xs bg-white border border-[#D9D2C3] rounded-xl px-3 py-1.5 text-[#232521] focus:outline-none"
              >
                <option value="all">Todas as categorias</option>
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={() => setOnlyFavorites(prev => !prev)}
                className={`p-2 rounded-xl border text-xs transition-colors cursor-pointer flex items-center gap-1 ${
                  onlyFavorites
                    ? 'bg-[#B49A6A] text-white border-[#937B4E]'
                    : 'bg-white text-[#232521]/70 border-[#D9D2C3] hover:text-[#232521]'
                }`}
                title="Mostrar apenas favoritas"
              >
                <Star className="w-3.5 h-3.5 fill-current" />
              </button>
            </div>
          </div>

          {/* Stones Cards Grid */}
          {filteredStones.length === 0 ? (
            <div className="text-center py-16 px-4 bg-[#FAF7F0]/60 border border-dashed border-[#D9D2C3] rounded-3xl space-y-4">
              <div className="w-12 h-12 rounded-full bg-[#EAE4D7]/60 flex items-center justify-center mx-auto text-[#B49A6A]">
                <StoneIconSVG className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-lg text-[#232521]">
                {searchTerm || selectedCategory !== 'all' || onlyFavorites
                  ? 'Nenhuma pedra encontrada para este filtro.'
                  : 'Nenhuma pedra registrada ainda.'}
              </h3>
              <p className="text-xs text-[#363932]/70 font-serif italic max-w-md mx-auto">
                “Toda conquista, aprendizado, livramento ou resposta significativa pode se tornar uma pedra.”
              </p>
              <button
                type="button"
                onClick={() => handleOpenCreate()}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-[#232521] hover:bg-[#363932] rounded-xl transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Registrar primeira pedra</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {filteredStones.map((stone, sIdx) => {
                const contourClass = sIdx % 3 === 0 ? 'stone-contour-1' : sIdx % 3 === 1 ? 'stone-contour-2' : 'stone-contour-3';
                return (
                  <div
                    key={stone.id}
                    className={`bg-white border border-[#EAE4D7] hover:border-[#B49A6A] p-6 space-y-4 shadow-2xs transition-all relative flex flex-col justify-between ${contourClass}`}
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between text-xs text-[#363932]/60">
                        <span className="font-serif italic font-medium text-[#B49A6A]">
                          {stone.category}
                        </span>
                        <div className="flex items-center gap-1 text-[#363932]/50">
                          <Calendar className="w-3 h-3" />
                          <span>
                            {stone.event_date
                              ? new Date(stone.event_date + 'T00:00:00').toLocaleDateString('pt-BR')
                              : new Date(stone.created_at).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                      </div>

                      <h3 className="font-serif text-xl text-[#232521] font-medium leading-snug">
                        {stone.title}
                      </h3>

                      <p className="text-xs text-[#363932]/85 font-sans leading-relaxed whitespace-pre-wrap">
                        {stone.story}
                      </p>

                      {/* Specific PDF questions answers if present */}
                      {stone.personal_meaning && (
                        <div className="pt-2 border-t border-[#EAE4D7]/70 text-xs">
                          <span className="font-serif italic font-medium text-[#475344] block">
                            O que isso significou:
                          </span>
                          <p className="text-[#363932]/80 mt-0.5">{stone.personal_meaning}</p>
                        </div>
                      )}

                      {stone.lessons_learned && (
                        <div className="pt-1.5 text-xs">
                          <span className="font-serif italic font-medium text-[#475344] block">
                            O que aprendi:
                          </span>
                          <p className="text-[#363932]/80 mt-0.5">{stone.lessons_learned}</p>
                        </div>
                      )}

                      {stone.future_strength && (
                        <div className="pt-1.5 text-xs">
                          <span className="font-serif italic font-medium text-[#475344] block">
                            Como fortalecerá no futuro:
                          </span>
                          <p className="text-[#363932]/80 mt-0.5">{stone.future_strength}</p>
                        </div>
                      )}
                    </div>

                    {/* Actions footer */}
                    <div className="flex items-center justify-between pt-3 border-t border-[#EAE4D7] mt-3">
                      <button
                        type="button"
                        onClick={() => handleToggleFavorite(stone)}
                        className={`text-xs p-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1 ${
                          stone.is_favorite
                            ? 'text-[#B49A6A]'
                            : 'text-[#232521]/40 hover:text-[#B49A6A]'
                        }`}
                        title={stone.is_favorite ? 'Remover dos favoritos' : 'Favoritar pedra'}
                      >
                        <Star className={`w-4 h-4 ${stone.is_favorite ? 'fill-current' : ''}`} />
                        <span className="text-[10px] font-sans">
                          {stone.is_favorite ? 'Favorita' : ''}
                        </span>
                      </button>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(stone)}
                          className="p-1.5 text-[#232521]/60 hover:text-[#232521] hover:bg-[#EAE4D7]/50 rounded-lg transition-colors cursor-pointer"
                          title="Editar pedra"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteTargetId(stone.id)}
                          className="p-1.5 text-[#232521]/50 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          title="Excluir pedra"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Create / Edit Stone Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-[#F4F0E7] border border-[#E5DECE] rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl overflow-y-auto max-h-[92vh] space-y-5">
            <div className="border-b border-[#E5DECE] pb-3 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase tracking-widest text-[#B49A6A] font-semibold">
                  O Livro das Pedras · Página 12
                </span>
                <h3 className="text-2xl font-serif text-[#383B32] mt-0.5">
                  {editingStone ? 'Editar Pedra do Memorial' : 'Guardar Nova Pedra'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="p-1.5 text-[#383B32]/60 hover:text-[#383B32] rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitStone} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#383B32]">
                    Título da Pedra *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Ex: A provisão na faculdade, A cura inesperada..."
                    className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#D5CEBE] text-sm text-[#383B32] focus:outline-none focus:border-[#B49A6A]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#383B32]">
                    Categoria
                  </label>
                  <select
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value as StoneCategory })}
                    className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#D5CEBE] text-sm text-[#383B32] focus:outline-none focus:border-[#B49A6A]"
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#383B32]">
                    Data do Acontecimento
                  </label>
                  <input
                    type="date"
                    value={formData.event_date}
                    onChange={e => setFormData({ ...formData, event_date: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#D5CEBE] text-sm text-[#383B32] focus:outline-none focus:border-[#B49A6A]"
                  />
                </div>

                <div className="flex items-center gap-2 pt-6">
                  <label className="flex items-center gap-2 text-xs font-medium text-[#383B32] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_favorite}
                      onChange={e => setFormData({ ...formData, is_favorite: e.target.checked })}
                      className="rounded border-[#D5CEBE] text-[#B49A6A] focus:ring-[#B49A6A]"
                    />
                    <span>Marcar como pedra favorita</span>
                  </label>
                </div>
              </div>

              {/* 01 O que aconteceu? */}
              <div className="space-y-1">
                <label className="text-xs font-serif font-semibold text-[#383B32] flex items-center gap-1.5">
                  <span className="font-mono text-[#B49A6A]">01</span>
                  <span>O que aconteceu? (Relato do acontecimento) *</span>
                </label>
                <textarea
                  required
                  rows={4}
                  value={formData.story}
                  onChange={e => setFormData({ ...formData, story: e.target.value })}
                  placeholder="Descreva com detalhes o que aconteceu, onde você estava e a ação de Deus..."
                  className="w-full p-3.5 rounded-xl bg-white border border-[#D5CEBE] text-sm text-[#383B32] focus:outline-none focus:border-[#B49A6A] font-sans leading-relaxed"
                />
              </div>

              {/* 02 O que eu havia pedido ou esperado? */}
              <div className="space-y-1">
                <label className="text-xs font-serif font-semibold text-[#383B32] flex items-center gap-1.5">
                  <span className="font-mono text-[#B49A6A]">02</span>
                  <span>O que eu havia pedido ou esperado?</span>
                </label>
                <input
                  type="text"
                  value={formData.expected_or_asked}
                  onChange={e => setFormData({ ...formData, expected_or_asked: e.target.value })}
                  placeholder="Qual era o seu pedido ou expectativa anterior?"
                  className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#D5CEBE] text-sm text-[#383B32] focus:outline-none focus:border-[#B49A6A]"
                />
              </div>

              {/* 03 O que isso significou? */}
              <div className="space-y-1">
                <label className="text-xs font-serif font-semibold text-[#383B32] flex items-center gap-1.5">
                  <span className="font-mono text-[#B49A6A]">03</span>
                  <span>O que isso significou?</span>
                </label>
                <textarea
                  rows={2}
                  value={formData.personal_meaning}
                  onChange={e => setFormData({ ...formData, personal_meaning: e.target.value })}
                  placeholder="Qual o significado espiritual e pessoal desta pedra na sua história?"
                  className="w-full p-3 rounded-xl bg-white border border-[#D5CEBE] text-sm text-[#383B32] focus:outline-none focus:border-[#B49A6A]"
                />
              </div>

              {/* 04 O que aprendi? */}
              <div className="space-y-1">
                <label className="text-xs font-serif font-semibold text-[#383B32] flex items-center gap-1.5">
                  <span className="font-mono text-[#B49A6A]">04</span>
                  <span>O que aprendi sobre Deus ou sobre mim?</span>
                </label>
                <textarea
                  rows={2}
                  value={formData.lessons_learned}
                  onChange={e => setFormData({ ...formData, lessons_learned: e.target.value })}
                  placeholder="Que lição fica guardada para sempre?"
                  className="w-full p-3 rounded-xl bg-white border border-[#D5CEBE] text-sm text-[#383B32] focus:outline-none focus:border-[#B49A6A]"
                />
              </div>

              {/* 05 Como essa pedra poderá me fortalecer no futuro? */}
              <div className="space-y-1">
                <label className="text-xs font-serif font-semibold text-[#383B32] flex items-center gap-1.5">
                  <span className="font-mono text-[#B49A6A]">05</span>
                  <span>Como essa pedra poderá me fortalecer no futuro?</span>
                </label>
                <input
                  type="text"
                  value={formData.future_strength}
                  onChange={e => setFormData({ ...formData, future_strength: e.target.value })}
                  placeholder="Quando um novo Jordão chegar, o que esta pedra te fará lembrar?"
                  className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#D5CEBE] text-sm text-[#383B32] focus:outline-none focus:border-[#B49A6A]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E5DECE]">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-[#383B32] hover:bg-[#E5DECE] rounded-xl transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-medium text-white bg-[#383B32] hover:bg-[#2A2C25] rounded-xl transition-colors cursor-pointer"
                >
                  {editingStone ? 'Atualizar Pedra' : 'Guardar Pedra no Memorial'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal for deletion */}
      <ConfirmModal
        isOpen={Boolean(deleteTargetId)}
        title="Excluir Pedra do Memorial?"
        description="Esta ação removerá esta pedra do seu memorial. Os dados relacionados não serão restaurados."
        confirmLabel="Sim, excluir pedra"
        cancelLabel="Cancelar"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTargetId(null)}
      />
    </div>
  );
};
