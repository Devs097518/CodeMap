'use client';

import React from 'react';
import Link from "next/link";
import { Github, Linkedin } from "lucide-react";

const trilhasPopulares = [
  { titulo: "TypeScript", categoria: "web intermediário", destaque: false },
  { titulo: "Segurança Básica", categoria: "segurança", destaque: false },
  { titulo: "HTML", categoria: "web básico", destaque: true },
  { titulo: "React", categoria: "web intermediário", destaque: false },
  { titulo: "Java", categoria: "web avançado", destaque: false },
  { titulo: "C++", categoria: "web avançado", destaque: false },
  { titulo: "CSS", categoria: "web básico", destaque: true },
];

const comoFunciona = [
  {
    src: "/imagens/TP-1.png",
    alt: "Tela de trilhas separadas por categoria",
    legenda: "1: Escolha uma trilha",
  },
  {
    src: "/imagens/TP-2.png",
    alt: "Tela de tópicos de uma trilha com checkbox de estudado",
    legenda: "2: Siga os tópicos",
  },
  {
    src: "/imagens/TP-3.png",
    alt: "Card de trilha com barra de progresso",
    legenda: "3: Marque seu progresso",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-[#ffffff] text-black font-sans">

      {/* NAVBAR */}
      <nav id='navbar' className="bg-[#0C0F4F] text-white shadow-lg p-4 flex items-center justify-between shrink-0">
        <Link href="/" className="flex items-center gap-3 font-bold text-3xl">
          <img
            src="/imagens/CodeMap_Icone.png"
            alt="Mapa de tesouro"
            width={40}
            height={40}
            className="rounded-2xl"
          />
          <h1 className='text-3xl'>CodeMap</h1>
        </Link>

        <ul className="flex items-center gap-20 text-sm">
          <li>
            <Link
              href="#hero"
              className="flex items-center gap-2 hover:bg-sky-200/10 px-3 py-1 rounded-lg transition-all text-2xl">
              Sobre
            </Link>
          </li>
          <li>
            <Link
              href="#contato"
              className="flex items-center gap-2 hover:bg-sky-200/10 px-3 py-1 rounded-lg transition-all text-2xl">
              Contato
            </Link>
          </li>
          <li>
            <Link
              href="/login"
              className="flex items-center gap-2 hover:bg-sky-200/10 px-3 py-1 rounded-lg transition-all text-2xl">
              Entrar
            </Link>
          </li>
        </ul>
      </nav>

      {/* HERO */}
      <section id='hero' className="max-w-5xl mx-auto px-8 py-20 flex flex-col md:flex-row items-center justify-between gap-12">
        <div className="flex flex-col items-start gap-5 max-w-md">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight leading-tight">
            Monte seu caminho e domine a programação sem se perder no excesso de informação.
          </h1>

          <p className="text-base/7 text-gray-600">
            O CodeMap guia seus estudos do zero ao avançado através de roadmaps interativos.
            Escolha sua categoria, navegue por tópicos encadeados, marque o que já aprendeu e
            tenha clareza absoluta sobre o seu próximo passo.
          </p>

          <Link
            href="/login"
            className="mt-2 bg-[#3b82f6] hover:bg-[#2563eb] hover:shadow-lg hover:shadow-blue-500/50 text-white font-semibold px-6 py-2.5 rounded-lg transition-colors transition-all duration-200 ease-out"
          >
            Acessar minhas trilhas
          </Link>
        </div>

        <div className="flex-1 flex justify-center">
          <img
            src="/imagens/roadmap_img.avif"
            alt="Ilustração de um caminho sinuoso com marcadores de progresso"
            width={480}
            height={480}
          />
        </div>
      </section>

      {/* TRILHAS POPULARES */}
      <section id='trilhas' className="bg-indigo-100 px-8 py-16">
        <div className="max-w-4xl mx-auto flex flex-col items-center gap-8">
          <h2 className="text-2xl font-bold text-gray-900">Trilhas Populares</h2>

          <div className="flex flex-col items-center gap-4">
            {[
              trilhasPopulares.slice(0, 2),
              trilhasPopulares.slice(2, 5),
              trilhasPopulares.slice(5, 7),
            ].map((linha, i) => (
              <div key={i} className="flex flex-wrap justify-center gap-4">
                {linha.map((trilha) => (
                  <div
                    key={trilha.titulo}
                    className={`flex flex-col items-center rounded-2xl px-6 py-4 shadow-sm cursor-pointer
                      transition-all duration-200 ease-out
                      hover:-translate-y-1 hover:shadow-lg hover:ring-2 hover:ring-[#312e81]/40
                      ${trilha.destaque ? "bg-yellow-100" : "bg-white"}`}
                  >
                    <span className="text-xl font-semibold text-gray-900">{trilha.titulo}</span>
                    <span className="text text-gray-500">{trilha.categoria}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* COMO FUNCIONA */}
      <section id='como-funciona' className="px-8 py-16">
        <div className="max-w-5xl mx-auto flex flex-col items-center gap-10">
          <h2 className="text-2xl font-bold text-gray-900">Como funciona</h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 w-full">
            {comoFunciona.map((passo) => (
              <div key={passo.legenda} className="flex flex-col items-center gap-4">
                <img
                  src={passo.src}
                  alt={passo.alt}
                  className="w-full rounded-10 inset-shadow-sm
                  hover:-translate-y-1 transition-all duration-200 ease-out hover:shadow-lg"
                />
                <span className="text font-medium text-gray-700">{passo.legenda}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer id='contato' className="bg-[#0C0F4F] text-white py-8 px-8">
        <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-center gap-12">
          <a
            href="https://github.com/Devs097518/CodeMap"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <span className="font-semibold">GitHub</span>
            <Github size={22} />
          </a>
          <a
            href="https://www.linkedin.com/in/dayvson-lacerda-327031216/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <span className="font-semibold">LinkedIn</span>
            <Linkedin size={22} />
          </a>
        </div>
      </footer>
    </div>
  );
}