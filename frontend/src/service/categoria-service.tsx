import { apiFetch } from './api-fetch';

export interface Categoria {
  id_categoria: number;
  nome: string;
  slug: string;
  ordem: number;
  deleted_at: string | null;
}

export interface CriarCategoria {
  nome: string;
}

export interface EditarCategoria {
  nome: string;
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

export async function listarCategorias(incluirArquivadas = false): Promise<Categoria[]> {
  const response = await apiFetch(`/api/categoria/listagem?arquivadas=${incluirArquivadas}`, {
    method: 'GET',
  });

  if (response.status === 404) return [];
  if (!response.ok) {
    throw new Error(`Erro ao buscar categorias (HTTP ${response.status})`);
  }

  const data = await response.json();
  return Array.isArray(data) ? (data as Categoria[]) : [];
}

export async function listarCategoriasAdmin(incluirArquivadas = false): Promise<Categoria[]> {
  const response = await apiFetch(`/api/categoria/listagemAdmin?arquivadas=${incluirArquivadas}`, {
    method: 'GET',
  });

  if (response.status === 404) return [];
  if (!response.ok) {
    throw new Error(`Erro ao buscar categorias (HTTP ${response.status})`);
  }

  const data = await response.json();
  return Array.isArray(data) ? (data as Categoria[]) : [];
}

export async function criarCategoria(dados: CriarCategoria): Promise<Categoria> {
  const response = await apiFetch('/api/categoria/criarCategoria', {
    method: 'POST',
    body: JSON.stringify(dados),
  });
  return parseResposta<Categoria>(response, 'Erro ao criar categoria');
}

export async function editarCategoria(id_categoria: number, dados: EditarCategoria): Promise<Categoria> {
  const response = await apiFetch(`/api/categoria/editar/${id_categoria}`, {
    method: 'PUT',
    body: JSON.stringify(dados),
  });
  return parseResposta<Categoria>(response, 'Erro ao editar categoria');
}

export async function arquivarCategoria(id_categoria: number): Promise<Categoria> {
  const response = await apiFetch(`/api/categoria/deletar/${id_categoria}`, {
    method: 'DELETE',
  });
  return parseResposta<Categoria>(response, 'Erro ao arquivar categoria');
}

export async function restaurarCategoria(id_categoria: number): Promise<Categoria> {
  const response = await apiFetch(`/api/categoria/restaurar/${id_categoria}`, {
    method: 'PUT',
  });
  return parseResposta<Categoria>(response, 'Erro ao restaurar categoria');
}

export async function moverCategoria(id_categoria: number, direcao: "cima" | "baixo"): Promise<void> {
  const response = await apiFetch(`/api/categoria/mover/${id_categoria}`, {
    method: 'PUT',
    body: JSON.stringify({ direcao }),
  });
  await parseResposta<{ status: string }>(response, 'Erro ao mover categoria');
}