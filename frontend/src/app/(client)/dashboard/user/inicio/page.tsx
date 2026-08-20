"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { listarCategorias, Categoria } from "@/service/categoria-service";
import { listarRoadmaps, RoadmapComProgresso } from "@/service/roadmap-service";
import { useAuth } from "@/context/AuthContext";

export default function ClientInicioPage() {
  const { usuario } = useAuth();
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [roadmaps, setRoadmaps] = useState<RoadmapComProgresso[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

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

  const iniciados = roadmaps.filter((r) => r.iniciado);
  const categoriasComRoadmap = categorias.filter((c) =>
    roadmaps.some((r) => r.categoria_id === c.id_categoria && !r.iniciado)
  );

  return (
    <main className="min-h-screen bg-white px-4 sm:px-20 lg:px-40 xl:px-70 py-10 font-sans">
      <div className="max-w-6xl mx-auto">
        <div className="mb-10">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight">
            Olá, {username}!
          </h1>
          <p className="text-lg sm:text-xl text-gray-500 mt-0.5">continue seus estudos</p>
          <hr className="border mt-8" />
        </div>

        {erro && <p className="text-red-500 text-sm mb-4">{erro}</p>}

        {loading ? (
          <p className="text-gray-400 text-xl">Carregando...</p>
        ) : (
          <>
            {iniciados.length > 0 && (
              <div className="mb-10">
                <p className="text-xl font-semibold text-gray-800 mb-4">Continue estudando</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4">
                  {iniciados.map((roadmap) => {
                    const categoria = categorias.find((c) => c.id_categoria === roadmap.categoria_id);
                    return (
                      <RoadmapCard key={roadmap.id_roadmap} roadmap={roadmap} categoriaNome={categoria?.nome ?? ""} />
                    );
                  })}
                </div>
              </div>
            )}

            {categoriasComRoadmap.length === 0 ? (
              <p className="text-gray-400 text-xl">Nenhum roadmap disponível ainda.</p>
            ) : (
              <div className="flex flex-col gap-8">
                {categoriasComRoadmap.map((categoria) => (
                  <section key={categoria.id_categoria}>
                    <p className="text-xl font-semibold text-gray-800 mb-4">{categoria.nome}</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4">
                      {roadmaps
                        .filter((r) => r.categoria_id === categoria.id_categoria && !r.iniciado)
                        .map((roadmap) => (
                          <RoadmapCard key={roadmap.id_roadmap} roadmap={roadmap} categoriaNome={categoria.nome} />
                        ))}
                    </div>
                  </section>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}

function RoadmapCard({ roadmap, categoriaNome }: { roadmap: RoadmapComProgresso; categoriaNome: string }) {
  return (
    <Link
      href={`/dashboard/user/roadmap/${roadmap.id_roadmap}`}
      className="flex flex-col bg-[#ffffff] rounded-2xl px-5 py-5 hover:border-gray-700 border-gray-200 border-3 active:scale-95 transition-all duration-150"
    >
      <span className="text-lg font-semibold text-gray-900 truncate">{roadmap.titulo}</span>
      <span className="text-xs text-gray-600 mt-0.5">{categoriaNome}</span>

      {roadmap.iniciado && (
        <>
          <div className="mt-3 h-2 bg-black/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#1a0066] rounded-full transition-all duration-300"
              style={{ width: `${roadmap.progresso_percentual}%` }}
            />
          </div>
          <span className="text-xs text-gray-700 mt-1">{roadmap.progresso_percentual}% concluído</span>
        </>
      )}
    </Link>
  );
}