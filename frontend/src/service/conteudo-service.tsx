import { API_URL, defaultHeaders } from './api';

// ─── Interfaces ───────────────────────────────────────────────────────────────

export interface Nota {
  id: number;
  titulo: string;
  conteudo: string;
  id_usuario: string;
}

export interface CriarNota {
  titulo: string;
  conteudo: string;
  id_usuario: string;
}

export interface EditarNota {
  titulo: string;
  conteudo: string;
}

// ─── Listar todas as notas do usuário ─────────────────────────────────────────

export async function listarNotasPorUsuario(id_usuario: string): Promise<Nota[]> {
  const response = await fetch(`${API_URL}/listagem-nota?id_usuario=${id_usuario}`, {
    method: 'GET',
    headers: defaultHeaders(),
  });

  if (response.status === 404) return [];

  if (!response.ok) {
    throw new Error(`Erro ao buscar notas (HTTP ${response.status})`);
  }

  const data = await response.json();

  // Aceita tanto array direto quanto objeto com campo "notas"
  if (Array.isArray(data)) return data as Nota[];
  if (data?.notas && Array.isArray(data.notas)) return data.notas as Nota[];

  return [];
}

// ─── Criar nova nota ──────────────────────────────────────────────────────────

export async function criarNota(dados: CriarNota): Promise<Nota> {
  const response = await fetch(`${API_URL}/novo-nota`, {
    method: 'POST',
    headers: defaultHeaders(),
    body: JSON.stringify(dados),
  });

  let result: { status?: string; mensagem?: string; nota?: Nota } & Partial<Nota> = {};

  try {
    result = await response.json();
  } catch {
    throw new Error(`Erro HTTP ${response.status}: resposta inválida do servidor`);
  }

  if (!response.ok || result.status === 'erro') {
    throw new Error(result.mensagem || `Erro ao criar nota (HTTP ${response.status})`);
  }

  // Retorna a nota criada — aceita tanto { nota: {...} } quanto a nota direta
  if (result.nota) return result.nota;
  if (result.id) return result as Nota;

  throw new Error('Resposta inesperada do servidor ao criar nota');
}

// ─── Editar nota existente ────────────────────────────────────────────────────

export async function editarNota(id_nota: number, dados: EditarNota): Promise<void> {
  const response = await fetch(`${API_URL}/editar-nota/${id_nota}`, {
    method: 'PUT',
    headers: defaultHeaders(),
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

// ─── Excluir nota ─────────────────────────────────────────────────────────────

export async function excluirNota(id_nota: number): Promise<void> {
  const response = await fetch(`${API_URL}/deletar-nota/${id_nota}`, {
    method: 'DELETE',
    headers: defaultHeaders(),
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
