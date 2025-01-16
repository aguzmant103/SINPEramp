import { useState, useEffect } from 'react'

// Mock exchange rate API call
const fetchExchangeRate = async (): Promise<number> => {
  // In a real application, you would fetch the actual exchange rate from an API
  await new Promise(resolve => setTimeout(resolve, 500)) // Simulate API delay
  return 497 // 1 USD = 497 CRC (example rate) // TODO: Change to actual rate with API call
}

export const useCurrencyConversion = (usdcAmount: string) => {
  const [crcAmount, setCrcAmount] = useState<string>('')
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const convertCurrency = async () => {
      if (usdcAmount && !isNaN(Number(usdcAmount))) {
        setIsLoading(true)
        setError(null)
        try {
          const rate = await fetchExchangeRate()
          const convertedAmount = (Number(usdcAmount) * rate).toFixed(2)
          setCrcAmount(convertedAmount)
        } catch {
          setError('Failed to fetch exchange rate')
          setCrcAmount('')
        } finally {
          setIsLoading(false)
        }
      } else {
        setCrcAmount('')
      }
    }

    convertCurrency()
  }, [usdcAmount])

  return { crcAmount, isLoading, error }
}

