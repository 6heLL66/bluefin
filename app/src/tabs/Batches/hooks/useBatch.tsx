import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { toast } from 'react-toastify'

import {
  AccountDataDto,
  DefaultService,
  MARKET_SYMBOLS,
  OrderCreateDto,
} from '../../../api'
import { GlobalContext } from '../../../context'
import { Account, Unit } from '../../../types'
import { getBatchAccount, transformAccountStatesToUnits } from '../../../utils'

interface Props {
  accounts: string[]
  id: string
  name: string
}

interface CreateUnitPayload {
  asset: string
  sz: number
  leverage: number
  timing: number
}

interface ReturnType {
  batchAccounts: Account[]
  units: Unit[]
  balances: Record<string, { free: string; all: string }>
  unitTimings: Record<string, { openedTiming: number; recreateTiming: number }>
  closingUnits: string[]
  recreatingUnits: string[]
  initialLoading: boolean
  setTimings: (
    asset: string,
    recreateTiming: number,
    openedTiming: number,
  ) => Promise<void>
  getUnitTimingOpened: (asset: string) => number
  getUnitTimingReacreate: (asset: string) => number
  createUnit: (payload: CreateUnitPayload) => Promise<unknown>
  closeUnit: (unit: Unit) => Promise<unknown>
}

const UPDATE_INTERVAL = 8000

export const useBatch = ({
  accounts: accountsProps,
  id,
  name,
}: Props): ReturnType => {
  const { accounts, getAccountProxy, getUnitTimings, setUnitInitTimings } =
    useContext(GlobalContext)

  const batchAccounts = useMemo(
    () =>
      accountsProps.map(a => {
        return accounts.find(b => b.id === a)!
      })!,
    [accountsProps],
  )

  const updatingRef = useRef(false)

  const [initialLoading, setInitialLoading] = useState(true)

  const [closingUnits, setClosingUnits] = useState<string[]>([])
  const [creatingUnits, setCreatingUnits] = useState<string[]>([])
  const [recreatingUnits, setRecreatingUnits] = useState<string[]>([])

  const [balances, setBalances] = useState<
    Record<string, { free: string; all: string }>
  >({})

  const [accountStates, setAccountState] = useState<AccountDataDto[]>([])

  const [unitTimings, setUnitTimings] = useState<
    Record<string, { openedTiming: number; recreateTiming: number }>
  >({})

  const units = useMemo(() => {
    return transformAccountStatesToUnits(Object.values(accountStates))
  }, [accountStates])

  const getUnitTimingOpened = useCallback(
    (asset: string): number => {
      return unitTimings[asset as keyof typeof unitTimings]?.openedTiming
    },
    [unitTimings],
  )

  const getUnitTimingReacreate = useCallback(
    (asset: string): number => {
      return unitTimings[asset as keyof typeof unitTimings]?.recreateTiming
    },
    [unitTimings],
  )

  const setTimings = useCallback(
    async (asset: string, recreateTiming: number, openedTiming: number) => {
      setUnitInitTimings(id, asset, recreateTiming, openedTiming)
      setUnitTimings(prev => ({
        ...prev,
        [asset]: {
          openedTiming,
          recreateTiming,
        },
      }))
    },
    [setUnitInitTimings, setUnitTimings],
  )

  const fetchUserStates = useCallback((): Promise<Array<AccountDataDto>> => {
    return DefaultService.getAccountsDataApiV1AccountsPost({
      requestBody: batchAccounts.map(acc =>
        getBatchAccount(acc, getAccountProxy(acc)),
      ),
    }).then(res => {
      console.log(res)

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
  }, [batchAccounts])

  const recreateUnit = useCallback(
    async ({ asset, leverage, sz }: Omit<CreateUnitPayload, 'timing'>) => {
      setRecreatingUnits(prev => [...prev, asset])

      const promise = recreateRequest({
        accounts: batchAccounts.map(acc =>
          getBatchAccount(acc, getAccountProxy(acc)),
        ),
        unit: {
          asset: asset as MARKET_SYMBOLS,
          size: sz,
          leverage,
        },
      })
        .catch(async (e) => {
          await DefaultService.closeOrdersApiV1OrdersDelete({
            requestBody: {
              accounts: batchAccounts.map(acc =>
                getBatchAccount(acc, getAccountProxy(acc)),
              ),
              unit: {
                asset: asset as MARKET_SYMBOLS
              }
            },
          })

          throw e
        })
        .finally(async () => {
          const unitRecreateTiming = getUnitTimingReacreate(asset)
          setTimings(asset, unitRecreateTiming, Date.now())
          setRecreatingUnits(prev => prev.filter(unit => unit !== asset))
        })

      toast.promise(promise, {
        pending: `${name}: Re-creating unit with asset ${asset}`,
        success: `${name}: Unit with asset ${asset} re-created 👌`,
        error: `${name}: Error while re-creating unit with asset ${asset} error 🤯`,
      })
    },
    [
      batchAccounts,
      getUnitTimingReacreate,
      fetchUserStates,
      setTimings,
      setRecreatingUnits,
    ],
  )

  const updateLoop = useCallback(() => {
    updatingRef.current = true
    const now = Date.now()
    return fetchUserStates()
      .then((res: Array<AccountDataDto>) => {
        const units = transformAccountStatesToUnits(res)

        units.forEach((unit: Unit) => {
          const unitOpenedTiming = getUnitTimingOpened(
            unit.base_unit_info.asset,
          )
          const unitRecreateTiming = getUnitTimingReacreate(
            unit.base_unit_info.asset,
          )

          if (
            closingUnits.includes(unit.base_unit_info.asset) ||
            recreatingUnits.includes(unit.base_unit_info.asset) ||
            creatingUnits.includes(unit.base_unit_info.asset) ||
            !unitOpenedTiming ||
            !unitRecreateTiming
          ) {
            return
          }

          if (
            now - unitOpenedTiming >= unitRecreateTiming ||
            unit.positions.length !== accountsProps.length
          ) {
            recreateUnit({
              asset: unit.base_unit_info.asset,
              leverage: unit.base_unit_info.leverage,
              sz: unit.base_unit_info.size,
            })
          }
        })
      })
      .finally(() => {
        updatingRef.current = false
      })
  }, [
    accountsProps,
    fetchUserStates,
    closingUnits,
    recreatingUnits,
    creatingUnits,
    getUnitTimingOpened,
    getUnitTimingReacreate,
    recreateUnit,
    unitTimings,
  ])

  useEffect(() => {
    Promise.all([
      getUnitTimings(id).then(unitTimings => setUnitTimings(unitTimings)),
      fetchUserStates(),
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
    async ({ asset, sz, leverage, timing }: CreateUnitPayload) => {
      setCreatingUnits(prev => [...prev, asset])

      return DefaultService.createOrderApiV1OrdersPost({
        requestBody: {
          accounts: batchAccounts.map(acc =>
            getBatchAccount(acc, getAccountProxy(acc)),
          ),
          unit: {
            asset: asset as MARKET_SYMBOLS,
            size: sz,
            leverage,
          },
        },
      }).finally(async () => {
        setTimings(asset, timing, Date.now())
        setCreatingUnits(prev => prev.filter(coin => coin !== asset))
      })
    },
    [batchAccounts, fetchUserStates, setTimings, setCreatingUnits],
  )

  const closeUnit = useCallback(
    (unit: Unit) => {
      setClosingUnits(prev => [...prev, unit.base_unit_info.asset])

      return DefaultService.closeOrdersApiV1OrdersDelete({
        requestBody: {
          accounts: batchAccounts.map(acc =>
            getBatchAccount(acc, getAccountProxy(acc)),
          ),
          unit: {
            asset: unit.base_unit_info.asset as MARKET_SYMBOLS,
          },
        },
      }).finally(async () => {
        setClosingUnits(prev =>
          prev.filter(asset => asset !== unit.base_unit_info.asset),
        )
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
  await DefaultService.closeOrdersApiV1OrdersDelete({ requestBody })

  await new Promise(res => setTimeout(res, 8000))

  await DefaultService.createOrderApiV1OrdersPost({ requestBody })
}
