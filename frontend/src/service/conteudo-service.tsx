import { apiFetch } from './api-fetch';

// Interfaces 
export interface Nota {
  id_nota: number;
  titulo: string;
  conteudo: string;
  id_caderno: string;
  tags: string[];
}

export interface CriarNota {
  titulo: string;
  conteudo: string;
  id_caderno: string;
  tags?: string[];
}

export interface EditarNota {
  titulo: string;
  conteudo: string;
  tags?: string[];
}

// Garante que `tags` sempre exista (notas antigas ou respostas sem o campo)
const comTags = (nota: Nota): Nota => ({ ...nota, tags: nota.tags ?? [] });

// Listar todas as notas do usuário

export async function listarNotasPorCaderno(id_caderno: string): Promise<Nota[]> {
  const response = await apiFetch(`/api/nota/listagem/?id_caderno=${id_caderno}`, {
    method: 'GET',
  });

  if (response.status === 404) return [];

  if (!response.ok) {
    throw new Error(`Erro ao buscar notas (HTTP ${response.status})`);
  }

  const data = await response.json();

  // Aceita tanto array direto quanto objeto com campo "notas"
  if (Array.isArray(data)) return (data as Nota[]).map(comTags);
  if (data?.notas && Array.isArray(data.notas)) return (data.notas as Nota[]).map(comTags);

  return [];
}

// Criar nova nota 

export async function criarNota(dados: CriarNota): Promise<Nota> {
  const response = await apiFetch('/api/nota/novo', {
    method: 'POST',
    body: JSON.stringify(dados),
  });

  let result: { status?: string; mensagem?: string; nota?: Nota; id_nota?: number; data?: Nota } & Partial<Nota> = {};

  try {
    result = await response.json();
  } catch {
    throw new Error(`Erro HTTP ${response.status}: resposta inválida do servidor`);
  }

  if (!response.ok || result.status === 'erro') {
    throw new Error(result.mensagem || `Erro ao criar nota (HTTP ${response.status})`);
  }
  
  if (result.id_nota) {
    return {
      id_nota: result.id_nota as number,
      titulo: result.titulo,
      conteudo: result.conteudo,
      id_caderno: dados.id_caderno,
      // o backend normaliza as tags; se não devolver, usa as enviadas
      tags: Array.isArray(result.tags) ? result.tags : dados.tags ?? [],
    } as Nota;
  }

  if (result.nota) return comTags(result.nota);

  if (result.data) return comTags(result.data);

  throw new Error('Resposta inesperada do servidor ao criar nota');
}

// Editar nota existente 

export async function editarNota(id_nota: number, dados: EditarNota): Promise<void> {
  const response = await apiFetch(`/api/nota/editar/${id_nota}`, {
    method: 'PUT',
    body: JSON.stringify(dados),
  });

  let result: { status?: string; mensagem?: string } = {};

  try {
    result = await response.json();
  } catch {
    throw new Error(`Erro HTTP ${response.status}: resposta inválida do servidor`);
  }

  if (!response.ok || result.status === 'erro') {
    throw new Error(result.mensagem || `Erro ao editar nota (HTTP ${response.status})`);
  }
}

// Excluir nota 

export async function excluirNota(id_nota: number): Promise<void> {
  const response = await apiFetch(`/api/nota/deletar/${id_nota}`, {
    method: 'DELETE',
  });

  let result: { status?: string; mensagem?: string } = {};

  try {
    result = await response.json();
  } catch {
    // DELETE pode retornar 204 sem corpo — tudo bem
    if (response.status === 204) return;
    throw new Error(`Erro HTTP ${response.status}: resposta inválida do servidor`);
  }

  if (!response.ok || result.status === 'erro') {
    throw new Error(result.mensagem || `Erro ao excluir nota (HTTP ${response.status})`);
  }
}