import {
  Stone,
  LifeAreaReflection,
  SeasonDiscernment,
  Dream,
  LegacyReflection,
  Project,
  Prayer,
  MonthlyReview,
  AnnualReview,
  NewJordanReflection,
  ClosureDeclaration,
  Journey,
  JourneyActivity,
  LifeAreaKey
} from '../types/memorial';
import { getSupabase } from './supabase';

// Helper for unique IDs
export const generateId = (): string => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'id_' + Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
};

// Local storage key helper
const getLocalKey = (userId: string, collection: string) => `memorial_${userId}_${collection}`;

const getLocalCollection = <T>(userId: string, collection: string): T[] => {
  if (typeof window === 'undefined') return [];
  const raw = localStorage.getItem(getLocalKey(userId, collection));
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
};

const setLocalCollection = <T>(userId: string, collection: string, items: T[]): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(getLocalKey(userId, collection), JSON.stringify(items));
};

export const storage = {
  // ==========================================
  // JORNADA
  // ==========================================
  async getJourney(userId: string): Promise<Journey | null> {
    const supabase = getSupabase();
    if (supabase) {
      const { data, error } = await supabase
        .from('journeys')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();
      if (!error && data) return data as Journey;
    }
    const items = getLocalCollection<Journey>(userId, 'journeys');
    return items[0] || null;
  },

  async saveJourney(journey: Journey): Promise<Journey> {
    const supabase = getSupabase();
    if (supabase) {
      const { data, error } = await supabase
        .from('journeys')
        .upsert(journey)
        .select()
        .single();
      if (!error && data) return data as Journey;
    }
    const items = getLocalCollection<Journey>(journey.user_id, 'journeys');
    const existingIdx = items.findIndex(j => j.id === journey.id || j.user_id === journey.user_id);
    if (existingIdx >= 0) {
      items[existingIdx] = journey;
    } else {
      items.push(journey);
    }
    setLocalCollection(journey.user_id, 'journeys', items);
    return journey;
  },

  async getActivities(userId: string, stageId?: string): Promise<JourneyActivity[]> {
    const supabase = getSupabase();
    if (supabase) {
      let query = supabase.from('journey_activities').select('*').eq('user_id', userId);
      if (stageId) query = query.eq('stage_id', stageId);
      const { data, error } = await query;
      if (!error && data) return data as JourneyActivity[];
    }
    const items = getLocalCollection<JourneyActivity>(userId, 'journey_activities');
    if (stageId) {
      return items.filter(a => a.stage_id === stageId);
    }
    return items;
  },

  async saveActivity(activity: JourneyActivity): Promise<JourneyActivity> {
    const supabase = getSupabase();
    if (supabase) {
      const { data, error } = await supabase
        .from('journey_activities')
        .upsert(activity)
        .select()
        .single();
      if (!error && data) return data as JourneyActivity;
    }
    const items = getLocalCollection<JourneyActivity>(activity.user_id, 'journey_activities');
    const idx = items.findIndex(a => a.stage_id === activity.stage_id && a.activity_key === activity.activity_key);
    if (idx >= 0) {
      items[idx] = activity;
    } else {
      items.push(activity);
    }
    setLocalCollection(activity.user_id, 'journey_activities', items);
    return activity;
  },

  // ==========================================
  // PEDRAS (O LIVRO DAS PEDRAS)
  // ==========================================
  async getStones(userId: string): Promise<Stone[]> {
    const supabase = getSupabase();
    if (supabase) {
      const { data, error } = await supabase
        .from('stones')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      if (!error && data) return data as Stone[];
    }
    return getLocalCollection<Stone>(userId, 'stones');
  },

  async getStoneById(userId: string, id: string): Promise<Stone | null> {
    const supabase = getSupabase();
    if (supabase) {
      const { data, error } = await supabase
        .from('stones')
        .select('*')
        .eq('id', id)
        .eq('user_id', userId)
        .maybeSingle();
      if (!error && data) return data as Stone;
    }
    const items = getLocalCollection<Stone>(userId, 'stones');
    return items.find(s => s.id === id) || null;
  },

  async saveStone(stone: Stone): Promise<Stone> {
    const supabase = getSupabase();
    if (supabase) {
      const { data, error } = await supabase
        .from('stones')
        .upsert(stone)
        .select()
        .single();
      if (!error && data) return data as Stone;
    }
    const items = getLocalCollection<Stone>(stone.user_id, 'stones');
    const idx = items.findIndex(s => s.id === stone.id);
    if (idx >= 0) {
      items[idx] = stone;
    } else {
      items.unshift(stone);
    }
    setLocalCollection(stone.user_id, 'stones', items);
    return stone;
  },

  async deleteStone(userId: string, id: string): Promise<boolean> {
    const supabase = getSupabase();
    if (supabase) {
      const { error } = await supabase
        .from('stones')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);
      if (!error) return true;
    }
    const items = getLocalCollection<Stone>(userId, 'stones');
    const filtered = items.filter(s => s.id !== id);
    setLocalCollection(userId, 'stones', filtered);
    return true;
  },

  // ==========================================
  // O MAPA DA MINHA VIDA (10 ÁREAS)
  // ==========================================
  async getLifeAreas(userId: string): Promise<LifeAreaReflection[]> {
    const supabase = getSupabase();
    if (supabase) {
      const { data, error } = await supabase
        .from('life_area_reflections')
        .select('*')
        .eq('user_id', userId);
      if (!error && data) return data as LifeAreaReflection[];
    }
    return getLocalCollection<LifeAreaReflection>(userId, 'life_areas');
  },

  async saveLifeArea(reflection: LifeAreaReflection): Promise<LifeAreaReflection> {
    const supabase = getSupabase();
    if (supabase) {
      const { data, error } = await supabase
        .from('life_area_reflections')
        .upsert(reflection)
        .select()
        .single();
      if (!error && data) return data as LifeAreaReflection;
    }
    const items = getLocalCollection<LifeAreaReflection>(reflection.user_id, 'life_areas');
    const idx = items.findIndex(a => a.area_key === reflection.area_key);
    if (idx >= 0) {
      items[idx] = reflection;
    } else {
      items.push(reflection);
    }
    setLocalCollection(reflection.user_id, 'life_areas', items);
    return reflection;
  },

  // ==========================================
  // DISCERNIR A ESTAÇÃO
  // ==========================================
  async getSeason(userId: string): Promise<SeasonDiscernment | null> {
    const supabase = getSupabase();
    if (supabase) {
      const { data, error } = await supabase
        .from('season_discernments')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();
      if (!error && data) return data as SeasonDiscernment;
    }
    const items = getLocalCollection<SeasonDiscernment>(userId, 'season_discernments');
    return items[0] || null;
  },

  async saveSeason(season: SeasonDiscernment): Promise<SeasonDiscernment> {
    const supabase = getSupabase();
    if (supabase) {
      const { data, error } = await supabase
        .from('season_discernments')
        .upsert(season)
        .select()
        .single();
      if (!error && data) return data as SeasonDiscernment;
    }
    const items = getLocalCollection<SeasonDiscernment>(season.user_id, 'season_discernments');
    if (items.length > 0) {
      items[0] = season;
    } else {
      items.push(season);
    }
    setLocalCollection(season.user_id, 'season_discernments', items);
    return season;
  },

  // ==========================================
  // O LIVRO DOS SONHOS & LEGADO
  // ==========================================
  async getDreams(userId: string): Promise<Dream[]> {
    const supabase = getSupabase();
    if (supabase) {
      const { data, error } = await supabase
        .from('dreams')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      if (!error && data) return data as Dream[];
    }
    return getLocalCollection<Dream>(userId, 'dreams');
  },

  async saveDream(dream: Dream): Promise<Dream> {
    const supabase = getSupabase();
    if (supabase) {
      const { data, error } = await supabase
        .from('dreams')
        .upsert(dream)
        .select()
        .single();
      if (!error && data) return data as Dream;
    }
    const items = getLocalCollection<Dream>(dream.user_id, 'dreams');
    const idx = items.findIndex(d => d.id === dream.id);
    if (idx >= 0) {
      items[idx] = dream;
    } else {
      items.unshift(dream);
    }
    setLocalCollection(dream.user_id, 'dreams', items);
    return dream;
  },

  async deleteDream(userId: string, id: string): Promise<boolean> {
    const supabase = getSupabase();
    if (supabase) {
      const { error } = await supabase
        .from('dreams')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);
      if (!error) return true;
    }
    const items = getLocalCollection<Dream>(userId, 'dreams');
    const filtered = items.filter(d => d.id !== id);
    setLocalCollection(userId, 'dreams', filtered);
    return true;
  },

  async getLegacy(userId: string): Promise<LegacyReflection | null> {
    const supabase = getSupabase();
    if (supabase) {
      const { data, error } = await supabase
        .from('legacy_reflections')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();
      if (!error && data) return data as LegacyReflection;
    }
    const items = getLocalCollection<LegacyReflection>(userId, 'legacy_reflections');
    return items[0] || null;
  },

  async saveLegacy(legacy: LegacyReflection): Promise<LegacyReflection> {
    const supabase = getSupabase();
    if (supabase) {
      const { data, error } = await supabase
        .from('legacy_reflections')
        .upsert(legacy)
        .select()
        .single();
      if (!error && data) return data as LegacyReflection;
    }
    const items = getLocalCollection<LegacyReflection>(legacy.user_id, 'legacy_reflections');
    if (items.length > 0) {
      items[0] = legacy;
    } else {
      items.push(legacy);
    }
    setLocalCollection(legacy.user_id, 'legacy_reflections', items);
    return legacy;
  },

  // ==========================================
  // MEUS PROJETOS
  // ==========================================
  async getProjects(userId: string): Promise<Project[]> {
    const supabase = getSupabase();
    if (supabase) {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      if (!error && data) return data as Project[];
    }
    return getLocalCollection<Project>(userId, 'projects');
  },

  async saveProject(project: Project): Promise<Project> {
    const supabase = getSupabase();
    if (supabase) {
      const { data, error } = await supabase
        .from('projects')
        .upsert(project)
        .select()
        .single();
      if (!error && data) return data as Project;
    }
    const items = getLocalCollection<Project>(project.user_id, 'projects');
    const idx = items.findIndex(p => p.id === project.id);
    if (idx >= 0) {
      items[idx] = project;
    } else {
      items.unshift(project);
    }
    setLocalCollection(project.user_id, 'projects', items);
    return project;
  },

  async deleteProject(userId: string, id: string): Promise<boolean> {
    const supabase = getSupabase();
    if (supabase) {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);
      if (!error) return true;
    }
    const items = getLocalCollection<Project>(userId, 'projects');
    const filtered = items.filter(p => p.id !== id);
    setLocalCollection(userId, 'projects', filtered);
    return true;
  },

  // ==========================================
  // O CADERNO DAS ORAÇÕES
  // ==========================================
  async getPrayers(userId: string): Promise<Prayer[]> {
    const supabase = getSupabase();
    if (supabase) {
      const { data, error } = await supabase
        .from('prayers')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      if (!error && data) return data as Prayer[];
    }
    return getLocalCollection<Prayer>(userId, 'prayers');
  },

  async savePrayer(prayer: Prayer): Promise<Prayer> {
    const supabase = getSupabase();
    if (supabase) {
      const { data, error } = await supabase
        .from('prayers')
        .upsert(prayer)
        .select()
        .single();
      if (!error && data) return data as Prayer;
    }
    const items = getLocalCollection<Prayer>(prayer.user_id, 'prayers');
    const idx = items.findIndex(p => p.id === prayer.id);
    if (idx >= 0) {
      items[idx] = prayer;
    } else {
      items.unshift(prayer);
    }
    setLocalCollection(prayer.user_id, 'prayers', items);
    return prayer;
  },

  async deletePrayer(userId: string, id: string): Promise<boolean> {
    const supabase = getSupabase();
    if (supabase) {
      const { error } = await supabase
        .from('prayers')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);
      if (!error) return true;
    }
    const items = getLocalCollection<Prayer>(userId, 'prayers');
    const filtered = items.filter(p => p.id !== id);
    setLocalCollection(userId, 'prayers', filtered);
    return true;
  },

  // ==========================================
  // REVISÕES (MENSAL, ANUAL, JORDÃO, ENCERRAMENTO)
  // ==========================================
  async getMonthlyReviews(userId: string): Promise<MonthlyReview[]> {
    const supabase = getSupabase();
    if (supabase) {
      const { data, error } = await supabase
        .from('monthly_reviews')
        .select('*')
        .eq('user_id', userId)
        .order('year', { ascending: false })
        .order('month', { ascending: false });
      if (!error && data) return data as MonthlyReview[];
    }
    return getLocalCollection<MonthlyReview>(userId, 'monthly_reviews');
  },

  async saveMonthlyReview(review: MonthlyReview): Promise<MonthlyReview> {
    const supabase = getSupabase();
    if (supabase) {
      const { data, error } = await supabase
        .from('monthly_reviews')
        .upsert(review)
        .select()
        .single();
      if (!error && data) return data as MonthlyReview;
    }
    const items = getLocalCollection<MonthlyReview>(review.user_id, 'monthly_reviews');
    const idx = items.findIndex(r => r.year === review.year && r.month === review.month);
    if (idx >= 0) {
      items[idx] = review;
    } else {
      items.unshift(review);
    }
    setLocalCollection(review.user_id, 'monthly_reviews', items);
    return review;
  },

  async getAnnualReviews(userId: string): Promise<AnnualReview[]> {
    const supabase = getSupabase();
    if (supabase) {
      const { data, error } = await supabase
        .from('annual_reviews')
        .select('*')
        .eq('user_id', userId)
        .order('year', { ascending: false });
      if (!error && data) return data as AnnualReview[];
    }
    return getLocalCollection<AnnualReview>(userId, 'annual_reviews');
  },

  async saveAnnualReview(review: AnnualReview): Promise<AnnualReview> {
    const supabase = getSupabase();
    if (supabase) {
      const { data, error } = await supabase
        .from('annual_reviews')
        .upsert(review)
        .select()
        .single();
      if (!error && data) return data as AnnualReview;
    }
    const items = getLocalCollection<AnnualReview>(review.user_id, 'annual_reviews');
    const idx = items.findIndex(r => r.year === review.year);
    if (idx >= 0) {
      items[idx] = review;
    } else {
      items.unshift(review);
    }
    setLocalCollection(review.user_id, 'annual_reviews', items);
    return review;
  },

  async getNewJordanReflections(userId: string): Promise<NewJordanReflection[]> {
    const supabase = getSupabase();
    if (supabase) {
      const { data, error } = await supabase
        .from('new_jordan_reflections')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      if (!error && data) return data as NewJordanReflection[];
    }
    return getLocalCollection<NewJordanReflection>(userId, 'new_jordan_reflections');
  },

  async saveNewJordanReflection(reflection: NewJordanReflection): Promise<NewJordanReflection> {
    const supabase = getSupabase();
    if (supabase) {
      const { data, error } = await supabase
        .from('new_jordan_reflections')
        .upsert(reflection)
        .select()
        .single();
      if (!error && data) return data as NewJordanReflection;
    }
    const items = getLocalCollection<NewJordanReflection>(reflection.user_id, 'new_jordan_reflections');
    const idx = items.findIndex(r => r.id === reflection.id);
    if (idx >= 0) {
      items[idx] = reflection;
    } else {
      items.unshift(reflection);
    }
    setLocalCollection(reflection.user_id, 'new_jordan_reflections', items);
    return reflection;
  },

  async getClosure(userId: string): Promise<ClosureDeclaration | null> {
    const supabase = getSupabase();
    if (supabase) {
      const { data, error } = await supabase
        .from('closure_declarations')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();
      if (!error && data) return data as ClosureDeclaration;
    }
    const items = getLocalCollection<ClosureDeclaration>(userId, 'closure_declarations');
    return items[0] || null;
  },

  async saveClosure(closure: ClosureDeclaration): Promise<ClosureDeclaration> {
    const supabase = getSupabase();
    if (supabase) {
      const { data, error } = await supabase
        .from('closure_declarations')
        .upsert(closure)
        .select()
        .single();
      if (!error && data) return data as ClosureDeclaration;
    }
    const items = getLocalCollection<ClosureDeclaration>(closure.user_id, 'closure_declarations');
    if (items.length > 0) {
      items[0] = closure;
    } else {
      items.push(closure);
    }
    setLocalCollection(closure.user_id, 'closure_declarations', items);
    return closure;
  },

  // ==========================================
  // EXPORTAÇÃO E EXCLUSÃO
  // ==========================================
  async exportAllData(userId: string) {
    const [
      journey,
      activities,
      stones,
      lifeAreas,
      season,
      dreams,
      legacy,
      projects,
      prayers,
      monthlyReviews,
      annualReviews,
      newJordans,
      closure,
    ] = await Promise.all([
      this.getJourney(userId),
      this.getActivities(userId),
      this.getStones(userId),
      this.getLifeAreas(userId),
      this.getSeason(userId),
      this.getDreams(userId),
      this.getLegacy(userId),
      this.getProjects(userId),
      this.getPrayers(userId),
      this.getMonthlyReviews(userId),
      this.getAnnualReviews(userId),
      this.getNewJordanReflections(userId),
      this.getClosure(userId),
    ]);

    return {
      version: '1.0',
      export_date: new Date().toISOString(),
      user_id: userId,
      journey,
      activities,
      stones,
      life_areas: lifeAreas,
      season_discernment: season,
      dreams,
      legacy_reflection: legacy,
      projects,
      prayers,
      monthly_reviews: monthlyReviews,
      annual_reviews: annualReviews,
      new_jordan_reflections: newJordans,
      closure_declaration: closure,
    };
  },

  async deleteAllUserData(userId: string): Promise<void> {
    const supabase = getSupabase();
    if (supabase) {
      await Promise.all([
        supabase.from('journeys').delete().eq('user_id', userId),
        supabase.from('journey_activities').delete().eq('user_id', userId),
        supabase.from('stones').delete().eq('user_id', userId),
        supabase.from('life_area_reflections').delete().eq('user_id', userId),
        supabase.from('season_discernments').delete().eq('user_id', userId),
        supabase.from('dreams').delete().eq('user_id', userId),
        supabase.from('legacy_reflections').delete().eq('user_id', userId),
        supabase.from('projects').delete().eq('user_id', userId),
        supabase.from('prayers').delete().eq('user_id', userId),
        supabase.from('monthly_reviews').delete().eq('user_id', userId),
        supabase.from('annual_reviews').delete().eq('user_id', userId),
        supabase.from('new_jordan_reflections').delete().eq('user_id', userId),
        supabase.from('closure_declarations').delete().eq('user_id', userId),
        supabase.from('profiles').delete().eq('id', userId),
      ]);
    }
    const collections = [
      'journeys', 'journey_activities', 'stones', 'life_areas',
      'season_discernments', 'dreams', 'legacy_reflections',
      'projects', 'prayers', 'monthly_reviews', 'annual_reviews',
      'new_jordan_reflections', 'closure_declarations'
    ];
    collections.forEach(col => {
      localStorage.removeItem(getLocalKey(userId, col));
    });
  }
};
