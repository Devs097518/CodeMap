"use client";

import { useState } from "react";

interface EditModalProps {
  titulo: string;
  valorInicial: string;
  label?: string;
  textoConfirmar?: string;
  textoConfirmando?: string;
  textoCancelar?: string;
  onCancel: () => void;
  onConfirm: (novoValor: string) => Promise<void> | void;
}

export function EditModal({
  titulo,
  valorInicial,
  label,
  textoConfirmar = "Salvar",
  textoConfirmando = "Salvando...",
  textoCancelar = "Cancelar",
  onCancel,
  onConfirm,
}: EditModalProps) {
  const [valor, setValor] = useState(valorInicial);
  const [salvando, setSalvando] = useState(false);

  const handleConfirmar = async () => {
    if (!valor.trim()) return;
    setSalvando(true);
    await onConfirm(valor);
    setSalvando(false);
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={onCancel}>
      <div className="bg-white rounded-2xl px-6 py-6 w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-lg font-bold text-gray-900 mb-4">{titulo}</h2>

        {label && <label className="text-sm text-gray-600 font-medium mb-1 block">{label}</label>}
        <input
          type="text"
          value={valor}
          onChange={(e) => setValor(e.target.value)}
          autoFocus
          className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-[#2d2f6e] focus:ring-2 focus:ring-[#2d2f6e]/10 transition-all bg-white mb-6"
        />

        <div className="flex justify-end gap-3">
          <button onClick={onCancel} className="text-sm text-gray-500 px-4 py-2">
            {textoCancelar}
          </button>
          <button
            onClick={handleConfirmar}
            disabled={salvando || !valor.trim()}
            className="bg-[#2d2f6e] text-white text-sm font-bold px-4 py-2.5 rounded-xl disabled:opacity-50"
          >
            {salvando ? textoConfirmando : textoConfirmar}
          </button>
        </div>
      </div>
    </div>
  );
}