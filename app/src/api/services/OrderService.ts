/* generated using openapi-typescript-codegen -- do not edit */

/* istanbul ignore file */

/* tslint:disable */

/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise'
import { OpenAPI } from '../core/OpenAPI'
import { request as __request } from '../core/request'
import type { AccountOrderCancelDto } from '../models/AccountOrderCancelDto'
import type { AccountOrderCreateDto } from '../models/AccountOrderCreateDto'
import type { OrderCancelDto } from '../models/OrderCancelDto'
import type { OrderCreateDto } from '../models/OrderCreateDto'

export class OrderService {
  /**
   * Accounts Orders
   * @returns any Successful Response
   * @throws ApiError
   */
  public static accountsOrdersApiOrdersPost({ requestBody }: { requestBody: OrderCreateDto }): CancelablePromise<any> {
    return __request(OpenAPI, {
      method: 'POST',
      url: '/api/orders',
      body: requestBody,
      mediaType: 'application/json',
      errors: {
        422: `Validation Error`,
      },
    })
  }
  /**
   * Accounts Orders Cancel
   * @returns void
   * @throws ApiError
   */
  public static accountsOrdersCancelApiOrdersCancelPost({ requestBody }: { requestBody: OrderCancelDto }): CancelablePromise<void> {
    return __request(OpenAPI, {
      method: 'POST',
      url: '/api/orders/cancel',
      body: requestBody,
      mediaType: 'application/json',
      errors: {
        422: `Validation Error`,
      },
    })
  }
  /**
   * Account Order
   * @returns any Successful Response
   * @throws ApiError
   */
  public static accountOrderApiAccountOrdersPost({ requestBody }: { requestBody: AccountOrderCreateDto }): CancelablePromise<any> {
    return __request(OpenAPI, {
      method: 'POST',
      url: '/api/account/orders',
      body: requestBody,
      mediaType: 'application/json',
      errors: {
        422: `Validation Error`,
      },
    })
  }
  /**
   * Account Orders Cancel
   * @returns void
   * @throws ApiError
   */
  public static accountOrdersCancelApiAccountOrdersCancelPost({ requestBody }: { requestBody: AccountOrderCancelDto }): CancelablePromise<void> {
    return __request(OpenAPI, {
      method: 'POST',
      url: '/api/account/orders/cancel',
      body: requestBody,
      mediaType: 'application/json',
      errors: {
        422: `Validation Error`,
      },
    })
  }
}
