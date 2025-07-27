/* generated using openapi-typescript-codegen -- do not edit */

/* istanbul ignore file */

/* tslint:disable */

/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise'
import { OpenAPI } from '../core/OpenAPI'
import { request as __request } from '../core/request'
import type { AccountWithdrawalPayload } from '../models/AccountWithdrawalPayload'
import type { Balance } from '../models/Balance'
import type { Blockchain } from '../models/Blockchain'
import type { Deposit } from '../models/Deposit'
import type { DepositAddress } from '../models/DepositAddress'
import type { MarginAccountSummary } from '../models/MarginAccountSummary'
import type { Withdrawal } from '../models/Withdrawal'

export class CapitalService {
  /**
   * Get balances.
   * Retrieves account balances and the state of the balances (locked or
   * available).
   *
   * Locked assets are those that are currently in an open order.
   *
   * **Instruction:** `balanceQuery`
   * @returns Balance Success.
   * @throws ApiError
   */
  public static getBalances({
    xApiKey,
    xSignature,
    xTimestamp,
    xWindow,
  }: {
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
  }): CancelablePromise<Record<string, Balance>> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/api/v1/capital',
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
   * Get collateral.
   * Retrieves collateral information for an account.
   *
   * **Instruction:** `collateralQuery`
   * @returns MarginAccountSummary Success.
   * @throws ApiError
   */
  public static getCollateral({
    xApiKey,
    xSignature,
    xTimestamp,
    xWindow,
    subaccountId,
  }: {
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
    subaccountId?: number
  }): CancelablePromise<MarginAccountSummary> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/api/v1/capital/collateral',
      headers: {
        'X-API-KEY': xApiKey,
        'X-SIGNATURE': xSignature,
        'X-TIMESTAMP': xTimestamp,
        'X-WINDOW': xWindow,
      },
      query: {
        subaccountId: subaccountId,
      },
      errors: {
        400: `Bad request.`,
        500: `Internal server error.`,
      },
    })
  }
  /**
   * Get deposits.
   * Retrieves deposit history.
   *
   * **Instruction:** `depositQueryAll`
   * @returns Deposit Success.
   * @throws ApiError
   */
  public static getDeposits({
    xApiKey,
    xSignature,
    xTimestamp,
    xWindow,
    from,
    to,
    limit,
    offset,
  }: {
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
     * Filter to minimum time (milliseconds).
     */
    from?: number
    /**
     * Filter to maximum time (milliseconds).
     */
    to?: number
    /**
     * Maximum number to return. Default `100`, maximum `1000`.
     */
    limit?: number
    /**
     * Offset. Default `0`.
     */
    offset?: number
  }): CancelablePromise<Array<Deposit>> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/wapi/v1/capital/deposits',
      headers: {
        'X-API-KEY': xApiKey,
        'X-SIGNATURE': xSignature,
        'X-TIMESTAMP': xTimestamp,
        'X-WINDOW': xWindow,
      },
      query: {
        from: from,
        to: to,
        limit: limit,
        offset: offset,
      },
      errors: {
        400: `Bad request.`,
        401: `Unauthorized.`,
        500: `Internal server error.`,
      },
    })
  }
  /**
   * Get deposit address.
   * Retrieves the user specific deposit address if the user were to deposit
   * on the specified blockchain.
   *
   * **Instruction:** `depositAddressQuery`
   * @returns DepositAddress Success.
   * @throws ApiError
   */
  public static getDepositAddress({
    blockchain,
    xApiKey,
    xSignature,
    xTimestamp,
    xWindow,
  }: {
    /**
     * Blockchain symbol to get a deposit address for.
     */
    blockchain: Blockchain
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
  }): CancelablePromise<DepositAddress> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/wapi/v1/capital/deposit/address',
      headers: {
        'X-API-KEY': xApiKey,
        'X-SIGNATURE': xSignature,
        'X-TIMESTAMP': xTimestamp,
        'X-WINDOW': xWindow,
      },
      query: {
        blockchain: blockchain,
      },
      errors: {
        400: `Bad request.`,
        401: `Unauthorized.`,
        409: `Conflict`,
        500: `Internal server error.`,
      },
    })
  }
  /**
   * Get withdrawals.
   * Retrieves withdrawal history.
   *
   * **Instruction:** `withdrawalQueryAll`
   * @returns Withdrawal Success.
   * @throws ApiError
   */
  public static getWithdrawals({
    xApiKey,
    xSignature,
    xTimestamp,
    xWindow,
    from,
    to,
    limit,
    offset,
  }: {
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
     * Filter to minimum time (milliseconds).
     */
    from?: number
    /**
     * Filter to maximum time (milliseconds).
     */
    to?: number
    /**
     * Maximum number to return. Default `100`, maximum `1000`.
     */
    limit?: number
    /**
     * Offset. Default `0`.
     */
    offset?: number
  }): CancelablePromise<Array<Withdrawal>> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/wapi/v1/capital/withdrawals',
      headers: {
        'X-API-KEY': xApiKey,
        'X-SIGNATURE': xSignature,
        'X-TIMESTAMP': xTimestamp,
        'X-WINDOW': xWindow,
      },
      query: {
        from: from,
        to: to,
        limit: limit,
        offset: offset,
      },
      errors: {
        400: `Bad request.`,
        401: `Unauthorized.`,
        500: `Internal Server Error.`,
      },
    })
  }
  /**
   * Request withdrawal.
   * Requests a withdrawal from the exchange.
   *
   * The `twoFactorToken` field is required if the withdrawal address is not
   * an address that is configured in the address book to not require
   * 2FA. These addresses can be configured [here](https://backpack.exchange/settings/withdrawal-addresses?twoFactorWithdrawalAddress=true).
   *
   * **Instruction:** `withdraw`
   * @returns Withdrawal Success.
   * @throws ApiError
   */
  public static requestWithdrawal({
    xApiKey,
    xTimestamp,
    xSignature,
    requestBody,
    xWindow,
  }: {
    /**
     * API key
     */
    xApiKey: string
    /**
     * Timestamp of the request in milliseconds
     */
    xTimestamp: number
    /**
     * Signature of the request
     */
    xSignature: string
    requestBody: AccountWithdrawalPayload
    /**
     * Time the request is valid for in milliseconds (default `5000`, maximum `60000`)
     */
    xWindow?: number
  }): CancelablePromise<Withdrawal> {
    return __request(OpenAPI, {
      method: 'POST',
      url: '/wapi/v1/capital/withdrawals',
      headers: {
        'X-API-KEY': xApiKey,
        'X-TIMESTAMP': xTimestamp,
        'X-WINDOW': xWindow,
        'X-SIGNATURE': xSignature,
      },
      body: requestBody,
      mediaType: 'application/json; charset=utf-8',
      errors: {
        400: `Bad request.`,
        401: `Unauthorized.`,
        403: `Forbidden.`,
        429: `Too many requests.`,
        500: `Internal server error.`,
        503: `System under maintenance.`,
      },
    })
  }
}
