import { apiFetch } from './api-fetch';

export interface Caderno {
  id_caderno: number;
  titulo: string;
  id_usuario: string;
}

export interface CriarCaderno {
  titulo: string;
  id_usuario: string;
}

export interface EditarCaderno {
  titulo: string;
}

export async function listarCadernosPorUsuario(id_usuario: string): Promise<Caderno[]> {
  const response = await apiFetch(`/api/caderno/listagem?id_usuario=${id_usuario}`, {
    method: 'GET',
  });

  if (response.status === 404) return [];

  if (!response.ok) {
    throw new Error(`Erro ao buscar cadernos (HTTP ${response.status})`);
  }

  const data = await response.json();

  if (Array.isArray(data)) return data as Caderno[];
  if (data?.cadernos && Array.isArray(data.cadernos)) return data.cadernos as Caderno[];

  return [];
}

// Criar novo caderno

export async function criarCaderno(dados: CriarCaderno): Promise<Caderno> {
  const response = await apiFetch('/api/caderno/novo', {
    method: 'POST',
    body: JSON.stringify(dados),
  });

  let result: { status?: string; mensagem?: string; caderno?: Caderno; id_caderno?: number; data?: Caderno } & Partial<Caderno> = {};

  try {
    result = await response.json();
  } catch {
    throw new Error(`Erro HTTP ${response.status}: resposta inválida do servidor`);
  }

  if (!response.ok || result.status === 'erro') {
    throw new Error(result.mensagem || `Erro ao criar caderno (HTTP ${response.status})`);
  }

  if (result.id_caderno) {
    return {
      id_caderno: result.id_caderno as number,
      titulo: result.titulo,
      id_usuario: dados.id_usuario,
    } as Caderno;
  }

  throw new Error('Resposta inesperada do servidor ao criar caderno');
}



// Editar caderno existente 

export async function editarCaderno(id_caderno: number, dados: EditarCaderno): Promise<void> {
  const response = await apiFetch(`/api/caderno/editar/${id_caderno}`, {
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
    throw new Error(result.mensagem || `Erro ao editar caderno (HTTP ${response.status})`);
  }
}

// Excluir caderno 

export async function excluirCaderno(id_caderno: number): Promise<void> {
  const response = await apiFetch(`/api/caderno/deletar/${id_caderno}`, {
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
    throw new Error(result.mensagem || `Erro ao excluir caderno (HTTP ${response.status})`);
  }
}
