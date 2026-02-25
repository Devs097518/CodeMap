import { API_URL, defaultHeaders } from './api';

// //GET
// export interface Conteudo {
//   id_usuario: number;
// }

// O que você envia para criar (POST)
export interface CadastroTexto {
  conteudo: string;
  id_usuario: string;
}




export async function SalvarTexto(dados: CadastroTexto): Promise<void> {
  // Verifica se o usuário já possui um texto cadastrado ##############################
  const textoExistente = await BuscarTextoPorUsuario(dados.id_usuario);

  const method = textoExistente ? 'PUT' : 'POST';
  const url = textoExistente
    ? `${API_URL}/editar-texto/${dados.id_usuario}`
    : `${API_URL}/novo-texto`;

  const response = await fetch(url, {
    method,
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
    throw new Error(result.mensagem || `Erro ao salvar texto (HTTP ${response.status})`);
  }
}



// Busca para saber se já existe texto do usuário ###################################
async function BuscarTextoPorUsuario(id_usuario: string): Promise<boolean> {
  const response = await fetch(`${API_URL}/texto/${id_usuario}`, {
    headers: defaultHeaders(),
  });

  if (response.status === 404) return false;
  if (!response.ok) throw new Error('Erro ao verificar texto existente');

  return true;
}



export async function obterConteudoPorID(id: string): Promise<number> {
  const response = await fetch(`${API_URL}/listagem-texto?id_usuario=${id}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) {
    throw new Error("Erro ao buscar texto");
  }

   const texto = await response.json(); // ← É um array
  
  if (!texto || texto.length === 0) {
    throw new Error("Usuário não encontrado");
  }
  
  return texto[0].conteudo; // ← Pega o primeiro resultado do array
}




// export async function CriarTexto(dados: CadastroTexto): Promise<void> {
//   const response = await fetch(`${API_URL}/novo-texto`, {
//     method: 'POST',
//     headers: defaultHeaders(),
//     body: JSON.stringify(dados),
//   });

//   // Garante que o parse do JSON não quebre se o servidor retornar corpo vazio/inválido
//   let result: { status?: string; mensagem?: string } = {};
//   try {
//     result = await response.json();
//   } catch {
//     // Corpo não é JSON válido (comum em erros 500 sem body estruturado)
//     throw new Error(`Erro HTTP ${response.status}: resposta inválida do servidor`);
//   }

//   if (!response.ok || result.status === 'erro') {
//     throw new Error(result.mensagem || `Erro ao cadastrar texto (HTTP ${response.status})`);
//   }
// }

// export class TextoService {
//   /**
//    * POST: Cadastra um novo autor
//    */
//   async CriarTexto(dados: CadastroTexto): Promise<void> {
//     const response = await fetch(`${API_URL}/novo-texto`, {
//       method: 'POST',
//       headers: defaultHeaders(),
//       body: JSON.stringify(dados),
//     });

//     const result = await response.json();
//     if (!response.ok || result.status === 'erro') {
//       throw new Error(result.mensagem || 'Erro ao cadastrar autor');
//     }
//   }

  /**
   * GET: Lista todos os autores
   */
  // async getAllAuthors(): Promise<Conteudo[]> {
  //   try {
  //     const response = await fetch(`${API_URL}/autores/index.php`, {
  //       method: 'GET',
  //       // AJUSTE: Adicionado () para autorizar a listagem
  //       headers: defaultHeaders(),
  //       cache: 'no-store',
  //     });

  //     if (!response.ok) return [];

  //     const json = await response.json();

  //     // Ajustado para o padrão do seu PHP que usa a chave 'dados'
  //     if (json.dados && Array.isArray(json.dados)) return json.dados;
  //     if (json.data && Array.isArray(json.data)) return json.data;
  //     if (Array.isArray(json)) return json;

  //     return [];
  //   } catch (error) {
  //     console.error('Erro ao buscar autores:', error);
  //     return [];
  //   }
  // }
// }