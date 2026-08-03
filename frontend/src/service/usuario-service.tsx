import { apiFetch } from './api-fetch';

export async function realizarLogin(email: string, senha: string) {
  const response = await apiFetch('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, senha }),
  });

  if (!response.ok) {
    const erro = await response.json();
    throw new Error(erro.message || 'Email ou senha incorretos');
  }

  const usuario = await buscarUsuarioLogado(); // chama /auth/me
  return usuario;
}

export async function buscarUsuarioLogado() {
  const response = await apiFetch('/api/auth/me');
  if (!response.ok) throw new Error('Não foi possível obter dados do usuário');
  return response.json();
}


// export async function obterIdUsuarioPorEmail(email: string): Promise<number> {
//   const response = await apiFetch(`/api/usuario/listagem?email=${email}`, {
//     method: "GET",
//   });

//   if (!response.ok) {
//     throw new Error("Erro ao buscar usuário");
//   }

//   const usuarios = await response.json();

//   if (!usuarios || usuarios.length === 0) {
//     throw new Error("Usuário não encontrado");
//   }

//   return usuarios[0].id_usuario;
// }

// /**
//  * Pega o id_usuario usando o email do sessionStorage.
//  */
// export async function obterIdUsuarioLogado(): Promise<number> {
//   if (typeof window === "undefined") {
//     throw new Error("Não está no navegador");
//   }

//   const email = sessionStorage.getItem("email");

//   if (!email) {
//     throw new Error("Email não encontrado no sessionStorage");
//   }

//   return await obterIdUsuarioPorEmail(email);
// }