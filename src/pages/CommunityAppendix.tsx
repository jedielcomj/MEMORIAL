import React from 'react';
import { PageHeader } from '../components/PageHeader';
import { Users, BookOpen, Heart, Compass, Sparkles, FolderGit2 } from 'lucide-react';
import { StoneIconSVG } from '../components/MemorialArt';

export const CommunityAppendixPage: React.FC = () => {
  const encounters = [
    {
      num: '1',
      title: 'Encontro 01 — As pedras',
      desc: 'Cada participante compartilha uma experiência que não quer esquecer.',
      icon: StoneIconSVG,
    },
    {
      num: '2',
      title: 'Encontro 02 — Os Jordões',
      desc: 'O grupo conversa sobre desafios já atravessados e aprendizados.',
      icon: Compass,
    },
    {
      num: '3',
      title: 'Encontro 03 — O mapa',
      desc: 'Cada pessoa identifica uma área que precisa de atenção nesta estação.',
      icon: BookOpen,
    },
    {
      num: '4',
      title: 'Encontro 04 — Os sonhos',
      desc: 'Tempo individual de escrita e compartilhamento voluntário.',
      icon: Sparkles,
    },
    {
      num: '5',
      title: 'Encontro 05 — Do sonho ao projeto',
      desc: 'Cada participante define um projeto e um primeiro passo.',
      icon: FolderGit2,
    },
    {
      num: '6',
      title: 'Encontro 06 — Oração',
      desc: 'Pedidos, entrega, gratidão e intercessão mútua.',
      icon: Heart,
    },
    {
      num: '7',
      title: 'Encontro 07 — As novas pedras',
      desc: 'Compartilhamento de respostas, avanços e aprendizados.',
      icon: StoneIconSVG,
    },
  ];

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-16">
      <PageHeader
        badge="Apêndice · Memorial em Comunidade"
        title="Memorial em Comunidade"
        subtitle="“Uma jornada para pequenos grupos, células, discipulado e encontros da igreja.” — Páginas 32–33"
      />

      {/* Note about V1 Scope */}
      <div className="bg-[#E5DECE]/40 border border-[#D5CEBE] p-4 rounded-xl text-xs text-[#383B32]/80 leading-relaxed font-serif">
        <strong className="font-sans font-semibold text-[#383B32] block mb-0.5">Nota de Arquitetura:</strong>
        Esta primeira versão do Memorial dos Santos é estritamente de uso pessoal e contemplativo individual. Este guia preserva na íntegra a metodologia comunitária do manual original do autor para ser utilizada por facilitadores em grupos de estudo, sem expor registros privados de usuários na web.
      </div>

      {/* Os 7 Encontros (Página 32) */}
      <div className="bg-white/85 border border-[#E5DECE] rounded-2xl p-6 sm:p-8 space-y-6">
        <div>
          <span className="text-[11px] uppercase tracking-wider font-semibold text-[#B49A6A]">
            Página 32
          </span>
          <h3 className="text-2xl font-serif text-[#383B32] mt-0.5">
            Estrutura dos 7 Encontros
          </h3>
        </div>

        <div className="space-y-3">
          {encounters.map(item => {
            const Icon = item.icon;
            return (
              <div
                key={item.num}
                className="p-4 bg-[#F4F0E7]/50 rounded-xl border border-[#D5CEBE]/70 flex items-start gap-4"
              >
                <div className="w-8 h-8 rounded-lg bg-[#383B32] text-white font-mono text-sm font-bold flex items-center justify-center shrink-0">
                  {item.num}
                </div>
                <div>
                  <h4 className="font-serif font-semibold text-base text-[#383B32]">
                    {item.title}
                  </h4>
                  <p className="text-xs text-[#383B32]/80 font-sans mt-0.5">
                    {item.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Guia do Facilitador (Página 33) */}
      <div className="bg-white/85 border border-[#E5DECE] rounded-2xl p-6 sm:p-8 space-y-6">
        <div>
          <span className="text-[11px] uppercase tracking-wider font-semibold text-[#879579]">
            Apêndice · Guia do Facilitador · Página 33
          </span>
          <h3 className="text-2xl font-serif text-[#383B32] mt-0.5">
            Para cada encontro, conduza três movimentos:
          </h3>
        </div>

        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="p-3 bg-[#F4F0E7] rounded-xl border border-[#D5CEBE]">
            <span className="font-serif font-bold text-sm text-[#383B32]">LEMBRAR</span>
          </div>
          <div className="p-3 bg-[#F4F0E7] rounded-xl border border-[#D5CEBE]">
            <span className="font-serif font-bold text-sm text-[#383B32]">REFLETIR</span>
          </div>
          <div className="p-3 bg-[#F4F0E7] rounded-xl border border-[#D5CEBE]">
            <span className="font-serif font-bold text-sm text-[#383B32]">ORAR</span>
          </div>
        </div>

        <div className="space-y-4 pt-2">
          {[
            { num: '01', title: 'O que quero que o grupo leve deste encontro?' },
            { num: '02', title: 'Pergunta principal para conversa' },
            { num: '03', title: 'Momento de oração' },
            { num: '04', title: 'Como encerramos?' },
          ].map(q => (
            <div key={q.num} className="p-3.5 bg-white border border-[#E5DECE] rounded-xl flex items-start gap-3">
              <span className="font-mono text-xs font-bold text-[#B49A6A] mt-0.5">
                {q.num}
              </span>
              <span className="font-serif text-sm font-medium text-[#383B32]">
                {q.title}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
