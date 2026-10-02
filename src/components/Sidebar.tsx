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
      group: 'Caminho Principal',
      items: [
        { label: '1. Meu Memorial', path: '/', icon: Compass },
        { label: '2. Jornada de 90 Dias', path: '/jornada', icon: CalendarDays },
      ],
    },
    {
      group: 'Cadernos & Registros',
      items: [
        { label: '3. Minhas Pedras', path: '/pedras', customIcon: true },
        { label: '4. Mapa da Minha Vida', path: '/mapa', icon: Map },
        { label: '5. Discernir a Estação', path: '/discernir', icon: Clock },
        { label: '6. Livro dos Sonhos', path: '/sonhos', icon: Sparkles },
        { label: '7. Meus Projetos', path: '/projetos', icon: FolderGit2 },
        { label: '8. Caderno das Orações', path: '/oracoes', icon: Heart },
      ],
    },
    {
      group: 'Revisões & Futuro',
      items: [
        { label: '9. Revisões', path: '/revisoes', icon: RotateCcw },
        { label: 'Declaração & Encerramento', path: '/encerramento', icon: Award },
      ],
    },
    {
      group: 'Comunidade & Configurações',
      items: [
        { label: '10. Minha Conta', path: '/conta', icon: User },
        { label: 'Memorial em Comunidade', path: '/comunidade', icon: Users },
      ],
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-xs md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed md:sticky top-0 md:top-[57px] bottom-0 left-0 z-40 w-64 bg-[#F4F0E7] border-r border-[#E5DECE] flex flex-col justify-between py-6 px-4 overflow-y-auto transition-transform duration-200 ease-in-out md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } h-screen md:h-[calc(100vh-57px)]`}
      >
        <div className="space-y-6">
          {/* Header in mobile drawer */}
          <div className="md:hidden pb-3 border-b border-[#E5DECE] flex items-center justify-between">
            <span className="font-serif text-lg font-medium text-[#383B32]">
              Memorial dos Santos
            </span>
          </div>

          {/* Navigation Items */}
          <nav className="space-y-5">
            {navSections.map((section, sIdx) => (
              <div key={sIdx} className="space-y-1.5">
                <span className="text-[10px] uppercase font-sans font-semibold tracking-wider text-[#383B32]/45 px-2">
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
                          `flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                            isActive
                              ? 'bg-[#E5DECE] text-[#383B32] font-semibold border-l-3 border-[#B49A6A]'
                              : 'text-[#383B32]/75 hover:bg-[#E5DECE]/50 hover:text-[#383B32]'
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
        <div className="mt-8 pt-4 border-t border-[#E5DECE] text-center">
          <p className="text-[12px] font-serif italic text-[#383B32]/70">
            “Até aqui nos ajudou o Senhor.”
          </p>
          <span className="text-[10px] tracking-wider uppercase text-[#B49A6A] font-semibold">
            1 Samuel 7:12
          </span>
        </div>
      </aside>
    </>
  );
};
