"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { buscarRoadmap, Roadmap } from "@/service/roadmap-service";
import { listarTopicosComProgresso, TopicoComProgresso } from "@/service/topico-service";
import { alternarProgressoTopico, alternarProgressoSubitem } from "@/service/progresso-service";
import RecursosBadge from "@/components/RecursoModal";

// Paleta e escala de fontes padronizadas com a tela de notas
const COR_BG_PAGINA = "#fdf6e2";
const COR_BG_HEADER = "#fbf1ce";
const COR_BG_SUBITEM = "#fbf6e6";
const COR_BORDA = "#ecdfad";
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

  // Navbar reaproveitada em todos os estados (loading, erro, ok)
  const Navbar = () => (
    <header
      className="sticky top-0 z-10 border-b"
      style={{ backgroundColor: COR_BG_HEADER, borderColor: COR_BORDA }}
    >
      <div className="mx-auto flex items-center px-4 sm:px-6 lg:px-8 py-4">
        <Link
          href="/dashboard/user/inicio"
          className="flex items-center gap-2 text-lg text-gray-600 hover:gap-3 transition-all"
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
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900">{roadmap.titulo}</h1>
          {roadmap.descricao && (
            <p className="text-base text-gray-500 leading-relaxed mt-3">{roadmap.descricao}</p>
          )}
        </div>

        {erro && <p className="text-red-500 text-sm mb-4 text-center">{erro}</p>}

        <div className="flex flex-col gap-4">
          {topicos.length === 0 ? (
            <p className="text-gray-400 text-center">Nenhum tópico disponível ainda.</p>
          ) : (
            topicos.map((topico) => (
              <div
                key={topico.id_topico}
                className="bg-white shadow-md rounded-2xl px-4 sm:px-6 py-5"
              >
                <label className="flex items-center gap-2 text-sm text-gray-500 mb-2 cursor-pointer w-fit">
                  <input
                    type="checkbox"
                    checked={topico.estudado}
                    className="cursor-pointer w-3 h-3 accent-emerald-600 rounded"
                    onChange={(e) => handleToggleTopico(topico.id_topico, e.target.checked)}
                  />
                  estudado
                </label>

                <h2 className="text-xl font-semibold text-gray-900">{topico.titulo}</h2>
                {topico.descricao && (
                  <p className="text-base text-gray-500 leading-relaxed mt-2">{topico.descricao}</p>
                )}

                <div className="mt-3">
                  <p className="text-sm font-medium tracking-wide uppercase text-gray-500 mb-1">Recursos</p>
                  <RecursosBadge tipo="topico" id={topico.id_topico} readOnly />
                </div>

                {topico.subitens.length > 0 && (
                  <div
                    className="border-l-3 ml-2 pl-3 sm:pl-5 mt-4 flex flex-col gap-4"
                    style={{ borderColor: COR_BORDA }}
                  >
                    {topico.subitens.map((sub) => (
                      <div
                        key={sub.id_subitem}
                        className="rounded-2xl px-4 sm:px-5 py-4 border-2 border-gray-100 shadow-md"
                        style={{ backgroundColor: COR_BG_SUBITEM }}
                      >
                        <label className="flex items-center gap-2 text-sm text-gray-500 mb-2 cursor-pointer w-fit">
                          <input
                            type="checkbox"
                            checked={sub.estudado}
                            className="cursor-pointer w-3 h-3 accent-emerald-600 rounded"
                            onChange={(e) => handleToggleSubitem(topico.id_topico, sub.id_subitem, e.target.checked)}
                          />
                          estudado
                        </label>

                        <h3 className="text-lg font-medium text-gray-800">{sub.titulo}</h3>
                        {sub.descricao && (
                          <p className="text-base text-gray-500 leading-relaxed mt-2">{sub.descricao}</p>
                        )}

                        <div className="mt-3">
                          <p className="text-sm font-medium tracking-wide uppercase text-gray-500 mb-1">Recursos</p>
                          <RecursosBadge tipo="subitem" id={sub.id_subitem} readOnly />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}