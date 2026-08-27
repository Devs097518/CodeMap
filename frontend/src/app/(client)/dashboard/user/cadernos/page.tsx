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

const CORES_LOMBADA = ["#2d2f6e", "#c0392b", "#1e8f5e", "#b8860b", "#6a3fa0"];

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

  return (
    <main className="min-h-screen bg-white px-6 py-10">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-semibold text-gray-800 tracking-tight mb-1">
          Meus Cadernos
        </h1>
        <p className="text-sm text-gray-400 mb-8">
          organize suas anotações por caderno
        </p>

        {/* Formulário de criação */}
        <form onSubmit={handleCriar} className="flex gap-3 mb-8">
          <input
            type="text"
            placeholder="Nome do novo caderno"
            value={novoTitulo}
            onChange={(e) => setNovoTitulo(e.target.value)}
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-[#2d2f6e] focus:ring-2 focus:ring-[#2d2f6e]/10 transition-all bg-white"
          />
          <button
            type="submit"
            disabled={criando || !novoTitulo.trim()}
            className="bg-[#2d2f6e] hover:bg-[#223dc0] active:scale-[0.98] text-white text-sm font-medium rounded-lg px-5 py-2.5 transition-all duration-200 disabled:opacity-50"
          >
            {criando ? "criando..." : "novo caderno"}
          </button>
        </form>

        {/* Lista de cadernos */}
        {loading ? (
          <p className="text-sm text-gray-400">carregando cadernos...</p>
        ) : cadernos.length === 0 ? (
          <p className="text-sm text-gray-400">
            Nenhum caderno criado ainda. Crie o primeiro acima.
          </p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
            {cadernos.map((caderno, i) => (
              <div key={caderno.id_caderno} className="flex flex-col items-center gap-2">
                <button
                  onClick={() => abrirCaderno(caderno)}
                  className="group relative w-full aspect-[3/4] bg-white rounded-r-lg rounded-l-sm overflow-hidden transition-transform hover:-translate-y-1"
                  style={{
                    boxShadow: "3px 4px 8px 1px #96969472",
                  }}
                >
                  {/* Lombada */}
                  <div
                    className="absolute left-0 top-0 bottom-0 w-3"
                    style={{ backgroundColor: CORES_LOMBADA[i % CORES_LOMBADA.length] }}
                  />
                  {/* Furos de espiral */}
                  <div className="absolute left-1 top-0 bottom-0 flex flex-col justify-evenly items-center w-1">
                    {Array.from({ length: 8 }).map((_, idx) => (
                      <span key={idx} className="w-1 h-1 rounded-full bg-white/70" />
                    ))}
                  </div>
                  {/* Capa */}
                  <div className="absolute inset-0 pl-5 pr-3 py-4 flex flex-col justify-between bg-[#FFFFFF] group-hover:bg-[#ececec] transition-colors">
                    <span className="text-sm font-semibold text-gray-800 text-left break-words line-clamp-4">
                      {caderno.titulo}
                    </span>
                    <div className="w-full h-px bg-gray-300" />
                  </div>
                </button>

                {/* Ações */}
                <div className="flex gap-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setCadernoEditando(caderno);
                    }}
                    className="text-xs text-[#3b82f6] hover:text-[#2563eb] font-medium transition-colors"
                  >
                    editar
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setCadernoParaExcluir(caderno);
                    }}
                    className="text-xs text-red-500 hover:text-red-600 font-medium transition-colors"
                  >
                    excluir
                  </button>
                </div>
              </div>
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