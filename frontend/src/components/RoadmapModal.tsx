"use client";

import { useState } from "react";
import { Roadmap, editarRoadmap, criarRoadmap } from '../service/roadmap-service';
import { Categoria } from '../service/categoria-service';

function RoadmapModal({ roadmap, categoriaPadrao, categorias, onClose, onSuccess }: {
  roadmap: Roadmap | null;
  categoriaPadrao: Categoria | null;
  categorias: Categoria[];
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [titulo, setTitulo] = useState(roadmap?.titulo ?? "");
  const [descricao, setDescricao] = useState(roadmap?.descricao ?? "");
  const [isActive, setIsActive] = useState(roadmap?.is_active ?? true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const categoria_id = roadmap?.categoria_id ?? categoriaPadrao?.id_categoria;
  const categoriaAlvo = roadmap
    ? categorias.find((c) => c.id_categoria === roadmap.categoria_id)
    : categoriaPadrao;
  const categoriaArquivada = !!categoriaAlvo?.deleted_at;

  const handleSalvar = async () => {
    const trimmed = titulo.trim();
    if (!trimmed || !categoria_id) return;

    setSalvando(true);
    setErro(null);
    try {
      const dados = {
        categoria_id,
        titulo: trimmed,
        descricao: descricao.trim(),
        is_active: categoriaArquivada ? false : isActive,
      };
      if (roadmap) {
        await editarRoadmap(roadmap.id_roadmap, dados);
      } else {
        await criarRoadmap(dados);
      }
      onSuccess();
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Erro ao salvar roadmap.");
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-2xl px-6 py-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-lg font-bold text-gray-900 mb-1">
          {roadmap ? "Editar roadmap" : "Novo roadmap"}
        </h2>
        <p className="text-sm text-gray-400 mb-4">{categoriaAlvo?.nome}</p>

        <input
          type="text"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          maxLength={100}
          placeholder="Título do roadmap"
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

        <label className={`flex items-center gap-2 text-sm mb-1 ${categoriaArquivada ? "text-gray-300" : "text-gray-600"}`}>
          <input
            type="checkbox"
            checked={categoriaArquivada ? false : isActive}
            disabled={categoriaArquivada}
            onChange={(e) => setIsActive(e.target.checked)}
          />
          Disponibilizar para os clientes
        </label>
        {categoriaArquivada && (
          <p className="text-xs text-amber-600 mb-2">
            Categoria arquivada — este roadmap fica como rascunho até a categoria ser restaurada.
          </p>
        )}

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

export default RoadmapModal;