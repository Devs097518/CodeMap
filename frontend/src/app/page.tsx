'use client';

import React from 'react';
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#ffffff] text-black font-sans">

      {/* NAVBAR */}
      <nav className="w-full px-8 py-4 flex items-center justify-between text-white bg-[#0C0F4F]">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-bold text-base">

          <img
            src="/imagens/CodeMap_Icone.png"
            alt="Mapa de tesouro"
            width={40}
            height={40}
            className="rounded-4xl"
          />
          <h1 className='text-4xl'>CodeMap</h1>
          
        </Link>

        {/* Links */}
        <ul className="flex items-center gap-20 text-sm font-medium text-white/80">
          <li><Link href="#" className="hover:text-white transition-colors text-2xl">sobre</Link></li>
          <li><Link href="#" className="hover:text-white transition-colors text-2xl">contato</Link></li>
          <li>
            <Link href="/login" className="hover:text-white transition-colors text-2xl">entrar</Link>
          </li>
        </ul>
      </nav>

      {/* HERO */}
      <section className="max-w-5xl mx-auto px-8 py-20 flex flex-col md:flex-row items-center justify-between gap-12">

        {/* Coluna esquerda */}
        <div className="flex flex-col items-start gap-5 max-w-sm">
          <h1 className="text-3xl font-extrabold tracking-tight">BEM VINDO!</h1>

          <p className='text-base/7'>
            Lorem ipsum, dolor sit amet consectetur adipisicing elit. Dicta ducimus totam mollitia sequi, porro reprehenderit alias eum, ab incidunt ipsa nam harum perspiciatis quod amet molestiae vitae exercitationem accusantium error.
          </p>

          <Link
            href="/login"
            className="mt-2 bg-[#312e81] hover:bg-[#3730a3] text-white font-semibold px-6 py-2.5 rounded-lg transition-colors"
          >
            entrar
          </Link>
        </div>


        {/* Coluna direita — Ilustração mapa de tesouro */}
        <div className="flex-1 flex justify-center">
          <img
            src="/imagens/roadmap_img.avif"
            alt="Mapa de tesouro"
            width={480}
            height={480}
            className=""
          />
        </div>

      </section>
    </div>
  );
}