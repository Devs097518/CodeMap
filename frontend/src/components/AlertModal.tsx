"use client";

interface AlertModalProps {
  titulo: string;
  mensagem: string;
  textoBotao?: string;
  onClose: () => void;
}

export function AlertModal({
  titulo,
  mensagem,
  textoBotao = "Ok",
  onClose,
}: AlertModalProps) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-2xl px-6 py-6 w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-lg font-bold text-gray-900 mb-2">{titulo}</h2>
        <p className="text-sm text-gray-500 mb-6">{mensagem}</p>
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="bg-red-600 text-white text-sm font-bold px-4 py-2.5 rounded-xl"
          >
            {textoBotao}
          </button>
        </div>
      </div>
    </div>
  );
}