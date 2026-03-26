'use client';

import { useState, useRef, useEffect, useCallback, ReactNode } from "react";
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function StaffLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [username, setUsername] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Proteção de autenticação (redireciona se não logado)
  useEffect(() => {
    const name = sessionStorage.getItem('username');
    const id = sessionStorage.getItem('id_usuario');
    if (!id) {
      router.push('../');
      return;
    }
    setUsername(name);
    setUserId(id);
    setIsLoaded(true);
  }, [router]);

  const handleLogout = () => {
    sessionStorage.clear();
    router.push('http://localhost:3000/');
  };

  // Loading spinner enquanto verifica auth
  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0C0F4F]"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">

      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header/Navbar */}
        <header className="bg-[#0C0F4F] text-white shadow-lg p-4 flex items-center justify-between shrink-0">
          <Link href="/" className="flex items-center gap-3 font-bold text-3xl">
            <img
              src="/imagens/CodeMap_Icone.png"
              alt="CodeMap"
              width={40}
              height={40}
              className="rounded-2xl"
            />
            <span>CodeMap</span>
          </Link>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-2xl">
              <UserCircleIcon />
              <span>{username}</span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 hover:bg-white/20 px-3 py-1 rounded-lg transition-all text-2xl"
            >
              <LogoutIcon />
              Sair
            </button>
          </div>
        </header>

        {/* Conteúdo das páginas (inicio, notas, etc.) */}
        <main className="flex-1 overflow-y-auto bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  );
}

// Ícones (mantidos iguais)
function UserCircleIcon() {
  return (
    <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="9" r="3" />
      <path d="M6.168 18.849A4 4 0 0 1 10 16h4a4 4 0 0 1 3.832 2.849" />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}
