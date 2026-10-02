import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Compass,
  CalendarDays,
  Bookmark,
  Map,
  Clock,
  Sparkles,
  FolderGit2,
  Heart,
  RotateCcw,
  User,
  Scroll,
  Users,
  Award
} from 'lucide-react';
import { StoneIconSVG } from './MemorialArt';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const navSections = [
    {
      group: 'O Caminho',
      items: [
        { label: 'Meu Memorial', path: '/', icon: Compass },
        { label: 'Jornada de 90 Dias', path: '/jornada', icon: CalendarDays },
      ],
    },
    {
      group: 'Cadernos & Registros',
      items: [
        { label: 'Minhas Pedras', path: '/pedras', customIcon: true },
        { label: 'Mapa da Minha Vida', path: '/mapa', icon: Map },
        { label: 'Discernir a Estação', path: '/discernir', icon: Clock },
        { label: 'Livro dos Sonhos', path: '/sonhos', icon: Sparkles },
        { label: 'Meus Projetos', path: '/projetos', icon: FolderGit2 },
        { label: 'Caderno das Orações', path: '/oracoes', icon: Heart },
      ],
    },
    {
      group: 'Revisões & Futuro',
      items: [
        { label: 'Revisões Periódicas', path: '/revisoes', icon: RotateCcw },
        { label: 'Declaração e Encerramento', path: '/encerramento', icon: Award },
      ],
    },
    {
      group: 'Comunidade & Conta',
      items: [
        { label: 'Memorial em Comunidade', path: '/comunidade', icon: Users },
        { label: 'Minha Conta', path: '/conta', icon: User },
      ],
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/25 backdrop-blur-xs md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed md:sticky top-0 md:top-[61px] bottom-0 left-0 z-40 w-64 bg-[#F5F2EB] border-r border-[#EAE4D7] flex flex-col justify-between py-6 px-4 overflow-y-auto transition-transform duration-200 ease-in-out md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } h-screen md:h-[calc(100vh-61px)]`}
      >
        <div className="space-y-6">
          {/* Header in mobile drawer */}
          <div className="md:hidden pb-3 border-b border-[#EAE4D7] flex items-center justify-between">
            <span className="font-serif text-lg font-medium text-[#232521]">
              Memorial dos Santos
            </span>
          </div>

          {/* Navigation Items */}
          <nav className="space-y-6">
            {navSections.map((section, sIdx) => (
              <div key={sIdx} className="space-y-2">
                <span className="text-[11px] font-serif italic text-[#475344] px-2.5 block">
                  {section.group}
                </span>
                <div className="space-y-0.5">
                  {section.items.map(item => {
                    const IconComponent = item.icon;
                    return (
                      <NavLink
                        key={item.path}
                        to={item.path}
                        onClick={() => {
                          if (window.innerWidth < 768) onClose();
                        }}
                        className={({ isActive }) =>
                          `flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-sans transition-all ${
                            isActive
                              ? 'bg-[#EAE4D7] text-[#232521] font-semibold'
                              : 'text-[#232521]/75 hover:bg-[#EAE4D7]/40 hover:text-[#232521]'
                          }`
                        }
                      >
                        {item.customIcon ? (
                          <StoneIconSVG className="w-4 h-4 text-[#879579] shrink-0" />
                        ) : (
                          IconComponent && (
                            <IconComponent className="w-4 h-4 text-[#879579] shrink-0" />
                          )
                        )}
                        <span className="truncate">{item.label}</span>
                      </NavLink>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </div>

        {/* Biblical anchor quote at the bottom */}
        <div className="mt-8 pt-4 border-t border-[#EAE4D7] text-center space-y-0.5">
          <p className="text-xs font-serif italic text-[#232521]/70">
            “Até aqui nos ajudou o Senhor.”
          </p>
          <span className="text-[11px] font-serif text-[#B49A6A]">
            1 Samuel 7:12
          </span>
        </div>
      </aside>
    </>
  );
};
