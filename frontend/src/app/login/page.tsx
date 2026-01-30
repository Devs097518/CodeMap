'use client';

import React, { useState } from 'react';

export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');

    const handleLogin = () => {
        console.log('Login:', { email, senha });
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-blue-200 to-blue-300 flex items-center justify-center p-4">
            <div className="text-center">
                <h1 className="text-3xl font-light mb-8">Preencha suas credenciais</h1>

                <div className="bg-white rounded-lg shadow-lg p-8 w-80">
                    <h2 className="text-lg font-medium mb-6">Acessar Conta</h2>

                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-2 mb-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />

                    <input
                        type="password"
                        placeholder="Senha"
                        value={senha}
                        onChange={(e) => setSenha(e.target.value)}
                        className="w-full px-4 py-2 mb-6 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />

                    <a href="/inicio">
                        <button
                            onClick={handleLogin}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-8 rounded-md transition-colors"
                        >
                            Entrar
                        </button>
                    </a>

                </div>
            </div>
        </div>
    );
}