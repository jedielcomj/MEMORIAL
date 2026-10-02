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
    { label: 'Jornada 90 Dias', path: '/jornada' },
    { label: 'Pedras', path: '/pedras' },
    { label: 'Mapa da Vida', path: '/mapa' },
    { label: 'Orações', path: '/oracoes' },
    { label: 'Revisões', path: '/revisoes' },
  ];

  return (
    <header className="sticky top-0 z-30 bg-[#F4F0E7]/95 backdrop-blur-md border-b border-[#E5DECE] px-4 sm:px-6 py-3 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Zone 1: Brand title, one line single text element */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onToggleSidebar}
            className="md:hidden p-2 text-[#383B32] hover:bg-[#E5DECE]/60 rounded-lg transition-colors cursor-pointer"
            aria-label={isSidebarOpen ? 'Fechar menu' : 'Abrir menu'}
          >
            {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          
          <Link
            to="/"
            className="text-xl sm:text-2xl font-serif font-medium text-[#383B32] tracking-tight hover:opacity-90 transition-opacity whitespace-nowrap"
          >
            Memorial dos Santos
          </Link>
        </div>

        {/* Zone 2: 4-6 clean text navigation links (desktop) */}
        <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-[#383B32]/75">
          {primaryNav.map(item => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`transition-colors whitespace-nowrap hover:text-[#383B32] ${
                  isActive ? 'text-[#383B32] font-semibold border-b-2 border-[#B49A6A] pb-0.5' : ''
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Zone 3: Primary actions & User profile */}
        <div className="flex items-center gap-3">
          {/* Storage status indicator (informative, subtle) */}
          <Link
            to="/conta"
            title={isSupabaseMode ? 'Supabase conectado com RLS' : 'Modo local ativo (Configurar nuvem)'}
            className="hidden sm:flex items-center gap-1.5 text-xs text-[#383B32]/65 hover:text-[#383B32] transition-colors px-2 py-1 rounded bg-[#E5DECE]/50 border border-[#D5CEBE]/60"
          >
            {isSupabaseMode ? (
              <>
                <ShieldCheck className="w-3.5 h-3.5 text-[#879579]" />
                <span className="font-sans">Nuvem Supabase</span>
              </>
            ) : (
              <>
                <HardDrive className="w-3.5 h-3.5 text-[#B49A6A]" />
                <span className="font-sans">Modo Local</span>
              </>
            )}
          </Link>

          {user ? (
            <div className="flex items-center gap-2">
              <Link
                to="/conta"
                className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-[#383B32] bg-[#E5DECE]/60 hover:bg-[#E5DECE] rounded-lg border border-[#D5CEBE] transition-colors"
                title="Ver minha conta e configurações"
              >
                <UserIcon className="w-3.5 h-3.5 text-[#879579]" />
                <span className="max-w-[100px] sm:max-w-[140px] truncate">{user.display_name}</span>
              </Link>
              <button
                type="button"
                onClick={signOut}
                title="Sair da conta"
                className="p-1.5 text-[#383B32]/70 hover:text-red-700 hover:bg-[#E5DECE]/60 rounded-lg transition-colors cursor-pointer"
                aria-label="Sair"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Link
              to="/entrar"
              className="px-4 py-1.5 text-xs font-medium text-white bg-[#383B32] hover:bg-[#2A2C25] rounded-lg transition-colors shadow-xs whitespace-nowrap"
            >
              Entrar / Criar Conta
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};
