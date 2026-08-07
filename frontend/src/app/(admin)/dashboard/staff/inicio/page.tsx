"use client";

import { useState, useEffect } from "react";
import { Plus, Pencil, Archive, ArchiveRestore, ChevronUp, ChevronDown } from "lucide-react";
import Link from "next/link";
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
import  RoadmapModal  from "@/components/RoadmapModal";
import { useAuth } from "@/context/AuthContext";
import {
  listarRoadmaps,
  criarRoadmap,
  editarRoadmap,
  arquivarRoadmap,
  restaurarRoadmap,
  Roadmap,
} from "@/service/roadmap-service";

export default function AdminInicioPage() {
  const { usuario } = useAuth();
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [mostrarArquivados, setMostrarArquivados] = useState(false);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [modalAberto, setModalAberto] = useState(false);
  const [categoriaEditando, setCategoriaEditando] = useState<Categoria | null>(null);
  const [categoriaParaArquivar, setCategoriaParaArquivar] = useState<Categoria | null>(null);
  const [roadmaps, setRoadmaps] = useState<Roadmap[]>([]);
  const [modalRoadmapAberto, setModalRoadmapAberto] = useState(false);
  const [roadmapEditando, setRoadmapEditando] = useState<Roadmap | null>(null);
  const [categoriaParaNovoRoadmap, setCategoriaParaNovoRoadmap] = useState<Categoria | null>(null);
  const [roadmapParaArquivar, setRoadmapParaArquivar] = useState<Roadmap | null>(null);

  const username = usuario?.username ?? "";

  const carregarDados = () => {
    setLoading(true);
    Promise.all([listarCategorias(mostrarArquivados), listarRoadmaps(mostrarArquivados)])
      .then(([cats, rms]) => {
        setCategorias(cats);
        setRoadmaps(rms);
      })
      .catch(() => setErro("Erro ao carregar dados."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    carregarDados();
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
      carregarDados();
    } catch {
      setErro("Erro ao arquivar categoria.");
    }
  };

  const handleRestaurar = async (categoria: Categoria) => {
    try {
      await restaurarCategoria(categoria.id_categoria);
      carregarDados();
    } catch {
      setErro("Erro ao restaurar categoria.");
    }
  };

  const handleMover = async (id: number, direcao: "cima" | "baixo") => {
    try {
      await moverCategoria(id, direcao);
      carregarDados();
    } catch {
      setErro("Erro ao mover categoria.");
    }
  };

    const abrirModalCriarRoadmap = (categoria: Categoria) => {
    setRoadmapEditando(null);
    setCategoriaParaNovoRoadmap(categoria);
    setModalRoadmapAberto(true);
  };

  const abrirModalEditarRoadmap = (roadmap: Roadmap) => {
    setRoadmapEditando(roadmap);
    setCategoriaParaNovoRoadmap(null);
    setModalRoadmapAberto(true);
  };

  const handleArquivarRoadmap = async () => {
    if (!roadmapParaArquivar) return;
    try {
      await arquivarRoadmap(roadmapParaArquivar.id_roadmap);
      setRoadmapParaArquivar(null);
      carregarDados();
    } catch {
      setErro("Erro ao arquivar roadmap.");
    }
  };

  const handleRestaurarRoadmap = async (roadmap: Roadmap) => {
    try {
      await restaurarRoadmap(roadmap.id_roadmap);
      carregarDados();
    } catch {
      setErro("Erro ao restaurar roadmap.");
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
                  className={`text-xl rounded-xl p-2 font-semibold ${
                    categoria.deleted_at ? "text-gray-400 bg-gray-100" : "text-gray-800 bg-yellow-100" 
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

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {roadmaps.filter((r) => r.categoria_id === categoria.id_categoria).map((roadmap) => (
                    <Link
                      key={roadmap.id_roadmap}
                      href={`/dashboard/staff/roadmap/${roadmap.id_roadmap}`}
                      className="relative group bg-white border border-gray-200 rounded-2xl px-5 py-5 hover:border-gray-300 transition-colors duration-150 block"
                    >
                      <p className={`text-base font-semibold truncate pr-2 ${roadmap.deleted_at ? "text-gray-400" : "text-gray-900"}`}>
                        {roadmap.titulo}
                      </p>

                      {roadmap.deleted_at ? (
                        <span className="inline-block mt-2 text-xs text-gray-400 bg-gray-100 rounded-full px-2 py-0.5">arquivado</span>
                      ) : !roadmap.is_active ? (
                        <span className="inline-block mt-2 text-xs text-amber-600 bg-amber-50 rounded-full px-2 py-0.5">rascunho</span>
                      ) : null}

                      <div className="flex gap-2 mt-3">
                        <button
                          onClick={(e) => { e.preventDefault(); e.stopPropagation(); abrirModalEditarRoadmap(roadmap); }}
                          disabled={!!roadmap.deleted_at}
                          aria-label="Editar roadmap"
                          className="text-gray-400 hover:text-gray-700 disabled:opacity-30 disabled:hover:text-gray-400"
                        >
                          <Pencil size={14} />
                        </button>
                        {roadmap.deleted_at ? (
                          <button
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleRestaurarRoadmap(roadmap); }}
                            aria-label="Restaurar roadmap"
                            className="text-gray-400 hover:text-gray-700"
                          >
                            <ArchiveRestore size={14} />
                          </button>
                        ) : (
                          <button
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setRoadmapParaArquivar(roadmap); }}
                            aria-label="Arquivar roadmap"
                            className="text-gray-400 hover:text-red-600"
                          >
                            <Archive size={14} />
                          </button>
                        )}
                      </div>
                    </Link>
                  ))}

                {!categoria.deleted_at && (
                  <button
                    onClick={() => abrirModalCriarRoadmap(categoria)}
                    className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-2xl px-5 py-8 text-gray-300 hover:border-gray-300 hover:text-gray-400 transition-colors duration-150"
                  >
                    <Plus size={20} />
                    <span className="text-xl mt-2">Novo roadmap</span>
                  </button>
                )}
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
            carregarDados();
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

      {modalRoadmapAberto && (
        <RoadmapModal
          roadmap={roadmapEditando}
          categoriaPadrao={categoriaParaNovoRoadmap}
          categorias={categorias}
          onClose={() => setModalRoadmapAberto(false)}
          onSuccess={() => { setModalRoadmapAberto(false); carregarDados(); }}
        />
      )}

      {roadmapParaArquivar && (
        <ConfirmModal
          titulo="Arquivar roadmap"
          mensagem={`Arquivar "${roadmapParaArquivar.titulo}"? Ele some da listagem padrão, mas os tópicos continuam intactos.`}
          textoConfirmar="Arquivar"
          textoConfirmando="Arquivando..."
          onCancel={() => setRoadmapParaArquivar(null)}
          onConfirm={handleArquivarRoadmap}
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
          className="w-full bg-gray-100 text-gray-800 rounded-xl px-4 py-3 text-base outline-none mb-2"
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