"use client";

import { useState } from "react";

interface ConfirmModalProps {
  titulo: string;
  mensagem: string;
  textoConfirmar?: string;
  textoConfirmando?: string;
  onCancel: () => void;
  onConfirm: () => void;
}

export function ConfirmModal({
  titulo,
  mensagem,
  textoConfirmar = "Confirmar",
  textoConfirmando = "Salvando...",
  onCancel,
  onConfirm,
}: ConfirmModalProps) {
  const [confirmando, setConfirmando] = useState(false);

  const handleConfirmar = async () => {
    setConfirmando(true);
    await onConfirm();
    setConfirmando(false);
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={onCancel}>
      <div className="bg-white rounded-2xl px-6 py-6 w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-lg font-bold text-gray-900 mb-2">{titulo}</h2>
        <p className="text-sm text-gray-500 mb-6">{mensagem}</p>
        <div className="flex justify-end gap-3">
          <button onClick={onCancel} className="text-sm text-gray-500 px-4 py-2">
            Cancelar
          </button>
          <button
            onClick={handleConfirmar}
            disabled={confirmando}
            className="bg-red-600 text-white text-sm font-bold px-4 py-2.5 rounded-xl disabled:opacity-50"
          >
            {confirmando ? textoConfirmando : textoConfirmar}
          </button>
        </div>
      </div>
    </div>
  );
}