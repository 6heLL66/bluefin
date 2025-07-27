/* generated using openapi-typescript-codegen -- do not edit */

/* istanbul ignore file */

/* tslint:disable */

/* eslint-disable */
import type { BorrowLendSide } from './BorrowLendSide'
import type { BorrowLendSource } from './BorrowLendSource'

export type BorrowLendPositionRow = {
  /**
   * ID of the borrow lend position the event is associated with.
   */
  positionId: string
  /**
   * Quantity of the borrow lend event.
   */
  quantity: string
  /**
   * Symbol of the asset the borrow lend is for.
   */
  symbol: string
  /**
   * Initial source of position.
   */
  source: BorrowLendSource
  /**
   * Cumulative interest payments quantity.
   */
  cumulativeInterest: string
  /**
   * Average interest rate over the time this position was open.
   */
  avgInterestRate: string
  /**
   * Borrow or lend.
   */
  side: BorrowLendSide
  /**
   * The timestamp the borrow lend event was created at (UTC).
   */
  createdAt: string
}
