/* generated using openapi-typescript-codegen -- do not edit */

/* istanbul ignore file */

/* tslint:disable */

/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise'
import { OpenAPI } from '../core/OpenAPI'
import { request as __request } from '../core/request'
import type { TokenDto_Output } from '../models/TokenDto_Output'

export class TokenService {
  /**
   * Token List
   * @returns TokenDto_Output Successful Response
   * @throws ApiError
   */
  public static tokenListApiTokensGet(): CancelablePromise<Array<TokenDto_Output>> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/api/tokens',
    })
  }
}
