import { API_URL, defaultHeaders } from './api';

// ─── Tipos ────────────────────────────────────────────────────────────────────

export interface CadastroUsuarioPayload {
  email: string;
  senha: string;
}

export interface CadastroPessoaPayload {
  username: string;
  uf: string;
  id_usuario: number;
}

export interface CadastroCompletoPayload {
  email: string;
  senha: string;
  username: string;
  uf: string;
}

export interface UsuarioResponse {
  id_usuario: number;
  email: string;
}

export interface PessoaResponse {
  id_pessoa: number;
  username: string;
  uf: string;
  id_usuario: number;
}

export interface CadastroCompletoResponse {
  usuario: UsuarioResponse;
  pessoa: PessoaResponse;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    const message =
      errorData?.message ||
      errorData?.error ||
      `Erro ${response.status}: ${response.statusText}`;
    throw new Error(message);
  }
  return response.json() as Promise<T>;
}

// ─── Serviços individuais ─────────────────────────────────────────────────────

/**
 * Cria um novo usuário na tabela `usuario`.
 * Retorna os dados do usuário criado, incluindo o id_usuario gerado.
 */
export async function cadastrarUsuario(
  payload: CadastroUsuarioPayload
): Promise<UsuarioResponse> {
  const response = await fetch(`${API_URL}/novo-usuario`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  return handleResponse<UsuarioResponse>(response);
}

/**
 * Cria um novo registro na tabela `pessoa` vinculado a um usuario existente.
 * O campo id_usuario é obrigatório pois é a FK que referencia a tabela usuario.
 */
export async function cadastrarPessoa(
  payload: CadastroPessoaPayload
): Promise<PessoaResponse> {
  const response = await fetch(`${API_URL}/novo-pessoa`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  return handleResponse<PessoaResponse>(response);
}

// ─── Serviço principal ────────────────────────────────────────────────────────



export async function cadastrarCompleto(payload: CadastroCompletoPayload) {
  const res = await fetch('http://localhost:3003/novo-cadastro', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error); 
  }

  return res.json();
}
