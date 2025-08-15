/* generated using openapi-typescript-codegen -- do not edit */

/* istanbul ignore file */

/* tslint:disable */

/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise'
import { OpenAPI } from '../core/OpenAPI'
import { request as __request } from '../core/request'
import type { OrderCreateWithTokenDto } from '../models/OrderCreateWithTokenDto'

export class DefaultService {
  /**
   * Accounts Orders V2
   * @returns any Successful Response
   * @throws ApiError
   */
  public static accountsOrdersV2ApiV2OrdersPost({ requestBody }: { requestBody: OrderCreateWithTokenDto }): CancelablePromise<any> {
    return __request(OpenAPI, {
      method: 'POST',
      url: '/api/v2/orders',
      body: requestBody,
      mediaType: 'application/json',
      errors: {
        422: `Validation Error`,
      },
    })
  }
}
