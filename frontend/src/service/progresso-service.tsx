import { apiFetch } from './api-fetch';

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

export async function alternarProgressoTopico(id_topico: number, estudado: boolean): Promise<void> {
  const response = await apiFetch(`/api/progresso/topico/${id_topico}`, {
    method: 'PUT',
    body: JSON.stringify({ estudado }),
  });
  await parseResposta(response, 'Erro ao atualizar progresso');
}

export async function alternarProgressoSubitem(id_subitem: number, estudado: boolean): Promise<void> {
  const response = await apiFetch(`/api/progresso/subitem/${id_subitem}`, {
    method: 'PUT',
    body: JSON.stringify({ estudado }),
  });
  await parseResposta(response, 'Erro ao atualizar progresso');
}