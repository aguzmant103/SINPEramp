'use client'

import { TokenSwapForm } from '@/components/token-swap-form'

export default function TokenSwapConverter() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-[#2a1457] to-[#1a0a2e] flex flex-col items-center py-10">
      {/* Logo */}
      <h1 className="text-5xl font-bold mb-2 flex items-center gap-1 select-none">
        <span className="text-white">Defi</span>
        <span className="text-[#a3a1ff]">p</span>
        <span className="rounded-full bg-gradient-to-tr from-yellow-400 to-pink-500 px-2 text-white flex items-center justify-center">
          <span role="img" aria-label="smile">😊</span>
        </span>
        <span className="text-[#a3a1ff]">p</span>
      </h1>
      <p className="text-lg text-white/80 mb-8">La forma mas popular de entrar a DeFi</p>
      <div className="w-full max-w-2xl space-y-8">
        <TokenSwapForm />
      </div>
    </main>
  )
}

