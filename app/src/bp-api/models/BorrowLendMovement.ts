/* generated using openapi-typescript-codegen -- do not edit */

/* istanbul ignore file */

/* tslint:disable */

/* eslint-disable */
import type { BorrowLendEventType } from './BorrowLendEventType'
import type { BorrowLendSource } from './BorrowLendSource'

export type BorrowLendMovement = {
  /**
   * Type of event.
   */
  eventType: BorrowLendEventType
  /**
   * ID of the borrow lend position the event is associated with.
   */
  positionId: string
  /**
   * Running total quantity of borrow lend position.
   */
  positionQuantity?: string
  /**
   * Quantity of the borrow lend event.
   */
  quantity: string
  /**
   * Source of the borrow lend event.
   */
  source: BorrowLendSource
  /**
   * Symbol of the asset the borrow lend is for.
   */
  symbol: string
  /**
   * The timestamp of the borrow lend event (UTC).
   */
  timestamp: string
  /**
   * The order id associated with the borrow lend event created through spot
   * margin.
   */
  spotMarginOrderId?: string
}
