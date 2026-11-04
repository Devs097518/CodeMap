// app/dashboard/user/cadernos/page.tsx
'use client';

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  listarCadernosPorUsuario,
  criarCaderno,
  excluirCaderno,
  editarCaderno,
  Caderno,
} from "@/service/caderno-service";
import { ConfirmModal } from "@/components/ConfirmModal";
import { AlertModal } from "@/components/AlertModal";
import { EditModal } from "@/components/EditModal";
import { CadernoCard } from "@/components/CadernoCard";
import { LIMITE_PAGINAS_POR_CADERNO } from "@/constants/caderno";

// Paleta alinhada à tela inicial (índigo, laranja, verde...) — usada no ícone e na faixa lateral de cada card
const CORES_LOMBADA = ["#4f46e5", "#f59e0b", "#059669", "#ef4444", "#0ea5e9", "#a855f7", "#14b8a6", "#64748b"];

const RAIO_ANEL = 40;
const CIRCUNFERENCIA = 2 * Math.PI * RAIO_ANEL;

export default function CadernosPage() {
  const { usuario } = useAuth();
  const router = useRouter();
  const [cadernos, setCadernos] = useState<Caderno[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const [novoTitulo, setNovoTitulo] = useState("");
  const [criando, setCriando] = useState(false);

  const [cadernoEditando, setCadernoEditando] = useState<Caderno | null>(null);
  const [cadernoParaExcluir, setCadernoParaExcluir] = useState<Caderno | null>(null);

  useEffect(() => {
    if (!usuario) return;

    listarCadernosPorUsuario(usuario.id_usuario)
      .then(setCadernos)
      .catch((err) => setErro(err.message))
      .finally(() => setLoading(false));
  }, [usuario]);

  // Números do painel de resumo
  const resumo = useMemo(() => {
    const paginasPorCaderno = cadernos.map((c) =>
      Math.min(LIMITE_PAGINAS_POR_CADERNO, c.total_notas ?? 0)
    );
    const totalPaginas = paginasPorCaderno.reduce((soma, p) => soma + p, 0);
    const capacidade = cadernos.length * LIMITE_PAGINAS_POR_CADERNO;
    const percentual = capacidade > 0 ? Math.round((totalPaginas / capacidade) * 100) : 0;
    const cheios = paginasPorCaderno.filter((p) => p >= LIMITE_PAGINAS_POR_CADERNO).length;
    const vazios = paginasPorCaderno.filter((p) => p === 0).length;

    let maisUsado: { titulo: string; paginas: number } | null = null;
    for (const [i, c] of cadernos.entries()) {
      const paginas = paginasPorCaderno[i];
      if (paginas > 0 && (!maisUsado || paginas > maisUsado.paginas)) {
        maisUsado = { titulo: c.titulo, paginas };
      }
    }

    return { totalPaginas, capacidade, percentual, cheios, vazios, maisUsado };
  }, [cadernos]);

  const handleCriar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usuario || !novoTitulo.trim()) return;

    setCriando(true);
    try {
      const caderno = await criarCaderno({ titulo: novoTitulo, id_usuario: usuario.id_usuario });
      setCadernos((prev) => [...prev, caderno]);
      setNovoTitulo("");
    } catch (err: unknown) {
      setErro(err instanceof Error ? err.message : "Erro ao criar caderno");
    } finally {
      setCriando(false);
    }
  };

  const salvarEdicao = async (novoTitulo: string) => {
    if (!cadernoEditando) return;

    try {
      await editarCaderno(cadernoEditando.id_caderno, { titulo: novoTitulo });
      setCadernos((prev) =>
        prev.map((c) =>
          c.id_caderno === cadernoEditando.id_caderno ? { ...c, titulo: novoTitulo } : c
        )
      );
      setCadernoEditando(null);
    } catch (err: unknown) {
      setErro(err instanceof Error ? err.message : "Erro ao editar caderno");
    }
  };

  const confirmarExclusao = async () => {
    if (!cadernoParaExcluir) return;

    try {
      await excluirCaderno(cadernoParaExcluir.id_caderno);
      setCadernos((prev) => prev.filter((c) => c.id_caderno !== cadernoParaExcluir.id_caderno));
    } catch (err: unknown) {
      setErro(err instanceof Error ? err.message : "Erro ao excluir caderno");
    } finally {
      setCadernoParaExcluir(null);
    }
  };

  const abrirCaderno = (caderno: Caderno) => {
    sessionStorage.setItem("id_caderno", String(caderno.id_caderno));
    sessionStorage.setItem("titulo_caderno", caderno.titulo);
    router.push("/dashboard/user/notas");
  };

  return (
    <main className="min-h-screen bg-[#f7f8fd] px-6 py-8">
      <div className="mx-auto max-w-6xl">
        {/* Cabeçalho no estilo da tela inicial, com o formulário de criação */}
        <section className="mb-8 overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-50 via-blue-50/60 to-white p-6 sm:p-8">
          <div className="flex items-start justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm">
                  <svg viewBox="0 0 24 24" fill="none" stroke="#4f46e5" strokeWidth={1.8} className="h-6 w-6" aria-hidden="true">
                    <path d="M4 5a2 2 0 0 1 2-2h12v18H6a2 2 0 0 1-2-2z" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M8 3v18M12 8h3" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-2xl font-bold leading-tight text-slate-900 sm:text-3xl">
                    Meus Cadernos
                  </h1>
                  <p className="text-base text-slate-500">organize suas anotações por caderno</p>
                </div>
              </div>

              <form onSubmit={handleCriar} className="mt-6 flex flex-col gap-3 sm:flex-row">
                <input
                  type="text"
                  placeholder="Nome do novo caderno"
                  value={novoTitulo}
                  onChange={(e) => setNovoTitulo(e.target.value)}
                  className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-base text-slate-800 shadow-sm outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15"
                />
                <button
                  type="submit"
                  disabled={criando || !novoTitulo.trim()}
                  className="rounded-xl bg-[#4f46e5] px-6 py-2.5 text-base font-semibold text-white shadow-sm transition-all duration-200 hover:bg-[#4338ca] active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none"
                >
                  {criando ? "Criando..." : "Novo caderno"}
                </button>
              </form>
            </div>

            {/* Ilustração: pilha de cadernos */}
            <svg viewBox="0 0 120 70" className="hidden h-20 w-36 shrink-0 sm:block" aria-hidden="true">
              <rect x="22" y="8" width="76" height="14" rx="3" fill="#6366f1" />
              <rect x="12" y="26" width="92" height="16" rx="3" fill="#1e1b6b" />
              <rect x="4" y="46" width="108" height="16" rx="3" fill="#312e81" />
              <rect x="92" y="30" width="6" height="8" rx="1.5" fill="#e0e7ff" />
              <rect x="100" y="50" width="6" height="8" rx="1.5" fill="#e0e7ff" />
            </svg>
          </div>
        </section>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
          {/* Coluna principal: lista de cadernos */}
          <section>
            <div className="mb-4 flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-5 w-5" aria-hidden="true">
                    <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg font-semibold leading-tight text-slate-900">Seus cadernos</h2>
                  <p className="text-sm text-slate-500">Abra um caderno para ver e criar suas notas.</p>
                </div>
              </div>
              {!loading && cadernos.length > 0 && (
                <span className="text-xs font-medium text-sky-700">
                  {cadernos.length} {cadernos.length === 1 ? "caderno" : "cadernos"}
                </span>
              )}
            </div>

            {loading ? (
              <p className="text-base text-slate-400">Carregando cadernos...</p>
            ) : cadernos.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 px-6 py-10 text-center text-sm text-slate-500">
                Você ainda não tem cadernos. Dê um nome ao primeiro no campo acima e comece a anotar.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {cadernos.map((caderno, i) => (
                  <CadernoCard
                    key={caderno.id_caderno}
                    titulo={caderno.titulo}
                    cor={CORES_LOMBADA[i % CORES_LOMBADA.length]}
                    // Cada nota ocupa uma página; caderno recém-criado não traz total_notas (conta 0)
                    paginas={caderno.total_notas ?? 0}
                    onOpen={() => abrirCaderno(caderno)}
                    onEdit={() => setCadernoEditando(caderno)}
                    onDelete={() => setCadernoParaExcluir(caderno)}
                  />
                ))}
              </div>
            )}
          </section>

          {/* Painel lateral de resumo */}
          <aside className="flex flex-col gap-4">
            {/* Resumo geral */}
            <div className="rounded-2xl bg-gradient-to-br from-[#1e1b6b] to-[#14124d] p-5 text-white shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-sm font-semibold">Resumo dos cadernos</h2>
                <span className="rounded-md bg-white/10 px-2 py-0.5 text-xs">
                  {cadernos.length} {cadernos.length === 1 ? "caderno" : "cadernos"}
                </span>
              </div>

              <div className="flex items-center gap-5">
                <div className="relative h-24 w-24 shrink-0">
                  <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90" aria-hidden="true">
                    <circle cx="50" cy="50" r={RAIO_ANEL} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="9" />
                    <circle
                      cx="50"
                      cy="50"
                      r={RAIO_ANEL}
                      fill="none"
                      stroke="#93c5fd"
                      strokeWidth="9"
                      strokeLinecap="round"
                      strokeDasharray={CIRCUNFERENCIA}
                      strokeDashoffset={CIRCUNFERENCIA * (1 - resumo.percentual / 100)}
                      className="transition-all duration-500"
                    />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-xl font-bold">
                    {resumo.percentual}%
                  </span>
                </div>

                <div className="text-sm">
                  <p className="text-2xl font-bold leading-none">{resumo.totalPaginas}</p>
                  <p className="mt-1 text-indigo-200">
                    {resumo.totalPaginas === 1 ? "página escrita" : "páginas escritas"}
                  </p>
                  <p className="mt-3 text-xs text-indigo-200">
                    de {resumo.capacidade} disponíveis nos seus cadernos
                  </p>
                </div>
              </div>
            </div>

            {/* Situação dos cadernos */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="mb-3 text-sm font-semibold text-slate-900">Situação</h2>
              <ul className="flex flex-col gap-2.5 text-sm">
                <li className="flex items-center justify-between">
                  <span className="text-slate-600">Cadernos cheios</span>
                  <span className="font-semibold text-slate-900">{resumo.cheios}</span>
                </li>
                <li className="flex items-center justify-between">
                  <span className="text-slate-600">Cadernos vazios</span>
                  <span className="font-semibold text-slate-900">{resumo.vazios}</span>
                </li>
                <li className="flex items-center justify-between gap-3">
                  <span className="shrink-0 text-slate-600">Mais usado</span>
                  <span className="truncate font-semibold text-slate-900" title={resumo.maisUsado?.titulo}>
                    {resumo.maisUsado ? `${resumo.maisUsado.titulo} (${resumo.maisUsado.paginas}/${LIMITE_PAGINAS_POR_CADERNO})` : "—"}
                  </span>
                </li>
              </ul>
            </div>

            {/* Dica */}
            <div className="rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 p-5 text-white shadow-sm">
              <h2 className="text-sm font-semibold">Organize por assunto</h2>
              <p className="mt-1 text-sm text-indigo-100">
                Cada caderno comporta até {LIMITE_PAGINAS_POR_CADERNO} páginas. Crie um caderno para cada
                roadmap ou tema que você estiver estudando.
              </p>
            </div>
          </aside>
        </div>
      </div>

      {cadernoEditando && (
        <EditModal
          titulo="Editar caderno"
          label="Nome do caderno"
          valorInicial={cadernoEditando.titulo}
          onCancel={() => setCadernoEditando(null)}
          onConfirm={salvarEdicao}
        />
      )}

      {cadernoParaExcluir && (
        <ConfirmModal
          titulo="Excluir caderno"
          mensagem={`Tem certeza que deseja excluir "${cadernoParaExcluir.titulo}"? Esta ação não pode ser desfeita.`}
          textoCancelar=""
          textoConfirmar="Excluir"
          textoConfirmando="Excluindo..."
          onCancel={() => setCadernoParaExcluir(null)}
          onConfirm={confirmarExclusao}
        />
      )}

      {erro && (
        <AlertModal
          titulo="Algo deu errado"
          mensagem={erro}
          onClose={() => setErro(null)}
        />
      )}
    </main>
  );
}