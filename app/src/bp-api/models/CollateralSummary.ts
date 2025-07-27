/* generated using openapi-typescript-codegen -- do not edit */

/* istanbul ignore file */

/* tslint:disable */

/* eslint-disable */
import type { CollateralFunction } from './CollateralFunction'
import type { PositionImfFunction } from './PositionImfFunction'

export type CollateralSummary = {
  /**
   * Symbol of the collateral.
   */
  symbol: string
  /**
   * IMF function.
   */
  imfFunction: PositionImfFunction
  /**
   * MMF function.
   */
  mmfFunction: PositionImfFunction
  /**
   * Calculates the haircut for collateral value.
   */
  haircutFunction: CollateralFunction
}
