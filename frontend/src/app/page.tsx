'use client';

import React from 'react';

export default function WelcomeScreen() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-200 to-blue-300 flex items-center justify-center p-4">
      <div className="text-center">
        <h1 className="text-3xl font-light mb-2">
          Bem vindo ao <span className="font-semibold">CodeMap</span>!
        </h1>
        <p className="text-sm text-gray-700 mb-8">entre na sua conta para acessar o site</p>

        <div className="bg-white rounded-lg shadow-lg p-8 w-80">
          <a href="/login">
            <button className="w-full bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium py-3 px-6 rounded-lg mb-4 transition-colors">
              Entrar
            </button>
          </a>

          <a href="/cadastro">
            <button className="w-full bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium py-3 px-6 rounded-lg transition-colors">
              Cadastrar
            </button>
          </a>



        </div>
      </div>
    </div>
  );
}