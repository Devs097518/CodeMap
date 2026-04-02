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

  const hash = usuario.senha;
  const papel = usuario.papel;


  await validarLogin(senha, hash, usuario_id, papel);


  const responsePessoa = await fetch(`${API_URL}/listagem-pessoa?id_usuario=${usuario.id_usuario}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  const pessoas = await responsePessoa.json();

  const pessoa = pessoas.find((p: any) => p.id_usuario === usuario.id_usuario);

  if (!pessoa) {
    throw new Error("Perfil não encontrado para este usuário");
  }

  const username = pessoa.username;

  sessionStorage.setItem("email", email);
  sessionStorage.setItem("id_usuario", usuario_id);
  sessionStorage.setItem("username", username);

  return usuario.id_usuario;
}

async function validarLogin(senha: string, hash: string, usuario_id: string, papel: string): Promise<void> {
  const params = new URLSearchParams({
    senhaDigitada: senha,
    hashDoBanco: hash,
    idUsuario: usuario_id,
    papelUsuario: papel,
  });

  const response = await fetch(`http://localhost:3003/validacao?${params.toString()}`);
  const data = await response.json();

  if (data.valido) {
    console.log("Login autorizado!");
    sessionStorage.setItem("token", data.token);
  } else {
    console.log("Senha incorreta.");
    throw new Error("Senha incorreta");
  }
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