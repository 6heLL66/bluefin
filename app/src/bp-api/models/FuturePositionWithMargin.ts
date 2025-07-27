/* generated using openapi-typescript-codegen -- do not edit */

/* istanbul ignore file */

/* tslint:disable */

/* eslint-disable */
import type { PositionImfFunction } from './PositionImfFunction'

export type FuturePositionWithMargin = {
  /**
   * Break-even price for this position.
   */
  breakEvenPrice: string
  /**
   * Entry price for this position.
   */
  entryPrice: string
  /**
   * Estimated liquidation price for this position.
   */
  estLiquidationPrice: string
  /**
   * Initial margin fraction for this position.
   */
  imf: string
  /**
   * IMF function.
   */
  imfFunction: PositionImfFunction
  /**
   * Mark price for this position's market.
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
   * Positive if long. Negative if short.
   *
   * The net cost to enter into the position,i.e., price*quantity for
   * all positions adjusting this position.
   */
  netCost: string
  /**
   * Positive if long. Negative if short.
   */
  netQuantity: string
  /**
   * Quantity of this futures position including worst case open positions.
   */
  netExposureQuantity: string
  /**
   * Notional value of the futures position including worst case open
   * positions.
   */
  netExposureNotional: string
  /**
   * Aggregates the amount of pnl realized on this position since opening.
   */
  pnlRealized: string
  /**
   * Unrealized profit and loss for this position.
   */
  pnlUnrealized: string
  /**
   * Cumulative funding payment for this position.
   */
  cumulativeFundingPayment: string
  /**
   * ID of the user subaccount that the position is for.
   */
  subaccountId?: number
  /**
   * Future to which this position belongs.
   */
  symbol: string
  /**
   * Id of the user.
   */
  userId: number
  /**
   * Id of the position.
   */
  positionId: string
  /**
   * Cumulative interest paid for this position's unrealized pnl.
   */
  cumulativeInterest: string
}
