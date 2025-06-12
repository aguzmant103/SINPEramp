'use client'

import { useState } from 'react'
import { useCurrencyConversion } from '@/hooks/useCurrencyConversion'
import { useDebounce } from '@/hooks/useDebounce'
import { ArrowDown } from 'lucide-react'
import { DaimoPayButton } from '@daimo/pay'
import confetti from 'canvas-confetti'

export function TokenSwapForm() {
  const [sendAmount, setSendAmount] = useState<string>('')
  const [isDaimoLoading, setIsDaimoLoading] = useState<boolean>(false)
  const [isSMSSending, setIsSMSSending] = useState<boolean>(false)
  const [smsError, setSmsError] = useState<string>('')
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

  const sendSMS = async () => {
    if (!process.env.NEXT_PUBLIC_SMS_WEBHOOK_URL) {
      console.error('SMS webhook URL not configured');
      setSmsError('Error de configuración del webhook');
      return;
    }

    setIsSMSSending(true);
    setSmsError('');

    // Convert amount to number, round to integer, and ensure it's valid
    const numericAmount = Math.round(parseFloat(convertedAmount));
    if (isNaN(numericAmount)) {
      setSmsError('Error: Monto inválido');
      setIsSMSSending(false);
      return;
    }

    const smsData = {
      phoneNumber: phoneNumber.replace(/\D/g, ''),
      amount: numericAmount // Send as rounded integer
    };

    console.log('Attempting to send SMS with data:', smsData);
    console.log('Webhook URL:', process.env.NEXT_PUBLIC_SMS_WEBHOOK_URL);

    try {
      console.log('Sending POST request...');
      const response = await fetch(process.env.NEXT_PUBLIC_SMS_WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(smsData)
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      const responseText = await response.text();
      console.log('Raw response:', responseText);

      let data;
      try {
        data = JSON.parse(responseText);
        console.log('Parsed response data:', data);
      } catch (e) {
        console.error('Failed to parse response as JSON:', e);
        throw new Error('Invalid response format');
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      console.log('SMS sent successfully:', data);
    } catch (error) {
      console.error('Detailed error sending SMS:', error);
      if (error instanceof Error) {
        setSmsError(`Error: ${error.message}`);
      } else {
        setSmsError('Error desconocido al enviar el SMS');
      }
    } finally {
      setIsSMSSending(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Main Form Section */}
        <div className="space-y-3">
          {/* Send Token Card (USD) */}
          <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
            <div className="flex justify-between items-center mb-2">
              <label htmlFor="sendAmount" className="text-white/80 text-lg">
                Envías
              </label>
              <div className="flex items-center gap-2 bg-[#2a1457] px-3 py-1 rounded-full text-white/80 text-sm">
                <span className="text-blue-400">$</span> All
              </div>
            </div>
            <input
              id="sendAmount"
              type="text"
              inputMode="numeric"
              className="w-full bg-transparent text-4xl text-white placeholder-white/30 outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
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
            <div className="text-white/40 text-sm mt-1">
              {formatCurrency(sendAmount, 'USD')}
            </div>
          </div>

          {/* Arrow Divider */}
          <div className="flex justify-center">
            <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center">
              <ArrowDown className="w-4 h-4 text-white/60" />
            </div>
          </div>

          {/* Receive Token Card (CRC) */}
          <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
            <div className="flex justify-between items-center mb-2">
              <label className="text-white/80 text-lg">
                Recibes
              </label>
              <div className="flex items-center gap-2 bg-[#2a1457] px-3 py-1 rounded-full text-white/80 text-sm">
                CRC
              </div>
            </div>
            <div className="text-4xl text-white font-bold">
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
            <div className="flex justify-between text-white/40 text-sm mt-1">
              <span>CRC {formatCurrency(convertedAmount || '0', 'CRC')}</span>
              <span>1 USD = {exchangeRate?.toLocaleString('es-CR', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              })} CRC</span>
            </div>
          </div>

          {/* Phone Number Card */}
          <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
            <label htmlFor="phoneNumber" className="text-white/80 text-lg mb-2 block">
              Número SINPE Móvil
            </label>
            <div className="flex items-center gap-2">
              <div className="bg-[#2a1457] px-3 py-2 rounded-lg text-white/60">+506</div>
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
                className="w-full bg-transparent text-2xl text-white placeholder-white/30 outline-none"
              />
            </div>
          </div>

          {error && (
            <div className="text-red-500 text-sm px-4">
              {error === 'Failed to fetch exchange rate' ? 'Error al obtener el tipo de cambio' : error}
            </div>
          )}

          {/* DaimoPayButton */}
          <div className="bg-white/0 rounded-2xl p-0 border-0">
            <DaimoPayButton.Custom
              appId="pay-demo"
              toChain={10}
              toUnits={sendAmount}
              toToken="0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85"
              toAddress="0xf446845fAB5367178a1C9e2ffd8D3b7EE678BAfe"
              intent={`SINPE_${phoneNumber.replace(/\D/g, '')}`}
              closeOnSuccess={true}
              onPaymentStarted={(e) => {
                console.log('Payment started:', e);
                setPayId(e.paymentId);
                setIsDaimoLoading(true);
              }}
              onPaymentCompleted={(e) => {
                console.log('Payment completed:', e);
                setTxHash(e.txHash);
                setIsDaimoLoading(false);
                sendSMS().catch(error => {
                  console.error('Failed to send SMS after payment:', error);
                });
                setTimeout(triggerConfetti, 1000);
              }}
            >
              {({ show }) => (
                <button
                  onClick={show}
                  disabled={!sendAmount || isLoading || isDaimoLoading || !phoneNumber || phoneNumber.replace(/\D/g, '').length !== 8}
                  className="w-full bg-pink-500 hover:bg-pink-400 text-white text-lg rounded-2xl py-6 mb-6 disabled:opacity-50 transition-colors disabled:hover:bg-blue-50"
                >
                  Enviar
                </button>
              )}
            </DaimoPayButton.Custom>
            {payId && (
              <div className="space-y-2 text-xs mt-2 text-center">
                {txHash ? (
                  <>
                    <a
                      href={`https://optimistic.etherscan.io/tx/${txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-gray-300 inline-flex items-center gap-1"
                    >
                      # Orden: {phoneNumber.replace(/\D/g, '')}-{payId} ↗
                    </a>
                    {isSMSSending && (
                      <div className="text-blue-400">
                        Enviando SMS...
                      </div>
                    )}
                    {smsError && (
                      <div className="text-red-400">
                        {smsError}
                      </div>
                    )}
                  </>
                ) : (
                  <span className="text-gray-500">
                    # Orden: {phoneNumber.replace(/\D/g, '')}-{payId}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-12 bg-[#2C2C2C] rounded-2xl p-6 border border-gray-800">
          <h2 className="text-xl text-white font-medium mb-4">Información Importante</h2>
          <ul className="space-y-4 text-gray-400">
            <li className="flex items-start gap-3">
              <span className="text-blue-500 text-lg">•</span>
              <div>
                <p className="text-gray-300 font-medium mb-1">Tipo de Cambio</p>
                <p className="text-sm leading-relaxed">
                  Utilizamos el promedio entre compra y venta del Banco Central de Costa Rica (BCCR), 
                  más una comisión de ₡10 por dólar para cubrir costos operativos.
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-blue-500 text-lg">•</span>
              <div>
                <p className="text-gray-300 font-medium mb-1">Múltiples Métodos de Pago</p>
                <p className="text-sm leading-relaxed">
                  Aceptamos pagos desde casi cualquier wallet y red blockchain, incluyendo 
                  Ethereum, Solana, Base, Optimism y más. Compatible con Phantom, MetaMask, 
                  Rabby, Brave Wallet, Argent, entre otros.
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-blue-500 text-lg">•</span>
              <div>
                <p className="text-gray-300 font-medium mb-1">Límite de Transacciones</p>
                <p className="text-sm leading-relaxed">
                  Durante nuestra fase Alpha de pruebas, hemos establecido un límite diario 
                  de ₡100,000 por usuario para garantizar la seguridad y estabilidad del servicio.
                </p>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
} 