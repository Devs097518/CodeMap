import { ReactNode } from 'react';
import Link from 'next/link';

export default function StaffLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-lg border-r border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">Staff Dashboard</h2>
        </div>
        <nav className="mt-4 px-4">
          <ul className="space-y-2">
            <li>
              <Link
                href="inicio"
                className="flex items-center px-4 py-2 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                🏠 Início
              </Link>
            </li>
            <li>
              <Link
                href="notas"
                className="flex items-center px-4 py-2 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                📝 Notas
              </Link>
            </li>
            {/* Adicione mais links aqui conforme necessário */}
            <li>
              <Link
                href="#"
                className="flex items-center px-4 py-2 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                👤 Perfil
              </Link>
            </li>
          </ul>
        </nav>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 p-4 flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-800">Painel Staff</h1>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-500">Bem-vindo, Admin!</span>
            {/* Ícone de usuário ou logout */}
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
