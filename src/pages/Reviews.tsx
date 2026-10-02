import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { storage } from '../lib/storage';
import { MonthlyReview, AnnualReview, NewJordanReflection, Stone } from '../types/memorial';
import { PageHeader } from '../components/PageHeader';
import { SaveIndicator, SaveStatus } from '../components/SaveIndicator';
import { TenStonesPyramidGraphic, StoneIconSVG } from '../components/MemorialArt';
import { 
  RotateCcw, 
  Calendar, 
  CheckCircle, 
  Search, 
  HelpCircle, 
  Plus, 
  Layers, 
  Sparkles,
  BookOpen
} from 'lucide-react';

export const ReviewsPage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'monthly' | 'annual' | 'jordan' | 'yearStones'>('monthly');
  const [stones, setStones] = useState<Stone[]>([]);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [lastSavedTime, setLastSavedTime] = useState<string>('');

  // 1. Monthly Review State
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [monthlyForm, setMonthlyForm] = useState<MonthlyReview>({
    id: '',
    user_id: '',
    year: currentYear,
    month: currentMonth,
    grateful_things: '',
    stones_to_keep: '',
    lessons_learned: '',
    avoid_repeating: '',
    keep_going: '',
    dream_advanced: '',
    project_attention: '',
    is_completed: false,
    created_at: '',
    updated_at: '',
  });

  // 2. Annual Review State
  const [annualYear, setAnnualYear] = useState(currentYear);
  const [annualForm, setAnnualForm] = useState<AnnualReview>({
    id: '',
    user_id: '',
    year: currentYear,
    what_god_did: '',
    biggest_stones: '',
    biggest_jordan: '',
    opened_closed_doors: '',
    what_built: '',
    living_dreams: '',
    what_changed_in_me: '',
    is_completed: false,
    created_at: '',
    updated_at: '',
  });

  // 3. New Jordan State
  const [newJordans, setNewJordans] = useState<NewJordanReflection[]>([]);
  const [jordanForm, setJordanForm] = useState({
    title: '',
    passed_before: '',
    what_happened_then: '',
    what_learned_then: '',
    who_helped_then: '',
    stone_to_remember_id: '',
  });
  const [isJordanCreating, setIsJordanCreating] = useState(false);

  // 4. Minhas Pedras do Ano (10 Stones Pyramid)
  const [selectedRankToAssign, setSelectedRankToAssign] = useState<number | null>(null);

  useEffect(() => {
    if (!user) return;
    loadAllReviews();
  }, [user, selectedYear, selectedMonth, annualYear]);

  const loadAllReviews = async () => {
    if (!user) return;
    const [allStones, allMonthly, allAnnual, allJordans] = await Promise.all([
      storage.getStones(user.id),
      storage.getMonthlyReviews(user.id),
      storage.getAnnualReviews(user.id),
      storage.getNewJordanReflections(user.id),
    ]);

    setStones(allStones);
    setNewJordans(allJordans);

    // Monthly
    const curMonth = allMonthly.find(m => m.year === selectedYear && m.month === selectedMonth);
    if (curMonth) {
      setMonthlyForm(curMonth);
    } else {
      setMonthlyForm({
        id: `m_${selectedYear}_${selectedMonth}_${user.id}`,
        user_id: user.id,
        year: selectedYear,
        month: selectedMonth,
        grateful_things: '',
        stones_to_keep: '',
        lessons_learned: '',
        avoid_repeating: '',
        keep_going: '',
        dream_advanced: '',
        project_attention: '',
        is_completed: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    }

    // Annual
    const curAnnual = allAnnual.find(a => a.year === annualYear);
    if (curAnnual) {
      setAnnualForm(curAnnual);
    } else {
      setAnnualForm({
        id: `a_${annualYear}_${user.id}`,
        user_id: user.id,
        year: annualYear,
        what_god_did: '',
        biggest_stones: '',
        biggest_jordan: '',
        opened_closed_doors: '',
        what_built: '',
        living_dreams: '',
        what_changed_in_me: '',
        is_completed: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    }
  };

  const handleSaveMonthly = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!user) return;
    setSaveStatus('saving');
    try {
      const toSave: MonthlyReview = {
        ...monthlyForm,
        id: monthlyForm.id || `m_${selectedYear}_${selectedMonth}_${user.id}`,
        user_id: user.id,
        year: selectedYear,
        month: selectedMonth,
        updated_at: new Date().toISOString(),
      };
      await storage.saveMonthlyReview(toSave);
      setMonthlyForm(toSave);
      setSaveStatus('saved');
      setLastSavedTime(new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }));
    } catch {
      setSaveStatus('error');
    }
  };

  const handleSaveAnnual = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!user) return;
    setSaveStatus('saving');
    try {
      const toSave: AnnualReview = {
        ...annualForm,
        id: annualForm.id || `a_${annualYear}_${user.id}`,
        user_id: user.id,
        year: annualYear,
        updated_at: new Date().toISOString(),
      };
      await storage.saveAnnualReview(toSave);
      setAnnualForm(toSave);
      setSaveStatus('saved');
      setLastSavedTime(new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }));
    } catch {
      setSaveStatus('error');
    }
  };

  const handleSaveNewJordan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !jordanForm.title.trim()) return;

    const toSave: NewJordanReflection = {
      id: 'jordan_' + Date.now(),
      user_id: user.id,
      title: jordanForm.title.trim(),
      passed_before: jordanForm.passed_before.trim(),
      what_happened_then: jordanForm.what_happened_then.trim(),
      what_learned_then: jordanForm.what_learned_then.trim(),
      who_helped_then: jordanForm.who_helped_then.trim(),
      stone_to_remember_id: jordanForm.stone_to_remember_id || undefined,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    await storage.saveNewJordanReflection(toSave);
    setNewJordans(prev => [toSave, ...prev]);
    setJordanForm({
      title: '',
      passed_before: '',
      what_happened_then: '',
      what_learned_then: '',
      who_helped_then: '',
      stone_to_remember_id: '',
    });
    setIsJordanCreating(false);
  };

  const handleAssignStoneToRank = async (stone: Stone, rank: number) => {
    if (!user) return;
    const updatedStone: Stone = {
      ...stone,
      year_retrospective_rank: rank,
      retrospective_year: annualYear,
      updated_at: new Date().toISOString(),
    };
    await storage.saveStone(updatedStone);
    setStones(prev => prev.map(s => (s.id === stone.id ? updatedStone : s)));
    setSelectedRankToAssign(null);
  };

  const handleRemoveStoneFromRank = async (stone: Stone) => {
    if (!user) return;
    const updatedStone: Stone = {
      ...stone,
      year_retrospective_rank: undefined,
      retrospective_year: undefined,
      updated_at: new Date().toISOString(),
    };
    await storage.saveStone(updatedStone);
    setStones(prev => prev.map(s => (s.id === stone.id ? updatedStone : s)));
  };

  const retrospectiveStones = stones
    .filter(s => s.year_retrospective_rank && s.retrospective_year === annualYear)
    .map(s => ({
      rank: s.year_retrospective_rank!,
      title: s.title,
      category: s.category,
    }));

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-16">
      <PageHeader
        badge="Revisões & Retrospectivas"
        title="Revisões do Memorial"
        subtitle="“Uma vez por mês, pare. Não para se cobrar. Para lembrar.” — Partes 7, 8, 9 e 10"
      />

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 p-1 bg-[#E5DECE]/60 rounded-xl">
        <button
          type="button"
          onClick={() => setActiveTab('monthly')}
          className={`py-1.5 px-3.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
            activeTab === 'monthly'
              ? 'bg-white text-[#383B32] shadow-xs'
              : 'text-[#383B32]/75 hover:text-[#383B32]'
          }`}
        >
          Parte 7: Revisão Mensal
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('annual')}
          className={`py-1.5 px-3.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
            activeTab === 'annual'
              ? 'bg-white text-[#383B32] shadow-xs'
              : 'text-[#383B32]/75 hover:text-[#383B32]'
          }`}
        >
          Parte 8: Revisão Anual
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('jordan')}
          className={`py-1.5 px-3.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
            activeTab === 'jordan'
              ? 'bg-white text-[#383B32] shadow-xs'
              : 'text-[#383B32]/75 hover:text-[#383B32]'
          }`}
        >
          Parte 9: Quando o Novo Jordão Chegar
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('yearStones')}
          className={`py-1.5 px-3.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
            activeTab === 'yearStones'
              ? 'bg-white text-[#383B32] shadow-xs'
              : 'text-[#383B32]/75 hover:text-[#383B32]'
          }`}
        >
          Parte 10: Pedras do Ano (Pirâmide)
        </button>
      </div>

      {/* TAB 1: REVISÃO MENSAL (Página 22) */}
      {activeTab === 'monthly' && (
        <form onSubmit={handleSaveMonthly} className="bg-white/85 border border-[#E5DECE] rounded-2xl p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5DECE] pb-4">
            <div>
              <span className="text-[11px] uppercase tracking-wider font-semibold text-[#879579]">
                Parte 7 · Revisão Mensal · Página 22
              </span>
              <h2 className="text-2xl font-serif text-[#383B32] mt-0.5">
                Revisão de {monthNames[selectedMonth - 1]} de {selectedYear}
              </h2>
              <p className="text-xs font-serif italic text-[#383B32]/75 mt-0.5">
                “Uma vez por mês, pare. Não para se cobrar. Para lembrar.”
              </p>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={selectedMonth}
                onChange={e => setSelectedMonth(Number(e.target.value))}
                className="text-xs bg-[#F4F0E7] border border-[#D5CEBE] rounded-lg px-2.5 py-1.5 text-[#383B32]"
              >
                {monthNames.map((name, idx) => (
                  <option key={idx + 1} value={idx + 1}>
                    {name}
                  </option>
                ))}
              </select>
              <select
                value={selectedYear}
                onChange={e => setSelectedYear(Number(e.target.value))}
                className="text-xs bg-[#F4F0E7] border border-[#D5CEBE] rounded-lg px-2.5 py-1.5 text-[#383B32]"
              >
                {[currentYear, currentYear - 1, currentYear + 1].map(y => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
              <SaveIndicator status={saveStatus} lastSavedTime={lastSavedTime} />
            </div>
          </div>

          <div className="space-y-5">
            {/* 01 3 coisas pelas quais sou grato(a) */}
            <div className="space-y-1.5">
              <label className="text-xs font-serif font-semibold text-[#383B32] flex items-center gap-2">
                <span className="font-mono text-[#B49A6A]">01</span>
                <span>3 coisas pelas quais sou grato(a)</span>
              </label>
              <textarea
                rows={3}
                value={monthlyForm.grateful_things}
                onChange={e => setMonthlyForm({ ...monthlyForm, grateful_things: e.target.value })}
                placeholder="1. ...&#10;2. ...&#10;3. ..."
                className="w-full p-3 rounded-xl bg-[#F4F0E7]/40 border border-[#D5CEBE] text-sm text-[#383B32] focus:outline-none focus:border-[#B49A6A] font-sans"
              />
            </div>

            {/* 02 3 pedras que quero guardar */}
            <div className="space-y-1.5">
              <label className="text-xs font-serif font-semibold text-[#383B32] flex items-center gap-2">
                <span className="font-mono text-[#B49A6A]">02</span>
                <span>3 pedras que quero guardar</span>
              </label>
              <textarea
                rows={3}
                value={monthlyForm.stones_to_keep}
                onChange={e => setMonthlyForm({ ...monthlyForm, stones_to_keep: e.target.value })}
                placeholder="1. ...&#10;2. ...&#10;3. ..."
                className="w-full p-3 rounded-xl bg-[#F4F0E7]/40 border border-[#D5CEBE] text-sm text-[#383B32] focus:outline-none focus:border-[#B49A6A] font-sans"
              />
            </div>

            {/* 03 O que aprendi? */}
            <div className="space-y-1.5">
              <label className="text-xs font-serif font-semibold text-[#383B32] flex items-center gap-2">
                <span className="font-mono text-[#B49A6A]">03</span>
                <span>O que aprendi?</span>
              </label>
              <textarea
                rows={2}
                value={monthlyForm.lessons_learned}
                onChange={e => setMonthlyForm({ ...monthlyForm, lessons_learned: e.target.value })}
                placeholder="Sobre Deus, sobre mim, sobre limites, sobre confiança..."
                className="w-full p-3 rounded-xl bg-[#F4F0E7]/40 border border-[#D5CEBE] text-sm text-[#383B32] focus:outline-none font-sans"
              />
            </div>

            {/* 04 O que não quero repetir? */}
            <div className="space-y-1.5">
              <label className="text-xs font-serif font-semibold text-[#383B32] flex items-center gap-2">
                <span className="font-mono text-[#B49A6A]">04</span>
                <span>O que não quero repetir?</span>
              </label>
              <input
                type="text"
                value={monthlyForm.avoid_repeating}
                onChange={e => setMonthlyForm({ ...monthlyForm, avoid_repeating: e.target.value })}
                placeholder="Erros, sobrecargas ou posturas a serem deixadas para trás..."
                className="w-full px-3.5 py-2 rounded-xl bg-[#F4F0E7]/40 border border-[#D5CEBE] text-sm text-[#383B32] focus:outline-none font-sans"
              />
            </div>

            {/* 05 O que precisa continuar? */}
            <div className="space-y-1.5">
              <label className="text-xs font-serif font-semibold text-[#383B32] flex items-center gap-2">
                <span className="font-mono text-[#B49A6A]">05</span>
                <span>O que precisa continuar?</span>
              </label>
              <input
                type="text"
                value={monthlyForm.keep_going}
                onChange={e => setMonthlyForm({ ...monthlyForm, keep_going: e.target.value })}
                placeholder="Bons hábitos, tempo com a família, constância devocional..."
                className="w-full px-3.5 py-2 rounded-xl bg-[#F4F0E7]/40 border border-[#D5CEBE] text-sm text-[#383B32] focus:outline-none font-sans"
              />
            </div>

            {/* 06 Qual sonho avançou? Qual projeto precisa de atenção? */}
            <div className="space-y-1.5">
              <label className="text-xs font-serif font-semibold text-[#383B32] flex items-center gap-2">
                <span className="font-mono text-[#B49A6A]">06</span>
                <span>Qual sonho avançou? Qual projeto precisa de atenção?</span>
              </label>
              <textarea
                rows={2}
                value={monthlyForm.dream_advanced}
                onChange={e => setMonthlyForm({ ...monthlyForm, dream_advanced: e.target.value })}
                placeholder="Avanço nos sonhos e projetos prioritários..."
                className="w-full p-3 rounded-xl bg-[#F4F0E7]/40 border border-[#D5CEBE] text-sm text-[#383B32] focus:outline-none font-sans"
              />
            </div>
          </div>

          <div className="flex items-center justify-end pt-3 border-t border-[#E5DECE]">
            <button
              type="submit"
              className="px-6 py-2.5 text-xs font-medium text-white bg-[#383B32] hover:bg-[#2A2C25] rounded-xl transition-colors cursor-pointer"
            >
              Salvar Revisão Mensal
            </button>
          </div>
        </form>
      )}

      {/* TAB 2: REVISÃO ANUAL (Página 23) */}
      {activeTab === 'annual' && (
        <form onSubmit={handleSaveAnnual} className="bg-white/85 border border-[#E5DECE] rounded-2xl p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5DECE] pb-4">
            <div>
              <span className="text-[11px] uppercase tracking-wider font-semibold text-[#B49A6A]">
                Parte 8 · Revisão Anual · Página 23
              </span>
              <h2 className="text-2xl font-serif text-[#383B32] mt-0.5">
                Revisão Anual de {annualYear}
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={annualYear}
                onChange={e => setAnnualYear(Number(e.target.value))}
                className="text-xs bg-[#F4F0E7] border border-[#D5CEBE] rounded-lg px-3 py-1.5 text-[#383B32]"
              >
                {[currentYear, currentYear - 1, currentYear - 2].map(y => (
                  <option key={y} value={y}>
                    Ano {y}
                  </option>
                ))}
              </select>
              <SaveIndicator status={saveStatus} lastSavedTime={lastSavedTime} />
            </div>
          </div>

          <div className="space-y-5">
            {[
              { key: 'what_god_did', num: '01', label: 'O que Deus fez?' },
              { key: 'biggest_stones', num: '02', label: 'Quais foram minhas maiores pedras?' },
              { key: 'biggest_jordan', num: '03', label: 'Qual foi meu maior Jordão?' },
              { key: 'opened_closed_doors', num: '04', label: 'Que portas se abriram? Que portas se fecharam?' },
              { key: 'what_built', num: '05', label: 'O que construí?' },
              { key: 'living_dreams', num: '06', label: 'Quais sonhos continuam vivos?' },
              { key: 'what_changed_in_me', num: '07', label: 'O que mudou em mim?' },
            ].map(item => (
              <div key={item.key} className="space-y-1.5">
                <label className="text-xs font-serif font-semibold text-[#383B32] flex items-center gap-2">
                  <span className="font-mono text-[#B49A6A]">{item.num}</span>
                  <span>{item.label}</span>
                </label>
                <textarea
                  rows={2}
                  value={(annualForm as any)[item.key]}
                  onChange={e => setAnnualForm({ ...annualForm, [item.key]: e.target.value })}
                  placeholder="Escreva sua reflexão anual sincera..."
                  className="w-full p-3 rounded-xl bg-[#F4F0E7]/40 border border-[#D5CEBE] text-sm text-[#383B32] focus:outline-none focus:border-[#B49A6A] font-sans"
                />
              </div>
            ))}
          </div>

          <div className="flex items-center justify-end pt-3 border-t border-[#E5DECE]">
            <button
              type="submit"
              className="px-6 py-2.5 text-xs font-medium text-white bg-[#383B32] hover:bg-[#2A2C25] rounded-xl transition-colors cursor-pointer"
            >
              Salvar Revisão Anual
            </button>
          </div>
        </form>
      )}

      {/* TAB 3: QUANDO O NOVO JORDÃO CHEGAR (Página 24-25) */}
      {activeTab === 'jordan' && (
        <div className="space-y-6">
          <div className="bg-white/85 border border-[#E5DECE] rounded-2xl p-6 sm:p-8 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E5DECE] pb-4">
              <div>
                <span className="text-[11px] uppercase tracking-wider font-semibold text-[#879579]">
                  Parte 9 · Página 24
                </span>
                <h2 className="text-2xl font-serif text-[#383B32] mt-0.5">
                  Quando o Novo Jordão Chegar
                </h2>
                <p className="text-sm font-serif italic text-[#383B32]/85 mt-1 leading-relaxed">
                  “Quando surgir uma situação difícil, antes de pensar ‘eu não vou conseguir’, abra o memorial. Leia suas pedras.”
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsJordanCreating(prev => !prev)}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-white bg-[#383B32] hover:bg-[#2A2C25] rounded-xl transition-colors cursor-pointer shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Registrar Novo Jordão</span>
              </button>
            </div>

            {/* Banner quote from PDF Page 25 */}
            <div className="p-4 bg-[#F4F0E7]/60 rounded-xl border border-[#D5CEBE] text-center">
              <p className="font-serif italic text-base text-[#383B32]">
                “O Jordão de hoje não apaga os Jordões que já atravessei.”
              </p>
              <span className="text-[10px] uppercase font-semibold text-[#B49A6A] tracking-wider block mt-1">
                Memorial dos Santos · Página 25
              </span>
            </div>
          </div>

          {/* New Jordan Form */}
          {isJordanCreating && (
            <form onSubmit={handleSaveNewJordan} className="bg-white/90 border border-[#B49A6A] rounded-2xl p-6 sm:p-8 space-y-5 shadow-sm">
              <h3 className="font-serif text-lg text-[#383B32] font-semibold border-b border-[#E5DECE] pb-2">
                Ficha de Enfrentamento do Jordão
              </h3>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#383B32]">
                  Qual é o obstáculo ou Jordão atual diante de você? *
                </label>
                <input
                  type="text"
                  required
                  value={jordanForm.title}
                  onChange={e => setJordanForm({ ...jordanForm, title: e.target.value })}
                  placeholder="Ex: Demissão, diagnóstico, decisão difícil..."
                  className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#D5CEBE] text-sm text-[#383B32] focus:outline-none"
                />
              </div>

              {/* 01 Já passei por algo parecido? */}
              <div className="space-y-1">
                <label className="text-xs font-serif font-semibold text-[#383B32] flex items-center gap-2">
                  <span className="font-mono text-[#B49A6A]">01</span>
                  <span>Já passei por algo parecido?</span>
                </label>
                <input
                  type="text"
                  value={jordanForm.passed_before}
                  onChange={e => setJordanForm({ ...jordanForm, passed_before: e.target.value })}
                  placeholder="Lembre-se de um momento análogo no passado..."
                  className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#D5CEBE] text-sm text-[#383B32] focus:outline-none"
                />
              </div>

              {/* 02 O que aconteceu naquela ocasião? */}
              <div className="space-y-1">
                <label className="text-xs font-serif font-semibold text-[#383B32] flex items-center gap-2">
                  <span className="font-mono text-[#B49A6A]">02</span>
                  <span>O que aconteceu naquela ocasião?</span>
                </label>
                <textarea
                  rows={2}
                  value={jordanForm.what_happened_then}
                  onChange={e => setJordanForm({ ...jordanForm, what_happened_then: e.target.value })}
                  placeholder="Como Deus agiu e como você atravessou?"
                  className="w-full p-3 rounded-xl bg-white border border-[#D5CEBE] text-sm text-[#383B32] focus:outline-none font-sans"
                />
              </div>

              {/* 03 O que aprendi? */}
              <div className="space-y-1">
                <label className="text-xs font-serif font-semibold text-[#383B32] flex items-center gap-2">
                  <span className="font-mono text-[#B49A6A]">03</span>
                  <span>O que aprendi?</span>
                </label>
                <input
                  type="text"
                  value={jordanForm.what_learned_then}
                  onChange={e => setJordanForm({ ...jordanForm, what_learned_then: e.target.value })}
                  placeholder="A lição deixada por aquela travessia..."
                  className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#D5CEBE] text-sm text-[#383B32] focus:outline-none"
                />
              </div>

              {/* 04 Quem me ajudou? */}
              <div className="space-y-1">
                <label className="text-xs font-serif font-semibold text-[#383B32] flex items-center gap-2">
                  <span className="font-mono text-[#B49A6A]">04</span>
                  <span>Quem me ajudou?</span>
                </label>
                <input
                  type="text"
                  value={jordanForm.who_helped_then}
                  onChange={e => setJordanForm({ ...jordanForm, who_helped_then: e.target.value })}
                  placeholder="Pessoas enviadas por Deus, orações..."
                  className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#D5CEBE] text-sm text-[#383B32] focus:outline-none"
                />
              </div>

              {/* 05 Que pedra daquela época preciso lembrar hoje? */}
              <div className="space-y-1">
                <label className="text-xs font-serif font-semibold text-[#383B32] flex items-center gap-2">
                  <span className="font-mono text-[#B49A6A]">05</span>
                  <span>Que pedra daquela época preciso lembrar hoje?</span>
                </label>
                <select
                  value={jordanForm.stone_to_remember_id}
                  onChange={e => setJordanForm({ ...jordanForm, stone_to_remember_id: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#D5CEBE] text-sm text-[#383B32] focus:outline-none"
                >
                  <option value="">Selecione uma pedra existente do seu memorial (opcional)</option>
                  {stones.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.title} ({s.category})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E5DECE]">
                <button
                  type="button"
                  onClick={() => setIsJordanCreating(false)}
                  className="px-4 py-2 text-xs font-medium text-[#383B32] hover:bg-[#E5DECE] rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-medium text-white bg-[#383B32] hover:bg-[#2A2C25] rounded-xl cursor-pointer"
                >
                  Guardar Reflexão do Jordão
                </button>
              </div>
            </form>
          )}

          {/* List of Jordans */}
          {newJordans.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-xs uppercase font-semibold text-[#383B32]/60 tracking-wider">
                Travessias Registradas ({newJordans.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {newJordans.map(jordan => {
                  const linkedStone = stones.find(s => s.id === jordan.stone_to_remember_id);
                  return (
                    <div
                      key={jordan.id}
                      className="bg-white/80 border border-[#E5DECE] rounded-2xl p-5 space-y-3"
                    >
                      <h4 className="font-serif font-semibold text-lg text-[#383B32]">
                        {jordan.title}
                      </h4>
                      {jordan.what_happened_then && (
                        <p className="text-xs text-[#383B32]/80 font-sans">
                          <strong>Como atravessou antes: </strong>
                          {jordan.what_happened_then}
                        </p>
                      )}
                      {jordan.what_learned_then && (
                        <p className="text-xs text-[#383B32]/80 font-sans">
                          <strong>Lição lembrada: </strong>
                          {jordan.what_learned_then}
                        </p>
                      )}
                      {linkedStone && (
                        <div className="p-2.5 bg-[#F4F0E7] rounded-lg border border-[#D5CEBE] text-xs flex items-center gap-2">
                          <StoneIconSVG className="w-4 h-4 text-[#B49A6A]" />
                          <span className="font-serif">Pedra lembrada: <strong>{linkedStone.title}</strong></span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: MINHAS PEDRAS DO ANO (Página 26) */}
      {activeTab === 'yearStones' && (
        <div className="bg-white/85 border border-[#E5DECE] rounded-2xl p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E5DECE] pb-4">
            <div>
              <span className="text-[11px] uppercase tracking-wider font-semibold text-[#B49A6A]">
                Parte 10 · Minhas Pedras do Ano · Página 26
              </span>
              <h2 className="text-2xl font-serif text-[#383B32] mt-0.5">
                A Pirâmide das 10 Pedras do Ano
              </h2>
              <p className="text-sm font-serif italic text-[#383B32]/75 mt-0.5">
                “Ao final do ano, escolha as experiências mais importantes e registre-as.”
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-[#383B32]/70 font-medium">Ano:</span>
              <select
                value={annualYear}
                onChange={e => setAnnualYear(Number(e.target.value))}
                className="text-xs bg-[#F4F0E7] border border-[#D5CEBE] rounded-lg px-2.5 py-1 text-[#383B32]"
              >
                {[currentYear, currentYear - 1, currentYear + 1].map(y => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Interactive Visual Pyramid */}
          <TenStonesPyramidGraphic
            selectedStones={retrospectiveStones}
            onSelectRank={rank => setSelectedRankToAssign(rank)}
          />

          {/* Modal / Selector for assigning rank */}
          {selectedRankToAssign !== null && (
            <div className="p-4 bg-[#F4F0E7] rounded-xl border border-[#D5CEBE] space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-serif font-semibold text-sm text-[#383B32]">
                  Definir Pedra {String(selectedRankToAssign).padStart(2, '0')} do Ano
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedRankToAssign(null)}
                  className="text-xs text-[#383B32]/60 hover:text-[#383B32]"
                >
                  Fechar
                </button>
              </div>

              {stones.length === 0 ? (
                <p className="text-xs text-[#383B32]/70 font-serif italic">
                  Você ainda não possui pedras cadastradas. Crie pedras no Livro das Pedras primeiro.
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                  {stones.map(s => {
                    const isAlreadyThisRank = s.year_retrospective_rank === selectedRankToAssign && s.retrospective_year === annualYear;
                    return (
                      <div
                        key={s.id}
                        className={`p-2.5 rounded-lg border text-xs flex items-center justify-between ${
                          isAlreadyThisRank ? 'bg-[#B49A6A]/20 border-[#B49A6A]' : 'bg-white border-[#E5DECE]'
                        }`}
                      >
                        <div className="truncate pr-2">
                          <span className="font-serif font-medium block truncate text-[#383B32]">
                            {s.title}
                          </span>
                          <span className="text-[10px] text-[#383B32]/60 font-sans">
                            {s.category}
                          </span>
                        </div>

                        {isAlreadyThisRank ? (
                          <button
                            type="button"
                            onClick={() => handleRemoveStoneFromRank(s)}
                            className="text-[10px] text-red-700 hover:underline cursor-pointer"
                          >
                            Remover
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleAssignStoneToRank(s, selectedRankToAssign)}
                            className="px-2 py-1 text-[10px] font-medium text-white bg-[#383B32] hover:bg-[#2A2C25] rounded transition-colors cursor-pointer"
                          >
                            Atribuir
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* List of current stones in the retrospective */}
          <div className="space-y-2 pt-2">
            <h4 className="text-xs uppercase font-semibold text-[#383B32]/70 tracking-wider">
              Pedras Selecionadas ({retrospectiveStones.length} de 10)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {Array.from({ length: 10 }, (_, i) => i + 1).map(rank => {
                const assigned = stones.find(
                  s => s.year_retrospective_rank === rank && s.retrospective_year === annualYear
                );
                return (
                  <div
                    key={rank}
                    className="p-3 bg-[#F4F0E7]/40 rounded-xl border border-[#E5DECE] flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <span className="w-6 h-6 rounded-full bg-[#E5DECE] font-mono font-bold text-[#383B32] flex items-center justify-center text-[10px]">
                        {String(rank).padStart(2, '0')}
                      </span>
                      {assigned ? (
                        <span className="font-serif font-medium text-[#383B32] truncate">
                          {assigned.title} <span className="text-[10px] text-[#879579]">({assigned.category})</span>
                        </span>
                      ) : (
                        <span className="text-[#383B32]/40 font-serif italic">
                          (Vazio)
                        </span>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => setSelectedRankToAssign(rank)}
                      className="text-[11px] font-medium text-[#B49A6A] hover:underline cursor-pointer ml-2"
                    >
                      {assigned ? 'Alterar' : 'Escolher'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
