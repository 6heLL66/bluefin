import { useEffect, useRef, useState } from 'react'

import { AccountService, ORDER_SIDE, OrderService as OrderServiceApi } from '../../api'
import { AccountService as BpAccountService, CapitalService, FuturesService, OrderService, OrderType, OrderTypeEnum, Side } from '../../bp-api'
import { getSignature } from '../../bp-api/getSignature'
import { useLogger } from '../../hooks/useLogger'
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
    setLastTimeFilled,
    updateSpread,
    pausedSpreads,
    toggleSpreadPause,
    pauseAllSpreads,
    resumeAllSpreads,
  } = useSpreadStore()

  const logger = useLogger()

  const [backpackBook, setBackpackBook] = useState<Record<string, BookTicker>>({})
  const [lighterBook, setLighterBook] = useState<Record<string, BookTicker>>({})

  const backpackWebsocket = useRef<WebSocket | null>(null)
  const lighterWebsocket = useRef<WebSocket | null>(null)

  const openedOrders = useRef<Record<string, OrderType & { price: string }>>({})
  const openedOrdersReduceOnly = useRef<Record<string, OrderType>>({})

  const spreadsRef = useRef<SpreadData[]>([])

  useEffect(() => {
    spreadsRef.current = spreads

    spreads.forEach(spread => {
      if (!spread.lighterPositions[0] || !spread.backpackPositions[0]) {
        return 
      }
      if (
        ((spread.lighterPositions[0].side === ORDER_SIDE.BUY && +spread.lighterPositions[0].entry_price > +spread.backpackPositions[0].entryPrice) ||
          (spread.lighterPositions[0].side === ORDER_SIDE.SELL && +spread.lighterPositions[0].entry_price < +spread.backpackPositions[0].entryPrice)) &&
        spread.lastTimeFilled &&
        Date.now() - spread.lastTimeFilled > 1000 * 60 * 60
      ) {
        const spr =
        ((Math.max(+spread.lighterPositions[0].entry_price, +spread.backpackPositions[0].entryPrice) -
          Math.min(+spread.lighterPositions[0].entry_price, +spread.backpackPositions[0].entryPrice)) /
          Math.max(+spread.lighterPositions[0].entry_price, +spread.backpackPositions[0].entryPrice)) *
        100
        if (spr * -1  !== spread.closeSpread) {
          updateSpread(spread.id, { closeSpread: spr * -1 })
        }

        return
      }
    })
  }, [spreads])

  const testLighter = async () => {
    try {
      const requests = []
      for (let i = 0; i < 10; i++) {
        requests.push(
          OrderServiceApi.accountOrderApiAccountOrdersPost({
            requestBody: {
              unit: {
                side: ORDER_SIDE.BUY,
                token_id: 24,
                size: '5',
              },
              token: lighterMarkets.find(token => token.market_id === 24)!,
              account: {
                account: {
                  private_key: lighterPrivateKey,
                },
              },
            },
          }),
        )
      }

      await Promise.all(requests)

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
    } catch (error) {
      throw error
    }
  }

  const connectLighterWebsocket = () => {
    try {
      if (lighterWebsocket.current) {
        lighterWebsocket.current.close()
        lighterWebsocket.current.onmessage = () => {}
        lighterWebsocket.current = null
      }

      lighterWebsocket.current = new WebSocket(import.meta.env.VITE_WEBSOCKET_URL)

      lighterWebsocket.current.onopen = () => {
        addLighterSpreadSubscription(spreadsRef.current)
      }

      lighterWebsocket.current.onmessage = event => {
        const { token_id, ask, bid } = JSON.parse(event.data)

        if (token_id) {
          const symbol = lighterMarkets.find(token => token.market_id === +token_id)?.symbol ?? ''

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
    } catch (error) {
      setTimeout(connectLighterWebsocket, 2000)
    }
  }

  const openBackpackLimitOrder = async (spread: SpreadData, price: string, quantity: string, side: Side, reduceOnly: boolean = false) => {
    const market = backpackMarkets.find(token => token.baseSymbol === spread.asset)
    const lighterMarket = lighterMarkets.find(token => token.symbol === spread.asset)

    const lowerPrice = reduceOnly ? Number(price) : side === Side.ASK ? Number(price) : Number(price)

    const isConnected = lighterWebsocket.current?.readyState === WebSocket.OPEN

    if (!isConnected) {
      logger.spread('WebSocket не подключен, при создании ордера переподключение...', { spread: spread, asset: spread.asset })
      connectLighterWebsocket()
      delete openedOrders.current[spread.id]
      delete openedOrdersReduceOnly.current[spread.id]
      updateSpreadStatus(spread.id, 'WAITING')
      return
    }

    const reduceOnlyQuantity = Math.min((Number(quantity) * 1.025) / Number(lowerPrice), Math.abs(+spread.backpackPositions[0]?.netQuantity))

    const order = {
      orderType: OrderTypeEnum.LIMIT,
      postOnly: true,
      price: lowerPrice.toFixed(market?.filters.price.tickSize.split('.')[1].length ?? 2),
      quantity: (reduceOnly ? reduceOnlyQuantity : Number(quantity) / Number(lowerPrice)).toFixed(lighterMarket?.size_decimals ?? 2),
      reduceOnly,
      side: side,
      symbol: spread.asset.toUpperCase() + '_USDC_PERP',
    }

    logger.spread('Открытие ордера Backpack', {
      market,
      isConnected,
      openedOrder: openedOrders.current[spread.id],
      openedOrderReduceOnly: openedOrdersReduceOnly.current[spread.id],
      order,
      spread: spread,
    })

    try {
      const dateNow = Date.now()
      const resultOrder = await OrderService.executeOrder({
        xApiKey: backpackApiPublicKey,
        xSignature: await getSignature('orderExecute', backpackApiSecretKey, dateNow.toString(), order),
        xTimestamp: dateNow,
        xWindow: 60000,
        requestBody: order,
      })

      logger.spread('Ордер Backpack успешно создан', {
        market,
        isConnected,
        openedOrder: openedOrders.current[spread.id],
        openedOrderReduceOnly: openedOrdersReduceOnly.current[spread.id],
        order,
        spread: spread,
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
      logger.spread('Ошибка создания ордера Backpack', {
        spreadId: spread.id,
        asset: spread.asset,
        error: String(error),
        order,
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

  const closeBackpackOrder = async (spread: SpreadData, order: OrderType, reduceOnly: boolean = false) => {
    if (closingOrders.current[spread.id]) return

    logger.spread('Ордер Backpack закрывается так как спред пропал', {
      spread: spread,
      order,
      reduceOnly,
    })

    try {
      closingOrders.current[spread.id] = true

      const dateNow = Date.now()
      await OrderService.cancelOrder({
        xApiKey: backpackApiPublicKey,
        xSignature: await getSignature('orderCancel', backpackApiSecretKey, dateNow.toString(), {
          orderId: order.id,
          symbol: order.symbol,
        }),
        xTimestamp: dateNow,
        xWindow: 60000,
        requestBody: {
          orderId: order.id,
          symbol: order.symbol,
        },
      })

      logger.spread('Ордер Backpack успешно закрыт', {
        spread: spread,
        order,
        reduceOnly,
      })

      if (reduceOnly) {
        delete openedOrdersReduceOnly.current[spread.id]
      } else {
        delete openedOrders.current[spread.id]
      }

      updateSpreadStatus(spread.id, 'WAITING')
    } catch (error) {
      logger.spread('Ошибка закрытия ордера Backpack', {
        spread: spread,
        order,
        error: String(error),
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
        backpackWebsocket.current.onmessage = () => {}
        backpackWebsocket.current = null
      }

      backpackWebsocket.current = new WebSocket('wss://ws.backpack.exchange')

      backpackWebsocket.current.onopen = () => {
        addBackpackSpreadSubscription(spreadsRef.current)
      }

      backpackWebsocket.current.onmessage = async event => {
        const { data, stream } = JSON.parse(event.data)

        if (stream && stream.includes('orderUpdate')) {
          const { e, l, S, s, L, X, o } = data

          if (e === 'orderFill' && o === 'LIMIT') {
            const spread = spreadsRef.current.find(spread => spread.asset === s.split('_')[0])

            logger.spread('Получено уведомление о заполнении ордера', {
              event: e,
              symbol: s,
              side: S,
              price: L,
              quantity: l,
              status: X,
              data,
              spread: spread,
            })

            if (!spread) return

            const token = lighterMarkets.find(token => token.symbol === s.split('_')[0])!
            const isReduceOnly = !!openedOrdersReduceOnly.current[spread.id]

            let reduceOnlyQuantity = Math.min(l, Math.abs(+spread.lighterPositions[0]?.position))

            if (spread.lighterPositions[0] && +spread.lighterPositions[0].position - l < 1 / 10 ** (token.size_decimals * 4)) {
              reduceOnlyQuantity = Number(spread.lighterPositions[0].position)
            }

            if (isReduceOnly && spread.lighterPositions[0]?.position) {
              spread.lighterPositions[0].position = (Number(spread.lighterPositions[0].position) - reduceOnlyQuantity).toString()
            }

            logger.spread('Создание ордера Lighter в ответ на заполнение Backpack', {
              spread: spread,
              data,
              token,
              isReduceOnly,
              reduceOnlyQuantity,
              l,
              L,
            })

            await OrderServiceApi.accountOrderApiAccountOrdersPost({
              requestBody: {
                unit: {
                  side: S === 'Bid' ? ORDER_SIDE.SELL : ORDER_SIDE.BUY,
                  token_id: token?.market_id ?? 0,
                  size: isReduceOnly ? reduceOnlyQuantity * L : l * L,
                  reduce_only: isReduceOnly,
                },
                token: { ...token, price: L },
                account: {
                  account: {
                    private_key: lighterPrivateKey,
                  },
                },
              },
            }).catch(error => {
              logger.spread('Ошибка создания ордера Lighter', {
                error: String(error),
                message: error.message,
                spread: spread,
                data,
              })
            })

            if (X === 'Filled') {
              logger.spread('Ордер Backpack полностью заполнен', {
                spread: spread,
                data,
                token,
                isReduceOnly,
                reduceOnlyQuantity,
                l,
                L,
              })

              await fetchPositions()
              setTimeout(() => {
                delete openedOrders.current[spread.id]
                delete openedOrdersReduceOnly.current[spread.id]
              }, 100)
              
              updateSpreadStatus(spread.id, 'WAITING')
              setLastTimeFilled(spread.id, Date.now())

              if (!isReduceOnly) {
                setTimeout(() => {
                  const _spread = spreadsRef.current.find(spr => spr.id === spread.id)
                  if (!_spread) return
                  const spr =
                    ((Math.max(+_spread.lighterPositions[0].entry_price, +_spread.backpackPositions[0].entryPrice) -
                      Math.min(+_spread.lighterPositions[0].entry_price, +_spread.backpackPositions[0].entryPrice)) /
                      Math.max(+_spread.lighterPositions[0].entry_price, +_spread.backpackPositions[0].entryPrice)) *
                    100
          
                  updateSpread(_spread.id, { closeSpread: spr * 0.9 })
                }, 100)
              }
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
      setTimeout(connectBackpackWebsocket, 2000)
    }
  }

  const addBackpackSpreadSubscription = async (spreads: SpreadData[]) => {
    if (spreads.length === 0) return

    const backpackSubscribeMessage = {
      method: 'SUBSCRIBE',
      params: spreads.map(spread => `bookTicker.${spread.asset.toUpperCase()}_USDC_PERP`),
      id: Date.now(),
    }

    backpackWebsocket.current?.send(JSON.stringify(backpackSubscribeMessage))

    const dateNow = Date.now()

    const subscribeSignature = await getSignature('subscribe', backpackApiSecretKey, dateNow.toString(), {})

    const subscribeMessage = {
      method: 'SUBSCRIBE',
      params: spreads.map(spread => `account.orderUpdate.${spread.asset.toUpperCase()}_USDC_PERP`),
      signature: [backpackApiPublicKey, subscribeSignature, dateNow.toString(), '60000'],
    }

    backpackWebsocket.current?.send(JSON.stringify(subscribeMessage))
  }

  const addLighterSpreadSubscription = (spreads: SpreadData[]) => {
    if (spreads.length === 0) return

    const lighterSubscribeMessage = {
      token_ids: spreads.map(spread => spread.tokenId),
    }

    lighterWebsocket.current?.send(JSON.stringify(lighterSubscribeMessage))
  }

  const fetchPositions = async () => {
    console.log(spreads.length, 'sdf')
    if (spreadsRef.current.length === 0) return

    try {
      const lighterPositions = await AccountService.accountPositionsApiAccountPositionsPost({
        requestBody: {
          account: {
            private_key: lighterPrivateKey,
          },
        },
      })

      const dateNow = Date.now()
      const signature = await getSignature('positionQuery', backpackApiSecretKey, dateNow.toString(), {})

      const backpackPositions = await FuturesService.getPositions({
        xApiKey: backpackApiPublicKey,
        xSignature: signature,
        xTimestamp: dateNow,
        xWindow: 60000,
      })

      spreadsRef.current.forEach(async spread => {
        const lighterPos = lighterPositions.positions.filter(pos => pos.symbol === spread.asset)
        console.log('lighterPos', lighterPos, lighterPositions.positions)
        const backpackPos = backpackPositions.filter(pos => pos.symbol === spread.asset + '_USDC_PERP')

        setSpreadPositions(spread.id, lighterPos, backpackPos)
      })

      await new Promise(resolve => setTimeout(resolve, 200))
    } catch (error) {
      logger.spread('Ошибка получения позиций', { error: String(error) })
    }
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
    if (backpackWebsocket.current?.readyState !== WebSocket.OPEN || lighterWebsocket.current?.readyState !== WebSocket.OPEN) {
      return
    }
    checkBalancesEnough()

    spreads.forEach(spread => {
      if (pausedSpreads.has(spread.id)) {
        if (openedOrders.current[spread.id]) {
          closeBackpackOrder(spread, openedOrders.current[spread.id])
        }
        if (openedOrdersReduceOnly.current[spread.id]) {
          closeBackpackOrder(spread, openedOrdersReduceOnly.current[spread.id], true)
        }
        return
      }
      if (!openedOrders.current[spread.id] && !openedOrdersReduceOnly.current[spread.id] && balanceError) {
        return
      }
      const backpackBidPrice = backpackBook[spread.asset.toUpperCase()]?.bidPrice
      const lighterBidPrice = lighterBook[spread.asset.toUpperCase()]?.bidPrice
      const backpackAskPrice = backpackBook[spread.asset.toUpperCase()]?.askPrice
      const lighterAskPrice = lighterBook[spread.asset.toUpperCase()]?.askPrice
      const lighterAskQty = lighterBook[spread.asset.toUpperCase()]?.askQty
      const lighterBidQty = lighterBook[spread.asset.toUpperCase()]?.bidQty

      const positionsSize = Math.max(Math.abs(Number(spread.backpackPositions[0]?.netCost ?? 0)), Number(spread.lighterPositions[0]?.size ?? 0))
      const isSpreadFulfilled = spread.size - positionsSize < spread.size * 0.01 || spread.size - positionsSize < 15

      if (
        !openedOrders.current[spread.id] &&
        spread.lighterPositions?.some(pos => pos.symbol === spread.asset) &&
        spread.backpackPositions?.some(pos => pos.symbol === spread.asset + '_USDC_PERP')
      ) {
        const lighterPosition = spread.lighterPositions[0]
        const backpackPosition = spread.backpackPositions[0]

        if (!lighterPosition || !backpackPosition) {
          return
        }
        const isLighterLong = lighterPosition.side === ORDER_SIDE.BUY
        const lighterSpread = isLighterLong
          ? (Number(lighterBidPrice) - Number(lighterPosition.entry_price)) / Number(lighterBidPrice)
          : (Number(lighterPosition.entry_price) - Number(lighterAskPrice)) / Number(lighterAskPrice)
        const backpackSpread = !isLighterLong
          ? (Number(backpackAskPrice) - Number(backpackPosition.entryPrice)) / Number(backpackAskPrice)
          : (Number(backpackPosition.entryPrice) - Number(backpackBidPrice)) / Number(backpackBidPrice)

        const size = isLighterLong ? Number(lighterBidPrice) * Number(lighterBidQty) : Number(lighterAskPrice) * Number(lighterAskQty)

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

        if (summarySpread >= spread.closeSpread && !openedOrdersReduceOnly.current[spread.id] && size > 0) {
          logger.spread('Создание reduce-only ордера для закрытия спреда', {
            spreadId: spread.id,
            asset: spread.asset,
            summarySpread,
            closeSpread: spread.closeSpread,
          })

          openedOrdersReduceOnly.current[spread.id] = {} as OrderType
          openBackpackLimitOrder(
            spread,
            isLighterLong ? backpackBidPrice : backpackAskPrice,
            Math.min(size, Math.abs(Number(backpackPosition.netCost))).toString(),
            isLighterLong ? Side.BID : Side.ASK,
            true,
          )
        } else if (openedOrdersReduceOnly.current[spread.id] && openedOrdersReduceOnly.current[spread.id].symbol) {
          if (summarySpread < spread.closeSpread / 2) {
            logger.spread('Закрытие reduce-only ордера - спред уменьшился', {
              spreadId: spread.id,
              asset: spread.asset,
              summarySpread,
              closeSpreadHalf: spread.closeSpread / 2,
            })

            closeBackpackOrder(spread, openedOrdersReduceOnly.current[spread.id], true)
          }
        }
      }

      if (backpackBidPrice && lighterBidPrice && backpackAskPrice && lighterAskPrice && !openedOrdersReduceOnly.current[spread.id] && !isSpreadFulfilled) {
        let actualSpread = ((Number(backpackAskPrice) - Number(lighterAskPrice)) / (Number(lighterAskPrice) + Number(backpackAskPrice) / 2)) * 100

        const shortBackpack = Number(spread.backpackPositions[0]?.netCost ?? 0) < 0 || actualSpread > 0
        const size = shortBackpack ? Number(lighterAskPrice) * Number(lighterAskQty) : Number(lighterBidPrice) * Number(lighterBidQty)

        if (!shortBackpack) {
          actualSpread = ((Number(lighterBidPrice) - Number(backpackBidPrice)) / (Number(lighterBidPrice) + Number(backpackBidPrice) / 2)) * 100
        }

        console.log('actualSpread', actualSpread, spread.asset)

        if (actualSpread >= spread.openSpread && !openedOrders.current[spread.id] && Math.min(size, spread.size - positionsSize) > 0) {
          logger.spread('Создание ордера для открытия спреда', {
            spreadId: spread.id,
            asset: spread.asset,
            actualSpread,
            openSpread: spread.openSpread,
            side: shortBackpack ? 'ASK' : 'BID',
            price: shortBackpack ? backpackAskPrice : backpackBidPrice,
            quantity: Math.min(size, spread.size - positionsSize),
          })

          openedOrders.current[spread.id] = {} as OrderType & { price: string }
          openBackpackLimitOrder(
            spread,
            shortBackpack ? backpackAskPrice : backpackBidPrice,
            Math.min(size, spread.size - positionsSize).toString(),
            shortBackpack ? Side.ASK : Side.BID,
          )
        } else if (openedOrders.current[spread.id] && openedOrders.current[spread.id].symbol) {
          const a = (Number(lighterBidPrice) - Number(openedOrders.current[spread.id].price)) / Number(lighterBidPrice)
          const b = (Number(lighterAskPrice) - Number(openedOrders.current[spread.id].price)) / Number(lighterAskPrice)
          const allGood = openedOrders.current[spread.id].side === Side.BID ? Math.abs(a) > spread.openSpread / 2 : b < spread.openSpread / -2

          if (!allGood || openedOrders.current[spread.id].createdAt + 5000 < Date.now()) {
            logger.spread('Закрытие ордера - условия изменились или истекло время', {
              spreadId: spread.id,
              asset: spread.asset,
              orderPrice: openedOrders.current[spread.id].price,
              lighterAskPrice,
              lighterBidPrice,
              calculatedA: a,
              calculatedB: b,
              allGood,
              orderAge: Date.now() - openedOrders.current[spread.id].createdAt,
            })

            closeBackpackOrder(spread, openedOrders.current[spread.id])
          }
        }
      }
    })
  }, [backpackBook, lighterBook, spreads, pausedSpreads])

  const [balances, setBalances] = useState<{
    lighterBalance: string
    backpackBalance: string
    backpackLeverage: number
  }>({ lighterBalance: '0', backpackBalance: '0', backpackLeverage: 1 })
  const [balanceError, setBalanceError] = useState(false)

  const getBalances = async () => {
    const lighterBalance = await AccountService.accountPositionsApiAccountPositionsPost({
      requestBody: { account: { private_key: lighterPrivateKey } },
    })

    const dateNow = Date.now()

    const backpackBalance = await CapitalService.getCollateral({
      xApiKey: backpackApiPublicKey,
      xSignature: await getSignature('collateralQuery', backpackApiSecretKey, dateNow.toString(), {}),
      xTimestamp: dateNow,
      xWindow: 60000,
    })

    const { leverageLimit: backpackLeverage } = await BpAccountService.getAccount({
      xApiKey: backpackApiPublicKey,
      xSignature: await getSignature('accountQuery', backpackApiSecretKey, dateNow.toString(), {}),
      xTimestamp: dateNow,
      xWindow: 60000,
    })

    setBalances({
      lighterBalance: lighterBalance.free_balance,
      backpackBalance: backpackBalance.netEquityAvailable,
      backpackLeverage: Number(backpackLeverage),
    })
  }

  const refreshAll = async () => {
    await Promise.all([fetchPositions(), getBalances()])
  }

  useEffect(() => {
    init()
    const interval = setInterval(async () => {
      refreshAll()
    }, 20000)
    refreshAll()
    checkBalancesEnough()

    return () => {
      cleanup()
      clearInterval(interval)
    }
  }, [])

  const closeAllPositionsMarket = async (spread: SpreadData) => {
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

            logger.spread('Создание market ордера для закрытия позиции Backpack', {
              spread: spread,
              isLong,
              quantity: order.quantity,
              side: order.side,
              symbol: order.symbol,
            })

            const dateNow = Date.now()
            return OrderService.executeOrder({
              xApiKey: backpackApiPublicKey,
              xSignature: await getSignature('orderExecute', backpackApiSecretKey, dateNow.toString(), order),
              xTimestamp: dateNow,
              xWindow: 60000,
              requestBody: order,
            }) as Promise<unknown>
          })
          .concat(
            lighterPositions.map(async position => {
              logger.spread('Отмена ордеров Lighter для закрытия позиции', {
                spread: spread,
                token: position,
              })

              return OrderServiceApi.accountOrdersCancelApiAccountOrdersCancelPost({
                requestBody: {
                  token_id: position.market_id,
                  account: {
                    account: {
                      private_key: lighterPrivateKey,
                    },
                  },
                },
              })
            }),
          ),
      )

      logger.spread('Все позиции успешно закрыты', {
        spread: spread,
      })

      await fetchPositions()
    } catch (error) {
      logger.spread('Ошибка при закрытии всех позиций', {
        spread: spread,
        error: String(error),
      })
      throw error
    }
  }

  const checkBalancesEnough = async () => {
    const { lighterBalance, backpackBalance, backpackLeverage } = balances

    const lighterSummaryValue = spreadsRef.current.reduce(
      (acc, spread) => acc + Number(spread.size / spread.leverage) - Number(spread.lighterPositions[0]?.size ?? 0),
      0,
    )

    const backpackSummaryValue = spreadsRef.current.reduce(
      (acc, spread) => acc + Number(spread.size / backpackLeverage) - Math.abs(Number(spread.backpackPositions[0]?.netCost ?? 0)),
      0,
    )

    if (lighterSummaryValue > Number(lighterBalance) || backpackSummaryValue > Number(backpackBalance)) {
      setBalanceError(true)
    } else {
      setBalanceError(false)
    }
  }

  const cleanup = () => {
    if (backpackWebsocket.current) {
      backpackWebsocket.current.close()
      backpackWebsocket.current.onmessage = () => {}
      backpackWebsocket.current = null
    }

    if (lighterWebsocket.current) {
      lighterWebsocket.current.close()
      lighterWebsocket.current.onmessage = () => {}
      lighterWebsocket.current = null
    }

    if (interval.current) {
      clearInterval(interval.current)
      interval.current = null
    }
  }

  const [authorizingLighter, setAuthorizingLighter] = useState(false)

  const authLighter = async () => {
    setAuthorizingLighter(true)
    const data = await AccountService.accountsRefreshApiAccountsRefreshPost({
      requestBody: {
        accounts: [{ account: { private_key: lighterPrivateKey } }],
        from_api_key_index: 52,
        to_api_key_index: 72,
      },
    })

    const interval = setInterval(() => {
      AccountService.accountRefreshResultApiAccountsRefreshTaskIdGet({
        taskId: data[lighterPrivateKey].id,
      }).then(res => {
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

  const isSpreadPaused = (spreadId: string) => pausedSpreads.has(spreadId)



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
    toggleSpreadPause,
    pauseAllSpreads,
    resumeAllSpreads,
    isSpreadPaused,
    pausedSpreads,
  }
}
