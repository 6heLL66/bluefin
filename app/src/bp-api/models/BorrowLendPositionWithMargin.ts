/* generated using openapi-typescript-codegen -- do not edit */

/* istanbul ignore file */

/* tslint:disable */

/* eslint-disable */
import type { Asset } from './Asset'
import type { PositionImfFunction } from './PositionImfFunction'

export type BorrowLendPositionWithMargin = {
  /**
   * Cumulative interest payments quantity.
   */
  cumulativeInterest: string
  /**
   * Uniquely identifies the position.
   */
  id: string
  /**
   * Initial margin fraction for this position.
   */
  imf: string
  /**
   * IMF function.
   */
  imfFunction: PositionImfFunction
  /**
   * Net quantity of the position, positive if long, negative if short.
   */
  netQuantity: string
  /**
   * Mark price of the underlying asset.
   */
  markPrice: string
  /**
   * Maintenance margin fraction for this position.
   */
  mmf: string
  /**
   * MMF function.
   */
  mmfFunction: PositionImfFunction
  /**
   * Net exposure of the position, positive if long, negative if short. Lends
   * have no exposure.
   */
  netExposureQuantity: string
  /**
   * Notional value of the position.
   */
  netExposureNotional: string
  /**
   * Symbol of the underlying asset.
   */
  symbol: Asset
}
