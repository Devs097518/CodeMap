// frontend/src/app/(client)/dashboard/user/inicio/page.tsx
"use client";

import { useState, useEffect, type ReactNode } from "react";
import Link from "next/link";
import { listarCategorias, Categoria } from "@/service/categoria-service";
import { listarRoadmaps, adicionarMeta, removerMeta, RoadmapComProgresso } from "@/service/roadmap-service";
import { CardQuiz, QuizRoadmapModal, type RoadmapQuiz } from "@/components/QuizRoadmapModal";
import { useAuth } from "@/context/AuthContext";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const semAcento = (s: string) =>
  s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

// Progresso sempre como inteiro de 0 a 100
const progressoDe = (r: RoadmapComProgresso) =>
  Math.min(100, Math.max(0, Math.round(Number(r.progresso_percentual) || 0)));

// A descrição é opcional: sem ela, os cards mostram a categoria
const descricaoDe = (r: RoadmapComProgresso) => (r.descricao && r.descricao.trim() ? r.descricao : null);

// Cada categoria recebe sempre a mesma cor
const PALETA = [
  { bg: "bg-indigo-100", fg: "text-indigo-600", solid: "bg-indigo-600 text-white" },
  { bg: "bg-amber-100", fg: "text-amber-600", solid: "bg-amber-500 text-white" },
  { bg: "bg-emerald-100", fg: "text-emerald-600", solid: "bg-emerald-600 text-white" },
  { bg: "bg-violet-100", fg: "text-violet-600", solid: "bg-violet-600 text-white" },
  { bg: "bg-sky-100", fg: "text-sky-600", solid: "bg-sky-600 text-white" },
  { bg: "bg-rose-100", fg: "text-rose-600", solid: "bg-rose-500 text-white" },
];

type Cor = (typeof PALETA)[number];

// Escolhe o ícone do roadmap pelas palavras do título e da categoria
type TipoIcone = "js" | "seguranca" | "banco" | "codigo" | "livro";

function tipoDeIcone(titulo: string, categoria: string): TipoIcone {
  const t = semAcento(`${titulo} ${categoria}`);
  if (/java\s?script|\bjs\b|typescript|node|react/.test(t)) return "js";
  if (/seguran|cyber|cripto|hack/.test(t)) return "seguranca";
  if (/banco|dados|sql|postgres|mongo/.test(t)) return "banco";
  if (/logica|program|html|css|web|front|back|algoritm|python/.test(t)) return "codigo";
  return "livro";
}

// Metas: as que o usuário salvou (pelo quiz) vêm primeiro, depois as geradas a partir dos roadmaps
interface Meta {
  id: string;
  roadmapId: number;
  texto: string;
  progresso: number;
  concluida: boolean;
  salva: boolean; // veio da lista de metas do usuário (pode ser removida)
}

const MAX_METAS = 4;

function gerarMetas(
  emAndamento: RoadmapComProgresso[],
  disponiveis: RoadmapComProgresso[],
  concluidos: RoadmapComProgresso[]
): Meta[] {
  const iniciar = (r: RoadmapComProgresso): Meta => ({
    id: `iniciar-${r.id_roadmap}`,
    roadmapId: r.id_roadmap,
    texto: `Iniciar a trilha de ${r.titulo}`,
    progresso: 0,
    concluida: false,
    salva: r.meta,
  });

  const concluir = (r: RoadmapComProgresso, feita: boolean): Meta => ({
    id: `${feita ? "feito" : "concluir"}-${r.id_roadmap}`,
    roadmapId: r.id_roadmap,
    texto: `Concluir a trilha de ${r.titulo}`,
    progresso: progressoDe(r),
    concluida: feita,
    salva: false,
  });

  return [
    ...disponiveis.filter((r) => r.meta).map(iniciar),
    ...emAndamento.map((r) => concluir(r, false)),
    ...disponiveis.filter((r) => !r.meta).map(iniciar),
    ...concluidos.map((r) => concluir(r, true)),
  ].slice(0, MAX_METAS);
}

const DICAS = [
  "Estudar um pouco todo dia vale mais do que estudar muito de vez em quando.",
  "Quando travar, explique o problema em voz alta. Muitas vezes a solução aparece sozinha.",
  "Depois de aprender algo novo, construa algo pequeno com isso no mesmo dia.",
  "Errar no código faz parte: cada erro lido com atenção é uma aula de graça.",
  "Anote o que aprendeu com as suas palavras. Se você consegue explicar, você entendeu.",
  "Divida o problema grande em passos pequenos e comemore cada um que terminar.",
  "Descansar também é estudar: o cérebro fixa o que você aprendeu enquanto você pausa.",
];

// ---------------------------------------------------------------------------
// Ícones
// ---------------------------------------------------------------------------

function Icone({ children, className = "h-5 w-5" }: { children: ReactNode; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

type IconeProps = { className?: string };

const IconCode = ({ className }: IconeProps) => (
  <Icone className={className}>
    <path d="m18 16 4-4-4-4" />
    <path d="m6 8-4 4 4 4" />
    <path d="m14.5 4-5 16" />
  </Icone>
);

const IconShield = ({ className }: IconeProps) => (
  <Icone className={className}>
    <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
    <path d="m9 12 2 2 4-4" />
  </Icone>
);

const IconDatabase = ({ className }: IconeProps) => (
  <Icone className={className}>
    <ellipse cx="12" cy="5" rx="9" ry="3" />
    <path d="M3 5v14a9 3 0 0 0 18 0V5" />
    <path d="M3 12a9 3 0 0 0 18 0" />
  </Icone>
);

const IconBook = ({ className }: IconeProps) => (
  <Icone className={className}>
    <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20" />
  </Icone>
);

const IconCap = ({ className }: IconeProps) => (
  <Icone className={className}>
    <path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z" />
    <path d="M22 10v6" />
    <path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5" />
  </Icone>
);

const IconArrow = ({ className }: IconeProps) => (
  <Icone className={className}>
    <path d="M5 12h14" />
    <path d="m12 5 7 7-7 7" />
  </Icone>
);

const IconCheck = ({ className }: IconeProps) => (
  <Icone className={className}>
    <path d="M20 6 9 17l-5-5" />
  </Icone>
);

const IconX = ({ className }: IconeProps) => (
  <Icone className={className}>
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </Icone>
);

const IconClock = ({ className }: IconeProps) => (
  <Icone className={className}>
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </Icone>
);

const IconCompass = ({ className }: IconeProps) => (
  <Icone className={className}>
    <circle cx="12" cy="12" r="10" />
    <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
  </Icone>
);

const IconTarget = ({ className }: IconeProps) => (
  <Icone className={className}>
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="6" />
    <circle cx="12" cy="12" r="2" />
  </Icone>
);

const IconBars = ({ className }: IconeProps) => (
  <Icone className={className}>
    <line x1="12" y1="20" x2="12" y2="10" />
    <line x1="18" y1="20" x2="18" y2="4" />
    <line x1="6" y1="20" x2="6" y2="16" />
  </Icone>
);

const IconLayers = ({ className }: IconeProps) => (
  <Icone className={className}>
    <path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83z" />
    <path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65" />
    <path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65" />
  </Icone>
);

const IconAward = ({ className }: IconeProps) => (
  <Icone className={className}>
    <circle cx="12" cy="8" r="6" />
    <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" />
  </Icone>
);

const IconBulb = ({ className }: IconeProps) => (
  <Icone className={className}>
    <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5" />
    <path d="M9 18h6" />
    <path d="M10 22h4" />
  </Icone>
);

// ---------------------------------------------------------------------------
// Peças reutilizáveis
// ---------------------------------------------------------------------------

function Barra({
  valor,
  className = "h-2",
  corClasse = "bg-[#1a0066]",
}: {
  valor: number;
  className?: string;
  corClasse?: string;
}) {
  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={valor}
      className={`overflow-hidden rounded-full bg-black/10 ${className}`}
    >
      <div
        className={`h-full rounded-full transition-all duration-500 ${corClasse}`}
        style={{ width: `${valor}%` }}
      />
    </div>
  );
}

function IconeRoadmap({
  titulo,
  categoria,
  cor,
  grande = false,
}: {
  titulo: string;
  categoria: string;
  cor: Cor;
  grande?: boolean;
}) {
  const tipo = tipoDeIcone(titulo, categoria);
  const tamanhoIcone = grande ? "h-8 w-8" : "h-6 w-6";

  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-2xl ${
        grande ? `h-16 w-16 ${cor.solid}` : `h-12 w-12 ${cor.bg} ${cor.fg}`
      }`}
    >
      {tipo === "js" && <span className={grande ? "text-xl font-extrabold" : "text-base font-extrabold"}>JS</span>}
      {tipo === "seguranca" && <IconShield className={tamanhoIcone} />}
      {tipo === "banco" && <IconDatabase className={tamanhoIcone} />}
      {tipo === "codigo" && <IconCode className={tamanhoIcone} />}
      {tipo === "livro" && <IconBook className={tamanhoIcone} />}
    </div>
  );
}

function SecaoTitulo({
  icone,
  titulo,
  subtitulo,
  contador,
}: {
  icone: ReactNode;
  titulo: string;
  subtitulo: string;
  contador?: string;
}) {
  return (
    <div className="mb-4 flex items-start justify-between gap-3">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-indigo-700">
          {icone}
        </span>
        <div>
          <h2 className="text-xl font-bold leading-tight text-gray-900">{titulo}</h2>
          <p className="text-sm text-gray-500">{subtitulo}</p>
        </div>
      </div>
      {contador && (
        <span className="shrink-0 rounded-full bg-sky-50 px-3 py-1 text-xs font-medium text-sky-700">
          {contador}
        </span>
      )}
    </div>
  );
}

function CardLateral({
  icone,
  titulo,
  direita,
  children,
}: {
  icone: ReactNode;
  titulo: string;
  direita?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="text-indigo-700">{icone}</span>
          <h3 className="font-semibold text-gray-900">{titulo}</h3>
        </div>
        {direita}
      </div>
      {children}
    </section>
  );
}

// ---------------------------------------------------------------------------
// Cards de roadmap (coluna esquerda)
// ---------------------------------------------------------------------------

function CardEmAndamento({
  roadmap,
  categoriaNome,
  cor,
}: {
  roadmap: RoadmapComProgresso;
  categoriaNome: string;
  cor: Cor;
}) {
  const p = progressoDe(roadmap);

  return (
    <Link
      href={`/dashboard/user/roadmap/${roadmap.id_roadmap}`}
      className="group relative flex items-center gap-5 overflow-hidden rounded-2xl border border-indigo-100 bg-gradient-to-r from-indigo-50/70 to-white p-5 transition-all duration-150 hover:border-indigo-300 hover:shadow-md active:scale-[0.99]"
    >
      <span className="absolute inset-y-0 left-0 w-1 bg-indigo-500" aria-hidden="true" />

      <IconeRoadmap titulo={roadmap.titulo} categoria={categoriaNome} cor={cor} grande />

      <div className="min-w-0 flex-1">
        <p className="truncate text-lg font-semibold text-gray-900">{roadmap.titulo}</p>
        <p className="mt-0.5 line-clamp-2 text-sm text-gray-500">
          {descricaoDe(roadmap) ?? categoriaNome}
        </p>
        <Barra valor={p} className="mt-3 h-2.5" />
        <p className="mt-1 text-xs text-gray-600">{p}% concluído</p>
      </div>

      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 transition-transform group-hover:translate-x-0.5">
        <IconArrow />
      </span>
    </Link>
  );
}

function LinhaDisponivel({
  roadmap,
  categoriaNome,
  cor,
}: {
  roadmap: RoadmapComProgresso;
  categoriaNome: string;
  cor: Cor;
}) {
  return (
    <Link
      href={`/dashboard/user/roadmap/${roadmap.id_roadmap}`}
      className="group flex items-center gap-4 rounded-2xl border border-gray-200 bg-white p-4 transition-all duration-150 hover:border-indigo-300 hover:shadow-md active:scale-[0.99]"
    >
      <IconeRoadmap titulo={roadmap.titulo} categoria={categoriaNome} cor={cor} />

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate font-semibold text-gray-900">{roadmap.titulo}</p>
          <span className={`hidden shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium sm:inline ${cor.bg} ${cor.fg}`}>
            {categoriaNome}
          </span>
        </div>
        <p className="mt-0.5 line-clamp-1 text-sm text-gray-500">
          {descricaoDe(roadmap) ?? `Trilha de ${categoriaNome}`}
        </p>
        <Barra valor={0} className="mt-2 h-1.5 max-w-sm" />
        <p className="mt-1 text-xs text-gray-500">0% concluído</p>
      </div>

      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-600 transition-all group-hover:translate-x-0.5 group-hover:bg-indigo-100 group-hover:text-indigo-700">
        <IconArrow className="h-4 w-4" />
      </span>
    </Link>
  );
}

function LinhaConcluida({
  roadmap,
  categoriaNome,
}: {
  roadmap: RoadmapComProgresso;
  categoriaNome: string;
}) {
  return (
    <Link
      href={`/dashboard/user/roadmap/${roadmap.id_roadmap}`}
      className="flex items-center gap-3 rounded-2xl border border-emerald-100 bg-emerald-50/50 px-4 py-3 transition-all hover:border-emerald-300 active:scale-[0.99]"
    >
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white">
        <IconCheck className="h-4 w-4" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium text-gray-900">{roadmap.titulo}</p>
        <p className="text-xs text-gray-500">{categoriaNome} · 100% concluído</p>
      </div>
    </Link>
  );
}

// ---------------------------------------------------------------------------
// Coluna direita
// ---------------------------------------------------------------------------

function AnelProgresso({ valor }: { valor: number }) {
  const raio = 46;
  const circunferencia = 2 * Math.PI * raio;

  return (
    <div className="relative h-28 w-28 shrink-0">
      <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90" aria-hidden="true">
        <circle cx="60" cy="60" r={raio} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="10" />
        <circle
          cx="60"
          cy="60"
          r={raio}
          fill="none"
          stroke="#8fd3ff"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circunferencia}
          strokeDashoffset={circunferencia * (1 - valor / 100)}
          className="transition-all duration-700"
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-2xl font-bold">{valor}%</span>
    </div>
  );
}

function CardProgressoGeral({
  progressoGeral,
  iniciados,
  concluidos,
  total,
}: {
  progressoGeral: number;
  iniciados: number;
  concluidos: number;
  total: number;
}) {
  return (
    <section className="rounded-2xl bg-gradient-to-br from-[#1a1160] to-[#0e1a5c] p-5 text-white shadow-md">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <IconBars />
          <h3 className="font-semibold">Seu progresso geral</h3>
        </div>
        <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-xs font-medium">
          {iniciados}/{total}
        </span>
      </div>

      <div className="flex items-center gap-5">
        <AnelProgresso valor={progressoGeral} />

        <div className="h-16 w-px bg-white/15" aria-hidden="true" />

        <div className="space-y-3">
          <div>
            <p className="text-lg font-bold leading-tight">
              {iniciados} de {total}
            </p>
            <p className="text-sm text-white/70">roadmaps iniciados</p>
          </div>
          <div>
            <p className="text-lg font-bold leading-tight">{concluidos}</p>
            <p className="text-sm text-white/70">{concluidos === 1 ? "concluído" : "concluídos"}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function CardMetas({ metas, onRemover }: { metas: Meta[]; onRemover: (id_roadmap: number) => void }) {
  return (
    <CardLateral icone={<IconTarget />} titulo="Metas do momento">
      {metas.length === 0 ? (
        <p className="text-sm text-gray-500">Nenhuma meta por enquanto.</p>
      ) : (
        <ul className="space-y-4">
          {metas.map((meta) => (
            <li key={meta.id} className="flex items-center gap-3">
              <span
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 ${
                  meta.concluida
                    ? "border-indigo-600 bg-indigo-600 text-white"
                    : "border-gray-300 text-transparent"
                }`}
              >
                <IconCheck className="h-3.5 w-3.5" />
              </span>

              <div className="min-w-0 flex-1">
                <p
                  title={meta.texto}
                  className={`truncate text-sm ${meta.concluida ? "text-gray-400 line-through" : "text-gray-800"}`}
                >
                  {meta.texto}
                </p>
                <Barra valor={meta.progresso} className="mt-1 h-1.5" />
              </div>

              <span className="w-9 shrink-0 text-right text-xs text-gray-500">{meta.progresso}%</span>

              <span className="flex h-5 w-5 shrink-0 items-center justify-center">
                {meta.salva && (
                  <button
                    type="button"
                    aria-label={`Remover meta: ${meta.texto}`}
                    title="Remover da minha lista"
                    onClick={() => onRemover(meta.roadmapId)}
                    className="rounded-full p-0.5 text-gray-300 transition-colors hover:bg-red-50 hover:text-red-500"
                  >
                    <IconX className="h-3.5 w-3.5" />
                  </button>
                )}
              </span>
            </li>
          ))}
        </ul>
      )}
    </CardLateral>
  );
}

function CardCategorias({
  itens,
}: {
  itens: { id: number; nome: string; progresso: number; cor: Cor }[];
}) {
  if (itens.length === 0) return null;

  return (
    <CardLateral icone={<IconLayers />} titulo="Progresso por categoria">
      <ul className="space-y-3.5">
        {itens.map((item) => (
          <li key={item.id}>
            <div className="mb-1 flex items-center justify-between gap-3 text-sm">
              <span className="truncate font-medium text-gray-800">{item.nome}</span>
              <span className="shrink-0 text-xs text-gray-500">{item.progresso}%</span>
            </div>
            <Barra valor={item.progresso} className="h-1.5" corClasse={item.cor.solid.split(" ")[0]} />
          </li>
        ))}
      </ul>
    </CardLateral>
  );
}

function CardConquistas({
  conquistas,
}: {
  conquistas: { id: string; emoji: string; nome: string; descricao: string; ativa: boolean }[];
}) {
  const ativas = conquistas.filter((c) => c.ativa).length;

  return (
    <CardLateral
      icone={<IconAward />}
      titulo="Conquistas"
      direita={<span className="text-xs font-medium text-gray-500">{ativas}/{conquistas.length}</span>}
    >
      <ul className="grid grid-cols-2 gap-3">
        {conquistas.map((c) => (
          <li
            key={c.id}
            title={c.descricao}
            className={`flex items-center gap-2.5 rounded-xl border p-2.5 transition-opacity ${
              c.ativa ? "border-indigo-100 bg-indigo-50/60" : "border-gray-200 bg-gray-50 opacity-60"
            }`}
          >
            <span
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-lg shadow-sm ${
                c.ativa ? "" : "grayscale"
              }`}
              aria-hidden="true"
            >
              {c.emoji}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-gray-900">{c.nome}</p>
              <p className="line-clamp-2 text-[11px] leading-snug text-gray-500">{c.descricao}</p>
            </div>
          </li>
        ))}
      </ul>
    </CardLateral>
  );
}

function CardDica({ dica }: { dica: string }) {
  return (
    <section className="rounded-2xl border border-violet-100 bg-gradient-to-br from-violet-50 to-indigo-50 p-5">
      <div className="mb-2 flex items-center gap-2.5 text-indigo-700">
        <IconBulb />
        <h3 className="font-semibold text-gray-900">Dica de hoje</h3>
      </div>
      <p className="text-sm italic leading-relaxed text-gray-700">“{dica}”</p>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Página
// ---------------------------------------------------------------------------

export default function ClientInicioPage() {
  const { usuario } = useAuth();
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [roadmaps, setRoadmaps] = useState<RoadmapComProgresso[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [categoriaFiltro, setCategoriaFiltro] = useState<number | null>(null);
  const [dica, setDica] = useState(DICAS[0]);
  const [quizAberto, setQuizAberto] = useState(false);

  const username = usuario?.username ?? "";

  useEffect(() => {
    Promise.all([listarCategorias(), listarRoadmaps()])
      .then(([cats, rms]) => {
        setCategorias(cats);
        setRoadmaps(rms);
      })
      .catch(() => setErro("Erro ao carregar roadmaps."))
      .finally(() => setLoading(false));
  }, []);

  // A dica muda a cada dia (calculada no navegador para não divergir do servidor)
  useEffect(() => {
    const hoje = new Date();
    const inicioDoAno = new Date(hoje.getFullYear(), 0, 0);
    const diaDoAno = Math.floor((hoje.getTime() - inicioDoAno.getTime()) / 86400000);
    setDica(DICAS[diaDoAno % DICAS.length]);
  }, []);

  // Metas: salvar e remover direto no backend, atualizando a lista local
  const handleAdicionarMeta = async (id_roadmap: number) => {
    await adicionarMeta(id_roadmap); // se falhar, o quiz mostra o erro
    setRoadmaps((prev) => prev.map((r) => (r.id_roadmap === id_roadmap ? { ...r, meta: true } : r)));
  };

  const handleRemoverMeta = async (id_roadmap: number) => {
    try {
      await removerMeta(id_roadmap);
      setRoadmaps((prev) => prev.map((r) => (r.id_roadmap === id_roadmap ? { ...r, meta: false } : r)));
    } catch {
      setErro("Não foi possível remover a meta.");
    }
  };

  // ----- Dados derivados -----
  const emAndamento = roadmaps
    .filter((r) => r.iniciado && progressoDe(r) < 100)
    .sort((a, b) => progressoDe(b) - progressoDe(a));
  const concluidos = roadmaps.filter((r) => r.iniciado && progressoDe(r) >= 100);
  const disponiveis = roadmaps.filter((r) => !r.iniciado);
  const iniciados = emAndamento.length + concluidos.length;

  // Média de todos os roadmaps (os não iniciados contam como 0%)
  const progressoGeral =
    roadmaps.length > 0
      ? Math.round(roadmaps.reduce((soma, r) => soma + progressoDe(r), 0) / roadmaps.length)
      : 0;

  const metas = gerarMetas(emAndamento, disponiveis, concluidos);

  const nomeDaCategoria = (id: number) => categorias.find((c) => c.id_categoria === id)?.nome ?? "";
  const corDaCategoria = (id: number): Cor => {
    const i = categorias.findIndex((c) => c.id_categoria === id);
    return PALETA[(i < 0 ? 0 : i) % PALETA.length];
  };

  const progressoPorCategoria = categorias
    .map((c) => {
      const doGrupo = roadmaps.filter((r) => r.categoria_id === c.id_categoria);
      if (doGrupo.length === 0) return null;
      const media = Math.round(doGrupo.reduce((s, r) => s + progressoDe(r), 0) / doGrupo.length);
      return { id: c.id_categoria, nome: c.nome, progresso: media, cor: corDaCategoria(c.id_categoria) };
    })
    .filter((x): x is NonNullable<typeof x> => x !== null);

  // Candidatos do quiz: roadmaps que o usuário ainda não iniciou
  const roadmapsQuiz: RoadmapQuiz[] = disponiveis.map((r) => ({
    id_roadmap: r.id_roadmap,
    titulo: r.titulo,
    descricao: r.descricao,
    categoriaNome: nomeDaCategoria(r.categoria_id),
    labels: r.labels,
  }));
  const metasIds = roadmaps.filter((r) => r.meta).map((r) => r.id_roadmap);

  const conquistas = [
    {
      id: "primeiro-passo",
      emoji: "🌱",
      nome: "Primeiro passo",
      descricao: "Inicie seu primeiro roadmap",
      ativa: iniciados >= 1,
    },
    {
      id: "meio-caminho",
      emoji: "🔥",
      nome: "Meio caminho",
      descricao: "Chegue a 50% em um roadmap",
      ativa: roadmaps.some((r) => progressoDe(r) >= 50),
    },
    {
      id: "trilha-concluida",
      emoji: "🏆",
      nome: "Trilha concluída",
      descricao: "Termine um roadmap",
      ativa: concluidos.length >= 1,
    },
    {
      id: "explorador",
      emoji: "🧭",
      nome: "Explorador",
      descricao: "Inicie 3 roadmaps",
      ativa: iniciados >= 3,
    },
  ];

  // Filtro por categoria nos roadmaps disponíveis
  const categoriasDisponiveis = categorias.filter((c) =>
    disponiveis.some((r) => r.categoria_id === c.id_categoria)
  );
  const disponiveisFiltrados =
    categoriaFiltro === null
      ? disponiveis
      : disponiveis.filter((r) => r.categoria_id === categoriaFiltro);

  return (
    <main className="min-h-screen bg-[#f8f9fc] px-4 py-8 font-sans sm:px-8 lg:px-12">
      <div className="mx-auto max-w-7xl">
        {/* Boas-vindas */}
        <header className="relative mb-8 overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-50 via-sky-50 to-white p-6 sm:p-8">
          <div className="flex items-center gap-5">
            <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white text-indigo-700 shadow-sm">
              <IconCap className="h-8 w-8" />
            </span>
            <div>
              <h1 className="text-2xl font-bold leading-tight text-gray-900 sm:text-3xl">
                {username ? `Olá, ${username}!` : "Olá!"}
              </h1>
              <p className="text-lg text-gray-500 sm:text-xl">continue seus estudos</p>
              <p className="mt-1 text-sm text-gray-500">
                Cada passo te aproxima do seu objetivo. Você consegue!
              </p>
            </div>
          </div>

          {/* Ilustração decorativa */}
          <svg
            viewBox="0 0 220 90"
            className="pointer-events-none absolute bottom-0 right-6 hidden h-24 w-auto sm:block"
            aria-hidden="true"
          >
            <ellipse cx="22" cy="46" rx="6" ry="13" transform="rotate(-20 22 46)" fill="#6fcf97" />
            <ellipse cx="34" cy="44" rx="6" ry="14" transform="rotate(18 34 44)" fill="#4cb97a" />
            <rect x="14" y="58" width="26" height="22" rx="4" fill="#7c86d6" />
            <rect x="60" y="62" width="150" height="18" rx="4" fill="#3b4a9c" />
            <rect x="75" y="44" width="125" height="18" rx="4" fill="#1f2a6b" />
            <rect x="90" y="28" width="95" height="16" rx="4" fill="#5b6bd0" />
            <rect x="196" y="65" width="10" height="12" rx="2" fill="#dfe3fb" />
            <rect x="186" y="47" width="10" height="12" rx="2" fill="#dfe3fb" />
            <rect x="172" y="31" width="9" height="10" rx="2" fill="#dfe3fb" />
          </svg>
        </header>

        {erro && <p className="mb-4 text-sm text-red-500">{erro}</p>}

        {loading ? (
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem] xl:grid-cols-[minmax(0,1fr)_24rem]">
            <div className="space-y-4">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-28 animate-pulse rounded-2xl bg-gray-200/60" />
              ))}
            </div>
            <div className="space-y-4">
              {[0, 1].map((i) => (
                <div key={i} className="h-44 animate-pulse rounded-2xl bg-gray-200/60" />
              ))}
            </div>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem] xl:grid-cols-[minmax(0,1fr)_24rem]">
            {/* Coluna esquerda */}
            <div className="space-y-10">
              <section>
                <SecaoTitulo
                  icone={<IconClock />}
                  titulo="Roadmaps em andamento"
                  subtitulo="Continue de onde parou e mantenha o ritmo!"
                  contador={emAndamento.length > 0 ? `${emAndamento.length} em andamento` : undefined}
                />

                {emAndamento.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-gray-300 bg-white/60 p-6 text-center text-sm text-gray-500">
                    Você ainda não tem roadmaps em andamento. Escolha um abaixo para começar.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {emAndamento.map((roadmap) => (
                      <CardEmAndamento
                        key={roadmap.id_roadmap}
                        roadmap={roadmap}
                        categoriaNome={nomeDaCategoria(roadmap.categoria_id)}
                        cor={corDaCategoria(roadmap.categoria_id)}
                      />
                    ))}
                  </div>
                )}
              </section>

              <section>
                <SecaoTitulo
                  icone={<IconCompass />}
                  titulo="Roadmaps disponíveis"
                  subtitulo="Explore novas trilhas e encontre o que mais combina com você."
                  contador={disponiveis.length > 0 ? `${disponiveis.length} disponíveis` : undefined}
                />

                {categoriasDisponiveis.length > 1 && (
                  <div className="mb-4 flex flex-wrap gap-2">
                    <button
                      type="button"
                      aria-pressed={categoriaFiltro === null}
                      onClick={() => setCategoriaFiltro(null)}
                      className={`rounded-full border px-3.5 py-1 text-sm font-medium transition-colors ${
                        categoriaFiltro === null
                          ? "border-indigo-600 bg-indigo-600 text-white"
                          : "border-gray-200 bg-white text-gray-600 hover:border-indigo-300"
                      }`}
                    >
                      Todas
                    </button>
                    {categoriasDisponiveis.map((c) => (
                      <button
                        key={c.id_categoria}
                        type="button"
                        aria-pressed={categoriaFiltro === c.id_categoria}
                        onClick={() => setCategoriaFiltro(c.id_categoria)}
                        className={`rounded-full border px-3.5 py-1 text-sm font-medium transition-colors ${
                          categoriaFiltro === c.id_categoria
                            ? "border-indigo-600 bg-indigo-600 text-white"
                            : "border-gray-200 bg-white text-gray-600 hover:border-indigo-300"
                        }`}
                      >
                        {c.nome}
                      </button>
                    ))}
                  </div>
                )}

                {disponiveisFiltrados.length === 0 ? (
                  <p className="rounded-2xl border border-dashed border-gray-300 bg-white/60 p-6 text-center text-sm text-gray-500">
                    {roadmaps.length === 0
                      ? "Nenhum roadmap disponível ainda."
                      : "Você já iniciou todos os roadmaps disponíveis. Continue assim!"}
                  </p>
                ) : (
                  <div className="space-y-3">
                    {disponiveisFiltrados.map((roadmap) => (
                      <LinhaDisponivel
                        key={roadmap.id_roadmap}
                        roadmap={roadmap}
                        categoriaNome={nomeDaCategoria(roadmap.categoria_id)}
                        cor={corDaCategoria(roadmap.categoria_id)}
                      />
                    ))}
                  </div>
                )}
              </section>

              {concluidos.length > 0 && (
                <section>
                  <SecaoTitulo
                    icone={<IconCheck />}
                    titulo="Concluídos"
                    subtitulo="Trilhas que você já terminou. Parabéns!"
                    contador={`${concluidos.length} ${concluidos.length === 1 ? "concluído" : "concluídos"}`}
                  />
                  <div className="space-y-3">
                    {concluidos.map((roadmap) => (
                      <LinhaConcluida
                        key={roadmap.id_roadmap}
                        roadmap={roadmap}
                        categoriaNome={nomeDaCategoria(roadmap.categoria_id)}
                      />
                    ))}
                  </div>
                </section>
              )}
            </div>

            {/* Coluna direita */}
            <aside className="flex flex-col gap-5">
              <CardProgressoGeral
                progressoGeral={progressoGeral}
                iniciados={iniciados}
                concluidos={concluidos.length}
                total={roadmaps.length}
              />
              <CardMetas metas={metas} onRemover={handleRemoverMeta} />
              <CardQuiz onIniciar={() => setQuizAberto(true)} />
              <CardCategorias itens={progressoPorCategoria} />
              <CardConquistas conquistas={conquistas} />
              <CardDica dica={dica} />
            </aside>
          </div>
        )}
      </div>

      {quizAberto && (
        <QuizRoadmapModal
          roadmaps={roadmapsQuiz}
          metasIds={metasIds}
          onAdicionarMeta={handleAdicionarMeta}
          onClose={() => setQuizAberto(false)}
        />
      )}
    </main>
  );
}