const API_URL = process.env.NEXT_PUBLIC_API_URL;

/**
 * Verifica se o email e senha conferem com o banco.
 * Salva o email no sessionStorage em caso de sucesso.
 */

export async function realizarLogin(email: string, senha: string): Promise<number> {
  const response = await fetch(`${API_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, senha }),
  });

  if (!response.ok) {
    const erro = await response.json();
    throw new Error(erro.message || "Email ou senha incorretos");
  }

  const { token } = await response.json();
  sessionStorage.setItem("token", token);
  sessionStorage.setItem("email", email);

  // Busca id_usuario e username, igual a versão antiga fazia
  const responseUsuario = await fetch(`${API_URL}/api/usuario/listagem?email=${email}`);
  const usuarios = await responseUsuario.json();
  const usuario = usuarios[0];

  const responsePessoa = await fetch(`${API_URL}/api/pessoa/listagem?id_usuario=${usuario.id_usuario}`);
  const pessoas = await responsePessoa.json();
  const pessoa = pessoas.find((p: any) => p.id_usuario === usuario.id_usuario);

  sessionStorage.setItem("id_usuario", usuario.id_usuario);
  sessionStorage.setItem("username", pessoa.username);

  return usuario.id_usuario;
}


//versão limpa, mas que dá erro 404 porque não entrega outros dados do usuário como username, ..., que a tela de inicio pede
// export async function realizarLogin(email: string, senha: string): Promise<number> {
//   const response = await fetch(`${API_URL}/api/auth/login`, {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify({ email, senha }),
//   });

//   if (!response.ok) {
//     const erro = await response.json();
//     throw new Error(erro.message || "Email ou senha incorretos");
//   }

//   const { token } = await response.json();

//   sessionStorage.setItem("token", token);
//   sessionStorage.setItem("email", email);

//   return token;
// }


//versão antiga
// export async function realizarLogin(email: string, senha: string): Promise<number> {
//   const response = await fetch(`${API_URL}/api/usuario/listagem?email=${email}`, {
//     method: "GET",
//     headers: { "Content-Type": "application/json" },
//   });

//   if (!response.ok) {
//     throw new Error("Erro ao buscar usuário");
//   }

//   const usuarios = await response.json();

//   if (!usuarios || usuarios.length === 0) {
//     throw new Error("Email ou senha incorretos (email)"); //Email não cadastrado
//   }

//   const usuario = usuarios[0];
//   const usuario_id = usuario.id_usuario;

//   if (usuario.senha !== senha) {
//     throw new Error("Email ou senha incorretos (senha)"); // Senha incorreta
//   }

//   const responsePessoa = await fetch(`${API_URL}/api/pessoa/listagem?id_usuario=${usuario.id_usuario}`, {
//     method: "GET",
//     headers: { "Content-Type": "application/json" },
//   });

//   const pessoas = await responsePessoa.json();

//   const pessoa = pessoas.find((p: any) => p.id_usuario === usuario.id_usuario);

//   if (!pessoa) {
//     throw new Error("Perfil não encontrado para este usuário");
//   }

//   const username = pessoa.username;

//   sessionStorage.setItem("email", email);
//   sessionStorage.setItem("id_usuario", usuario_id);
//   sessionStorage.setItem("username", username);

//   return usuario.id_usuario;
// }

/**
 * Busca o id_usuario no backend com base no email.
 */
export async function obterIdUsuarioPorEmail(email: string): Promise<number> {
  const response = await fetch(`${API_URL}/api/usuario/listagem?email=${email}`, {
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