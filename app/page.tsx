'use client'

import { useState } from 'react'
import { useCurrencyConversion } from '../hooks/useCurrencyConversion'
import { useDebounce } from '../hooks/useDebounce'
import { DollarSign, ArrowDownUp } from 'lucide-react'
import { DaimoPayButton } from '@daimo/pay'

export default function TokenSwapConverter() {
  const [sendAmount, setSendAmount] = useState<string>('')
  const [sinpeNumber, setSinpeNumber] = useState<string>('')
  const [isUSDCtoSend, setIsUSDCtoSend] = useState<boolean>(true)
  const [isDaimoLoading, setIsDaimoLoading] = useState<boolean>(false)
  const debouncedSendAmount = useDebounce(sendAmount, 500)
  const { crcAmount: convertedAmount, isLoading, error } = useCurrencyConversion(debouncedSendAmount)

  const handleSwap = () => {
    setIsUSDCtoSend(!isUSDCtoSend)
    setSendAmount('')
  }

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
    <div className="min-h-screen bg-[#1C1C1C] flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-4">
        <div className="space-y-3">
          {/* Send Token Card */}
          <div className="bg-[#2C2C2C] rounded-2xl p-4 border border-gray-800">
            <div className="flex justify-between items-center mb-2">
              <label htmlFor="sendAmount" className="text-gray-400 text-sm">
                You send
              </label>
              <div className="flex items-center gap-2 bg-[#3C3C3C] px-3 py-1.5 rounded-xl">
                {isUSDCtoSend ? (
                  <>
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                      <DollarSign className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-white font-medium">USDC</span>
                  </>
                ) : (
                  <span className="text-white font-medium">CRC</span>
                )}
              </div>
            </div>
            <input
              id="sendAmount"
              type="number"
              className="w-full bg-transparent text-4xl text-white placeholder-gray-600 outline-none"
              placeholder="0"
              value={sendAmount}
              onChange={(e) => setSendAmount(e.target.value)}
              step="0.01"
              min="0"
            />
            <div className="text-gray-500 text-sm mt-1">
              {formatCurrency(sendAmount, isUSDCtoSend ? 'USD' : 'CRC')}
            </div>
          </div>

          {/* Arrow Divider */}
          <div className="flex justify-center">
            <button
              type="button"
              onClick={handleSwap}
              className="w-8 h-8 bg-[#3C3C3C] rounded-full flex items-center justify-center hover:bg-[#4C4C4C] transition-colors"
            >
              <ArrowDownUp className="w-4 h-4 text-gray-400" />
            </button>
          </div>

          {/* Receive Token Card */}
          <div className="bg-[#2C2C2C] rounded-2xl p-4 border border-gray-800">
            <div className="flex justify-between items-center mb-2">
              <label className="text-gray-400 text-sm">
                You receive
              </label>
              <div className="flex items-center gap-2 bg-[#3C3C3C] px-3 py-1.5 rounded-xl">
                {!isUSDCtoSend ? (
                  <>
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                      <DollarSign className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-white font-medium">USDC</span>
                  </>
                ) : (
                  <span className="text-white font-medium">CRC</span>
                )}
              </div>
            </div>
            <div className="text-4xl text-white font-medium">
              {isLoading ? 
                'Calculating...' : 
                convertedAmount ? 
                  Number(convertedAmount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : 
                  '0.00'
              }
            </div>
            <div className="text-gray-500 text-sm mt-1">
              {formatCurrency(convertedAmount, !isUSDCtoSend ? 'USD' : 'CRC')}
            </div>
          </div>

          {/* SINPE Input */}
          <div className="bg-[#2C2C2C] rounded-2xl p-4 border border-gray-800">
            <label htmlFor="sinpeNumber" className="text-gray-400 text-sm block mb-2">
              SINPE Mobile Number
            </label>
            <input
              id="sinpeNumber"
              type="tel"
              className="w-full bg-transparent text-xl text-white placeholder-gray-600 outline-none"
              placeholder="8888-8888"
              value={sinpeNumber}
              onChange={(e) => setSinpeNumber(e.target.value)}
              pattern="[0-9]{8}"
            />
          </div>

          {error && (
            <div className="text-red-500 text-sm px-4">
              {error}
            </div>
          )}

          {/* DaimoPayButton */}
          <DaimoPayButton
            appId="pay-demo"
            toChain={10}
            toUnits={sendAmount}
            toToken="0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85"
            toAddress="0xf446845fAB5367178a1C9e2ffd8D3b7EE678BAfe"
            disabled={!sendAmount || !sinpeNumber || isLoading || isDaimoLoading}
            onPaymentStarted={() => {
              console.log('Payment started')
              setIsDaimoLoading(true)
            }}
            onPaymentCompleted={() => {
              console.log('Payment completed')
              setIsDaimoLoading(false)
            }}
          />
        </div>
      </div>
    </div>
  )
}

