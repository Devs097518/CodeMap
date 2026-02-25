const API_URL = process.env.NEXT_PUBLIC_API_URL;

/**
 * Busca o id_usuario no backend com base no email.
 * Usa os dados salvos no sessionStorage do login.
 */
export async function obterIdUsuarioPorEmail(email: string): Promise<number> {
  const response = await fetch(`${API_URL}/listagem-usuario?email=${email}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) {
    throw new Error("Erro ao buscar usuário");
  }

   const usuarios = await response.json(); // ← É um array
  
  if (!usuarios || usuarios.length === 0) {
    throw new Error("Usuário não encontrado");
  }
  
  return usuarios[0].id_usuario; // ← Pega o primeiro resultado do array
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