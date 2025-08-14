/* generated using openapi-typescript-codegen -- do not edit */

/* istanbul ignore file */

/* tslint:disable */

/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise'
import { OpenAPI } from '../core/OpenAPI'
import { request as __request } from '../core/request'
import type { AccountDto } from '../models/AccountDto'
import type { AccountWithPositionsDto } from '../models/AccountWithPositionsDto'
import type { BatchAccountDto } from '../models/BatchAccountDto'
import type { BatchAccountLeverageDto } from '../models/BatchAccountLeverageDto'
import type { RefreshDto } from '../models/RefreshDto'
import type { TaskDto } from '../models/TaskDto'
import type { TaskResultDto } from '../models/TaskResultDto'

export class AccountService {
  /**
   * Accounts List
   * @returns AccountDto Successful Response
   * @throws ApiError
   */
  public static accountsListApiAccountsPost({ requestBody }: { requestBody: Array<BatchAccountDto> }): CancelablePromise<Record<string, Array<AccountDto>>> {
    return __request(OpenAPI, {
      method: 'POST',
      url: '/api/accounts',
      body: requestBody,
      mediaType: 'application/json',
      errors: {
        422: `Validation Error`,
      },
    })
  }
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
   * @returns TaskDto Successful Response
   * @throws ApiError
   */
  public static accountsRefreshApiAccountsRefreshPost({ requestBody }: { requestBody: RefreshDto }): CancelablePromise<Record<string, TaskDto>> {
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
   * Account Refresh Result
   * @returns TaskResultDto Successful Response
   * @throws ApiError
   */
  public static accountRefreshResultApiAccountsRefreshTaskIdGet({ taskId }: { taskId: string }): CancelablePromise<TaskResultDto> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/api/accounts/refresh/{task_id}',
      path: {
        task_id: taskId,
      },
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
  public static accountPositionsApiAccountPositionsPost({ requestBody }: { requestBody: BatchAccountDto }): CancelablePromise<AccountWithPositionsDto> {
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
  /**
   * Account Leverage
   * @returns any Successful Response
   * @throws ApiError
   */
  public static accountLeverageApiAccountLeveragePost({ requestBody }: { requestBody: BatchAccountLeverageDto }): CancelablePromise<Record<string, any>> {
    return __request(OpenAPI, {
      method: 'POST',
      url: '/api/account/leverage',
      body: requestBody,
      mediaType: 'application/json',
      errors: {
        422: `Validation Error`,
      },
    })
  }
}
