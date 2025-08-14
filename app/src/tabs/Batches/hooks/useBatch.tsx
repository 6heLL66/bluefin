import { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { toast } from 'react-toastify'

import { AccountService, AccountWithPositionsDto, OrderCreateDto, OrderService, PositionDto } from '../../../api'
import { GlobalContext } from '../../../context'
import { useLogger } from '../../../hooks/useLogger'
import { Account, Unit } from '../../../types'
import { getBatchAccount, transformAccountStatesToUnits } from '../../../utils'

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
}

interface ReturnType {
  batchAccounts: Account[]
  units: Unit[]
  balances: Record<string, { free: string; all: string }>
  unitTimings: Record<string, { openedTiming: number; recreateTiming: number }>
  closingUnits: number[]
  recreatingUnits: number[]
  initialLoading: boolean
  setTimings: (token_id: number, recreateTiming: number, openedTiming: number) => Promise<void>
  getUnitTimingOpened: (token_id: number) => number
  getUnitTimingReacreate: (token_id: number) => number
  createUnit: (payload: CreateUnitPayload) => Promise<unknown>
  closeUnit: (unit: Unit) => Promise<unknown>
}

const UPDATE_INTERVAL = 20000

export const useBatch = ({ accounts: accountsProps, id, name }: Props): ReturnType => {
  const { accounts, getAccountProxy, getUnitTimings, setUnitInitTimings } = useContext(GlobalContext)

  const logger = useLogger()

  const batchAccounts = useMemo(
    () =>
      accountsProps.map(a => {
        return accounts.find(b => b.id == a)!
      })!,
    [accountsProps],
  )

  const updatingRef = useRef(false)

  const [initialLoading, setInitialLoading] = useState(true)

  const [closingUnits, setClosingUnits] = useState<number[]>([])
  const [creatingUnits, setCreatingUnits] = useState<number[]>([])
  const [recreatingUnits, setRecreatingUnits] = useState<number[]>([])

  const [balances, setBalances] = useState<Record<string, { free: string; all: string }>>({})

  const [accountStates, setAccountState] = useState<AccountWithPositionsDto[]>([])

  const [unitTimings, setUnitTimings] = useState<Record<string, { openedTiming: number; recreateTiming: number }>>({})

  const units = useMemo(() => {
    return transformAccountStatesToUnits(Object.values(accountStates))
  }, [accountStates])

  const getUnitTimingOpened = useCallback(
    (token_id: number): number => {
      return unitTimings[token_id.toString() as keyof typeof unitTimings]?.openedTiming
    },
    [unitTimings],
  )

  const getUnitTimingReacreate = useCallback(
    (token_id: number): number => {
      return unitTimings[token_id.toString() as keyof typeof unitTimings]?.recreateTiming
    },
    [unitTimings],
  )

  const setTimings = useCallback(
    async (token_id: number, recreateTiming: number, openedTiming: number) => {
      setUnitInitTimings(id, token_id.toString(), recreateTiming, openedTiming)
      setUnitTimings(prev => ({
        ...prev,
        [token_id.toString()]: {
          openedTiming,
          recreateTiming,
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
              [account.private_key]: {
                all: Number(account.balance).toFixed(2),
                free: Number(account.balance).toFixed(2),
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
        })
        throw error
      })
  }, [batchAccounts, logger])

  const recreateUnit = useCallback(
    async ({ token_id, leverage, sz }: Omit<CreateUnitPayload, 'timing'>) => {
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

      const promise = recreateRequest({
        accounts: batchAccounts.map(acc => getBatchAccount(acc, getAccountProxy(acc))),
        unit: {
          token_id,
          size: Math.ceil(sz),
          leverage,
        },
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
          const unitRecreateTiming = getUnitTimingReacreate(token_id)
          setTimings(token_id, unitRecreateTiming, Date.now())
          setRecreatingUnits(prev => prev.filter(unit => unit !== token_id))
        })

      toast.promise(promise, {
        pending: `${name}: Re-creating unit with asset ${token_id}`,
        success: `${name}: Unit with asset ${token_id} re-created 👌`,
        error: `${name}: Error while re-creating unit with asset ${token_id} error 🤯`,
      })
    },
    [batchAccounts, getUnitTimingReacreate, fetchUserStates, setTimings, setRecreatingUnits],
  )

  const updateLoop = useCallback(() => {
    updatingRef.current = true
    const now = Date.now()
    return fetchUserStates()
      .then((res: Array<AccountWithPositionsDto>) => {
        const units = transformAccountStatesToUnits(res)

        units.forEach((unit: Unit) => {
          const unitOpenedTiming = getUnitTimingOpened(unit.base_unit_info.token_id)
          const unitRecreateTiming = getUnitTimingReacreate(unit.base_unit_info.token_id)

          if (
            closingUnits.includes(unit.base_unit_info.token_id) ||
            recreatingUnits.includes(unit.base_unit_info.token_id) ||
            creatingUnits.includes(unit.base_unit_info.token_id) ||
            !unitOpenedTiming ||
            !unitRecreateTiming
          ) {
            return
          }

          if (now - unitOpenedTiming >= unitRecreateTiming || unit.positions.length !== accountsProps.length) {
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

  useEffect(() => {
    Promise.all([
      getUnitTimings(id).then(unitTimings => setUnitTimings(unitTimings)),
      fetchUserStates(),
      AccountService.accountsRefreshApiAccountsRefreshPost({
        requestBody: {
          accounts: batchAccounts.map(a => ({
            account: { private_key: a.private_key },
          })),
          from_api_key_index: 52,
          to_api_key_index: 52,
        },
      }),
    ]).finally(() => {
      setInitialLoading(false)
    })
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
    async ({ token_id, sz, leverage, timing }: CreateUnitPayload) => {
      setCreatingUnits(prev => [...prev, token_id])
      setTimings(token_id, timing, Date.now())

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

      const dto: OrderCreateDto = {
        accounts: batchAccounts.map(acc => getBatchAccount(acc, getAccountProxy(acc))),
        unit: {
          token_id,
          size: sz,
          leverage,
        },
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

      return OrderService.accountsOrdersApiOrdersPost({
        requestBody: dto,
      })
        .then(() => {
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
          return checkPositionsOpened(dto)
        })
        .then(data => setAccountState(data))
        .finally(async () => {
          setTimings(token_id, timing, Date.now())
          setCreatingUnits(prev => prev.filter(coin => coin !== token_id))
        })
    },
    [batchAccounts, fetchUserStates, setTimings, setCreatingUnits],
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

  return {
    batchAccounts,
    units,
    balances,
    unitTimings,
    closingUnits,
    recreatingUnits,
    initialLoading,
    getUnitTimingOpened,
    getUnitTimingReacreate,
    setTimings,
    createUnit,
    closeUnit,
  }
}

const recreateRequest = async (requestBody: OrderCreateDto) => {
  await OrderService.accountsOrdersCancelApiOrdersCancelPost({
    requestBody: {
      accounts: requestBody.accounts,
      token_id: requestBody.unit.token_id,
    },
  })

  await new Promise(res => setTimeout(res, 5000))

  await OrderService.accountsOrdersApiOrdersPost({ requestBody }).then(() => checkPositionsOpened(requestBody))
}

const checkPositionsOpened = async (orderDto: OrderCreateDto) => {
  let retryCount = 4
  const retryInterval = 1500

  return new Promise<AccountWithPositionsDto[]>((res, rej) => {
    const interval = setInterval(() => {
      AccountService.accountsPositionsApiAccountsPositionsPost({
        requestBody: orderDto.accounts,
      }).then(data => {
        const positions = data.reduce((acc, account) => [...acc, ...account.positions], [] as PositionDto[])

        const isPositionsFullyOpened = positions.filter(pos => pos.market_id === orderDto.unit.token_id).length === 4
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
      })
    }, retryInterval)
  })
}
