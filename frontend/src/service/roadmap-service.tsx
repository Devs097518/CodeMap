import { apiFetch } from './api-fetch';

export interface Roadmap {
  id_roadmap: number;
  categoria_id: number;
  titulo: string;
  descricao: string | null;
  is_active: boolean;
  deleted_at: string | null;
  labels: string[];
}

export interface CriarRoadmap {
  categoria_id: number;
  titulo: string;
  descricao?: string;
  is_active?: boolean;
  labels?: string[];
}

export interface EditarRoadmap {
  categoria_id: number;
  titulo: string;
  descricao?: string;
  is_active?: boolean;
  labels?: string[];
}

export interface RoadmapComProgresso extends Roadmap {
  iniciado: boolean;
  progresso_percentual: number;
  meta: boolean; // está na lista de metas do usuário
}

type RespostaErro = { status?: string; mensagem?: string };

async function parseResposta<T>(response: Response, acaoErro: string): Promise<T> {
  let result: RespostaErro & Partial<T> = {};

  try {
    result = await response.json();
  } catch {
    throw new Error(`Erro HTTP ${response.status}: resposta inválida do servidor`);
  }

  if (!response.ok || result.status === 'erro') {
    throw new Error(result.mensagem || `${acaoErro} (HTTP ${response.status})`);
  }

  return result as T;
}

// Garante que `labels` sempre exista (roadmaps antigos ou respostas sem o campo)
function normalizarRoadmap<T extends Roadmap>(r: T): T {
  return { ...r, labels: r.labels ?? [] };
}

export async function listarRoadmaps(): Promise<RoadmapComProgresso[]> {
  const response = await apiFetch(`/api/roadmap/listagem`, { method: 'GET' });

  if (response.status === 404) return [];
  if (!response.ok) {
    throw new Error(`Erro ao buscar roadmaps (HTTP ${response.status})`);
  }

  const data = await response.json();
  if (!Array.isArray(data)) return [];

  return (data as RoadmapComProgresso[]).map((r) => ({
    ...normalizarRoadmap(r),
    meta: Boolean(r.meta),
  }));
}

export async function listarRoadmapsAdmin(incluirArquivados = false): Promise<Roadmap[]> {
  const response = await apiFetch(`/api/roadmap/listagemAdmin?arquivados=${incluirArquivados}`, {
    method: 'GET',
  });

  if (response.status === 404) return [];
  if (!response.ok) {
    throw new Error(`Erro ao buscar roadmaps (HTTP ${response.status})`);
  }

  const data = await response.json();
  return Array.isArray(data) ? (data as Roadmap[]).map(normalizarRoadmap) : [];
}

export async function criarRoadmap(dados: CriarRoadmap): Promise<Roadmap> {
  const response = await apiFetch('/api/roadmap/criarRoadmap', {
    method: 'POST',
    body: JSON.stringify(dados),
  });
  return normalizarRoadmap(await parseResposta<Roadmap>(response, 'Erro ao criar roadmap'));
}

export async function editarRoadmap(id_roadmap: number, dados: EditarRoadmap): Promise<Roadmap> {
  const response = await apiFetch(`/api/roadmap/editar/${id_roadmap}`, {
    method: 'PUT',
    body: JSON.stringify(dados),
  });
  return normalizarRoadmap(await parseResposta<Roadmap>(response, 'Erro ao editar roadmap'));
}

export async function arquivarRoadmap(id_roadmap: number): Promise<Roadmap> {
  const response = await apiFetch(`/api/roadmap/deletar/${id_roadmap}`, {
    method: 'DELETE',
  });
  return normalizarRoadmap(await parseResposta<Roadmap>(response, 'Erro ao arquivar roadmap'));
}

export async function restaurarRoadmap(id_roadmap: number): Promise<Roadmap> {
  const response = await apiFetch(`/api/roadmap/restaurar/${id_roadmap}`, {
    method: 'PUT',
  });
  return normalizarRoadmap(await parseResposta<Roadmap>(response, 'Erro ao restaurar roadmap'));
}

export async function buscarRoadmap(id_roadmap: number): Promise<Roadmap> {
  const response = await apiFetch(`/api/roadmap/detalhe/${id_roadmap}`, { method: 'GET' });
  return normalizarRoadmap(await parseResposta<Roadmap>(response, 'Erro ao buscar roadmap'));
}

export async function buscarRoadmapAdmin(id_roadmap: number): Promise<Roadmap> {
  const response = await apiFetch(`/api/roadmap/detalheAdmin/${id_roadmap}`, { method: 'GET' });
  return normalizarRoadmap(await parseResposta<Roadmap>(response, 'Erro ao buscar roadmap'));
}

// Labels já usadas nos roadmaps (sugestões para o admin)
export async function listarLabels(): Promise<string[]> {
  const response = await apiFetch('/api/roadmap/labels', { method: 'GET' });

  if (!response.ok) {
    throw new Error(`Erro ao buscar labels (HTTP ${response.status})`);
  }

  const data = await response.json();
  return Array.isArray(data) ? (data as string[]) : [];
}

// Metas: roadmaps que o usuário quer iniciar

export async function adicionarMeta(id_roadmap: number): Promise<void> {
  const response = await apiFetch(`/api/roadmap/metas/${id_roadmap}`, { method: 'POST' });
  await parseResposta<RespostaErro>(response, 'Erro ao adicionar meta');
}

export async function removerMeta(id_roadmap: number): Promise<void> {
  const response = await apiFetch(`/api/roadmap/metas/${id_roadmap}`, { method: 'DELETE' });
  await parseResposta<RespostaErro>(response, 'Erro ao remover meta');
}