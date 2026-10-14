'use client';

import { useEffect, useRef, useState } from 'react';
import { LIMITE_PAGINAS_POR_CADERNO } from '@/constants/caderno';

interface CadernoCardProps {
  titulo: string;
  cor: string; // #rrggbb
  onOpen: () => void;
  onEdit: () => void;
  onDelete: () => void;
  paginas?: number; // páginas já usadas do caderno (máximo: LIMITE_PAGINAS_POR_CADERNO)
  ultimaAlteracao?: string; // ex.: "ontem"
  etiqueta?: string; // ex.: "Iniciante", "Estudos"
}

type RGB = [number, number, number];

const PRETO: RGB = [0, 0, 0];
const BRANCO: RGB = [255, 255, 255];

function rgbDe(hex: string): RGB {
  const num = parseInt(hex.replace('#', ''), 16);
  return [(num >> 16) & 0xff, (num >> 8) & 0xff, num & 0xff];
}

// Mistura uma cor hex com uma cor alvo; `fator` vai de 0 (cor original) a 1 (cor alvo)
function misturar(hex: string, alvo: RGB, fator: number) {
  const [r, g, b] = rgbDe(hex);
  const m = (a: number, t: number) => Math.round(a + (t - a) * fator);
  return `rgb(${m(r, alvo[0])}, ${m(g, alvo[1])}, ${m(b, alvo[2])})`;
}

const escurecer = (hex: string, fator: number) => misturar(hex, PRETO, fator);
const clarear = (hex: string, fator: number) => misturar(hex, BRANCO, fator);

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
  <svg viewBox="0 0 24 24" fill="#292929" className="w-5 h-5">
    <circle cx="5" cy="12" r="1.8" />
    <circle cx="12" cy="12" r="1.8" />
    <circle cx="19" cy="12" r="1.8" />
  </svg>
);

// Pasta com símbolo de código e brilho, nas cores do caderno
function PastaIcon({ cor }: { cor: string }) {
  const traco = escurecer(cor, 0.65);
  const fundo = clarear(cor, 0.35);
  const frente = clarear(cor, 0.7);

  return (
    <svg viewBox="0 0 64 56" fill="none" className="w-14 h-12" aria-hidden="true">
      {/* Parte de trás, com a aba */}
      <path
        d="M5 14a4 4 0 0 1 4-4h13l5 5h28a4 4 0 0 1 4 4v27a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4z"
        fill={fundo}
        stroke={traco}
        strokeWidth="2"
        strokeLinejoin="round"
      />
      {/* Frente */}
      <path
        d="M5 26a4 4 0 0 1 4-4h46a4 4 0 0 1 4 4v20a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4z"
        fill={frente}
        stroke={traco}
        strokeWidth="2"
        strokeLinejoin="round"
      />
      {/* </> */}
      <path
        d="M26 31l-5 5 5 5M38 31l5 5-5 5M34 29l-4 14"
        stroke={traco}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Brilho */}
      <path d="M58 2l1.6 4.4L64 8l-4.4 1.6L58 14l-1.6-4.4L52 8l4.4-1.6z" fill={traco} />
    </svg>
  );
}

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

  // Paleta pastel derivada da cor escolhida
  const fundo = clarear(cor, 0.82);
  const borda = clarear(cor, 0.45);
  const trilho = clarear(cor, 0.6);
  const preenchimento = escurecer(cor, 0.05);
  const textoSecundario = escurecer(cor, 0.55);
  const fundoEtiqueta = clarear(cor, 0.62);

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
      className="group relative flex flex-col gap-4 rounded-2xl border-[1.5px] p-5 text-left cursor-pointer shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-2"
      style={{ backgroundColor: fundo, borderColor: borda }}
    >
      {/* Menu de ações */}
      <div
        ref={menuRef}
        className="absolute top-4 right-4 z-10"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          aria-label="Opções do caderno"
          aria-haspopup="menu"
          aria-expanded={menuAberto}
          onClick={() => setMenuAberto((v) => !v)}
          className="flex h-7 w-9 items-center justify-center rounded-lg border border-black/5 bg-white shadow-sm transition-colors hover:bg-slate-50"
        >
          <DotsIcon />
        </button>

        {menuAberto && (
          <div
            role="menu"
            className="absolute right-0 mt-2 w-36 overflow-hidden rounded-xl border border-black/5 bg-white py-1 shadow-lg"
          >
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setMenuAberto(false);
                onEdit();
              }}
              className="flex w-full items-center gap-2 px-3 py-2 text-sm text-[#3b82f6] transition-colors hover:bg-slate-50"
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

      <PastaIcon cor={cor} />

      <h3 title={titulo} className="truncate text-xl font-bold text-[#1f2937]">
        {titulo}
      </h3>

      {/* Barra de progresso */}
      <div className="-mt-2 flex flex-col gap-1.5">
        <div
          role="progressbar"
          aria-label="Páginas usadas do caderno"
          aria-valuemin={0}
          aria-valuemax={LIMITE_PAGINAS_POR_CADERNO}
          aria-valuenow={usadas}
          className="h-1.5 w-full overflow-hidden rounded-full"
          style={{ backgroundColor: trilho }}
        >
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{ width: `${pct}%`, backgroundColor: preenchimento }}
          />
        </div>

        <div
          className="flex items-center justify-between text-xs"
          style={{ color: textoSecundario }}
        >
          <span>
            {usadas}/{LIMITE_PAGINAS_POR_CADERNO} {usadas === 1 ? 'página' : 'páginas'}
          </span>
          {cheio && <span className="font-semibold">Caderno cheio</span>}
        </div>
      </div>

      {/* Rodapé: meta + etiqueta */}
      {(meta || etiqueta) && (
        <div className="flex items-center justify-between gap-2">
          <span className="truncate text-sm" style={{ color: textoSecundario }}>
            {meta}
          </span>
          {etiqueta && (
            <span
              className="shrink-0 rounded-full px-3 py-0.5 text-xs font-medium"
              style={{ backgroundColor: fundoEtiqueta, color: textoSecundario }}
            >
              {etiqueta}
            </span>
          )}
        </div>
      )}
    </div>
  );
}