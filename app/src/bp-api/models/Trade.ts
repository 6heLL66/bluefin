/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type Trade = {
  /**
   * Id of the trade.
   */
  id?: number
  /**
   * Price of the trade.
   */
  price: string
  /**
   * Quantity of the trade in the base asset.
   */
  quantity: string
  /**
   * Quantity of the trade in the quote asset.
   */
  quoteQuantity: string
  /**
   * Timestamp of the trade (server time).
   */
  timestamp: number
  /**
   * Whether the buyer was the maker order.
   */
  isBuyerMaker: boolean
}
