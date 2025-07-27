/* generated using openapi-typescript-codegen -- do not edit */

/* istanbul ignore file */

/* tslint:disable */

/* eslint-disable */
import type { OrderExpiryReason } from './OrderExpiryReason'
import type { OrderStatus } from './OrderStatus'
import type { OrderTypeEnum } from './OrderTypeEnum'
import type { SelfTradePrevention } from './SelfTradePrevention'
import type { Side } from './Side'
import type { SystemOrderType } from './SystemOrderType'
import type { TimeInForce } from './TimeInForce'

export type Order = {
  /**
   * Unique ID of the order.
   */
  id: string
  /**
   * Time the order was created.
   */
  createdAt: string
  /**
   * Quantity of the order that has been filled.
   */
  executedQuantity?: string
  /**
   * Quantity of the order that has been filled in the quote asset.
   */
  executedQuoteQuantity?: string
  /**
   * Order expiry reason.
   */
  expiryReason?: OrderExpiryReason
  /**
   * Type of order.
   */
  orderType: OrderTypeEnum
  /**
   * Whether the order is post only or not.
   */
  postOnly?: boolean
  /**
   * Price that the order was submitted at (if `orderType` is `Limit`)
   */
  price?: string
  /**
   * Quantity of the order.
   */
  quantity?: string
  /**
   * Quantity of the order in quote the quote asset.
   */
  quoteQuantity?: string
  /**
   * Self trade prevention setting of the order. Default is `RejectTaker`.
   */
  selfTradePrevention: SelfTradePrevention
  /**
   * Status of the order.
   */
  status: OrderStatus
  /**
   * Side of the order.
   */
  side: Side
  /**
   * Stop loss price (price the stop loss order will be triggered at).
   */
  stopLossTriggerPrice?: string
  /**
   * Stop loss limit price. If set the stop loss will be a limit order,
   * otherwise it will be a market order.
   */
  stopLossLimitPrice?: string
  /**
   * Reference price that should trigger the stop loss order.
   */
  stopLossTriggerBy?: string
  /**
   * Market symbol of the order.
   */
  symbol: string
  /**
   * Take profit price (price the take profit order will be triggered at).
   */
  takeProfitTriggerPrice?: string
  /**
   * Take profit limit price. If set the take profit will be a limit order,
   * otherwise it will be a market order.
   */
  takeProfitLimitPrice?: string
  /**
   * Reference price that should trigger the take profit order.
   */
  takeProfitTriggerBy?: string
  /**
   * Time in force of the order.
   */
  timeInForce: TimeInForce
  /**
   * Reference price that should trigger the order.
   */
  triggerBy?: string
  /**
   * Price the order was set to trigger at.
   */
  triggerPrice?: string
  /**
   * Trigger quantity.
   */
  triggerQuantity?: string
  /**
   * Custom order ID.
   */
  clientId?: number
  /**
   * The type of system order, if applicable.
   */
  systemOrderType?: SystemOrderType
  /**
   * Strategy ID of the order, if any.
   */
  strategyId?: string
}
