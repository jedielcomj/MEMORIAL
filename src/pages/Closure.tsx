import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { storage } from '../lib/storage';
import { ClosureDeclaration } from '../types/memorial';
import { PageHeader } from '../components/PageHeader';
import { SaveIndicator, SaveStatus } from '../components/SaveIndicator';
import { Award, CheckCircle, Scroll, ShieldCheck, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const ClosurePage: React.FC = () => {
  const { user } = useAuth();
  const [form, setForm] = useState<ClosureDeclaration>({
    id: '',
    user_id: '',
    what_stones_tell: '',
    final_page_q1: '',
    final_page_q2: '',
    final_page_q3: '',
    final_page_q4: '',
    final_page_q5: '',
    final_page_q6: '',
    last_stone_to_carry: '',
    completion_date: new Date().toISOString().split('T')[0],
    signature: '',
    created_at: '',
    updated_at: '',
  });
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [lastSavedTime, setLastSavedTime] = useState<string>('');

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const data = await storage.getClosure(user.id);
      if (data) {
        setForm(data);
      } else {
        setForm(prev => ({
          ...prev,
          id: 'closure_' + user.id,
          user_id: user.id,
          signature: user.display_name,
        }));
      }
    };
    load();
  }, [user]);

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!user) return;
    setSaveStatus('saving');
    try {
      const toSave: ClosureDeclaration = {
        ...form,
        id: form.id || 'closure_' + user.id,
        user_id: user.id,
        signature: form.signature || user.display_name,
        updated_at: new Date().toISOString(),
      };
      await storage.saveClosure(toSave);
      setForm(toSave);
      setSaveStatus('saved');
      setLastSavedTime(new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }));
    } catch {
      setSaveStatus('error');
    }
  };

  return (
    <div className="space-y-10 max-w-4xl mx-auto pb-20">
      <PageHeader
        badge="Encerramento & Futuro"
        title="Declaração de Memorial"
        subtitle="“Meu memorial não termina aqui. Enquanto eu continuar caminhando, novas pedras serão acrescentadas.” — Páginas 27–31"
      />

      {/* 1. O Método para Continuar (Páginas 27-28 do PDF) */}
      <div className="bg-white/80 border border-[#E5DECE] rounded-2xl p-6 sm:p-8 space-y-4">
        <span className="text-[10px] uppercase tracking-widest font-semibold text-[#B49A6A]">
          Para Seguir Caminhando · O Método para Continuar
        </span>
        <h3 className="text-xl font-serif text-[#383B32]">
          Sempre que surgir um novo sonho, projeto ou acontecimento importante:
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
          {[
            { num: '01', verb: 'LEMBRE', sub: 'O que Deus já fez?' },
            { num: '02', verb: 'RECONHEÇA', sub: 'Onde estou agora?' },
            { num: '03', verb: 'SONHE', sub: 'O que desejo construir ou viver?' },
            { num: '04', verb: 'ESCREVA', sub: 'Transforme o sonho em palavras.' },
            { num: '05', verb: 'ESTRUTURE', sub: 'Divida o sonho em etapas.' },
            { num: '06', verb: 'AJA', sub: 'Defina o próximo passo possível.' },
            { num: '07', verb: 'ORE', sub: 'Entregue o processo a Deus.' },
            { num: '08', verb: 'REGISTRE', sub: 'Anote o que aconteceu.' },
            { num: '09', verb: 'GUARDE A PEDRA', sub: 'Toda conquista, aprendizado, livramento ou resposta significativa merece ser registrada.' },
            { num: '10', verb: 'VOLTE AO MEMORIAL', sub: 'Quando um novo Jordão surgir, releia as pedras antigas.' },
          ].map(step => (
            <div key={step.num} className="p-3 bg-[#F4F0E7]/60 rounded-xl border border-[#D5CEBE]/60 space-y-1">
              <span className="font-mono text-[#B49A6A] font-bold">{step.num} · {step.verb}</span>
              <p className="text-[#383B32]/85 font-sans">{step.sub}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Minha Declaração de Memorial (Página 29 do PDF) */}
      <div className="bg-[#383B32] text-white rounded-2xl p-6 sm:p-10 shadow-lg space-y-6 text-center">
        <span className="text-xs uppercase tracking-widest text-[#B49A6A] font-semibold">
          Encerramento · Página 29
        </span>
        <h2 className="text-2xl sm:text-3xl font-serif tracking-tight text-[#F4F0E7]">
          Minha Declaração de Memorial
        </h2>
        <div className="max-w-2xl mx-auto space-y-4 font-serif text-sm sm:text-base leading-relaxed text-[#E5DECE]">
          <p>
            “Eu não quero esquecer de onde vim. Não quero esquecer os desertos que atravessei. Não quero esquecer os Jordões que pareciam impossíveis. Não quero esquecer as portas que se abriram, as pessoas que caminharam comigo, as orações que foram respondidas e aquilo que Deus fez.”
          </p>
          <p className="text-xs sm:text-sm font-sans uppercase tracking-widest font-semibold text-[#B49A6A] pt-2">
            POR ISSO, ESCREVO. POR ISSO, REGISTRO. POR ISSO, GUARDO MINHAS PEDRAS.
          </p>
        </div>

        <div className="text-left bg-white/10 p-5 rounded-xl border border-white/10 space-y-2 mt-4 max-w-2xl mx-auto">
          <label className="text-xs font-serif font-semibold text-[#F4F0E7]">
            O que estas pedras contam sobre a minha história?
          </label>
          <textarea
            rows={4}
            value={form.what_stones_tell}
            onChange={e => setForm({ ...form, what_stones_tell: e.target.value })}
            placeholder="Escreva sua reflexão conclusiva sobre o que o seu memorial revela..."
            className="w-full p-3 rounded-lg bg-black/20 border border-white/20 text-xs text-white placeholder-white/40 focus:outline-none focus:border-[#B49A6A]"
          />
        </div>
      </div>

      {/* 3. Minha Página Final (Página 30 do PDF) */}
      <div className="bg-white/85 border border-[#E5DECE] rounded-2xl p-6 sm:p-8 space-y-6">
        <div className="border-b border-[#E5DECE] pb-3 flex items-center justify-between">
          <div>
            <span className="text-[11px] uppercase tracking-wider font-semibold text-[#879579]">
              Encerramento · Página 30
            </span>
            <h3 className="text-2xl font-serif text-[#383B32]">
              Minha Página Final: Até aqui...
            </h3>
          </div>
          <SaveIndicator status={saveStatus} lastSavedTime={lastSavedTime} />
        </div>

        <div className="space-y-4">
          {[
            { key: 'final_page_q1', num: '01', label: 'O que consigo enxergar quando olho para minha história?' },
            { key: 'final_page_q2', num: '02', label: 'Pelo que sou grato(a)?' },
            { key: 'final_page_q3', num: '03', label: 'O que ainda espero viver?' },
            { key: 'final_page_q4', num: '04', label: 'Que sonhos entrego a Deus?' },
            { key: 'final_page_q5', num: '05', label: 'Que projetos continuarei construindo?' },
            { key: 'final_page_q6', num: '06', label: 'Que tipo de pessoa quero me tornar?' },
          ].map(q => (
            <div key={q.key} className="space-y-1.5">
              <label className="text-xs font-serif font-semibold text-[#383B32] flex items-center gap-2">
                <span className="font-mono text-[#B49A6A]">{q.num}</span>
                <span>{q.label}</span>
              </label>
              <textarea
                rows={2}
                value={(form as any)[q.key]}
                onChange={e => setForm({ ...form, [q.key]: e.target.value })}
                placeholder="Sua resposta pessoal..."
                className="w-full p-3 rounded-xl bg-[#F4F0E7]/40 border border-[#D5CEBE] text-sm text-[#383B32] focus:outline-none font-sans"
              />
            </div>
          ))}
        </div>
      </div>

      {/* 4. A Última Pedra Desta Jornada (Página 31 do PDF) */}
      <div className="bg-white/90 border border-[#B49A6A] rounded-2xl p-6 sm:p-8 space-y-6">
        <div className="border-b border-[#E5DECE] pb-3">
          <span className="text-[11px] uppercase tracking-wider font-semibold text-[#B49A6A]">
            Página 31
          </span>
          <h3 className="text-2xl font-serif text-[#383B32]">
            A Última Pedra Desta Jornada
          </h3>
          <p className="text-sm font-serif italic text-[#383B32]/80 mt-1">
            “Meu memorial não termina aqui. Enquanto eu continuar caminhando, novas pedras serão acrescentadas.”
          </p>
        </div>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-serif font-semibold text-[#383B32]">
              A pedra que quero levar comigo daqui para frente
            </label>
            <textarea
              rows={3}
              value={form.last_stone_to_carry}
              onChange={e => setForm({ ...form, last_stone_to_carry: e.target.value })}
              placeholder="Qual é a principal certeza ou marco que você levará para todas as futuras estações?"
              className="w-full p-3.5 rounded-xl bg-[#F4F0E7]/40 border border-[#D5CEBE] text-sm text-[#383B32] focus:outline-none font-sans"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#383B32]">
                Data de Conclusão Desta Jornada
              </label>
              <input
                type="date"
                value={form.completion_date}
                onChange={e => setForm({ ...form, completion_date: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#D5CEBE] text-sm text-[#383B32]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#383B32]">
                Assinatura do Peregrino
              </label>
              <input
                type="text"
                value={form.signature}
                onChange={e => setForm({ ...form, signature: e.target.value })}
                placeholder="Seu nome completo"
                className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#D5CEBE] text-sm text-[#383B32] font-serif"
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-[#E5DECE]">
          <div className="text-center sm:text-left">
            <p className="font-serif italic text-xs text-[#383B32]/70">
              “Até aqui nos ajudou o Senhor.” — 1 Samuel 7:12
            </p>
          </div>

          <button
            type="button"
            onClick={handleSave}
            className="w-full sm:w-auto px-8 py-2.5 text-xs font-medium text-white bg-[#383B32] hover:bg-[#2A2C25] rounded-xl transition-colors cursor-pointer shadow-sm"
          >
            Assinar e Selar Meu Memorial
          </button>
        </div>
      </div>
    </div>
  );
};
