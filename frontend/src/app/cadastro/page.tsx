'use client';

import { useState } from "react";
import Link from "next/link";
import { cadastrarCompleto } from '../../service/cadastro-service';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [username, setUsername] = useState("");
    const [uf, setUf] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [fieldError, setFieldError] = useState<{ email?: string; username?: string } | null>(null);

    const router = useRouter();

    const UF_OPTIONS = [
        "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO",
        "MA", "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI",
        "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO",
    ];


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!username || !uf || !email || !password || !confirmPassword) {
            console.log('Preencha todos os campos');
            return;
        }

        setLoading(true); 

        try {
            await cadastrarCompleto({
                email,
                senha: password,
                username,
                uf,
            });
            router.push('../');
        } catch (error: any) {
            const msg: string = error?.message ?? "";

            if (msg.includes("usuario_email_key")) {
                setFieldError({ email: "Este e-mail já está cadastrado." });

            } else if (msg.includes("pessoa_username_key")) {

                setFieldError({ username: "Este username já está em uso." });

            } else {
                setFieldError(null);
                console.log(error);
            }

            setLoading(false);
        }

    };

    return (
        <main className="min-h-screen bg-[#ffffff] flex items-center justify-center px-4">
            <div
                className="bg-gris rounded-2xl shadow-lg px-10 py-12 w-full max-w-sm flex flex-col items-center"
                style={{ boxShadow: "5px 5px 5px 1px #45454472" }}
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
                <form onSubmit={handleSubmit} className="w-full flex flex-col items-start justify-center gap-4">


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
                                onChange={(e) => { setUsername(e.target.value); setFieldError(null); }}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-[#2d2f6e] focus:ring-2 focus:ring-[#2d2f6e]/10 transition-all bg-white"
                            />
                            {fieldError?.username && (
                                <p className="text-xs text-red-400 mt-">{fieldError.username}</p>
                            )}
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


                    <div className="flex flex-col gap-1" >
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
                            onChange={(e) => { setEmail(e.target.value); setFieldError(null); }}
                            required
                            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-[#2d2f6e] focus:ring-2 focus:ring-[#2d2f6e]/10 transition-all bg-white placeholder-transparent"
                        />
                        {fieldError?.email && (
                            <p className="text-xs text-red-400 mt-1">{fieldError.email}</p>
                        )}
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
                        className="mt-2 w-35 bg-[#2d2f6e] hover:bg-[#223dc0] active:scale-[0.98] text-white text-sm font-medium rounded-lg py-3 transition-all duration-200 disabled:opacity-70 flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-lg animate-spin" />
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

