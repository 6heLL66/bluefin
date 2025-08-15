/* generated using openapi-typescript-codegen -- do not edit */

/* istanbul ignore file */

/* tslint:disable */

/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise'
import { OpenAPI } from '../core/OpenAPI'
import { request as __request } from '../core/request'

export class BackpackService {
  /**
   * Proxy
   * @returns any Successful Response
   * @throws ApiError
   */
  public static proxyApiBackpackPathOptions({ path }: { path: string }): CancelablePromise<any> {
    return __request(OpenAPI, {
      method: 'OPTIONS',
      url: '/api/backpack/{path}',
      path: {
        path: path,
      },
      errors: {
        422: `Validation Error`,
      },
    })
  }
  /**
   * Proxy
   * @returns any Successful Response
   * @throws ApiError
   */
  public static proxyApiBackpackPathOptions1({ path }: { path: string }): CancelablePromise<any> {
    return __request(OpenAPI, {
      method: 'DELETE',
      url: '/api/backpack/{path}',
      path: {
        path: path,
      },
      errors: {
        422: `Validation Error`,
      },
    })
  }
  /**
   * Proxy
   * @returns any Successful Response
   * @throws ApiError
   */
  public static proxyApiBackpackPathOptions2({ path }: { path: string }): CancelablePromise<any> {
    return __request(OpenAPI, {
      method: 'PUT',
      url: '/api/backpack/{path}',
      path: {
        path: path,
      },
      errors: {
        422: `Validation Error`,
      },
    })
  }
  /**
   * Proxy
   * @returns any Successful Response
   * @throws ApiError
   */
  public static proxyApiBackpackPathOptions3({ path }: { path: string }): CancelablePromise<any> {
    return __request(OpenAPI, {
      method: 'POST',
      url: '/api/backpack/{path}',
      path: {
        path: path,
      },
      errors: {
        422: `Validation Error`,
      },
    })
  }
  /**
   * Proxy
   * @returns any Successful Response
   * @throws ApiError
   */
  public static proxyApiBackpackPathOptions4({ path }: { path: string }): CancelablePromise<any> {
    return __request(OpenAPI, {
      method: 'PATCH',
      url: '/api/backpack/{path}',
      path: {
        path: path,
      },
      errors: {
        422: `Validation Error`,
      },
    })
  }
  /**
   * Proxy
   * @returns any Successful Response
   * @throws ApiError
   */
  public static proxyApiBackpackPathOptions5({ path }: { path: string }): CancelablePromise<any> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/api/backpack/{path}',
      path: {
        path: path,
      },
      errors: {
        422: `Validation Error`,
      },
    })
  }
}
