'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { buscarUsuarioLogado } from '@/service/usuario-service';

type Usuario = { id_usuario: string; username: string; email: string; role: string };

const AuthContext = createContext<{ usuario: Usuario | null; isLoaded: boolean }>({
  usuario: null,
  isLoaded: false,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const router = useRouter();

  useEffect(() => {
    buscarUsuarioLogado()
      .then(setUsuario)
      .catch(() => router.push('/login'))
      .finally(() => setIsLoaded(true));
  }, [router]);

  return (
    <AuthContext.Provider value={{ usuario, isLoaded }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);