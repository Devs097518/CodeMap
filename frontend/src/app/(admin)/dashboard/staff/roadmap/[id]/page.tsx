"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useParams } from "next/navigation";
import { listarRoadmapsAdmin, buscarRoadmapAdmin, Roadmap } from "@/service/roadmap-service";
import { listarTopicosComSubitensAdmin, TopicoComSubitens } from "@/service/topico-service";
import { ChevronUp, ChevronDown } from "lucide-react";
import { moverTopico } from "@/service/topico-service";
import { moverSubitem } from "@/service/subitem-service";
import { Plus, Pencil } from "lucide-react";
import { criarTopico, editarTopico, Topico } from "@/service/topico-service";
import { criarSubitem, editarSubitem, Subitem } from "@/service/subitem-service";
import { Trash2 } from "lucide-react";
import { excluirTopico } from "@/service/topico-service";
import { excluirSubitem } from "@/service/subitem-service";
import { ConfirmModal } from "@/components/ConfirmModal";
import RecursosBadge from "@/components/RecursoModal";

export default function RoadmapDetalhePage() {
  const params = useParams();
  const roadmapId = Number(params.id);

  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  const [topicos, setTopicos] = useState<TopicoComSubitens[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [modalTopicoAberto, setModalTopicoAberto] = useState(false);
  const [topicoEditando, setTopicoEditando] = useState<Topico | null>(null);

  const [modalSubitemAberto, setModalSubitemAberto] = useState(false);
  const [subitemEditando, setSubitemEditando] = useState<Subitem | null>(null);
  const [topicoParaNovoSubitem, setTopicoParaNovoSubitem] = useState<TopicoComSubitens | null>(null);

  const [topicoParaExcluir, setTopicoParaExcluir] = useState<TopicoComSubitens | null>(null);
  const [subitemParaExcluir, setSubitemParaExcluir] = useState<Subitem | null>(null);

  const carregarDados = () => {
    setLoading(true);
    Promise.all([buscarRoadmapAdmin(roadmapId), listarTopicosComSubitensAdmin(roadmapId)])
      .then(([r, t]) => {
        setRoadmap(r);
        setTopicos(t);
      })
      .catch(() => setErro("Erro ao carregar roadmap."))
      .finally(() => setLoading(false));
  };

  const handleMoverTopico = async (id_topico: number, direcao: "cima" | "baixo") => {
    try {
      await moverTopico(id_topico, direcao);
      carregarDados();
    } catch {
      setErro("Erro ao mover tópico.");
    }
  };

  const handleMoverSubitem = async (id_subitem: number, direcao: "cima" | "baixo") => {
    try {
      await moverSubitem(id_subitem, direcao);
      carregarDados();
    } catch {
      setErro("Erro ao mover sub-item.");
    }
  };

  const abrirModalCriarTopico = () => {
    setTopicoEditando(null);
    setModalTopicoAberto(true);
  };

  const abrirModalEditarTopico = (topico: Topico) => {
    setTopicoEditando(topico);
    setModalTopicoAberto(true);
  };

  const abrirModalCriarSubitem = (topico: TopicoComSubitens) => {
    setSubitemEditando(null);
    setTopicoParaNovoSubitem(topico);
    setModalSubitemAberto(true);
  };

  const abrirModalEditarSubitem = (subitem: Subitem) => {
    setSubitemEditando(subitem);
    setTopicoParaNovoSubitem(null);
    setModalSubitemAberto(true);
  };

  const handleExcluirTopico = async () => {
    if (!topicoParaExcluir) return;
    try {
      await excluirTopico(topicoParaExcluir.id_topico);
      setTopicoParaExcluir(null);
      carregarDados();
    } catch {
      setErro("Erro ao excluir tópico.");
    }
  };

  const handleExcluirSubitem = async () => {
    if (!subitemParaExcluir) return;
    try {
      await excluirSubitem(subitemParaExcluir.id_subitem);
      setSubitemParaExcluir(null);
      carregarDados();
    } catch {
      setErro("Erro ao excluir sub-item.");
    }
  };

  useEffect(() => {
    if (roadmapId) carregarDados();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roadmapId]);

  if (loading) {
    return <main className="min-h-screen bg-white px-10 py-10 font-sans text-gray-400 text-xl">Carregando...</main>;
  }

  if (erro || !roadmap) {
    return <main className="min-h-screen bg-white px-10 py-10 font-sans text-red-500">{erro ?? "Roadmap não encontrado."}</main>;
  }

  return (
    <main className="min-h-screen bg-white px-10 py-10 font-sans">
      <div className="flex items-center justify-between mb-6 border-b-2 pb-9">
        <Link href="/dashboard/staff/inicio" className="flex items-center gap-2 text-x text-gray-500 hover:text-gray-700">
          <ArrowLeft size={16} />
          voltar ao início
        </Link>
        <button
          onClick={abrirModalCriarTopico}
          className="flex items-center gap-2 bg-[#0C0F4F] text-white text-x px-4 py-2.5 rounded-xl hover:bg-[#1f237d] transition-colors duration-150"
        >
          <Plus size={16} />
          Novo tópico
        </button>
      </div>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">{roadmap.titulo}</h1>
        <p className="text-x text-gray-500 mt-1">
          {roadmap.deleted_at ? "arquivado" : roadmap.is_active ? "ativo" : "rascunho"}
        </p>
        {roadmap.descricao && <p className="text-sm text-gray-600 mt-3">{roadmap.descricao}</p>}
      </div>

      <div className="flex flex-col gap-4">
        {topicos.map((topico, index) => (
  <div key={topico.id_topico} className="border-gray-200 bg-gray-50 rounded-2xl px-7 py-4 mb-2">
    <div className="flex items-center justify-between">

      <span className="text-base text-xl font-semibold text-gray-900">{topico.titulo}</span>
      <div className="flex items-center gap-1">
        <span className="text-x text-gray-400 mr-1">ordem #{topico.ordem}</span>

        <button onClick={() => 
          handleMoverTopico(topico.id_topico, "cima")} 
          disabled={index === 0} aria-label="Mover tópico para cima" 
          className="text-gray-400 hover:text-gray-700 disabled:opacity-30 disabled:hover:text-gray-400">
          <ChevronUp size={16} />
        </button>

        <button onClick={() => 
          handleMoverTopico(topico.id_topico, "baixo")} 
          disabled={index === topicos.length - 1} 
          aria-label="Mover tópico para baixo" 
          className="text-gray-400 hover:text-gray-700 disabled:opacity-30 disabled:hover:text-gray-400">
          <ChevronDown size={16} />
        </button>

        <button onClick={() => 
          abrirModalEditarTopico(topico)} 
          aria-label="Editar tópico" 
          className="text-gray-400 hover:text-gray-700">
          <Pencil size={16} />
        </button>

        <button onClick={() => setTopicoParaExcluir(topico)} aria-label="Excluir tópico" className="text-gray-400 hover:text-red-600">
          <Trash2 size={16} />
        </button>

      </div>
    </div>
    {topico.descricao && <p className="text-x text-gray-500 mt-1">{topico.descricao}</p>}

      <RecursosBadge tipo="topico" id={topico.id_topico} />

      {topico.subitens.length > 0 && (
        <div className="ml-1.5 mt-3 flex flex-col gap-2">
          {topico.subitens.map((sub, subIndex) => (
            <div key={sub.id_subitem} className="bg-white rounded-xl px-3 py-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-800">{sub.titulo}</span>
                <div className="flex items-center gap-1">
                  <span className="text-xs text-gray-400 mr-1">ordem #{sub.ordem}</span>

                  <button
                    onClick={() => handleMoverSubitem(sub.id_subitem, "cima")}
                    disabled={subIndex === 0}
                    aria-label="Mover sub-item para cima"
                    className="text-gray-400 hover:text-gray-700 disabled:opacity-30 disabled:hover:text-gray-400"
                  >
                    <ChevronUp size={14} />
                  </button>

                  <button
                    onClick={() => handleMoverSubitem(sub.id_subitem, "baixo")}
                    disabled={subIndex === topico.subitens.length - 1}
                    aria-label="Mover sub-item para baixo"
                    className="text-gray-400 hover:text-gray-700 disabled:opacity-30 disabled:hover:text-gray-400"
                  >
                    <ChevronDown size={14} />
                  </button>

                  <button onClick={() => abrirModalEditarSubitem(sub)} aria-label="Editar sub-item" className="text-gray-400 hover:text-gray-700">
                    <Pencil size={14} />
                  </button>

                  <button onClick={() => setSubitemParaExcluir(sub)} aria-label="Excluir sub-item" className="text-gray-400 hover:text-red-600">
                    <Trash2 size={14} />
                  </button>

                </div>
              </div>
              {sub.descricao && <p className="text-xs text-gray-500 mt-0.5">{sub.descricao}</p>}

              <RecursosBadge tipo="subitem" id={sub.id_subitem} />

            </div>
          ))}
        </div>
      )}

      <button
        onClick={() => abrirModalCriarSubitem(topico)}
        className="mt-3 flex items-center gap-1.5 text-x text-gray-500 hover:text-gray-800"
      >
        <Plus size={18} />
        Adicionar sub-item
      </button>

      {topicoParaExcluir && (
        <ConfirmModal
          titulo="Excluir tópico"
          mensagem={
            topicoParaExcluir.subitens.length > 0
              ? `Excluir "${topicoParaExcluir.titulo}"? Isso vai apagar também ${topicoParaExcluir.subitens.length} sub-item(ns) junto. Essa ação não pode ser desfeita.`
              : `Excluir "${topicoParaExcluir.titulo}"? Essa ação não pode ser desfeita.`
          }
          textoConfirmar="Excluir"
          textoConfirmando="Excluindo..."
          onCancel={() => setTopicoParaExcluir(null)}
          onConfirm={handleExcluirTopico}
        />
      )}

      {subitemParaExcluir && (
        <ConfirmModal
          titulo="Excluir sub-item"
          mensagem={`Excluir "${subitemParaExcluir.titulo}"? Essa ação não pode ser desfeita.`}
          textoConfirmar="Excluir"
          textoConfirmando="Excluindo..."
          onCancel={() => setSubitemParaExcluir(null)}
          onConfirm={handleExcluirSubitem}
        />
      )}

    </div>
  ))}
      </div>

      {modalTopicoAberto && (
        <TopicoModal
          topico={topicoEditando}
          roadmapId={roadmapId}
          onClose={() => setModalTopicoAberto(false)}
          onSuccess={() => { setModalTopicoAberto(false); carregarDados(); }}
        />
      )}

      {modalSubitemAberto && (
        <SubitemModal
          subitem={subitemEditando}
          topico={topicoParaNovoSubitem}
          onClose={() => setModalSubitemAberto(false)}
          onSuccess={() => { setModalSubitemAberto(false); carregarDados(); }}
        />
      )}

    </main>
  );


}

function TopicoModal({
  topico,
  roadmapId,
  onClose,
  onSuccess,
}: {
  topico: Topico | null;
  roadmapId: number;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [titulo, setTitulo] = useState(topico?.titulo ?? "");
  const [descricao, setDescricao] = useState(topico?.descricao ?? "");
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const handleSalvar = async () => {
    const trimmed = titulo.trim();
    if (!trimmed) return;

    setSalvando(true);
    setErro(null);
    try {
      if (topico) {
        await editarTopico(topico.id_topico, { titulo: trimmed, descricao: descricao.trim() });
      } else {
        await criarTopico({ roadmap_id: roadmapId, titulo: trimmed, descricao: descricao.trim() });
      }
      onSuccess();
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Erro ao salvar tópico.");
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-2xl px-6 py-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-lg font-bold text-gray-900 mb-4">
          {topico ? "Editar tópico" : "Novo tópico"}
        </h2>

        <input
          type="text"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          maxLength={100}
          placeholder="Título do tópico"
          className="w-full bg-gray-200 text-gray-700 rounded-xl px-4 py-3 text-base outline-none mb-2"
          autoFocus
        />
        <textarea
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
          placeholder="Descrição (opcional)"
          rows={3}
          className="w-full bg-gray-200 text-gray-700 rounded-xl px-4 py-3 text-base outline-none mb-2 resize-none"
        />

        {erro && <p className="text-red-500 text-sm mb-2">{erro}</p>}

        <div className="flex justify-end gap-3 mt-4">
          <button onClick={onClose} className="text-sm text-gray-500 px-4 py-2">Cancelar</button>
          <button
            onClick={handleSalvar}
            disabled={salvando || !titulo.trim()}
            className="bg-[#1a0066] text-white text-sm font-bold px-4 py-2.5 rounded-xl disabled:opacity-50"
          >
            {salvando ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </div>
    </div>
  );
}


function SubitemModal({
  subitem,
  topico,
  onClose,
  onSuccess,
}: {
  subitem: Subitem | null;
  topico: TopicoComSubitens | null;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [titulo, setTitulo] = useState(subitem?.titulo ?? "");
  const [descricao, setDescricao] = useState(subitem?.descricao ?? "");
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const topico_id = subitem?.topico_id ?? topico?.id_topico;

  const handleSalvar = async () => {
    const trimmed = titulo.trim();
    if (!trimmed || !topico_id) return;

    setSalvando(true);
    setErro(null);
    try {
      if (subitem) {
        await editarSubitem(subitem.id_subitem, { titulo: trimmed, descricao: descricao.trim() });
      } else {
        await criarSubitem({ topico_id, titulo: trimmed, descricao: descricao.trim() });
      }
      onSuccess();
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Erro ao salvar sub-item.");
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white px-6 py-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-lg font-bold text-gray-900 mb-1">
          {subitem ? "Editar sub-item" : "Novo sub-item"}
        </h2>
        {!subitem && <p className="text-sm text-gray-400 mb-4">{topico?.titulo}</p>}

        <input
          type="text"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          maxLength={100}
          placeholder="Título do sub-item"
          className="w-full bg-gray-200 text-gray-700 rounded-xl px-4 py-3 text-base outline-none mb-2 mt-3"
          autoFocus
        />
        <textarea
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
          placeholder="Descrição (opcional)"
          rows={3}
          className="w-full bg-gray-2x00 text-gray-700 rounded-xl px-4 py-3 text-base outline-none mb-2 resize-none"
        />

        {erro && <p className="text-red-500 text-sm mb-2">{erro}</p>}

        <div className="flex justify-end gap-3 mt-4">
          <button onClick={onClose} className="text-sm text-gray-500 px-4 py-2">Cancelar</button>
          <button
            onClick={handleSalvar}
            disabled={salvando || !titulo.trim()}
            className="bg-[#1a0066] text-white text-sm font-bold px-4 py-2.5 rounded-xl disabled:opacity-50"
          >
            {salvando ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </div>
    </div>
  );
}



