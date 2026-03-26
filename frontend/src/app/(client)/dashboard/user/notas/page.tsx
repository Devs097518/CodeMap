"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from 'next/navigation';
import {
  listarNotasPorUsuario,
  criarNota,
  editarNota,
  excluirNota,
} from '../../../../../service/conteudo-service';

interface Note {
  id: number;
  title: string;
  content: string;
}

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [editingNote, setEditingNote] = useState<Note | null>(null);

  const router = useRouter();
  const [username, setUsername] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  // Lê sessionStorage apenas no cliente
  useEffect(() => {
    const name = sessionStorage.getItem('username');
    const id = sessionStorage.getItem('id_usuario');
    if (!id) {
      router.push('../');
      return;
    }
    setUsername(name);
    setUserId(id);
  }, [router]);

  // Carrega notas do banco após ter o userId
  const carregarNotas = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await listarNotasPorUsuario(userId);
      // Mapeia campos da API (titulo/conteudo) para o padrão da interface (title/content)
      const mapped: Note[] = data.map((n: any) => ({
        id: n.id_nota,
        title: n.titulo ?? n.title ?? '',
        content: n.conteudo ?? n.content ?? '',
      }));
      setNotes(mapped);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar notas");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    carregarNotas();
  }, [carregarNotas]);

  async function handleCreate() {
    if (!newTitle.trim() && !newContent.trim()) return;
    if (!userId) return;
    setActionLoading(true);
    setError(null);
    try {
      const nova = await criarNota({
        titulo: newTitle.trim() || "Sem título",
        conteudo: newContent.trim(),
        id_usuario: userId,
      });
      console.log(nova);
      setNotes((prev) => [
        ...prev,
        { id: nova.id, title: nova.titulo, content: nova.conteudo },
      ]);
      setNewTitle("");
      setNewContent("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao criar nota");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleDelete(id: number) {
    setOpenMenuId(null);
    setActionLoading(true);
    setError(null);
    try {
      await excluirNota(id);
      setNotes((prev) => prev.filter((n) => n.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao excluir nota");
    } finally {
      setActionLoading(false);
    }
  }

  function handleEditOpen(note: Note) {
    setEditingNote({ ...note });
    setOpenMenuId(null);
  }

  async function handleEditSave() {
    if (!editingNote) return;
    setActionLoading(true);
    setError(null);
    try {
      await editarNota(editingNote.id, {
        conteudo: editingNote.content,
        titulo: editingNote.title,
      });
      setNotes((prev) =>
        prev.map((n) => (n.id === editingNote.id ? editingNote : n))
      );
      setEditingNote(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao editar nota");
    } finally {
      setActionLoading(false);
    }
  }

  const handleLogout = () => {
    sessionStorage.clear();
    router.push('../');
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">

      {/* NAVBAR */}
      <nav className="w-full px-8 py-4 flex items-center justify-between text-white bg-[#0C0F4F]">
        <Link href="/" className="flex items-center gap-2 font-bold text-base">
          <img
            src="/imagens/CodeMap_Icone.png"
            alt="Mapa de tesouro"
            width={40}
            height={40}
            className="rounded-4xl"
          />
          <h1 className='text-4xl'>CodeMap</h1>
        </Link>

        <ul className="flex items-center gap-20 text-sm font-medium text-white/80">
          <li>
            <Link href="#" className="hover:text-white transition-colors text-2xl">
              <div className="flex items-center gap-3">
                <UserCircleIcon />
                <span>{username}</span>
              </div>
            </Link>
          </li>
          <li>
            <Link href="../" className="hover:text-white transition-colors text-2xl">
              <div className="flex items-center gap-3">
                <button onClick={handleLogout}>
                  <LogoutIcon />
                </button>
              </div>
            </Link>
          </li>
        </ul>
      </nav>

      {/* Content */}
      <main className="flex-1 px-8 py-8 ml-28 max-w-2xl">
        {/* Greeting */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800">Olá, {username}!</h1>
          <p className="text-1xl text-gray-500">continue as suas notas</p>
        </div>

        {/* Feedback de erro */}
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => setError(null)} className="ml-4 font-bold">✕</button>
          </div>
        )}

        {/* Create note */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-[#1e2060] mb-3">
            Crie uma nova nota
          </h2>
          <div className="bg-[#faf87a] rounded-2xl p-4 flex flex-col gap-2 max-w-sm">
            <input
              type="text"
              placeholder="Título"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="bg-transparent text-gray-700 font-semibold text-2xl outline-none placeholder-gray-600"
            />
            <textarea
              placeholder="escreva sua nota aqui ..."
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              rows={3}
              className="bg-transparent text-gray-600 text-1xl outline-none resize-none placeholder-gray-500"
            />
            <div>
              <button
                onClick={handleCreate}
                disabled={actionLoading}
                className="bg-[#1e2060] hover:bg-[#2d2f6e] active:scale-95 disabled:opacity-50 text-white text-1xl font-medium px-4 py-1.5 rounded-full transition-all"
              >
                {actionLoading ? "salvando..." : "criar"}
              </button>
            </div>
          </div>
        </section>

        {/* Saved notes */}
        <section>
          <h2 className="text-2xl font-semibold text-[#1e2060] mb-3">
            Notas salvas
          </h2>

          {loading ? (
            <p className="text-sm text-gray-400">Carregando notas...</p>
          ) : notes.length === 0 ? (
            <p className="text-sm text-gray-400">Nenhuma nota salva ainda.</p>
          ) : (

            <div className="flex flex-col gap-3">
              {notes.map((note) => (
                <div
                  key={note.id}
                  className="bg-[#e8e8e8] rounded-2xl px-4 py-3 max-w-sm relative"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1 pr-6">
                      <p className="text-2xl font-semibold text-gray-700 mb-1">
                        {note.title}
                      </p>
                      <p className="text-1xl text-gray-600 leading-snug">
                        {note.content}
                      </p>
                    </div>

                    {/* Three dots button */}
                    <div className="relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenMenuId(openMenuId === note.id ? null : note.id);
                        }}
                        className="text-gray-500 hover:text-gray-400 transition-colors p-1 rounded-full hover:bg-gray-300"
                      >
                        <DotsIcon />
                      </button>

                      {openMenuId === note.id && (
                        <>
                          {/* Overlay invisível para fechar ao clicar fora */}
                          <div
                            className="fixed inset-0 z-[5]"
                            onClick={() => setOpenMenuId(null)}
                          />
                          {/* Dropdown */}
                          <div className="absolute right-0 top-7 bg-white rounded-xl shadow-lg overflow-hidden z-10 w-28 border border-gray-100">
                            <button
                              onClick={() => handleEditOpen(note)}
                              className="w-full text-left px-4 py-2.5 text-1xl text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                              Editar
                            </button>
                            <button
                              onClick={() => handleDelete(note.id)}
                              disabled={actionLoading}
                              className="w-full text-left px-4 py-2.5 text-1xl text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
                            >
                              Excluir
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Edit Modal */}
      {editingNote && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm flex flex-col gap-4">
            <h3 className="text-base font-semibold text-[#1e2060]">
              Editar nota
            </h3>
            <input
              type="text"
              value={editingNote.title}
              onChange={(e) =>
                setEditingNote({ ...editingNote, title: e.target.value })
              }
              className="border text-black border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#2d2f6e] focus:ring-2 focus:ring-[#2d2f6e]/10 transition-all"
              placeholder="Título"
            />
            <textarea
              value={editingNote.content}
              onChange={(e) =>
                setEditingNote({ ...editingNote, content: e.target.value })
              }
              rows={4}
              className="border text-black border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#2d2f6e] focus:ring-2 focus:ring-[#2d2f6e]/10 transition-all resize-none"
              placeholder="Conteúdo"
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setEditingNote(null)}
                className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                cancelar
              </button>
              <button
                onClick={handleEditSave}
                disabled={actionLoading}
                className="bg-[#1e2060] hover:bg-[#2d2f6e] disabled:opacity-50 text-white text-sm px-5 py-2 rounded-full transition-all"
              >
                {actionLoading ? "salvando..." : "salvar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// --- Icons ---

function UserCircleIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="9" r="3" />
      <path d="M6.168 18.849A4 4 0 0 1 10 16h4a4 4 0 0 1 3.832 2.849" />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}

function DotsIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <circle cx="12" cy="5" r="1.5" />
      <circle cx="12" cy="12" r="1.5" />
      <circle cx="12" cy="19" r="1.5" />
    </svg>
  );
}
