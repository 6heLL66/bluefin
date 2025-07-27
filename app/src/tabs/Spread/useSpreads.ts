import { useEffect, useRef, useState } from 'react'

import { SpreadData } from './constants'
import { useSpreadStore } from './store'

interface BookTicker {
  symbol: string
  bidPrice: string
  bidQty: string
  askPrice: string
  askQty: string
}

export const useSpreads = () => {
  const { spreads } = useSpreadStore()

  const [book, setBook] = useState<Record<string, BookTicker>>({})

  const backpackWebsocket = useRef<WebSocket | null>(null)

  const connectBackpackWebsocket = () => {
    backpackWebsocket.current = new WebSocket('wss://ws.backpack.exchange')

    backpackWebsocket.current.onopen = () => {
      console.log('WebSocket connected to Backpack Exchange')

      spreads.forEach(spread => {
        addSpreadSubscription(spread)
      })
    }

    backpackWebsocket.current.onmessage = event => {
      const { data, stream } = JSON.parse(event.data)
      
      if (stream && stream.includes('bookTicker')) {
        const symbol = data.s.split('_')[0]
        setBook(prev => ({
          ...prev,
          [symbol]: {
            symbol,
            bidPrice: data.b,
            bidQty: data.B,
            askPrice: data.a,
            askQty: data.A,
          },
        }))
      }
    }
  }

  const addSpreadSubscription = (spread: SpreadData) => {
    const subscribeMessage = {
      method: 'SUBSCRIBE',
      params: [`bookTicker.${spread.asset.toUpperCase()}_USDC_PERP`],
      id: Date.now(),
    }

    backpackWebsocket.current?.send(JSON.stringify(subscribeMessage))
  }

  const init = () => {
    connectBackpackWebsocket()
  }

  useEffect(() => {
    init()

    if (backpackWebsocket.current) {
      backpackWebsocket.current.onclose = () => {
        console.log('WebSocket reconnect')
        connectBackpackWebsocket()
      }
    }

    return () => {
      cleanup()
    }
  }, [])

  useEffect(() => {
    console.log(book)
  }, [book])

  const cleanup = () => {
    if (backpackWebsocket.current) {
      backpackWebsocket.current.close()
      backpackWebsocket.current = null
    }
  }

  return {
    init,
    cleanup,
    addSpreadSubscription,
  }
}
