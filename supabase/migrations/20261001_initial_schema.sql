-- ====================================================================
-- MEMORIAL DOS SANTOS — ESQUEMA RELACIONAL POSTGRESQL & POLÍTICAS RLS
-- Versão: 1.0 (Compatível com Supabase & PostgreSQL padrão)
-- Baseado no manual "Memorial dos Santos" (Josué 4 e 1 Samuel 7:12)
-- ====================================================================

-- 1. Habilitar extensões úteis
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. TABELA: profiles (perfis de usuário vinculados a auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL DEFAULT 'Peregrino',
  email TEXT,
  intention_90_days TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. TABELA: journeys (acompanhamento da jornada de 90 dias)
CREATE TABLE IF NOT EXISTS public.journeys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed')),
  current_stage_index INTEGER NOT NULL DEFAULT 0,
  completed_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT unique_user_journey UNIQUE (user_id)
);

-- 4. TABELA: journey_activities (respostas de cada atividade/etapa)
CREATE TABLE IF NOT EXISTS public.journey_activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stage_id TEXT NOT NULL,
  activity_key TEXT NOT NULL,
  response_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  completed BOOLEAN NOT NULL DEFAULT false,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT unique_user_activity UNIQUE (user_id, stage_id, activity_key)
);

-- 5. TABELA: stones (O Livro das Pedras: encontros, desertos, Jordões, memoriais)
CREATE TABLE IF NOT EXISTS public.stones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN (
    'Provisão', 'Resposta', 'Livramento', 'Espera', 'Direção', 
    'Porta aberta', 'Reconciliação', 'Superação', 
    'Uma pedra que ainda não sei nomear',
    'Encontro com Deus', 'Deserto', 'Jordão'
  )),
  event_date DATE,
  story TEXT NOT NULL,
  expected_or_asked TEXT,
  personal_meaning TEXT,
  lessons_learned TEXT,
  future_strength TEXT,
  is_favorite BOOLEAN NOT NULL DEFAULT false,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  year_retrospective_rank INTEGER CHECK (year_retrospective_rank BETWEEN 1 AND 10),
  retrospective_year INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 6. TABELA: life_area_reflections (O Mapa da Minha Vida - 10 áreas)
CREATE TABLE IF NOT EXISTS public.life_area_reflections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  area_key TEXT NOT NULL CHECK (area_key IN (
    'vida_com_deus', 'vida_pessoal', 'familia', 'relacionamentos',
    'trabalho_proposito', 'financas', 'casa_patrimonio',
    'criatividade_projetos', 'sonhos_experiencias', 'servico_impacto'
  )),
  area_title TEXT NOT NULL,
  where_i_am TEXT NOT NULL DEFAULT '',
  what_i_desire TEXT NOT NULL DEFAULT '',
  next_step TEXT NOT NULL DEFAULT '',
  reflection_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT unique_user_area UNIQUE (user_id, area_key)
);

-- 7. TABELA: season_discernments (Discernir a Estação - 5 perguntas)
CREATE TABLE IF NOT EXISTS public.season_discernments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  asking_attention TEXT NOT NULL DEFAULT '',
  needs_to_end TEXT NOT NULL DEFAULT '',
  needs_preserved TEXT NOT NULL DEFAULT '',
  placed_before_me TEXT NOT NULL DEFAULT '',
  can_wait TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT unique_user_season UNIQUE (user_id)
);

-- 8. TABELA: dreams (O Livro dos Sonhos)
CREATE TABLE IF NOT EXISTS public.dreams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  category TEXT DEFAULT 'sonho' CHECK (category IN ('sonho', 'um_dia', 'sem_medo', 'com_recursos', 'geral')),
  description TEXT NOT NULL DEFAULT '',
  personal_meaning TEXT,
  why_i_want TEXT,
  time_horizon TEXT DEFAULT 'médio prazo',
  status TEXT NOT NULL DEFAULT 'ativo' CHECK (status IN ('ativo', 'em_projeto', 'realizado', 'arquivado')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 9. TABELA: legacy_reflections (Legado - 5 perguntas)
CREATE TABLE IF NOT EXISTS public.legacy_reflections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  build TEXT NOT NULL DEFAULT '',
  discover TEXT NOT NULL DEFAULT '',
  learn TEXT NOT NULL DEFAULT '',
  provide_loved_ones TEXT NOT NULL DEFAULT '',
  legacy_to_leave TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT unique_user_legacy UNIQUE (user_id)
);

-- 10. TABELA: projects (Do Sonho ao Projeto & Ficha do Projeto)
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  dream_id UUID REFERENCES public.dreams(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  objective_result TEXT NOT NULL DEFAULT '',
  why_want TEXT,
  what_represents TEXT,
  under_my_control TEXT,
  what_need_to_learn TEXT,
  who_can_help TEXT,
  first_step_possible TEXT,
  step1 TEXT NOT NULL DEFAULT '',
  step2 TEXT NOT NULL DEFAULT '',
  step3 TEXT NOT NULL DEFAULT '',
  step4 TEXT NOT NULL DEFAULT '',
  resources_people_deadline TEXT NOT NULL DEFAULT '',
  first_step_date DATE,
  status TEXT NOT NULL DEFAULT 'planejado' CHECK (status IN ('planejado', 'em_andamento', 'pausado', 'concluido', 'arquivado')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 11. TABELA: prayers (O Caderno das Orações)
CREATE TABLE IF NOT EXISTS public.prayers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT,
  asking TEXT NOT NULL DEFAULT '',
  delivering TEXT NOT NULL DEFAULT '',
  thanking TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'em_oracao' CHECK (status IN ('em_oracao', 'respondida', 'renovada', 'guardada')),
  answered_at DATE,
  answered_story TEXT,
  answered_feeling TEXT,
  answered_lesson TEXT,
  resulting_stone_id UUID REFERENCES public.stones(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 12. TABELA: monthly_reviews (Revisão Mensal)
CREATE TABLE IF NOT EXISTS public.monthly_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  year INTEGER NOT NULL,
  month INTEGER NOT NULL CHECK (month BETWEEN 1 AND 12),
  grateful_things TEXT NOT NULL DEFAULT '',
  stones_to_keep TEXT NOT NULL DEFAULT '',
  lessons_learned TEXT NOT NULL DEFAULT '',
  avoid_repeating TEXT NOT NULL DEFAULT '',
  keep_going TEXT NOT NULL DEFAULT '',
  dream_advanced TEXT NOT NULL DEFAULT '',
  project_attention TEXT NOT NULL DEFAULT '',
  is_completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT unique_user_month_review UNIQUE (user_id, year, month)
);

-- 13. TABELA: annual_reviews (Revisão Anual)
CREATE TABLE IF NOT EXISTS public.annual_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  year INTEGER NOT NULL,
  what_god_did TEXT NOT NULL DEFAULT '',
  biggest_stones TEXT NOT NULL DEFAULT '',
  biggest_jordan TEXT NOT NULL DEFAULT '',
  opened_closed_doors TEXT NOT NULL DEFAULT '',
  what_built TEXT NOT NULL DEFAULT '',
  living_dreams TEXT NOT NULL DEFAULT '',
  what_changed_in_me TEXT NOT NULL DEFAULT '',
  is_completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT unique_user_annual_review UNIQUE (user_id, year)
);

-- 14. TABELA: new_jordan_reflections (Quando o novo Jordão chegar)
CREATE TABLE IF NOT EXISTS public.new_jordan_reflections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  passed_before TEXT NOT NULL DEFAULT '',
  what_happened_then TEXT NOT NULL DEFAULT '',
  what_learned_then TEXT NOT NULL DEFAULT '',
  who_helped_then TEXT NOT NULL DEFAULT '',
  stone_to_remember_id UUID REFERENCES public.stones(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 15. TABELA: closure_declarations (Declaração de Memorial & Encerramento)
CREATE TABLE IF NOT EXISTS public.closure_declarations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  what_stones_tell TEXT NOT NULL DEFAULT '',
  final_page_q1 TEXT NOT NULL DEFAULT '',
  final_page_q2 TEXT NOT NULL DEFAULT '',
  final_page_q3 TEXT NOT NULL DEFAULT '',
  final_page_q4 TEXT NOT NULL DEFAULT '',
  final_page_q5 TEXT NOT NULL DEFAULT '',
  final_page_q6 TEXT NOT NULL DEFAULT '',
  last_stone_to_carry TEXT NOT NULL DEFAULT '',
  completion_date DATE,
  signature TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT unique_user_closure UNIQUE (user_id)
);

-- ====================================================================
-- ÍNDICES PARA CONSULTAS RÁPIDAS
-- ====================================================================
CREATE INDEX IF NOT EXISTS idx_stones_user_cat ON public.stones(user_id, category);
CREATE INDEX IF NOT EXISTS idx_stones_user_date ON public.stones(user_id, event_date);
CREATE INDEX IF NOT EXISTS idx_stones_retrospective ON public.stones(user_id, retrospective_year, year_retrospective_rank);
CREATE INDEX IF NOT EXISTS idx_dreams_user_status ON public.dreams(user_id, status);
CREATE INDEX IF NOT EXISTS idx_projects_user_status ON public.projects(user_id, status);
CREATE INDEX IF NOT EXISTS idx_prayers_user_status ON public.prayers(user_id, status);

-- ====================================================================
-- ROW LEVEL SECURITY (RLS) — SEGURANÇA E ISOLAMENTO RIGOROSO
-- ====================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journeys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journey_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.life_area_reflections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.season_discernments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dreams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.legacy_reflections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prayers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monthly_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.annual_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.new_jordan_reflections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.closure_declarations ENABLE ROW LEVEL SECURITY;

-- Macro de políticas: O usuário autenticado só pode acessar e modificar seus próprios registros

-- profiles
CREATE POLICY "profiles_select" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_insert" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update" ON public.profiles FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_delete" ON public.profiles FOR DELETE USING (auth.uid() = id);

-- journeys
CREATE POLICY "journeys_select" ON public.journeys FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "journeys_insert" ON public.journeys FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "journeys_update" ON public.journeys FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "journeys_delete" ON public.journeys FOR DELETE USING (auth.uid() = user_id);

-- journey_activities
CREATE POLICY "journey_activities_select" ON public.journey_activities FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "journey_activities_insert" ON public.journey_activities FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "journey_activities_update" ON public.journey_activities FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "journey_activities_delete" ON public.journey_activities FOR DELETE USING (auth.uid() = user_id);

-- stones
CREATE POLICY "stones_select" ON public.stones FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "stones_insert" ON public.stones FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "stones_update" ON public.stones FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "stones_delete" ON public.stones FOR DELETE USING (auth.uid() = user_id);

-- life_area_reflections
CREATE POLICY "life_area_select" ON public.life_area_reflections FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "life_area_insert" ON public.life_area_reflections FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "life_area_update" ON public.life_area_reflections FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "life_area_delete" ON public.life_area_reflections FOR DELETE USING (auth.uid() = user_id);

-- season_discernments
CREATE POLICY "season_select" ON public.season_discernments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "season_insert" ON public.season_discernments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "season_update" ON public.season_discernments FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "season_delete" ON public.season_discernments FOR DELETE USING (auth.uid() = user_id);

-- dreams
CREATE POLICY "dreams_select" ON public.dreams FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "dreams_insert" ON public.dreams FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "dreams_update" ON public.dreams FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "dreams_delete" ON public.dreams FOR DELETE USING (auth.uid() = user_id);

-- legacy_reflections
CREATE POLICY "legacy_select" ON public.legacy_reflections FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "legacy_insert" ON public.legacy_reflections FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "legacy_update" ON public.legacy_reflections FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "legacy_delete" ON public.legacy_reflections FOR DELETE USING (auth.uid() = user_id);

-- projects
CREATE POLICY "projects_select" ON public.projects FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "projects_insert" ON public.projects FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "projects_update" ON public.projects FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "projects_delete" ON public.projects FOR DELETE USING (auth.uid() = user_id);

-- prayers
CREATE POLICY "prayers_select" ON public.prayers FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "prayers_insert" ON public.prayers FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "prayers_update" ON public.prayers FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "prayers_delete" ON public.prayers FOR DELETE USING (auth.uid() = user_id);

-- monthly_reviews
CREATE POLICY "monthly_reviews_select" ON public.monthly_reviews FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "monthly_reviews_insert" ON public.monthly_reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "monthly_reviews_update" ON public.monthly_reviews FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "monthly_reviews_delete" ON public.monthly_reviews FOR DELETE USING (auth.uid() = user_id);

-- annual_reviews
CREATE POLICY "annual_reviews_select" ON public.annual_reviews FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "annual_reviews_insert" ON public.annual_reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "annual_reviews_update" ON public.annual_reviews FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "annual_reviews_delete" ON public.annual_reviews FOR DELETE USING (auth.uid() = user_id);

-- new_jordan_reflections
CREATE POLICY "jordan_select" ON public.new_jordan_reflections FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "jordan_insert" ON public.new_jordan_reflections FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "jordan_update" ON public.new_jordan_reflections FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "jordan_delete" ON public.new_jordan_reflections FOR DELETE USING (auth.uid() = user_id);

-- closure_declarations
CREATE POLICY "closure_select" ON public.closure_declarations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "closure_insert" ON public.closure_declarations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "closure_update" ON public.closure_declarations FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "closure_delete" ON public.closure_declarations FOR DELETE USING (auth.uid() = user_id);
