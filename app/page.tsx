'use client'

import { TokenSwapForm } from '@/components/token-swap-form'

export default function TokenSwapConverter() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#1C1C1C] px-4">
      <div className="max-w-2xl text-center space-y-4 px-4 py-16">
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-500 via-blue-400 to-blue-500 bg-clip-text text-transparent">
          Crypto SINPE
        </h1>
        <p className="text-gray-400 text-lg md:text-xl font-light">
          La manera más fácil de convertir crypto a colones
        </p>
      </div>
      <div className="w-full max-w-2xl space-y-8">
        <TokenSwapForm />
      </div>
    </div>
  )
}

