"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { buscarRoadmap, Roadmap } from "@/service/roadmap-service";
import { listarTopicosComProgresso, TopicoComProgresso } from "@/service/topico-service";
import { alternarProgressoTopico, alternarProgressoSubitem } from "@/service/progresso-service";
import RecursosBadge from "@/components/RecursoModal";

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

  if (loading) {
    return <main className="min-h-screen bg-white px-10 py-10 font-sans text-gray-400 text-xl">Carregando...</main>;
  }

  if (erro && !roadmap) {
    return <main className="min-h-screen bg-white px-10 py-10 font-sans text-red-500">{erro}</main>;
  }

  if (!roadmap) {
    return <main className="min-h-screen bg-white px-10 py-10 font-sans text-red-500">Roadmap não encontrado.</main>;
  }

  return (
    <main className="min-h-screen bg-white px-10 py-10 font-sans">
      <Link href="/dashboard/user/inicio" className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6">
        <ArrowLeft size={16} />
        voltar ao início
      </Link>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">{roadmap.titulo}</h1>
        {roadmap.descricao && <p className="text-sm text-gray-600 mt-3">{roadmap.descricao}</p>}
      </div>

      {erro && <p className="text-red-500 text-sm mb-4">{erro}</p>}

      <div className="flex flex-col gap-4">
        {topicos.length === 0 ? (
          <p className="text-gray-400 text-xl">Nenhum tópico disponível ainda.</p>
        ) : (
          topicos.map((topico) => (
            <div key={topico.id_topico} className="border border-gray-200 rounded-2xl px-6 py-5">
              <label className="flex items-center gap-2 text-xs text-gray-500 mb-2 cursor-pointer w-fit">
                <input
                  type="checkbox"
                  checked={topico.estudado}
                  onChange={(e) => handleToggleTopico(topico.id_topico, e.target.checked)}
                />
                estudado
              </label>

              <h2 className="text-lg font-semibold text-gray-900">{topico.titulo}</h2>
              {topico.descricao && <p className="text-sm text-gray-600 mt-2">{topico.descricao}</p>}

              <div className="mt-3">
                <p className="text-sm font-semibold text-gray-800 mb-1">Recursos</p>
                <RecursosBadge tipo="topico" id={topico.id_topico} readOnly />
              </div>

              {topico.subitens.length > 0 && (
                <div className="border-l-2 border-gray-200 ml-2 pl-5 mt-4 flex flex-col gap-4">
                  {topico.subitens.map((sub) => (
                    <div key={sub.id_subitem} className="border border-gray-200 rounded-2xl px-5 py-4">
                      <label className="flex items-center gap-2 text-xs text-gray-500 mb-2 cursor-pointer w-fit">
                        <input
                          type="checkbox"
                          checked={sub.estudado}
                          onChange={(e) => handleToggleSubitem(topico.id_topico, sub.id_subitem, e.target.checked)}
                        />
                        estudado
                      </label>

                      <h3 className="text-base font-semibold text-gray-900">{sub.titulo}</h3>
                      {sub.descricao && <p className="text-sm text-gray-600 mt-2">{sub.descricao}</p>}

                      <div className="mt-3">
                        <p className="text-sm font-semibold text-gray-800 mb-1">Recursos</p>
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
  );
}