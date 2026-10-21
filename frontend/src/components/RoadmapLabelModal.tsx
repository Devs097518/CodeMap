// src/components/RoadmapLabelsModal.tsx
"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { editarRoadmap, listarLabels, Roadmap } from "@/service/roadmap-service";

// Mesmas regras do backend (normalizarLabels no roadmap.service.js)
const MAX_LABELS = 8;
const MAX_CHARS_LABEL = 30;

const normalizarLabel = (valor: string) =>
  valor.toLowerCase().replace(/\s+/g, " ").trim().slice(0, MAX_CHARS_LABEL).trim();

export default function RoadmapLabelsModal({
  roadmap,
  onClose,
  onSuccess,
}: {
  roadmap: Roadmap;
  onClose: () => void;
  onSuccess: (atualizado: Roadmap) => void;
}) {
  const [labels, setLabels] = useState<string[]>(roadmap.labels ?? []);
  const [entrada, setEntrada] = useState("");
  const [sugestoes, setSugestoes] = useState<string[]>([]);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const cheio = labels.length >= MAX_LABELS;

  useEffect(() => {
    listarLabels()
      .then(setSugestoes)
      .catch(() => setSugestoes([]));
  }, []);

  // Devolve a lista com a label nova, ou a mesma lista se ela for vazia, repetida ou não couber
  const comLabel = (lista: string[], bruto: string) => {
    const label = normalizarLabel(bruto);
    if (!label || lista.includes(label) || lista.length >= MAX_LABELS) return lista;
    return [...lista, label];
  };

  const adicionar = (bruto: string) => {
    setLabels((prev) => comLabel(prev, bruto));
    setEntrada("");
  };

  const handleSalvar = async () => {
    // Se ficou algo digitado e não confirmado com Enter, entra junto
    const finais = comLabel(labels, entrada);

    setSalvando(true);
    setErro(null);
    try {
      const atualizado = await editarRoadmap(roadmap.id_roadmap, {
        categoria_id: roadmap.categoria_id,
        titulo: roadmap.titulo,
        descricao: roadmap.descricao ?? undefined,
        is_active: roadmap.is_active,
        labels: finais,
      });
      onSuccess(atualizado);
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Erro ao salvar labels.");
    } finally {
      setSalvando(false);
    }
  };

  const sugestoesLivres = sugestoes.filter((s) => !labels.includes(s)).slice(0, 10);

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4" onClick={onClose}>
      <div className="bg-white rounded-2xl px-6 py-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-lg font-bold text-gray-900 mb-1">Labels do roadmap</h2>
        <p className="text-sm text-gray-400 mb-4">
          {roadmap.titulo}. As labels ajudam o quiz a recomendar este roadmap para quem tem o perfil certo.
        </p>

        <div className="flex flex-wrap items-center gap-1.5 bg-gray-200 rounded-xl px-3 py-2.5">
          {labels.map((label) => (
            <span
              key={label}
              className="inline-flex items-center gap-1 bg-white text-gray-700 text-sm rounded-full pl-3 pr-1.5 py-0.5"
            >
              {label}
              <button
                type="button"
                aria-label={`Remover label ${label}`}
                onClick={() => setLabels((prev) => prev.filter((l) => l !== label))}
                className="rounded-full p-0.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
              >
                <X size={14} />
              </button>
            </span>
          ))}

          <input
            type="text"
            value={entrada}
            disabled={cheio}
            maxLength={MAX_CHARS_LABEL + 1}
            onChange={(e) => setEntrada(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === ",") {
                e.preventDefault();
                adicionar(entrada);
              } else if (e.key === "Backspace" && !entrada && labels.length) {
                setLabels((prev) => prev.slice(0, -1));
              }
            }}
            placeholder={cheio ? "limite de labels atingido" : labels.length ? "" : "ex.: web, frontend, iniciante"}
            className="flex-1 min-w-[8rem] bg-transparent text-gray-700 text-base outline-none py-1 disabled:cursor-not-allowed"
            autoFocus
          />
        </div>

        <div className="flex items-center justify-between text-xs text-gray-400 mt-1.5">
          <span>Enter ou vírgula para adicionar</span>
          <span>
            {labels.length}/{MAX_LABELS}
          </span>
        </div>

        {!cheio && sugestoesLivres.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 mt-3">
            <span className="text-xs text-gray-400">já usadas:</span>
            {sugestoesLivres.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => adicionar(s)}
                className="border border-gray-200 text-gray-600 text-xs rounded-full px-2.5 py-0.5 hover:bg-gray-50"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {erro && <p className="text-red-500 text-sm mt-3">{erro}</p>}

        <div className="flex justify-end gap-3 mt-5">
          <button onClick={onClose} className="text-sm text-gray-500 px-4 py-2">
            Cancelar
          </button>
          <button
            onClick={handleSalvar}
            disabled={salvando}
            className="bg-[#1a0066] text-white text-sm font-bold px-4 py-2.5 rounded-xl disabled:opacity-50"
          >
            {salvando ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </div>
    </div>
  );
}