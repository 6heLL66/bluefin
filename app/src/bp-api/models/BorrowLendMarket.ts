/* generated using openapi-typescript-codegen -- do not edit */

/* istanbul ignore file */

/* tslint:disable */

/* eslint-disable */
import type { Asset } from './Asset'
import type { BorrowLendBookState } from './BorrowLendBookState'

/**
 * Borrow Lending market summary.
 */
export type BorrowLendMarket = {
  /**
   * State of the borrow lend market.
   */
  state: BorrowLendBookState
  /**
   * Mark price of spot instrument.
   */
  assetMarkPrice: string
  /**
   * The rate borrowers pay.
   */
  borrowInterestRate: string
  /**
   * The amount of assets borrowed from the pool.
   */
  borrowedQuantity: string
  /**
   * The fee that the exchange takes on borrow lend yield.
   */
  fee: string
  /**
   * The APY rate lenders receive.
   */
  lendInterestRate: string
  /**
   * The amount of assets lent to the pool.
   */
  lentQuantity: string
  /**
   * The max amount of utilization that can be used by borrowing or redeeming
   * lend, irrespsective of the throttle.
   */
  maxUtilization: string
  /**
   * Can't increase borrows or lends pass this threshold. It's possible
   * this is less than the outstanding amount. If that's the case, then
   * it simply prevents new borrow or lends from being created.
   */
  openBorrowLendLimit: string
  /**
   * The optimal utilization rate for the interest rate model.
   */
  optimalUtilization: string
  /**
   * Uniquely identifies the token.
   */
  symbol: Asset
  /**
   * Timestamp of the summary.
   */
  timestamp: string
  /**
   * The threshold that triggers borrow throttling.
   */
  throttleUtilizationThreshold: string
  /**
   * The max utilization threhsold for any given timestep. Any borrow
   * or lend redemption should fail if it puts utilization above this
   * (with the exception of liquidations).
   */
  throttleUtilizationBound: string
  /**
   * Hyper-param determining the max utilization can increase during any
   * timestep.
   */
  throttleUpdateFraction: string
  /**
   * Utilisation.
   */
  utilization: string
  /**
   * Step Size.
   */
  stepSize: string
}
