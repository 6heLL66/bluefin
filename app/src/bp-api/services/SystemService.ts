/* generated using openapi-typescript-codegen -- do not edit */

/* istanbul ignore file */

/* tslint:disable */

/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise'
import { OpenAPI } from '../core/OpenAPI'
import { request as __request } from '../core/request'
import type { StatusAndMessage } from '../models/StatusAndMessage'
import type { WalletResponse } from '../models/WalletResponse'

export class SystemService {
  /**
   * Status.
   * Get the system status, and the status message, if any.
   * @returns StatusAndMessage Success.
   * @throws ApiError
   */
  public static getStatus(): CancelablePromise<StatusAndMessage> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/api/v1/status',
    })
  }
  /**
   * Ping.
   * Responds with `pong`.
   * @returns string
   * @throws ApiError
   */
  public static ping(): CancelablePromise<string> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/api/v1/ping',
    })
  }
  /**
   * Get system time.
   * Retrieves the current system time.
   * @returns string
   * @throws ApiError
   */
  public static getTime(): CancelablePromise<string> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/api/v1/time',
    })
  }
  /**
   * Get wallets.
   * Returns all configured blockchain wallets and their addresses.
   * @returns WalletResponse Success.
   * @throws ApiError
   */
  public static getWallets(): CancelablePromise<Array<WalletResponse>> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/api/v1/wallets',
    })
  }
}
