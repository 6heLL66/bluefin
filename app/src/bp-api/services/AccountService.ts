/* generated using openapi-typescript-codegen -- do not edit */

/* istanbul ignore file */

/* tslint:disable */

/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise'
import { OpenAPI } from '../core/OpenAPI'
import { request as __request } from '../core/request'
import type { AccountConvertDustPayload } from '../models/AccountConvertDustPayload'
import type { AccountSummary } from '../models/AccountSummary'
import type { MaxBorrowQuantity } from '../models/MaxBorrowQuantity'
import type { MaxOrderQuantity } from '../models/MaxOrderQuantity'
import type { MaxWithdrawalQuantity } from '../models/MaxWithdrawalQuantity'
import type { Side } from '../models/Side'
import type { UpdateAccountSettingsRequest } from '../models/UpdateAccountSettingsRequest'

export class AccountService {
  /**
   * Get account.
   * **Instruction:** `accountQuery`
   * @returns AccountSummary Success.
   * @throws ApiError
   */
  public static getAccount({
    xApiKey,
    xSignature,
    xTimestamp,
    xWindow,
  }: {
    /**
     * API key
     */
    xApiKey: string
    /**
     * Signature of the request
     */
    xSignature: string
    /**
     * Timestamp of the request in milliseconds
     */
    xTimestamp: number
    /**
     * Time the request is valid for in milliseconds (default `5000`, maximum `60000`)
     */
    xWindow?: number
  }): CancelablePromise<AccountSummary> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/api/v1/account',
      headers: {
        'X-API-KEY': xApiKey,
        'X-SIGNATURE': xSignature,
        'X-TIMESTAMP': xTimestamp,
        'X-WINDOW': xWindow,
      },
      errors: {
        400: `Bad request.`,
        500: `Internal server error.`,
      },
    })
  }
  /**
   * Update account.
   * Update account settings.
   *
   * **Instruction:** `accountUpdate`
   * @returns any Success.
   * @throws ApiError
   */
  public static updateAccountSettings({
    xApiKey,
    xSignature,
    xTimestamp,
    requestBody,
    xWindow,
  }: {
    /**
     * API key
     */
    xApiKey: string
    /**
     * Signature of the request
     */
    xSignature: string
    /**
     * Timestamp of the request in milliseconds
     */
    xTimestamp: number
    requestBody: UpdateAccountSettingsRequest
    /**
     * Time the request is valid for in milliseconds (default `5000`, maximum `60000`)
     */
    xWindow?: number
  }): CancelablePromise<any> {
    return __request(OpenAPI, {
      method: 'PATCH',
      url: '/api/v1/account',
      headers: {
        'X-API-KEY': xApiKey,
        'X-SIGNATURE': xSignature,
        'X-TIMESTAMP': xTimestamp,
        'X-WINDOW': xWindow,
      },
      body: requestBody,
      mediaType: 'application/json; charset=utf-8',
      errors: {
        400: `Bad request.`,
        401: `Unauthorized.`,
        500: `Internal server error.`,
        503: `System under maintenance.`,
      },
    })
  }
  /**
   * Convert a dust balance on an account.
   * Converts a dust balance to USDC. The balance (including lend) must be
   * less than the minimum quantity tradable on the spot order book.
   *
   * **Instruction:** `convertDust`
   * @returns any Success.
   * @throws ApiError
   */
  public static convertDust({
    xApiKey,
    xSignature,
    xTimestamp,
    requestBody,
    xWindow,
  }: {
    /**
     * API key
     */
    xApiKey: string
    /**
     * Signature of the request
     */
    xSignature: string
    /**
     * Timestamp of the request in milliseconds
     */
    xTimestamp: number
    requestBody: AccountConvertDustPayload
    /**
     * Time the request is valid for in milliseconds (default `5000`, maximum `60000`)
     */
    xWindow?: number
  }): CancelablePromise<any> {
    return __request(OpenAPI, {
      method: 'POST',
      url: '/api/v1/account/convertDust',
      headers: {
        'X-API-KEY': xApiKey,
        'X-SIGNATURE': xSignature,
        'X-TIMESTAMP': xTimestamp,
        'X-WINDOW': xWindow,
      },
      body: requestBody,
      mediaType: 'application/json; charset=utf-8',
      errors: {
        400: `Bad request.`,
        500: `Internal server error.`,
        503: `System under maintenance.`,
      },
    })
  }
  /**
   * Get max borrow quantity.
   * Retrieves the maxmimum quantity an account can borrow
   * for a given asset based on the accounts existing exposure
   * and margin requirements
   *
   * **Instruction:** `maxBorrowQuantity`
   * @returns MaxBorrowQuantity Success.
   * @throws ApiError
   */
  public static getMaxBorrowQuantity({
    symbol,
    xApiKey,
    xSignature,
    xTimestamp,
    xWindow,
  }: {
    /**
     * The asset to borrow.
     */
    symbol: string
    /**
     * API key
     */
    xApiKey?: string
    /**
     * Signature of the request
     */
    xSignature?: string
    /**
     * Timestamp of the request in milliseconds
     */
    xTimestamp?: number
    /**
     * Time the request is valid for in milliseconds (default `5000`, maximum `60000`)
     */
    xWindow?: number
  }): CancelablePromise<MaxBorrowQuantity> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/api/v1/account/limits/borrow',
      headers: {
        'X-API-KEY': xApiKey,
        'X-SIGNATURE': xSignature,
        'X-TIMESTAMP': xTimestamp,
        'X-WINDOW': xWindow,
      },
      query: {
        symbol: symbol,
      },
      errors: {
        400: `Bad request.`,
        500: `Internal server error.`,
        503: `Service unavailable.`,
      },
    })
  }
  /**
   * Get max order quantity.
   * Retrieves the maxmimum quantity an account can trade
   * for a given symbol based on the account's balances, existing exposure
   * and margin requirements.
   *
   * **Instruction:** `maxOrderQuantity`
   * @returns MaxOrderQuantity Success.
   * @throws ApiError
   */
  public static getMaxOrderQuantity({
    symbol,
    side,
    xApiKey,
    xSignature,
    xTimestamp,
    xWindow,
    price,
    reduceOnly,
    autoBorrow,
    autoBorrowRepay,
    autoLendRedeem,
  }: {
    /**
     * The market symbol to trade.
     */
    symbol: string
    /**
     * The side of the order.
     */
    side: Side
    /**
     * API key
     */
    xApiKey?: string
    /**
     * Signature of the request
     */
    xSignature?: string
    /**
     * Timestamp of the request in milliseconds
     */
    xTimestamp?: number
    /**
     * Time the request is valid for in milliseconds (default `5000`, maximum `60000`)
     */
    xWindow?: number
    /**
     * The limit price of the order. Not included for market orders.
     */
    price?: string
    /**
     * Whether the order is reduce only.
     */
    reduceOnly?: boolean
    /**
     * Whether the order uses auto borrow.
     */
    autoBorrow?: boolean
    /**
     * Whether the order uses auto borrow repay.
     */
    autoBorrowRepay?: boolean
    /**
     * Whether the order uses auto lend redeem.
     */
    autoLendRedeem?: boolean
  }): CancelablePromise<MaxOrderQuantity> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/api/v1/account/limits/order',
      headers: {
        'X-API-KEY': xApiKey,
        'X-SIGNATURE': xSignature,
        'X-TIMESTAMP': xTimestamp,
        'X-WINDOW': xWindow,
      },
      query: {
        symbol: symbol,
        side: side,
        price: price,
        reduceOnly: reduceOnly,
        autoBorrow: autoBorrow,
        autoBorrowRepay: autoBorrowRepay,
        autoLendRedeem: autoLendRedeem,
      },
      errors: {
        400: `Bad request.`,
        500: `Internal server error.`,
      },
    })
  }
  /**
   * Get max withdrawal quantity.
   * Retrieves the maxmimum quantity an account can withdraw
   * for a given asset based on the accounts existing exposure
   * and margin requirements
   * The response will include the maximum quantity that can be withdrawn
   * and whether the withdrawal is with auto borrow or auto lend redeem
   * enabled.
   *
   * **Instruction:** `maxWithdrawalQuantity`
   * @returns MaxWithdrawalQuantity Success.
   * @throws ApiError
   */
  public static getMaxWithdrawalQuantity({
    symbol,
    xApiKey,
    xSignature,
    xTimestamp,
    xWindow,
    autoBorrow,
    autoLendRedeem,
  }: {
    /**
     * The asset to withdraw.
     */
    symbol: string
    /**
     * API key
     */
    xApiKey?: string
    /**
     * Signature of the request
     */
    xSignature?: string
    /**
     * Timestamp of the request in milliseconds
     */
    xTimestamp?: number
    /**
     * Time the request is valid for in milliseconds (default `5000`, maximum `60000`)
     */
    xWindow?: number
    /**
     * Whether the withdrawal is with auto borrow.
     */
    autoBorrow?: boolean
    /**
     * Whether the withdrawal is with auto lend redeem.
     */
    autoLendRedeem?: boolean
  }): CancelablePromise<MaxWithdrawalQuantity> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/api/v1/account/limits/withdrawal',
      headers: {
        'X-API-KEY': xApiKey,
        'X-SIGNATURE': xSignature,
        'X-TIMESTAMP': xTimestamp,
        'X-WINDOW': xWindow,
      },
      query: {
        symbol: symbol,
        autoBorrow: autoBorrow,
        autoLendRedeem: autoLendRedeem,
      },
      errors: {
        400: `Bad request.`,
        500: `Internal server error.`,
      },
    })
  }
}
