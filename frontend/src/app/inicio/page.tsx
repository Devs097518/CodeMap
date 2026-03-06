"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from 'next/navigation';

interface Note {
  id: number;
  title: string;
  content: string;
}

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([
    {
      id: 1,
      title: "Título",
      content:
        "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500",
    },
  ]);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Fecha o menu ao clicar fora
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenuId(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleCreate() {
    if (!newTitle.trim() && !newContent.trim()) return;
    setNotes((prev) => [
      ...prev,
      { id: Date.now(), title: newTitle || "Sem título", content: newContent },
    ]);
    setNewTitle("");
    setNewContent("");
  }

  function handleDelete(id: number) {
    setNotes((prev) => prev.filter((n) => n.id !== id));
    setOpenMenuId(null);
  }

  function handleEditOpen(note: Note) {
    setEditingNote({ ...note });
    setOpenMenuId(null);
  }

  function handleEditSave() {
    if (!editingNote) return;
    setNotes((prev) =>
      prev.map((n) => (n.id === editingNote.id ? editingNote : n))
    );
    setEditingNote(null);
  }

  const handleLogout = () => {
    console.log('Sessão encerrada');
    sessionStorage.clear();
    router.push('../');
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">

      {/* NAVBAR */}
      <nav className="w-full px-8 py-4 flex items-center justify-between text-white bg-[#0C0F4F]">
        {/* Logo */}
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

        {/* Links */}
        <ul className="flex items-center gap-20 text-sm font-medium text-white/80">


          <li><Link href="#" className="hover:text-white transition-colors text-2xl">
            <div className="flex items-center gap-3">
              <UserCircleIcon />
              <span>Deyv</span>
            </div>
          </Link></li>


          <li><Link href="../" className="hover:text-white transition-colors text-2xl">
            <div className="flex items-center gap-3">
              <button onClick={handleLogout}>
                <LogoutIcon />
              </button>
            </div>
          </Link></li>


        </ul>
      </nav>






      {/* Content */}
      <main className="flex-1 px-8 py-8 ml-28 max-w-2xl">
        {/* Greeting */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800">Olá, Deyv!</h1>
          <p className="text-1xl text-gray-500">continue as suas notas</p>
        </div>

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
                className="bg-[#1e2060] hover:bg-[#2d2f6e] active:scale-95 text-white text-1xl font-medium px-4 py-1.5 rounded-full transition-all"
              >
                criar
              </button>
            </div>
          </div>
        </section>

        {/* Saved notes */}
        <section>
          <h2 className="text-2xl font-semibold text-[#1e2060] mb-3">
            Notas salvas
          </h2>
          {notes.length === 0 ? (
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
                    <div className="relative" ref={openMenuId === note.id ? menuRef : null}>
                      <button
                        onClick={() =>
                          setOpenMenuId(openMenuId === note.id ? null : note.id)
                        }
                        className="text-gray-500 hover:text-gray-400 transition-colors p-1 rounded-full hover:bg-gray-300"
                      >
                        <DotsIcon />
                      </button>

                      {/* Dropdown menu */}
                      {openMenuId === note.id && (
                        <div className="absolute right-0 top-7 bg-white rounded-xl shadow-lg overflow-hidden z-10 w-28 border border-gray-100">
                          <button
                            onClick={() => handleEditOpen(note)}
                            className="w-full text-left px-4 py-2.5 text-1xl text-gray-700 hover:bg-gray-50 transition-colors"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleDelete(note.id)}
                            className="w-full text-left px-4 py-2.5 text-1xl text-red-500 hover:bg-red-50 transition-colors"
                          >
                            Excluir
                          </button>
                        </div>
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
                className="bg-[#1e2060] hover:bg-[#2d2f6e] text-white text-sm px-5 py-2 rounded-full transition-all"
              >
                salvar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// --- Icons ---

function CompassIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 52 52" fill="none">
      <defs>
        <radialGradient id="og" cx="50%" cy="30%" r="60%">
          <stop offset="0%" stopColor="#c8c4a0" />
          <stop offset="100%" stopColor="#7a7a8a" />
        </radialGradient>
        <radialGradient id="ig" cx="40%" cy="35%" r="60%">
          <stop offset="0%" stopColor="#5a5870" />
          <stop offset="100%" stopColor="#2a2840" />
        </radialGradient>
      </defs>
      <circle cx="26" cy="26" r="25" fill="url(#og)" />
      <circle cx="26" cy="26" r="18" fill="url(#ig)" />
      <ellipse cx="26" cy="20" rx="3" ry="7" fill="white" opacity="0.85" transform="rotate(-20 26 26)" />
      <ellipse cx="26" cy="32" rx="2.5" ry="5" fill="#888" opacity="0.5" transform="rotate(-20 26 26)" />
      <circle cx="26" cy="26" r="2" fill="white" opacity="0.9" />
    </svg>
  );
}

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

// 'use client';

// import React, { useState, useEffect } from 'react';
// import { SalvarNota, obterConteudoPorID } from '../../service/conteudo-service';

// export default function NotesScreen() {
//   let id_usuario = sessionStorage.getItem('idUsuario');
//   const [conteudo, setConteudo] = useState('');      // ← o que o usuário digita
//   const [savedNote, setSavedNote] = useState('');    // ← o que veio do banco

//   useEffect(() => {
//     if (typeof window === 'undefined') return;

//     const id_usuario = sessionStorage.getItem('idUsuario');

//     if (id_usuario) {
//       obterConteudoPorID(id_usuario)
//         .then((conteudoNota) => {
//           setSavedNote(String(conteudoNota));  // ← só atualiza o que veio do banco
//         })
//         .catch((err) => console.error(err));
//     }
//   }, []);

//   const handleSave = () => {
//     if (!conteudo || !id_usuario) {
//       console.log('Preencha todos os campos');
//       return;
//     }

//     try {
//       SalvarNota({
//         conteudo: conteudo,
//         id_usuario: id_usuario,
//       });
//       setConteudo("");
//     }
//     catch (error: any) {
//       console.log(error);
//     }

//     setSavedNote(conteudo);
//   };

//   const handleLogout = () => {
//     console.log('Sessão encerrada');
//     sessionStorage.clear();
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-b from-blue-200 to-blue-300 p-4">
//       <div className="max-w-2xl mx-auto pt-8">
//         <div className="flex justify-end mb-4">
//           <a href="../">
//             <button
//               onClick={handleLogout}
//               className="bg-white hover:bg-gray-100 text-gray-800 font-medium py-2 px-4 rounded-lg shadow transition-colors"
//             >
//               encerrar sessão
//             </button>
//           </a>

//         </div>

//         <div className="bg-white rounded-lg shadow-lg p-6 mb-4">
//           <p className="text-sm text-gray-400 mb-4">
//             o texto que você salvar vai ficar aqui
//           </p>
//           <div className="min-h-[200px] text-gray-800">
//             {savedNote}
//           </div>
//         </div>

//         <div className="flex gap-2">
//           <input
//             type="text"
//             value={conteudo}
//             onChange={(e) => setConteudo(e.target.value)}
//             placeholder=""
//             className="flex-1 px-4 py-2 border bg-white text-black border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//           />

//           <button
//             onClick={handleSave}
//             className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-md transition-colors"
//           >
//             SALVAR
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }