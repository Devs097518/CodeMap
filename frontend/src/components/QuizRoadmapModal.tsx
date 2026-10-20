// src/components/QuizRoadmapModal.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------

// Dados mínimos que o quiz precisa de cada roadmap (a página monta isso a partir do service)
export interface RoadmapQuiz {
  id_roadmap: number;
  titulo: string;
  descricao?: string | null;
  categoriaNome: string;
  labels: string[];
}

export interface Recomendacao {
  roadmap: RoadmapQuiz;
  temas: Tema[]; // temas do quiz que combinam com as labels do roadmap
  score: number;
  cobertura: number; // % do perfil do usuário que o roadmap cobre
}

// ---------------------------------------------------------------------------
// Temas: ligam as respostas do quiz às labels (digitadas livremente pelo admin)
// ---------------------------------------------------------------------------

// `palavras` são variações aceitas: uma label como "Front-end" ou "HTML & CSS" é
// reconhecida mesmo sem ser escrita exatamente igual.
const TEMAS = {
  logica: { nome: "Lógica", palavras: ["logica", "algoritmo", "programacao", "fundamentos"] },
  iniciante: { nome: "Para começar", palavras: ["iniciante", "basico", "fundamentos", "comecando"] },
  avancado: { nome: "Aprofundamento", palavras: ["avancado", "intermediario", "aprofundamento"] },
  web: { nome: "Web", palavras: ["web", "front", "html", "css", "interface", "site"] },
  javascript: { nome: "JavaScript", palavras: ["javascript", "js", "typescript", "react", "node"] },
  backend: { nome: "Back-end", palavras: ["back", "api", "servidor", "node", "express"] },
  dados: { nome: "Dados", palavras: ["banco", "dados", "sql", "postgres", "database"] },
  seguranca: { nome: "Segurança", palavras: ["seguranca", "cyber", "cripto", "hacking", "protecao"] },
  mobile: { nome: "Mobile", palavras: ["mobile", "android", "ios", "flutter", "aplicativo"] },
  devops: { nome: "DevOps", palavras: ["devops", "docker", "cloud", "nuvem", "deploy", "linux", "infra"] },
  ia: { nome: "IA e ciência de dados", palavras: ["ia", "inteligencia", "machine", "python", "ciencia"] },
  jogos: { nome: "Jogos", palavras: ["jogo", "game", "unity"] },
} as const;

export type Tema = keyof typeof TEMAS;

// ---------------------------------------------------------------------------
// Perguntas (fixas no código)
// ---------------------------------------------------------------------------

interface Opcao {
  texto: string;
  pesos: Partial<Record<Tema, number>>;
}

interface Pergunta {
  id: string;
  titulo: string;
  opcoes: Opcao[];
}

const PERGUNTAS: Pergunta[] = [
  {
    id: "objetivo",
    titulo: "O que você quer fazer com programação?",
    opcoes: [
      { texto: "Criar sites e páginas web", pesos: { web: 3, javascript: 1 } },
      { texto: "Construir sistemas e APIs por trás dos aplicativos", pesos: { backend: 3, dados: 1 } },
      { texto: "Desenvolver aplicativos para celular", pesos: { mobile: 3, javascript: 1 } },
      { texto: "Criar jogos", pesos: { jogos: 3, logica: 1 } },
      { texto: "Trabalhar com dados e inteligência artificial", pesos: { ia: 3, dados: 2 } },
      { texto: "Proteger sistemas e dados", pesos: { seguranca: 3 } },
    ],
  },
  {
    id: "nivel",
    titulo: "Qual é o seu nível hoje?",
    opcoes: [
      { texto: "Estou começando do zero", pesos: { iniciante: 3, logica: 2 } },
      { texto: "Já sei o básico e quero praticar", pesos: { iniciante: 1, logica: 1 } },
      { texto: "Já programo e quero me aprofundar", pesos: { avancado: 3 } },
    ],
  },
  {
    id: "desafio",
    titulo: "Qual destes desafios mais te anima?",
    opcoes: [
      { texto: "Deixar uma interface bonita e interativa", pesos: { web: 2, javascript: 2 } },
      { texto: "Organizar e guardar informações", pesos: { dados: 3 } },
      { texto: "Resolver problemas de lógica", pesos: { logica: 3 } },
      { texto: "Descobrir como proteger contra ataques", pesos: { seguranca: 3 } },
      { texto: "Automatizar e colocar sistemas no ar", pesos: { devops: 3, backend: 1 } },
    ],
  },
  {
    id: "meta",
    titulo: "Qual é a sua meta principal?",
    opcoes: [
      { texto: "Entrar no mercado de tecnologia", pesos: { logica: 1, web: 1, backend: 1 } },
      { texto: "Criar meu próprio projeto ou produto", pesos: { web: 2, backend: 1, mobile: 1 } },
      { texto: "Mudar de área na minha carreira", pesos: { logica: 2, web: 1 } },
      { texto: "Aprender por curiosidade e hobby", pesos: { logica: 1, jogos: 1 } },
    ],
  },
  {
    id: "curiosidade",
    titulo: "Qual tecnologia te desperta mais curiosidade?",
    opcoes: [
      { texto: "JavaScript", pesos: { javascript: 3, web: 1 } },
      { texto: "Python", pesos: { ia: 2, logica: 1 } },
      { texto: "SQL e bancos de dados", pesos: { dados: 3 } },
      { texto: "Linux e Docker", pesos: { devops: 3 } },
      { texto: "Ainda não conheço nenhuma", pesos: { logica: 2, iniciante: 1 } },
    ],
  },
];

// ---------------------------------------------------------------------------
// Pontuação
// ---------------------------------------------------------------------------

const semAcento = (s: string) =>
  s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

// Uma label combina com uma palavra do tema se:
// - a palavra é curta (até 3 letras, como "js" ou "ia"): precisa ser uma palavra inteira da label;
// - senão: a label contém a palavra (ex.: "front-end" contém "front") ou o contrário.
function labelCombina(label: string, palavra: string) {
  const tokens = semAcento(label).split(/[^a-z0-9]+/).filter(Boolean);
  if (palavra.length <= 3) return tokens.includes(palavra);

  const compacta = semAcento(label).replace(/[^a-z0-9]/g, "");
  return compacta.includes(palavra) || tokens.some((t) => t.length >= 4 && palavra.includes(t));
}

// Sem labels cadastradas, usa o título e a categoria para o quiz já funcionar
function temasDoRoadmap(r: RoadmapQuiz): Tema[] {
  const fontes = r.labels.length > 0 ? r.labels : [r.titulo, r.categoriaNome];
  return (Object.keys(TEMAS) as Tema[]).filter((tema) =>
    TEMAS[tema].palavras.some((palavra) => fontes.some((label) => labelCombina(label, palavra)))
  );
}

export function recomendarRoadmaps(respostas: number[], roadmaps: RoadmapQuiz[]): Recomendacao[] {
  const pontos: Partial<Record<Tema, number>> = {};

  respostas.forEach((escolha, i) => {
    const opcao = PERGUNTAS[i]?.opcoes[escolha];
    if (!opcao) return;
    (Object.entries(opcao.pesos) as [Tema, number][]).forEach(([tema, peso]) => {
      pontos[tema] = (pontos[tema] ?? 0) + peso;
    });
  });

  const total = Object.values(pontos).reduce<number>((soma, p) => soma + (p ?? 0), 0);
  if (total === 0) return [];

  return roadmaps
    .map((roadmap) => {
      const temas = temasDoRoadmap(roadmap);
      const score = temas.reduce((soma, t) => soma + (pontos[t] ?? 0), 0);
      return { roadmap, temas, score, cobertura: Math.min(100, Math.round((score / total) * 100)) };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score || a.roadmap.titulo.localeCompare(b.roadmap.titulo, "pt-BR"))
    .slice(0, 3);
}

// ---------------------------------------------------------------------------
// Card de entrada (vai na coluna direita da tela de início)
// ---------------------------------------------------------------------------

export function CardQuiz({ onIniciar }: { onIniciar: () => void }) {
  return (
    <section className="rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 p-5 text-white shadow-md">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/15" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
            <circle cx="12" cy="12" r="10" />
            <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
          </svg>
        </span>
        <div>
          <h3 className="font-semibold">Descubra seu caminho</h3>
          <p className="mt-1 text-sm leading-relaxed text-white/80">
            Responda {PERGUNTAS.length} perguntas rápidas e receba até 3 roadmaps ideais para os seus objetivos.
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={onIniciar}
        className="mt-4 w-full rounded-xl bg-white px-4 py-2.5 font-semibold text-indigo-700 transition-colors hover:bg-indigo-50 active:scale-[0.99]"
      >
        Fazer o quiz
      </button>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Modal
// ---------------------------------------------------------------------------

interface QuizRoadmapModalProps {
  roadmaps: RoadmapQuiz[]; // candidatos (a página já tira os que o usuário iniciou)
  metasIds: number[]; // roadmaps que já estão na lista de metas
  onAdicionarMeta: (id_roadmap: number) => Promise<void>;
  onClose: () => void;
}

export function QuizRoadmapModal({ roadmaps, metasIds, onAdicionarMeta, onClose }: QuizRoadmapModalProps) {
  const [etapa, setEtapa] = useState(0); // 0..PERGUNTAS.length-1 = perguntas; PERGUNTAS.length = resultado
  const [respostas, setRespostas] = useState<(number | null)[]>(() => PERGUNTAS.map(() => null));
  const [adicionadas, setAdicionadas] = useState<number[]>([]);
  const [adicionando, setAdicionando] = useState<number | null>(null);
  const [erroMeta, setErroMeta] = useState("");
  const dialogRef = useRef<HTMLDivElement>(null);

  const emResultado = etapa >= PERGUNTAS.length;
  const pergunta = PERGUNTAS[etapa];

  const recomendacoes = useMemo(
    () => (emResultado ? recomendarRoadmaps(respostas.map((r) => r ?? -1), roadmaps) : []),
    [emResultado, respostas, roadmaps]
  );

  useEffect(() => {
    dialogRef.current?.focus();
    const aoTeclar = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", aoTeclar);
    return () => document.removeEventListener("keydown", aoTeclar);
  }, [onClose]);

  const escolher = (indice: number) =>
    setRespostas((prev) => prev.map((r, i) => (i === etapa ? indice : r)));

  const refazer = () => {
    setRespostas(PERGUNTAS.map(() => null));
    setAdicionadas([]);
    setErroMeta("");
    setEtapa(0);
  };

  const adicionar = async (id: number) => {
    setErroMeta("");
    setAdicionando(id);
    try {
      await onAdicionarMeta(id);
      setAdicionadas((prev) => [...prev, id]);
    } catch {
      setErroMeta("Não foi possível adicionar agora. Tente novamente.");
    } finally {
      setAdicionando(null);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(15,12,40,0.5)] p-4 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="quiz-titulo"
        tabIndex={-1}
        className="flex max-h-[90vh] w-full max-w-xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl outline-none"
      >
        {/* Cabeçalho */}
        <div className="flex items-center justify-between gap-4 border-b border-gray-100 px-6 py-4">
          <div className="min-w-0 flex-1">
            {emResultado ? (
              <p className="text-sm font-medium text-indigo-700">Resultado</p>
            ) : (
              <>
                <p className="text-sm font-medium text-indigo-700">
                  Pergunta {etapa + 1} de {PERGUNTAS.length}
                </p>
                <div
                  role="progressbar"
                  aria-valuemin={0}
                  aria-valuemax={PERGUNTAS.length}
                  aria-valuenow={etapa + 1}
                  className="mt-2 h-1.5 overflow-hidden rounded-full bg-gray-100"
                >
                  <div
                    className="h-full rounded-full bg-indigo-600 transition-all duration-300"
                    style={{ width: `${((etapa + 1) / PERGUNTAS.length) * 100}%` }}
                  />
                </div>
              </>
            )}
          </div>
          <button
            type="button"
            aria-label="Fechar quiz"
            onClick={onClose}
            className="rounded-full p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" className="h-5 w-5">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Corpo */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {!emResultado && pergunta && (
            <>
              <h2 id="quiz-titulo" className="mb-5 text-xl font-bold leading-tight text-gray-900">
                {pergunta.titulo}
              </h2>

              <div role="radiogroup" aria-labelledby="quiz-titulo" className="space-y-2.5">
                {pergunta.opcoes.map((opcao, i) => {
                  const marcada = respostas[etapa] === i;
                  return (
                    <button
                      key={opcao.texto}
                      type="button"
                      role="radio"
                      aria-checked={marcada}
                      onClick={() => escolher(i)}
                      className={`flex w-full items-center gap-3 rounded-xl border-2 px-4 py-3 text-left transition-all ${
                        marcada
                          ? "border-indigo-600 bg-indigo-50 text-gray-900"
                          : "border-gray-200 bg-white text-gray-700 hover:border-indigo-300"
                      }`}
                    >
                      <span
                        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
                          marcada ? "border-indigo-600" : "border-gray-300"
                        }`}
                        aria-hidden="true"
                      >
                        {marcada && <span className="h-2.5 w-2.5 rounded-full bg-indigo-600" />}
                      </span>
                      <span className="text-base">{opcao.texto}</span>
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {emResultado && (
            <>
              <h2 id="quiz-titulo" className="text-xl font-bold leading-tight text-gray-900">
                {recomendacoes.length > 0 ? "Roadmaps ideais para você" : "Ainda não achamos um roadmap ideal"}
              </h2>

              {recomendacoes.length === 0 ? (
                <p className="mt-3 text-sm leading-relaxed text-gray-500">
                  Nenhum dos roadmaps disponíveis combina com as suas respostas. Você pode refazer o quiz ou
                  explorar a lista completa na tela de início.
                </p>
              ) : (
                <>
                  <p className="mt-1 text-sm text-gray-500">
                    Escolhemos com base nas suas respostas. Adicione às suas metas os que quiser começar.
                  </p>

                  <ol className="mt-5 space-y-4">
                    {recomendacoes.map((rec, i) => {
                      const id = rec.roadmap.id_roadmap;
                      const naLista = metasIds.includes(id) || adicionadas.includes(id);
                      const carregando = adicionando === id;

                      return (
                        <li key={id} className="rounded-2xl border border-gray-200 p-4">
                          <div className="flex items-start gap-3">
                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-sm font-bold text-white">
                              {i + 1}
                            </span>
                            <div className="min-w-0 flex-1">
                              <p className="font-semibold text-gray-900">{rec.roadmap.titulo}</p>
                              <p className="mt-0.5 text-sm text-gray-500">
                                {rec.roadmap.descricao?.trim() || rec.roadmap.categoriaNome}
                              </p>

                              <p className="mt-2 text-xs text-gray-600">
                                Combina com: {rec.temas.map((t) => TEMAS[t].nome).join(", ")}
                              </p>

                              {rec.roadmap.labels.length > 0 && (
                                <div className="mt-2 flex flex-wrap gap-1.5">
                                  {rec.roadmap.labels.slice(0, 4).map((label) => (
                                    <span
                                      key={label}
                                      className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs text-gray-600"
                                    >
                                      {label}
                                    </span>
                                  ))}
                                </div>
                              )}

                              <div className="mt-3 flex items-center gap-2">
                                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-gray-100">
                                  <div
                                    className="h-full rounded-full bg-indigo-500"
                                    style={{ width: `${rec.cobertura}%` }}
                                  />
                                </div>
                                <span className="shrink-0 text-xs text-gray-500">
                                  Cobre {rec.cobertura}% do seu perfil
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="mt-4 flex flex-wrap items-center gap-2">
                            <button
                              type="button"
                              disabled={naLista || carregando}
                              onClick={() => adicionar(id)}
                              className={`rounded-xl px-4 py-2 text-sm font-semibold transition-colors disabled:cursor-not-allowed ${
                                naLista
                                  ? "bg-emerald-50 text-emerald-700"
                                  : "bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-60"
                              }`}
                            >
                              {naLista ? "✓ Na sua lista de metas" : carregando ? "Adicionando..." : "Adicionar às minhas metas"}
                            </button>

                            <Link
                              href={`/dashboard/user/roadmap/${id}`}
                              className="rounded-xl px-3 py-2 text-sm font-medium text-indigo-700 hover:bg-indigo-50"
                            >
                              Ver roadmap
                            </Link>
                          </div>
                        </li>
                      );
                    })}
                  </ol>

                  {erroMeta && <p className="mt-3 text-sm text-red-500">{erroMeta}</p>}
                </>
              )}
            </>
          )}
        </div>

        {/* Rodapé */}
        <div className="flex items-center justify-between gap-3 border-t border-gray-100 px-6 py-4">
          {emResultado ? (
            <>
              <button
                type="button"
                onClick={refazer}
                className="rounded-xl px-4 py-2.5 font-medium text-gray-600 transition-colors hover:bg-gray-100"
              >
                Refazer quiz
              </button>
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl bg-[#1a0066] px-5 py-2.5 font-semibold text-white transition-all hover:brightness-125"
              >
                Concluir
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                disabled={etapa === 0}
                onClick={() => setEtapa((e) => e - 1)}
                className="rounded-xl px-4 py-2.5 font-medium text-gray-600 transition-colors hover:bg-gray-100 disabled:opacity-40 disabled:hover:bg-transparent"
              >
                Voltar
              </button>
              <button
                type="button"
                disabled={respostas[etapa] === null}
                onClick={() => setEtapa((e) => e + 1)}
                className="rounded-xl bg-[#1a0066] px-5 py-2.5 font-semibold text-white transition-all hover:brightness-125 disabled:opacity-40 disabled:hover:brightness-100"
              >
                {etapa === PERGUNTAS.length - 1 ? "Ver recomendações" : "Próxima"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}