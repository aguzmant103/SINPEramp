'use client'

import { useState } from 'react'
import { useCurrencyConversion } from '@/hooks/useCurrencyConversion'
import { useDebounce } from '@/hooks/useDebounce'
import { DollarSign, ArrowDown } from 'lucide-react'
import { DaimoPayButton } from '@daimo/pay'
import { PaymentStartedEvent } from '@daimo/common'
import confetti from 'canvas-confetti'

export function TokenSwapForm() {
  const [sendAmount, setSendAmount] = useState<string>('')
  const [isDaimoLoading, setIsDaimoLoading] = useState<boolean>(false)
  const [payId, setPayId] = useState<string>()
  const [txHash, setTxHash] = useState<string>()
  const [phoneNumber, setPhoneNumber] = useState<string>('')
  const debouncedSendAmount = useDebounce(sendAmount, 500)
  const { crcAmount: convertedAmount, isLoading, error, exchangeRate } = useCurrencyConversion(debouncedSendAmount)

  const triggerConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    })
  }

  // Temporary test button component
  const TestConfettiButton = () => (
    <button
      onClick={triggerConfetti}
      className="fixed bottom-4 right-4 bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-xl"
    >
     🎉
    </button>
  )

  const formatCurrency = (amount: string, currency: 'USD' | 'CRC') => {
    const num = parseFloat(amount)
    if (isNaN(num)) return '0.00'
    return num.toLocaleString('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  }

  return (
    <div className="min-h-screen bg-[#1C1C1C] flex flex-col items-center justify-center p-4">
      <TestConfettiButton />
      <div className="w-full max-w-md">
        {/* Main Form Section */}
        <div className="space-y-3">
          {/* Send Token Card (USD) */}
          <div className="bg-[#2C2C2C] rounded-2xl p-4 border border-gray-800">
            <div className="flex justify-between items-center mb-2">
              <label htmlFor="sendAmount" className="text-gray-400 text-sm">
                Envías
              </label>
              <div className="flex items-center gap-2 bg-[#3C3C3C] px-3 py-1.5 rounded-xl">
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                  <DollarSign className="w-4 h-4 text-white" />
                </div>
                <span className="text-white font-medium">All</span>
              </div>
            </div>
            <input
              id="sendAmount"
              type="text"
              inputMode="numeric"
              className="w-full bg-transparent text-4xl text-white placeholder-gray-600 outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              placeholder="0"
              value={sendAmount}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '');
                if (value === '' || /^\d+$/.test(value)) {
                  setSendAmount(value);
                }
              }}
              min="0"
            />
            <div className="text-gray-500 text-sm mt-1">
              {formatCurrency(sendAmount, 'USD')}
            </div>
          </div>

          {/* Arrow Divider */}
          <div className="flex justify-center">
            <div className="w-8 h-8 bg-[#3C3C3C] rounded-full flex items-center justify-center">
              <ArrowDown className="w-4 h-4 text-gray-400" />
            </div>
          </div>

          {/* Receive Token Card (CRC) */}
          <div className="bg-[#2C2C2C] rounded-2xl p-4 border border-gray-800">
            <div className="flex justify-between items-center mb-2">
              <label className="text-gray-400 text-sm">
                Recibes
              </label>
              <div className="flex items-center gap-2 bg-[#3C3C3C] px-3 py-1.5 rounded-xl">
                <span className="text-white font-medium">CRC</span>
              </div>
            </div>
            <div className="text-4xl text-white font-medium">
              {isLoading ? 
                'Calculando...' : 
                convertedAmount ? 
                  Number(convertedAmount).toLocaleString('es-CR', { 
                    minimumFractionDigits: 2, 
                    maximumFractionDigits: 2 
                  }) : 
                  '0.00'
              }
            </div>
            <div className="flex justify-between text-sm mt-1">
              <span className="text-gray-500">
                {formatCurrency(convertedAmount || '0', 'CRC')}
              </span>
              <span className="text-gray-400">
                1 USD = {exchangeRate?.toLocaleString('es-CR', { 
                  minimumFractionDigits: 2, 
                  maximumFractionDigits: 2 
                })} CRC
              </span>
            </div>
          </div>

          {/* Phone Number Card */}
          <div className="bg-[#2C2C2C] rounded-2xl p-4 border border-gray-800">
            <div className="flex justify-between items-center mb-2">
              <label htmlFor="phoneNumber" className="text-gray-400 text-sm">
                Número SINPE Móvil
              </label>
            </div>
            <div className="flex items-center gap-2">
              <div className="bg-[#3C3C3C] px-3 py-2 rounded-xl text-gray-400 text-lg">
                (+506)
              </div>
              <input
                id="phoneNumber"
                type="text"
                inputMode="numeric"
                pattern="\d*"
                maxLength={9}
                placeholder="0000-0000"
                value={phoneNumber}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '');
                  if (value.length <= 8) {
                    if (value.length <= 4) {
                      setPhoneNumber(value);
                    } else {
                      setPhoneNumber(`${value.slice(0, 4)}-${value.slice(4)}`);
                    }
                  }
                }}
                className="w-full bg-transparent text-2xl text-white placeholder-gray-600 outline-none"
              />
            </div>
          </div>

          {error && (
            <div className="text-red-500 text-sm px-4">
              {error === 'Failed to fetch exchange rate' ? 'Error al obtener el tipo de cambio' : error}
            </div>
          )}

          {/* DaimoPayButton */}
          <div className="bg-[#2C2C2C] rounded-2xl p-4 border border-gray-800">
            <DaimoPayButton.Custom
              appId="pay-demo"
              toChain={10}
              toUnits={sendAmount}
              toToken="0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85"
              toAddress="0xf446845fAB5367178a1C9e2ffd8D3b7EE678BAfe"
              intent="SINPE_RAMP_PAYMENT"
              closeOnSuccess={true}
              onPaymentStarted={(e: PaymentStartedEvent) => {
                if (!isDaimoLoading) {
                  console.log('Pago iniciado', e.paymentId)
                  setPayId(e.paymentId)
                  setIsDaimoLoading(true)
                }
              }}
              onPaymentCompleted={(e) => {
                if (!isDaimoLoading) {
                  console.log('Pago completado', e.txHash)
                  setTxHash(e.txHash)
                  setIsDaimoLoading(false)
                  setTimeout(triggerConfetti, 1000)
                }
              }}
            >
              {({ show }) => (
                <button
                  onClick={show}
                  disabled={!sendAmount || isLoading || isDaimoLoading || !phoneNumber || phoneNumber.replace(/\D/g, '').length !== 8}
                  className="w-full bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:hover:bg-blue-500 text-white font-medium py-3 rounded-xl transition-colors"
                >
                  Enviar
                </button>
              )}
            </DaimoPayButton.Custom>
            {payId && (
              <div className="text-xs mt-2 text-center">
                {txHash ? (
                  <a
                    href={`https://optimistic.etherscan.io/tx/${txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-gray-300 inline-flex items-center gap-1"
                  >
                    # Orden: 88888888-{payId} ↗
                  </a>
                ) : (
                  <span className="text-gray-500">
                    # Orden: 88888888-{payId}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Pending Tasks Section */}
        <div className="mt-12 bg-[#2C2C2C] rounded-2xl p-6 border border-gray-800">
          <h2 className="text-xl text-white font-medium mb-4">Pendientes</h2>
          <ul className="space-y-2 text-gray-400">
            <li className="flex items-start gap-2">
              <span className="text-blue-500">•</span>
              Poner límite de 100,000 diarios con barra visible
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500">•</span>
              Hacer explícito el tipo de cambio y fees
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500">•</span>
              Explicar que se puede pagar con cualquier crypto EVM/SVM
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500">•</span>
              Crear servidor de automatizar SMS y payments
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500">•</span>
              Validación más robusta de número SINPE
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500">•</span>
              Agregar el número SINPE al confirmation box
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500">•</span>
              Automatizar OTC en el backend
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
} 