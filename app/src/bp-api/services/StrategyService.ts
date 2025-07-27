/* generated using openapi-typescript-codegen -- do not edit */

/* istanbul ignore file */

/* tslint:disable */

/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise'
import { OpenAPI } from '../core/OpenAPI'
import { request as __request } from '../core/request'
import type { MarketType } from '../models/MarketType'
import type { StrategyCancelAllPayload } from '../models/StrategyCancelAllPayload'
import type { StrategyCancelPayload } from '../models/StrategyCancelPayload'
import type { StrategyCreatePayload } from '../models/StrategyCreatePayload'
import type { StrategyType } from '../models/StrategyType'
import type { StrategyTypeEnum } from '../models/StrategyTypeEnum'

export class StrategyService {
  /**
   * Get open strategy.
   * Retrieves an open strategy from the engine. This only returns the
   * strategy if it is active (i.e. has not been completely filled,
   * cancelled by the user, or cancelled by the system).
   *
   * One of `strategyId` or `clientStrategyId` must be specified.
   *
   * **Instruction:** `strategyQuery`
   * @returns StrategyType Success.
   * @throws ApiError
   */
  public static getStrategy({
    symbol,
    xApiKey,
    xSignature,
    xTimestamp,
    xWindow,
    clientStrategyId,
    strategyId,
  }: {
    /**
     * Market symbol for the strategy.
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
     * Client ID of the strategy.
     */
    clientStrategyId?: number
    /**
     * ID of the strategy.
     */
    strategyId?: string
  }): CancelablePromise<StrategyType> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/api/v1/strategy',
      headers: {
        'X-API-KEY': xApiKey,
        'X-SIGNATURE': xSignature,
        'X-TIMESTAMP': xTimestamp,
        'X-WINDOW': xWindow,
      },
      query: {
        clientStrategyId: clientStrategyId,
        strategyId: strategyId,
        symbol: symbol,
      },
      errors: {
        400: `Bad request.`,
        404: `Strategy not found.`,
        500: `Internal server error.`,
      },
    })
  }
  /**
   * Create strategy.
   * Submits a strategy to the engine for processing.
   *
   * **Instruction:** `strategyCreate`
   * @returns StrategyType Strategy created.
   * @throws ApiError
   */
  public static strategyCreate({
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
    requestBody: StrategyCreatePayload
    /**
     * Time the request is valid for in milliseconds (default `5000`, maximum `60000`)
     */
    xWindow?: number
  }): CancelablePromise<StrategyType> {
    return __request(OpenAPI, {
      method: 'POST',
      url: '/api/v1/strategy',
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
   * Cancel open strategy.
   * Cancels an open strategy currently being run.
   *
   * One of `strategyId` or `clientStrategyId` must be specified.
   *
   * **Instruction:** `strategyCancel`
   * @returns StrategyType Strategy cancelled.
   * @returns any Request accepted but not yet executed.
   * @throws ApiError
   */
  public static cancelStrategy({
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
    requestBody: StrategyCancelPayload
    /**
     * Time the request is valid for in milliseconds (default `5000`, maximum `60000`)
     */
    xWindow?: number
  }): CancelablePromise<StrategyType | any> {
    return __request(OpenAPI, {
      method: 'DELETE',
      url: '/api/v1/strategy',
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
   * Get open strategies.
   * Retrieves all open strategies. If a symbol is provided, only open
   * strategies for that market will be returned, otherwise all open
   * strategies are returned.
   *
   * **Instruction:** `strategyQueryAll`
   * @returns StrategyType Success.
   * @throws ApiError
   */
  public static getOpenStrategies({
    xApiKey,
    xSignature,
    xTimestamp,
    xWindow,
    marketType,
    strategyType,
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
     * The market for the strategies (SPOT or PERP).
     */
    marketType?: MarketType
    /**
     * The strategy type.
     */
    strategyType?: StrategyTypeEnum
    /**
     * The symbol of the market for the strategies.
     */
    symbol?: string
  }): CancelablePromise<Array<StrategyType>> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/api/v1/strategies',
      headers: {
        'X-API-KEY': xApiKey,
        'X-SIGNATURE': xSignature,
        'X-TIMESTAMP': xTimestamp,
        'X-WINDOW': xWindow,
      },
      query: {
        marketType: marketType,
        strategyType: strategyType,
        symbol: symbol,
      },
      errors: {
        400: `Bad request.`,
        500: `Internal Server Error.`,
      },
    })
  }
  /**
   * Cancel open strategies.
   * Cancels all open strategies on the specified market.
   *
   * **Instruction:** `strategyCancelAll`
   * @returns StrategyType Success.
   * @returns any Request accepted but not yet executed.
   * @throws ApiError
   */
  public static cancelOpenStrategies({
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
    requestBody: StrategyCancelAllPayload
    /**
     * Time the request is valid for in milliseconds (default `5000`, maximum `60000`)
     */
    xWindow?: number
  }): CancelablePromise<Array<StrategyType> | any> {
    return __request(OpenAPI, {
      method: 'DELETE',
      url: '/api/v1/strategies',
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
