import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { MemorialHeroArt, StoneIconSVG } from '../components/MemorialArt';
import { Mail, Lock, User, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';

export const AuthPage: React.FC = () => {
  const { signIn, signUp, resetPassword, isSupabaseMode } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState<'signin' | 'signup' | 'reset'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    try {
      if (mode === 'signin') {
        const res = await signIn(email, password);
        if (res.success) {
          navigate('/');
        } else {
          setErrorMsg(res.error || 'Credenciais inválidas.');
        }
      } else if (mode === 'signup') {
        const res = await signUp(email, password, displayName);
        if (res.success) {
          navigate('/');
        } else {
          setErrorMsg(res.error || 'Erro ao realizar cadastro.');
        }
      } else if (mode === 'reset') {
        const res = await resetPassword(email);
        if (res.success) {
          setSuccessMsg(res.message);
        } else {
          setErrorMsg(res.message);
        }
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Ocorreu um erro inesperado.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex flex-col justify-center items-center px-4 py-12">
      <div className="max-w-md w-full space-y-6">
        {/* Brand Lockup */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-[#383B32] text-[#F4F0E7] flex items-center justify-center mx-auto shadow-sm">
            <StoneIconSVG className="w-6 h-6 text-[#B49A6A]" />
          </div>
          <span className="text-[11px] uppercase tracking-widest text-[#879579] font-medium block">
            1 Samuel 7:12
          </span>
          <h1 className="text-3xl font-serif text-[#383B32] tracking-tight">
            Memorial dos Santos
          </h1>
          <p className="text-xs sm:text-sm font-serif italic text-[#383B32]/75">
            “Até aqui nos ajudou o Senhor.” — Para lembrar, discernir e construir com Deus.
          </p>
        </div>

        {/* Auth Card */}
        <div className="bg-white/85 border border-[#E5DECE] rounded-2xl p-6 sm:p-8 shadow-sm space-y-5">
          {/* Mode Switcher */}
          <div className="flex items-center gap-1 p-1 bg-[#E5DECE]/60 rounded-xl">
            <button
              type="button"
              onClick={() => {
                setMode('signin');
                setErrorMsg('');
                setSuccessMsg('');
              }}
              className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                mode === 'signin'
                  ? 'bg-white text-[#383B32] shadow-xs'
                  : 'text-[#383B32]/70 hover:text-[#383B32]'
              }`}
            >
              Entrar
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('signup');
                setErrorMsg('');
                setSuccessMsg('');
              }}
              className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                mode === 'signup'
                  ? 'bg-white text-[#383B32] shadow-xs'
                  : 'text-[#383B32]/70 hover:text-[#383B32]'
              }`}
            >
              Criar Conta
            </button>
          </div>

          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#383B32]">
                  Nome de Exibição
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-[#383B32]/40 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={displayName}
                    onChange={e => setDisplayName(e.target.value)}
                    placeholder="Seu nome"
                    className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-[#F4F0E7]/40 border border-[#D5CEBE] text-sm text-[#383B32] focus:outline-none focus:border-[#B49A6A]"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#383B32]">
                E-mail
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#383B32]/40 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-[#F4F0E7]/40 border border-[#D5CEBE] text-sm text-[#383B32] focus:outline-none focus:border-[#B49A6A]"
                />
              </div>
            </div>

            {mode !== 'reset' && (
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-[#383B32]">
                    Senha
                  </label>
                  {mode === 'signin' && (
                    <button
                      type="button"
                      onClick={() => setMode('reset')}
                      className="text-[11px] text-[#B49A6A] hover:underline cursor-pointer"
                    >
                      Esqueceu a senha?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#383B32]/40 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-[#F4F0E7]/40 border border-[#D5CEBE] text-sm text-[#383B32] focus:outline-none focus:border-[#B49A6A]"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-medium text-white bg-[#383B32] hover:bg-[#2A2C25] transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-xs"
            >
              <span>
                {loading
                  ? 'Processando...'
                  : mode === 'signin'
                  ? 'Entrar no Memorial'
                  : mode === 'signup'
                  ? 'Criar Minha Conta'
                  : 'Enviar Instruções de Recuperação'}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {mode === 'reset' && (
            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => setMode('signin')}
                className="text-xs text-[#383B32]/70 hover:underline cursor-pointer"
              >
                Voltar para o Login
              </button>
            </div>
          )}
        </div>

        {/* Storage notice */}
        <div className="text-center">
          <span className="text-[11px] text-[#383B32]/60 font-sans">
            {isSupabaseMode ? '✓ Nuvem Supabase conectada' : 'Modo local seguro habilitado por padrão'}
          </span>
        </div>
      </div>
    </div>
  );
};
