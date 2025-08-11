import { useEffect, useRef, useState } from 'react'

import { OrderService as OrderServiceApi, ORDER_SIDE, AccountService } from '../../api'
import {
  FuturesService,
  OrderService,
  OrderType,
  OrderTypeEnum,
  Side,
} from '../../bp-api'
import { getSignature } from '../../bp-api/getSignature'
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
  const {
    spreads,
    lighterMarkets,
    backpackMarkets,
    backpackApiPublicKey,
    backpackApiSecretKey,
    lighterPrivateKey,
    setSpreadPositions,
    updateSpreadStatus,
  } = useSpreadStore()

  const [backpackBook, setBackpackBook] = useState<Record<string, BookTicker>>(
    {},
  )
  const [lighterBook, setLighterBook] = useState<Record<string, BookTicker>>({})

  const backpackWebsocket = useRef<WebSocket | null>(null)
  const lighterWebsocket = useRef<WebSocket | null>(null)

  const openedOrders = useRef<Record<string, OrderType & { price: string }>>({})
  const openedOrdersReduceOnly = useRef<Record<string, OrderType>>({})

  const testLighter = () => {
    for (let i = 0; i < 10; i++) {
      OrderServiceApi.accountOrderApiAccountOrdersPost({
        requestBody: {
          unit: {
            side: ORDER_SIDE.BUY,
            token_id: 0,
            size: '5',
          },
          token: lighterMarkets.find((token) => token.market_id === 0)!,
          account: {
            account: {
              private_key: lighterPrivateKey,
            },
          },
        },
      })
    }
  }

  const connectLighterWebsocket = () => {
    try {
      lighterWebsocket.current = new WebSocket(
        import.meta.env.VITE_WEBSOCKET_URL,
      )

      lighterWebsocket.current.onopen = () => {
        console.log('WebSocket connected to Lighter Exchange')

        spreads.forEach(spread => {
          addLighterSpreadSubscription(spread)
        })
      }

      lighterWebsocket.current.onmessage = event => {
        const { token_id, ask, bid } = JSON.parse(event.data)

        if (token_id) {
          const symbol =
            lighterMarkets.find(token => token.market_id === +token_id)
              ?.symbol ?? ''
          setLighterBook(prev => ({
            ...prev,
            [symbol]: {
              symbol,
              bidPrice: bid?.price ?? prev[symbol]?.bidPrice ?? 0,
              bidQty: bid?.size ?? prev[symbol]?.bidQty ?? 0,
              askPrice: ask?.price ?? prev[symbol]?.askPrice ?? 0,
              askQty: ask?.size ?? prev[symbol]?.askQty ?? 0,
            },
          }))
        }
      }
    } catch (error) {
      console.error('Error connecting to Lighter Exchange:', error)
      setTimeout(connectLighterWebsocket, 2000)
    }
  }

  const openBackpackLimitOrder = async (
    spread: SpreadData,
    price: string,
    quantity: string,
    side: Side,
    reduceOnly: boolean = false,
  ) => {
    const market = backpackMarkets.find(token => token.baseSymbol === spread.asset)

    const stepSize = Number(market?.filters.quantity.stepSize ?? 0)

    const lowerPrice =
    reduceOnly ? Number(price) : side === Side.ASK ? Number(price) + (stepSize * 4) : Number(price) - (stepSize * 4)

    const isConnected = lighterWebsocket.current?.readyState === WebSocket.OPEN

    if (!isConnected) {
      connectLighterWebsocket()
      delete openedOrders.current[spread.id]
      delete openedOrdersReduceOnly.current[spread.id]
      updateSpreadStatus(spread.id, 'WAITING')
      return
    }

    const order = {
      orderType: OrderTypeEnum.LIMIT,
      price: lowerPrice.toFixed(market?.filters.price.tickSize.split('.')[1].length ?? 2),
      quantity: (Number(quantity) / Number(lowerPrice)).toFixed(
        market?.filters.quantity.stepSize.split('.')[1].length ?? 2,
      ),
      side: side,
      symbol: spread.asset.toUpperCase() + '_USDC_PERP',
    }
    const dateNow = Date.now()
    const resultOrder = await OrderService.executeOrder({
      xApiKey: backpackApiPublicKey,
      xSignature: await getSignature(
        'orderExecute',
        backpackApiSecretKey,
        dateNow.toString(),
        order,
      ),
      xTimestamp: dateNow,
      xWindow: 60000,
      requestBody: {
        ...order,
      },
    })

    if (reduceOnly) {
      openedOrdersReduceOnly.current[spread.id] = { ...resultOrder }
      updateSpreadStatus(spread.id, 'ORDER FILLING')
    } else {
      openedOrders.current[spread.id] = {
        ...resultOrder,
        price: lowerPrice.toString(),
      }
      updateSpreadStatus(spread.id, 'ORDER FILLING')
    }

    return
  }

  const closingOrders = useRef<Record<string, boolean>>({})

  const closeBackpackOrder = async (
    spread: SpreadData,
    order: OrderType,
    reduceOnly: boolean = false,
  ) => {
    if (closingOrders.current[spread.id]) return

    try {
      closingOrders.current[spread.id] = true

      const dateNow = Date.now()
      await OrderService.cancelOrder({
        xApiKey: backpackApiPublicKey,
        xSignature: await getSignature(
          'orderCancel',
          backpackApiSecretKey,
          dateNow.toString(),
          {
            orderId: order.id,
            symbol: order.symbol,
          },
        ),
        xTimestamp: dateNow,
        xWindow: 60000,
        requestBody: {
          orderId: order.id,
          symbol: order.symbol,
        },
      })

      if (reduceOnly) {
        delete openedOrdersReduceOnly.current[spread.id]
      } else {
        delete openedOrders.current[spread.id]
      }

      updateSpreadStatus(spread.id, 'WAITING')
    } catch (error) {
      await fetchPositions()
      if (reduceOnly) {
        delete openedOrdersReduceOnly.current[spread.id]
      } else {
        delete openedOrders.current[spread.id]
      }

      updateSpreadStatus(spread.id, 'WAITING')
    } finally {
      closingOrders.current[spread.id] = false
    }
    return
  }

  const connectBackpackWebsocket = () => {
    try {
      backpackWebsocket.current = new WebSocket('wss://ws.backpack.exchange')

      backpackWebsocket.current.onopen = () => {
        console.log('WebSocket connected to Backpack Exchange')

        spreads.forEach(spread => {
          addBackpackSpreadSubscription(spread)
        })
      }

      backpackWebsocket.current.onmessage = async event => {
        const { data, stream } = JSON.parse(event.data)

        if (stream && stream.includes('orderUpdate')) {
          const { e, l, S, s, L, X } = data

          if (e === 'orderFill') {
            const spread = spreads.find(
              spread => spread.asset === s.split('_')[0],
            )
            console.log('orderFill', spread)
            if (!spread) return

            const token = lighterMarkets.find(token => token.symbol === s.split('_')[0])!

            await OrderServiceApi.accountOrderApiAccountOrdersPost({
              requestBody: {
                unit: {
                  side: S === 'Bid' ? ORDER_SIDE.SELL : ORDER_SIDE.BUY,
                  token_id: token?.market_id ?? 0,
                  size: l * L,
                  reduce_only: !!openedOrdersReduceOnly.current[spread.id]
                },
                token: {...token, price: L},
                account: {
                  account: {
                    private_key: lighterPrivateKey,
                  },
                },
              },
            })
            console.log('orderFill', L, l)
            if (X === 'Filled') {
              
              await fetchPositions()
              delete openedOrders.current[spread.id]
              delete openedOrdersReduceOnly.current[spread.id]
              updateSpreadStatus(spread.id, 'WAITING')
            }
          }
        }

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
    } catch (error) {
      console.error('Error connecting to Backpack Exchange:', error)
      setTimeout(connectBackpackWebsocket, 2000)
    }
  }

  const addBackpackSpreadSubscription = async (spread: SpreadData) => {
    const backpackSubscribeMessage = {
      method: 'SUBSCRIBE',
      params: [`bookTicker.${spread.asset.toUpperCase()}_USDC_PERP`],
      id: Date.now(),
    }

    backpackWebsocket.current?.send(JSON.stringify(backpackSubscribeMessage))

    const dateNow = Date.now()

    const subscribeSignature = await getSignature(
      'subscribe',
      backpackApiSecretKey,
      dateNow.toString(),
      {},
    )

    const subscribeMessage = {
      method: 'SUBSCRIBE',
      params: [`account.orderUpdate.${spread.asset.toUpperCase()}_USDC_PERP`],
      signature: [
        backpackApiPublicKey,
        subscribeSignature,
        dateNow.toString(),
        '60000',
      ],
    }

    backpackWebsocket.current?.send(JSON.stringify(subscribeMessage))
  }

  const addLighterSpreadSubscription = (spread: SpreadData) => {
    const lighterSubscribeMessage = {
      token_ids: [spread.tokenId],
    }

    lighterWebsocket.current?.send(JSON.stringify(lighterSubscribeMessage))
  }

  const fetchPositions = async () => {
    if (spreads.length === 0) return

    const lighterPositions =
      await AccountService.accountPositionsApiAccountPositionsPost({
        requestBody: {
          account: {
            private_key: lighterPrivateKey,
          },
        },
      })

    const dateNow = Date.now()
    const signature = await getSignature(
      'positionQuery',
      backpackApiSecretKey,
      dateNow.toString(),
      {},
    )

    const backpackPositions = await FuturesService.getPositions({
      xApiKey: backpackApiPublicKey,
      xSignature: signature,
      xTimestamp: dateNow,
      xWindow: 60000,
    })

    spreads.forEach(async spread => {
      setSpreadPositions(
        spread.id,
        lighterPositions.positions.filter(pos => pos.symbol === spread.asset),
        backpackPositions.filter(
          pos => pos.symbol === spread.asset + '_USDC_PERP',
        ),
      )
    })

    await new Promise(resolve => setTimeout(resolve, 200))
  }

  const interval = useRef<NodeJS.Timeout | null>(null)

  const [isLighterConnected, setIsLighterConnected] = useState(false)
  const [isBackpackConnected, setIsBackpackConnected] = useState(false)

  const init = () => {
    connectBackpackWebsocket()
    connectLighterWebsocket()

    interval.current = setInterval(() => {
      if (backpackWebsocket.current?.readyState !== WebSocket.OPEN) {
        connectBackpackWebsocket()
        setIsBackpackConnected(false)
      } else if (backpackWebsocket.current?.readyState === WebSocket.OPEN) {
        setIsBackpackConnected(true)
      }
      if (lighterWebsocket.current?.readyState !== WebSocket.OPEN) {
        connectLighterWebsocket()
        setIsLighterConnected(false)
      } else if (lighterWebsocket.current?.readyState === WebSocket.OPEN) {
        setIsLighterConnected(true)
      }
    }, 5000)
  }

  useEffect(() => {
    if (backpackWebsocket.current?.readyState !== WebSocket.OPEN || lighterWebsocket.current?.readyState !== WebSocket.OPEN) return
    spreads.forEach(spread => {
      const backpackBidPrice =
        backpackBook[spread.asset.toUpperCase()]?.bidPrice
      const lighterBidPrice = lighterBook[spread.asset.toUpperCase()]?.bidPrice
      const backpackAskPrice =
        backpackBook[spread.asset.toUpperCase()]?.askPrice
      const lighterAskPrice = lighterBook[spread.asset.toUpperCase()]?.askPrice
      const lighterAskQty = lighterBook[spread.asset.toUpperCase()]?.askQty
      const lighterBidQty = lighterBook[spread.asset.toUpperCase()]?.bidQty

      const positionsSize = Math.max(Math.abs(Number(spread.backpackPositions[0]?.netCost ?? 0)), Number(spread.lighterPositions[0]?.size ?? 0))
      const isSpreadFulfilled =
        spread.size - positionsSize < spread.size * 0.01 ||
        spread.size - positionsSize < 15

      if (
        !openedOrders.current[spread.id] &&
        spread.lighterPositions?.some(pos => pos.symbol === spread.asset) &&
        spread.backpackPositions?.some(
          pos => pos.symbol === spread.asset + '_USDC_PERP',
        )
      ) {
        const lighterPosition = spread.lighterPositions[0]
        const backpackPosition = spread.backpackPositions[0]

        if (!lighterPosition || !backpackPosition) {
          return
        }
        const isLighterLong = lighterPosition.side === ORDER_SIDE.BUY
        const lighterSpread = isLighterLong
          ? (Number(lighterAskPrice) - Number(lighterPosition.entry_price)) /
            Number(lighterAskPrice)
          : (Number(lighterPosition.entry_price) - Number(lighterBidPrice)) /
            Number(lighterBidPrice)
        const backpackSpread = !isLighterLong
          ? (Number(backpackAskPrice) - Number(backpackPosition.entryPrice)) /
            Number(backpackAskPrice)
          : (Number(backpackPosition.entryPrice) - Number(backpackBidPrice)) /
            Number(backpackBidPrice)

        const size = isLighterLong
          ? Number(lighterBidPrice) * Number(lighterBidQty)
          : Number(lighterAskPrice) * Number(lighterAskQty)

        const summarySpread = (lighterSpread + backpackSpread) * 100

        console.log('summarySpread', summarySpread, lighterSpread, backpackSpread)

        if (
          summarySpread >= spread.closeSpread &&
          !openedOrdersReduceOnly.current[spread.id] &&
          size > 0
        ) {
          openedOrdersReduceOnly.current[spread.id] = {} as OrderType
          openBackpackLimitOrder(
            spread,
            isLighterLong ? backpackBidPrice : backpackAskPrice,
            Math.min(
              size,
              Math.abs(Number(backpackPosition.netCost)),
            ).toString(),
            isLighterLong ? Side.BID : Side.ASK,
            true,
          )
        } else if (
          openedOrdersReduceOnly.current[spread.id] &&
          openedOrdersReduceOnly.current[spread.id].symbol
        ) {
          if (summarySpread < spread.closeSpread / 2) {
            closeBackpackOrder(
              spread,
              openedOrdersReduceOnly.current[spread.id],
              true,
            )
          }
        }
      }

      if (
        backpackBidPrice &&
        lighterBidPrice &&
        backpackAskPrice &&
        lighterAskPrice &&
        !openedOrdersReduceOnly.current[spread.id] &&
        !isSpreadFulfilled
      ) {
        let actualSpread =
          ((Number(backpackAskPrice) - Number(lighterAskPrice)) /
            (Number(lighterAskPrice) + Number(backpackAskPrice) / 2)) *
          100

        const shortBackpack = Number(spread.backpackPositions[0]?.netCost ?? 0) < 0 || actualSpread > 0
        const size = shortBackpack
          ? Number(lighterAskPrice) * Number(lighterAskQty)
          : Number(lighterBidPrice) * Number(lighterBidQty)

        //console.log(actualSpread, backpackAskPrice, lighterAskPrice, spread.asset, 'short_bp')

        if (!shortBackpack) {
          actualSpread =
            ((Number(lighterBidPrice) - Number(backpackBidPrice)) /
              (Number(lighterBidPrice) + Number(backpackBidPrice) / 2)) *
            100

            //console.log(actualSpread, backpackBidPrice, lighterBidPrice, spread.asset, 'long_bp')
        }

        console.log(actualSpread, spread.asset)

        if (
          actualSpread >= spread.openSpread &&
          !openedOrders.current[spread.id] &&
          Math.min(size, spread.size - positionsSize) > 0
        ) {
          openedOrders.current[spread.id] = {} as OrderType & { price: string }
          openBackpackLimitOrder(
            spread,
            shortBackpack ? backpackAskPrice : backpackBidPrice,
            Math.min(size, spread.size - positionsSize).toString(),
            shortBackpack ? Side.ASK : Side.BID,
          )
        } else if (
          openedOrders.current[spread.id] &&
          openedOrders.current[spread.id].symbol
        ) {
          // smth wrong
          const a =
            (Number(lighterAskPrice) -
            Number(openedOrders.current[spread.id].price)) / Number(lighterAskPrice)
          const b =
            (Number(lighterBidPrice) -
            Number(openedOrders.current[spread.id].price)) / Number(lighterBidPrice)
          const allGood =
            openedOrders.current[spread.id].side === Side.BID ? Math.abs(a) > 0 : Math.abs(b) < 0

          if (
            !allGood ||
            openedOrders.current[spread.id].createdAt + 30000 < Date.now()
          ) {
            closeBackpackOrder(spread, openedOrders.current[spread.id])
          }
        }
      }
    })
  }, [backpackBook, lighterBook, spreads])

  useEffect(() => {
    init()
    const interval = setInterval(fetchPositions, 30000)
    fetchPositions()

    if (backpackWebsocket.current) {
      backpackWebsocket.current.onclose = () => {
        console.log('WebSocket reconnect')
        connectBackpackWebsocket()
      }
    }

    return () => {
      cleanup()

      clearInterval(interval)
    }
  }, [])

  const closeAllPositionsMarket = async (spread: SpreadData) => {
    const { lighterPositions, backpackPositions } = spread

    await Promise.all(
      backpackPositions
        .map(async position => {
          const isLong = parseFloat(position.netQuantity) > 0
          const order = {
            orderType: OrderTypeEnum.MARKET,
            quantity: Math.abs(Number(position.netQuantity)).toString(),
            side: isLong ? Side.ASK : Side.BID,
            symbol: spread.asset.toUpperCase() + '_USDC_PERP',
          }
          const dateNow = Date.now()
          return OrderService.executeOrder({
            xApiKey: backpackApiPublicKey,
            xSignature: await getSignature(
              'orderExecute',
              backpackApiSecretKey,
              dateNow.toString(),
              order,
            ),
            xTimestamp: dateNow,
            xWindow: 60000,
            requestBody: order,
          }) as Promise<unknown>
        })
        .concat(
          lighterPositions.map(async position => {
            return OrderServiceApi.accountOrdersCancelApiAccountOrdersCancelPost(
              {
                requestBody: {
                  token_id: position.market_id,
                  account: {
                    account: {
                      private_key: lighterPrivateKey,
                    },
                  },
                },
              },
            )
          }),
        ),
    )

    await fetchPositions()
  }

  const cleanup = () => {
    if (backpackWebsocket.current) {
      backpackWebsocket.current.close()
      backpackWebsocket.current = null
    }

    if (lighterWebsocket.current) {
      lighterWebsocket.current.close()
      lighterWebsocket.current = null
    }

    if (interval.current) {
      clearInterval(interval.current)
      interval.current = null
    }
  }

  return {
    init,
    cleanup,
    addBackpackSpreadSubscription,
    addLighterSpreadSubscription,
    openBackpackLimitOrder,
    closeAllPositionsMarket,
    testLighter,
    isLighterConnected,
    isBackpackConnected,
  }
}
