import {
  Session,
  SupabaseClient,
  User,
  WeakPassword,
  createClient,
} from '@supabase/supabase-js'
import { v4 as uuidv4 } from 'uuid'

import { Account, Batch, LogEntry, LogRow, Proxy, Trader, TraderOrder } from '../types'
import { formatLogs } from '../utils'

if (
  !import.meta.env.VITE_SUPABASE_PROJECT_URL ||
  !import.meta.env.VITE_SUPABASE_ANON_KEY
) {
  throw new Error('Add .env variables')
}

export class SUPABASE_DB {
  client: SupabaseClient
  unitTimingChanges: Record<
    string,
    { openedTiming: number; recreateTiming: number }
  >
  unitTimingTimeoutId: NodeJS.Timeout | null
  unitSizesChanges: Record<string, number>
  unitSizesTimeoutId: NodeJS.Timeout | null
  auth: {
    user: User
    session: Session
    weakPassword?: WeakPassword
  } | null

  constructor() {
    this.client = createClient(
      import.meta.env.VITE_SUPABASE_PROJECT_URL,
      import.meta.env.VITE_SUPABASE_ANON_KEY,
    )

    this.unitTimingChanges = {}
    this.unitTimingTimeoutId = null

    this.unitSizesChanges = {}
    this.unitSizesTimeoutId = null

    this.auth = null
  }

  public isAuth = () => {
    return Boolean(this.auth)
  }

  public authenticate = async (email: string, password: string) => {
    return new Promise((resolve, reject) => {
      this.client.auth
        .signInWithPassword({
          email,
          password,
        })
        .then(res => {
          if (res.error) {
            reject(res.error.message)
            return
          }
          if (res.data.user && res.data.session) {
            localStorage.setItem('email', email)
            localStorage.setItem('password', password)
            this.auth = res.data
          }

          resolve(res)
        })
        .finally(() => {
          reject('')
        })
    })
  }

  public logout = () => {
    localStorage.removeItem('email')
    localStorage.removeItem('password')

    this.auth = null
    this.client.auth.signOut()
  }

  public addAccount = async (account: Account) => {
    if (!this.auth) {
      throw new Error('401')
    }

    return this.client
      .from('accounts')
      .insert({ ...account, user_id: this.auth.user.id })
  }

  public editAccount = async (accountId: string, data: Partial<Account>) => {
    if (!this.auth) {
      throw new Error('401')
    }

    const batches = await this.client
      .from('batches')
      .select()
      .filter(
        'accounts',
        'ov',
        `{${[accountId].map(id => `"${id}"`).join(',')}}`,
      )

    if (batches.data?.length) {
      return new Promise((_, rej) => {
        rej('Account exists in batch, so it can not be edited')
      })
    }

    return this.client.from('accounts').update(data).eq('id', accountId)
  }

  public addAccountWithProxy = async (account: Account, proxy: Proxy) => {
    if (!this.auth) {
      throw new Error('401')
    }

    const id = uuidv4()
    await this.client
      .from('proxies')
      .insert<Proxy>({ ...proxy, id, user_id: this.auth.user.id })
    return this.client
      .from('accounts')
      .insert({ ...account, proxy_id: id, user_id: this.auth.user.id })
  }

  public removeAccounts = async (accountIds: string[]) => {
    const batches = await this.client
      .from('batches')
      .select()
      .filter(
        'accounts',
        'ov',
        `{${accountIds.map(id => `"${id}"`).join(',')}}`,
      )

    if (batches.data?.length) {
      return new Promise((_, rej) => {
        rej('Some of accounts exists in batch, so they can not be deleted')
      })
    }

    return this.client.from('accounts').delete().in('id', accountIds)
  }

  public addProxy = (proxy: Proxy) => {
    if (!this.auth) {
      throw new Error('401')
    }

    return this.client
      .from('proxies')
      .insert<Proxy>({ ...proxy, user_id: this.auth.user.id })
  }

  public removeProxies = (proxyIds: string[]) => {
    return this.client.from('proxies').delete().in('id', proxyIds)
  }

  public getAccounts = async (): Promise<Account[]> => {
    const { data } = await this.client
      .from('accounts')
      .select<string, Account>()
    return data ?? []
  }

  public getProxies = async (): Promise<Proxy[]> => {
    const { data } = await this.client.from('proxies').select<string, Proxy>()
    return data ?? []
  }

  public connectProxyToAccounts = async (
    accountIds: string[],
    proxyId: string,
  ) => {
    return this.client
      .from('accounts')
      .update({ proxy_id: proxyId ?? null })
      .in('id', accountIds)
  }

  public getBatches = async (): Promise<Batch[]> => {
    const { data } = await this.client.from('batches').select<string, Batch>()
    return data ?? []
  }

  public getTraders = async (): Promise<Trader[]> => {
    const { data } = await this.client.from('traders').select<string, Trader>()
    return data ?? []
  }

  public updateTrader = async (
    public_address: string,
    trader: Partial<Trader>,
  ) => {
    return this.client
      .from('traders')
      .update({ ...trader })
      .eq('public_adress', public_address)
  }

  public removeTrader = async (public_address: string) => {
    return this.client
      .from('traders')
      .delete()
      .eq('public_address', public_address)
  }

  public createTrader = async ({ name, public_address }: Trader) => {
    if (!this.auth) {
      throw new Error('401')
    }

    return this.client.from('traders').insert({
      name,
      public_address,
      user_id: this.auth.user.id,
    })
  }

  public getTraderOrders = async (
    public_address: string,
  ): Promise<TraderOrder[]> => {
    const { data } = await this.client
      .from('trader_orders')
      .select<string, TraderOrder>()
      .order('opened_at', { ascending: false })
      .limit(30)
      .eq('trader_id', public_address)
    return data ?? []
  }

  public updateTraderOrder = async (
    id: number,
    order: Partial<TraderOrder>,
  ) => {
    return this.client
      .from('trader_orders')
      .update({ ...order })
      .eq('id', id)
  }

  public removeTraderOrder = async (id: number) => {
    return this.client.from('trader_orders').delete().eq('id', id)
  }

  public createTraderOrder = async (order: TraderOrder) => {
    if (!this.auth) {
      throw new Error('401')
    }

    return this.client.from('trader_orders').insert(order)
  }

  public updateBatch = async (id: string, smart_balance_usage: boolean) => {
    return this.client
      .from('batches')
      .update({ smart_balance_usage })
      .eq('id', id)
  }

  public createBatch = async (
    name: string,
    accounts: string[],
    timing: number,
  ) => {
    if (!this.auth) {
      throw new Error('401')
    }

    return this.client.from('batches').insert({
      name,
      accounts,
      constant_timing: timing,
      user_id: this.auth.user.id,
    })
  }

  public setUnitInitTiming = async (
    batchId: string,
    asset: string,
    recreateTiming: number,
    openedTiming: number,
  ) => {
    this.unitTimingChanges = {
      ...this.unitTimingChanges,
      [asset]: {
        openedTiming,
        recreateTiming,
      },
    }

    if (this.unitTimingTimeoutId) {
      clearTimeout(this.unitTimingTimeoutId)
    }

    this.unitTimingTimeoutId = setTimeout(() => {
      this.applyUnitTimingChanges(batchId)
    }, 100)
  }

  private applyUnitTimingChanges = async (batchId: string) => {
    const batch = await this.client
      .from('batches')
      .select<string, Batch>()
      .eq('id', batchId)

    if (!batch.data?.[0]) {
      throw new Error('setUnitRecreateTiming')
    }

    const prev_unit_timings = JSON.parse(batch.data[0].unit_timings)

    const unit_timings = JSON.stringify({
      ...prev_unit_timings,
      ...this.unitTimingChanges,
    })

    this.unitTimingChanges = {}

    return this.client
      .from('batches')
      .update({ unit_timings })
      .eq('id', batchId)
  }

  public getUnitTimings = async (batchId: string) => {
    const batch = await this.client
      .from('batches')
      .select<string, Batch>()
      .eq('id', batchId)

    if (!batch.data?.[0]) {
      throw new Error('setUnitRecreateTiming')
    }

    return JSON.parse(batch.data[0].unit_timings)
  }

  public setUnitInitSize = async (
    batchId: string,
    asset: string,
    size: number,
  ) => {
    this.unitSizesChanges = {
      ...this.unitSizesChanges,
      [asset]: size,
    }

    if (this.unitSizesTimeoutId) {
      clearTimeout(this.unitSizesTimeoutId)
    }

    this.unitSizesTimeoutId = setTimeout(() => {
      this.applyUnitSizesChanges(batchId)
    }, 100)
  }

  private applyUnitSizesChanges = async (batchId: string) => {
    const { data } = await this.client
      .from('batches')
      .select<string, { unit_sizes: string }>('unit_sizes')
      .eq('id', batchId)

    if (!data?.[0]) {
      throw new Error('setUnitSizes')
    }

    const prev_unit_sizes = JSON.parse(data[0].unit_sizes)

    const unit_sizes = JSON.stringify({
      ...prev_unit_sizes,
      ...this.unitSizesChanges,
    })

    this.unitSizesChanges = {}

    return this.client.from('batches').update({ unit_sizes }).eq('id', batchId)
  }

  public getUnitSizes = async (batchId: string) => {
    const { data } = await this.client
      .from('batches')
      .select<string, { unit_sizes: string }>('unit_sizes')
      .eq('id', batchId)

    if (!data?.[0]) {
      throw new Error('getUnitSizes')
    }

    return JSON.parse(data?.[0].unit_sizes)
  }

  public closeBatch = async (batchId: string) => {
    return this.client.from('batches').delete().eq('id', batchId)
  }

  public getLogs = async (start: string, end: string) => {
    return (
      await this.client
        .from('logs')
        .select<string, LogRow>('*')
        .gte('created_at', start)
        .lte('created_at', end)
        .order('created_at', { ascending: false })
    ).data
  }

  public insertLogs = async (logs: LogEntry[]) => {
    return this.client.from('logs').insert(formatLogs(logs, this.auth?.user.id))
  }
}
