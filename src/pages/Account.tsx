import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { storage } from '../lib/storage';
import { 
  getSupabase, 
  setCustomSupabaseConfig, 
  testSupabaseConnection,
  supabaseUrl,
  supabaseAnonKey 
} from '../lib/supabase';
import { PageHeader } from '../components/PageHeader';
import { ConfirmModal } from '../components/ConfirmModal';
import { SaveIndicator, SaveStatus } from '../components/SaveIndicator';
import { 
  User, 
  Download, 
  Printer, 
  Trash2, 
  Database, 
  ShieldCheck, 
  HardDrive, 
  CheckCircle2, 
  AlertCircle,
  Copy,
  ExternalLink
} from 'lucide-react';

export const AccountPage: React.FC = () => {
  const { user, updateProfile, deleteAccount, signOut } = useAuth();
  
  // Profile edit state
  const [displayName, setDisplayName] = useState(user?.display_name || '');
  const [intention, setIntention] = useState(user?.intention_90_days || '');
  const [profileSaveStatus, setProfileSaveStatus] = useState<SaveStatus>('idle');

  // Supabase settings state
  const [customUrl, setCustomUrl] = useState('');
  const [customKey, setCustomKey] = useState('');
  const [testResult, setTestResult] = useState<{ loading: boolean; success?: boolean; message?: string }>({
    loading: false,
  });

  // Modals
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    if (user) {
      setDisplayName(user.display_name);
      setIntention(user.intention_90_days || '');
    }
    const storedUrl = localStorage.getItem('memorial_supabase_url') || import.meta.env.VITE_SUPABASE_URL || '';
    const storedKey = localStorage.getItem('memorial_supabase_anon_key') || import.meta.env.VITE_SUPABASE_ANON_KEY || '';
    setCustomUrl(storedUrl);
    setCustomKey(storedKey);
  }, [user]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setProfileSaveStatus('saving');
    const res = await updateProfile(displayName, intention);
    if (res.success) {
      setProfileSaveStatus('saved');
    } else {
      setProfileSaveStatus('error');
    }
  };

  const handleExportJSON = async () => {
    if (!user) return;
    setIsExporting(true);
    try {
      const data = await storage.exportAllData(user.id);
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `memorial_dos_santos_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Erro na exportação:', e);
    } finally {
      setIsExporting(false);
    }
  };

  const handlePrintOrExportPDF = () => {
    window.print();
  };

  const handleTestAndSaveSupabase = async () => {
    setTestResult({ loading: true });
    setCustomSupabaseConfig(customUrl, customKey);
    const result = await testSupabaseConnection();
    setTestResult({
      loading: false,
      success: result.success,
      message: result.message,
    });
  };

  const handleDeleteAccountConfirm = async () => {
    await deleteAccount();
    setShowDeleteModal(false);
  };

  const isConnected = Boolean(getSupabase());

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-20">
      <PageHeader
        badge="Minha Conta & Armazenamento"
        title="Configurações do Memorial"
        subtitle="Gerencie seu perfil, exporte seus registros sagrados, configure o banco de dados e controle seus dados."
      />

      {/* 1. Perfil do Peregrino */}
      <form onSubmit={handleSaveProfile} className="bg-white/85 border border-[#E5DECE] rounded-2xl p-6 sm:p-8 space-y-5">
        <div className="flex items-center justify-between border-b border-[#E5DECE] pb-3">
          <div className="flex items-center gap-2.5">
            <User className="w-5 h-5 text-[#879579]" />
            <h3 className="font-serif text-xl text-[#383B32]">
              Perfil do Usuário
            </h3>
          </div>
          <SaveIndicator status={profileSaveStatus} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-[#383B32]">
              Nome de Exibição
            </label>
            <input
              type="text"
              required
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-[#F4F0E7]/40 border border-[#D5CEBE] text-sm text-[#383B32] focus:outline-none focus:border-[#B49A6A]"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-[#383B32]">
              E-mail da Conta
            </label>
            <input
              type="text"
              disabled
              value={user?.email || 'peregrino@memorial.local'}
              className="w-full px-3.5 py-2 rounded-xl bg-[#E5DECE]/30 border border-[#D5CEBE] text-sm text-[#383B32]/60 cursor-not-allowed"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-[#383B32]">
            Minha Intenção para a Caminhada
          </label>
          <textarea
            rows={2}
            value={intention}
            onChange={e => setIntention(e.target.value)}
            placeholder="Qual é o propósito do seu memorial?"
            className="w-full p-3 rounded-xl bg-[#F4F0E7]/40 border border-[#D5CEBE] text-sm text-[#383B32] focus:outline-none font-sans"
          />
        </div>

        <div className="flex items-center justify-end pt-2">
          <button
            type="submit"
            className="px-5 py-2 text-xs font-medium text-white bg-[#383B32] hover:bg-[#2A2C25] rounded-xl transition-colors cursor-pointer"
          >
            Atualizar Perfil
          </button>
        </div>
      </form>

      {/* 2. Exportação dos Registros */}
      <div className="bg-white/85 border border-[#E5DECE] rounded-2xl p-6 sm:p-8 space-y-4">
        <div className="flex items-center gap-2.5 border-b border-[#E5DECE] pb-3">
          <Download className="w-5 h-5 text-[#B49A6A]" />
          <div>
            <h3 className="font-serif text-xl text-[#383B32]">
              Exportação dos Registros Pessoais
            </h3>
            <p className="text-xs text-[#383B32]/75 font-serif italic">
              Seus registros espirituais pertencem exclusivamente a você. Faça backup a qualquer momento.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          <button
            type="button"
            onClick={handleExportJSON}
            disabled={isExporting}
            className="p-4 bg-[#F4F0E7]/60 hover:bg-[#F4F0E7] border border-[#D5CEBE] rounded-xl text-left transition-colors cursor-pointer flex items-start gap-3"
          >
            <Download className="w-5 h-5 text-[#383B32] shrink-0 mt-0.5" />
            <div>
              <span className="font-serif font-semibold text-sm text-[#383B32] block">
                Exportar Backup em JSON
              </span>
              <p className="text-xs text-[#383B32]/70 font-sans mt-0.5">
                Download de arquivo contendo todas as pedras, orações, projetos, revisões e jornadas estruturados.
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={handlePrintOrExportPDF}
            className="p-4 bg-[#F4F0E7]/60 hover:bg-[#F4F0E7] border border-[#D5CEBE] rounded-xl text-left transition-colors cursor-pointer flex items-start gap-3"
          >
            <Printer className="w-5 h-5 text-[#879579] shrink-0 mt-0.5" />
            <div>
              <span className="font-serif font-semibold text-sm text-[#383B32] block">
                Imprimir / Salvar como PDF
              </span>
              <p className="text-xs text-[#383B32]/70 font-sans mt-0.5">
                Gera uma versão limpa e formatada para impressão em papel ou exportação para PDF pelo navegador.
              </p>
            </div>
          </button>
        </div>
      </div>

      {/* 3. Status de Armazenamento e Conexão Supabase */}
      <div className="bg-white/85 border border-[#E5DECE] rounded-2xl p-6 sm:p-8 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E5DECE] pb-3">
          <div className="flex items-center gap-2.5">
            <Database className="w-5 h-5 text-[#383B32]" />
            <div>
              <h3 className="font-serif text-xl text-[#383B32]">
                Conexão com Banco de Dados
              </h3>
              <span className="text-xs text-[#383B32]/70 font-serif italic">
                Supabase PostgreSQL com Row Level Security (RLS) & Modo Local
              </span>
            </div>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border bg-[#F4F0E7]">
            {isConnected ? (
              <>
                <ShieldCheck className="w-4 h-4 text-emerald-700" />
                <span className="text-emerald-900 font-semibold">Nuvem Supabase Ativa</span>
              </>
            ) : (
              <>
                <HardDrive className="w-4 h-4 text-[#B49A6A]" />
                <span className="text-[#383B32] font-semibold">Armazenamento Local Ativo</span>
              </>
            )}
          </div>
        </div>

        <p className="text-xs text-[#383B32]/85 font-sans leading-relaxed">
          O <strong>Memorial dos Santos</strong> está pronto para operar em dois modos:
          <br />• <strong>Modo Local:</strong> Gravação contínua no navegador, preservando seus dados entre recargas e sessões.
          <br />• <strong>Nuvem Supabase:</strong> Se você possui um projeto Supabase, basta colar a URL e a chave pública (anon) abaixo para persistir no PostgreSQL com segurança RLS.
        </p>

        <div className="space-y-4 pt-1">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-[#383B32]">
              URL do Projeto Supabase
            </label>
            <input
              type="text"
              value={customUrl}
              onChange={e => setCustomUrl(e.target.value)}
              placeholder="https://seu-projeto.supabase.co"
              className="w-full px-3.5 py-2 rounded-xl bg-[#F4F0E7]/40 border border-[#D5CEBE] text-xs font-mono text-[#383B32]"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-[#383B32]">
              Chave Pública Anônima (anon key)
            </label>
            <input
              type="password"
              value={customKey}
              onChange={e => setCustomKey(e.target.value)}
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              className="w-full px-3.5 py-2 rounded-xl bg-[#F4F0E7]/40 border border-[#D5CEBE] text-xs font-mono text-[#383B32]"
            />
            <span className="text-[10px] text-[#383B32]/60 block font-sans">
              Segurança: Nunca utilize a chave service_role no navegador. Apenas a chave pública anon é segura para o cliente.
            </span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
            <button
              type="button"
              onClick={handleTestAndSaveSupabase}
              disabled={testResult.loading}
              className="px-5 py-2 text-xs font-medium text-white bg-[#383B32] hover:bg-[#2A2C25] rounded-xl transition-colors cursor-pointer"
            >
              {testResult.loading ? 'Testando Conexão...' : 'Salvar & Testar Conexão'}
            </button>

            {testResult.message && (
              <div className={`text-xs flex items-center gap-1.5 ${
                testResult.success ? 'text-emerald-800' : 'text-amber-800'
              }`}>
                {testResult.success ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-amber-600" />}
                <span>{testResult.message}</span>
              </div>
            )}
          </div>
        </div>

        {/* Migrations note */}
        <div className="p-4 bg-[#F4F0E7] rounded-xl border border-[#D5CEBE] text-xs text-[#383B32]/80 space-y-1">
          <span className="font-semibold block text-[#383B32]">
            Esquema SQL e Políticas RLS Prontas:
          </span>
          <p>
            O arquivo de migração completo está disponível no projeto em:
            <code className="bg-white px-1.5 py-0.5 rounded border border-[#D5CEBE] text-[11px] font-mono ml-1">
              supabase/migrations/20261001_initial_schema.sql
            </code>. Basta executá-lo no SQL Editor do Supabase para criar as 14 tabelas com todas as políticas RLS.
          </p>
        </div>
      </div>

      {/* 4. Exclusão de Conta */}
      <div className="bg-red-50/60 border border-red-200 rounded-2xl p-6 sm:p-8 space-y-4">
        <div className="flex items-center gap-2.5 text-red-900">
          <Trash2 className="w-5 h-5 text-red-700" />
          <h3 className="font-serif text-xl font-semibold">
            Excluir Conta e Todos os Registros
          </h3>
        </div>
        <p className="text-xs text-red-950 font-sans leading-relaxed">
          Esta ação é irreversível. Todas as suas pedras, anotações de jornada, mapas de vida, projetos, orações e revisões serão permanentemente apagados do banco de dados e do dispositivo.
        </p>
        <button
          type="button"
          onClick={() => setShowDeleteModal(true)}
          className="px-4 py-2 text-xs font-semibold text-white bg-red-700 hover:bg-red-800 rounded-xl transition-colors cursor-pointer"
        >
          Solicitar Exclusão Definitiva
        </button>
      </div>

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        title="Confirmar Exclusão de Conta?"
        description="Você tem certeza absoluta? Todos os seus memoriais e pedras guardadas serão excluídos permanentemente sem possibilidade de recuperação."
        confirmLabel="Sim, excluir tudo definitivamente"
        cancelLabel="Cancelar e manter meu memorial"
        isDestructive={true}
        onConfirm={handleDeleteAccountConfirm}
        onCancel={() => setShowDeleteModal(false)}
      />
    </div>
  );
};
