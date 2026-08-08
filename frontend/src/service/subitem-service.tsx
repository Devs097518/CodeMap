import { apiFetch } from './api-fetch';

export interface Subitem {
  id_subitem: number;
  topico_id: number;
  titulo: string;
  descricao: string | null;
  ordem: number;
}

export interface CriarSubitem {
  topico_id: number;
  titulo: string;
  descricao?: string;
}

export interface EditarSubitem {
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

export async function criarSubitem(dados: CriarSubitem): Promise<Subitem> {
  const response = await apiFetch('/api/subitem/criarSubitem', {
    method: 'POST',
    body: JSON.stringify(dados),
  });
  return parseResposta<Subitem>(response, 'Erro ao criar sub-item');
}

export async function editarSubitem(id_subitem: number, dados: EditarSubitem): Promise<Subitem> {
  const response = await apiFetch(`/api/subitem/editar/${id_subitem}`, {
    method: 'PUT',
    body: JSON.stringify(dados),
  });
  return parseResposta<Subitem>(response, 'Erro ao editar sub-item');
}

export async function excluirSubitem(id_subitem: number): Promise<void> {
  const response = await apiFetch(`/api/subitem/deletar/${id_subitem}`, { method: 'DELETE' });
  await parseResposta<Subitem>(response, 'Erro ao excluir sub-item');
}

export async function moverSubitem(id_subitem: number, direcao: "cima" | "baixo"): Promise<void> {
  const response = await apiFetch(`/api/subitem/mover/${id_subitem}`, {
    method: 'PUT',
    body: JSON.stringify({ direcao }),
  });
  await parseResposta<{ status: string }>(response, 'Erro ao mover sub-item');
}