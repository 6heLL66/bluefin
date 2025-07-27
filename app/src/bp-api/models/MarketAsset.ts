/* generated using openapi-typescript-codegen -- do not edit */

/* istanbul ignore file */

/* tslint:disable */

/* eslint-disable */
import type { Asset } from './Asset'
import type { Token } from './Token'

export type MarketAsset = {
  /**
   * Symbol of the asset, e.g. ETH.
   */
  symbol: Asset
  /**
   * Display name of the asset.
   */
  displayName: string
  /**
   * Coingecko ID of the asset.
   */
  coingeckoId?: string
  /**
   * Token on each blockchain the asset is available on.
   */
  tokens: Array<Token>
}
