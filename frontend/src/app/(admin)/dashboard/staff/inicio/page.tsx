"use client";

import { useState, useEffect } from "react";
import { Plus, Pencil, Archive, ArchiveRestore, ChevronUp, ChevronDown } from "lucide-react";
import {
  listarCategorias,
  criarCategoria,
  editarCategoria,
  arquivarCategoria,
  restaurarCategoria,
  moverCategoria,
  Categoria,
} from "@/service/categoria-service";
import { ConfirmModal } from "@/components/ConfirmModal";
import { useAuth } from "@/context/AuthContext";

export default function AdminInicioPage() {
  const { usuario } = useAuth();
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [mostrarArquivados, setMostrarArquivados] = useState(false);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [modalAberto, setModalAberto] = useState(false);
  const [categoriaEditando, setCategoriaEditando] = useState<Categoria | null>(null);
  const [categoriaParaArquivar, setCategoriaParaArquivar] = useState<Categoria | null>(null);

  const username = usuario?.username ?? "";

  const carregarCategorias = () => {
    setLoading(true);
    listarCategorias(mostrarArquivados)
      .then(setCategorias)
      .catch(() => setErro("Erro ao carregar categorias."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    carregarCategorias();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mostrarArquivados]);

  const abrirModalCriar = () => {
    setCategoriaEditando(null);
    setModalAberto(true);
  };

  const abrirModalEditar = (categoria: Categoria) => {
    setCategoriaEditando(categoria);
    setModalAberto(true);
  };

  const handleArquivar = async () => {
    if (!categoriaParaArquivar) return;
    try {
      await arquivarCategoria(categoriaParaArquivar.id_categoria);
      setCategoriaParaArquivar(null);
      carregarCategorias();
    } catch {
      setErro("Erro ao arquivar categoria.");
    }
  };

  const handleRestaurar = async (categoria: Categoria) => {
    try {
      await restaurarCategoria(categoria.id_categoria);
      carregarCategorias();
    } catch {
      setErro("Erro ao restaurar categoria.");
    }
  };

  const handleMover = async (id: number, direcao: "cima" | "baixo") => {
    try {
      await moverCategoria(id, direcao);
      carregarCategorias();
    } catch {
      setErro("Erro ao mover categoria.");
    }
  };

  return (
    
    <main className="min-h-screen bg-white px-10 py-10 font-sans">
      <div className="mb-10 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 leading-tight">Olá, {username}!</h1>
          <p className="text-xl text-gray-500 mt-0.5">espaço de gerenciamento dos roadmaps</p>
        </div>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-x text-gray-600">
            <input
              type="checkbox"
              checked={mostrarArquivados}
              onChange={(e) => setMostrarArquivados(e.target.checked)}
            />
            Mostrar arquivados
          </label>
          <button
            onClick={abrirModalCriar}
            className="flex items-center gap-2 bg-[#1a0066] text-white text-x px-4 py-2.5 rounded-xl hover:bg-[#2a0099] transition-colors duration-150"
          >
            <Plus size={16} />
            Nova Categoria
          </button>
        </div>
      </div>

      <h2 className="text-2xl border-t-2 border-gray-200 font-bold text-gray-900 mb-6 pt-6">Roadmaps</h2>

      {erro && <p className="text-red-500 text-sm mb-4">{erro}</p>}

      {loading ? (
        <p className="text-gray-400 text-xl">Carregando categorias...</p>
      ) : categorias.length === 0 ? (
        <p className="text-gray-400 text-xl">Nenhuma categoria criada ainda.</p>
      ) : (
        <div className="flex flex-col gap-8">
          {categorias.map((categoria, index) => (
            <section key={categoria.id_categoria}>
              <div className="flex items-center gap-2 mb-3">
                <h3
                  className={`text-xl font-semibold ${
                    categoria.deleted_at ? "text-gray-400" : "text-gray-800"
                  }`}
                >
                  {categoria.nome}
                </h3>

                <button
                  onClick={() => handleMover(categoria.id_categoria, "cima")}
                  disabled={index === 0 || !!categoria.deleted_at}
                  aria-label="Mover categoria para cima"
                  className="text-gray-700 hover:text-gray-900 disabled:opacity-30 disabled:hover:text-gray-400"
                >
                  <ChevronUp size={16} />
                </button>
                <button
                  onClick={() => handleMover(categoria.id_categoria, "baixo")}
                  disabled={index === categorias.length - 1 || !!categoria.deleted_at}
                  aria-label="Mover categoria para baixo"
                  className="text-gray-700 hover:text-gray-900 disabled:opacity-30 disabled:hover:text-gray-400"
                >
                  <ChevronDown size={16} />
                </button>

                <button
                  onClick={() => abrirModalEditar(categoria)}
                  disabled={!!categoria.deleted_at}
                  aria-label="Editar categoria"
                  className="text-gray-600 hover:text-gray-900 disabled:opacity-30 disabled:hover:text-gray-400"
                >
                  <Pencil size={16} />
                </button>

                {categoria.deleted_at ? (
                  <button
                    onClick={() => handleRestaurar(categoria)}
                    aria-label="Restaurar categoria"
                    className="text-gray-400 hover:text-gray-700"
                  >
                    <ArchiveRestore size={16} />
                  </button>
                ) : (
                  <button
                    onClick={() => setCategoriaParaArquivar(categoria)}
                    aria-label="Arquivar categoria"
                    className="text-gray-700 hover:text-red-600"
                  >
                    <Archive size={16} />
                  </button>
                )}
              </div>

              {/* Cards de roadmap entram aqui na issue #9 */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-2xl px-5 py-8 text-gray-300">
                  <Plus size={20} />
                  <span className="text-sm mt-2">Novo roadmap</span>
                </div>
              </div>
            </section>
          ))}
        </div>
      )}

      {modalAberto && (
        <CategoriaModal
          categoria={categoriaEditando}
          onClose={() => setModalAberto(false)}
          onSuccess={() => {
            setModalAberto(false);
            carregarCategorias();
          }}
        />
      )}

      {categoriaParaArquivar && (
        <ConfirmModal
          titulo="Arquivar categoria"
          mensagem={`Arquivar "${categoriaParaArquivar.nome}"? Ela some da listagem padrão.`}
          textoConfirmar="Arquivar"
          textoConfirmando="Arquivando..."
          onCancel={() => setCategoriaParaArquivar(null)}
          onConfirm={handleArquivar}
        />
      )}
    </main>
  );
}

function CategoriaModal({
  categoria,
  onClose,
  onSuccess,
}: {
  categoria: Categoria | null;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [nome, setNome] = useState(categoria?.nome ?? "");
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const handleSalvar = async () => {
    const trimmed = nome.trim();
    if (!trimmed) return;

    setSalvando(true);
    setErro(null);
    try {
      if (categoria) {
        await editarCategoria(categoria.id_categoria, { nome: trimmed });
      } else {
        await criarCategoria({ nome: trimmed });
      }
      onSuccess();
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Erro ao salvar categoria.");
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-2xl px-6 py-6 w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-lg font-bold text-gray-900 mb-4">
          {categoria ? "Editar categoria" : "Nova categoria"}
        </h2>

        <input
          type="text"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          maxLength={50}
          placeholder="Nome da categoria"
          className="w-full bg-gray-200 text-gray-700 rounded-xl px-4 py-3 text-base outline-none mb-2"
          autoFocus
        />

        {erro && <p className="text-red-500 text-sm mb-2">{erro}</p>}

        <div className="flex justify-end gap-3 mt-4">
          <button onClick={onClose} className="text-sm text-gray-500 px-4 py-2">
            Cancelar
          </button>
          <button
            onClick={handleSalvar}
            disabled={salvando || !nome.trim()}
            className="bg-[#1a0066] text-white text-sm font-bold px-4 py-2.5 rounded-xl disabled:opacity-50"
          >
            {salvando ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </div>
    </div>
  );
}