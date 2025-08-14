/* generated using openapi-typescript-codegen -- do not edit */

/* istanbul ignore file */

/* tslint:disable */

/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise'
import { OpenAPI } from '../core/OpenAPI'
import { request as __request } from '../core/request'
import type { Depth } from '../models/Depth'
import type { FundingIntervalRate } from '../models/FundingIntervalRate'
import type { Kline } from '../models/Kline'
import type { KlineInterval } from '../models/KlineInterval'
import type { KlinePriceType } from '../models/KlinePriceType'
import type { MarkPrice } from '../models/MarkPrice'
import type { Market } from '../models/Market'
import type { OpenInterest } from '../models/OpenInterest'
import type { Ticker } from '../models/Ticker'
import type { TickerInterval } from '../models/TickerInterval'

export class MarketsService {
  /**
   * Get markets.
   * Retrieves all the markets that are supported by the exchange.
   * @returns Market Success.
   * @throws ApiError
   */
  public static getMarkets(): CancelablePromise<Array<Market>> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/api/v1/markets',
      errors: {
        500: `Internal server error.`,
      },
    })
  }
  /**
   * Get market.
   * Retrieves a market supported by the exchange.
   * @returns Market Success.
   * @throws ApiError
   */
  public static getMarket({ symbol }: { symbol: string }): CancelablePromise<Market> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/api/v1/market',
      query: {
        symbol: symbol,
      },
      errors: {
        400: `Bad request.`,
        500: `Internal server error.`,
      },
    })
  }
  /**
   * Get ticker.
   * Retrieves summarised statistics for the last 24 hours for the given
   * market symbol.
   * @returns Ticker Success.
   * @throws ApiError
   */
  public static getTicker({ symbol, interval }: { symbol: string; interval?: TickerInterval }): CancelablePromise<Ticker> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/api/v1/ticker',
      query: {
        symbol: symbol,
        interval: interval,
      },
      errors: {
        400: `Bad request.`,
        500: `Internal server error.`,
      },
    })
  }
  /**
   * Get tickers.
   * Retrieves summarised statistics for the last 24 hours for all market
   * symbols.
   * @returns Ticker Success.
   * @throws ApiError
   */
  public static getTickers({ interval }: { interval?: TickerInterval }): CancelablePromise<Array<Ticker>> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/api/v1/tickers',
      query: {
        interval: interval,
      },
      errors: {
        500: `Internal server error.`,
      },
    })
  }
  /**
   * Get depth.
   * Retrieves the order book depth for a given market symbol.
   * @returns Depth Success.
   * @throws ApiError
   */
  public static getDepth({ symbol }: { symbol: string }): CancelablePromise<Depth> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/api/v1/depth',
      query: {
        symbol: symbol,
      },
      errors: {
        400: `Bad request.`,
      },
    })
  }
  /**
   * Get K-lines.
   * Get K-Lines for the given market symbol, optionally providing a
   * `startTime` and `endTime`. If no `endTime` is provided, the current time
   * will be used.
   *
   * The `priceType` parameter can be used to specify the price type of the
   * kline. If not provided, the default is `LastPrice`.
   * @returns Kline Success.
   * @throws ApiError
   */
  public static getKlines({
    symbol,
    interval,
    startTime,
    endTime,
    priceType,
  }: {
    /**
     * Market symbol for the kline query, e.g. SOL_USDC.
     */
    symbol: string
    interval: KlineInterval
    /**
     * UTC timestamp in seconds.
     */
    startTime: number
    /**
     * UTC timestamp in seconds. Set to the current time if not provided.
     */
    endTime?: number
    /**
     * The price type of the K-line.
     */
    priceType?: KlinePriceType
  }): CancelablePromise<Array<Kline>> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/api/v1/klines',
      query: {
        symbol: symbol,
        interval: interval,
        startTime: startTime,
        endTime: endTime,
        priceType: priceType,
      },
      errors: {
        400: `Bad request.`,
        500: `Internal server error.`,
      },
    })
  }
  /**
   * Get all mark prices.
   * Retrieves mark price, index price and the funding rate for the current
   * interval for all symbols, or the symbol specified.
   * @returns MarkPrice Success.
   * @throws ApiError
   */
  public static getMarkPrices({ symbol }: { symbol?: string }): CancelablePromise<Array<MarkPrice>> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/api/v1/markPrices',
      query: {
        symbol: symbol,
      },
      errors: {
        400: `Bad request.`,
        500: `Internal server error.`,
      },
    })
  }
  /**
   * Get open interest.
   * Retrieves the current open interest for the given market.
   * If no market is provided, then all markets are returned.
   * @returns OpenInterest Success.
   * @throws ApiError
   */
  public static getOpenInterest({ symbol }: { symbol?: string }): CancelablePromise<Array<OpenInterest>> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/api/v1/openInterest',
      query: {
        symbol: symbol,
      },
      errors: {
        400: `Bad request.`,
        500: `Internal server error.`,
      },
    })
  }
  /**
   * Get funding interval rates.
   * Funding interval rate history for futures.
   * @returns FundingIntervalRate Success.
   * @throws ApiError
   */
  public static getFundingIntervalRates({
    symbol,
    limit,
    offset,
  }: {
    /**
     * Market symbol to query
     */
    symbol: string
    /**
     * Maximum number to return. Default `100`, maximum `1000`.
     */
    limit?: number
    /**
     * Offset for pagination. Default `0`.
     */
    offset?: number
  }): CancelablePromise<Array<FundingIntervalRate>> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/api/v1/fundingRates',
      query: {
        symbol: symbol,
        limit: limit,
        offset: offset,
      },
      errors: {
        400: `Bad request.`,
        500: `Internal server error.`,
      },
    })
  }
}
