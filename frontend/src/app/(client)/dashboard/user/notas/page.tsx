'use client';
import { useState, useEffect } from "react";
import Link from "next/link";
import {
  listarNotasPorCaderno,
  criarNota,
  editarNota,
  excluirNota,
  type Nota,
} from "@/service/conteudo-service";

type NoteUI = Nota;

// Paleta do tema (creme + roxo-marinho)
const COR_BG_PAGINA = "#fdf6e2";
const COR_BG_HEADER = "#fbf1ce";
const COR_BORDA_HEADER = "#ecdfad";
const COR_ACCENT = "#0C0F4F";
const COR_ICONE = "#6f6da8";

// ---------------------------------------------------------------------------
// Icons
// ---------------------------------------------------------------------------

const EditIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const TrashIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5">
    <polyline points="3 6 5 6 21 6" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6M10 11v6M14 11v6M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const PlusIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
    <line x1="12" y1="5" x2="12" y2="19" strokeLinecap="round" />
    <line x1="5" y1="12" x2="19" y2="12" strokeLinecap="round" />
  </svg>
);

const BackIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
    <path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// ---------------------------------------------------------------------------
// EditModal
// ---------------------------------------------------------------------------
interface EditModalProps {
  note?: NoteUI | null;
  isNew: boolean;
  onClose: () => void;
  onSave: (data: { titulo: string; conteudo: string }) => Promise<void>;
}

function EditModal({ note, isNew, onClose, onSave }: EditModalProps) {
  const [titulo, setTitulo] = useState(note?.titulo ?? "");
  const [conteudo, setConteudo] = useState(note?.conteudo ?? "");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  const handleSave = async () => {
    if (!titulo.trim()) return;
    setLoading(true);
    setErro("");
    try {
      await onSave({
        titulo,
        conteudo,
      });
      onClose();
    } catch (e: unknown) {
      setErro(e instanceof Error ? e.message : "Erro ao salvar nota");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[rgba(30,25,10,0.45)] backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-md rounded-2xl shadow-2xl overflow-hidden bg-[#fffdf6] border border-[#ecdfad]">

        <div className="px-6 py-4 text-center border-b border-[#ecdfad]">
          <h2 className="text-xl font-bold text-gray-900 leading-tight">
            {isNew ? "Nova nota" : "Editar nota"}
          </h2>
        </div>

        <div className="px-6 py-5 space-y-5">

          {erro && (
            <div className="px-4 py-2.5 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
              {erro}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="block text-sm font-medium tracking-wide uppercase text-gray-500">título</label>
            <input
              type="text"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Título da nota..."
              className="w-full rounded-xl px-4 py-2.5 text-base outline-none bg-[#fbf6e6] text-gray-800 placeholder:text-gray-400 border border-transparent focus:border-[#0C0F4F]/40 transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium tracking-wide uppercase text-gray-500">conteúdo</label>
            <textarea
              value={conteudo}
              onChange={(e) => setConteudo(e.target.value)}
              placeholder="Escreva sua nota aqui..."
              rows={5}
              className="w-full rounded-xl px-4 py-2.5 text-base outline-none resize-none bg-[#fbf6e6] text-gray-800 placeholder:text-gray-400 border border-transparent focus:border-[#0C0F4F]/40 transition-colors"
            />
          </div>
        </div>

        <div className="px-6 py-4 flex gap-3 border-t border-[#ecdfad]">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl font-medium bg-[#fbf6e6] text-[#0C0F4F] hover:bg-[#f4ecd3] transition-colors disabled:opacity-50"
          >
            cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl font-semibold text-white bg-[#0C0F4F] hover:brightness-125 transition-all disabled:opacity-50"
          >
            {loading ? "salvando..." : "salvar"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// NoteCard
// ---------------------------------------------------------------------------
interface NoteCardProps {
  note: NoteUI;
  onEdit: () => void;
  onDelete: () => void;
}

function NoteCard({ note, onEdit, onDelete }: NoteCardProps) {
  return (
    <div className="rounded-2xl bg-white shadow-md p-6">
      <div className="flex items-start justify-between gap-4 mb-3">
        <h3 className="text-xl font-medium text-gray-800 leading-tight">{note.titulo}</h3>
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={onEdit}
            className="p-1.5 rounded-lg transition-colors hover:bg-violet-50"
            style={{ color: COR_ICONE }}
          >
            <EditIcon />
          </button>
          <button
            onClick={onDelete}
            className="p-1.5 rounded-lg hover:bg-red-50 hover:text-red-400 transition-colors"
            style={{ color: COR_ICONE }}
          >
            <TrashIcon />
          </button>
        </div>
      </div>

      <p className="text-base leading-relaxed text-gray-500">
        {note.conteudo || <span className="italic opacity-50">sem conteúdo</span>}
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

export default function NotesApp() {
  const [notes, setNotes] = useState<NoteUI[]>([]);
  const [editingNote, setEditingNote] = useState<NoteUI | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [idCaderno, setIdCaderno] = useState<string>("");
  const [nomeCaderno, setNomeCaderno] = useState<string>("Caderno");
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  // Lê o id_caderno do sessionStorage e carrega as notas
  useEffect(() => {
    const id = sessionStorage.getItem("id_caderno") ?? "";
    const nome = sessionStorage.getItem("titulo_caderno") ?? "Caderno";
    setIdCaderno(id);
    setNomeCaderno(nome);

    if (!id) {
      setErro("Nenhuma caderno selecionada.");
      setCarregando(false);
      return;
    }

    carregarNotas(id);
  }, []);

  const carregarNotas = async (id: string) => {
    setCarregando(true);
    setErro("");
    try {
      const dados = await listarNotasPorCaderno(id);
      setNotes(dados.map((n) => ({
        ...n,
      })));
    } catch (e: unknown) {
      setErro(e instanceof Error ? e.message : "Erro ao carregar notas");
    } finally {
      setCarregando(false);
    }
  };

  const handleSave = async (data: { titulo: string; conteudo: string }) => {
    if (isCreating) {
      const nova = await criarNota({ titulo: data.titulo, conteudo: data.conteudo, id_caderno: idCaderno });
      setNotes((prev) => [...prev, nova]);
    } else if (editingNote) {
      await editarNota(editingNote.id_nota, { titulo: data.titulo, conteudo: data.conteudo });
      setNotes((prev) =>
        prev.map((n) =>
          n.id_nota === editingNote.id_nota
            ? { ...n, titulo: data.titulo, conteudo: data.conteudo }
            : n
        )
      );
    }
    setEditingNote(null);
    setIsCreating(false);
  };

  const handleDelete = async (id: number) => {
    try {
      await excluirNota(id);
      setNotes((prev) => prev.filter((n) => n.id_nota !== id));
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Erro ao excluir nota");
    }
  };

  return (
    <>
      <div className="min-h-screen" style={{ backgroundColor: COR_BG_PAGINA }}>
        <header
          className="sticky top-0 z-10 flex items-center justify-between px-6 sm:px-8 py-4 border-b"
          style={{ backgroundColor: COR_BG_HEADER, borderColor: COR_BORDA_HEADER }}
        >
          <Link
            href="/dashboard/user/cadernos"
            className="flex items-center gap-2 text-lg text-gray-600 hover:gap-3 transition-all"
          >
            <BackIcon />
            voltar ao início
          </Link>

          <button
            onClick={() => setIsCreating(true)}
            disabled={!idCaderno || carregando}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-white shadow-sm hover:brightness-110 transition-all disabled:opacity-50"
            style={{ backgroundColor: COR_ACCENT }}
          >
            <PlusIcon />
            Nova Nota
          </button>
        </header>

        <main className="max-w-2xl mx-auto px-4 py-10">
          <h1 className="text-3xl font-bold text-gray-900 text-center mb-8">
            {nomeCaderno}
          </h1>

          {carregando && (
            <div className="text-center py-16 rounded-2xl bg-white/60 border border-dashed" style={{ borderColor: COR_BORDA_HEADER }}>
              <p className="text-gray-400 animate-pulse">carregando notas...</p>
            </div>
          )}

          {!carregando && erro && (
            <div className="text-center py-16 rounded-2xl bg-red-50 border border-dashed border-red-300">
              <p className="text-red-500">{erro}</p>
            </div>
          )}

          {!carregando && !erro && (
            <div className="space-y-5">
              {notes.length === 0 && (
                <div className="text-center py-16 rounded-2xl bg-white/60 border border-dashed" style={{ borderColor: COR_BORDA_HEADER }}>
                  <p className="text-gray-400">nenhuma nota ainda</p>
                </div>
              )}
              {notes.map((note) => (
                <NoteCard
                  key={note.id_nota}
                  note={note}
                  onEdit={() => setEditingNote(note)}
                  onDelete={() => handleDelete(note.id_nota)}
                />
              ))}
            </div>
          )}
        </main>
      </div>

      {(isCreating || editingNote) && (
        <EditModal
          note={editingNote}
          isNew={isCreating}
          onClose={() => { setEditingNote(null); setIsCreating(false); }}
          onSave={handleSave}
        />
      )}
    </>
  );
}