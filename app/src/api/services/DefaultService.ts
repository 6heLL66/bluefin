/* generated using openapi-typescript-codegen -- do not edit */

/* istanbul ignore file */

/* tslint:disable */

/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise'
import { OpenAPI } from '../core/OpenAPI'
import { request as __request } from '../core/request'
import type { PrivateKeyDto } from '../models/PrivateKeyDto'
import type { TokenResponseDto } from '../models/TokenResponseDto'

export class DefaultService {
  /**
   * Get Token
   * @returns TokenResponseDto Successful Response
   * @throws ApiError
   */
  public static getTokenApiAuthTokenPost({
    requestBody,
  }: {
    requestBody: PrivateKeyDto
  }): CancelablePromise<TokenResponseDto> {
    return __request(OpenAPI, {
      method: 'POST',
      url: '/api/auth/token',
      body: requestBody,
      mediaType: 'application/json',
      errors: {
        422: `Validation Error`,
      },
    })
  }
}
