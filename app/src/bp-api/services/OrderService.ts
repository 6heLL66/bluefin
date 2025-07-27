/* generated using openapi-typescript-codegen -- do not edit */

/* istanbul ignore file */

/* tslint:disable */

/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise'
import { OpenAPI } from '../core/OpenAPI'
import { request as __request } from '../core/request'
import type { BatchCommandOrderResult } from '../models/BatchCommandOrderResult'
import type { MarketType } from '../models/MarketType'
import type { OrderCancelAllPayload } from '../models/OrderCancelAllPayload'
import type { OrderCancelPayload } from '../models/OrderCancelPayload'
import type { OrderExecutePayload } from '../models/OrderExecutePayload'
import type { OrderType } from '../models/OrderType'

export class OrderService {
  /**
   * Get open order.
   * Retrieves an open order from the order book. This only returns the order
   * if it is resting on the order book (i.e. has not been completely filled,
   * expired, or cancelled).
   *
   * One of `orderId` or `clientId` must be specified. If both are specified
   * then the request will be rejected.
   *
   * **Instruction:** `orderQuery`
   * @returns OrderType Success.
   * @throws ApiError
   */
  public static getOrder({
    symbol,
    xApiKey,
    xSignature,
    xTimestamp,
    xWindow,
    clientId,
    orderId,
  }: {
    /**
     * Market symbol for the order.
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
     * Client ID of the order.
     */
    clientId?: number
    /**
     * ID of the order.
     */
    orderId?: string
  }): CancelablePromise<OrderType> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/api/v1/order',
      headers: {
        'X-API-KEY': xApiKey,
        'X-SIGNATURE': xSignature,
        'X-TIMESTAMP': xTimestamp,
        'X-WINDOW': xWindow,
      },
      query: {
        clientId: clientId,
        orderId: orderId,
        symbol: symbol,
      },
      errors: {
        400: `Bad request.`,
        404: `Order not found.`,
        500: `Internal server error`,
      },
    })
  }
  /**
   * Execute order.
   * Submits an order to the matching engine for execution.
   *
   * **Instruction:** `orderExecute`
   * @returns OrderType Order executed.
   * @throws ApiError
   */
  public static executeOrder({
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
    requestBody: OrderExecutePayload
    /**
     * Time the request is valid for in milliseconds (default `5000`, maximum `60000`)
     */
    xWindow?: number
  }): CancelablePromise<OrderType> {
    return __request(OpenAPI, {
      method: 'POST',
      url: '/api/v1/order',
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
   * Cancel open order.
   * Cancels an open order from the order book.
   *
   * One of `orderId` or `clientId` must be specified. If both are specified
   * then the request will be rejected.
   *
   * **Instruction:** `orderCancel`
   * @returns OrderType Order cancelled.
   * @returns any Request accepted but not yet executed.
   * @throws ApiError
   */
  public static cancelOrder({
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
    requestBody: OrderCancelPayload
    /**
     * Time the request is valid for in milliseconds (default `5000`, maximum `60000`)
     */
    xWindow?: number
  }): CancelablePromise<OrderType | any> {
    return __request(OpenAPI, {
      method: 'DELETE',
      url: '/api/v1/order',
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
   * Execute orders.
   * Submits a set of orders to the matching engine for execution in a batch.
   *
   * **Batch commands instruction:** `orderExecute`
   * @returns BatchCommandOrderResult Batch orders executed.
   * @throws ApiError
   */
  public static executeOrderBatch({
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
    requestBody: Array<OrderExecutePayload>
    /**
     * Time the request is valid for in milliseconds (default `5000`, maximum `60000`)
     */
    xWindow?: number
  }): CancelablePromise<Array<BatchCommandOrderResult>> {
    return __request(OpenAPI, {
      method: 'POST',
      url: '/api/v1/orders',
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
   * Get open orders.
   * Retrieves all open orders. If a symbol is provided, only open orders for
   * that market will be returned, otherwise all open orders are
   * returned.
   *
   * **Instruction:** `orderQueryAll`
   * @returns OrderType Success.
   * @throws ApiError
   */
  public static getOpenOrders({
    xApiKey,
    xSignature,
    xTimestamp,
    xWindow,
    marketType,
    symbol,
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
     * The market for the orders (SPOT or PERP).
     */
    marketType?: MarketType
    /**
     * The symbol of the market for the orders.
     */
    symbol?: string
  }): CancelablePromise<Array<OrderType>> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/api/v1/orders',
      headers: {
        'X-API-KEY': xApiKey,
        'X-SIGNATURE': xSignature,
        'X-TIMESTAMP': xTimestamp,
        'X-WINDOW': xWindow,
      },
      query: {
        marketType: marketType,
        symbol: symbol,
      },
      errors: {
        400: `Bad request.`,
        500: `Internal Server Error.`,
      },
    })
  }
  /**
   * Cancel open orders.
   * Cancels all open orders on the specified market.
   *
   * **Instruction:** `orderCancelAll`
   * @returns OrderType Success.
   * @returns any Request accepted but not yet executed.
   * @throws ApiError
   */
  public static cancelOpenOrders({
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
    requestBody: OrderCancelAllPayload
    /**
     * Time the request is valid for in milliseconds (default `5000`, maximum `60000`)
     */
    xWindow?: number
  }): CancelablePromise<Array<OrderType> | any> {
    return __request(OpenAPI, {
      method: 'DELETE',
      url: '/api/v1/orders',
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
}
