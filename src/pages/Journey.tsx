import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { storage } from '../lib/storage';
import { Journey, JourneyActivity } from '../types/memorial';
import { PageHeader } from '../components/PageHeader';
import { SaveIndicator, SaveStatus } from '../components/SaveIndicator';
import { 
  Calendar, 
  ChevronRight, 
  ChevronLeft, 
  CheckCircle, 
  Circle, 
  BookOpen, 
  ArrowRight,
  Compass,
  FileText
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface StageDefinition {
  id: string;
  name: string;
  daysRange: string;
  theme: string;
  description: string;
  coreQuestions: string[];
  linkModule: { label: string; path: string };
}

const STAGES: StageDefinition[] = [
  {
    id: 'stage_1',
    name: 'Etapa 1 — Lembrar',
    daysRange: 'Dias 01–15',
    theme: 'Pedras, encontros, desertos e Jordões',
    description: 'Antes de escrever sobre aquilo que ainda quer conquistar, olhe para aquilo que já aconteceu. Em Josué 4, pedras foram retiradas do rio Jordão para que a memória não se perdesse. Olhe para trás com gratidão.',
    coreQuestions: [
      'O que existia na minha vida que ficou para trás?',
      'Que ciclos foram encerrados?',
      'Que situações Deus me ajudou a superar?',
      'Que versão de mim ficou pelo caminho?',
      'Que portas foram fechadas para que outras pudessem se abrir?'
    ],
    linkModule: { label: 'Ir para Minhas Pedras', path: '/pedras' }
  },
  {
    id: 'stage_2',
    name: 'Etapa 2 — Reconhecer',
    daysRange: 'Dias 16–30',
    theme: 'Mapa da vida e realidade atual',
    description: 'Depois de olhar para trás, olhe para o presente. O objetivo não é estar perfeito; é enxergar onde você está e quais passos precisa dar em cada uma das dez áreas da sua vida.',
    coreQuestions: [
      'Onde estou neste momento em minha caminhada?',
      'O que cada área da minha vida está revelando?',
      'Quais são os próximos passos reais e possíveis?'
    ],
    linkModule: { label: 'Preencher o Mapa da Vida', path: '/mapa' }
  },
  {
    id: 'stage_3',
    name: 'Etapa 3 — Discernir',
    daysRange: 'Dias 31–45',
    theme: 'O que importa nesta estação? O que precisa mudar?',
    description: 'Nem todo sonho precisa virar projeto agora. Nem toda oportunidade precisa receber um “sim”. Antes de construir, aprenda a reconhecer a estação e o que Deus colocou diante de você.',
    coreQuestions: [
      'O que está pedindo minha atenção neste momento?',
      'O que precisa ser encerrado?',
      'O que precisa ser preservado?',
      'O que Deus já colocou diante de mim?',
      'O que pode esperar?'
    ],
    linkModule: { label: 'Discernir a Estação', path: '/discernir' }
  },
  {
    id: 'stage_4',
    name: 'Etapa 4 — Sonhar',
    daysRange: 'Dias 46–60',
    theme: 'Sonhos, experiências, vocação e legado',
    description: 'Aqui não existe a obrigação de saber como. É simplesmente um espaço para sonhar com Deus, sem medo e com liberdade para projetar o legado que deseja deixar.',
    coreQuestions: [
      'Eu sonho em...',
      'Um dia eu gostaria de...',
      'Se não tivesse medo, eu...',
      'Que legado gostaria de deixar?'
    ],
    linkModule: { label: 'Abrir Livro dos Sonhos', path: '/sonhos' }
  },
  {
    id: 'stage_5',
    name: 'Etapa 5 — Projetar',
    daysRange: 'Dias 61–75',
    theme: 'Transformar sonhos em projetos e etapas',
    description: 'Sonho sem registro pode permanecer apenas como desejo. Sonho registrado pode se transformar em direção. Direção dividida em passos pode se transformar em projeto.',
    coreQuestions: [
      'Por que quero isso e o que esse sonho representa?',
      'O que está sob meu controle?',
      'Quais são as 4 etapas iniciais deste projeto?',
      'Qual é a data do primeiro passo?'
    ],
    linkModule: { label: 'Construir Meus Projetos', path: '/projetos' }
  },
  {
    id: 'stage_6',
    name: 'Etapa 6 — Agir, Orar e Registrar',
    daysRange: 'Dias 76–90',
    theme: 'Próximos passos, oração, revisão e novas pedras',
    description: 'Ação movimenta os pés. A oração entrega o processo. E o memorial preserva a história. Registre suas orações, colha as respostas e conclua este primeiro ciclo de 90 dias.',
    coreQuestions: [
      'O que estou pedindo, entregando e agradecendo hoje?',
      'Qual resposta de oração merece se tornar uma nova pedra?',
      'Que declaração de memorial levo comigo daqui para frente?'
    ],
    linkModule: { label: 'Abrir Caderno de Oração & Revisões', path: '/oracoes' }
  }
];

export const JourneyPage: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const [journey, setJourney] = useState<Journey | null>(null);
  const [activities, setActivities] = useState<Record<string, JourneyActivity>>({});
  const [activeStageIndex, setActiveStageIndex] = useState(0);
  const [intention, setIntention] = useState('');
  const [showLetterModal, setShowLetterModal] = useState(false);
  const [stageNotes, setStageNotes] = useState('');
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [lastSavedTime, setLastSavedTime] = useState<string>('');

  useEffect(() => {
    if (!user) return;
    setIntention(user.intention_90_days || '');

    const loadData = async () => {
      const [j, acts] = await Promise.all([
        storage.getJourney(user.id),
        storage.getActivities(user.id),
      ]);

      if (j) {
        setJourney(j);
        setActiveStageIndex(j.current_stage_index || 0);
      } else {
        // Initial journey
        const today = new Date().toISOString().split('T')[0];
        const newJ: Journey = {
          id: 'journey_' + Date.now(),
          user_id: user.id,
          start_date: today,
          status: 'active',
          current_stage_index: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        await storage.saveJourney(newJ);
        setJourney(newJ);
      }

      const actMap: Record<string, JourneyActivity> = {};
      acts.forEach(a => {
        actMap[a.stage_id] = a;
      });
      setActivities(actMap);

      const currentAct = acts.find(a => a.stage_id === STAGES[activeStageIndex]?.id);
      if (currentAct?.response_data?.notes) {
        setStageNotes(currentAct.response_data.notes);
      }
    };

    loadData();
  }, [user]);

  // Load stage note when stage changes
  useEffect(() => {
    const stageId = STAGES[activeStageIndex]?.id;
    if (stageId && activities[stageId]?.response_data?.notes) {
      setStageNotes(activities[stageId].response_data.notes);
    } else {
      setStageNotes('');
    }
  }, [activeStageIndex, activities]);

  const handleSaveIntention = async () => {
    if (!user) return;
    setSaveStatus('saving');
    try {
      await updateProfile(user.display_name, intention);
      setSaveStatus('saved');
      setLastSavedTime(new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }));
    } catch {
      setSaveStatus('error');
    }
  };

  const handleSaveStageNotes = async () => {
    if (!user) return;
    const stage = STAGES[activeStageIndex];
    if (!stage) return;

    setSaveStatus('saving');
    try {
      const existing = activities[stage.id];
      const updatedActivity: JourneyActivity = {
        id: existing?.id || 'act_' + Date.now(),
        user_id: user.id,
        stage_id: stage.id,
        activity_key: 'stage_reflection',
        response_data: {
          ...(existing?.response_data || {}),
          notes: stageNotes,
        },
        completed: existing?.completed || false,
        updated_at: new Date().toISOString(),
      };
      await storage.saveActivity(updatedActivity);
      setActivities(prev => ({ ...prev, [stage.id]: updatedActivity }));
      setSaveStatus('saved');
      setLastSavedTime(new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }));
    } catch {
      setSaveStatus('error');
    }
  };

  const handleToggleStageCompletion = async () => {
    if (!user) return;
    const stage = STAGES[activeStageIndex];
    if (!stage) return;

    const existing = activities[stage.id];
    const isCompleted = !existing?.completed;

    const updatedActivity: JourneyActivity = {
      id: existing?.id || 'act_' + Date.now(),
      user_id: user.id,
      stage_id: stage.id,
      activity_key: 'stage_reflection',
      response_data: {
        ...(existing?.response_data || {}),
        notes: stageNotes,
      },
      completed: isCompleted,
      updated_at: new Date().toISOString(),
    };

    await storage.saveActivity(updatedActivity);
    setActivities(prev => ({ ...prev, [stage.id]: updatedActivity }));

    // Update journey progress
    if (journey) {
      const nextIndex = Math.min(activeStageIndex + 1, STAGES.length - 1);
      const updatedJourney: Journey = {
        ...journey,
        current_stage_index: nextIndex,
        status: isCompleted && activeStageIndex === STAGES.length - 1 ? 'completed' : 'active',
        updated_at: new Date().toISOString(),
      };
      await storage.saveJourney(updatedJourney);
      setJourney(updatedJourney);
    }
  };

  const currentStage = STAGES[activeStageIndex];
  const isCurrentStageCompleted = Boolean(activities[currentStage?.id]?.completed);

  // Calculate day in journey
  let currentDay = 1;
  if (journey && journey.start_date) {
    const start = new Date(journey.start_date + 'T00:00:00');
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - start.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
    currentDay = Math.min(Math.max(diffDays, 1), 90);
  }

  const completedStagesCount = Object.values(activities).filter(a => a.completed).length;

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-16">
      <PageHeader
        badge="Jornada de 90 Dias"
        title="O Caminho do Memorial"
        subtitle="“Não é uma corrida. É uma caminhada com intenção.” — Organizada em 6 etapas e 8 movimentos fundamentais."
        action={
          <button
            type="button"
            onClick={() => setShowLetterModal(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-[#383B32] bg-white border border-[#E5DECE] hover:border-[#B49A6A] rounded-xl transition-colors cursor-pointer"
          >
            <BookOpen className="w-4 h-4 text-[#879579]" />
            <span>Ler Carta Antes de Começar</span>
          </button>
        }
      />

      {/* Intention Section (Page 02 from PDF) */}
      <div className="bg-[#FAF7F0] border border-[#EAE4D7] rounded-3xl p-6 sm:p-8 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <span className="text-xs font-serif italic text-[#475344]">
              Antes de começar · Página 02
            </span>
            <h3 className="font-serif text-xl text-[#232521] font-medium">
              Minha intenção para estes 90 dias
            </h3>
          </div>
          <SaveIndicator status={saveStatus} lastSavedTime={lastSavedTime} />
        </div>

        <p className="text-xs sm:text-sm text-[#363932]/75 font-serif italic max-w-3xl leading-relaxed">
          “Separe um momento semanal para escrever. Não procure respostas perfeitas. Escreva com honestidade, ore enquanto escreve e permita que o memorial seja construído aos poucos.”
        </p>

        <div className="space-y-3">
          <textarea
            value={intention}
            onChange={e => setIntention(e.target.value)}
            rows={3}
            placeholder="Qual é a sua oração e intenção para esta caminhada com Deus? O que você deseja lembrar, discernir ou construir?"
            className="w-full p-4 rounded-2xl bg-white border border-[#D9D2C3] text-sm text-[#232521] focus:outline-none focus:border-[#B49A6A] transition-colors resize-y font-sans leading-relaxed"
          />
          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleSaveIntention}
              className="px-5 py-2 text-xs font-medium text-white bg-[#232521] hover:bg-[#363932] rounded-xl transition-colors cursor-pointer"
            >
              Salvar Intenção
            </button>
          </div>
        </div>
      </div>

      {/* 8 Movements Overview (Page 04 from PDF) */}
      <div className="bg-[#FAF7F0] border border-[#EAE4D7] rounded-3xl p-6">
        <span className="text-xs font-serif italic text-[#475344] block mb-3">
          O Método do Memorial dos Santos · 8 Movimentos
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5 text-center text-xs">
          {[
            { num: '01', name: 'Lembrar', sub: 'O que Deus já fez?' },
            { num: '02', name: 'Reconhecer', sub: 'Onde estou agora?' },
            { num: '03', name: 'Discernir', sub: 'O que importa nesta estação?' },
            { num: '04', name: 'Sonhar', sub: 'O que desejo viver ou construir?' },
            { num: '05', name: 'Projetar', sub: 'Como transformar sonho em caminho?' },
            { num: '06', name: 'Agir', sub: 'Qual é o próximo passo possível?' },
            { num: '07', name: 'Orar', sub: 'O que entrego a Deus?' },
            { num: '08', name: 'Registrar', sub: 'Qual pedra guardar?' },
          ].map(m => (
            <div key={m.num} className="bg-white p-3 rounded-2xl border border-[#EAE4D7] flex flex-col justify-between">
              <span className="font-mono text-[10px] text-[#B49A6A] font-semibold">{m.num}</span>
              <span className="font-serif font-medium text-[#232521] text-xs my-0.5">{m.name}</span>
              <span className="text-[10px] text-[#363932]/70 font-sans leading-tight">{m.sub}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Stages Horizontal Selector */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs uppercase tracking-widest text-[#383B32]/70 font-semibold">
            As 6 Etapas da Jornada ({completedStagesCount}/6 Concluídas)
          </h3>
          <span className="text-xs font-serif italic text-[#B49A6A]">
            Dia {currentDay} no calendário
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
          {STAGES.map((st, idx) => {
            const isCompleted = activities[st.id]?.completed;
            const isSelected = activeStageIndex === idx;
            return (
              <button
                key={st.id}
                type="button"
                onClick={() => setActiveStageIndex(idx)}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'bg-[#383B32] text-white border-[#383B32] shadow-sm'
                    : isCompleted
                    ? 'bg-white text-[#383B32] border-[#879579]'
                    : 'bg-white/60 text-[#383B32]/80 border-[#E5DECE] hover:bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-mono font-medium ${
                    isSelected ? 'text-[#E5DECE]' : 'text-[#879579]'
                  }`}>
                    {st.daysRange}
                  </span>
                  {isCompleted ? (
                    <CheckCircle className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-[#879579]'}`} />
                  ) : (
                    <Circle className={`w-3.5 h-3.5 ${isSelected ? 'text-white/40' : 'text-[#383B32]/30'}`} />
                  )}
                </div>
                <span className="font-serif font-medium text-xs mt-2 truncate">
                  {st.name.split('—')[1]?.trim() || st.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Stage Detail & Reflection Workspace */}
      <div className="bg-white/80 border border-[#E5DECE] rounded-2xl p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-[#E5DECE] pb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-wider font-semibold text-[#B49A6A]">
                {currentStage.daysRange}
              </span>
              <span className="text-xs text-[#383B32]/50">·</span>
              <span className="text-xs text-[#879579] font-medium">
                {currentStage.theme}
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif text-[#383B32] mt-1">
              {currentStage.name}
            </h2>
            <p className="text-sm text-[#383B32]/80 font-serif italic mt-2 max-w-3xl leading-relaxed">
              {currentStage.description}
            </p>
          </div>

          <div className="shrink-0 flex items-center gap-3">
            <Link
              to={currentStage.linkModule.path}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-[#383B32] bg-[#E5DECE]/60 hover:bg-[#E5DECE] rounded-xl transition-colors border border-[#D5CEBE]"
            >
              <span>{currentStage.linkModule.label}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Core questions from the stage */}
        <div className="bg-[#F4F0E7]/60 border border-[#E5DECE] rounded-xl p-5 space-y-2.5">
          <span className="text-xs uppercase font-semibold text-[#879579] tracking-wider block mb-1">
            Perguntas & Exercícios do Livro para esta Etapa:
          </span>
          <ul className="space-y-2 text-sm text-[#383B32]/90 font-serif">
            {currentStage.coreQuestions.map((q, qIdx) => (
              <li key={qIdx} className="flex items-start gap-2.5">
                <span className="font-mono text-xs text-[#B49A6A] font-semibold mt-0.5">
                  0{qIdx + 1}
                </span>
                <span>{q}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Personal writing space for this stage */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold uppercase tracking-wider text-[#383B32]/70">
              Suas Anotações e Reflexões Desta Etapa
            </label>
            <SaveIndicator status={saveStatus} lastSavedTime={lastSavedTime} />
          </div>

          <textarea
            value={stageNotes}
            onChange={e => setStageNotes(e.target.value)}
            rows={8}
            placeholder="Escreva livremente suas respostas, aprendizados e orações vividas nesta fase..."
            className="w-full p-4 rounded-xl bg-[#F4F0E7]/40 border border-[#D5CEBE] text-sm text-[#383B32] focus:outline-none focus:border-[#B49A6A] transition-colors resize-y font-sans leading-relaxed"
          />

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
            <button
              type="button"
              onClick={handleToggleStageCompletion}
              className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-medium text-xs transition-colors cursor-pointer ${
                isCurrentStageCompleted
                  ? 'bg-emerald-700 text-white hover:bg-emerald-800'
                  : 'bg-[#B49A6A] text-white hover:bg-[#9A8052]'
              }`}
            >
              <CheckCircle className="w-4 h-4" />
              <span>
                {isCurrentStageCompleted
                  ? 'Etapa Concluída (Clique para reabrir)'
                  : 'Marcar Etapa como Concluída'}
              </span>
            </button>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={handleSaveStageNotes}
                className="px-4 py-2 text-xs font-medium text-[#383B32] bg-white border border-[#D5CEBE] hover:bg-[#E5DECE] rounded-xl transition-colors cursor-pointer"
              >
                Salvar Rascunho
              </button>

              <button
                type="button"
                disabled={activeStageIndex === 0}
                onClick={() => setActiveStageIndex(prev => Math.max(prev - 1, 0))}
                className="p-2 rounded-lg border border-[#D5CEBE] text-[#383B32] disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white cursor-pointer"
                title="Etapa anterior"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                disabled={activeStageIndex === STAGES.length - 1}
                onClick={() => setActiveStageIndex(prev => Math.min(prev + 1, STAGES.length - 1))}
                className="p-2 rounded-lg border border-[#D5CEBE] text-[#383B32] disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white cursor-pointer"
                title="Próxima etapa"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal: Uma carta antes de começar (Page 03 from PDF) */}
      {showLetterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-[#F4F0E7] border border-[#E5DECE] rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl overflow-y-auto max-h-[90vh] space-y-6">
            <div className="border-b border-[#E5DECE] pb-4 flex items-center justify-between">
              <div>
                <span className="text-[11px] uppercase tracking-widest text-[#879579] font-medium">
                  Introdução · Página 03
                </span>
                <h3 className="text-2xl font-serif text-[#383B32] mt-0.5">
                  Uma carta antes de começar
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowLetterModal(false)}
                className="text-xs px-3 py-1.5 rounded-lg bg-[#E5DECE] hover:bg-[#D5CEBE] text-[#383B32] cursor-pointer"
              >
                Fechar
              </button>
            </div>

            <div className="prose text-sm sm:text-base font-serif text-[#383B32]/90 space-y-4 leading-relaxed">
              <p>
                Talvez você tenha chegado até aqui carregando sonhos que ainda não sabe como realizar. Talvez existam histórias que você quase esqueceu. Talvez existam respostas de oração que, com o passar do tempo, deixaram de ser lembradas. Talvez você esteja atravessando um deserto. Ou diante de um Jordão.
              </p>
              <p>
                Este memorial nasceu para ajudar você a parar por um momento e olhar para a própria caminhada.
              </p>
              <p className="font-semibold italic text-[#879579]">
                Não para viver preso ao passado, mas para lembrar.
              </p>
              <p>
                Porque quem se lembra das pedras consegue atravessar novos Jordões com outra perspectiva.
              </p>
              <p>
                Ao longo destas páginas, você será convidado a olhar para trás, reconhecer onde está, registrar aquilo que sonha, transformar sonhos em projetos, definir próximos passos e entregar o caminho a Deus.
              </p>
              <p>
                Não tenha pressa. Algumas páginas pedirão respostas. Outras pedirão silêncio. Algumas registrarão conquistas. Outras guardarão dores.
              </p>
              <p>
                Todas elas fazem parte da história.
              </p>
              <p>
                Escreva com honestidade. Ore enquanto escreve. E quando encontrar uma pedra da sua história que merece ser guardada, registre-a.
              </p>
              <p>
                Um dia você voltará aqui. E talvez descubra que Deus estava escrevendo uma história muito maior do que você conseguia enxergar naquele momento.
              </p>
              <div className="pt-4 border-t border-[#E5DECE] text-center font-sans uppercase tracking-widest text-xs font-semibold text-[#B49A6A]">
                COMECE LEMBRANDO. DEPOIS, CONTINUE CAMINHANDO.
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setShowLetterModal(false)}
                className="px-5 py-2 text-xs font-medium text-white bg-[#383B32] hover:bg-[#2A2C25] rounded-xl transition-colors cursor-pointer"
              >
                Continuar para o Memorial
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
