/* generated using openapi-typescript-codegen -- do not edit */

/* istanbul ignore file */

/* tslint:disable */

/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise'
import { OpenAPI } from '../core/OpenAPI'
import { request as __request } from '../core/request'
import type { BorrowLendExecutePayload } from '../models/BorrowLendExecutePayload'
import type { BorrowLendPositionWithMargin } from '../models/BorrowLendPositionWithMargin'

export class BorrowLendService {
  /**
   * Get borrow lend positions.
   * Retrieves all the open borrow lending positions for the account.
   *
   * **Instruction:** `borrowLendPositionQuery`
   * @returns BorrowLendPositionWithMargin Success.
   * @throws ApiError
   */
  public static getBorrowLendPositions({
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
  }): CancelablePromise<Array<BorrowLendPositionWithMargin>> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/api/v1/borrowLend/positions',
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
   * Execute borrow lend.
   * **Instruction:** `borrowLendExecute`
   * @returns any Success.
   * @throws ApiError
   */
  public static executeBorrowLend({
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
    requestBody: BorrowLendExecutePayload
    /**
     * Time the request is valid for in milliseconds (default `5000`, maximum `60000`)
     */
    xWindow?: number
  }): CancelablePromise<any> {
    return __request(OpenAPI, {
      method: 'POST',
      url: '/api/v1/borrowLend',
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
