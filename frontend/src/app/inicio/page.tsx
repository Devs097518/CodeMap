'use client';

import React, { useState } from 'react';

export default function NotesScreen() {
  const [noteText, setNoteText] = useState('');
  const [savedNote, setSavedNote] = useState('');

  const handleSave = () => {
    setSavedNote(noteText);
    setNoteText('');
  };

  const handleLogout = () => {
    console.log('Sessão encerrada');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-200 to-blue-300 p-4">
      <div className="max-w-2xl mx-auto pt-8">
        <div className="flex justify-end mb-4">
          <a href="../">
            <button
              onClick={handleLogout}
              className="bg-white hover:bg-gray-100 text-gray-800 font-medium py-2 px-4 rounded-lg shadow transition-colors"
            >
              encerrar sessão
            </button>
          </a>

        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-4">
          <p className="text-sm text-gray-400 mb-4">
            o texto que você salvar vai ficar aqui
          </p>
          <div className="min-h-[200px] text-gray-800">
            {savedNote}
          </div>
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            placeholder=""
            className="flex-1 px-4 py-2 border bg-white text-black border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <button
            onClick={handleSave}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-md transition-colors"
          >
            SALVAR
          </button>
        </div>
      </div>
    </div>
  );
}