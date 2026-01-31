'use client';

import React, { useState } from 'react';

export default function RegisterScreen() {
    const [formData, setFormData] = useState({
        nome: '',
        username: '',
        estado: '',
        email: '',
        senha: ''
    });

    const handleChange = (field: string, value: string) => {
        setFormData({ ...formData, [field]: value });
    };

    const handleRegister = () => {
        console.log('Cadastro:', formData);
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-blue-200 to-blue-300 flex items-center justify-center p-4">
            <div className="text-center">
                <h1 className="text-4xl text-black font-light mb-8">Preencha seus dados</h1>

                <div className="bg-white rounded-lg shadow-lg p-8 w-100">
                    <h2 className="text-2xl text-black font-medium mb-6">Cadastrar Conta</h2>

                    <input
                        type="text"
                        placeholder="Nome"
                        value={formData.estado}
                        onChange={(e) => handleChange('estado', e.target.value)}
                        className="w-full px-3 py-2 mb-4 border border-gray-300 rounded-md text-1xl text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <div className="grid grid-cols-2 gap-3 mb-4">

                        <input
                            type="text"
                            placeholder="Username"
                            value={formData.nome}
                            onChange={(e) => handleChange('nome', e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-md text-1xl text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />

                        <input
                            type="text"
                            placeholder="UF"
                            value={formData.username}
                            onChange={(e) => handleChange('username', e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-md text-1xl text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>



                    <div className="grid grid-cols-2 gap-3 mb-6">
                        <input
                            type="email"
                            placeholder="Email"
                            value={formData.email}
                            onChange={(e) => handleChange('email', e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-md text-1xl text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />

                        <input
                            type="password"
                            placeholder="Senha"
                            value={formData.senha}
                            onChange={(e) => handleChange('senha', e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-md text-1xl text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <a href="../">
                        <button
                            onClick={handleRegister}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-md text-1xl transition-colors"
                        >
                            cadastrar
                        </button>
                    </a>


                </div>
            </div>
        </div>
    );
}