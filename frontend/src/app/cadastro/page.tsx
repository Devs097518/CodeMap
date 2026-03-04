'use client';

import { useState } from "react";
import Link from "next/link";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [username, setUsername] = useState("");
    const [uf, setUf] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const UF_OPTIONS = [
        "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO",
        "MA", "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI",
        "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO",
    ];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        // Simulate login
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
                    Criar Conta
                </h1>
                <p className="text-sm text-gray-400 mb-8">
                    seu caminho para desenvolvimento
                </p>

                {/* Form */}
                <form onSubmit={handleSubmit} className="w-full flex flex-col items-center justify-center gap-4">


                    {/* Username + UF - lado a lado */}
                    <div className="flex gap-3">
                        <div className="flex flex-col gap-1 flex-1">
                            <label htmlFor="username" className="text-sm text-gray-600 font-medium">
                                username
                            </label>
                            <input
                                id="username"
                                type="text"
                                required
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-[#2d2f6e] focus:ring-2 focus:ring-[#2d2f6e]/10 transition-all bg-white"
                            />
                        </div>

                        <div className="flex flex-col gap-1 w-28">
                            <label htmlFor="uf" className="text-sm text-gray-600 font-medium">
                                UF
                            </label>
                            <select
                                id="uf"
                                required
                                value={uf}
                                onChange={(e) => setUf(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-[#2d2f6e] focus:ring-2 focus:ring-[#2d2f6e]/10 transition-all bg-white appearance-none cursor-pointer"
                            >
                                <option value="">—</option>
                                {UF_OPTIONS.map((uf) => (
                                    <option key={uf} value={uf}>{uf}</option>
                                ))}
                            </select>
                        </div>
                    </div>


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

                    <div className="flex gap-3">
                        <div className="flex flex-col gap-1 flex-1">
                            <label htmlFor="senha" className="text-sm text-gray-600 font-medium">
                                senha
                            </label>
                            <input
                                id="senha"
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-[#2d2f6e] focus:ring-2 focus:ring-[#2d2f6e]/10 transition-all bg-white"
                            />
                        </div>

                        <div className="flex flex-col gap-1 flex-1">
                            <label htmlFor="confirmar-senha" className="text-sm text-gray-600 font-medium">
                                confirmar senha
                            </label>
                            <input
                                id="confirmar-senha"
                                type="password"
                                required
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className={`w-full border rounded-lg px-3 py-2.5 text-sm text-gray-800 outline-none focus:ring-2 transition-all bg-white
        ${confirmPassword && password !== confirmPassword
                                        ? "border-red-400 focus:border-red-400 focus:ring-red-400/10"
                                        : "border-gray-300 focus:border-[#2d2f6e] focus:ring-[#2d2f6e]/10"
                                    }`}
                            />
                        </div>
                    </div>

                    {/* Feedback de senha não coincidente */}
                    {confirmPassword && password !== confirmPassword && (
                        <p className="text-xs text-red-400 -mt-2">as senhas não coincidem</p>
                    )}




                    <div className="flex flex-col gap-1"></div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="mt-2 w-32 bg-[#2d2f6e] hover:bg-[#223dc0] active:scale-[0.98] text-white text-sm font-medium rounded-full py-3 transition-all duration-200 disabled:opacity-70 flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                cadastrando...
                            </>
                        ) : (
                            "cadastrar"
                        )}
                    </button>
                </form>

                {/* Register link */}
                <p className="mt-6 text-sm text-gray-500">
                    Já tem conta?{" "}
                    <Link
                        href="/login"
                        className="text-[#3b82f6] hover:text-[#2563eb] font-medium transition-colors"
                    >
                        Entrar
                    </Link>
                </p>
            </div>
        </main>
    );
}

function CompassIcon() {
    return (
        <svg
            width="52"
            height="52"
            viewBox="0 0 52 52"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <defs>
                <radialGradient
                    id="outerRing"
                    cx="50%"
                    cy="30%"
                    r="60%"
                    fx="50%"
                    fy="30%"
                >
                    <stop offset="0%" stopColor="#c8c4a0" />
                    <stop offset="100%" stopColor="#7a7a8a" />
                </radialGradient>
                <radialGradient
                    id="innerCircle"
                    cx="40%"
                    cy="35%"
                    r="60%"
                    fx="40%"
                    fy="35%"
                >
                    <stop offset="0%" stopColor="#5a5870" />
                    <stop offset="100%" stopColor="#2a2840" />
                </radialGradient>
            </defs>
            {/* Outer ring */}
            <circle cx="26" cy="26" r="25" fill="url(#outerRing)" />
            {/* Inner circle */}
            <circle cx="26" cy="26" r="18" fill="url(#innerCircle)" />
            {/* Compass needle highlight */}
            <ellipse
                cx="26"
                cy="20"
                rx="3"
                ry="7"
                fill="white"
                opacity="0.85"
                transform="rotate(-20 26 26)"
            />
            <ellipse
                cx="26"
                cy="32"
                rx="2.5"
                ry="5"
                fill="#888"
                opacity="0.5"
                transform="rotate(-20 26 26)"
            />
            {/* Center dot */}
            <circle cx="26" cy="26" r="2" fill="white" opacity="0.9" />
        </svg>
    );
}

// 'use client';

// import React, { useState } from 'react';
// import { useRouter } from 'next/navigation';
// import Link from 'next/link';
// import { cadastrarCompleto } from '../../service/cadastro-service';


// export default function RegisterScreen() {

//     const [username, setUsername] = useState("");
//     const [uf, setUF] = useState("");
//     const [email, setEmail] = useState("");
//     const [senha, setSenha] = useState("");

//     const router = useRouter();

//     const [formData, setFormData] = useState({
//         username: '',
//         estado: '',
//         email: '',
//         senha: ''
//     });


//     const handleRegister = () => {
//         if (!username || !uf || !email || !senha) {
//             console.log('Preencha todos os campos');
//             return;
//         }

//         try {
//             cadastrarCompleto({
//                 email: email,
//                 senha: senha,
//                 username: username,
//                 uf: uf,
//             });
//             setUsername("");
//             setUF("");
//             setEmail("");
//             setSenha("");

//             router.push('../')
//         }
//         catch (error: any) {
//             console.log(error);
//         }

//         console.log('Cadastro:', formData);
//     };

//     return (
//         <div className="min-h-screen bg-gradient-to-b from-blue-200 to-blue-300 flex items-center justify-center p-4">
//             <div className="text-center">
//                 <h1 className="text-4xl text-black font-light mb-8">Preencha seus dados</h1>

//                 <div className="bg-white rounded-lg shadow-lg p-8 w-100">
//                     <h2 className="text-2xl text-black font-medium mb-6">Cadastrar Conta</h2>

//                     <div className="grid grid-cols-2 gap-3 mb-4">

//                         <input
//                             type="text"
//                             placeholder="Username"
//                             value={username}
//                             onChange={(e) => setUsername(e.target.value)}
//                             className="px-3 py-2 border border-gray-300 rounded-md text-1xl text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
//                         />

//                         <input
//                             type="text"
//                             placeholder="UF"
//                             value={uf}
//                             onChange={(e) => setUF(e.target.value)}
//                             className="px-3 py-2 border border-gray-300 rounded-md text-1xl text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
//                         />
//                     </div>



//                     <div className="grid grid-cols-2 gap-3 mb-6">
//                         <input
//                             type="email"
//                             placeholder="Email"
//                             value={email}
//                             onChange={(e) => setEmail(e.target.value)}
//                             className="px-3 py-2 border border-gray-300 rounded-md text-1xl text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
//                         />

//                         <input
//                             type="password"
//                             placeholder="Senha"
//                             value={senha}
//                             onChange={(e) => setSenha(e.target.value)}
//                             className="px-3 py-2 border border-gray-300 rounded-md text-1xl text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
//                         />
//                     </div>

//                     <button
//                         onClick={handleRegister}
//                         className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-md text-1xl transition-colors"
//                     >
//                         cadastrar
//                     </button>


//                 </div>
//             </div>
//         </div>
//     );
// }