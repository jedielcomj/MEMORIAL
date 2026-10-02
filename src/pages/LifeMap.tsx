import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { storage } from '../lib/storage';
import { LifeAreaKey, LifeAreaReflection } from '../types/memorial';
import { PageHeader } from '../components/PageHeader';
import { SaveIndicator, SaveStatus } from '../components/SaveIndicator';
import { 
  Sparkles, 
  Heart, 
  Users, 
  Briefcase, 
  DollarSign, 
  Home, 
  Lightbulb, 
  Compass, 
  Globe2, 
  UserCheck,
  CheckCircle,
  Clock
} from 'lucide-react';

interface AreaConfig {
  key: LifeAreaKey;
  num: string;
  title: string;
  icon: any;
  questionsPrompt: string;
  color: string;
}

const LIFE_AREAS: AreaConfig[] = [
  {
    key: 'vida_com_deus',
    num: '01',
    title: 'Minha vida com Deus',
    icon: Compass,
    questionsPrompt: 'Como está minha caminhada espiritual? O que Deus já fez? O que desejo viver? Qual é o próximo passo?',
    color: 'text-[#B49A6A]'
  },
  {
    key: 'vida_pessoal',
    num: '02',
    title: 'Minha vida pessoal',
    icon: UserCheck,
    questionsPrompt: 'Identidade, caráter, disciplina, conhecimento, criatividade, hábitos e crescimento pessoal.',
    color: 'text-[#879579]'
  },
  {
    key: 'familia',
    num: '03',
    title: 'Família',
    icon: Heart,
    questionsPrompt: 'Pelo que sou grato(a)? O que desejo construir? Que relacionamento precisa de atenção?',
    color: 'text-red-500/80'
  },
  {
    key: 'relacionamentos',
    num: '04',
    title: 'Relacionamentos e amizades',
    icon: Users,
    questionsPrompt: 'Quem marcou minha caminhada? O que aprendi? Que relacionamentos quero construir?',
    color: 'text-[#383B32]'
  },
  {
    key: 'trabalho_proposito',
    num: '05',
    title: 'Trabalho, profissão e propósito',
    icon: Briefcase,
    questionsPrompt: 'Onde estou? O que já conquistei? Onde quero chegar?',
    color: 'text-[#879579]'
  },
  {
    key: 'financas',
    num: '06',
    title: 'Finanças e provisão',
    icon: DollarSign,
    questionsPrompt: 'O que preciso organizar? O que desejo conquistar? Qual é meu primeiro passo financeiro?',
    color: 'text-[#B49A6A]'
  },
  {
    key: 'casa_patrimonio',
    num: '07',
    title: 'Casa e patrimônio',
    icon: Home,
    questionsPrompt: 'O que desejo transformar? Qual é meu sonho para minha casa?',
    color: 'text-[#383B32]'
  },
  {
    key: 'criatividade_projetos',
    num: '08',
    title: 'Criatividade e projetos',
    icon: Lightbulb,
    questionsPrompt: 'Que ideias nasceram? O que podem se tornar? O que preciso para tirá-las do papel?',
    color: 'text-[#B49A6A]'
  },
  {
    key: 'sonhos_experiencias',
    num: '09',
    title: 'Sonhos e experiências',
    icon: Sparkles,
    questionsPrompt: 'Curto, médio e longo prazo. O que gostaria de viver?',
    color: 'text-[#879579]'
  },
  {
    key: 'servico_impacto',
    num: '10',
    title: 'Serviço e impacto',
    icon: Globe2,
    questionsPrompt: 'O que existe em mim que pode abençoar outras pessoas? Que legado desejo deixar?',
    color: 'text-[#383B32]'
  },
];

export const LifeMapPage: React.FC = () => {
  const { user } = useAuth();
  const [reflections, setReflections] = useState<Record<LifeAreaKey, LifeAreaReflection>>({} as any);
  const [activeAreaKey, setActiveAreaKey] = useState<LifeAreaKey>('vida_com_deus');
  const [currentForm, setCurrentForm] = useState({
    where_i_am: '',
    what_i_desire: '',
    next_step: '',
  });
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [lastSavedTime, setLastSavedTime] = useState<string>('');

  useEffect(() => {
    if (!user) return;
    const loadReflections = async () => {
      const items = await storage.getLifeAreas(user.id);
      const map: Record<string, LifeAreaReflection> = {};
      items.forEach(item => {
        map[item.area_key] = item;
      });
      setReflections(map as any);

      // Initialize form with active area
      if (map[activeAreaKey]) {
        setCurrentForm({
          where_i_am: map[activeAreaKey].where_i_am || '',
          what_i_desire: map[activeAreaKey].what_i_desire || '',
          next_step: map[activeAreaKey].next_step || '',
        });
      }
    };
    loadReflections();
  }, [user]);

  // When active area tab changes, update form
  const handleSelectArea = (key: LifeAreaKey) => {
    setActiveAreaKey(key);
    const item = reflections[key];
    if (item) {
      setCurrentForm({
        where_i_am: item.where_i_am || '',
        what_i_desire: item.what_i_desire || '',
        next_step: item.next_step || '',
      });
    } else {
      setCurrentForm({
        where_i_am: '',
        what_i_desire: '',
        next_step: '',
      });
    }
    setSaveStatus('idle');
  };

  const handleSaveArea = async () => {
    if (!user) return;
    const activeConfig = LIFE_AREAS.find(a => a.key === activeAreaKey);
    if (!activeConfig) return;

    setSaveStatus('saving');
    try {
      const existing = reflections[activeAreaKey];
      const updated: LifeAreaReflection = {
        id: existing?.id || 'area_' + activeAreaKey + '_' + user.id,
        user_id: user.id,
        area_key: activeAreaKey,
        area_title: activeConfig.title,
        where_i_am: currentForm.where_i_am.trim(),
        what_i_desire: currentForm.what_i_desire.trim(),
        next_step: currentForm.next_step.trim(),
        reflection_date: new Date().toISOString().split('T')[0],
        created_at: existing?.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      await storage.saveLifeArea(updated);
      setReflections(prev => ({ ...prev, [activeAreaKey]: updated }));
      setSaveStatus('saved');
      setLastSavedTime(new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }));
    } catch {
      setSaveStatus('error');
    }
  };

  const activeArea = LIFE_AREAS.find(a => a.key === activeAreaKey)!;
  const ActiveIcon = activeArea.icon;

  const completedCount = LIFE_AREAS.filter(a => {
    const ref = reflections[a.key];
    return ref && (ref.where_i_am || ref.what_i_desire || ref.next_step);
  }).length;

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-16">
      <PageHeader
        badge="Parte 2 · O Mapa da Minha Vida"
        title="O Mapa da Minha Vida"
        subtitle="“Depois de olhar para trás, olhe para o presente. O objetivo não é estar perfeito; é enxergar onde você está e quais passos precisa dar.”"
      />

      {/* Progress pill indicator */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white/70 border border-[#E5DECE] p-4 rounded-xl">
        <div className="flex items-center gap-2">
          <span className="text-xs uppercase tracking-wider font-semibold text-[#879579]">
            Áreas Preenchidas:
          </span>
          <span className="text-xs font-mono font-bold text-[#383B32]">
            {completedCount} de 10
          </span>
        </div>
        <span className="text-xs font-serif italic text-[#383B32]/70">
          Para cada área: onde estou · o que desejo · próximo passo.
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Navigation: The 10 Areas List */}
        <div className="lg:col-span-4 space-y-1.5">
          <span className="text-[10px] uppercase font-semibold text-[#383B32]/50 tracking-wider px-2">
            Selecione uma Área
          </span>
          <div className="space-y-1">
            {LIFE_AREAS.map(area => {
              const isSelected = activeAreaKey === area.key;
              const ref = reflections[area.key];
              const isFilled = ref && (ref.where_i_am || ref.what_i_desire || ref.next_step);
              const AreaIcon = area.icon;

              return (
                <button
                  key={area.key}
                  type="button"
                  onClick={() => handleSelectArea(area.key)}
                  className={`w-full p-3 rounded-xl border text-left transition-all flex items-center justify-between cursor-pointer ${
                    isSelected
                      ? 'bg-[#383B32] text-white border-[#383B32] shadow-xs'
                      : isFilled
                      ? 'bg-white text-[#383B32] border-[#879579]/60 hover:bg-white'
                      : 'bg-white/60 text-[#383B32]/80 border-[#E5DECE] hover:bg-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className={`font-mono text-xs font-semibold ${
                      isSelected ? 'text-[#E5DECE]' : 'text-[#B49A6A]'
                    }`}>
                      {area.num}
                    </span>
                    <AreaIcon className={`w-4 h-4 shrink-0 ${
                      isSelected ? 'text-white' : area.color
                    }`} />
                    <span className="text-xs font-serif font-medium truncate">
                      {area.title}
                    </span>
                  </div>

                  {isFilled && (
                    <CheckCircle className={`w-3.5 h-3.5 shrink-0 ${
                      isSelected ? 'text-white' : 'text-[#879579]'
                    }`} />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Content: Workspace for Active Area */}
        <div className="lg:col-span-8 bg-white/85 border border-[#E5DECE] rounded-2xl p-6 sm:p-8 space-y-6">
          <div className="border-b border-[#E5DECE] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#E5DECE]/60 flex items-center justify-center">
                <ActiveIcon className={`w-5 h-5 ${activeArea.color}`} />
              </div>
              <div>
                <span className="font-mono text-xs font-semibold text-[#B49A6A]">
                  Área {activeArea.num} de 10
                </span>
                <h2 className="text-2xl font-serif text-[#383B32]">
                  {activeArea.title}
                </h2>
              </div>
            </div>

            <SaveIndicator status={saveStatus} lastSavedTime={lastSavedTime} />
          </div>

          {/* Guide questions from PDF */}
          <div className="bg-[#F4F0E7]/60 border border-[#E5DECE] rounded-xl p-4">
            <span className="text-[11px] uppercase tracking-wider font-semibold text-[#879579] block mb-1">
              Perguntas Orientadoras do Manual:
            </span>
            <p className="text-sm font-serif italic text-[#383B32]/90 leading-relaxed">
              “{activeArea.questionsPrompt}”
            </p>
          </div>

          {/* 3 Core Fields from PDF page 14 */}
          <div className="space-y-5">
            {/* Onde estou */}
            <div className="space-y-1.5">
              <label className="text-xs font-serif font-semibold text-[#383B32] flex items-center justify-between">
                <span>01. Onde estou agora? (Realidade presente e honesta)</span>
              </label>
              <textarea
                rows={3}
                value={currentForm.where_i_am}
                onChange={e => setCurrentForm({ ...currentForm, where_i_am: e.target.value })}
                placeholder="Descreva sem cobranças como está esta área da sua vida no momento atual..."
                className="w-full p-3.5 rounded-xl bg-[#F4F0E7]/40 border border-[#D5CEBE] text-sm text-[#383B32] focus:outline-none focus:border-[#B49A6A] font-sans leading-relaxed"
              />
            </div>

            {/* O que desejo */}
            <div className="space-y-1.5">
              <label className="text-xs font-serif font-semibold text-[#383B32] flex items-center justify-between">
                <span>02. O que desejo? (Visão, cura, crescimento ou direção)</span>
              </label>
              <textarea
                rows={3}
                value={currentForm.what_i_desire}
                onChange={e => setCurrentForm({ ...currentForm, what_i_desire: e.target.value })}
                placeholder="O que você sonha ou deseja ver transformado e frutificando aqui?"
                className="w-full p-3.5 rounded-xl bg-[#F4F0E7]/40 border border-[#D5CEBE] text-sm text-[#383B32] focus:outline-none focus:border-[#B49A6A] font-sans leading-relaxed"
              />
            </div>

            {/* Próximo passo */}
            <div className="space-y-1.5">
              <label className="text-xs font-serif font-semibold text-[#383B32] flex items-center justify-between">
                <span>03. Próximo passo (Uma ação simples, real e possível)</span>
              </label>
              <input
                type="text"
                value={currentForm.next_step}
                onChange={e => setCurrentForm({ ...currentForm, next_step: e.target.value })}
                placeholder="Qual é a primeira atitude prática que você pode tomar esta semana?"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F4F0E7]/40 border border-[#D5CEBE] text-sm text-[#383B32] focus:outline-none focus:border-[#B49A6A] font-sans"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-[#E5DECE]">
            <span className="text-xs text-[#383B32]/50 font-serif italic">
              {reflections[activeAreaKey]?.reflection_date 
                ? `Última reflexão: ${new Date(reflections[activeAreaKey].reflection_date + 'T00:00:00').toLocaleDateString('pt-BR')}`
                : 'Novo registro'}
            </span>

            <button
              type="button"
              onClick={handleSaveArea}
              className="px-6 py-2 text-xs font-medium text-white bg-[#383B32] hover:bg-[#2A2C25] rounded-xl transition-colors cursor-pointer"
            >
              Salvar Área
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
