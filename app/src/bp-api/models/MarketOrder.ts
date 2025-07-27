/* generated using openapi-typescript-codegen -- do not edit */

/* istanbul ignore file */

/* tslint:disable */

/* eslint-disable */
import type { OrderStatus } from './OrderStatus'
import type { SelfTradePrevention } from './SelfTradePrevention'
import type { Side } from './Side'
import type { TimeInForce } from './TimeInForce'

export type MarketOrder = {
  /**
   * Unique ID of this order.
   */
  id: string
  /**
   * Custom order ID.
   */
  clientId?: number
  /**
   * Time the order was created.
   */
  createdAt: number
  /**
   * Quantity that has been filled.
   */
  executedQuantity: string
  /**
   * Quantity of the quote asset that has been filled.
   */
  executedQuoteQuantity: string
  /**
   * Quantity to fill.
   */
  quantity?: string
  /**
   * Quantity of the quote asset to fill.
   */
  quoteQuantity?: string
  /**
   * True if reducing a futures position.
   */
  reduceOnly?: boolean
  /**
   * How long the order is good for.
   */
  timeInForce: TimeInForce
  /**
   * Action to take in the event the user crosses themselves in the
   * order book. Default is `RejectTaker`.
   */
  selfTradePrevention: SelfTradePrevention
  /**
   * The order side. It will be matched against the resting orders on the
   * other side of the order book.
   */
  side: Side
  /**
   * Status of the order.
   */
  status: OrderStatus
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
   * Market symbol.
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
   * Reference price that should trigger the order.
   */
  triggerBy?: string
  /**
   * Price the order should trigger at, if any.
   */
  triggerPrice?: string
  /**
   * Quantity for trigger orders.
   */
  triggerQuantity?: string
  triggeredAt?: number
  /**
   * The ID of the related order. This may refer to a parent order or,
   * for a trigger order, the order this trigger is for.
   */
  relatedOrderId?: string
  /**
   * Strategy ID of the order, if any.
   */
  strategyId?: string
}
