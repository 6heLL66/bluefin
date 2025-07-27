/* generated using openapi-typescript-codegen -- do not edit */

/* istanbul ignore file */

/* tslint:disable */

/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise'
import { OpenAPI } from '../core/OpenAPI'
import { request as __request } from '../core/request'
import type { Trade } from '../models/Trade'

export class TradesService {
  /**
   * Get recent trades.
   * Retrieve the most recent trades for a symbol. This is public data and
   * is not specific to any account.
   *
   * The maximum available recent trades is `1000`. If you need more than
   * `1000` trades use the historical trades endpoint.
   * @returns Trade Success.
   * @throws ApiError
   */
  public static getRecentTrades({
    symbol,
    limit,
  }: {
    /**
     * Market symbol to query fills for.
     */
    symbol: string
    /**
     * Limit the number of fills returned. Default `100`, maximum `1000`.
     */
    limit?: number
  }): CancelablePromise<Array<Trade>> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/api/v1/trades',
      query: {
        symbol: symbol,
        limit: limit,
      },
      errors: {
        400: `Bad request.`,
        500: `Internal Server Error.`,
      },
    })
  }
  /**
   * Get historical trades.
   * Retrieves all historical trades for the given symbol. This is public
   * trade data and is not specific to any account.
   * @returns Trade Success.
   * @throws ApiError
   */
  public static getHistoricalTrades({
    symbol,
    limit,
    offset,
  }: {
    symbol: string
    /**
     * Limit the number of trades returned. Default `100`, maximum `1000`.
     */
    limit?: number
    /**
     * Offset. Default `0`.
     */
    offset?: number
  }): CancelablePromise<Array<Trade>> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/api/v1/trades/history',
      query: {
        symbol: symbol,
        limit: limit,
        offset: offset,
      },
      errors: {
        400: `Bad request.`,
        500: `Internal Server Error.`,
      },
    })
  }
}
