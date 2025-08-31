import { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { toast } from 'react-toastify'
import seedrandom from 'seedrandom'

import { AccountService, AccountWithPositionsDto, OrderCreateDto, OrderCreateWithTokenDto, OrderService, PositionDto, TokenService } from '../../../api'
import { GlobalContext } from '../../../context'
import { useLogger } from '../../../hooks/useLogger'
import { Account, Unit } from '../../../types'
import { getBatchAccount, transformAccountStatesToUnits } from '../../../utils'
import { useQuery } from '@tanstack/react-query'

interface Props {
  accounts: string[]
  id: string
  name: string
}

interface CreateUnitPayload {
  token_id: number
  sz: number
  leverage: number
  timing: number
  range: number
}

interface ReturnType {
  batchAccounts: Account[]
  units: Unit[]
  balances: Record<string, { free: string; all: string }>
  unitTimings: Record<string, { openedTiming: number; recreateTiming: number }>
  closingUnits: number[]
  recreatingUnits: number[]
  initialLoading: boolean
  authorizingLighter: boolean
  tradeData: Record<string, { points: number; volume: number }>
  randomRecreatingTimings: Record<string, number>
  getUnitTimingRange: (token_id: number) => number
  authLighter: () => Promise<void>
  setTimings: (token_id: number, recreateTiming: number, openedTiming: number, range: number) => Promise<void>
  getUnitTimingOpened: (token_id: number) => number
  getUnitTimingReacreate: (token_id: number) => number
  createUnit: (payload: CreateUnitPayload) => Promise<unknown>
  closeUnit: (unit: Unit) => Promise<unknown>
}

const UPDATE_INTERVAL = 10000

export const useBatch = ({ accounts: accountsProps, id, name }: Props): ReturnType => {
  const { accounts, getAccountProxy, getUnitTimings, setUnitInitTimings } = useContext(GlobalContext)

  const [tradeData, setTradeData] = useState<Record<string, { points: number; volume: number }>>({})

  const logger = useLogger()

  const { data: lighterMarkets } = useQuery({
    queryKey: ['lighter-tokens'],
    queryFn: () => {
      return TokenService.tokenListApiTokensGet()
    },
    refetchInterval: 1000 * 60,
  })

  const batchAccounts = useMemo(
    () =>
      accountsProps.map(a => {
        return accounts.find(b => b.id == a)!
      })!,
    [accountsProps],
  )

  const updatingRef = useRef(false)

  const [initialLoading, setInitialLoading] = useState(true)

  const [randomRecreatingTimings, setRandomRecreatingTimings] = useState<Record<string, number>>({})

  const [closingUnits, setClosingUnits] = useState<number[]>([])
  const [creatingUnits, setCreatingUnits] = useState<number[]>([])
  const [recreatingUnits, setRecreatingUnits] = useState<number[]>([])

  const [balances, setBalances] = useState<Record<string, { free: string; all: string }>>({})

  const [accountStates, setAccountState] = useState<AccountWithPositionsDto[]>([])

  const [unitTimings, setUnitTimings] = useState<Record<string, { openedTiming: number; recreateTiming: number; range: number }>>({})

  const units = useMemo(() => {
    return transformAccountStatesToUnits(Object.values(accountStates))
  }, [accountStates])

  const getUnitTimingOpened = useCallback(
    (token_id: number): number => {
      return unitTimings?.[token_id.toString() as keyof typeof unitTimings]?.openedTiming
    },
    [unitTimings],
  )

  const getUnitTimingReacreate = useCallback(
    (token_id: number): number => {
      return unitTimings?.[token_id.toString() as keyof typeof unitTimings]?.recreateTiming
    },
    [unitTimings],
  )

  const getUnitTimingRange = useCallback(
    (token_id: number): number => {
      return unitTimings?.[token_id.toString() as keyof typeof unitTimings]?.range
    },
    [unitTimings],
  )

  const setTimings = useCallback(
    async (token_id: number, recreateTiming: number, openedTiming: number, range: number) => {
      setUnitInitTimings(id, token_id.toString(), recreateTiming, openedTiming, range)
      setUnitTimings(prev => ({
        ...prev,
        [token_id.toString()]: {
          openedTiming,
          recreateTiming,
          range,
        },
      }))
    },
    [setUnitInitTimings, setUnitTimings],
  )

  const fetchUserStates = useCallback((): Promise<Array<AccountWithPositionsDto>> => {
    return AccountService.accountsPositionsApiAccountsPositionsPost({
      requestBody: batchAccounts.map(acc => getBatchAccount(acc, getAccountProxy(acc))),
    })
      .then(res => {
        setBalances(
          res.reduce((acc, account) => {
            return {
              ...acc,
              [account.address]: {
                all: Number(account.balance).toFixed(2),
                free: Number(account.free_balance).toFixed(2),
              },
            }
          }, {}),
        )

        setAccountState(res)

        return res
      })
      .catch(error => {
        logger.batch('Ошибка при обновлении состояний аккаунтов', {
          batch_name: name,
          batch_id: id,
          error: String(error),
          message: error.message,
          error_object: error,
        })
        throw error
      })
  }, [batchAccounts, logger])

  const recreateUnit = useCallback(
    async ({ token_id, leverage, sz }: Omit<CreateUnitPayload, 'timing' | 'range'>) => {
      setRecreatingUnits(prev => [...prev, token_id])

      logger.batch(
        'Пересоздание юнита',
        {
          batch_name: name,
          batch_id: id,
          token_id,
          size: sz,
          leverage,
          accounts_count: batchAccounts.length,
        },
        token_id.toString(),
      )

      console.log('recreateUnit', token_id, leverage, sz)

      const token = lighterMarkets!.find(t => t.market_id === token_id)!

      const promise = recreateRequest({
        accounts: batchAccounts.map(acc => getBatchAccount(acc, getAccountProxy(acc))),
        unit: {
          token_id,
          size: sz / +token.price,
          leverage,
        },
        token: token,
      })
        .catch(async e => {
          logger.batch(
            'Ошибка при пересоздании юнита',
            {
              batch_name: name,
              batch_id: id,
              token_id,
              size: sz,
              leverage,
              error: String(e),
              e,
            },
            token_id.toString(),
          )

          await OrderService.accountsOrdersCancelApiOrdersCancelPost({
            requestBody: {
              accounts: batchAccounts.map(acc => getBatchAccount(acc, getAccountProxy(acc))),
              token_id,
            },
          })

          throw e
        })
        .finally(async () => {
          const unitRange = getUnitTimingRange(token_id)
          const unitRecreateTiming = getUnitTimingReacreate(token_id)
          setTimings(token_id, unitRecreateTiming, Date.now(), unitRange)
          setRecreatingUnits(prev => prev.filter(unit => unit !== token_id))
        })

      toast.promise(promise, {
        pending: `${name}: Re-creating unit with asset ${token_id}`,
        success: `${name}: Unit with asset ${token_id} re-created 👌`,
        error: `${name}: Error while re-creating unit with asset ${token_id} error 🤯`,
      })
    },
    [batchAccounts, lighterMarkets, getUnitTimingReacreate, fetchUserStates, setTimings, setRecreatingUnits],
  )

  const updateLoop = useCallback(() => {
    updatingRef.current = true
    const now = Date.now()

    if (
      closingUnits.length > 0 ||
      recreatingUnits.length > 0 ||
      creatingUnits.length > 0
    ) {
      updatingRef.current = false
      return
    }

    return fetchUserStates()
      .then((res: Array<AccountWithPositionsDto>) => {
        const units = transformAccountStatesToUnits(res)

        let alreadyRun = false;

        units.forEach((unit: Unit) => {
          const unitOpenedTiming = getUnitTimingOpened(unit.base_unit_info.token_id)
          const unitRecreateTiming = getUnitTimingReacreate(unit.base_unit_info.token_id)
          const unitRange = getUnitTimingRange(unit.base_unit_info.token_id)

          if (
            closingUnits.includes(unit.base_unit_info.token_id) ||
            recreatingUnits.includes(unit.base_unit_info.token_id) ||
            creatingUnits.includes(unit.base_unit_info.token_id) ||
            !unitOpenedTiming ||
            !unitRecreateTiming || 
            alreadyRun
          ) {
            return
          }

          const randomOffset = seedrandom(unitOpenedTiming.toString())() * (unitRange * 2) - unitRange
          const randomizedRecreateTiming = unitRecreateTiming + randomOffset

          setRandomRecreatingTimings(prev => ({
            ...prev,
            [unit.base_unit_info.token_id]: randomizedRecreateTiming,
          }))

          console.log('randomizedRecreateTiming', randomizedRecreateTiming / 60000)

          if (now - unitOpenedTiming >= randomizedRecreateTiming || unit.positions.length !== accountsProps.length) {
            logger.batch(
              'Автоматическое пересоздание юнита по таймингу',
              {
                batch_name: name,
                batch_id: id,
                token_id: unit.base_unit_info.token_id,
                time_since_opened: now - unitOpenedTiming,
                recreate_timing: unitRecreateTiming,
                positions_count: unit.positions.length,
                expected_positions: accountsProps.length,
              },
              unit.base_unit_info.token_id.toString(),
            )

            alreadyRun = true;

            recreateUnit({
              token_id: unit.base_unit_info.token_id,
              leverage: unit.base_unit_info.leverage,
              sz: unit.base_unit_info.size,
            })
          }
        })
      })
      .finally(() => {
        updatingRef.current = false
      })
  }, [accountsProps, fetchUserStates, closingUnits, recreatingUnits, creatingUnits, getUnitTimingOpened, getUnitTimingReacreate, recreateUnit, unitTimings])

  const fetchTradeData = useCallback(async () => {
    const accountsTradeData = await AccountService.accountsPointsApiAccountsPointsPost({
      requestBody: batchAccounts.map(acc => getBatchAccount(acc, getAccountProxy(acc))),
    })

    const tradeData = accountsTradeData.reduce((acc, account) => {
      return {
        ...acc,
        [account.address]: {
          points: +account.points,
          volume: +account.total_volume,
        }
      }
    }, {})

    setTradeData(tradeData)
  }, [batchAccounts, getAccountProxy])

  useEffect(() => {
    Promise.all([
      getUnitTimings(id).then(unitTimings => setUnitTimings(unitTimings)),
      fetchUserStates(),
      fetchTradeData(),
    ]).finally(() => {
      setInitialLoading(false)
    })

    const interval = setInterval(fetchTradeData, 1000 * 60 * 15)

    return () => {
      clearInterval(interval)
    }
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      if (updatingRef.current === true) {
        return
      }
      updateLoop()
    }, UPDATE_INTERVAL)

    return () => {
      clearInterval(interval)
    }
  }, [updateLoop])

  const createUnit = useCallback(
    async ({ token_id, sz, leverage, timing, range }: CreateUnitPayload) => {
      setCreatingUnits(prev => [...prev, token_id])
      setTimings(token_id, timing, Date.now(), range)

      logger.batch(
        'Создание юнита',
        {
          batch_name: name,
          batch_id: id,
          token_id,
          size: sz,
          leverage,
          timing,
          accounts_count: batchAccounts.length,
        },
        token_id.toString(),
      )

      const token = lighterMarkets!.find(t => t.market_id === token_id)!

      const dto: OrderCreateWithTokenDto = {
        accounts: batchAccounts.map(acc => getBatchAccount(acc, getAccountProxy(acc))),
        unit: {
          token_id,
          size: sz / +token.price,
          leverage,
        },
        token: token,
      }

      await Promise.all(
        batchAccounts.map(acc =>
          AccountService.accountLeverageApiAccountLeveragePost({
            requestBody: {
              account: { private_key: acc.private_key },
              leverage,
              token_id,
              proxy: getAccountProxy(acc),
            },
          }),
        ),
      )

      return OrderService.accountsOrdersV2ApiOrdersPost({
        requestBody: dto,
      })
        .then(() => {
          return checkPositionsOpened(dto)
        })
        .then(data => {
          logger.batch(
            'Юнит успешно создан',
            {
              batch_name: name,
              batch_id: id,
              token_id,
              size: sz,
              leverage,
            },
            token_id.toString(),
          )
          setAccountState(data)
        })
        .catch(e => {
          logger.batch('Ошибка при создании юнита, закрываем юнит', {
            batch_name: name,
            batch_id: id,
            token_id,
            size: sz,
            leverage,
            error: String(e),
            e
          }, token_id.toString())
          
          return OrderService.accountsOrdersCancelApiOrdersCancelPost({
            requestBody: {
              accounts: batchAccounts.map(acc => getBatchAccount(acc, getAccountProxy(acc))),
              token_id,
            },
          })
        })
        .finally(async () => {
          setTimings(token_id, timing, Date.now(), range)
          setCreatingUnits(prev => prev.filter(coin => coin !== token_id))
        })
    },
    [batchAccounts, lighterMarkets, fetchUserStates, setTimings, setCreatingUnits],
  )

  const closeUnit = useCallback(
    (unit: Unit) => {
      setClosingUnits(prev => [...prev, unit.base_unit_info.token_id])

      logger.batch(
        'Закрытие юнита',
        {
          batch_name: name,
          batch_id: id,
          token_id: unit.base_unit_info.token_id,
          size: unit.base_unit_info.size,
          leverage: unit.base_unit_info.leverage,
          accounts_count: batchAccounts.length,
        },
        unit.base_unit_info.token_id.toString(),
      )

      return OrderService.accountsOrdersCancelApiOrdersCancelPost({
        requestBody: {
          accounts: batchAccounts.map(acc => getBatchAccount(acc, getAccountProxy(acc))),
          token_id: unit.base_unit_info.token_id,
        },
      })
        .then(() => {
          logger.batch(
            'Юнит успешно закрыт',
            {
              batch_name: name,
              batch_id: id,
              token_id: unit.base_unit_info.token_id,
              size: unit.base_unit_info.size,
              leverage: unit.base_unit_info.leverage,
            },
            unit.base_unit_info.token_id.toString(),
          )
          return fetchUserStates()
        })
        .finally(async () => {
          setClosingUnits(prev => prev.filter(asset => asset !== unit.base_unit_info.token_id))
        })
    },
    [batchAccounts, fetchUserStates, setClosingUnits],
  )

  const [authorizingLighter, setAuthorizingLighter] = useState(false)

  const authLighter = async () => {
    setAuthorizingLighter(true)
    const data = await AccountService.accountsRefreshApiAccountsRefreshPost({
      requestBody: {
        accounts: batchAccounts.map(acc => ({
          account: { private_key: acc.private_key, public_address: acc.public_address },
        })),
        from_api_key_index: 52,
        to_api_key_index: 72,
      },
    })

    const interval = setInterval(() => {
      Promise.all(batchAccounts.map((acc) => AccountService.accountRefreshResultApiAccountsRefreshTaskIdGet({
        taskId: data[acc.private_key].id,
      }))).then(res => {
        if (res.every(r => r.is_completed)) {
          setAuthorizingLighter(false)
          clearInterval(interval)
        }

        if (res.some(r => r.created_at && new Date(r.created_at).valueOf() + 1800000 < Date.now())) {
          setAuthorizingLighter(false)
          clearInterval(interval)
        }
      })
    }, 30000)
  }

  return {
    batchAccounts,
    tradeData,
    units,
    balances,
    unitTimings,
    closingUnits,
    recreatingUnits,
    initialLoading,
    authorizingLighter,
    randomRecreatingTimings,
    getUnitTimingRange,
    authLighter,
    getUnitTimingOpened,
    getUnitTimingReacreate,
    setTimings,
    createUnit,
    closeUnit,
  }
}

const recreateRequest = async (requestBody: OrderCreateWithTokenDto) => {
  await OrderService.accountsOrdersCancelApiOrdersCancelPost({
    requestBody: {
      accounts: requestBody.accounts,
      token_id: requestBody.unit.token_id,
    },
  })

  await new Promise(res => setTimeout(res, 8000))

  await OrderService.accountsOrdersV2ApiOrdersPost({ requestBody }).then(() => checkPositionsOpened(requestBody))
}

const checkPositionsOpened = async (orderDto: OrderCreateDto) => {
  let retryCount = 10
  const retryInterval = 3000

  return new Promise<AccountWithPositionsDto[]>((res, rej) => {
    const interval = setInterval(() => {
      AccountService.accountsPositionsApiAccountsPositionsPost({
        requestBody: orderDto.accounts,
      }).then(data => {
        const positions = data.reduce((acc, account) => [...acc, ...account.positions], [] as PositionDto[])

        const isPositionsFullyOpened = positions.filter(pos => pos.market_id === orderDto.unit.token_id).length === orderDto.accounts.length
        if (isPositionsFullyOpened) {
          res(data)

          clearInterval(interval)

          return
        }

        if (!retryCount) {
          clearInterval(interval)
          rej()
        }

        retryCount--
      }).catch(() => {
       
      })
    }, retryInterval)
  })
}
