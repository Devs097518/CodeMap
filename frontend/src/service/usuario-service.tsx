const API_URL = process.env.NEXT_PUBLIC_API_URL;

/**
 * Verifica se o email e senha conferem com o banco.
 * Salva o email no sessionStorage em caso de sucesso.
 */
export async function realizarLogin(email: string, senha: string): Promise<number> {
  const response = await fetch(`${API_URL}/listagem-usuario?email=${email}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) {
    throw new Error("Erro ao buscar usuário");
  }

  const usuarios = await response.json();

  if (!usuarios || usuarios.length === 0) {
    throw new Error("Email não cadastrado");
  }

  const usuario = usuarios[0];
  const usuario_id = usuario.id_usuario;

  if (usuario.senha !== senha) {
    throw new Error("Senha incorreta");
  }

  // Busca a pessoa vinculada ao id_usuario para pegar o username
  const responsePessoa = await fetch(`${API_URL}/listagem-pessoa?id_usuario=${usuario.id_usuario}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  const pessoas = await responsePessoa.json();

  // Filtra no frontend garantindo que é o id_usuario correto
  const pessoa = pessoas.find((p: any) => p.id_usuario === usuario.id_usuario);

  if (!pessoa) {
    throw new Error("Perfil não encontrado para este usuário");
  }

  const username = pessoa.username;

  // Salva email e username no sessionStorage
  sessionStorage.setItem("email", email);
  sessionStorage.setItem("id_usuario", usuario_id);
  sessionStorage.setItem("username", username);

  return usuario.id_usuario;
}

/**
 * Busca o id_usuario no backend com base no email.
 */
export async function obterIdUsuarioPorEmail(email: string): Promise<number> {
  const response = await fetch(`${API_URL}/listagem-usuario?email=${email}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) {
    throw new Error("Erro ao buscar usuário");
  }

  const usuarios = await response.json();

  if (!usuarios || usuarios.length === 0) {
    throw new Error("Usuário não encontrado");
  }

  return usuarios[0].id_usuario;
}

/**
 * Pega o id_usuario usando o email do sessionStorage.
 */
export async function obterIdUsuarioLogado(): Promise<number> {
  if (typeof window === "undefined") {
    throw new Error("Não está no navegador");
  }

  const email = sessionStorage.getItem("email");

  if (!email) {
    throw new Error("Email não encontrado no sessionStorage");
  }

  return await obterIdUsuarioPorEmail(email);
}