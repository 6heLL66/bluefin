import { useEffect, useRef, useState } from 'react'

import { SpreadData } from './constants'
import { useSpreadStore } from './store'
import { OrderService, OrderTypeEnum, Side } from '../../bp-api'
import { getSignature } from '../../bp-api/getSignature'

interface BookTicker {
  symbol: string
  bidPrice: string
  bidQty: string
  askPrice: string
  askQty: string
}

export const useSpreads = () => {
  const { spreads, lighterMarkets, backpackApiPublicKey, backpackApiSecretKey } = useSpreadStore()

  const [backpackBook, setBackpackBook] = useState<Record<string, BookTicker>>({})
  const [lighterBook, setLighterBook] = useState<Record<string, BookTicker>>({})

  const backpackWebsocket = useRef<WebSocket | null>(null)
  const lighterWebsocket = useRef<WebSocket | null>(null)

  const connectLighterWebsocket = () => {
    lighterWebsocket.current = new WebSocket(import.meta.env.VITE_WEBSOCKET_URL)

    lighterWebsocket.current.onopen = () => {
      console.log('WebSocket connected to Lighter Exchange')

      spreads.forEach(spread => {
        addLighterSpreadSubscription(spread)
      })
    }

    lighterWebsocket.current.onmessage = event => {
      const { token_id, ask, bid } = JSON.parse(event.data)

      if (token_id) {
        const symbol = lighterMarkets.find(token => token.market_id === +token_id)?.symbol ?? ''
        setLighterBook(prev => ({
          ...prev,
          [symbol]: {
            symbol,
            bidPrice: bid.price,
            bidQty: bid.size,
            askPrice: ask.price,
            askQty: ask.size,
          },
        }))
      }
    }
  }

  const openBackpackLimitOrder = (spread: SpreadData, price: string, quantity: string, side: Side) => {
    const order = {
      orderType: OrderTypeEnum.LIMIT,
      price,
      quantity,
      side,
      symbol: spread.asset.toUpperCase() + '_USDC_PERP',
    }
    return OrderService.executeOrder({
      xApiKey: backpackApiPublicKey,
      xSignature: getSignature('executeOrder', backpackApiSecretKey, Date.now().toString(), order),
      xTimestamp: Date.now(),
      xWindow: 5000,
      requestBody: order,
    })
  }

  const connectBackpackWebsocket = () => {
    backpackWebsocket.current = new WebSocket('wss://ws.backpack.exchange')

    backpackWebsocket.current.onopen = () => {
      console.log('WebSocket connected to Backpack Exchange')

      spreads.forEach(spread => {
        addBackpackSpreadSubscription(spread)
      })
    }

    backpackWebsocket.current.onmessage = event => {
      const { data, stream } = JSON.parse(event.data)
      
      if (stream && stream.includes('bookTicker')) {
        const symbol = data.s.split('_')[0]
        setBackpackBook(prev => ({
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

  const addBackpackSpreadSubscription = (spread: SpreadData) => {
    const backpackSubscribeMessage = {
      method: 'SUBSCRIBE',
      params: [`bookTicker.${spread.asset.toUpperCase()}_USDC_PERP`],
      id: Date.now(),
    }

    backpackWebsocket.current?.send(JSON.stringify(backpackSubscribeMessage))
  }

  const addLighterSpreadSubscription = (spread: SpreadData) => {
    const lighterSubscribeMessage = {
      token_ids: [spread.tokenId],
    }

    lighterWebsocket.current?.send(JSON.stringify(lighterSubscribeMessage))
  }

  const init = () => {
    connectBackpackWebsocket()
    connectLighterWebsocket()
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

  const cleanup = () => {
    if (backpackWebsocket.current) {
      backpackWebsocket.current.close()
      backpackWebsocket.current = null
    }
  }

  return {
    init,
    cleanup,
    addBackpackSpreadSubscription,
    addLighterSpreadSubscription,
    openBackpackLimitOrder,
  }
}
