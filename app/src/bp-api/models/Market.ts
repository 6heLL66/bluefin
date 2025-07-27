/* generated using openapi-typescript-codegen -- do not edit */

/* istanbul ignore file */

/* tslint:disable */

/* eslint-disable */
import type { Asset } from './Asset'
import type { MarketType } from './MarketType'
import type { OrderBookFilters } from './OrderBookFilters'
import type { OrderBookState } from './OrderBookState'
import type { PositionImfFunction } from './PositionImfFunction'

export type Market = {
  /**
   * Symbol of the market, e.g. ETH_USDC
   */
  symbol: string
  /**
   * The base asset of the market.
   */
  baseSymbol: Asset
  /**
   * The quote asset of the market.
   */
  quoteSymbol: Asset
  /**
   * The type of the market.
   */
  marketType: MarketType
  /**
   * Price, lot and leverage rules.
   */
  filters: OrderBookFilters
  /**
   * IMF function.
   */
  imfFunction?: PositionImfFunction
  /**
   * MMF function.
   */
  mmfFunction?: PositionImfFunction
  /**
   * Funding interval for perpetuals in milliseconds.
   */
  fundingInterval?: number
  /**
   * Funding rate upper bound for perpetual markets. In basis points. E.g. 10
   * = 10bps
   */
  fundingRateUpperBound?: string
  /**
   * Funding rate lower bound for perpetual markets. In basis points. E.g.
   * -10 = -10bps
   */
  fundingRateLowerBound?: string
  /**
   * Maximum open interest limit for the market if the market is a future.
   */
  openInterestLimit?: string
  /**
   * The order book state.
   */
  orderBookState: OrderBookState
  /**
   * Market created at time.
   */
  createdAt: string
}
