// app/dashboard/user/notas/page.tsx
'use client';
import { useState, useEffect, useMemo, useRef, type ReactNode } from "react";
import Link from "next/link";
import {
  listarNotasPorCaderno,
  criarNota,
  editarNota,
  excluirNota,
  type Nota,
} from "@/service/conteudo-service";
import { LIMITE_PAGINAS_POR_CADERNO } from "@/constants/caderno";

type NoteUI = Nota;
type Ordem = "recentes" | "antigas" | "az";

// Paleta do tema (creme + roxo-marinho)
const COR_BG_PAGINA = "#fdf6e2";
const COR_BG_HEADER = "#fbf1ce";
const COR_BORDA_HEADER = "#ecdfad";
const COR_BORDA_CARD = "#ece3c6";
const COR_ACCENT = "#0C0F4F";
const COR_ICONE = "#6f6da8";

// Regras das tags (as mesmas do backend)
const MAX_TAGS_POR_NOTA = 5;
const MAX_CHARS_TAG = 20;

// Cores das tags (fundo / texto). Cada tag sempre recebe a mesma cor.
const CORES_TAG = [
  { bg: "#d6e6fb", text: "#2b5a9a" },
  { bg: "#e8d9fa", text: "#6b3fa0" },
  { bg: "#fde2cf", text: "#b3541e" },
  { bg: "#d5f0de", text: "#2f7a4a" },
  { bg: "#fbdbe7", text: "#a8325f" },
  { bg: "#faefbf", text: "#8a6a0a" },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

// Minúsculas e sem acentos, mantendo o mesmo tamanho do texto original
// (assim dá para destacar o trecho encontrado no texto com acento)
const semAcento = (s: string) =>
  Array.from(s)
    .map((ch) => ch.normalize("NFD").replace(/[\u0300-\u036f]/g, ""))
    .join("")
    .toLowerCase();

function normalizarTag(valor: string) {
  return valor
    .trim()
    .toLowerCase()
    .replace(/^#+/, "")
    .replace(/\s+/g, "-")
    .slice(0, MAX_CHARS_TAG);
}

function corDaTag(tag: string) {
  let h = 0;
  for (let i = 0; i < tag.length; i++) h = (h * 31 + tag.charCodeAt(i)) >>> 0;
  return CORES_TAG[h % CORES_TAG.length];
}

// Destaca no texto o trecho que bate com a busca (ignorando acentos e maiúsculas)
function Destaque({ texto, termo }: { texto: string; termo: string }) {
  const t = semAcento(termo.trim());
  if (!t) return <>{texto}</>;

  const base = semAcento(texto);
  if (base.length !== texto.length) return <>{texto}</>;

  const partes: ReactNode[] = [];
  let i = 0;
  let achou = base.indexOf(t, i);

  while (achou !== -1) {
    if (achou > i) partes.push(texto.slice(i, achou));
    partes.push(
      <mark key={achou} className="rounded bg-yellow-200/80 px-0.5 text-inherit">
        {texto.slice(achou, achou + t.length)}
      </mark>
    );
    i = achou + t.length;
    achou = base.indexOf(t, i);
  }

  partes.push(texto.slice(i));
  return <>{partes}</>;
}

// ---------------------------------------------------------------------------
// Icons
// ---------------------------------------------------------------------------

const EditIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const TrashIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5">
    <polyline points="3 6 5 6 21 6" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6M10 11v6M14 11v6M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const PlusIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
    <line x1="12" y1="5" x2="12" y2="19" strokeLinecap="round" />
    <line x1="5" y1="12" x2="19" y2="12" strokeLinecap="round" />
  </svg>
);

const BackIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
    <path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const SearchIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
    <circle cx="11" cy="11" r="7" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" strokeLinecap="round" />
  </svg>
);

const CloseIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
    <line x1="18" y1="6" x2="6" y2="18" strokeLinecap="round" />
    <line x1="6" y1="6" x2="18" y2="18" strokeLinecap="round" />
  </svg>
);

// ---------------------------------------------------------------------------
// TagsField (campo de tags do modal)
// ---------------------------------------------------------------------------
interface TagsFieldProps {
  tags: string[];
  sugestoes: string[];
  onChange: (tags: string[]) => void;
}

function TagsField({ tags, sugestoes, onChange }: TagsFieldProps) {
  const [entrada, setEntrada] = useState("");
  const cheio = tags.length >= MAX_TAGS_POR_NOTA;

  const adicionar = (bruto: string) => {
    const tag = normalizarTag(bruto);
    setEntrada("");
    if (!tag || tags.includes(tag) || cheio) return;
    onChange([...tags, tag]);
  };

  const sugestoesLivres = sugestoes.filter((s) => !tags.includes(s)).slice(0, 8);

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-1.5 rounded-xl bg-[#fbf6e6] px-3 py-2 border border-transparent focus-within:border-[#0C0F4F]/40 transition-colors">
        {tags.map((tag) => {
          const cor = corDaTag(tag);
          return (
            <span
              key={tag}
              className="inline-flex items-center gap-1 rounded-full pl-2.5 pr-1 py-0.5 text-sm font-medium"
              style={{ backgroundColor: cor.bg, color: cor.text }}
            >
              #{tag}
              <button
                type="button"
                aria-label={`Remover tag ${tag}`}
                onClick={() => onChange(tags.filter((t) => t !== tag))}
                className="rounded-full p-0.5 hover:bg-black/10 transition-colors"
              >
                <CloseIcon />
              </button>
            </span>
          );
        })}

        <input
          type="text"
          value={entrada}
          disabled={cheio}
          maxLength={MAX_CHARS_TAG + 1}
          onChange={(e) => setEntrada(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === ",") {
              e.preventDefault();
              adicionar(entrada);
            } else if (e.key === "Backspace" && !entrada && tags.length) {
              onChange(tags.slice(0, -1));
            }
          }}
          onBlur={() => entrada && adicionar(entrada)}
          placeholder={cheio ? "limite de tags atingido" : tags.length ? "" : "ex.: estudo, ideias..."}
          className="flex-1 min-w-[8rem] bg-transparent py-1 text-base outline-none text-gray-800 placeholder:text-gray-400 disabled:cursor-not-allowed"
        />
      </div>

      <div className="flex items-center justify-between gap-3 text-xs text-gray-400">
        <span>Enter ou vírgula para adicionar</span>
        <span>{tags.length}/{MAX_TAGS_POR_NOTA}</span>
      </div>

      {!cheio && sugestoesLivres.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs text-gray-400">já usadas:</span>
          {sugestoesLivres.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => adicionar(s)}
              className="rounded-full border border-[#ecdfad] bg-white px-2.5 py-0.5 text-xs text-gray-600 hover:bg-[#fbf1ce] transition-colors"
            >
              #{s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// EditModal
// ---------------------------------------------------------------------------
interface EditModalProps {
  note?: NoteUI | null;
  isNew: boolean;
  tagsSugeridas: string[];
  onClose: () => void;
  onSave: (data: { titulo: string; conteudo: string; tags: string[] }) => Promise<void>;
}

function EditModal({ note, isNew, tagsSugeridas, onClose, onSave }: EditModalProps) {
  const [titulo, setTitulo] = useState(note?.titulo ?? "");
  const [conteudo, setConteudo] = useState(note?.conteudo ?? "");
  const [tags, setTags] = useState<string[]>(note?.tags ?? []);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  const handleSave = async () => {
    if (!titulo.trim()) return;
    setLoading(true);
    setErro("");
    try {
      await onSave({
        titulo,
        conteudo,
        tags,
      });
      onClose();
    } catch (e: unknown) {
      setErro(e instanceof Error ? e.message : "Erro ao salvar nota");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[rgba(30,25,10,0.45)] backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-lg max-h-[90vh] flex flex-col rounded-2xl shadow-2xl overflow-hidden bg-[#fffdf6] border border-[#ecdfad]">

        <div className="px-6 py-4 text-center border-b border-[#ecdfad]">
          <h2 className="text-xl font-bold text-gray-900 leading-tight">
            {isNew ? "Nova nota" : "Editar nota"}
          </h2>
        </div>

        <div className="px-6 py-5 space-y-5 overflow-y-auto">

          {erro && (
            <div className="px-4 py-2.5 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
              {erro}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="block text-sm font-medium tracking-wide uppercase text-gray-500">título</label>
            <input
              type="text"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Título da nota..."
              className="w-full rounded-xl px-4 py-2.5 text-base outline-none bg-[#fbf6e6] text-gray-800 placeholder:text-gray-400 border border-transparent focus:border-[#0C0F4F]/40 transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium tracking-wide uppercase text-gray-500">conteúdo</label>
            <textarea
              value={conteudo}
              onChange={(e) => setConteudo(e.target.value)}
              placeholder="Escreva sua nota aqui..."
              rows={8}
              className="w-full rounded-xl px-4 py-2.5 text-base outline-none resize-y bg-[#fbf6e6] text-gray-800 placeholder:text-gray-400 border border-transparent focus:border-[#0C0F4F]/40 transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium tracking-wide uppercase text-gray-500">tags</label>
            <TagsField tags={tags} sugestoes={tagsSugeridas} onChange={setTags} />
          </div>
        </div>

        <div className="px-6 py-4 flex gap-3 border-t border-[#ecdfad]">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl font-medium bg-[#fbf6e6] text-[#0C0F4F] hover:bg-[#f4ecd3] transition-colors disabled:opacity-50"
          >
            cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl font-semibold text-white bg-[#0C0F4F] hover:brightness-125 transition-all disabled:opacity-50"
          >
            {loading ? "salvando..." : "salvar"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// NoteCard
// ---------------------------------------------------------------------------
interface NoteCardProps {
  note: NoteUI;
  pagina: number;
  termo: string;
  tagsAtivas: string[];
  onEdit: () => void;
  onDelete: () => void;
  onToggleTag: (tag: string) => void;
}

function NoteCard({ note, pagina, termo, tagsAtivas, onEdit, onDelete, onToggleTag }: NoteCardProps) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onEdit}
      onKeyDown={(e) => {
        if (e.target !== e.currentTarget) return;
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onEdit();
        }
      }}
      // break-inside-avoid: o card nunca é cortado entre duas colunas do mural
      className="mb-5 w-full break-inside-avoid flex flex-col gap-3 rounded-2xl bg-white border p-5 shadow-sm cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0C0F4F]/40"
      style={{ borderColor: COR_BORDA_CARD }}
    >
      <h3 className="text-lg font-semibold text-gray-900 leading-tight break-words">
        <Destaque texto={note.titulo || "Sem título"} termo={termo} />
      </h3>

      {/* Sem limite de altura: o texto aparece inteiro, com as quebras de linha preservadas */}
      <p className="text-sm leading-relaxed text-gray-600 whitespace-pre-wrap break-words">
        {note.conteudo ? (
          <Destaque texto={note.conteudo} termo={termo} />
        ) : (
          <span className="italic opacity-50">sem conteúdo</span>
        )}
      </p>

      {note.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {note.tags.map((tag) => {
            const cor = corDaTag(tag);
            const ativa = tagsAtivas.includes(tag);
            return (
              <button
                key={tag}
                type="button"
                aria-pressed={ativa}
                title={ativa ? "Remover do filtro" : "Filtrar por esta tag"}
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleTag(tag);
                }}
                className="rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors"
                style={{
                  backgroundColor: ativa ? cor.text : cor.bg,
                  color: ativa ? "#fff" : cor.text,
                }}
              >
                #<Destaque texto={tag} termo={termo} />
              </button>
            );
          })}
        </div>
      )}

      <div className="flex items-center justify-between pt-1">
        <span className="text-xs text-gray-400">Página {pagina}</span>

        <div className="flex items-center gap-0.5" style={{ color: COR_ICONE }}>
          <button
            type="button"
            aria-label="Excluir nota"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="p-1.5 rounded-lg hover:bg-red-50 hover:text-red-400 transition-colors"
          >
            <TrashIcon />
          </button>
          <button
            type="button"
            aria-label="Editar nota"
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            className="p-1.5 rounded-lg hover:bg-violet-50 transition-colors"
          >
            <EditIcon />
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

export default function NotesApp() {
  const [notes, setNotes] = useState<NoteUI[]>([]);
  const [editingNote, setEditingNote] = useState<NoteUI | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [idCaderno, setIdCaderno] = useState<string>("");
  const [nomeCaderno, setNomeCaderno] = useState<string>("Caderno");
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  // Pesquisa, filtro por tags e ordenação
  const [busca, setBusca] = useState("");
  const [tagsFiltro, setTagsFiltro] = useState<string[]>([]);
  const [ordem, setOrdem] = useState<Ordem>("recentes");
  const buscaRef = useRef<HTMLInputElement>(null);

  // Cada nota ocupa uma página do caderno
  const limiteAtingido = notes.length >= LIMITE_PAGINAS_POR_CADERNO;

  // Número da página de cada nota (pela ordem de criação), independente de filtro e ordenação
  const paginaPorId = useMemo(() => {
    const mapa = new Map<number, number>();
    [...notes]
      .sort((a, b) => a.id_nota - b.id_nota)
      .forEach((n, i) => mapa.set(n.id_nota, i + 1));
    return mapa;
  }, [notes]);

  // Todas as tags do caderno, da mais usada para a menos usada
  const todasTags = useMemo(() => {
    const contagem = new Map<string, number>();
    notes.forEach((n) => n.tags.forEach((t) => contagem.set(t, (contagem.get(t) ?? 0) + 1)));
    return Array.from(contagem.entries()).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  }, [notes]);

  // Notas que passam pela pesquisa e pelos filtros (a nota precisa ter todas as tags selecionadas)
  const notasVisiveis = useMemo(() => {
    const termo = semAcento(busca.trim());

    const lista = notes.filter((n) => {
      if (tagsFiltro.some((t) => !n.tags.includes(t))) return false;
      if (!termo) return true;
      const palheiro = semAcento(`${n.titulo ?? ""}\n${n.conteudo ?? ""}\n${n.tags.join(" ")}`);
      return palheiro.includes(termo);
    });

    lista.sort((a, b) => {
      if (ordem === "recentes") return b.id_nota - a.id_nota;
      if (ordem === "antigas") return a.id_nota - b.id_nota;
      return (a.titulo ?? "").localeCompare(b.titulo ?? "", "pt-BR", { sensitivity: "base" });
    });

    return lista;
  }, [notes, busca, tagsFiltro, ordem]);

  const filtrosAtivos = busca.trim() !== "" || tagsFiltro.length > 0;

  const alternarTag = (tag: string) =>
    setTagsFiltro((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));

  const limparFiltros = () => {
    setBusca("");
    setTagsFiltro([]);
  };

  // Tira do filtro as tags que deixaram de existir (nota excluída ou editada)
  useEffect(() => {
    setTagsFiltro((prev) => {
      const existentes = new Set(todasTags.map(([t]) => t));
      const mantidas = prev.filter((t) => existentes.has(t));
      return mantidas.length === prev.length ? prev : mantidas;
    });
  }, [todasTags]);

  // Atalho: "/" foca a pesquisa
  useEffect(() => {
    const aoTeclar = (e: KeyboardEvent) => {
      const alvo = e.target as HTMLElement;
      const digitando =
        alvo.tagName === "INPUT" ||
        alvo.tagName === "TEXTAREA" ||
        alvo.tagName === "SELECT" ||
        alvo.isContentEditable;

      if (e.key === "/" && !digitando && !isCreating && !editingNote) {
        e.preventDefault();
        buscaRef.current?.focus();
      }
    };
    document.addEventListener("keydown", aoTeclar);
    return () => document.removeEventListener("keydown", aoTeclar);
  }, [isCreating, editingNote]);

  // Lê o id_caderno do sessionStorage e carrega as notas
  useEffect(() => {
    const id = sessionStorage.getItem("id_caderno") ?? "";
    const nome = sessionStorage.getItem("titulo_caderno") ?? "Caderno";
    setIdCaderno(id);
    setNomeCaderno(nome);

    if (!id) {
      setErro("Nenhuma caderno selecionada.");
      setCarregando(false);
      return;
    }

    carregarNotas(id);
  }, []);

  const carregarNotas = async (id: string) => {
    setCarregando(true);
    setErro("");
    try {
      const dados = await listarNotasPorCaderno(id);
      setNotes(dados.map((n) => ({
        ...n,
        tags: n.tags ?? [],
      })));
    } catch (e: unknown) {
      setErro(e instanceof Error ? e.message : "Erro ao carregar notas");
    } finally {
      setCarregando(false);
    }
  };

  const handleSave = async (data: { titulo: string; conteudo: string; tags: string[] }) => {
    if (isCreating) {
      // Segunda barreira, caso o botão tenha sido burlado ou a lista esteja desatualizada
      if (limiteAtingido) {
        throw new Error(`Este caderno já tem ${LIMITE_PAGINAS_POR_CADERNO} páginas, o limite máximo.`);
      }
      const nova = await criarNota({
        titulo: data.titulo,
        conteudo: data.conteudo,
        tags: data.tags,
        id_caderno: idCaderno,
      });
      setNotes((prev) => [...prev, { ...nova, tags: nova.tags ?? data.tags }]);
    } else if (editingNote) {
      await editarNota(editingNote.id_nota, {
        titulo: data.titulo,
        conteudo: data.conteudo,
        tags: data.tags,
      });
      setNotes((prev) =>
        prev.map((n) =>
          n.id_nota === editingNote.id_nota
            ? { ...n, titulo: data.titulo, conteudo: data.conteudo, tags: data.tags }
            : n
        )
      );
    }
    setEditingNote(null);
    setIsCreating(false);
  };

  const handleDelete = async (id: number) => {
    try {
      await excluirNota(id);
      setNotes((prev) => prev.filter((n) => n.id_nota !== id));
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Erro ao excluir nota");
    }
  };

  return (
    <>
      <div className="min-h-screen" style={{ backgroundColor: COR_BG_PAGINA }}>
        <header
          className="sticky top-0 z-10 flex items-center justify-between px-6 sm:px-8 py-4 border-b"
          style={{ backgroundColor: COR_BG_HEADER, borderColor: COR_BORDA_HEADER }}
        >
          <Link
            href="/dashboard/user/cadernos"
            className="flex items-center gap-2 text-lg text-gray-600 hover:gap-3 transition-all"
          >
            <BackIcon />
            voltar ao início
          </Link>

          <div className="flex items-center gap-4">
            {!carregando && !erro && (
              <span className="hidden sm:inline text-sm text-gray-500">
                {notes.length}/{LIMITE_PAGINAS_POR_CADERNO} páginas
              </span>
            )}
            <button
              onClick={() => setIsCreating(true)}
              disabled={!idCaderno || carregando || limiteAtingido}
              title={limiteAtingido ? `Limite de ${LIMITE_PAGINAS_POR_CADERNO} páginas atingido` : undefined}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-white shadow-sm hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:brightness-100"
              style={{ backgroundColor: COR_ACCENT }}
            >
              <PlusIcon />
              Nova Nota
            </button>
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            {nomeCaderno}
          </h1>

          {!carregando && !erro && limiteAtingido && (
            <div className="mb-6 px-4 py-3 rounded-xl bg-[#fbf1ce] border border-[#ecdfad] text-sm text-gray-700 text-center">
              Este caderno chegou ao limite de {LIMITE_PAGINAS_POR_CADERNO} páginas. Exclua uma nota para criar outra.
            </div>
          )}

          {/* Barra de pesquisa, ordenação e filtro por tags */}
          {!carregando && !erro && notes.length > 0 && (
            <div className="mb-6 space-y-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                    <SearchIcon />
                  </span>
                  <input
                    ref={buscaRef}
                    type="text"
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Escape") {
                        setBusca("");
                        e.currentTarget.blur();
                      }
                    }}
                    placeholder="Pesquisar em título, conteúdo e tags  ( / )"
                    className="w-full rounded-xl bg-white border pl-11 pr-10 py-2.5 text-base text-gray-800 outline-none placeholder:text-gray-400 focus:border-[#0C0F4F]/40 transition-colors"
                    style={{ borderColor: COR_BORDA_CARD }}
                  />
                  {busca && (
                    <button
                      type="button"
                      aria-label="Limpar pesquisa"
                      onClick={() => setBusca("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                    >
                      <CloseIcon />
                    </button>
                  )}
                </div>

                <select
                  value={ordem}
                  onChange={(e) => setOrdem(e.target.value as Ordem)}
                  aria-label="Ordenar notas"
                  className="rounded-xl bg-white border px-4 py-2.5 text-base text-gray-700 outline-none focus:border-[#0C0F4F]/40 transition-colors"
                  style={{ borderColor: COR_BORDA_CARD }}
                >
                  <option value="recentes">Mais recentes</option>
                  <option value="antigas">Mais antigas</option>
                  <option value="az">A–Z</option>
                </select>
              </div>

              {todasTags.length > 0 && (
                <div className="flex flex-wrap items-center gap-2">
                  {todasTags.map(([tag, qtd]) => {
                    const cor = corDaTag(tag);
                    const ativa = tagsFiltro.includes(tag);
                    return (
                      <button
                        key={tag}
                        type="button"
                        aria-pressed={ativa}
                        onClick={() => alternarTag(tag)}
                        className="rounded-full border px-3 py-1 text-sm font-medium transition-all hover:brightness-95"
                        style={{
                          backgroundColor: ativa ? cor.text : cor.bg,
                          color: ativa ? "#fff" : cor.text,
                          borderColor: ativa ? cor.text : "transparent",
                        }}
                      >
                        #{tag} <span className="opacity-60">{qtd}</span>
                      </button>
                    );
                  })}
                </div>
              )}

              <div className="flex items-center justify-between gap-3 text-sm text-gray-500">
                <span aria-live="polite">
                  {filtrosAtivos
                    ? `${notasVisiveis.length} de ${notes.length} ${notes.length === 1 ? "nota" : "notas"}`
                    : `${notes.length} ${notes.length === 1 ? "nota" : "notas"}`}
                </span>
                {filtrosAtivos && (
                  <button
                    type="button"
                    onClick={limparFiltros}
                    className="font-medium text-[#0C0F4F] hover:underline"
                  >
                    limpar filtros
                  </button>
                )}
              </div>
            </div>
          )}

          {carregando && (
            <div className="text-center py-16 rounded-2xl bg-white/60 border border-dashed" style={{ borderColor: COR_BORDA_HEADER }}>
              <p className="text-gray-400 animate-pulse">carregando notas...</p>
            </div>
          )}

          {!carregando && erro && (
            <div className="text-center py-16 rounded-2xl bg-red-50 border border-dashed border-red-300">
              <p className="text-red-500">{erro}</p>
            </div>
          )}

          {!carregando && !erro && notes.length === 0 && (
            <div className="text-center py-16 rounded-2xl bg-white/60 border border-dashed" style={{ borderColor: COR_BORDA_HEADER }}>
              <p className="text-gray-400">nenhuma nota ainda</p>
            </div>
          )}

          {!carregando && !erro && notes.length > 0 && notasVisiveis.length === 0 && (
            <div className="text-center py-16 rounded-2xl bg-white/60 border border-dashed" style={{ borderColor: COR_BORDA_HEADER }}>
              <p className="text-gray-500">nenhuma nota encontrada</p>
              <button
                type="button"
                onClick={limparFiltros}
                className="mt-3 text-sm font-medium text-[#0C0F4F] hover:underline"
              >
                limpar filtros
              </button>
            </div>
          )}

          {/* Mural em colunas: cada nota cresce até o fim do texto */}
          {!carregando && !erro && notasVisiveis.length > 0 && (
            <div className="columns-1 sm:columns-2 lg:columns-3 gap-5">
              {notasVisiveis.map((note) => (
                <NoteCard
                  key={note.id_nota}
                  note={note}
                  pagina={paginaPorId.get(note.id_nota) ?? 0}
                  termo={busca}
                  tagsAtivas={tagsFiltro}
                  onEdit={() => setEditingNote(note)}
                  onDelete={() => handleDelete(note.id_nota)}
                  onToggleTag={alternarTag}
                />
              ))}
            </div>
          )}
        </main>
      </div>

      {(isCreating || editingNote) && (
        <EditModal
          note={editingNote}
          isNew={isCreating}
          tagsSugeridas={todasTags.map(([t]) => t)}
          onClose={() => { setEditingNote(null); setIsCreating(false); }}
          onSave={handleSave}
        />
      )}
    </>
  );
}