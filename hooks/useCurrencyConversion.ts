import { useState, useEffect, useCallback } from 'react'

interface ExchangeRateResponse {
  result: string
  time_last_update_utc: string
  conversion_rates: {
    CRC: number
  }
}

const REFRESH_INTERVAL = 30 * 60 * 1000 // 30 minutes
const MAX_RETRIES = 3
const RETRY_DELAY = 5000 // 5 seconds
const RATE_ADJUSTMENT = 10 // Subtract 10 colones from rate

export const useCurrencyConversion = (usdAmount: string) => {
  const [crcAmount, setCrcAmount] = useState<string>('')
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [exchangeRate, setExchangeRate] = useState<number | null>(null)
  const [nextUpdateTime, setNextUpdateTime] = useState<Date | null>(null)

  const fetchExchangeRate = useCallback(async (retryCount = 0) => {
    try {
      setIsLoading(true)
      setError(null)
      
      const response = await fetch(
        `https://v6.exchangerate-api.com/v6/${process.env.NEXT_PUBLIC_EXCHANGE_RATE_API_KEY}/latest/USD`
      )
      
      if (!response.ok) {
        throw new Error('Failed to fetch exchange rate')
      }
      
      const data: ExchangeRateResponse = await response.json()
      if (data.result === 'success') {
        // Apply the rate adjustment
        setExchangeRate(data.conversion_rates.CRC - RATE_ADJUSTMENT)
        setNextUpdateTime(new Date(Date.now() + REFRESH_INTERVAL))
        setError(null)
      } else {
        throw new Error('API returned unsuccessful result')
      }
    } catch (err) {
      console.error('Error fetching exchange rate:', err)
      
      // Implement retry logic
      if (retryCount < MAX_RETRIES) {
        setTimeout(() => {
          fetchExchangeRate(retryCount + 1)
        }, RETRY_DELAY)
      } else {
        setError('Error al obtener el tipo de cambio')
      }
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Initial fetch and refresh setup
  useEffect(() => {
    fetchExchangeRate()

    // Set up periodic refresh
    const interval = setInterval(() => {
      fetchExchangeRate()
    }, REFRESH_INTERVAL)

    return () => clearInterval(interval)
  }, [fetchExchangeRate])

  // Calculate CRC amount whenever USD amount or exchange rate changes
  useEffect(() => {
    if (exchangeRate && usdAmount && !isNaN(Number(usdAmount))) {
      const convertedAmount = (Number(usdAmount) * exchangeRate).toFixed(2)
      setCrcAmount(convertedAmount)
    } else {
      setCrcAmount('')
    }
  }, [usdAmount, exchangeRate])

  return { 
    crcAmount, 
    isLoading, 
    error, 
    exchangeRate,
    nextUpdateTime,
    refreshRate: () => fetchExchangeRate() // Expose manual refresh function
  }
}

