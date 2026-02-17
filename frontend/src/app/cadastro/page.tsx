'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { cadastrarCompleto } from '../../service/cadastro-service';


export default function RegisterScreen() {

    const [username, setUsername] = useState("");
    const [uf, setUF] = useState("");
    const [email, setEmail] = useState("");
    const [senha, setSenha] = useState("");

    const router = useRouter();

    const [formData, setFormData] = useState({
        username: '',
        estado: '',
        email: '',
        senha: ''
    });


    const handleRegister = () => {
        if (!username || !uf || !email || !senha) {
            console.log('Preencha todos os campos');
            return;
        }

        try {
            cadastrarCompleto({
                email: email,
                senha: senha,
                username: username,
                uf: uf,
            });
            setUsername("");
            setUF("");
            setEmail("");
            setSenha("");

            router.push('../')
        }
        catch (error: any) {
            console.log(error);
        }

        console.log('Cadastro:', formData);
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-blue-200 to-blue-300 flex items-center justify-center p-4">
            <div className="text-center">
                <h1 className="text-4xl text-black font-light mb-8">Preencha seus dados</h1>

                <div className="bg-white rounded-lg shadow-lg p-8 w-100">
                    <h2 className="text-2xl text-black font-medium mb-6">Cadastrar Conta</h2>

                    <div className="grid grid-cols-2 gap-3 mb-4">

                        <input
                            type="text"
                            placeholder="Username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-md text-1xl text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />

                        <input
                            type="text"
                            placeholder="UF"
                            value={uf}
                            onChange={(e) => setUF(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-md text-1xl text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>



                    <div className="grid grid-cols-2 gap-3 mb-6">
                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-md text-1xl text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />

                        <input
                            type="password"
                            placeholder="Senha"
                            value={senha}
                            onChange={(e) => setSenha(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-md text-1xl text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <button
                        onClick={handleRegister}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-md text-1xl transition-colors"
                    >
                        cadastrar
                    </button>


                </div>
            </div>
        </div>
    );
}