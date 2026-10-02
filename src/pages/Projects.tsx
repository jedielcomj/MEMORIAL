import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { storage } from '../lib/storage';
import { Project, Dream } from '../types/memorial';
import { PageHeader } from '../components/PageHeader';
import { ConfirmModal } from '../components/ConfirmModal';
import { 
  FolderGit2, 
  Plus, 
  Trash2, 
  Edit3, 
  CheckCircle, 
  Clock, 
  Calendar, 
  Users, 
  Sparkles,
  X
} from 'lucide-react';

export const ProjectsPage: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  // Form State matching the PDF
  const [form, setForm] = useState<{
    name: string;
    objective_result: string;
    why_want: string;
    what_represents: string;
    under_my_control: string;
    what_need_to_learn: string;
    who_can_help: string;
    first_step_possible: string;
    step1: string;
    step2: string;
    step3: string;
    step4: string;
    resources_people_deadline: string;
    first_step_date: string;
    status: 'planejado' | 'em_andamento' | 'pausado' | 'concluido' | 'arquivado';
    dream_id?: string;
  }>({
    name: '',
    objective_result: '',
    why_want: '',
    what_represents: '',
    under_my_control: '',
    what_need_to_learn: '',
    who_can_help: '',
    first_step_possible: '',
    step1: '',
    step2: '',
    step3: '',
    step4: '',
    resources_people_deadline: '',
    first_step_date: new Date().toISOString().split('T')[0],
    status: 'planejado',
  });

  useEffect(() => {
    if (!user) return;
    loadProjects();

    // Check if navigated with fromDream in location.state
    const fromDream = (location.state as any)?.fromDream as Dream | undefined;
    if (fromDream) {
      setEditingProject(null);
      setForm({
        name: fromDream.title,
        objective_result: fromDream.description || '',
        why_want: fromDream.why_i_want || '',
        what_represents: fromDream.personal_meaning || '',
        under_my_control: '',
        what_need_to_learn: '',
        who_can_help: '',
        first_step_possible: '',
        step1: '',
        step2: '',
        step3: '',
        step4: '',
        resources_people_deadline: '',
        first_step_date: new Date().toISOString().split('T')[0],
        status: 'planejado',
        dream_id: fromDream.id,
      });
      setIsModalOpen(true);
    }
  }, [user, location.state]);

  const loadProjects = async () => {
    if (!user) return;
    setLoading(true);
    const data = await storage.getProjects(user.id);
    setProjects(data);
    setLoading(false);
  };

  const handleOpenCreate = () => {
    setEditingProject(null);
    setForm({
      name: '',
      objective_result: '',
      why_want: '',
      what_represents: '',
      under_my_control: '',
      what_need_to_learn: '',
      who_can_help: '',
      first_step_possible: '',
      step1: '',
      step2: '',
      step3: '',
      step4: '',
      resources_people_deadline: '',
      first_step_date: new Date().toISOString().split('T')[0],
      status: 'planejado',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (proj: Project) => {
    setEditingProject(proj);
    setForm({
      name: proj.name,
      objective_result: proj.objective_result,
      why_want: proj.why_want || '',
      what_represents: proj.what_represents || '',
      under_my_control: proj.under_my_control || '',
      what_need_to_learn: proj.what_need_to_learn || '',
      who_can_help: proj.who_can_help || '',
      first_step_possible: proj.first_step_possible || '',
      step1: proj.step1,
      step2: proj.step2,
      step3: proj.step3,
      step4: proj.step4,
      resources_people_deadline: proj.resources_people_deadline,
      first_step_date: proj.first_step_date || new Date().toISOString().split('T')[0],
      status: proj.status,
      dream_id: proj.dream_id,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !form.name.trim()) return;

    const toSave: Project = {
      id: editingProject ? editingProject.id : 'proj_' + Date.now(),
      user_id: user.id,
      dream_id: form.dream_id,
      name: form.name.trim(),
      objective_result: form.objective_result.trim(),
      why_want: form.why_want.trim(),
      what_represents: form.what_represents.trim(),
      under_my_control: form.under_my_control.trim(),
      what_need_to_learn: form.what_need_to_learn.trim(),
      who_can_help: form.who_can_help.trim(),
      first_step_possible: form.first_step_possible.trim(),
      step1: form.step1.trim(),
      step2: form.step2.trim(),
      step3: form.step3.trim(),
      step4: form.step4.trim(),
      resources_people_deadline: form.resources_people_deadline.trim(),
      first_step_date: form.first_step_date,
      status: form.status,
      created_at: editingProject ? editingProject.created_at : new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    await storage.saveProject(toSave);
    await loadProjects();
    setIsModalOpen(false);
  };

  const handleDeleteConfirm = async () => {
    if (!user || !deleteTargetId) return;
    await storage.deleteProject(user.id, deleteTargetId);
    setProjects(prev => prev.filter(p => p.id !== deleteTargetId));
    setDeleteTargetId(null);
  };

  const handleUpdateStatus = async (project: Project, newStatus: Project['status']) => {
    if (!user) return;
    const updated: Project = { ...project, status: newStatus, updated_at: new Date().toISOString() };
    await storage.saveProject(updated);
    setProjects(prev => prev.map(p => (p.id === project.id ? updated : p)));
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-16">
      <PageHeader
        badge="Parte 5 · Do Sonho ao Projeto"
        title="Meus Projetos"
        subtitle="“Sonho sem registro pode permanecer apenas como desejo. Sonho registrado pode se transformar em direção. Direção dividida em passos pode se transformar em projeto.” — Dias 61–75"
        action={
          <button
            type="button"
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-white bg-[#383B32] hover:bg-[#2A2C25] rounded-xl transition-colors shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Criar Ficha de Projeto</span>
          </button>
        }
      />

      {projects.length === 0 ? (
        <div className="text-center py-16 px-4 bg-white/50 border border-dashed border-[#D5CEBE] rounded-2xl space-y-4">
          <div className="w-12 h-12 rounded-full bg-[#E5DECE]/50 flex items-center justify-center mx-auto text-[#383B32]">
            <FolderGit2 className="w-6 h-6" />
          </div>
          <h3 className="font-serif text-lg text-[#383B32]">
            Nenhum projeto estruturado ainda.
          </h3>
          <p className="text-xs text-[#383B32]/70 font-serif italic max-w-md mx-auto">
            Transforme um sonho registrado em um plano com objetivo claro, 4 etapas e data para o primeiro passo.
          </p>
          <button
            type="button"
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-[#383B32] hover:bg-[#2A2C25] rounded-xl transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Criar meu primeiro projeto</span>
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {projects.map(proj => (
            <div
              key={proj.id}
              className="bg-white/85 border border-[#E5DECE] hover:border-[#383B32]/40 rounded-2xl p-6 space-y-5 transition-all shadow-2xs"
            >
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E5DECE] pb-3">
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-lg bg-[#E5DECE]/70 text-[#383B32] font-mono text-xs font-bold flex items-center justify-center">
                    P
                  </span>
                  <div>
                    <h3 className="text-xl font-serif text-[#383B32] font-semibold">
                      {proj.name}
                    </h3>
                    <p className="text-xs text-[#383B32]/70 font-serif italic">
                      Objetivo: {proj.objective_result || 'Definido na ficha'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={proj.status}
                    onChange={e => handleUpdateStatus(proj, e.target.value as any)}
                    className="text-xs bg-[#F4F0E7] border border-[#D5CEBE] rounded-lg px-2.5 py-1 text-[#383B32] font-medium focus:outline-none"
                  >
                    <option value="planejado">Planejado</option>
                    <option value="em_andamento">Em Andamento</option>
                    <option value="pausado">Pausado</option>
                    <option value="concluido">✓ Concluído</option>
                    <option value="arquivado">Arquivado</option>
                  </select>

                  <button
                    type="button"
                    onClick={() => handleOpenEdit(proj)}
                    className="p-1.5 text-[#383B32]/60 hover:text-[#383B32] rounded-lg cursor-pointer"
                    title="Editar ficha do projeto"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setDeleteTargetId(proj.id)}
                    className="p-1.5 text-[#383B32]/40 hover:text-red-700 rounded-lg cursor-pointer"
                    title="Excluir projeto"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* The 4 Project Steps (Ficha do projeto - Página 19) */}
              <div className="space-y-2">
                <span className="text-[11px] uppercase tracking-wider font-semibold text-[#879579] block">
                  As 4 Etapas do Projeto:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {[
                    { num: '1', title: 'Etapa 1', desc: proj.step1 },
                    { num: '2', title: 'Etapa 2', desc: proj.step2 },
                    { num: '3', title: 'Etapa 3', desc: proj.step3 },
                    { num: '4', title: 'Etapa 4', desc: proj.step4 },
                  ].map(step => (
                    <div
                      key={step.num}
                      className="p-3 bg-[#F4F0E7]/50 rounded-xl border border-[#D5CEBE]/60 text-xs space-y-1"
                    >
                      <span className="font-mono font-bold text-[#B49A6A]">
                        Etapa {step.num}
                      </span>
                      <p className="text-[#383B32]/85 font-sans min-h-[36px]">
                        {step.desc || '—'}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Resources & First Step Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-[#E5DECE]/25 p-3.5 rounded-xl border border-[#D5CEBE]/50">
                <div className="flex items-start gap-2">
                  <span className="font-mono font-bold text-[#383B32] bg-[#E5DECE] px-1.5 py-0.5 rounded">
                    R
                  </span>
                  <div>
                    <span className="font-semibold text-[#383B32] block">
                      Recursos · Pessoas · Prazo:
                    </span>
                    <span className="text-[#383B32]/75">
                      {proj.resources_people_deadline || 'Não especificado'}
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <span className="font-mono font-bold text-[#383B32] bg-[#E5DECE] px-1.5 py-0.5 rounded">
                    D
                  </span>
                  <div>
                    <span className="font-semibold text-[#383B32] block">
                      Data do Primeiro Passo:
                    </span>
                    <span className="text-[#383B32]/75">
                      {proj.first_step_date 
                        ? new Date(proj.first_step_date + 'T00:00:00').toLocaleDateString('pt-BR')
                        : 'A definir'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Project Modal: Do Sonho ao Projeto & Ficha do Projeto */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-[#F4F0E7] border border-[#E5DECE] rounded-2xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl overflow-y-auto max-h-[92vh] space-y-6">
            <div className="border-b border-[#E5DECE] pb-3 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase tracking-widest text-[#B49A6A] font-semibold">
                  Parte 5 · Páginas 18 e 19
                </span>
                <h3 className="text-2xl font-serif text-[#383B32] mt-0.5">
                  {editingProject ? 'Editar Ficha do Projeto' : 'Nova Ficha de Projeto'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-[#383B32]/60 hover:text-[#383B32] rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Top Block: P - Projeto & O - Objetivo */}
              <div className="space-y-4 bg-white/70 p-4 rounded-xl border border-[#E5DECE]">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#383B32] flex items-center gap-1.5">
                    <span className="font-mono text-[#B49A6A] font-bold">P</span>
                    <span>Nome do Projeto (ou Sonho de Origem) *</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    placeholder="Ex: Escrita do Memorial, Transição de Carreira, Reforma da Casa..."
                    className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#D5CEBE] text-sm text-[#383B32] focus:outline-none focus:border-[#383B32]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#383B32] flex items-center gap-1.5">
                    <span className="font-mono text-[#B49A6A] font-bold">O</span>
                    <span>Objetivo e Resultado Desejado</span>
                  </label>
                  <textarea
                    rows={2}
                    value={form.objective_result}
                    onChange={e => setForm({ ...form, objective_result: e.target.value })}
                    placeholder="Qual é a definição clara de conclusão bem-sucedida?"
                    className="w-full p-3 rounded-xl bg-white border border-[#D5CEBE] text-sm text-[#383B32] focus:outline-none focus:border-[#383B32]"
                  />
                </div>
              </div>

              {/* The 4 Steps (Página 19) */}
              <div className="space-y-3 bg-white/70 p-4 rounded-xl border border-[#E5DECE]">
                <span className="text-xs uppercase font-semibold text-[#879579] tracking-wider block">
                  As 4 Etapas Iniciais (Ficha do Projeto)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-mono font-semibold text-[#383B32]">
                      1. Etapa 1
                    </label>
                    <input
                      type="text"
                      value={form.step1}
                      onChange={e => setForm({ ...form, step1: e.target.value })}
                      placeholder="Primeira fase ou marco..."
                      className="w-full px-3 py-1.5 rounded-lg bg-white border border-[#D5CEBE] text-xs text-[#383B32] focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-mono font-semibold text-[#383B32]">
                      2. Etapa 2
                    </label>
                    <input
                      type="text"
                      value={form.step2}
                      onChange={e => setForm({ ...form, step2: e.target.value })}
                      placeholder="Segunda fase ou marco..."
                      className="w-full px-3 py-1.5 rounded-lg bg-white border border-[#D5CEBE] text-xs text-[#383B32] focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-mono font-semibold text-[#383B32]">
                      3. Etapa 3
                    </label>
                    <input
                      type="text"
                      value={form.step3}
                      onChange={e => setForm({ ...form, step3: e.target.value })}
                      placeholder="Terceira fase ou marco..."
                      className="w-full px-3 py-1.5 rounded-lg bg-white border border-[#D5CEBE] text-xs text-[#383B32] focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-mono font-semibold text-[#383B32]">
                      4. Etapa 4
                    </label>
                    <input
                      type="text"
                      value={form.step4}
                      onChange={e => setForm({ ...form, step4: e.target.value })}
                      placeholder="Quarta fase ou marco..."
                      className="w-full px-3 py-1.5 rounded-lg bg-white border border-[#D5CEBE] text-xs text-[#383B32] focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* R & D - Resources & Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#383B32] flex items-center gap-1.5">
                    <span className="font-mono text-[#B49A6A] font-bold">R</span>
                    <span>Recursos · Pessoas · Prazo</span>
                  </label>
                  <input
                    type="text"
                    value={form.resources_people_deadline}
                    onChange={e => setForm({ ...form, resources_people_deadline: e.target.value })}
                    placeholder="Quem ajudará? Que materiais precisa? Qual prazo?"
                    className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#D5CEBE] text-sm text-[#383B32] focus:outline-none focus:border-[#383B32]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#383B32] flex items-center gap-1.5">
                    <span className="font-mono text-[#B49A6A] font-bold">D</span>
                    <span>Data do Primeiro Passo</span>
                  </label>
                  <input
                    type="date"
                    value={form.first_step_date}
                    onChange={e => setForm({ ...form, first_step_date: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#D5CEBE] text-sm text-[#383B32] focus:outline-none focus:border-[#383B32]"
                  />
                </div>
              </div>

              {/* Questions from Page 18: Do Sonho ao Projeto */}
              <details className="bg-white/60 p-4 rounded-xl border border-[#E5DECE] text-xs space-y-3 cursor-pointer">
                <summary className="font-serif font-semibold text-[#383B32] text-sm">
                  Reflexões do Manual (Página 18: Do Sonho ao Projeto)
                </summary>
                <div className="space-y-3 pt-2">
                  <div className="space-y-1">
                    <label className="font-serif font-medium text-[#383B32]">
                      02. Por que quero isso?
                    </label>
                    <input
                      type="text"
                      value={form.why_want}
                      onChange={e => setForm({ ...form, why_want: e.target.value })}
                      placeholder="A motivação do coração..."
                      className="w-full px-3 py-1.5 rounded-lg bg-white border border-[#D5CEBE] text-xs text-[#383B32]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-serif font-medium text-[#383B32]">
                      04. O que está sob meu controle?
                    </label>
                    <input
                      type="text"
                      value={form.under_my_control}
                      onChange={e => setForm({ ...form, under_my_control: e.target.value })}
                      placeholder="O que depende exclusivamente da sua atitude..."
                      className="w-full px-3 py-1.5 rounded-lg bg-white border border-[#D5CEBE] text-xs text-[#383B32]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-serif font-medium text-[#383B32]">
                      05. O que preciso aprender ou adquirir?
                    </label>
                    <input
                      type="text"
                      value={form.what_need_to_learn}
                      onChange={e => setForm({ ...form, what_need_to_learn: e.target.value })}
                      placeholder="Conhecimento, ferramentas, mentorias..."
                      className="w-full px-3 py-1.5 rounded-lg bg-white border border-[#D5CEBE] text-xs text-[#383B32]"
                    />
                  </div>
                </div>
              </details>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E5DECE]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-[#383B32] hover:bg-[#E5DECE] rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-medium text-white bg-[#383B32] hover:bg-[#2A2C25] rounded-xl cursor-pointer"
                >
                  {editingProject ? 'Salvar Alterações' : 'Criar Ficha de Projeto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      <ConfirmModal
        isOpen={Boolean(deleteTargetId)}
        title="Excluir Projeto?"
        description="Esta ficha de projeto será excluída. O sonho que deu origem permanecerá intacto."
        confirmLabel="Sim, excluir"
        cancelLabel="Cancelar"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTargetId(null)}
      />
    </div>
  );
};
