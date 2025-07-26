/* generated using openapi-typescript-codegen -- do not edit */

/* istanbul ignore file */

/* tslint:disable */

/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise'
import { OpenAPI } from '../core/OpenAPI'
import { request as __request } from '../core/request'
import type { AccountWithPositionsDto } from '../models/AccountWithPositionsDto'
import type { BatchAccountDto } from '../models/BatchAccountDto'
import type { LighterAccountDto } from '../models/LighterAccountDto'

export class AccountService {
  /**
   * Account Positions
   * @returns AccountWithPositionsDto Successful Response
   * @throws ApiError
   */
  public static accountPositionsApiAccountsPositionsPost({
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
   * Account Retrieve
   * @returns LighterAccountDto Successful Response
   * @throws ApiError
   */
  public static accountRetrieveApiAccountsAddressGet({
    address,
  }: {
    address: string
  }): CancelablePromise<LighterAccountDto> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/api/accounts/{address}',
      path: {
        address: address,
      },
      errors: {
        422: `Validation Error`,
      },
    })
  }
}
