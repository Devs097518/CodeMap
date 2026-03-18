"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, FolderPlus } from "lucide-react";
import {
  listarPastasPorUsuario,
  criarPasta,
  Pasta,
} from "@/service/pasta-service";

export default function FoldersPage() {
  const [titulo, setTitulo] = useState("");
  const notas: string = "../staff/notas";
  const [pastas, setPastas] = useState<Pasta[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const username = sessionStorage.getItem('username');

  const id_usuario =
    typeof window !== "undefined" ? sessionStorage.getItem("id_usuario") ?? "" : "";

  // Carrega as pastas ao montar o componente
  useEffect(() => {
    if (!id_usuario) return;

    listarPastasPorUsuario(id_usuario)
      .then((data) => setPastas(data))
      .catch(() => setErro("Erro ao carregar pastas."))
      .finally(() => setLoading(false));
  }, [id_usuario]);

  const handleCriar = async () => {
    const trimmed = titulo.trim();
    if (!trimmed || !id_usuario) return;

    try {
      const nova = await criarPasta({ titulo: trimmed, id_usuario });
      setPastas((prev) => [...prev, nova]);
      setTitulo("");
    } catch {
      setErro("Erro ao criar pasta.");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleCriar();
  };

  return (
    <main className="min-h-screen bg-white px-10 py-10 font-sans">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-gray-900 leading-tight">
          Olá, {username}!
        </h1>
        <p className="text-xl text-gray-500 mt-0.5">continue as suas notas</p>
      </div>

      {/* Create folder block */}
      <div className="mb-10">
        <p className="text-xl font-semibold text-gray-800 mb-3">
          Crie uma <span className="font-black">nova</span> pasta
        </p>
        <div className="flex items-center gap-0 w-64 bg-[#eeff66] rounded-xl overflow-hidden px-4 py-3">
          <input
            type="text"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Título"
            className="flex-1 bg-transparent text-xl font-semibold text-gray-800 placeholder-gray-600 outline-none"
          />
          <button
            onClick={handleCriar}
            className="ml-2 bg-[#1a0066] text-black text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-[#2a0099] transition-colors duration-150 shrink-0"
          >
            criar
          </button>
        </div>
      </div>

      {/* Folders list */}
      <div>
        <p className="text-xl font-semibold text-gray-800 mb-4">
          pastas criadas
        </p>

        {erro && (
          <p className="text-red-500 text-sm mb-4">{erro}</p>
        )}

        {loading ? (
          <p className="text-gray-400 text-xl">Carregando pastas...</p>
        ) : pastas.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <FolderPlus size={40} strokeWidth={1.5} className="mb-3 opacity-50" />
            <p className="text-xl">Nenhuma pasta criada ainda.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {pastas.map((pasta) => (
              <Link
                key={pasta.id_pasta}
                href={notas}
                onClick={() => sessionStorage.setItem("id_pasta", String(pasta.id_pasta))}
                className="group flex items-center justify-between bg-[#eeff66] rounded-2xl px-5 py-5 text-left hover:bg-[#FBBF24] active:scale-95 transition-all duration-150 cursor-pointer"
              >
                <span className="text-xl font-semibold text-gray-900 truncate pr-2">
                  {pasta.titulo}
                </span>
                <ArrowRight
                  size={20}
                  strokeWidth={2}
                  className="shrink-0 text-gray-800 group-hover:translate-x-1 transition-transform duration-150"
                />
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}