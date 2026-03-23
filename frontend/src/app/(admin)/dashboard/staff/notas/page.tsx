'use client';
import { useState } from "react";
import Link from "next/link";

type Status = "pendente" | "fazendo" | "feito";

interface Note {
  id: number;
  title: string;
  content: string;
  status: Status;
}

// ---------------------------------------------------------------------------
// Icons
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
  note: Note | null;
  isNew: boolean;
  onClose: () => void;
  onSave: (data: { title: string; content: string; status: Status }) => void;
}

function EditModal({ note, isNew, onClose, onSave }: EditModalProps) {
  const [title, setTitle] = useState(note?.title ?? "");
  const [content, setContent] = useState(note?.content ?? "");
  const [status, setStatus] = useState<Status>(note?.status ?? "pendente");

  const handleSave = () => {
    if (!title.trim()) return;
    onSave({ title, content, status });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[rgba(15,15,25,0.55)] backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-md rounded-2xl shadow-2xl overflow-hidden bg-gradient-to-br from-white to-[#f8f6ff] border border-violet-100">

        {/* Header */}
        <div className="px-6 py-4 text-center border-b border-violet-100">
          <h2 className="text-2xl font-bold text-gray-800 leading-tight">
            {isNew ? "NOVA NOTA" : "EDITAR NOTA"}
          </h2>
        </div>

        <div className="px-6 py-5 space-y-5">

          {/* Title field */}
          <div className="space-y-1.5">
            <label className="block text-xl font-medium tracking-widest uppercase text-gray-800">
              título
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Título da nota..."
              className="w-full rounded-xl px-4 py-2.5 text-1xl outline-none bg-violet-50 text-gray-800 placeholder:text-violet-300 border border-transparent focus:border-violet-400 transition-colors"
            />
          </div>

          {/* Content field */}
          <div className="space-y-1.5">
            <label className="block text-xl font-medium tracking-widest uppercase text-gray-800">
              conteúdo
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Escreva sua nota aqui..."
              rows={4}
              className="w-full rounded-xl px-4 py-2.5 text-1xl outline-none resize-none bg-violet-50 text-[#2d2540] placeholder:text-violet-300 border border-transparent focus:border-violet-400 transition-colors"
            />
          </div>

          {/* Status selector */}
          <div className="space-y-2.5">
            <label className="block text-xl font-medium tracking-widest uppercase text-gray-800">
              status
            </label>
            <div className="flex gap-2">

              <button
                onClick={() => setStatus("pendente")}
                className={`flex-1 flex flex-col items-center gap-1.5 py-2.5 rounded-xl transition-all border-2 border-transparent
                  ${status === "pendente"
                    ? "bg-slate-300 ring-2 ring-slate-300/50 text-[#1e1b2e]"
                    : "bg-slate-100 text-slate-500"
                  }`}
              >
                <StatusIcon status="pendente" />
                <span className="text-1xl font-semibold">pendente</span>
              </button>

              <button
                onClick={() => setStatus("fazendo")}
                className={`flex-1 flex flex-col items-center gap-1.5 py-2.5 rounded-xl transition-all border-2 border-transparent
                  ${status === "fazendo"
                    ? "bg-amber-400 ring-2 ring-amber-400/50 text-[#1e1b2e]"
                    : "bg-amber-100 text-slate-500"
                  }`}
              >
                <StatusIcon status="fazendo" />
                <span className="text-1xl font-semibold">fazendo</span>
              </button>

              <button
                onClick={() => setStatus("feito")}
                className={`flex-1 flex flex-col items-center gap-1.5 py-2.5 rounded-xl transition-all border-2 border-transparent
                  ${status === "feito"
                    ? "bg-emerald-400 ring-2 ring-emerald-400/50 text-[#1e1b2e]"
                    : "bg-emerald-100 text-slate-500"
                  }`}
              >
                <StatusIcon status="feito" />
                <span className="text-1xl font-semibold">feito</span>
              </button>

            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 flex gap-3 border-t border-violet-100">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-1xl font-medium bg-violet-50 text-[#0C0F4F] hover:bg-violet-100 transition-colors"
          >
            cancelar
          </button>
          <button
            onClick={handleSave}
            className="flex-1 py-2.5 rounded-xl text-1xl font-semibold text-white bg-[#0C0F4F] hover:brightness-150 transition-all"
          >
            salvar
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
  note: Note;
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
      {/* Top accent line */}
      <div
        className={`h-0.5 w-full bg-gradient-to-r to-transparent
          ${note.status === "pendente" && "from-slate-300"}
          ${note.status === "fazendo" && "from-amber-400"}
          ${note.status === "feito" && "from-emerald-400"}
        `}
      />

      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-4 pb-3">
        <h3 className="text-2xl font-bold text-gray-800 leading-tight">
          {note.title}
        </h3>
        <div className="flex items-center gap-1">
          <button
            onClick={onEdit}
            className="p-1.5 rounded-lg text-violet-400 hover:bg-violet-50 transition-colors"
            title="Editar nota"
          >
            <EditIcon />
          </button>
          <button
            onClick={onDelete}
            className="p-1.5 rounded-lg text-violet-400 hover:bg-red-50 hover:text-red-400 transition-colors"
            title="Deletar nota"
          >
            <TrashIcon />
          </button>
          <div
            className={`p-1 rounded-lg
              ${note.status === "pendente" && "text-slate-400"}
              ${note.status === "fazendo" && "text-amber-400"}
              ${note.status === "feito" && "text-emerald-400"}
            `}
            title={note.status}
          >
            <StatusIcon status={note.status} />
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="mx-5 h-px bg-violet-50" />

      {/* Content */}
      <p className="px-5 py-4 text-xl leading-relaxed text-slate-500">
        {note.content || <span className="italic opacity-50">sem conteúdo</span>}
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------
const initialNotes: Note[] = [
  {
    id: 1,
    title: "Nota 1",
    content: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s",
    status: "pendente",
  },
  {
    id: 2,
    title: "Nota 2",
    content: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s",
    status: "fazendo",
  },
  {
    id: 3,
    title: "Nota 3",
    content: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s",
    status: "feito",
  },
];

export default function NotesApp() {
  const [notes, setNotes] = useState<Note[]>(initialNotes);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [nextId, setNextId] = useState(4);

  const handleSave = (data: { title: string; content: string; status: Status }) => {
    if (isCreating) {
      setNotes((prev) => [...prev, { id: nextId, ...data }]);
      setNextId((n) => n + 1);
    } else if (editingNote) {
      setNotes((prev) =>
        prev.map((n) => (n.id === editingNote.id ? { ...n, ...data } : n))
      );
    }
    setEditingNote(null);
    setIsCreating(false);
  };

  const handleDelete = (id: number) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <>
      {/* Google Fonts */}
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');`}</style>

      <div className="min-h-screen bg-gradient-to-br from-[#f5f2ff] via-[#ede9fe] to-[#f0fdf4]">

        {/* Decorative blobs */}
        <div className="fixed top-0 right-0 w-64 h-64 rounded-full pointer-events-none bg-[radial-gradient(circle,_#c4b5fd33_0%,_transparent_70%)] translate-x-1/3 -translate-y-1/3" />
        <div className="fixed bottom-0 left-0 w-48 h-48 rounded-full pointer-events-none bg-[radial-gradient(circle,_#6ee7b733_0%,_transparent_70%)] -translate-x-1/3 translate-y-1/3" />

        <div className="relative max-w-250 mx-auto px-4 py-8">

          {/* Back nav */}
          <Link
            href={'../staff/inicio'}
            className="flex items-center gap-1.5 text-xl mb-6 text-[#0C0F4F] hover:gap-3 transition-all">
            <BackIcon />
            voltar ao início
          </Link>

          {/* Folder title + new note button */}
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-gray-900 leading-tight">
              Pasta 1
            </h1>
            <button
              onClick={() => setIsCreating(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xl font-semibold text-white bg-[#0C0F4F] shadow-lg shadow-violet-300/40 hover:brightness-105 transition-all"
            >
              <PlusIcon />
              nova nota
            </button>
          </div>

          {/* Notes list */}
          <div className="space-y-4">
            {notes.length === 0 && (
              <div className="text-center py-16 rounded-2xl bg-white/50 border border-dashed border-violet-300">
                <p className="text-[0.85rem] text-violet-400">nenhuma nota ainda</p>
              </div>
            )}
            {notes.map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                onEdit={() => setEditingNote(note)}
                onDelete={() => handleDelete(note.id)}
              />
            ))}
          </div>

          {/* Status legend */}
          <div className="mt-8 flex items-center justify-center gap-6 py-3 rounded-xl bg-white/50 border border-violet-100">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-slate-400" />
              <span className="text-1xl text-gray-600">pendente</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-amber-400" />
              <span className="text-1xl text-gray-600">fazendo</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="text-1xl text-gray-600">feito</span>
            </div>
          </div>

        </div>
      </div>

      {/* Modal */}
      {(isCreating || editingNote) && (
        <EditModal
          note={editingNote}
          isNew={isCreating}
          onClose={() => {
            setEditingNote(null);
            setIsCreating(false);
          }}
          onSave={handleSave}
        />
      )}
    </>
  );
}


// "use client";

// import { useState, useRef, useEffect, useCallback } from "react";
// import Link from "next/link";
// import { useRouter } from 'next/navigation';
// import {
//   listarNotasPorUsuario,
//   criarNota,
//   editarNota,
//   excluirNota,
// } from '../../../../../service/conteudo-service';

// interface Note {
//   id: number;
//   title: string;
//   content: string;
// }

// export default function NotesPage() {
//   const [notes, setNotes] = useState<Note[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [actionLoading, setActionLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);

//   const [newTitle, setNewTitle] = useState("");
//   const [newContent, setNewContent] = useState("");
//   const [openMenuId, setOpenMenuId] = useState<number | null>(null);
//   const [editingNote, setEditingNote] = useState<Note | null>(null);

//   const router = useRouter();
//   const [username, setUsername] = useState<string | null>(null);
//   const [userId, setUserId] = useState<string | null>(null);

//   // Lê sessionStorage apenas no cliente
//   useEffect(() => {
//     const name = sessionStorage.getItem('username');
//     const id = sessionStorage.getItem('id_usuario');
//     if (!id) {
//       router.push('../');
//       return;
//     }
//     setUsername(name);
//     setUserId(id);
//   }, [router]);

//   // Carrega notas do banco após ter o userId
//   const carregarNotas = useCallback(async () => {
//     if (!userId) return;
//     setLoading(true);
//     setError(null);
//     try {
//       const data = await listarNotasPorUsuario(userId);
//       // Mapeia campos da API (titulo/conteudo) para o padrão da interface (title/content)
//       const mapped: Note[] = data.map((n: any) => ({
//         id: n.id_nota,
//         title: n.titulo ?? n.title ?? '',
//         content: n.conteudo ?? n.content ?? '',
//       }));
//       setNotes(mapped);
//     } catch (err) {
//       setError(err instanceof Error ? err.message : "Erro ao carregar notas");
//     } finally {
//       setLoading(false);
//     }
//   }, [userId]);

//   useEffect(() => {
//     carregarNotas();
//   }, [carregarNotas]);

//   async function handleCreate() {
//     if (!newTitle.trim() && !newContent.trim()) return;
//     if (!userId) return;
//     setActionLoading(true);
//     setError(null);
//     try {
//       const nova = await criarNota({
//         titulo: newTitle.trim() || "Sem título",
//         conteudo: newContent.trim(),
//         id_usuario: userId,
//       });
//       console.log(nova);
//       setNotes((prev) => [
//         ...prev,
//         { id: nova.id, title: nova.titulo, content: nova.conteudo },
//       ]);
//       setNewTitle("");
//       setNewContent("");
//     } catch (err) {
//       setError(err instanceof Error ? err.message : "Erro ao criar nota");
//     } finally {
//       setActionLoading(false);
//     }
//   }

//   async function handleDelete(id: number) {
//     setOpenMenuId(null);
//     setActionLoading(true);
//     setError(null);
//     try {
//       await excluirNota(id);
//       setNotes((prev) => prev.filter((n) => n.id !== id));
//     } catch (err) {
//       setError(err instanceof Error ? err.message : "Erro ao excluir nota");
//     } finally {
//       setActionLoading(false);
//     }
//   }

//   function handleEditOpen(note: Note) {
//     setEditingNote({ ...note });
//     setOpenMenuId(null);
//   }

//   async function handleEditSave() {
//     if (!editingNote) return;
//     setActionLoading(true);
//     setError(null);
//     try {
//       await editarNota(editingNote.id, {
//         conteudo: editingNote.content,
//         titulo: editingNote.title,
//       });
//       setNotes((prev) =>
//         prev.map((n) => (n.id === editingNote.id ? editingNote : n))
//       );
//       setEditingNote(null);
//     } catch (err) {
//       setError(err instanceof Error ? err.message : "Erro ao editar nota");
//     } finally {
//       setActionLoading(false);
//     }
//   }

//   const handleLogout = () => {
//     sessionStorage.clear();
//     router.push('../');
//   };

//   return (
//     <div className="min-h-screen bg-white flex flex-col">

//       {/* Content */}
//       <main className="flex-1 px-8 py-8 ml-28 max-w-2xl">
//         {/* Greeting */}
//         <div className="mb-8">
//           <h1 className="text-4xl font-bold text-gray-800">Olá, {username}!</h1>
//           <p className="text-1xl text-gray-500">continue as suas notas</p>
//         </div>

//         {/* Feedback de erro */}
//         {error && (
//           <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm flex items-center justify-between">
//             <span>{error}</span>
//             <button onClick={() => setError(null)} className="ml-4 font-bold">✕</button>
//           </div>
//         )}

//         {/* Create note */}
//         <section className="mb-8">
//           <h2 className="text-2xl font-semibold text-[#1e2060] mb-3">
//             Crie uma nova nota
//           </h2>
//           <div className="bg-[#faf87a] rounded-2xl p-4 flex flex-col gap-2 max-w-sm">
//             <input
//               type="text"
//               placeholder="Título"
//               value={newTitle}
//               onChange={(e) => setNewTitle(e.target.value)}
//               className="bg-transparent text-gray-700 font-semibold text-2xl outline-none placeholder-gray-600"
//             />
//             <textarea
//               placeholder="escreva sua nota aqui ..."
//               value={newContent}
//               onChange={(e) => setNewContent(e.target.value)}
//               rows={3}
//               className="bg-transparent text-gray-600 text-1xl outline-none resize-none placeholder-gray-500"
//             />
//             <div>
//               <button
//                 onClick={handleCreate}
//                 disabled={actionLoading}
//                 className="bg-[#1e2060] hover:bg-[#2d2f6e] active:scale-95 disabled:opacity-50 text-white text-1xl font-medium px-4 py-1.5 rounded-full transition-all"
//               >
//                 {actionLoading ? "salvando..." : "criar"}
//               </button>
//             </div>
//           </div>
//         </section>

//         {/* Saved notes */}
//         <section>
//           <h2 className="text-2xl font-semibold text-[#1e2060] mb-3">
//             Notas salvas
//           </h2>

//           {loading ? (
//             <p className="text-sm text-gray-400">Carregando notas...</p>
//           ) : notes.length === 0 ? (
//             <p className="text-sm text-gray-400">Nenhuma nota salva ainda.</p>
//           ) : (

//             <div className="flex flex-col gap-3">
//               {notes.map((note) => (
//                 <div
//                   key={note.id}
//                   className="bg-[#e8e8e8] rounded-2xl px-4 py-3 max-w-sm relative"
//                 >
//                   <div className="flex justify-between items-start">
//                     <div className="flex-1 pr-6">
//                       <p className="text-2xl font-semibold text-gray-700 mb-1">
//                         {note.title}
//                       </p>
//                       <p className="text-1xl text-gray-600 leading-snug">
//                         {note.content}
//                       </p>
//                     </div>

//                     {/* Three dots button */}
//                     <div className="relative">
//                       <button
//                         onClick={(e) => {
//                           e.stopPropagation();
//                           setOpenMenuId(openMenuId === note.id ? null : note.id);
//                         }}
//                         className="text-gray-500 hover:text-gray-400 transition-colors p-1 rounded-full hover:bg-gray-300"
//                       >
//                         <DotsIcon />
//                       </button>

//                       {openMenuId === note.id && (
//                         <>
//                           {/* Overlay invisível para fechar ao clicar fora */}
//                           <div
//                             className="fixed inset-0 z-[5]"
//                             onClick={() => setOpenMenuId(null)}
//                           />
//                           {/* Dropdown */}
//                           <div className="absolute right-0 top-7 bg-white rounded-xl shadow-lg overflow-hidden z-10 w-28 border border-gray-100">
//                             <button
//                               onClick={() => handleEditOpen(note)}
//                               className="w-full text-left px-4 py-2.5 text-1xl text-gray-700 hover:bg-gray-50 transition-colors"
//                             >
//                               Editar
//                             </button>
//                             <button
//                               onClick={() => handleDelete(note.id)}
//                               disabled={actionLoading}
//                               className="w-full text-left px-4 py-2.5 text-1xl text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
//                             >
//                               Excluir
//                             </button>
//                           </div>
//                         </>
//                       )}
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}
//         </section>
//       </main>

//       {/* Edit Modal */}
//       {editingNote && (
//         <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 px-4">
//           <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm flex flex-col gap-4">
//             <h3 className="text-base font-semibold text-[#1e2060]">
//               Editar nota
//             </h3>
//             <input
//               type="text"
//               value={editingNote.title}
//               onChange={(e) =>
//                 setEditingNote({ ...editingNote, title: e.target.value })
//               }
//               className="border text-black border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#2d2f6e] focus:ring-2 focus:ring-[#2d2f6e]/10 transition-all"
//               placeholder="Título"
//             />
//             <textarea
//               value={editingNote.content}
//               onChange={(e) =>
//                 setEditingNote({ ...editingNote, content: e.target.value })
//               }
//               rows={4}
//               className="border text-black border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#2d2f6e] focus:ring-2 focus:ring-[#2d2f6e]/10 transition-all resize-none"
//               placeholder="Conteúdo"
//             />
//             <div className="flex gap-2 justify-end">
//               <button
//                 onClick={() => setEditingNote(null)}
//                 className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
//               >
//                 cancelar
//               </button>
//               <button
//                 onClick={handleEditSave}
//                 disabled={actionLoading}
//                 className="bg-[#1e2060] hover:bg-[#2d2f6e] disabled:opacity-50 text-white text-sm px-5 py-2 rounded-full transition-all"
//               >
//                 {actionLoading ? "salvando..." : "salvar"}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// // --- Icons ---

// function UserCircleIcon() {
//   return (
//     <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
//       <circle cx="12" cy="12" r="10" />
//       <circle cx="12" cy="9" r="3" />
//       <path d="M6.168 18.849A4 4 0 0 1 10 16h4a4 4 0 0 1 3.832 2.849" />
//     </svg>
//   );
// }

// function LogoutIcon() {
//   return (
//     <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
//       <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
//       <polyline points="16 17 21 12 16 7" />
//       <line x1="21" y1="12" x2="9" y2="12" />
//     </svg>
//   );
// }

// function DotsIcon() {
//   return (
//     <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
//       <circle cx="12" cy="5" r="1.5" />
//       <circle cx="12" cy="12" r="1.5" />
//       <circle cx="12" cy="19" r="1.5" />
//     </svg>
//   );
// }
