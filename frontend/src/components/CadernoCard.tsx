'use client';

interface CadernoCardProps {
  titulo: string;
  cor: string;
  onOpen: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

const EditIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="#292929" strokeWidth={1.8} className="w-5 h-5">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const TrashIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="#292929" strokeWidth={1.8} className="w-5 h-5">
    <polyline points="3 6 5 6 21 6" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6M10 11v6M14 11v6M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// Escurece uma cor hex (#rrggbb) em `fator` (0 a 1), usada na camada de trás do caderno
function escurecer(hex: string, fator: number) {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.max(0, Math.floor((num >> 16) * (1 - fator)));
  const g = Math.max(0, Math.floor(((num >> 8) & 0xff) * (1 - fator)));
  const b = Math.max(0, Math.floor((num & 0xff) * (1 - fator)));
  return `rgb(${r}, ${g}, ${b})`;
}

export function CadernoCard({ titulo, cor, onOpen, onEdit, onDelete }: CadernoCardProps) {
  const escura = escurecer(cor, 0.28);
  const numAneis = 11;
  const topoAneis = 32;
  const baseAneis = 268;
  const raioAnel = 9;
  const xEspiral = 26; // coincide com a borda esquerda da capa

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        onClick={onOpen}
        className="group relative w-full aspect-[4/5] cursor-pointer"
      >
        <svg
          viewBox="0 0 240 300"
          className="absolute inset-0 w-full h-full overflow-visible drop-shadow-lg group-hover:drop-shadow-2xl transition-all duration-200"
        >
          {/* Contracapa (profundidade) */}
          <rect x="34" y="10" width="190" height="284" rx="18" fill={escura} />

          {/* Folhas internas — desenhadas ANTES da capa, só uma fatia aparece pela lateral */}
          <g>
            <rect x="40" y="12" width="180" height="278" rx="15" fill="#f7f2e4" />
            {Array.from({ length: 14 }).map((_, i) => (
              <line
                key={i}
                x1="198"
                x2="205"
                y1={26 + i * 17.5}
                y2={26 + i * 17.5}
                stroke="#d9d0ba"
                strokeWidth="2"
              />
            ))}
          </g>

          {/* Capa — cobre a maior parte das folhas, deixando só a fatia da direita visível */}
          <rect x="26" y="4" width="190" height="284" rx="18" fill={cor} />

          {/* Brilho diagonal sutil */}
          <path d="M78 4 H130 L58 288 H14 Z" fill="white" opacity="0.06" />

          {/* Espiral — meia-lua aberta, miolo transparente, encaixada na borda esquerda da capa */}
          {Array.from({ length: numAneis }).map((_, i) => {
            const cy = topoAneis + i * ((baseAneis - topoAneis) / (numAneis - 1));
            return (
              <path
                key={i}
                d={`M${xEspiral} ${cy - raioAnel} A ${raioAnel} ${raioAnel} 0 0 0 ${xEspiral} ${cy + raioAnel}`}
                fill="none"
                stroke="#161616"
                strokeWidth="3"
                strokeLinecap="round"
              />
            );
          })}
        </svg>

        {/* Título na capa */}
        <div className="absolute inset-0 flex items-center justify-center pl-10 pr-10">
          <span className="text-lg font-semibold text-white text-center break-words line-clamp-4 drop-shadow-sm">
            {titulo}
          </span>
        </div>
      </button>

      {/* Ações */}
      <div className="flex gap-3">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit();
          }}
          className="text-[#3b82f6] hover:text-[#2563eb] transition-colors"
        >
          <EditIcon />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="text-red-500 hover:text-red-600 transition-colors"
        >
          <TrashIcon />
        </button>
      </div>
    </div>
  );
}