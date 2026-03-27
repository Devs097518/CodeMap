'use client';
import { useState, useEffect } from "react";
import Link from "next/link";
import {
  listarNotasPorPasta,
  criarNota,
  editarNota,
  excluirNota,
  type Nota,
} from "@/service/conteudo-service";

type Status = "pendente" | "fazendo" | "feito";

interface NoteUI extends Nota {
  status: Status;
}

// ---------------------------------------------------------------------------
// Icons (mantidos iguais)
// ---------------------------------------------------------------------------
const StatusIcon = ({ status }: { status: Status }) => {
  if (status === "pendente")
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5">
        <circle cx="12" cy="12" r="9" />
      </svg>
    );
  if (status === "fazendo")
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5">
        <path d="M5 3h14M5 21h14M8 3v3a4 4 0 0 0 8 0V3M8 21v-3a4 4 0 0 1 8 0v3" />
      </svg>
    );
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
      <circle cx="12" cy="12" r="9" />
      <path d="m8.5 12 2.5 2.5 4.5-4.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

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
  note: NoteUI | null;
  isNew: boolean;
  onClose: () => void;
  onSave: (data: { titulo: string; conteudo: string; status: Status }) => Promise<void>;
}

function EditModal({ note, isNew, onClose, onSave }: EditModalProps) {
  const [titulo, setTitulo] = useState(note?.titulo ?? "");
  const [conteudo, setConteudo] = useState(note?.conteudo ?? "");
  const [status, setStatus] = useState<Status>(note?.status ?? "pendente");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  const handleSave = async () => {
    if (!titulo.trim()) return;
    setLoading(true);
    setErro("");
    try {
      await onSave({ titulo, conteudo, status });
      onClose();
    } catch (e: unknown) {
      setErro(e instanceof Error ? e.message : "Erro ao salvar nota");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[rgba(15,15,25,0.55)] backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-md rounded-2xl shadow-2xl overflow-hidden bg-gradient-to-br from-white to-[#f8f6ff] border border-violet-100">

        <div className="px-6 py-4 text-center border-b border-violet-100">
          <h2 className="text-2xl font-bold text-gray-800 leading-tight">
            {isNew ? "NOVA NOTA" : "EDITAR NOTA"}
          </h2>
        </div>

        <div className="px-6 py-5 space-y-5">

          {erro && (
            <div className="px-4 py-2.5 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
              {erro}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="block text-xl font-medium tracking-widest uppercase text-gray-800">título</label>
            <input
              type="text"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Título da nota..."
              className="w-full rounded-xl px-4 py-2.5 text-1xl outline-none bg-violet-50 text-gray-800 placeholder:text-violet-300 border border-transparent focus:border-violet-400 transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xl font-medium tracking-widest uppercase text-gray-800">conteúdo</label>
            <textarea
              value={conteudo}
              onChange={(e) => setConteudo(e.target.value)}
              placeholder="Escreva sua nota aqui..."
              rows={4}
              className="w-full rounded-xl px-4 py-2.5 text-1xl outline-none resize-none bg-violet-50 text-[#2d2540] placeholder:text-violet-300 border border-transparent focus:border-violet-400 transition-colors"
            />
          </div>

          <div className="space-y-2.5">
            <label className="block text-xl font-medium tracking-widest uppercase text-gray-800">status</label>
            <div className="flex gap-2">
              {(["pendente", "fazendo", "feito"] as Status[]).map((s) => (
                <button
                  key={s}
                  onClick={() => setStatus(s)}
                  className={`flex-1 flex flex-col items-center gap-1.5 py-2.5 rounded-xl transition-all border-2 border-transparent
                    ${s === "pendente" && status === s ? "bg-slate-300 ring-2 ring-slate-300/50 text-[#1e1b2e]" : ""}
                    ${s === "pendente" && status !== s ? "bg-slate-100 text-slate-500" : ""}
                    ${s === "fazendo" && status === s ? "bg-amber-400 ring-2 ring-amber-400/50 text-[#1e1b2e]" : ""}
                    ${s === "fazendo" && status !== s ? "bg-amber-100 text-slate-500" : ""}
                    ${s === "feito" && status === s ? "bg-emerald-400 ring-2 ring-emerald-400/50 text-[#1e1b2e]" : ""}
                    ${s === "feito" && status !== s ? "bg-emerald-100 text-slate-500" : ""}
                  `}
                >
                  <StatusIcon status={s} />
                  <span className="text-1xl font-semibold">{s}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="px-6 py-4 flex gap-3 border-t border-violet-100">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl text-1xl font-medium bg-violet-50 text-[#0C0F4F] hover:bg-violet-100 transition-colors disabled:opacity-50"
          >
            cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl text-1xl font-semibold text-white bg-[#0C0F4F] hover:brightness-150 transition-all disabled:opacity-50"
          >
            {loading ? "salvando..." : "salvar"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// NoteCard (mantido igual)
// ---------------------------------------------------------------------------
interface NoteCardProps {
  note: NoteUI;
  onEdit: () => void;
  onDelete: () => void;
}

function NoteCard({ note, onEdit, onDelete }: NoteCardProps) {
  return (
    <div
      className={`rounded-2xl overflow-hidden bg-white shadow-sm transition-all duration-300 border
        ${note.status === "pendente" && "border-slate-300"}
        ${note.status === "fazendo" && "border-amber-400"}
        ${note.status === "feito" && "border-emerald-400"}
      `}
    >
      <div className={`h-0.5 w-full bg-gradient-to-r to-transparent
        ${note.status === "pendente" && "from-slate-300"}
        ${note.status === "fazendo" && "from-amber-400"}
        ${note.status === "feito" && "from-emerald-400"}
      `} />

      <div className="flex items-center justify-between px-5 pt-4 pb-3">
        <h3 className="text-2xl font-bold text-gray-800 leading-tight">{note.titulo}</h3>
        <div className="flex items-center gap-1">
          <button onClick={onEdit} className="p-1.5 rounded-lg text-violet-400 hover:bg-violet-50 transition-colors">
            <EditIcon />
          </button>
          <button onClick={onDelete} className="p-1.5 rounded-lg text-violet-400 hover:bg-red-50 hover:text-red-400 transition-colors">
            <TrashIcon />
          </button>
          <div className={`p-1 rounded-lg
            ${note.status === "pendente" && "text-slate-400"}
            ${note.status === "fazendo" && "text-amber-400"}
            ${note.status === "feito" && "text-emerald-400"}
          `}>
            <StatusIcon status={note.status} />
          </div>
        </div>
      </div>

      <div className="mx-5 h-px bg-violet-50" />
      <p className="px-5 py-4 text-xl leading-relaxed text-slate-500">
        {note.conteudo || <span className="italic opacity-50">sem conteúdo</span>}
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

// O status não vem da API — é gerenciado localmente no cliente.
// Ao carregar, todas as notas começam como "pendente".
// O status é preservado enquanto o usuário estiver na sessão.
const statusLocal: Record<number, Status> = {};

export default function NotesApp() {
  const [notes, setNotes] = useState<NoteUI[]>([]);
  const [editingNote, setEditingNote] = useState<NoteUI | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [idPasta, setIdPasta] = useState<string>("");
  const [nomePasta, setNomePasta] = useState<string>("Pasta");
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  // Lê o id_pasta do sessionStorage e carrega as notas
  useEffect(() => {
    const id = sessionStorage.getItem("id_pasta") ?? "";
    const nome = sessionStorage.getItem("titulo_pasta") ?? "Pasta";
    setIdPasta(id);
    setNomePasta(nome);

    if (!id) {
      setErro("Nenhuma pasta selecionada.");
      setCarregando(false);
      return;
    }

    carregarNotas(id);
  }, []);

  const carregarNotas = async (id: string) => {
    setCarregando(true);
    setErro("");
    try {
      const dados = await listarNotasPorPasta(id);
      setNotes(dados.map((n) => ({
        ...n,
        // Preserva status local se já existir, senão começa como "pendente"
        status: statusLocal[n.id_nota] ?? "pendente",
      })));
    } catch (e: unknown) {
      setErro(e instanceof Error ? e.message : "Erro ao carregar notas");
    } finally {
      setCarregando(false);
    }
  };

  const handleSave = async (data: { titulo: string; conteudo: string; status: Status }) => {
    if (isCreating) {
      const nova = await criarNota({ titulo: data.titulo, conteudo: data.conteudo, id_pasta: idPasta, status: data.status });
      statusLocal[nova.id_nota] = data.status;
      setNotes((prev) => [...prev, { ...nova, status: data.status }]);
    } else if (editingNote) {
      await editarNota(editingNote.id_nota, { titulo: data.titulo, conteudo: data.conteudo, status: data.status });
      statusLocal[editingNote.id_nota] = data.status;
      setNotes((prev) =>
        prev.map((n) =>
          n.id_nota === editingNote.id_nota
            ? { ...n, titulo: data.titulo, conteudo: data.conteudo, status: data.status }
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
      delete statusLocal[id];
      setNotes((prev) => prev.filter((n) => n.id_nota !== id));
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Erro ao excluir nota");
    }
  };

  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');`}</style>

      <div className="min-h-screen bg-gradient-to-br from-[#f5f2ff] via-[#ede9fe] to-[#f0fdf4]">
        <div className="fixed top-0 right-0 w-64 h-64 rounded-full pointer-events-none bg-[radial-gradient(circle,_#c4b5fd33_0%,_transparent_70%)] translate-x-1/3 -translate-y-1/3" />
        <div className="fixed bottom-0 left-0 w-48 h-48 rounded-full pointer-events-none bg-[radial-gradient(circle,_#6ee7b733_0%,_transparent_70%)] -translate-x-1/3 translate-y-1/3" />

        <div className="relative max-w-250 mx-auto px-4 py-8">

          <Link href="../staff/inicio" className="flex items-center gap-1.5 text-xl mb-6 text-[#0C0F4F] hover:gap-3 transition-all">
            <BackIcon />
            voltar ao início
          </Link>

          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-gray-900 leading-tight">{nomePasta}</h1>
            <button
              onClick={() => setIsCreating(true)}
              disabled={!idPasta || carregando}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xl font-semibold text-white bg-[#0C0F4F] shadow-lg shadow-violet-300/40 hover:brightness-105 transition-all disabled:opacity-50"
            >
              <PlusIcon />
              nova nota
            </button>
          </div>

          {/* Estados de carregamento e erro */}
          {carregando && (
            <div className="text-center py-16 rounded-2xl bg-white/50 border border-dashed border-violet-300">
              <p className="text-violet-400 animate-pulse">carregando notas...</p>
            </div>
          )}

          {!carregando && erro && (
            <div className="text-center py-16 rounded-2xl bg-red-50 border border-dashed border-red-300">
              <p className="text-red-500">{erro}</p>
            </div>
          )}

          {/* Lista de notas */}
          {!carregando && !erro && (
            <div className="space-y-4">
              {notes.length === 0 && (
                <div className="text-center py-16 rounded-2xl bg-white/50 border border-dashed border-violet-300">
                  <p className="text-violet-400">nenhuma nota ainda</p>
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

          {/* Legenda */}
          <div className="mt-8 flex items-center justify-center gap-6 py-3 rounded-xl bg-white/50 border border-violet-100">
            {[
              { cor: "bg-slate-400", label: "pendente" },
              { cor: "bg-amber-400", label: "fazendo" },
              { cor: "bg-emerald-400", label: "feito" },
            ].map(({ cor, label }) => (
              <div key={label} className="flex items-center gap-1.5">
                <div className={`w-2 h-2 rounded-full ${cor}`} />
                <span className="text-1xl text-gray-600">{label}</span>
              </div>
            ))}
          </div>

        </div>
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
