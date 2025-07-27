/* generated using openapi-typescript-codegen -- do not edit */

/* istanbul ignore file */

/* tslint:disable */

/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise'
import { OpenAPI } from '../core/OpenAPI'
import { request as __request } from '../core/request'
import type { BorrowLendHistory } from '../models/BorrowLendHistory'
import type { BorrowLendMarket } from '../models/BorrowLendMarket'
import type { BorrowLendMarketHistoryInterval } from '../models/BorrowLendMarketHistoryInterval'

export class BorrowLendMarketsService {
  /**
   * Get borrow lend markets.
   * @returns BorrowLendMarket Success.
   * @throws ApiError
   */
  public static getBorrowLendMarkets(): CancelablePromise<
    Array<BorrowLendMarket>
  > {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/api/v1/borrowLend/markets',
      errors: {
        500: `Internal server error.`,
      },
    })
  }
  /**
   * Get borrow lend market history.
   * @returns BorrowLendHistory Success.
   * @throws ApiError
   */
  public static getBorrowLendMarketsHistory({
    interval,
    symbol,
  }: {
    /**
     * Filter for an interval.
     */
    interval: BorrowLendMarketHistoryInterval
    /**
     * Market symbol to query. If not set, all markets are returned.
     */
    symbol?: string
  }): CancelablePromise<Array<BorrowLendHistory>> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/api/v1/borrowLend/markets/history',
      query: {
        interval: interval,
        symbol: symbol,
      },
      errors: {
        500: `Internal server error.`,
      },
    })
  }
}
