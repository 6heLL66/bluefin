/* generated using openapi-typescript-codegen -- do not edit */

/* istanbul ignore file */

/* tslint:disable */

/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise'
import { OpenAPI } from '../core/OpenAPI'
import { request as __request } from '../core/request'
import type { AccountWithPositionsDto } from '../models/AccountWithPositionsDto'
import type { BatchAccountDto } from '../models/BatchAccountDto'
import type { RefreshDto } from '../models/RefreshDto'

export class AccountService {
  /**
   * Accounts Positions
   * @returns AccountWithPositionsDto Successful Response
   * @throws ApiError
   */
  public static accountsPositionsApiAccountsPositionsPost({
    requestBody,
  }: {
    requestBody: Array<BatchAccountDto>
  }): CancelablePromise<Array<AccountWithPositionsDto>> {
    return __request(OpenAPI, {
      method: 'POST',
      url: '/api/accounts/positions',
      body: requestBody,
      mediaType: 'application/json',
      errors: {
        422: `Validation Error`,
      },
    })
  }
  /**
   * Accounts Refresh
   * @returns void
   * @throws ApiError
   */
  public static accountsRefreshApiAccountsRefreshPost({
    requestBody,
  }: {
    requestBody: RefreshDto
  }): CancelablePromise<void> {
    return __request(OpenAPI, {
      method: 'POST',
      url: '/api/accounts/refresh',
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
