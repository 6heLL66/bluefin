/* generated using openapi-typescript-codegen -- do not edit */

/* istanbul ignore file */

/* tslint:disable */

/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise'
import { OpenAPI } from '../core/OpenAPI'
import { request as __request } from '../core/request'
import type { OrderCancelDto } from '../models/OrderCancelDto'
import type { OrderCreateDto } from '../models/OrderCreateDto'

export class OrderService {
  /**
   * Order Create
   * @returns any Successful Response
   * @throws ApiError
   */
  public static orderCreateApiOrdersPost({
    requestBody,
  }: {
    requestBody: OrderCreateDto
  }): CancelablePromise<any> {
    return __request(OpenAPI, {
      method: 'POST',
      url: '/api/orders',
      body: requestBody,
      mediaType: 'application/json',
      errors: {
        422: `Validation Error`,
      },
    })
  }
  /**
   * Order Cancel
   * @returns any Successful Response
   * @throws ApiError
   */
  public static orderCancelApiOrdersCancelPost({
    requestBody,
  }: {
    requestBody: OrderCancelDto
  }): CancelablePromise<any> {
    return __request(OpenAPI, {
      method: 'POST',
      url: '/api/orders/cancel',
      body: requestBody,
      mediaType: 'application/json',
      errors: {
        422: `Validation Error`,
      },
    })
  }
}
