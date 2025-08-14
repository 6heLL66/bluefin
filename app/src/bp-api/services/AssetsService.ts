/* generated using openapi-typescript-codegen -- do not edit */

/* istanbul ignore file */

/* tslint:disable */

/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise'
import { OpenAPI } from '../core/OpenAPI'
import { request as __request } from '../core/request'
import type { CollateralSummary } from '../models/CollateralSummary'
import type { MarketAsset } from '../models/MarketAsset'

export class AssetsService {
  /**
   * Get assets.
   * Get all supported assets.
   * @returns MarketAsset Success.
   * @throws ApiError
   */
  public static getAssets(): CancelablePromise<Array<MarketAsset>> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/api/v1/assets',
      errors: {
        500: `Internal server error.`,
      },
    })
  }
  /**
   * Get collateral.
   * Get collateral parameters for assets.
   * @returns CollateralSummary Success.
   * @throws ApiError
   */
  public static getCollateralParameters(): CancelablePromise<Array<CollateralSummary>> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/api/v1/collateral',
      errors: {
        500: `Internal server error.`,
      },
    })
  }
}
