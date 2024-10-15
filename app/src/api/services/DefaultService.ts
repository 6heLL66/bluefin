/* generated using openapi-typescript-codegen -- do not edit */

/* istanbul ignore file */

/* tslint:disable */

/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise'
import { OpenAPI } from '../core/OpenAPI'
import { request as __request } from '../core/request'
import type { AccountDataDto } from '../models/AccountDataDto'
import type { BatchAccountDto } from '../models/BatchAccountDto'
import type { MarketDataDto } from '../models/MarketDataDto'
import type { OrderCancelDto } from '../models/OrderCancelDto'
import type { OrderCreateDto } from '../models/OrderCreateDto'

export class DefaultService {
  /**
   * Get Market Data
   * @returns MarketDataDto Successful Response
   * @throws ApiError
   */
  public static getMarketDataApiV1MarketGet(): CancelablePromise<
    Array<MarketDataDto>
  > {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/api/v1/market',
    })
  }
  /**
   * Get Accounts Data
   * @returns AccountDataDto Successful Response
   * @throws ApiError
   */
  public static getAccountsDataApiV1AccountsPost({
    requestBody,
  }: {
    requestBody: Array<BatchAccountDto>
  }): CancelablePromise<Array<AccountDataDto>> {
    return __request(OpenAPI, {
      method: 'POST',
      url: '/api/v1/accounts',
      body: requestBody,
      mediaType: 'application/json',
      errors: {
        422: `Validation Error`,
      },
    })
  }
  /**
   * Create Order
   * @returns any Successful Response
   * @throws ApiError
   */
  public static createOrderApiV1OrdersPost({
    requestBody,
  }: {
    requestBody: OrderCreateDto
  }): CancelablePromise<any> {
    return __request(OpenAPI, {
      method: 'POST',
      url: '/api/v1/orders/',
      body: requestBody,
      mediaType: 'application/json',
      errors: {
        422: `Validation Error`,
      },
    })
  }
  /**
   * Close Orders
   * @returns void
   * @throws ApiError
   */
  public static closeOrdersApiV1OrdersDelete({
    requestBody,
  }: {
    requestBody: OrderCancelDto
  }): CancelablePromise<void> {
    return __request(OpenAPI, {
      method: 'DELETE',
      url: '/api/v1/orders/',
      body: requestBody,
      mediaType: 'application/json',
      errors: {
        422: `Validation Error`,
      },
    })
  }
  /**
   * Health Check
   * @returns any Successful Response
   * @throws ApiError
   */
  public static healthCheckApiHealthcheckGet(): CancelablePromise<any> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/api/healthcheck',
    })
  }
}
