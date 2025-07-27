/* generated using openapi-typescript-codegen -- do not edit */

/* istanbul ignore file */

/* tslint:disable */

/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise'
import { OpenAPI } from '../core/OpenAPI'
import { request as __request } from '../core/request'
import type { FuturePositionWithMargin } from '../models/FuturePositionWithMargin'

export class FuturesService {
  /**
   * Get open positions.
   * Retrieves account position summary.
   *
   * **Instruction:** `positionQuery`
   * @returns FuturePositionWithMargin Success.
   * @throws ApiError
   */
  public static getPositions({
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
  }): CancelablePromise<Array<FuturePositionWithMargin>> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/api/v1/position',
      headers: {
        'X-API-KEY': xApiKey,
        'X-SIGNATURE': xSignature,
        'X-TIMESTAMP': xTimestamp,
        'X-WINDOW': xWindow,
      },
      errors: {
        400: `Bad request.`,
        401: `Unauthorized.`,
        500: `Internal server error.`,
      },
    })
  }
}
