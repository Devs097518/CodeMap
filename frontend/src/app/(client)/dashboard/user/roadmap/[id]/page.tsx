"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Check } from "lucide-react";
import { buscarRoadmap, Roadmap } from "@/service/roadmap-service";
import { listarTopicosComProgresso, TopicoComProgresso } from "@/service/topico-service";
import { alternarProgressoTopico, alternarProgressoSubitem } from "@/service/progresso-service";
import RecursosBadge from "@/components/RecursoModal";

const COR_BG_PAGINA = "#fdf6e2";
const COR_BG_HEADER = "#fbf1ce";
const COR_BG_SUBITEM = "#fbf6e6";
const COR_BORDA = "#ecdfad";
const COR_LINHA = "#d8c98f";
const COR_ACCENT = "#0C0F4F";

export default function RoadmapDetalheClientPage() {
  const params = useParams();
  const roadmapId = Number(params.id);

  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  const [topicos, setTopicos] = useState<TopicoComProgresso[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

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

  const totalItens = topicos.length + topicos.reduce((acc, t) => acc + t.subitens.length, 0);
  const itensConcluidos =
    topicos.filter((t) => t.estudado).length +
    topicos.reduce((acc, t) => acc + t.subitens.filter((s) => s.estudado).length, 0);
  const percentual = totalItens > 0 ? Math.round((itensConcluidos / totalItens) * 100) : 0;

  const Navbar = () => (
    <header
      className="sticky top-0 z-20 border-b"
      style={{ backgroundColor: COR_BG_HEADER, borderColor: COR_BORDA }}
    >
      <div className="max-w-3xl mx-auto flex items-center px-4 sm:px-6 lg:px-8 py-4">
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

  if (loading) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: COR_BG_PAGINA }}>
        <Navbar />
        <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-gray-400 text-xl">
          Carregando...
        </main>
      </div>
    );
  }

  if (erro && !roadmap) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: COR_BG_PAGINA }}>
        <Navbar />
        <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-red-500">
          {erro}
        </main>
      </div>
    );
  }

  if (!roadmap) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: COR_BG_PAGINA }}>
        <Navbar />
        <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-red-500">
          Roadmap não encontrado.
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: COR_BG_PAGINA }}>
      <Navbar />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-4 text-center">
          <h1 className="text-3xl font-bold text-gray-900">{roadmap.titulo}</h1>
          {roadmap.descricao && (
            <p className="text-base text-gray-500 leading-relaxed mt-3">{roadmap.descricao}</p>
          )}
        </div>

        {totalItens > 0 && (
          <div className="mb-10 max-w-sm mx-auto">
            <div className="flex items-center justify-between text-sm text-gray-500 mb-1.5">
              <span>progresso da trilha</span>
              <span className="font-semibold" style={{ color: COR_ACCENT }}>{percentual}%</span>
            </div>
            <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: COR_BORDA }}>
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${percentual}%`, backgroundColor: COR_ACCENT }}
              />
            </div>
          </div>
        )}

        {erro && <p className="text-red-500 text-sm mb-4 text-center">{erro}</p>}

        {topicos.length === 0 ? (
          <p className="text-gray-400 text-center">Nenhum tópico disponível ainda.</p>
        ) : (
          <div className="flex flex-col gap-10">
            {topicos.map((topico, idx) => {
              const ultimoTopico = idx === topicos.length - 1;
              return (
                <div key={topico.id_topico} className="relative pl-16">
                  {!ultimoTopico && (
                    <div
                      className="absolute left-5 top-10 -bottom-10 w-0.5"
                      style={{ backgroundColor: COR_LINHA }}
                    />
                  )}

                  <button
                    onClick={() => handleToggleTopico(topico.id_topico, !topico.estudado)}
                    aria-pressed={topico.estudado}
                    title={topico.estudado ? "Marcar como não estudado" : "Marcar como estudado"}
                    className="absolute left-0 top-0 z-10 w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors cursor-pointer"
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

                  <div className="bg-white shadow-md rounded-2xl px-4 sm:px-6 py-5">
                    <p className="text-sm font-medium tracking-wide uppercase mb-1" style={{ color: COR_ACCENT }}>
                      etapa {idx + 1}
                    </p>
                    <h2 className="text-xl font-semibold text-gray-900">{topico.titulo}</h2>
                    {topico.descricao && (
                      <p className="text-base text-gray-500 leading-relaxed mt-2">{topico.descricao}</p>
                    )}

                    <div className="mt-3">
                      <p className="text-sm font-medium tracking-wide uppercase text-gray-500 mb-1">Recursos</p>
                      <RecursosBadge tipo="topico" id={topico.id_topico} readOnly />
                    </div>

                    {topico.subitens.length > 0 && (
                      <div className="flex flex-col gap-3 mt-5">
                        {topico.subitens.map((sub, subIdx) => {
                          const ultimoSub = subIdx === topico.subitens.length - 1;
                          return (
                            <div key={sub.id_subitem} className="relative pl-9">
                              {!ultimoSub && (
                                <div
                                  className="absolute left-3 top-6 -bottom-3 w-0.5"
                                  style={{ backgroundColor: COR_BORDA }}
                                />
                              )}

                              <button
                                onClick={() => handleToggleSubitem(topico.id_topico, sub.id_subitem, !sub.estudado)}
                                aria-pressed={sub.estudado}
                                title={sub.estudado ? "Marcar como não estudado" : "Marcar como estudado"}
                                className="absolute left-0 top-0.5 z-10 w-6 h-6 rounded-full flex items-center justify-center border-2 transition-colors cursor-pointer"
                                style={{
                                  backgroundColor: sub.estudado ? COR_ACCENT : COR_BG_PAGINA,
                                  borderColor: COR_ACCENT,
                                }}
                              >
                                {sub.estudado && <Check size={12} className="text-white" />}
                              </button>

                              <div className="rounded-xl px-4 py-3 shadow-sm border-2 border-gray-300" style={{ backgroundColor: COR_BG_SUBITEM }}>
                                <h3 className="text-lg font-medium text-gray-800">{sub.titulo}</h3>
                                {sub.descricao && (
                                  <p className="text-base text-gray-500 leading-relaxed mt-1.5">{sub.descricao}</p>
                                )}
                                <div className="mt-2">
                                  <p className="text-sm font-medium tracking-wide uppercase text-gray-500 mb-1">Recursos</p>
                                  <RecursosBadge tipo="subitem" id={sub.id_subitem} readOnly />
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}