'use client';

import { useEffect, useRef, useState } from 'react';
import { LIMITE_PAGINAS_POR_CADERNO } from '@/constants/caderno';

interface CadernoCardProps {
  titulo: string;
  cor: string; // #rrggbb — usada no quadrado do ícone e na faixa lateral
  onOpen: () => void;
  onEdit: () => void;
  onDelete: () => void;
  paginas?: number; // páginas já usadas do caderno (máximo: LIMITE_PAGINAS_POR_CADERNO)
  ultimaAlteracao?: string; // ex.: "ontem"
  etiqueta?: string; // ex.: "Iniciante", "Estudos"
}

const EditIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-4 h-4">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const TrashIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-4 h-4">
    <polyline points="3 6 5 6 21 6" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6M10 11v6M14 11v6M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const DotsIcon = () => (
  <svg viewBox="0 0 24 24" fill="#475569" className="w-5 h-5">
    <circle cx="5" cy="12" r="1.8" />
    <circle cx="12" cy="12" r="1.8" />
    <circle cx="19" cy="12" r="1.8" />
  </svg>
);

const ArrowIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
    <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// Pasta com </> em branco, para ficar sobre o quadrado colorido (igual aos ícones dos roadmaps)
const PastaIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-6 h-6 text-white" aria-hidden="true">
    <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M10 11l-2 2 2 2M14 11l2 2-2 2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export function CadernoCard({
  titulo,
  cor,
  onOpen,
  onEdit,
  onDelete,
  paginas = 0,
  ultimaAlteracao,
  etiqueta,
}: CadernoCardProps) {
  const [menuAberto, setMenuAberto] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Fecha o menu ao clicar fora ou apertar Esc
  useEffect(() => {
    if (!menuAberto) return;
    const aoClicarFora = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setMenuAberto(false);
    };
    const aoTeclar = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuAberto(false);
    };
    document.addEventListener('mousedown', aoClicarFora);
    document.addEventListener('keydown', aoTeclar);
    return () => {
      document.removeEventListener('mousedown', aoClicarFora);
      document.removeEventListener('keydown', aoTeclar);
    };
  }, [menuAberto]);

  // A barra mostra quantas páginas do caderno já foram usadas do limite
  const usadas = Math.min(LIMITE_PAGINAS_POR_CADERNO, Math.max(0, paginas));
  const pct = (usadas / LIMITE_PAGINAS_POR_CADERNO) * 100;
  const cheio = usadas >= LIMITE_PAGINAS_POR_CADERNO;

  const meta = ultimaAlteracao ? `Última alteração: ${ultimaAlteracao}` : null;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(e) => {
        if (e.target !== e.currentTarget) return;
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onOpen();
        }
      }}
      className="group relative flex flex-col gap-4 rounded-2xl border border-slate-200 border-l-4 bg-white p-5 text-left cursor-pointer shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
      style={{ borderLeftColor: cor }}
    >
      {/* Topo: ícone + menu de ações */}
      <div className="flex items-start justify-between">
        <div
          className="flex h-12 w-12 items-center justify-center rounded-xl"
          style={{ backgroundColor: cor }}
        >
          <PastaIcon />
        </div>

        <div ref={menuRef} className="relative z-10" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            aria-label="Opções do caderno"
            aria-haspopup="menu"
            aria-expanded={menuAberto}
            onClick={() => setMenuAberto((v) => !v)}
            className="flex h-8 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white transition-colors hover:bg-slate-50"
          >
            <DotsIcon />
          </button>

          {menuAberto && (
            <div
              role="menu"
              className="absolute right-0 mt-2 w-36 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-lg"
            >
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setMenuAberto(false);
                  onEdit();
                }}
                className="flex w-full items-center gap-2 px-3 py-2 text-sm text-indigo-600 transition-colors hover:bg-slate-50"
              >
                <EditIcon />
                Editar
              </button>
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setMenuAberto(false);
                  onDelete();
                }}
                className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-500 transition-colors hover:bg-slate-50"
              >
                <TrashIcon />
                Excluir
              </button>
            </div>
          )}
        </div>
      </div>

      <h3 title={titulo} className="truncate text-lg font-semibold text-slate-900">
        {titulo}
      </h3>

      {/* Barra de progresso (mesmo estilo da tela inicial) */}
      <div className="-mt-1 flex flex-col gap-1.5">
        <div
          role="progressbar"
          aria-label="Páginas usadas do caderno"
          aria-valuemin={0}
          aria-valuemax={LIMITE_PAGINAS_POR_CADERNO}
          aria-valuenow={usadas}
          className="h-2 w-full overflow-hidden rounded-full bg-slate-200"
        >
          <div
            className="h-full rounded-full bg-[#1e1065] transition-all duration-300"
            style={{ width: `${pct}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>
            {usadas}/{LIMITE_PAGINAS_POR_CADERNO} {usadas === 1 ? 'página' : 'páginas'}
          </span>
          {cheio && (
            <span className="rounded-full bg-amber-100 px-2 py-0.5 font-semibold text-amber-700">
              Caderno cheio
            </span>
          )}
        </div>
      </div>

      {/* Rodapé: meta + etiqueta + seta de abrir */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          {meta && <span className="truncate text-sm text-slate-500">{meta}</span>}
          {etiqueta && (
            <span className="shrink-0 rounded-full bg-indigo-50 px-3 py-0.5 text-xs font-medium text-indigo-700">
              {etiqueta}
            </span>
          )}
        </div>
        <span
          aria-hidden="true"
          className="ml-auto flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 transition-colors group-hover:bg-indigo-200"
        >
          <ArrowIcon />
        </span>
      </div>
    </div>
  );
}