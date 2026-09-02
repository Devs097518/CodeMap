// app/dashboard/user/cadernos/page.tsx
'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  listarCadernosPorUsuario,
  criarCaderno,
  excluirCaderno,
  editarCaderno,
  Caderno,
} from "@/service/caderno-service";
import { ConfirmModal } from "@/components/ConfirmModal";
import { AlertModal } from "@/components/AlertModal";
import { EditModal } from "@/components/EditModal";
import { CadernoCard } from "@/components/CadernoCard";

const CORES_LOMBADA = ["#b6a88b", "#9eb690", "#9cc2d4", "#204346", "#997656", "#8b4e9c", "#d1a12f", "#4a4a4a"];

export default function CadernosPage() {
  const { usuario } = useAuth();
  const router = useRouter();
  const [cadernos, setCadernos] = useState<Caderno[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const [novoTitulo, setNovoTitulo] = useState("");
  const [criando, setCriando] = useState(false);

  const [cadernoEditando, setCadernoEditando] = useState<Caderno | null>(null);
  const [cadernoParaExcluir, setCadernoParaExcluir] = useState<Caderno | null>(null);

  useEffect(() => {
    if (!usuario) return;

    listarCadernosPorUsuario(usuario.id_usuario)
      .then(setCadernos)
      .catch((err) => setErro(err.message))
      .finally(() => setLoading(false));
  }, [usuario]);

  const handleCriar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usuario || !novoTitulo.trim()) return;

    setCriando(true);
    try {
      const caderno = await criarCaderno({ titulo: novoTitulo, id_usuario: usuario.id_usuario });
      setCadernos((prev) => [...prev, caderno]);
      setNovoTitulo("");
    } catch (err: unknown) {
      setErro(err instanceof Error ? err.message : "Erro ao criar caderno");
    } finally {
      setCriando(false);
    }
  };

  const salvarEdicao = async (novoTitulo: string) => {
    if (!cadernoEditando) return;

    try {
      await editarCaderno(cadernoEditando.id_caderno, { titulo: novoTitulo });
      setCadernos((prev) =>
        prev.map((c) =>
          c.id_caderno === cadernoEditando.id_caderno ? { ...c, titulo: novoTitulo } : c
        )
      );
      setCadernoEditando(null);
    } catch (err: unknown) {
      setErro(err instanceof Error ? err.message : "Erro ao editar caderno");
    }
  };

  const confirmarExclusao = async () => {
    if (!cadernoParaExcluir) return;

    try {
      await excluirCaderno(cadernoParaExcluir.id_caderno);
      setCadernos((prev) => prev.filter((c) => c.id_caderno !== cadernoParaExcluir.id_caderno));
    } catch (err: unknown) {
      setErro(err instanceof Error ? err.message : "Erro ao excluir caderno");
    } finally {
      setCadernoParaExcluir(null);
    }
  };

  const abrirCaderno = (caderno: Caderno) => {
    sessionStorage.setItem("id_caderno", String(caderno.id_caderno));
    sessionStorage.setItem("titulo_caderno", caderno.titulo);
    router.push("/dashboard/user/notas");
  };

  const EditIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="#292929" strokeWidth={1.8} className="w-5 h-5 text-color-gray-800">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );

  const TrashIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="#292929" strokeWidth={1.8} className="w-5 h-5">
      <polyline points="3 6 5 6 21 6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6M10 11v6M14 11v6M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );

  return (
    <main className="min-h-screen bg-white px-6 py-10 bg-gray-50">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 leading-tight mb-1">
          Meus Cadernos
        </h1>
        <p className="text-lg text-gray-500 mb-8">
          organize suas anotações por caderno
        </p>

        {/* Formulário de criação */}
        <form onSubmit={handleCriar} className="flex gap-3 mb-8">
          <input
            type="text"
            placeholder="Nome do novo caderno"
            value={novoTitulo}
            onChange={(e) => setNovoTitulo(e.target.value)}
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2.5 text-lg text-gray-800 outline-none focus:border-[#2d2f6e] focus:ring-2 focus:ring-[#2d2f6e]/10 transition-all bg-white"
          />
          <button
            type="submit"
            disabled={criando || !novoTitulo.trim()}
            className="bg-[#2d2f6e] hover:bg-[#223dc0] active:scale-[0.98] text-white text-lg font-medium rounded-lg px-5 py-2.5 transition-all duration-200 disabled:opacity-50"
          >
            {criando ? "criando..." : "novo caderno"}
          </button>
        </form>

        {/* Lista de cadernos */}
        {loading ? (
          <p className="text-lg text-gray-400">carregando cadernos...</p>
        ) : cadernos.length === 0 ? (
          <p className="text-lg text-gray-400">
            Nenhum caderno criado ainda. Crie o primeiro acima.
          </p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
            {cadernos.map((caderno, i) => (
              <CadernoCard
                key={caderno.id_caderno}
                titulo={caderno.titulo}
                cor={CORES_LOMBADA[i % CORES_LOMBADA.length]}
                onOpen={() => abrirCaderno(caderno)}
                onEdit={() => setCadernoEditando(caderno)}
                onDelete={() => setCadernoParaExcluir(caderno)}
              />
            ))}
          </div>
        )}
      </div>

      {cadernoEditando && (
        <EditModal
          titulo="Editar caderno"
          label="Nome do caderno"
          valorInicial={cadernoEditando.titulo}
          onCancel={() => setCadernoEditando(null)}
          onConfirm={salvarEdicao}
        />
      )}

      {cadernoParaExcluir && (
        <ConfirmModal
          titulo="Excluir caderno"
          mensagem={`Tem certeza que deseja excluir "${cadernoParaExcluir.titulo}"? Esta ação não pode ser desfeita.`}
          textoCancelar=""
          textoConfirmar="Excluir"
          textoConfirmando="Excluindo..."
          onCancel={() => setCadernoParaExcluir(null)}
          onConfirm={confirmarExclusao}
        />
      )}

      {erro && (
        <AlertModal
          titulo="Algo deu errado"
          mensagem={erro}
          onClose={() => setErro(null)}
        />
      )}
    </main>
  );
}