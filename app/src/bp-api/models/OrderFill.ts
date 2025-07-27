/* generated using openapi-typescript-codegen -- do not edit */

/* istanbul ignore file */

/* tslint:disable */

/* eslint-disable */
import type { Side } from './Side'
import type { SystemOrderType } from './SystemOrderType'

export type OrderFill = {
  /**
   * Client id of the order.
   */
  clientId?: string
  /**
   * The fee charged on the fill.
   */
  fee: string
  /**
   * The asset that is charged as a fee.
   */
  feeSymbol: string
  /**
   * Whether the fill was made by the maker.
   */
  isMaker: boolean
  /**
   * The order ID of the fill.
   */
  orderId: string
  /**
   * The price of the fill.
   */
  price: string
  /**
   * The quantity of the fill.
   */
  quantity: string
  /**
   * The side of the fill.
   */
  side: Side
  /**
   * The market symbol of the fill.
   */
  symbol: string
  /**
   * The type of system order that triggered the fill.
   */
  systemOrderType?: SystemOrderType
  /**
   * The timestamp of the fill (UTC).
   */
  timestamp: string
  /**
   * The trade ID of the fill.
   */
  tradeId?: number
}
