import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  BookOpen, 
  Sparkles, 
  Compass, 
  HeartHandshake, 
  Menu, 
  X, 
  LogOut, 
  User as UserIcon,
  ShieldCheck,
  HardDrive
} from 'lucide-react';

interface NavbarProps {
  onToggleSidebar: () => void;
  isSidebarOpen: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar, isSidebarOpen }) => {
  const { user, signOut, isSupabaseMode } = useAuth();
  const location = useLocation();

  const primaryNav = [
    { label: 'Memorial', path: '/' },
    { label: 'Jornada', path: '/jornada' },
    { label: 'Pedras', path: '/pedras' },
    { label: 'Mapa da Vida', path: '/mapa' },
    { label: 'Orações', path: '/oracoes' },
    { label: 'Revisões', path: '/revisoes' },
  ];

  return (
    <header className="sticky top-0 z-30 bg-[#F5F2EB]/95 backdrop-blur-md border-b border-[#EAE4D7] px-4 sm:px-8 py-3.5 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-6">
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onToggleSidebar}
            className="md:hidden p-1.5 text-[#232521] hover:bg-[#EAE4D7]/70 rounded-lg transition-colors cursor-pointer"
            aria-label={isSidebarOpen ? 'Fechar menu' : 'Abrir menu'}
          >
            {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          
          <Link
            to="/"
            className="text-xl sm:text-2xl font-serif text-[#232521] font-medium tracking-tight hover:opacity-90 transition-opacity whitespace-nowrap"
          >
            Memorial dos Santos
          </Link>
        </div>

        {/* Zone 2: Clean unboxed text navigation links */}
        <nav className="hidden lg:flex items-center gap-7 text-xs font-sans font-medium text-[#232521]/70">
          {primaryNav.map(item => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`transition-colors whitespace-nowrap hover:text-[#232521] ${
                  isActive ? 'text-[#232521] font-semibold border-b border-[#B49A6A] pb-0.5' : ''
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Zone 3: Primary action & User presence */}
        <div className="flex items-center gap-4">
          <Link
            to="/conta"
            className="hidden sm:inline-flex items-center gap-1.5 text-xs text-[#232521]/60 hover:text-[#232521] transition-colors"
            title="Armazenamento e sincronização"
          >
            <span className={`w-1.5 h-1.5 rounded-full ${isSupabaseMode ? 'bg-emerald-600' : 'bg-[#B49A6A]'}`} />
            <span>{isSupabaseMode ? 'Nuvem' : 'Local'}</span>
          </Link>

          {user ? (
            <div className="flex items-center gap-2">
              <Link
                to="/conta"
                className="text-xs font-medium text-[#232521] hover:text-[#475344] transition-colors flex items-center gap-1.5"
              >
                <UserIcon className="w-3.5 h-3.5 text-[#879579]" />
                <span className="max-w-[120px] truncate">{user.display_name}</span>
              </Link>
              <button
                type="button"
                onClick={signOut}
                title="Sair da conta"
                className="p-1.5 text-[#232521]/50 hover:text-red-700 transition-colors cursor-pointer"
                aria-label="Sair"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <Link
              to="/entrar"
              className="px-4 py-2 text-xs font-medium text-white bg-[#232521] hover:bg-[#363932] rounded-xl transition-colors shadow-xs whitespace-nowrap"
            >
              Entrar
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};
