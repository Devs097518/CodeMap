'use client';

import { useState } from "react";
import Link from "next/link";
import { useRouter } from 'next/navigation';
import { realizarLogin } from '../../service/usuario-service';

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simulate login
    try {
      const idUsuario = await realizarLogin(email, password);
      router.push('/dashboard/staff/inicio');
    } catch (error: unknown) {
      alert(error); // "Email não cadastrado" ou "Senha incorreta"
    }


    await new Promise((r) => setTimeout(r, 1200));
    setLoading(false);
  };


  return (
    <main className="min-h-screen bg-[#ffffff] flex items-center justify-center px-4">
      <div
        className="bg-gris rounded-2xl shadow-lg px-10 py-12 w-full max-w-sm flex flex-col items-center"
        style={{ boxShadow: "8px 8px 20px 2px #969696a6" }}
      >
        {/* Logo */}
        <div className="mb-4">
          <img
            src="/imagens/CodeMap_Icone.png"
            alt="Mapa de tesouro"
            width={50}
            height={50}
            className="rounded-4xl"
          />
        </div>

        {/* Title */}
        <h1 className="text-2xl font-semibold text-gray-800 tracking-tight mb-1">
          CodeMap
        </h1>
        <p className="text-sm text-gray-400 mb-8">
          seu caminho para desenvolvimento
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="w-full flex flex-col items-center justify-center gap-4">
          <div className="flex flex-col gap-1">
            <label
              htmlFor="email"
              className="text-sm text-gray-600 font-medium"
            >
              email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-[#2d2f6e] focus:ring-2 focus:ring-[#2d2f6e]/10 transition-all bg-white placeholder-transparent"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label
              htmlFor="senha"
              className="text-sm text-gray-600 font-medium"
            >
              senha
            </label>
            <input
              id="senha"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-[#2d2f6e] focus:ring-2 focus:ring-[#2d2f6e]/10 transition-all bg-white placeholder-transparent"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 w-32 bg-[#2d2f6e] hover:bg-[#223dc0] active:scale-[0.98] text-white text-sm font-medium rounded-full py-3 transition-all duration-200 disabled:opacity-70 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                entrando...
              </>
            ) : (
              "entrar"
            )}
          </button>
        </form>

        {/* Register link */}
        <p className="mt-6 text-sm text-gray-500">
          Não tem conta?{" "}
          <Link
            href="/cadastro"
            className="text-[#3b82f6] hover:text-[#2563eb] font-medium transition-colors"
          >
            Cadastre-se
          </Link>
        </p>
      </div>
    </main>
  );
}

