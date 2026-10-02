import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { storage } from '../lib/storage';
import { Journey, Stone, Prayer, Project, Dream } from '../types/memorial';
import { MemorialHeroArt, StoneIconSVG } from '../components/MemorialArt';
import { 
  CalendarDays, 
  ArrowRight, 
  Sparkles, 
  FolderGit2, 
  Heart, 
  Plus, 
  Compass,
  CheckCircle2,
  Bookmark
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [journey, setJourney] = useState<Journey | null>(null);
  const [recentStones, setRecentStones] = useState<Stone[]>([]);
  const [recentPrayers, setRecentPrayers] = useState<Prayer[]>([]);
  const [projectsCount, setProjectsCount] = useState<number>(0);
  const [dreamsCount, setDreamsCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const loadDashboardData = async () => {
      try {
        const [j, st, pr, proj, dr] = await Promise.all([
          storage.getJourney(user.id),
          storage.getStones(user.id),
          storage.getPrayers(user.id),
          storage.getProjects(user.id),
          storage.getDreams(user.id),
        ]);
        setJourney(j);
        setRecentStones(st.slice(0, 3));
        setRecentPrayers(pr.slice(0, 3));
        setProjectsCount(proj.length);
        setDreamsCount(dr.length);
      } catch (err) {
        console.error('Erro ao carregar dados do memorial:', err);
      } finally {
        setLoading(false);
      }
    };
    loadDashboardData();
  }, [user]);

  // Calculate day of journey if started
  let currentDay = 1;
  let journeyStage = 'Lembrar (Dias 01–15)';
  let progressPercent = 0;

  if (journey && journey.start_date) {
    const start = new Date(journey.start_date + 'T00:00:00');
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - start.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
    currentDay = Math.min(Math.max(diffDays, 1), 90);
    progressPercent = Math.round((currentDay / 90) * 100);

    if (currentDay <= 15) journeyStage = 'Lembrar · Dias 01–15';
    else if (currentDay <= 30) journeyStage = 'Reconhecer · Dias 16–30';
    else if (currentDay <= 45) journeyStage = 'Discernir · Dias 31–45';
    else if (currentDay <= 60) journeyStage = 'Sonhar · Dias 46–60';
    else if (currentDay <= 75) journeyStage = 'Projetar · Dias 61–75';
    else journeyStage = 'Agir, Orar e Registrar · Dias 76–90';
  }

  const handleStartJourney = async () => {
    if (!user) return;
    const today = new Date().toISOString().split('T')[0];
    const newJourney: Journey = {
      id: 'journey_' + Date.now(),
      user_id: user.id,
      start_date: today,
      status: 'active',
      current_stage_index: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    await storage.saveJourney(newJourney);
    setJourney(newJourney);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      {/* Cover Hero Art */}
      <MemorialHeroArt />

      {/* Welcome & Biblical Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/70 border border-[#E5DECE] p-6 rounded-2xl">
        <div>
          <span className="text-xs uppercase tracking-widest text-[#879579] font-medium block">
            Paz e graça, {user?.display_name || 'Peregrino'}
          </span>
          <h2 className="text-2xl sm:text-3xl font-serif text-[#383B32] mt-0.5">
            Meu Memorial
          </h2>
          <p className="text-sm text-[#383B32]/75 font-serif italic mt-1">
            {user?.intention_90_days 
              ? `“${user.intention_90_days}”`
              : '“Até aqui nos ajudou o Senhor.” — 1 Samuel 7:12'}
          </p>
        </div>

        <div>
          {journey ? (
            <Link
              to="/jornada"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#383B32] text-white hover:bg-[#2A2C25] font-medium text-xs transition-colors shadow-xs"
            >
              <span>Continuar minha jornada</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          ) : (
            <button
              type="button"
              onClick={handleStartJourney}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#B49A6A] hover:bg-[#9A8052] text-white font-medium text-xs transition-colors shadow-xs cursor-pointer"
            >
              <Compass className="w-4 h-4" />
              <span>Começar minha jornada de 90 dias</span>
            </button>
          )}
        </div>
      </div>

      {/* Journey Progress Card */}
      {journey && (
        <div className="bg-white/60 border border-[#E5DECE] rounded-2xl p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-[11px] uppercase tracking-wider font-semibold text-[#B49A6A]">
                Progresso no Calendário
              </span>
              <h3 className="text-lg font-serif text-[#383B32]">
                Dia {currentDay} de 90 — {journeyStage}
              </h3>
            </div>
            <div className="text-right">
              <span className="font-mono text-sm font-semibold text-[#383B32]">
                {progressPercent}%
              </span>
              <span className="text-xs text-[#383B32]/60 block font-serif">
                Iniciada em {new Date(journey.start_date + 'T00:00:00').toLocaleDateString('pt-BR')}
              </span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-[#E5DECE]/60 rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-[#879579] h-2.5 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${Math.max(progressPercent, 3)}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-xs text-[#383B32]/70 pt-1">
            <span>Início: Lembrar</span>
            <span className="hidden sm:inline">Discernir & Sonhar</span>
            <span>Final: Agir & Registrar</span>
          </div>
        </div>
      )}

      {/* Quick Shortcuts to the Core Pillars */}
      <div>
        <h3 className="text-xs uppercase tracking-widest text-[#383B32]/60 font-semibold mb-4 px-1">
          Acessos Rápidos do Caderno
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link
            to="/pedras"
            className="group p-5 bg-white/70 hover:bg-white border border-[#E5DECE] hover:border-[#B49A6A] rounded-xl transition-all shadow-2xs hover:shadow-xs"
          >
            <div className="w-9 h-9 rounded-lg bg-[#E5DECE]/50 flex items-center justify-center text-[#B49A6A] group-hover:bg-[#B49A6A] group-hover:text-white transition-colors mb-3">
              <StoneIconSVG className="w-5 h-5" />
            </div>
            <h4 className="font-serif font-medium text-base text-[#383B32]">
              Minhas Pedras
            </h4>
            <p className="text-xs text-[#383B32]/65 font-sans mt-1">
              {recentStones.length} {recentStones.length === 1 ? 'pedra guardada' : 'pedras guardadas'}
            </p>
          </Link>

          <Link
            to="/sonhos"
            className="group p-5 bg-white/70 hover:bg-white border border-[#E5DECE] hover:border-[#879579] rounded-xl transition-all shadow-2xs hover:shadow-xs"
          >
            <div className="w-9 h-9 rounded-lg bg-[#E5DECE]/50 flex items-center justify-center text-[#879579] group-hover:bg-[#879579] group-hover:text-white transition-colors mb-3">
              <Sparkles className="w-5 h-5" />
            </div>
            <h4 className="font-serif font-medium text-base text-[#383B32]">
              Livro dos Sonhos
            </h4>
            <p className="text-xs text-[#383B32]/65 font-sans mt-1">
              {dreamsCount} {dreamsCount === 1 ? 'sonho registrado' : 'sonhos registrados'}
            </p>
          </Link>

          <Link
            to="/projetos"
            className="group p-5 bg-white/70 hover:bg-white border border-[#E5DECE] hover:border-[#383B32] rounded-xl transition-all shadow-2xs hover:shadow-xs"
          >
            <div className="w-9 h-9 rounded-lg bg-[#E5DECE]/50 flex items-center justify-center text-[#383B32] group-hover:bg-[#383B32] group-hover:text-white transition-colors mb-3">
              <FolderGit2 className="w-5 h-5" />
            </div>
            <h4 className="font-serif font-medium text-base text-[#383B32]">
              Meus Projetos
            </h4>
            <p className="text-xs text-[#383B32]/65 font-sans mt-1">
              {projectsCount} {projectsCount === 1 ? 'projeto ativo' : 'projetos ativos'}
            </p>
          </Link>

          <Link
            to="/oracoes"
            className="group p-5 bg-white/70 hover:bg-white border border-[#E5DECE] hover:border-red-400 rounded-xl transition-all shadow-2xs hover:shadow-xs"
          >
            <div className="w-9 h-9 rounded-lg bg-[#E5DECE]/50 flex items-center justify-center text-red-600/80 group-hover:bg-red-600 group-hover:text-white transition-colors mb-3">
              <Heart className="w-5 h-5" />
            </div>
            <h4 className="font-serif font-medium text-base text-[#383B32]">
              Caderno de Oração
            </h4>
            <p className="text-xs text-[#383B32]/65 font-sans mt-1">
              {recentPrayers.length} {recentPrayers.length === 1 ? 'oração recente' : 'orações recentes'}
            </p>
          </Link>
        </div>
      </div>

      {/* Two Column Section: Recent Stones & Recent Prayers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recent Stones */}
        <div className="bg-white/60 border border-[#E5DECE] rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <StoneIconSVG className="w-4 h-4 text-[#B49A6A]" />
              <h3 className="font-serif text-lg text-[#383B32]">
                Pedras Recentes
              </h3>
            </div>
            <Link
              to="/pedras"
              className="text-xs font-medium text-[#879579] hover:text-[#6E7C61]"
            >
              Ver todas
            </Link>
          </div>

          {recentStones.length === 0 ? (
            <div className="py-8 text-center space-y-3 bg-[#F4F0E7]/40 rounded-xl border border-dashed border-[#D5CEBE]">
              <p className="text-sm font-serif italic text-[#383B32]/70">
                Nenhuma pedra registrada ainda.
              </p>
              <Link
                to="/pedras"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-[#B49A6A] hover:bg-[#9A8052] rounded-lg transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Registrar primeira pedra</span>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {recentStones.map(stone => (
                <Link
                  key={stone.id}
                  to={`/pedras`}
                  className="block p-3.5 rounded-xl bg-white border border-[#E5DECE] hover:border-[#B49A6A] transition-colors"
                >
                  <div className="flex items-center justify-between text-xs text-[#383B32]/60 mb-1">
                    <span className="font-serif italic font-medium text-[#B49A6A]">
                      {stone.category}
                    </span>
                    <span>
                      {stone.event_date
                        ? new Date(stone.event_date + 'T00:00:00').toLocaleDateString('pt-BR')
                        : new Date(stone.created_at).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                  <h4 className="font-serif font-medium text-[#383B32] text-sm">
                    {stone.title}
                  </h4>
                  <p className="text-xs text-[#383B32]/75 line-clamp-2 mt-1 font-sans">
                    {stone.story}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Recent Prayers */}
        <div className="bg-white/60 border border-[#E5DECE] rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Heart className="w-4 h-4 text-red-500/80" />
              <h3 className="font-serif text-lg text-[#383B32]">
                Orações no Caderno
              </h3>
            </div>
            <Link
              to="/oracoes"
              className="text-xs font-medium text-[#879579] hover:text-[#6E7C61]"
            >
              Ver todas
            </Link>
          </div>

          {recentPrayers.length === 0 ? (
            <div className="py-8 text-center space-y-3 bg-[#F4F0E7]/40 rounded-xl border border-dashed border-[#D5CEBE]">
              <p className="text-sm font-serif italic text-[#383B32]/70">
                Seu caderno de orações está pronto para receber suas palavras.
              </p>
              <Link
                to="/oracoes"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-[#383B32] hover:bg-[#2A2C25] rounded-lg transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Escrever oração</span>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {recentPrayers.map(prayer => (
                <Link
                  key={prayer.id}
                  to="/oracoes"
                  className="block p-3.5 rounded-xl bg-white border border-[#E5DECE] hover:border-red-300 transition-colors"
                >
                  <div className="flex items-center justify-between text-xs text-[#383B32]/60 mb-1">
                    <span className={`text-[10px] uppercase font-semibold ${
                      prayer.status === 'respondida' ? 'text-emerald-700' : 'text-[#879579]'
                    }`}>
                      {prayer.status === 'respondida' ? '✓ Respondida' : 'Em oração'}
                    </span>
                    <span>{new Date(prayer.created_at).toLocaleDateString('pt-BR')}</span>
                  </div>
                  <h4 className="font-serif font-medium text-[#383B32] text-sm">
                    {prayer.title || (prayer.asking ? prayer.asking.slice(0, 50) + '...' : 'Oração')}
                  </h4>
                  {prayer.thanking && (
                    <p className="text-xs text-[#383B32]/75 line-clamp-1 mt-1 font-sans">
                      Agradecimento: {prayer.thanking}
                    </p>
                  )}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quote Banner from PDF */}
      <div className="border-t border-b border-[#E5DECE] py-6 px-4 text-center max-w-2xl mx-auto">
        <p className="text-base sm:text-lg font-serif italic text-[#383B32]/90 leading-relaxed">
          “O sonho aponta para o futuro. O projeto organiza o caminho. A ação movimenta os pés. A oração entrega o processo. E o memorial preserva a história.”
        </p>
        <span className="text-xs uppercase tracking-widest text-[#B49A6A] font-medium block mt-2">
          Memorial dos Santos · Página 05
        </span>
      </div>
    </div>
  );
};
