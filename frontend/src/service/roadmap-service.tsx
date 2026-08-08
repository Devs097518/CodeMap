import { apiFetch } from './api-fetch';

export interface Roadmap {
  id_roadmap: number;
  categoria_id: number;
  titulo: string;
  descricao: string | null;
  is_active: boolean;
  deleted_at: string | null;
}

export interface CriarRoadmap {
  categoria_id: number;
  titulo: string;
  descricao?: string;
  is_active?: boolean;
}

export interface EditarRoadmap {
  categoria_id: number;
  titulo: string;
  descricao?: string;
  is_active?: boolean;
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

export async function listarRoadmaps(incluirArquivados = false): Promise<Roadmap[]> {
  const response = await apiFetch(`/api/roadmap/listagem?arquivados=${incluirArquivados}`, {
    method: 'GET',
  });

  if (response.status === 404) return [];
  if (!response.ok) {
    throw new Error(`Erro ao buscar roadmaps (HTTP ${response.status})`);
  }

  const data = await response.json();
  return Array.isArray(data) ? (data as Roadmap[]) : [];
}

export async function criarRoadmap(dados: CriarRoadmap): Promise<Roadmap> {
  const response = await apiFetch('/api/roadmap/criarRoadmap', {
    method: 'POST',
    body: JSON.stringify(dados),
  });
  return parseResposta<Roadmap>(response, 'Erro ao criar roadmap');
}

export async function editarRoadmap(id_roadmap: number, dados: EditarRoadmap): Promise<Roadmap> {
  const response = await apiFetch(`/api/roadmap/editar/${id_roadmap}`, {
    method: 'PUT',
    body: JSON.stringify(dados),
  });
  return parseResposta<Roadmap>(response, 'Erro ao editar roadmap');
}

export async function arquivarRoadmap(id_roadmap: number): Promise<Roadmap> {
  const response = await apiFetch(`/api/roadmap/deletar/${id_roadmap}`, {
    method: 'DELETE',
  });
  return parseResposta<Roadmap>(response, 'Erro ao arquivar roadmap');
}

export async function restaurarRoadmap(id_roadmap: number): Promise<Roadmap> {
  const response = await apiFetch(`/api/roadmap/restaurar/${id_roadmap}`, {
    method: 'PUT',
  });
  return parseResposta<Roadmap>(response, 'Erro ao restaurar roadmap');
}

export async function buscarRoadmap(id_roadmap: number): Promise<Roadmap> {
  const response = await apiFetch(`/api/roadmap/detalhe/${id_roadmap}`, { method: 'GET' });
  return parseResposta<Roadmap>(response, 'Erro ao buscar roadmap');
}