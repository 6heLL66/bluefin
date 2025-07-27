/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type Depth = {
  /**
   * Asks on the order book.
   */
  asks: Array<Array<string>>
  /**
   * Bids on the order book.
   */
  bids: Array<Array<string>>
  /**
   * Update ID that caused the last change to the order book depth.
   */
  lastUpdateId: string
  /**
   * Matching engine timestamp in microseconds.
   */
  timestamp: number
}
