'use client';

import { useState } from "react";
import Link from "next/link";
import { useRouter } from 'next/navigation';
import { realizarLogin } from '../../service/usuario-service';

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simulate login
    try {
      const idUsuario = await realizarLogin(email, password);
      router.push('/dashboard/staff/inicio');
    } catch (error: unknown) {
      alert(error); // "Email não cadastrado" ou "Senha incorreta"
    }


    await new Promise((r) => setTimeout(r, 1200));
    setLoading(false);
  };


  return (
    <main className="min-h-screen bg-[#ffffff] flex items-center justify-center px-4">
      <div
        className="bg-gris rounded-2xl shadow-lg px-10 py-12 w-full max-w-sm flex flex-col items-center"
        style={{ boxShadow: "8px 8px 20px 2px #969696a6" }}
      >
        {/* Logo */}
        <div className="mb-4">
          <img
            src="/imagens/CodeMap_Icone.png"
            alt="Mapa de tesouro"
            width={50}
            height={50}
            className="rounded-4xl"
          />
        </div>

        {/* Title */}
        <h1 className="text-2xl font-semibold text-gray-800 tracking-tight mb-1">
          CodeMap
        </h1>
        <p className="text-sm text-gray-400 mb-8">
          seu caminho para desenvolvimento
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="w-full flex flex-col items-center justify-center gap-4">
          <div className="flex flex-col gap-1">
            <label
              htmlFor="email"
              className="text-sm text-gray-600 font-medium"
            >
              email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-[#2d2f6e] focus:ring-2 focus:ring-[#2d2f6e]/10 transition-all bg-white placeholder-transparent"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label
              htmlFor="senha"
              className="text-sm text-gray-600 font-medium"
            >
              senha
            </label>
            <input
              id="senha"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-[#2d2f6e] focus:ring-2 focus:ring-[#2d2f6e]/10 transition-all bg-white placeholder-transparent"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 w-32 bg-[#2d2f6e] hover:bg-[#223dc0] active:scale-[0.98] text-white text-sm font-medium rounded-full py-3 transition-all duration-200 disabled:opacity-70 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                entrando...
              </>
            ) : (
              "entrar"
            )}
          </button>
        </form>

        {/* Register link */}
        <p className="mt-6 text-sm text-gray-500">
          Não tem conta?{" "}
          <Link
            href="/cadastro"
            className="text-[#3b82f6] hover:text-[#2563eb] font-medium transition-colors"
          >
            Cadastre-se
          </Link>
        </p>
      </div>
    </main>
  );
}



// import React, { useState } from 'react';
// import { useRouter } from 'next/navigation';
// import { obterIdUsuarioLogado } from '../../service/usuario-service';

// export default function LoginScreen() {

//     const [email, setEmail] = useState('');
//     const [senha, setSenha] = useState('');

//     const router = useRouter();

//     sessionStorage.setItem("email", email);
//     sessionStorage.setItem("senha", senha);


//     const handleLogin = async () => {
//         try {
//             let dados = await obterIdUsuarioLogado();
//             if (dados) {
//                 sessionStorage.setItem("idUsuario", dados.toString());
//                 router.push('/inicio');
//             }else{
//                 alert('email ou senha incorretos');
//             }

//         }
//         catch (error: any) {
//             console.log(error);
//         }
//     };

//     return (
//         <div className="min-h-screen bg-gradient-to-b from-blue-200 to-blue-300 flex items-center justify-center p-4">
//             <div className="text-center">
//                 <h1 className="text-3xl font-light text-black mb-8">Preencha suas credenciais</h1>

//                 <div className="bg-white rounded-lg shadow-lg p-8 w-80">
//                     <h2 className="text-lg text-black font-medium mb-6">Acessar Conta</h2>

//                     <input
//                         type="email"
//                         placeholder="Email"
//                         value={email}
//                         onChange={(e) => setEmail(e.target.value)}
//                         className="w-full px-4 py-2 mb-4 border text-black border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                     />

//                     <input
//                         type="password"
//                         placeholder="Senha"
//                         value={senha}
//                         onChange={(e) => setSenha(e.target.value)}
//                         className="w-full px-4 py-2 mb-6 border text-black border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                     />


//                     <button
//                         onClick={handleLogin}
//                         className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-8 rounded-md transition-colors"
//                     >
//                         Entrar
//                     </button>


//                 </div>
//             </div>
//         </div>
//     );
// }