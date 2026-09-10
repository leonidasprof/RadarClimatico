import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  department: string;
  organization: string;
  avatarInitials: string;
  lastLogin?: string;
}

export interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateContact: (data: Partial<UserProfile>) => void;
}

const AUTH_STORAGE_KEY = "arboris_auth_session";
const PROFILE_STORAGE_KEY = "arboris_saved_profile";

export const DEFAULT_DEMO_USER: UserProfile = {
  id: "jorge-goncalves-codecir",
  name: "Jorge Gonçalves",
  email: "jorge.goncalves@recife.pe.gov.br",
  phone: "(81) 98845-2104",
  role: "Coordenador de Operações & Risco",
  department: "Defesa Civil do Recife (CODECIR)",
  organization: "Prefeitura do Recife · COP-ARIES",
  avatarInitials: "JG",
  lastLogin: "Em serviço ativo",
};

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0 || !parts[0]) return "U";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  const first = parts[0][0] ?? "";
  const last = parts[parts.length - 1]?.[0] ?? "";
  return `${first}${last}`.toUpperCase();
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Inicializa a sessão a partir do localStorage
  useEffect(() => {
    try {
      const storedSession = localStorage.getItem(AUTH_STORAGE_KEY);
      if (storedSession) {
        const parsed = JSON.parse(storedSession) as UserProfile;
        setUser(parsed);
      }
    } catch (e) {
      console.error("Erro ao carregar sessão:", e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, _password?: string): Promise<{ success: boolean; error?: string }> => {
    if (!email || !email.trim()) {
      return { success: false, error: "Informe um e-mail válido para acessar." };
    }

    try {
      // Verifica se há perfil previamente customizado salvo localmente
      const savedProfile = localStorage.getItem(PROFILE_STORAGE_KEY);
      let activeProfile: UserProfile;

      if (savedProfile) {
        const parsed = JSON.parse(savedProfile) as UserProfile;
        activeProfile = {
          ...parsed,
          email: email.trim(),
          lastLogin: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
        };
      } else {
        // Se for o email demo ou outro, basear no template do MVP
        activeProfile = {
          ...DEFAULT_DEMO_USER,
          email: email.trim(),
          name: email.toLowerCase().includes("jorge") ? DEFAULT_DEMO_USER.name : email.split("@")[0] || "Gestor Público",
          avatarInitials: getInitials(email.toLowerCase().includes("jorge") ? DEFAULT_DEMO_USER.name : email.split("@")[0] || "GP"),
          lastLogin: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
        };
      }

      setUser(activeProfile);
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(activeProfile));
      localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(activeProfile));
      return { success: true };
    } catch (err) {
      return { success: false, error: "Falha ao autenticar sessão local." };
    }
  };

  const logout = () => {
    setUser(null);
    try {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    } catch {
      // ignore
    }
  };

  const updateContact = (data: Partial<UserProfile>) => {
    setUser((prev) => {
      if (!prev) return null;
      const updated: UserProfile = {
        ...prev,
        ...data,
        avatarInitials: data.name ? getInitials(data.name) : prev.avatarInitials,
      };

      try {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updated));
        localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(updated));
      } catch {
        // ignore
      }

      return updated;
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        updateContact,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve ser utilizado dentro de um AuthProvider");
  }
  return context;
}
