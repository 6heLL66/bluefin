import { BatchAccount } from '../types'

export type MarketData = {
  symbol: string
  lastPrice: bigint
}[]

export class BLUEFIN_API {
  public static openUnit({
    batchAccounts,
    unit,
  }: {
    batchAccounts: BatchAccount[]
    unit: {
      asset: string
      sz: number
      smart_balance_usage: boolean
      leverage: number
    }
  }) {
    return fetch('http://localhost:3001/open-unit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        batchAccounts,
        unit,
      }),
    }).then(r => r.json())
  }

  public static getMarketData(): Promise<MarketData> {
    return fetch('http://localhost:3001/market-data')
      .then(r => r.json())
      .then(res =>
        res.map((data: MarketData[0]) => ({
          ...data,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          lastPrice: Number(data.lastPrice) / 10 ** 18,
        })),
      )
  }
}
