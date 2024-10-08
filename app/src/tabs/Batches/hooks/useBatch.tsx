import { invoke } from '@tauri-apps/api'
import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { toast } from 'react-toastify'

import { BLUEFIN_API } from '../../../bluefin-api'
import { GlobalContext, db } from '../../../context'
import { Account, AccountState, Unit } from '../../../types'
import {
  getBatchAccount,
  transformAccountStatesToUnits,
  withTimeout,
} from '../../../utils'

interface Props {
  accounts: string[]
  id: string
  smartBalanceUsage: boolean
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

const UPDATE_INTERVAL = 2500

export const useBatch = ({
  accounts: accountsProps,
  id,
  name,
  smartBalanceUsage,
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

  const [accountStates, setAccountState] = useState<
    Record<string, AccountState>
  >({})

  const [unitTimings, setUnitTimings] = useState<
    Record<string, { openedTiming: number; recreateTiming: number }>
  >({})

  const [unitSizes, setUnitSizes] = useState<Record<string, number>>({})

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

  const getUnitSize = useCallback(
    (asset: string): number => {
      return unitSizes[asset as keyof typeof unitTimings]
    },
    [unitSizes],
  )

  const getDecimals = useCallback((asset: string): Promise<number> => {
    return invoke<number>('get_asset_sz_decimals', {
      batchAccount: getBatchAccount(
        batchAccounts[0],
        getAccountProxy(batchAccounts[0]),
      ),
      asset,
    }).catch(() => {
      toast(
        `${asset}: Error while getting sz_decimals. Set 0 as sz_decimals 🤯`,
        { type: 'error' },
      )

      return 0
    })
  }, [])

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

  const fetchUserStates = useCallback((): Promise<AccountState[]> => {
    return withTimeout<AccountState[]>(() =>
      invoke<AccountState[]>('get_unit_user_states', {
        accounts: batchAccounts.map(acc =>
          getBatchAccount(acc, getAccountProxy(acc)),
        ),
      }),
    ).then((res: AccountState[]) => {
      setAccountState(
        batchAccounts.reduce((acc, account, index) => {
          return { ...acc, [account.private_key]: res[index] }
        }, {}),
      )

      setBalances(
        batchAccounts.reduce((acc, account, index) => {
          return {
            ...acc,
            [account.private_key]: {
              all: Number(res[index].marginSummary.accountValue).toFixed(2),
              free: (
                +res[index].marginSummary.accountValue -
                +res[index].marginSummary.totalMarginUsed
              ).toFixed(2),
            },
          }
        }, {}),
      )

      return res
    }) as Promise<[AccountState, AccountState]>
  }, [batchAccounts])

  const recreateUnit = useCallback(
    async ({ asset, leverage }: Omit<CreateUnitPayload, 'timing' | 'sz'>) => {
      setRecreatingUnits(prev => [...prev, asset])

      const sz_decimals = await getDecimals(asset)

      const promise = invoke('close_and_create_same_unit', {
        batchAccounts: batchAccounts.map(acc =>
          getBatchAccount(acc, getAccountProxy(acc)),
        ),
        unit: {
          asset,
          sz: getUnitSize(asset),
          smart_balance_usage: smartBalanceUsage,
          leverage,
          sz_decimals,
        },
      }).finally(async () => {
        const unitRecreateTiming = getUnitTimingReacreate(asset)
        setTimings(asset, unitRecreateTiming, Date.now())
        await fetchUserStates()
        setRecreatingUnits(prev => prev.filter(unit => unit !== asset))
      })

      toast.promise(promise, {
        pending: `${name}: Re-creating unit with asset ${asset}`,
        success: `${name}: Unit with asset ${asset} re-created 👌`,
        error: `${name}: Error while re-creating unit with asset ${asset} error 🤯`,
      })
    },
    [
      smartBalanceUsage,
      batchAccounts,
      getUnitTimingReacreate,
      fetchUserStates,
      setTimings,
      getUnitSize,
      setRecreatingUnits,
    ],
  )

  const updateLoop = useCallback(() => {
    updatingRef.current = true
    const now = Date.now()
    return fetchUserStates()
      .then((res: AccountState[]) => {
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
            })
          }
        })
      })
      .finally(() => {
        updatingRef.current = false
      })
  }, [
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
      getUnitSizes().then(unitSizes => setUnitSizes(unitSizes)),
      fetchUserStates(),
    ]).finally(() => {
      setInitialLoading(false)
    })
  }, [])

  const setUnitSize = useCallback(
    (asset: string, size: number) => {
      setUnitSizes(prev => ({ ...prev, [asset]: size }))
      return db.setUnitInitSize(id, asset, size)
    },
    [id],
  )

  const getUnitSizes = useCallback(() => {
    return db.getUnitSizes(id)
  }, [id])

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

      await setUnitSize(asset, sz)

      return BLUEFIN_API.openUnit({
        batchAccounts: batchAccounts.map(acc =>
          getBatchAccount(acc, getAccountProxy(acc)),
        ),
        unit: {
          asset,
          sz,
          leverage,
          smart_balance_usage: smartBalanceUsage,
        },
      }).finally(async () => {
        setTimings(asset, timing, Date.now())
        setCreatingUnits(prev => prev.filter(coin => coin !== asset))
      })
    },
    [
      smartBalanceUsage,
      batchAccounts,
      fetchUserStates,
      setTimings,
      setUnitSize,
      setCreatingUnits,
    ],
  )

  const closeUnit = useCallback(
    (unit: Unit) => {
      setClosingUnits(prev => [...prev, unit.base_unit_info.asset])

      return invoke('close_unit', {
        batchAccounts: batchAccounts.map(acc =>
          getBatchAccount(acc, getAccountProxy(acc)),
        ),
        asset: unit.base_unit_info.asset,
      }).finally(async () => {
        await fetchUserStates()
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
