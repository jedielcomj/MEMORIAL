import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Get credentials from env or user local storage override
const getSupabaseConfig = () => {
  const envUrl = import.meta.env.VITE_SUPABASE_URL || '';
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

  const storedUrl = typeof window !== 'undefined' ? localStorage.getItem('memorial_supabase_url') : null;
  const storedKey = typeof window !== 'undefined' ? localStorage.getItem('memorial_supabase_anon_key') : null;

  const url = storedUrl || envUrl;
  const key = storedKey || envKey;

  return {
    url: url.trim(),
    key: key.trim(),
    isConfigured: Boolean(url && key && url.startsWith('http')),
  };
};

export const { url: supabaseUrl, key: supabaseAnonKey, isConfigured: isSupabaseConfigured } = getSupabaseConfig();

let supabaseInstance: SupabaseClient | null = null;

export const getSupabase = (): SupabaseClient | null => {
  const config = getSupabaseConfig();
  if (!config.isConfigured) {
    return null;
  }
  if (!supabaseInstance) {
    supabaseInstance = createClient(config.url, config.key, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
  }
  return supabaseInstance;
};

export const setCustomSupabaseConfig = (url: string, key: string) => {
  if (typeof window !== 'undefined') {
    if (url && key) {
      localStorage.setItem('memorial_supabase_url', url.trim());
      localStorage.setItem('memorial_supabase_anon_key', key.trim());
    } else {
      localStorage.removeItem('memorial_supabase_url');
      localStorage.removeItem('memorial_supabase_anon_key');
    }
    supabaseInstance = null;
  }
};

export const testSupabaseConnection = async (): Promise<{ success: boolean; message: string }> => {
  const client = getSupabase();
  if (!client) {
    return {
      success: false,
      message: 'Supabase não configurado. Defina a URL e a Chave Anônima.',
    };
  }
  try {
    const { error } = await client.from('profiles').select('id').limit(1);
    if (error && error.code !== 'PGRST116') {
      return {
        success: false,
        message: `Erro na resposta do Supabase: ${error.message} (${error.code})`,
      };
    }
    return {
      success: true,
      message: 'Conexão com Supabase validada com sucesso!',
    };
  } catch (err: any) {
    return {
      success: false,
      message: `Falha ao conectar: ${err?.message || 'Erro de rede ou CORS'}`,
    };
  }
};
