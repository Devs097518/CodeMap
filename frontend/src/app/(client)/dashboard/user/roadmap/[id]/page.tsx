// frontend/src/app/(client)/dashboard/user/roadmap/[id]/page.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  BookOpen,
  Check,
  ChevronDown,
  Code,
  Database,
  Info,
  Lightbulb,
  ListChecks,
  Play,
  RefreshCw,
  Rocket,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { buscarRoadmap, Roadmap } from "@/service/roadmap-service";
import { listarTopicosComProgresso, TopicoComProgresso } from "@/service/topico-service";
import { alternarProgressoTopico, alternarProgressoSubitem } from "@/service/progresso-service";
import RecursosBadge from "@/components/RecursoModal";

const COR_BG_PAGINA = "#fdf6e2";
const COR_BG_HEADER = "#fbf1ce";
const COR_BORDA = "#ecdfad";
const COR_LINHA = "#d8c98f";
const COR_ACCENT = "#0C0F4F";

// Tons de lavanda usados na etapa aberta
const COR_LAVANDA_BG = "#f4f2ff";
const COR_LAVANDA_BORDA = "#cfc9f7";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const semAcento = (s: string) =>
  s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

// Ícone da trilha, escolhido pelas palavras do título e das labels
function IconeDaTrilha({ texto }: { texto: string }) {
  const t = semAcento(texto);
  if (/java\s?script|\bjs\b|typescript|node|react/.test(t)) {
    return <span className="text-2xl font-extrabold">JS</span>;
  }
  if (/seguran|cyber|cripto|hack/.test(t)) return <ShieldCheck size={30} />;
  if (/banco|dados|sql|postgres|mongo/.test(t)) return <Database size={30} />;
  if (/logica|program|html|css|web|front|back|algoritm|python/.test(t)) return <Code size={30} />;
  return <BookOpen size={30} />;
}

// Ícones e cores dos tópicos (sub-itens) de uma etapa, em ciclo
const ICONES_TOPICO = [Code, RefreshCw, Play, BookOpen, Sparkles];
const CORES_TOPICO = [
  "bg-blue-100 text-blue-600",
  "bg-indigo-100 text-indigo-600",
  "bg-emerald-100 text-emerald-600",
  "bg-amber-100 text-amber-600",
  "bg-rose-100 text-rose-600",
];

const DICAS_ETAPA = [
  "Pratique com exemplos pequenos: a repetição é a chave para escrever códigos mais eficientes!",
  "Escreva o código você mesmo em vez de só ler. Errar faz parte do aprendizado.",
  "Ao terminar uma etapa, explique com suas palavras o que aprendeu.",
  "Use os recursos da etapa e volte aos tópicos que ficaram confusos.",
  "Faça pausas curtas: o cérebro fixa melhor o que você acabou de estudar.",
];

function mensagemMotivacional(percentual: number) {
  if (percentual >= 100) return "Trilha concluída! Você chegou ao fim, parabéns!";
  if (percentual >= 50) return "Você já passou da metade. Continue assim!";
  if (percentual > 0) return "Pequenos avanços também são progresso!";
  return "Todo grande caminho começa com o primeiro passo!";
}

// ---------------------------------------------------------------------------
// Navbar
// ---------------------------------------------------------------------------

function Navbar() {
  return (
    <header
      className="sticky top-0 z-20 border-b"
      style={{ backgroundColor: COR_BG_HEADER, borderColor: COR_BORDA }}
    >
      <div className="max-w-6xl mx-auto flex items-center px-4 sm:px-6 lg:px-8 py-4">
        <Link
          href="/dashboard/user/inicio"
          className="flex items-center gap-2 text-lg hover:gap-3 transition-all"
          style={{ color: COR_ACCENT }}
        >
          <ArrowLeft size={18} />
          voltar ao início
        </Link>
      </div>
    </header>
  );
}

// ---------------------------------------------------------------------------
// Página
// ---------------------------------------------------------------------------

export default function RoadmapDetalheClientPage() {
  const params = useParams();
  const roadmapId = Number(params.id);

  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  const [topicos, setTopicos] = useState<TopicoComProgresso[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  // Etapas abertas (a etapa atual abre sozinha na primeira carga)
  const [abertas, setAbertas] = useState<number[]>([]);
  const abertasIniciadas = useRef(false);

  useEffect(() => {
    if (!roadmapId) return;
    Promise.all([buscarRoadmap(roadmapId), listarTopicosComProgresso(roadmapId)])
      .then(([r, t]) => {
        setRoadmap(r);
        setTopicos(t);
      })
      .catch(() => setErro("Erro ao carregar roadmap."))
      .finally(() => setLoading(false));
  }, [roadmapId]);

  useEffect(() => {
    if (abertasIniciadas.current || topicos.length === 0) return;
    abertasIniciadas.current = true;
    const atual = topicos.find((t) => !t.estudado);
    if (atual) setAbertas([atual.id_topico]);
  }, [topicos]);

  const alternarAberta = (id_topico: number) =>
    setAbertas((prev) =>
      prev.includes(id_topico) ? prev.filter((id) => id !== id_topico) : [...prev, id_topico]
    );

  const handleToggleTopico = async (id_topico: number, estudado: boolean) => {
    setTopicos((prev) =>
      prev.map((t) => (t.id_topico === id_topico ? { ...t, estudado } : t))
    );
    try {
      await alternarProgressoTopico(id_topico, estudado);
    } catch {
      setTopicos((prev) =>
        prev.map((t) => (t.id_topico === id_topico ? { ...t, estudado: !estudado } : t))
      );
      setErro("Erro ao atualizar progresso.");
    }
  };

  const handleToggleSubitem = async (id_topico: number, id_subitem: number, estudado: boolean) => {
    setTopicos((prev) =>
      prev.map((t) =>
        t.id_topico === id_topico
          ? { ...t, subitens: t.subitens.map((s) => (s.id_subitem === id_subitem ? { ...s, estudado } : s)) }
          : t
      )
    );
    try {
      await alternarProgressoSubitem(id_subitem, estudado);
    } catch {
      setTopicos((prev) =>
        prev.map((t) =>
          t.id_topico === id_topico
            ? { ...t, subitens: t.subitens.map((s) => (s.id_subitem === id_subitem ? { ...s, estudado: !estudado } : s)) }
            : t
        )
      );
      setErro("Erro ao atualizar progresso.");
    }
  };

  // ----- Dados derivados -----
  const totalItens = topicos.length + topicos.reduce((acc, t) => acc + t.subitens.length, 0);
  const itensConcluidos =
    topicos.filter((t) => t.estudado).length +
    topicos.reduce((acc, t) => acc + t.subitens.filter((s) => s.estudado).length, 0);
  const percentual = totalItens > 0 ? Math.round((itensConcluidos / totalItens) * 100) : 0;

  // A etapa atual é a primeira que ainda não foi concluída
  const etapaAtualId = topicos.find((t) => !t.estudado)?.id_topico ?? null;
  const etapasConcluidas = topicos.filter((t) => t.estudado).length;
  const totalTopicos = topicos.reduce((acc, t) => acc + t.subitens.length, 0);

  const continuarDeOndeParou = () => {
    if (etapaAtualId === null) return;
    setAbertas((prev) => (prev.includes(etapaAtualId) ? prev : [...prev, etapaAtualId]));
    setTimeout(() => {
      document
        .getElementById(`etapa-${etapaAtualId}`)
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  };

  if (loading) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: COR_BG_PAGINA }}>
        <Navbar />
        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-gray-400 text-xl">
          Carregando...
        </main>
      </div>
    );
  }

  if (erro && !roadmap) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: COR_BG_PAGINA }}>
        <Navbar />
        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-red-500">
          {erro}
        </main>
      </div>
    );
  }

  if (!roadmap) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: COR_BG_PAGINA }}>
        <Navbar />
        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-red-500">
          Roadmap não encontrado.
        </main>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden" style={{ backgroundColor: COR_BG_PAGINA }}>
      {/* Manchas decorativas de fundo */}
      <div
        className="pointer-events-none absolute -left-24 top-40 h-72 w-72 rounded-full bg-indigo-200/30 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -right-20 top-10 h-72 w-72 rounded-full bg-amber-200/40 blur-3xl"
        aria-hidden="true"
      />

      <Navbar />

      <main className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Cabeçalho da trilha */}
        <section className="mb-10 flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex min-w-0 flex-1 items-start gap-5">
            <span
              className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl text-white shadow-md"
              style={{ backgroundColor: COR_ACCENT }}
            >
              <IconeDaTrilha texto={`${roadmap.titulo} ${roadmap.labels.join(" ")}`} />
            </span>

            <div className="min-w-0 flex-1">
              <h1 className="text-3xl font-bold leading-tight text-gray-900">{roadmap.titulo}</h1>
              {roadmap.descricao && (
                <p className="mt-1.5 max-w-xl text-base leading-relaxed text-gray-600">
                  {roadmap.descricao}
                </p>
              )}

              {totalItens > 0 && (
                <div className="mt-4 max-w-md">
                  <div className="mb-1.5 flex items-center justify-between text-sm text-gray-500">
                    <span>Progresso da trilha</span>
                    <span className="font-semibold" style={{ color: COR_ACCENT }}>
                      {percentual}%
                    </span>
                  </div>
                  <div
                    role="progressbar"
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={percentual}
                    className="h-2 overflow-hidden rounded-full"
                    style={{ backgroundColor: COR_BORDA }}
                  >
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${percentual}%`, backgroundColor: COR_ACCENT }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Cartão motivacional */}
          <div className="hidden shrink-0 -rotate-2 items-center gap-3 rounded-2xl border border-[#ece3c6] bg-white/80 px-5 py-4 shadow-md lg:flex">
            <Sparkles size={22} className="text-indigo-500" />
            <p className="max-w-[11rem] text-sm italic leading-snug text-gray-700">
              {mensagemMotivacional(percentual)}
            </p>
          </div>
        </section>

        {erro && <p className="mb-4 text-center text-sm text-red-500">{erro}</p>}

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_17rem]">
          {/* Linha do tempo das etapas */}
          <div>
            {topicos.length === 0 ? (
              <p className="text-center text-gray-400">Nenhum tópico disponível ainda.</p>
            ) : (
              <div className="flex flex-col gap-8">
                {topicos.map((topico, idx) => {
                  const ultimaEtapa = idx === topicos.length - 1;
                  const aberta = abertas.includes(topico.id_topico);
                  const ehAtual = topico.id_topico === etapaAtualId;
                  const topicosEstudados = topico.subitens.filter((s) => s.estudado).length;

                  return (
                    <div
                      key={topico.id_topico}
                      id={`etapa-${topico.id_topico}`}
                      className="relative scroll-mt-24 pl-16"
                    >
                      {!ultimaEtapa && (
                        <div
                          className="absolute left-5 top-[3.25rem] -bottom-8 w-0.5"
                          style={{ backgroundColor: COR_LINHA }}
                        />
                      )}

                      <button
                        onClick={() => handleToggleTopico(topico.id_topico, !topico.estudado)}
                        aria-pressed={topico.estudado}
                        title={topico.estudado ? "Marcar como não estudado" : "Marcar como estudado"}
                        className={`absolute left-0 top-3 z-10 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border-2 transition-all ${
                          ehAtual ? "ring-4 ring-[#cfc9f7]" : ""
                        }`}
                        style={{
                          backgroundColor: topico.estudado ? COR_ACCENT : COR_BG_PAGINA,
                          borderColor: COR_ACCENT,
                        }}
                      >
                        {topico.estudado ? (
                          <Check size={18} className="text-white" />
                        ) : (
                          <span className="text-sm font-semibold" style={{ color: COR_ACCENT }}>
                            {idx + 1}
                          </span>
                        )}
                      </button>

                      <div
                        className="rounded-2xl border shadow-sm transition-colors"
                        style={{
                          backgroundColor: aberta ? COR_LAVANDA_BG : "#ffffff",
                          borderColor: aberta ? COR_LAVANDA_BORDA : "#ece3c6",
                        }}
                      >
                        {/* Cabeçalho da etapa (abre e fecha) */}
                        <button
                          type="button"
                          aria-expanded={aberta}
                          aria-controls={`conteudo-${topico.id_topico}`}
                          onClick={() => alternarAberta(topico.id_topico)}
                          className="flex w-full items-start gap-3 px-5 pb-2 pt-4 text-left"
                        >
                          <div className="min-w-0 flex-1">
                            <span
                              className="rounded-md bg-indigo-100 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide"
                              style={{ color: COR_ACCENT }}
                            >
                              etapa {idx + 1}
                            </span>
                            <h2 className="mt-2 text-xl font-semibold text-gray-900">{topico.titulo}</h2>
                            {topico.descricao && (
                              <p className="mt-1 text-base leading-relaxed text-gray-500">{topico.descricao}</p>
                            )}
                          </div>

                          <div className="flex shrink-0 items-center gap-2 pt-0.5">
                            {topico.estudado ? (
                              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
                                <Check size={12} />
                                Concluída
                              </span>
                            ) : ehAtual ? (
                              <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-medium text-indigo-700">
                                <span className="h-2 w-2 rounded-full border-2 border-indigo-500" />
                                Explorando
                              </span>
                            ) : null}
                            <ChevronDown
                              size={20}
                              className={`text-gray-400 transition-transform ${aberta ? "rotate-180" : ""}`}
                            />
                          </div>
                        </button>

                        {/* Recursos da etapa (fora do botão para não aninhar elementos clicáveis) */}
                        <div className="px-5 pb-4">
                          <RecursosBadge tipo="topico" id={topico.id_topico} readOnly />
                        </div>

                        {/* Conteúdo da etapa */}
                        {aberta && (
                          <div id={`conteudo-${topico.id_topico}`} className="space-y-3 px-5 pb-5">
                            {topico.subitens.length > 0 ? (
                              <div className="rounded-xl border border-[#ded9fa] bg-white/70 p-3">
                                <div className="mb-3 flex items-center justify-between px-1">
                                  <div className="flex items-center gap-2 text-sm font-semibold text-gray-800">
                                    <ListChecks size={16} className="text-indigo-700" />
                                    Conteúdo da etapa
                                  </div>
                                  <span className="text-xs text-gray-500">
                                    {topicosEstudados}/{topico.subitens.length}{" "}
                                    {topico.subitens.length === 1 ? "tópico" : "tópicos"}
                                  </span>
                                </div>

                                <div className="space-y-2.5">
                                  {topico.subitens.map((sub, subIdx) => {
                                    const Icone = ICONES_TOPICO[subIdx % ICONES_TOPICO.length];
                                    const cor = CORES_TOPICO[subIdx % CORES_TOPICO.length];

                                    return (
                                      <div
                                        key={sub.id_subitem}
                                        className="flex items-start gap-3 rounded-xl border border-[#ece3c6] bg-white px-3 py-3"
                                      >
                                        <button
                                          onClick={() =>
                                            handleToggleSubitem(topico.id_topico, sub.id_subitem, !sub.estudado)
                                          }
                                          aria-pressed={sub.estudado}
                                          title={sub.estudado ? "Marcar como não estudado" : "Marcar como estudado"}
                                          className="mt-2 flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center rounded-full border-2 transition-colors"
                                          style={{
                                            backgroundColor: sub.estudado ? COR_ACCENT : "#ffffff",
                                            borderColor: COR_ACCENT,
                                          }}
                                        >
                                          {sub.estudado && <Check size={12} className="text-white" />}
                                        </button>

                                        <span
                                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${cor}`}
                                          aria-hidden="true"
                                        >
                                          <Icone size={20} />
                                        </span>

                                        <div className="min-w-0 flex-1">
                                          <h3
                                            className={`text-lg font-semibold ${
                                              sub.estudado ? "text-gray-500" : "text-gray-900"
                                            }`}
                                          >
                                            {sub.titulo}
                                          </h3>
                                          {sub.descricao && (
                                            <p className="mt-0.5 text-base leading-relaxed text-gray-500">
                                              {sub.descricao}
                                            </p>
                                          )}
                                          <div className="mt-1.5">
                                            <RecursosBadge tipo="subitem" id={sub.id_subitem} readOnly />
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            ) : (
                              <p className="px-1 text-sm text-gray-500">
                                Esta etapa não tem tópicos extras. Estude os recursos e marque o círculo ao lado
                                quando terminar.
                              </p>
                            )}

                            <div className="flex justify-end">
                              <button
                                type="button"
                                onClick={() => handleToggleTopico(topico.id_topico, !topico.estudado)}
                                className="rounded-xl border px-4 py-2 text-sm font-medium transition-colors hover:bg-white"
                                style={{ borderColor: COR_ACCENT, color: COR_ACCENT }}
                              >
                                {topico.estudado ? "Desmarcar etapa" : "Marcar etapa como concluída"}
                              </button>
                            </div>

                            <div className="flex items-center gap-2.5 rounded-xl bg-[#e9e6ff] px-4 py-2.5 text-sm text-indigo-900">
                              <Lightbulb size={18} className="shrink-0 text-indigo-600" />
                              <p>
                                <span className="font-semibold">Dica:</span>{" "}
                                {DICAS_ETAPA[idx % DICAS_ETAPA.length]}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Coluna lateral */}
          <aside className="flex flex-col gap-5 lg:sticky lg:top-24 lg:self-start">
            <section className="rounded-2xl border border-[#ece3c6] bg-white/80 p-5 shadow-sm">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">Sobre esta trilha</h3>
                <Info size={16} className="text-gray-400" />
              </div>

              <dl className="space-y-1 text-sm text-gray-600">
                <div className="flex justify-between">
                  <dt>Etapas</dt>
                  <dd className="font-medium text-gray-800">
                    {etapasConcluidas}/{topicos.length}
                  </dd>
                </div>
                {totalTopicos > 0 && (
                  <div className="flex justify-between">
                    <dt>Tópicos estudados</dt>
                    <dd className="font-medium text-gray-800">
                      {topicos.reduce((acc, t) => acc + t.subitens.filter((s) => s.estudado).length, 0)}/
                      {totalTopicos}
                    </dd>
                  </div>
                )}
              </dl>

              {roadmap.labels.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {roadmap.labels.map((label) => (
                    <span
                      key={label}
                      className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs text-indigo-700"
                    >
                      {label}
                    </span>
                  ))}
                </div>
              )}

              {topicos.length > 0 && (
                <>
                  <p className="mb-2 mt-4 text-sm font-semibold text-gray-900">O que você vai aprender:</p>
                  <ul className="space-y-1.5">
                    {topicos.slice(0, 6).map((t) => (
                      <li key={t.id_topico} className="flex items-center gap-2 text-sm text-gray-600">
                        <Check
                          size={14}
                          className="shrink-0"
                          style={{ color: t.estudado ? COR_ACCENT : "#c9c3a8" }}
                        />
                        <span className={t.estudado ? "text-gray-800" : ""}>{t.titulo}</span>
                      </li>
                    ))}
                    {topicos.length > 6 && (
                      <li className="pl-6 text-xs text-gray-400">e mais {topicos.length - 6} etapas</li>
                    )}
                  </ul>
                </>
              )}
            </section>

            <section
              className="rounded-2xl p-5 text-center text-white shadow-md"
              style={{ background: `linear-gradient(135deg, ${COR_ACCENT}, #1f237d)` }}
            >
              <span className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-white/10">
                <Rocket size={22} />
              </span>
              <p className="text-sm font-medium leading-snug">
                {etapaAtualId === null && topicos.length > 0
                  ? "Você concluiu todas as etapas. Parabéns!"
                  : "Continue estudando e alcance seus objetivos!"}
              </p>
              {etapaAtualId !== null && (
                <button
                  type="button"
                  onClick={continuarDeOndeParou}
                  className="mt-4 w-full rounded-xl bg-white px-4 py-2 text-sm font-semibold transition-colors hover:bg-indigo-50"
                  style={{ color: COR_ACCENT }}
                >
                  Continuar de onde parou
                </button>
              )}
            </section>
          </aside>
        </div>
      </main>
    </div>
  );
}