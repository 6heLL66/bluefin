import { useEffect, useRef, useState } from 'react'

import { OrderService as OrderServiceApi, ORDER_SIDE, AccountService } from '../../api'
import {
  FuturesService,
  OrderService,
  OrderType,
  OrderTypeEnum,
  Side,
  CapitalService,
  AccountService as BpAccountService,
} from '../../bp-api'
import { getSignature } from '../../bp-api/getSignature'
import { SpreadData } from './constants'
import { useSpreadStore } from './store'
import { useLogger } from '../../hooks/useLogger'

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
  
  const logger = useLogger()

  const [backpackBook, setBackpackBook] = useState<Record<string, BookTicker>>(
    {},
  )
  const [lighterBook, setLighterBook] = useState<Record<string, BookTicker>>({})

  const backpackWebsocket = useRef<WebSocket | null>(null)
  const lighterWebsocket = useRef<WebSocket | null>(null)

  const openedOrders = useRef<Record<string, OrderType & { price: string }>>({})
  const openedOrdersReduceOnly = useRef<Record<string, OrderType>>({})

  const spreadsRef = useRef<SpreadData[]>([])

  useEffect(() => {
    spreadsRef.current = spreads
  }, [spreads])

  const testLighter = async () => {
    logger.info('Начало тестирования Lighter API', { 
      totalRequests: 10,
      tokenId: 24,
      size: '5'
    })
    
    try {
      const requests = []
      for (let i = 0; i < 10; i++) {
        requests.push(OrderServiceApi.accountOrderApiAccountOrdersPost({
          requestBody: {
            unit: {
              side: ORDER_SIDE.BUY,
              token_id: 24,
              size: '5',
            },
            token: lighterMarkets.find((token) => token.market_id === 24)!,
            account: {
              account: {
                private_key: lighterPrivateKey,
              },
            },
          },
        }))
      }

      await Promise.all(requests)
      logger.success('Тестовые ордера Lighter созданы', { 
        totalCreated: 10,
        tokenId: 24
      })
      
      await OrderServiceApi.accountOrdersCancelApiAccountOrdersCancelPost({
        requestBody: {
          account: {
            account: {
              private_key: lighterPrivateKey,
            },
          },
          token_id: 24,
        },
      })
      
      logger.success('Тестовые ордера Lighter отменены', { tokenId: 24 })
    } catch (error) {
      logger.error('Ошибка при тестировании Lighter API', { 
        error: String(error),
        tokenId: 24
      })
      throw error
    }
  }

  const connectLighterWebsocket = () => {
    try {
      if (lighterWebsocket.current) {
        lighterWebsocket.current.close()
        lighterWebsocket.current = null
        logger.websocket('Lighter WebSocket закрыт для переподключения')
      }

      lighterWebsocket.current = new WebSocket(
        import.meta.env.VITE_WEBSOCKET_URL,
      )

      lighterWebsocket.current.onopen = () => {
        logger.websocket('WebSocket подключен к Lighter Exchange', { url: import.meta.env.VITE_WEBSOCKET_URL })
        addLighterSpreadSubscription(spreadsRef.current)
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
              bidPrice: bid?.price && +bid?.size > 0 ? bid.price : prev[symbol]?.bidPrice,
              bidQty: bid?.size && +bid?.size > 0 ? bid.size : prev[symbol]?.bidQty,
              askPrice: ask?.price && +ask?.size > 0 ? ask.price : prev[symbol]?.askPrice,
              askQty: ask?.size && +ask?.size > 0 ? ask.size : prev[symbol]?.askQty,
            },
          }))
        }
      }

      lighterWebsocket.current.onerror = (error) => {
        logger.error('Ошибка WebSocket Lighter', { error: String(error) })
      }

      lighterWebsocket.current.onclose = () => {
        logger.warning('WebSocket Lighter закрыт')
      }
    } catch (error) {
      logger.error('Ошибка подключения к Lighter Exchange', { error: String(error) })
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
    reduceOnly ? Number(price) : side === Side.ASK ? Number(price) + (stepSize * 8) : Number(price) - (stepSize * 8)

    const isConnected = lighterWebsocket.current?.readyState === WebSocket.OPEN

    if (!isConnected) {
      logger.warning('WebSocket не подключен, переподключение...', { spreadId: spread.id, asset: spread.asset })
      connectLighterWebsocket()
      delete openedOrders.current[spread.id]
      delete openedOrdersReduceOnly.current[spread.id]
      updateSpreadStatus(spread.id, 'WAITING')
      return
    }

    const reduceOnlyQuantity = (Math.min(Number(quantity) * 1.025 / Number(lowerPrice), Math.abs(+spread.backpackPositions[0]?.netQuantity)))

    logger.order('Открытие ордера Backpack', {
      spreadId: spread.id,
      asset: spread.asset,
      price: lowerPrice,
      quantity: reduceOnly ? reduceOnlyQuantity : Number(quantity) / Number(lowerPrice),
      side,
      reduceOnly,
      stepSize,
      originalPrice: price,
      originalQuantity: quantity
    })

    const order = {
      orderType: OrderTypeEnum.LIMIT,
      postOnly: true,
      price: lowerPrice.toFixed(market?.filters.price.tickSize.split('.')[1].length ?? 2),
      quantity: (reduceOnly ? reduceOnlyQuantity : Number(quantity) / Number(lowerPrice)).toFixed(
        market?.filters.quantity.stepSize.split('.')[1].length ?? 2,
      ),
      reduceOnly,
      side: side,
      symbol: spread.asset.toUpperCase() + '_USDC_PERP',
    }
    
    try {
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
        requestBody: order,
      })

      logger.success('Ордер Backpack успешно создан', {
        spreadId: spread.id,
        asset: spread.asset,
        orderId: resultOrder.id,
        order: resultOrder,
        calculatedPrice: lowerPrice,
        calculatedQuantity: order.quantity
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
    } catch (error) {
      logger.error('Ошибка создания ордера Backpack', {
        spreadId: spread.id,
        asset: spread.asset,
        error: String(error),
        order
      })
      if (reduceOnly) {
        delete openedOrdersReduceOnly.current[spread.id]
      } else {
        delete openedOrders.current[spread.id]
      }
      updateSpreadStatus(spread.id, 'WAITING')
      throw error
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

    logger.order('Закрытие ордера Backpack', {
      spreadId: spread.id,
      asset: spread.asset,
      orderId: order.id,
      symbol: order.symbol,
      reduceOnly
    })

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

      logger.success('Ордер Backpack успешно закрыт', {
        spreadId: spread.id,
        asset: spread.asset,
        orderId: order.id,
        symbol: order.symbol,
        reduceOnly
      })

      if (reduceOnly) {
        delete openedOrdersReduceOnly.current[spread.id]
      } else {
        delete openedOrders.current[spread.id]
      }

      updateSpreadStatus(spread.id, 'WAITING')
    } catch (error) {
      logger.error('Ошибка закрытия ордера Backpack', {
        spreadId: spread.id,
        asset: spread.asset,
        orderId: order.id,
        error: String(error)
      })
      
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
      if (backpackWebsocket.current) {
        backpackWebsocket.current.close()
        backpackWebsocket.current = null
        logger.websocket('Backpack WebSocket закрыт для переподключения')
      }

      backpackWebsocket.current = new WebSocket('wss://ws.backpack.exchange')

      backpackWebsocket.current.onopen = () => {
        logger.websocket('WebSocket подключен к Backpack Exchange', { url: 'wss://ws.backpack.exchange' })
        addBackpackSpreadSubscription(spreadsRef.current)
      }

      backpackWebsocket.current.onmessage = async event => {
        const { data, stream } = JSON.parse(event.data)

        if (stream && stream.includes('orderUpdate')) {
          const { e, l, S, s, L, X } = data

          if (e === 'orderFill') {
            const spread = spreadsRef.current.find(
              spread => spread.asset === s.split('_')[0],
            )
            
            logger.order('Получено уведомление о заполнении ордера', {
              event: e,
              symbol: s,
              side: S,
              price: L,
              quantity: l,
              status: X,
              spreadId: spread?.id,
              asset: spread?.asset
            })
            
            if (!spread) return

            const token = lighterMarkets.find(token => token.symbol === s.split('_')[0])!
            const isReduceOnly = !!openedOrdersReduceOnly.current[spread.id]

            let reduceOnlyQuantity = (Math.min(l, Math.abs(+spread.lighterPositions[0]?.position)))

            if (spread.lighterPositions[0] && +spread.lighterPositions[0].position - l < (1 / 10 ** (token.size_decimals * 4))) {
              reduceOnlyQuantity = Number(spread.lighterPositions[0].position)
            }

            if (isReduceOnly && spread.lighterPositions[0]?.position) {
              spread.lighterPositions[0].position = (Number(spread.lighterPositions[0].position) - reduceOnlyQuantity).toString()
            }

            logger.order('Создание ордера Lighter в ответ на заполнение Backpack', {
              spreadId: spread.id,
              asset: spread.asset,
              side: S === 'Bid' ? ORDER_SIDE.SELL : ORDER_SIDE.BUY,
              tokenId: token?.market_id,
              size: isReduceOnly ? reduceOnlyQuantity * L : l * L,
              reduceOnly: isReduceOnly,
              price: L
            })

            await OrderServiceApi.accountOrderApiAccountOrdersPost({
              requestBody: {
                unit: {
                  side: S === 'Bid' ? ORDER_SIDE.SELL : ORDER_SIDE.BUY,
                  token_id: token?.market_id ?? 0,
                  size: isReduceOnly ? reduceOnlyQuantity * L : l * L,
                  reduce_only: isReduceOnly
                },
                token: {...token, price: L},
                account: {
                  account: {
                    private_key: lighterPrivateKey,
                  },
                },
              },
            })
            
            if (X === 'Filled') {
              logger.success('Ордер Backpack полностью заполнен', {
                spreadId: spread.id,
                asset: spread.asset,
                symbol: s,
                price: L,
                quantity: l
              })
              
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

      backpackWebsocket.current.onerror = (error) => {
        logger.error('Ошибка WebSocket Backpack', { error: String(error) })
      }

      backpackWebsocket.current.onclose = () => {
        logger.warning('WebSocket Backpack закрыт')
      }
    } catch (error) {
      logger.error('Ошибка подключения к Backpack Exchange', { error: String(error) })
      setTimeout(connectBackpackWebsocket, 2000)
    }
  }

  const addBackpackSpreadSubscription = async (spreads: SpreadData[]) => {
    if (spreads.length === 0) return
    
    logger.websocket('Подписка на спреды Backpack', {
      totalSpreads: spreads.length,
      spreads: spreads.map(s => ({ id: s.id, asset: s.asset }))
    })
    
    const backpackSubscribeMessage = {
      method: 'SUBSCRIBE',
      params: spreads.map(spread => `bookTicker.${spread.asset.toUpperCase()}_USDC_PERP`),
      id: Date.now(),
    }

    backpackWebsocket.current?.send(JSON.stringify(backpackSubscribeMessage))
    logger.websocket('Отправлена подписка на bookTicker', { message: backpackSubscribeMessage })

    const dateNow = Date.now()

    const subscribeSignature = await getSignature(
      'subscribe',
      backpackApiSecretKey,
      dateNow.toString(),
      {},
    )

    const subscribeMessage = {
      method: 'SUBSCRIBE',
      params: spreads.map(spread => `account.orderUpdate.${spread.asset.toUpperCase()}_USDC_PERP`),
      signature: [
        backpackApiPublicKey,
        subscribeSignature,
        dateNow.toString(),
        '60000',
      ],
    }

    backpackWebsocket.current?.send(JSON.stringify(subscribeMessage))
    logger.websocket('Отправлена подписка на orderUpdate', { message: subscribeMessage })
  }

  const addLighterSpreadSubscription = (spreads: SpreadData[]) => {
    if (spreads.length === 0) return

    logger.websocket('Подписка на спреды Lighter', {
      totalSpreads: spreads.length,
      spreads: spreads.map(s => ({ id: s.id, asset: s.asset, tokenId: s.tokenId }))
    })

    const lighterSubscribeMessage = {
      token_ids: spreads.map(spread => spread.tokenId),
    }

    lighterWebsocket.current?.send(JSON.stringify(lighterSubscribeMessage))
    logger.websocket('Отправлена подписка на Lighter', { message: lighterSubscribeMessage })
  }

  const fetchPositions = async () => {
    if (spreads.length === 0) return

    logger.position('Начало получения позиций', { totalSpreads: spreads.length })

    try {
      const lighterPositions =
        await AccountService.accountPositionsApiAccountPositionsPost({
          requestBody: {
            account: {
              private_key: lighterPrivateKey,
            },
          },
        })

      logger.position('Позиции Lighter получены', { 
        totalPositions: lighterPositions.positions.length,
        positions: lighterPositions.positions.map(p => ({ symbol: p.symbol, size: p.size }))
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

      logger.position('Позиции Backpack получены', { 
        totalPositions: backpackPositions.length,
        positions: backpackPositions.map(p => ({ symbol: p.symbol, netQuantity: p.netQuantity }))
      })

      spreads.forEach(async spread => {
        const lighterPos = lighterPositions.positions.filter(pos => pos.symbol === spread.asset)
        const backpackPos = backpackPositions.filter(
          pos => pos.symbol === spread.asset + '_USDC_PERP',
        )
        
        logger.position('Обновление позиций для спреда', {
          spreadId: spread.id,
          asset: spread.asset,
          lighterPositions: lighterPos.length,
          backpackPositions: backpackPos.length
        })
        
        setSpreadPositions(spread.id, lighterPos, backpackPos)
      })

      await new Promise(resolve => setTimeout(resolve, 200))
    } catch (error) {
      logger.error('Ошибка получения позиций', { error: String(error) })
    }
  }

  const interval = useRef<NodeJS.Timeout | null>(null)

  const [isLighterConnected, setIsLighterConnected] = useState(false)
  const [isBackpackConnected, setIsBackpackConnected] = useState(false)

  const init = () => {
    logger.info('Инициализация системы спредов', { 
      totalSpreads: spreads.length,
      spreads: spreads.map(s => ({ id: s.id, asset: s.asset }))
    })
    
    connectBackpackWebsocket()
    connectLighterWebsocket()

    interval.current = setInterval(() => {
      if (backpackWebsocket.current?.readyState !== WebSocket.OPEN) {
        logger.warning('Backpack WebSocket не подключен, переподключение...')
        connectBackpackWebsocket()
        setIsBackpackConnected(false)
      } else if (backpackWebsocket.current?.readyState === WebSocket.OPEN) {
        setIsBackpackConnected(true)
      }
      if (lighterWebsocket.current?.readyState !== WebSocket.OPEN) {
        logger.warning('Lighter WebSocket не подключен, переподключение...')
        connectLighterWebsocket()
        setIsLighterConnected(false)
      } else if (lighterWebsocket.current?.readyState === WebSocket.OPEN) {
        setIsLighterConnected(true)
      }
    }, 5000)
  }

  useEffect(() => {
    if (backpackWebsocket.current?.readyState !== WebSocket.OPEN || lighterWebsocket.current?.readyState !== WebSocket.OPEN) {
      logger.warning('WebSocket не подключены, пропуск анализа спредов', {
        backpackConnected: backpackWebsocket.current?.readyState === WebSocket.OPEN,
        lighterConnected: lighterWebsocket.current?.readyState === WebSocket.OPEN
      })
      return
    }
    checkBalancesEnough()
    
    spreads.forEach(spread => {
      if (!openedOrders.current[spread.id] && !openedOrdersReduceOnly.current[spread.id] && balanceError) {
        return
      }
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
          ? (Number(lighterBidPrice) - Number(lighterPosition.entry_price)) /
            Number(lighterBidPrice)
          : (Number(lighterPosition.entry_price) - Number(lighterAskPrice)) /
            Number(lighterAskPrice)
        const backpackSpread = !isLighterLong
          ? (Number(backpackAskPrice) - Number(backpackPosition.entryPrice)) /
            Number(backpackAskPrice)
          : (Number(backpackPosition.entryPrice) - Number(backpackBidPrice)) /
            Number(backpackBidPrice)

        const size = isLighterLong
          ? Number(lighterBidPrice) * Number(lighterBidQty)
          : Number(lighterAskPrice) * Number(lighterAskQty)

        const summarySpread = (lighterSpread + backpackSpread) * 100

        console.log('summarySpread', summarySpread, spread.asset, {
          lighterSpread,
          backpackSpread,
          lighterPosition,
          backpackPosition,
          lighterBidPrice,
          lighterAskPrice,
          lighterAskQty,
          lighterBidQty,
          backpackBidPrice,
          backpackAskPrice,
        })

        if (
          summarySpread >= spread.closeSpread &&
          !openedOrdersReduceOnly.current[spread.id] &&
          size > 0
        ) {
          logger.spread('Создание reduce-only ордера для закрытия спреда', {
            spreadId: spread.id,
            asset: spread.asset,
            summarySpread,
            closeSpread: spread.closeSpread
          })
          
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
            logger.spread('Закрытие reduce-only ордера - спред уменьшился', {
              spreadId: spread.id,
              asset: spread.asset,
              summarySpread,
              closeSpreadHalf: spread.closeSpread / 2
            })
            
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

        if (!shortBackpack) {
          actualSpread =
            ((Number(lighterBidPrice) - Number(backpackBidPrice)) /
              (Number(lighterBidPrice) + Number(backpackBidPrice) / 2)) *
            100
        }

        console.log('actualSpread', actualSpread, spread.asset)

        if (
          actualSpread >= spread.openSpread &&
          !openedOrders.current[spread.id] &&
          Math.min(size, spread.size - positionsSize) > 0
        ) {
          logger.spread('Создание ордера для открытия спреда', {
            spreadId: spread.id,
            asset: spread.asset,
            actualSpread,
            openSpread: spread.openSpread,
            side: shortBackpack ? 'ASK' : 'BID',
            price: shortBackpack ? backpackAskPrice : backpackBidPrice,
            quantity: Math.min(size, spread.size - positionsSize)
          })
          
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
            openedOrders.current[spread.id].createdAt + 6000 < Date.now()
          ) {
            logger.spread('Закрытие ордера - условия изменились или истекло время', {
              spreadId: spread.id,
              asset: spread.asset,
              orderPrice: openedOrders.current[spread.id].price,
              lighterAskPrice,
              lighterBidPrice,
              calculatedA: a,
              calculatedB: b,
              allGood,
              orderAge: Date.now() - openedOrders.current[spread.id].createdAt
            })
            
            closeBackpackOrder(spread, openedOrders.current[spread.id])
          }
        }
      }
    })
  }, [backpackBook, lighterBook, spreads])

  const [balances, setBalances] = useState<{ lighterBalance: string, backpackBalance: string, backpackLeverage: number }>({ lighterBalance: '0', backpackBalance: '0', backpackLeverage: 1 })
  const [balanceError, setBalanceError] = useState(false)

  const getBalances = async () => {
    const lighterBalance = await AccountService.accountPositionsApiAccountPositionsPost({ requestBody: { account: { private_key: lighterPrivateKey } } })

    const dateNow = Date.now()

    const backpackBalance = await CapitalService.getCollateral({
      xApiKey: backpackApiPublicKey,
      xSignature: await getSignature(
        'collateralQuery',
        backpackApiSecretKey,
        dateNow.toString(),
        {}
      ),
      xTimestamp: dateNow,
      xWindow: 60000,
    })

    const { leverageLimit: backpackLeverage } = await BpAccountService.getAccount({
      xApiKey: backpackApiPublicKey,
      xSignature: await getSignature(
        'accountQuery',
        backpackApiSecretKey,
        dateNow.toString(),
        {}
      ),
      xTimestamp: dateNow,
      xWindow: 60000,
    })

    setBalances({ lighterBalance: lighterBalance.free_balance, backpackBalance: backpackBalance.netEquityAvailable, backpackLeverage: Number(backpackLeverage) })
  }

  const refreshAll = async () => {
    await Promise.all([
      fetchPositions(),
      getBalances()
    ])
  }

  useEffect(() => {
    init()
    const interval = setInterval(async () => {
      refreshAll()
    }, 20000)
    refreshAll()
    checkBalancesEnough()

    if (backpackWebsocket.current) {
      backpackWebsocket.current.onclose = () => {
        logger.warning('WebSocket Backpack переподключение')
        connectBackpackWebsocket()
      }
    }

    return () => {
      cleanup()
      clearInterval(interval)
    }
  }, [])

  const closeAllPositionsMarket = async (spread: SpreadData) => {
    logger.warning('Закрытие всех позиций для спреда', {
      spreadId: spread.id,
      asset: spread.asset,
      lighterPositions: spread.lighterPositions.length,
      backpackPositions: spread.backpackPositions.length
    })
    
    const { lighterPositions, backpackPositions } = spread

    try {
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
            
            logger.order('Создание market ордера для закрытия позиции Backpack', {
              spreadId: spread.id,
              asset: spread.asset,
              isLong,
              quantity: order.quantity,
              side: order.side,
              symbol: order.symbol
            })
            
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
              logger.order('Отмена ордеров Lighter для закрытия позиции', {
                spreadId: spread.id,
                asset: spread.asset,
                tokenId: position.market_id
              })
              
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

      logger.success('Все позиции успешно закрыты', {
        spreadId: spread.id,
        asset: spread.asset
      })

      await fetchPositions()
    } catch (error) {
      logger.error('Ошибка при закрытии всех позиций', {
        spreadId: spread.id,
        asset: spread.asset,
        error: String(error)
      })
      throw error
    }
  }

  const checkBalancesEnough = async () => {
    const { lighterBalance, backpackBalance, backpackLeverage } = balances

    const lighterSummaryValue = spreadsRef.current.reduce((acc, spread) => acc + Number(spread.size / spread.leverage) - Number((spread.lighterPositions[0]?.size ?? 0)), 0)

    const backpackSummaryValue = spreadsRef.current.reduce((acc, spread) => acc + Number(spread.size / backpackLeverage) - Math.abs(Number(spread.backpackPositions[0]?.netCost ?? 0)), 0)

    if (lighterSummaryValue > Number(lighterBalance) || backpackSummaryValue > Number(backpackBalance)) {
      setBalanceError(true)
    } else {
      setBalanceError(false)
    }
  }

  const cleanup = () => {
    logger.info('Очистка системы спредов')
    
    if (backpackWebsocket.current) {
      backpackWebsocket.current.close()
      backpackWebsocket.current = null
      logger.websocket('Backpack WebSocket закрыт при очистке')
    }

    if (lighterWebsocket.current) {
      lighterWebsocket.current.close()
      lighterWebsocket.current = null
      logger.websocket('Lighter WebSocket закрыт при очистке')
    }

    if (interval.current) {
      clearInterval(interval.current)
      interval.current = null
      logger.info('Интервал очищен')
    }
  }

  const [authorizingLighter, setAuthorizingLighter] = useState(false)

  const authLighter = async () => {
    setAuthorizingLighter(true)
    const data = await AccountService.accountsRefreshApiAccountsRefreshPost({ requestBody: { accounts: [{ account: { private_key: lighterPrivateKey } }], from_api_key_index: 52, to_api_key_index: 72}})

    const interval = setInterval(() => {
      AccountService.accountRefreshResultApiAccountsRefreshTaskIdGet({ taskId: data[lighterPrivateKey].id }).then((res) => {
        if (res.is_completed) {
          setAuthorizingLighter(false)
          clearInterval(interval)
        }

        if (res.created_at && +res.created_at + 300000 < Date.now()) {
          setAuthorizingLighter(false)
          clearInterval(interval)
        }
      })
    }, 30000)
  }

  return {
    init,
    cleanup,
    addBackpackSpreadSubscription,
    addLighterSpreadSubscription,
    connectBackpackWebsocket,
    openBackpackLimitOrder,
    connectLighterWebsocket,
    closeAllPositionsMarket,
    testLighter,
    authLighter,
    balanceError,
    balances,
    authorizingLighter,
    isLighterConnected,
    isBackpackConnected,
  }
}
