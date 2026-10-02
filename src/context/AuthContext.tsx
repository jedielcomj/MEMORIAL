import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile } from '../types/memorial';
import { getSupabase } from '../lib/supabase';
import { storage } from '../lib/storage';

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  isSupabaseMode: boolean;
  signIn: (email: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (email: string, password?: string, displayName?: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  updateProfile: (displayName: string, intention?: string) => Promise<{ success: boolean; error?: string }>;
  resetPassword: (email: string) => Promise<{ success: boolean; message: string }>;
  deleteAccount: () => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_AUTH_USER_KEY = 'memorial_current_user';
const LOCAL_USERS_STORE_KEY = 'memorial_registered_users';

interface StoredLocalUser {
  id: string;
  email: string;
  passwordHash: string;
  displayName: string;
  intention?: string;
  createdAt: string;
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isSupabaseMode, setIsSupabaseMode] = useState<boolean>(false);

  useEffect(() => {
    const initAuth = async () => {
      const supabase = getSupabase();
      if (supabase) {
        setIsSupabaseMode(true);
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .maybeSingle();

            if (profile) {
              setUser({
                id: session.user.id,
                email: session.user.email || '',
                display_name: profile.display_name || 'Peregrino',
                intention_90_days: profile.intention_90_days,
                created_at: profile.created_at,
                updated_at: profile.updated_at,
              });
            } else {
              setUser({
                id: session.user.id,
                email: session.user.email || '',
                display_name: session.user.user_metadata?.display_name || 'Peregrino',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              });
            }
          }
        } catch (e) {
          console.error('Supabase session load error:', e);
        }
      } else {
        setIsSupabaseMode(false);
        // Load local user from session
        const stored = localStorage.getItem(LOCAL_AUTH_USER_KEY);
        if (stored) {
          try {
            setUser(JSON.parse(stored));
          } catch {
            localStorage.removeItem(LOCAL_AUTH_USER_KEY);
          }
        } else {
          // Provide an initial guest profile if no account exists yet, or keep as null for login
          // Let's create an intuitive default account if user wants to begin right away
          const defaultUser: UserProfile = {
            id: 'local_pilgrim_1',
            email: 'peregrino@memorial.local',
            display_name: 'Peregrino do Memorial',
            intention_90_days: 'Lembrar de onde Deus me tirou e registrar cada pedra da caminhada.',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
          localStorage.setItem(LOCAL_AUTH_USER_KEY, JSON.stringify(defaultUser));
          setUser(defaultUser);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const signIn = async (email: string, password?: string): Promise<{ success: boolean; error?: string }> => {
    const supabase = getSupabase();
    if (supabase) {
      if (!password) {
        return { success: false, error: 'Senha é obrigatória' };
      }
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        return { success: false, error: error.message };
      }
      if (data.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .maybeSingle();
        setUser({
          id: data.user.id,
          email: data.user.email || email,
          display_name: profile?.display_name || data.user.user_metadata?.display_name || 'Peregrino',
          intention_90_days: profile?.intention_90_days,
          created_at: profile?.created_at || new Date().toISOString(),
          updated_at: profile?.updated_at || new Date().toISOString(),
        });
        return { success: true };
      }
      return { success: false, error: 'Usuário não encontrado' };
    }

    // Local authentication
    if (!email || !email.includes('@')) {
      return { success: false, error: 'Por favor, insira um e-mail válido' };
    }
    if (!password || password.length < 6) {
      return { success: false, error: 'A senha deve conter ao menos 6 caracteres' };
    }

    const rawUsers = localStorage.getItem(LOCAL_USERS_STORE_KEY);
    const users: StoredLocalUser[] = rawUsers ? JSON.parse(rawUsers) : [];
    const found = users.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (found) {
      if (found.passwordHash !== password) {
        return { success: false, error: 'Credenciais inválidas. Verifique sua senha.' };
      }
      const profile: UserProfile = {
        id: found.id,
        email: found.email,
        display_name: found.displayName,
        intention_90_days: found.intention,
        created_at: found.createdAt,
        updated_at: new Date().toISOString(),
      };
      localStorage.setItem(LOCAL_AUTH_USER_KEY, JSON.stringify(profile));
      setUser(profile);
      return { success: true };
    }

    // If logging in with the default email
    if (email.toLowerCase() === 'peregrino@memorial.local') {
      const defaultUser: UserProfile = {
        id: 'local_pilgrim_1',
        email: 'peregrino@memorial.local',
        display_name: 'Peregrino do Memorial',
        intention_90_days: 'Lembrar de onde Deus me tirou e registrar cada pedra da caminhada.',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      localStorage.setItem(LOCAL_AUTH_USER_KEY, JSON.stringify(defaultUser));
      setUser(defaultUser);
      return { success: true };
    }

    return { success: false, error: 'Conta não encontrada com este e-mail. Crie sua conta primeiro.' };
  };

  const signUp = async (email: string, password?: string, displayName?: string): Promise<{ success: boolean; error?: string }> => {
    const supabase = getSupabase();
    if (supabase) {
      if (!password || password.length < 6) {
        return { success: false, error: 'A senha deve ter pelo menos 6 caracteres' };
      }
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: displayName || 'Peregrino',
          },
        },
      });
      if (error) {
        return { success: false, error: error.message };
      }
      if (data.user) {
        // Upsert to profiles
        await supabase.from('profiles').upsert({
          id: data.user.id,
          display_name: displayName || 'Peregrino',
          email,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
        setUser({
          id: data.user.id,
          email: data.user.email || email,
          display_name: displayName || 'Peregrino',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
        return { success: true };
      }
      return { success: false, error: 'Não foi possível cadastrar.' };
    }

    // Local signup
    if (!email || !email.includes('@')) {
      return { success: false, error: 'Por favor, insira um e-mail válido.' };
    }
    if (!password || password.length < 6) {
      return { success: false, error: 'A senha precisa ter no mínimo 6 caracteres.' };
    }

    const rawUsers = localStorage.getItem(LOCAL_USERS_STORE_KEY);
    const users: StoredLocalUser[] = rawUsers ? JSON.parse(rawUsers) : [];
    if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
      return { success: false, error: 'Já existe uma conta cadastrada com este e-mail.' };
    }

    const newId = 'user_' + Math.random().toString(36).substring(2, 9);
    const name = displayName?.trim() || email.split('@')[0];
    const newUser: StoredLocalUser = {
      id: newId,
      email: email.trim(),
      passwordHash: password,
      displayName: name,
      createdAt: new Date().toISOString(),
    };
    users.push(newUser);
    localStorage.setItem(LOCAL_USERS_STORE_KEY, JSON.stringify(users));

    const profile: UserProfile = {
      id: newId,
      email: newUser.email,
      display_name: newUser.displayName,
      created_at: newUser.createdAt,
      updated_at: newUser.createdAt,
    };
    localStorage.setItem(LOCAL_AUTH_USER_KEY, JSON.stringify(profile));
    setUser(profile);
    return { success: true };
  };

  const signOut = async (): Promise<void> => {
    const supabase = getSupabase();
    if (supabase) {
      await supabase.auth.signOut();
    }
    localStorage.removeItem(LOCAL_AUTH_USER_KEY);
    setUser(null);
  };

  const updateProfile = async (displayName: string, intention?: string): Promise<{ success: boolean; error?: string }> => {
    if (!user) return { success: false, error: 'Usuário não autenticado' };
    const updated: UserProfile = {
      ...user,
      display_name: displayName.trim() || user.display_name,
      intention_90_days: intention !== undefined ? intention : user.intention_90_days,
      updated_at: new Date().toISOString(),
    };

    const supabase = getSupabase();
    if (supabase) {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          display_name: updated.display_name,
          intention_90_days: updated.intention_90_days,
          updated_at: updated.updated_at,
        });
      if (error) {
        return { success: false, error: error.message };
      }
    } else {
      localStorage.setItem(LOCAL_AUTH_USER_KEY, JSON.stringify(updated));
    }

    setUser(updated);
    return { success: true };
  };

  const resetPassword = async (email: string): Promise<{ success: boolean; message: string }> => {
    const supabase = getSupabase();
    if (supabase) {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) {
        return { success: false, message: error.message };
      }
      return { success: true, message: 'Link de redefinição de senha enviado para seu e-mail!' };
    }
    return {
      success: true,
      message: 'Instruções simuladas enviadas. Em modo local, utilize sua senha cadastrada ou crie uma nova conta.',
    };
  };

  const deleteAccount = async (): Promise<{ success: boolean; error?: string }> => {
    if (!user) return { success: false, error: 'Nenhum usuário ativo.' };
    try {
      await storage.deleteAllUserData(user.id);
      await signOut();
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e?.message || 'Falha ao excluir dados da conta.' };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isSupabaseMode,
        signIn,
        signUp,
        signOut,
        updateProfile,
        resetPassword,
        deleteAccount,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};
