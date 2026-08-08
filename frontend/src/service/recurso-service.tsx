import { apiFetch } from './api-fetch';

export interface Recurso {
  id_recurso: number;
  topico_id: number | null;
  subitem_id: number | null;
  label: string;
  url: string;
}

export type TipoItem = "topico" | "subitem";

export interface SalvarRecurso {
  label: string;
  url: string;
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

export async function listarRecursos(tipo: TipoItem, id: number): Promise<Recurso[]> {
  const response = await apiFetch(`/api/recurso/${id}/listagem?tipo=${tipo}`, { method: 'GET' });
  if (!response.ok) {
    throw new Error(`Erro ao buscar recursos (HTTP ${response.status})`);
  }
  const data = await response.json();
  return Array.isArray(data) ? (data as Recurso[]) : [];
}

export async function criarRecurso(tipo: TipoItem, id: number, dados: SalvarRecurso): Promise<Recurso> {
  const response = await apiFetch(`/api/recurso/${id}/criarRecurso`, {
    method: 'POST',
    body: JSON.stringify({ tipo, ...dados }),
  });
  return parseResposta<Recurso>(response, 'Erro ao criar recurso');
}

export async function editarRecurso(id_recurso: number, dados: SalvarRecurso): Promise<Recurso> {
  const response = await apiFetch(`/api/recurso/editar/${id_recurso}`, {
    method: 'PUT',
    body: JSON.stringify(dados),
  });
  return parseResposta<Recurso>(response, 'Erro ao editar recurso');
}

export async function excluirRecurso(id_recurso: number): Promise<void> {
  const response = await apiFetch(`/api/recurso/deletar/${id_recurso}`, { method: 'DELETE' });
  await parseResposta<Recurso>(response, 'Erro ao excluir recurso');
}