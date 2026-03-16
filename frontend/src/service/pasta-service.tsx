import { API_URL, defaultHeaders } from './api';

// Interfaces 
export interface Pasta {
  id: number;
  titulo: string;
  id_usuario: string;
}

export interface CriarPasta {
  titulo: string;
  id_usuario: string;
}

export interface EditarPasta {
  titulo: string;
}

// Listar todas as pastas do usuário

export async function listarPastasPorUsuario(id_usuario: string): Promise<Pasta[]> {
  const response = await fetch(`${API_URL}/listagem-pasta?id_usuario=${id_usuario}`, {
    method: 'GET',
    headers: defaultHeaders(),
  });

  if (response.status === 404) return [];

  if (!response.ok) {
    throw new Error(`Erro ao buscar pastas (HTTP ${response.status})`);
  }

  const data = await response.json();

  // Aceita tanto array direto quanto objeto com campo "pastas"
  if (Array.isArray(data)) return data as Pasta[];
  if (data?.pastas && Array.isArray(data.pastas)) return data.pastas as Pasta[];

  return [];
}

// Criar nova pasta 

export async function criarPasta(dados: CriarPasta): Promise<Pasta> {
  const response = await fetch(`${API_URL}/novo-pasta`, {
    method: 'POST',
    headers: defaultHeaders(),
    body: JSON.stringify(dados),
  });

  let result: { status?: string; mensagem?: string; pasta?: Pasta; id_pasta?: number; data?: Pasta } & Partial<Pasta> = {};

  try {
    result = await response.json();
  } catch {
    throw new Error(`Erro HTTP ${response.status}: resposta inválida do servidor`);
  }

  if (!response.ok || result.status === 'erro') {
    throw new Error(result.mensagem || `Erro ao criar pasta (HTTP ${response.status})`);
  }
  
  if (result.id_pasta) {
    return {
      id: result.id_pasta as number,
      titulo: result.titulo,
      id_usuario: dados.id_usuario,
    } as Pasta;
  }

  if (result.id) return result as Pasta;

  throw new Error('Resposta inesperada do servidor ao criar pasta');
}

// Editar pasta existente 

export async function editarPasta(id_pasta: number, dados: EditarPasta): Promise<void> {
  const response = await fetch(`${API_URL}/editar-pasta/${id_pasta}`, {
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
    throw new Error(result.mensagem || `Erro ao editar pasta (HTTP ${response.status})`);
  }
}

// Excluir pasta 

export async function excluirPasta(id_pasta: number): Promise<void> {
  const response = await fetch(`${API_URL}/deletar-pasta/${id_pasta}`, {
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
    throw new Error(result.mensagem || `Erro ao excluir pasta (HTTP ${response.status})`);
  }
}
