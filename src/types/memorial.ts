/**
 * Tipos de Domínio do Memorial dos Santos
 * Baseado no manual "Memorial dos Santos" (Josué 4 e 1 Samuel 7:12)
 */

export type StoneCategory = 
  | 'Provisão'
  | 'Resposta'
  | 'Livramento'
  | 'Espera'
  | 'Direção'
  | 'Porta aberta'
  | 'Reconciliação'
  | 'Superação'
  | 'Uma pedra que ainda não sei nomear'
  | 'Encontro com Deus'
  | 'Deserto'
  | 'Jordão';

export interface UserProfile {
  id: string;
  display_name: string;
  email: string;
  intention_90_days?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Journey {
  id: string;
  user_id: string;
  start_date: string; // YYYY-MM-DD
  status: 'active' | 'paused' | 'completed';
  current_stage_index: number;
  completed_at?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface JourneyActivity {
  id: string;
  user_id: string;
  stage_id: string;
  activity_key: string;
  response_data: Record<string, string>;
  completed: boolean;
  updated_at: string;
}

export interface Stone {
  id: string;
  user_id: string;
  title: string;
  category: StoneCategory;
  event_date?: string;
  story: string;
  expected_or_asked?: string;
  personal_meaning?: string;
  lessons_learned?: string;
  future_strength?: string;
  is_favorite: boolean;
  tags?: string[];
  year_retrospective_rank?: number; // 1 a 10
  retrospective_year?: number;
  prayer_id?: string;
  project_id?: string;
  created_at: string;
  updated_at: string;
}

export type LifeAreaKey = 
  | 'vida_com_deus'
  | 'vida_pessoal'
  | 'familia'
  | 'relacionamentos'
  | 'trabalho_proposito'
  | 'financas'
  | 'casa_patrimonio'
  | 'criatividade_projetos'
  | 'sonhos_experiencias'
  | 'servico_impacto';

export interface LifeAreaReflection {
  id: string;
  user_id: string;
  area_key: LifeAreaKey;
  area_title: string;
  where_i_am: string;
  what_i_desire: string;
  next_step: string;
  reflection_date: string;
  created_at: string;
  updated_at: string;
}

export interface SeasonDiscernment {
  id: string;
  user_id: string;
  asking_attention: string;
  needs_to_end: string;
  needs_preserved: string;
  placed_before_me: string;
  can_wait: string;
  created_at: string;
  updated_at: string;
}

export interface Dream {
  id: string;
  user_id: string;
  title: string;
  category: 'sonho' | 'um_dia' | 'sem_medo' | 'com_recursos' | 'geral';
  description: string;
  personal_meaning?: string;
  why_i_want?: string;
  time_horizon?: string;
  status: 'ativo' | 'em_projeto' | 'realizado' | 'arquivado';
  created_at: string;
  updated_at: string;
}

export interface LegacyReflection {
  id: string;
  user_id: string;
  build: string;
  discover: string;
  learn: string;
  provide_loved_ones: string;
  legacy_to_leave: string;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  user_id: string;
  dream_id?: string;
  name: string;
  objective_result: string;
  why_want?: string;
  what_represents?: string;
  under_my_control?: string;
  what_need_to_learn?: string;
  who_can_help?: string;
  first_step_possible?: string;
  step1: string;
  step2: string;
  step3: string;
  step4: string;
  resources_people_deadline: string;
  first_step_date?: string;
  status: 'planejado' | 'em_andamento' | 'pausado' | 'concluido' | 'arquivado';
  created_at: string;
  updated_at: string;
}

export interface Prayer {
  id: string;
  user_id: string;
  title?: string;
  asking: string;
  delivering: string;
  thanking: string;
  status: 'em_oracao' | 'respondida' | 'renovada' | 'guardada';
  answered_at?: string;
  answered_story?: string;
  answered_feeling?: string;
  answered_lesson?: string;
  resulting_stone_id?: string;
  created_at: string;
  updated_at: string;
}

export interface MonthlyReview {
  id: string;
  user_id: string;
  year: number;
  month: number; // 1-12
  grateful_things: string;
  stones_to_keep: string;
  lessons_learned: string;
  avoid_repeating: string;
  keep_going: string;
  dream_advanced: string;
  project_attention: string;
  is_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface AnnualReview {
  id: string;
  user_id: string;
  year: number;
  what_god_did: string;
  biggest_stones: string;
  biggest_jordan: string;
  opened_closed_doors: string;
  what_built: string;
  living_dreams: string;
  what_changed_in_me: string;
  is_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface NewJordanReflection {
  id: string;
  user_id: string;
  title: string;
  passed_before: string;
  what_happened_then: string;
  what_learned_then: string;
  who_helped_then: string;
  stone_to_remember_id?: string;
  created_at: string;
  updated_at: string;
}

export interface ClosureDeclaration {
  id: string;
  user_id: string;
  what_stones_tell: string;
  final_page_q1: string;
  final_page_q2: string;
  final_page_q3: string;
  final_page_q4: string;
  final_page_q5: string;
  final_page_q6: string;
  last_stone_to_carry: string;
  completion_date?: string;
  signature?: string;
  created_at: string;
  updated_at: string;
}
