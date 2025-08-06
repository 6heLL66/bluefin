/* generated using openapi-typescript-codegen -- do not edit */

/* istanbul ignore file */

/* tslint:disable */

/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise'
import { OpenAPI } from '../core/OpenAPI'
import { request as __request } from '../core/request'
import type { AccountOrderCancelDto } from '../models/AccountOrderCancelDto'
import type { AccountOrderCreateDto } from '../models/AccountOrderCreateDto'
import type { AccountWithPositionsDto } from '../models/AccountWithPositionsDto'
import type { BatchAccountDto } from '../models/BatchAccountDto'

export class AccountOrdersService {
  /**
   * Create Account Order
   * @returns any Successful Response
   * @throws ApiError
   */
  public static createAccountOrderApiAccountOrdersPost({
    requestBody,
  }: {
    requestBody: AccountOrderCreateDto
  }): CancelablePromise<any> {
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
   * Cancel Account Order
   * @returns void
   * @throws ApiError
   */
  public static cancelAccountOrderApiAccountOrdersCancelPost({
    requestBody,
  }: {
    requestBody: AccountOrderCancelDto
  }): CancelablePromise<void> {
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
  /**
   * Account Positions
   * @returns AccountWithPositionsDto Successful Response
   * @throws ApiError
   */
  public static accountPositionsApiAccountPositionsPost({
    requestBody,
  }: {
    requestBody: BatchAccountDto
  }): CancelablePromise<AccountWithPositionsDto> {
    return __request(OpenAPI, {
      method: 'POST',
      url: '/api/account/positions',
      body: requestBody,
      mediaType: 'application/json',
      errors: {
        422: `Validation Error`,
      },
    })
  }
}
