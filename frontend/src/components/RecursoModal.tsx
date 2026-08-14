"use client";

import { useState, useEffect } from "react";
import { Link2, X, Plus, Pencil, Trash2 } from "lucide-react";
import {
  listarRecursos,
  criarRecurso,
  editarRecurso,
  excluirRecurso,
  Recurso,
  TipoItem,
} from "@/service/recurso-service";
import { ConfirmModal } from "@/components/ConfirmModal";

function RecursosBadge({ tipo, id, readOnly = false }: { tipo: TipoItem; id: number; readOnly?: boolean }) {
  const [recursos, setRecursos] = useState<Recurso[] | null>(null);
  const [modalAberto, setModalAberto] = useState(false);

  const carregar = () => {
    listarRecursos(tipo, id)
      .then(setRecursos)
      .catch(() => setRecursos([]));
  };

  useEffect(() => {
    carregar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tipo, id, readOnly]);

  return (
    <>
      <button
        onClick={() => setModalAberto(true)}
        className="flex items-center gap-1.5 text-x text-gray-400 hover:text-gray-700 mt-2"
      >
        <Link2 size={18} />
        {recursos === null
          ? "carregando..."
          : recursos.length > 0
          ? `${recursos.length} recurso${recursos.length > 1 ? "s" : ""}`
          : "Sem recursos ainda"}
      </button>

      {modalAberto && (
        <RecursoModal
          tipo={tipo}
          id={id}
          readOnly={readOnly}
          onClose={() => setModalAberto(false)}
          onChange={carregar}
        />
      )}
    </>
  );
}

function RecursoModal({
  tipo,
  id,
  readOnly = false,
  onClose,
  onChange,
}: {
  tipo: TipoItem;
  id: number;
  readOnly: boolean;
  onClose: () => void;
  onChange: () => void;
}) {
  const [recursos, setRecursos] = useState<Recurso[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const [edicaoId, setEdicaoId] = useState<number | "novo" | null>(null);
  const [formLabel, setFormLabel] = useState("");
  const [formUrl, setFormUrl] = useState("");
  const [salvando, setSalvando] = useState(false);

  const [recursoParaExcluir, setRecursoParaExcluir] = useState<Recurso | null>(null);

  const carregar = () => {
    setLoading(true);
    listarRecursos(tipo, id)
      .then(setRecursos)
      .catch(() => setErro("Erro ao carregar recursos."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    carregar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tipo, id, readOnly]);

  const abrirNovo = () => {
    setEdicaoId("novo");
    setFormLabel("");
    setFormUrl("");
    setErro(null);
  };

  const abrirEditar = (recurso: Recurso) => {
    setEdicaoId(recurso.id_recurso);
    setFormLabel(recurso.label);
    setFormUrl(recurso.url);
    setErro(null);
  };

  const cancelarForm = () => setEdicaoId(null);

  const salvarForm = async () => {
    const label = formLabel.trim();
    const url = formUrl.trim();
    if (!label || !url) return;

    setSalvando(true);
    setErro(null);
    try {
      if (edicaoId === "novo") {
        await criarRecurso(tipo, id, { label, url });
      } else if (edicaoId !== null) {
        await editarRecurso(edicaoId, { label, url });
      }
      setEdicaoId(null);
      carregar();
      onChange();
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Erro ao salvar recurso.");
    } finally {
      setSalvando(false);
    }
  };

  const handleExcluir = async () => {
    if (!recursoParaExcluir) return;
    try {
      await excluirRecurso(recursoParaExcluir.id_recurso);
      setRecursoParaExcluir(null);
      carregar();
      onChange();
    } catch {
      setErro("Erro ao excluir recurso.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-2xl px-6 py-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">Recursos</h2>
          <button onClick={onClose} aria-label="Fechar" className="text-gray-400 hover:text-gray-700">
            <X size={18} />
          </button>
        </div>

        {loading ? (
          <p className="text-sm text-gray-400">Carregando...</p>
        ) : (
          <div className="flex flex-col gap-2 mb-4">
            {recursos.length === 0 && edicaoId === null && (
              <p className="text-sm text-gray-400">Sem recursos ainda.</p>
            )}

            {recursos.map((recurso) =>
              edicaoId === recurso.id_recurso ? (
                <div key={recurso.id_recurso} className="bg-gray-50 rounded-xl px-3 py-3">
                  <RecursoForm
                    label={formLabel}
                    url={formUrl}
                    onLabelChange={setFormLabel}
                    onUrlChange={setFormUrl}
                    onCancelar={cancelarForm}
                    onSalvar={salvarForm}
                    salvando={salvando}
                  />
                </div>
              ) : (
                <div
                  key={recurso.id_recurso}
                  className="flex items-center justify-between bg-gray-50 rounded-xl px-3 py-2.5"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{recurso.label}</p>
                    <a
                      href={recurso.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 truncate block hover:underline"
                    >
                      {recurso.url}
                    </a>
                  </div>
                  {!readOnly && (
                    <div className="flex items-center gap-2 shrink-0 ml-2">
                    <button onClick={() => abrirEditar(recurso)} aria-label="Editar recurso" className="text-gray-400 hover:text-gray-700">
                      <Pencil size={14} />
                    </button>
                    <button onClick={() => setRecursoParaExcluir(recurso)} aria-label="Excluir recurso" className="text-gray-400 hover:text-red-600">
                      <Trash2 size={14} />
                    </button>
                    </div>
                  )}
                  
                </div>
              )
            )}

            {edicaoId === "novo" && (
              <div className="bg-gray-50 rounded-xl px-3 py-3">
                <RecursoForm
                  label={formLabel}
                  url={formUrl}
                  onLabelChange={setFormLabel}
                  onUrlChange={setFormUrl}
                  onCancelar={cancelarForm}
                  onSalvar={salvarForm}
                  salvando={salvando}
                />
              </div>
            )}
          </div>
        )}

        {erro && <p className="text-red-500 text-sm mb-3">{erro}</p>}

        {!readOnly && edicaoId === null && (
          <button
            onClick={abrirNovo}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800"
          >
            <Plus size={14} />
            Adicionar link
          </button>
        )}

        {recursoParaExcluir && (
          <ConfirmModal
            titulo="Excluir recurso"
            mensagem={`Excluir "${recursoParaExcluir.label}"? Essa ação não pode ser desfeita.`}
            textoConfirmar="Excluir"
            textoConfirmando="Excluindo..."
            onCancel={() => setRecursoParaExcluir(null)}
            onConfirm={handleExcluir}
          />
        )}
      </div>
    </div>
  );
}

function RecursoForm({
  label,
  url,
  onLabelChange,
  onUrlChange,
  onCancelar,
  onSalvar,
  salvando,
}: {
  label: string;
  url: string;
  onLabelChange: (v: string) => void;
  onUrlChange: (v: string) => void;
  onCancelar: () => void;
  onSalvar: () => void;
  salvando: boolean;
}) {
  return (
    <div>
      <input
        type="text"
        value={label}
        onChange={(e) => onLabelChange(e.target.value)}
        maxLength={100}
        placeholder="Label (ex: Doc oficial)"
        className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none mb-2"
        autoFocus
      />
      <input
        type="text"
        value={url}
        onChange={(e) => onUrlChange(e.target.value)}
        placeholder="https://..."
        className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none mb-2"
      />
      <div className="flex justify-end gap-2">
        <button onClick={onCancelar} className="text-xs text-gray-500 px-3 py-1.5">
          Cancelar
        </button>
        <button
          onClick={onSalvar}
          disabled={salvando || !label.trim() || !url.trim()}
          className="bg-[#1a0066] text-white text-xs font-bold px-3 py-1.5 rounded-lg disabled:opacity-50"
        >
          {salvando ? "Salvando..." : "Salvar"}
        </button>
      </div>
    </div>
  );
}

export default RecursosBadge;