import { apiFetch } from './api-fetch';
import { Subitem } from './subitem-service';

export interface Topico {
  id_topico: number;
  roadmap_id: number;
  titulo: string;
  descricao: string | null;
  ordem: number;
}

export interface TopicoComSubitens extends Topico {
  subitens: Subitem[];
}

export interface CriarTopico {
  roadmap_id: number;
  titulo: string;
  descricao?: string;
}

export interface EditarTopico {
  titulo: string;
  descricao?: string;
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

export async function listarTopicosComSubitens(roadmap_id: number): Promise<TopicoComSubitens[]> {
  const response = await apiFetch(`/api/roadmap/${roadmap_id}/topicos`, { method: 'GET' });
  if (!response.ok) {
    throw new Error(`Erro ao buscar tópicos (HTTP ${response.status})`);
  }
  const data = await response.json();
  return Array.isArray(data) ? (data as TopicoComSubitens[]) : [];
}

export async function criarTopico(dados: CriarTopico): Promise<Topico> {
  const response = await apiFetch('/api/topico/criarTopico', {
    method: 'POST',
    body: JSON.stringify(dados),
  });
  return parseResposta<Topico>(response, 'Erro ao criar tópico');
}

export async function editarTopico(id_topico: number, dados: EditarTopico): Promise<Topico> {
  const response = await apiFetch(`/api/topico/editar/${id_topico}`, {
    method: 'PUT',
    body: JSON.stringify(dados),
  });
  return parseResposta<Topico>(response, 'Erro ao editar tópico');
}

export async function excluirTopico(id_topico: number): Promise<void> {
  const response = await apiFetch(`/api/topico/deletar/${id_topico}`, { method: 'DELETE' });
  await parseResposta<Topico>(response, 'Erro ao excluir tópico');
}

export async function moverTopico(id_topico: number, direcao: "cima" | "baixo"): Promise<void> {
  const response = await apiFetch(`/api/topico/mover/${id_topico}`, {
    method: 'PUT',
    body: JSON.stringify({ direcao }),
  });
  await parseResposta<{ status: string }>(response, 'Erro ao mover tópico');
}