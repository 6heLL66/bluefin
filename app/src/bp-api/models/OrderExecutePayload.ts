/* generated using openapi-typescript-codegen -- do not edit */

/* istanbul ignore file */

/* tslint:disable */

/* eslint-disable */
import type { OrderTypeEnum } from './OrderTypeEnum'
import type { SelfTradePrevention } from './SelfTradePrevention'
import type { Side } from './Side'
import type { TimeInForce } from './TimeInForce'

export type OrderExecutePayload = {
  /**
   * If true then the order can lend. Spot margin only.
   */
  autoLend?: boolean
  /**
   * If true then the order can redeem a lend if required. Spot margin only.
   */
  autoLendRedeem?: boolean
  /**
   * If true then the order can borrow. Spot margin only.
   */
  autoBorrow?: boolean
  /**
   * If true then the order can repay a borrow. Spot margin only.
   */
  autoBorrowRepay?: boolean
  /**
   * Custom order id.
   */
  clientId?: number
  /**
   * Order type, market or limit.
   */
  orderType: OrderTypeEnum
  /**
   * Only post liquidity, do not take liquidity.
   */
  postOnly?: boolean
  /**
   * The order price if this is a limit order.
   */
  price?: string
  /**
   * The order quantity. Market orders must specify either a `quantity` or
   * `quoteQuantity`. All other order types must specify a `quantity`.
   */
  quantity?: string
  /**
   * The maximum amount of the quote asset to spend (Ask) or receive (Bid)
   * for market orders. This is used for reverse market orders. The
   * order book will execute a `quantity` as close as possible to the
   * notional value of `quoteQuantity`.
   */
  quoteQuantity?: string
  /**
   * If true then the order can only reduce the positon. Futures only.
   */
  reduceOnly?: boolean
  /**
   * Action to take if the user crosses themselves in the order book.
   */
  selfTradePrevention?: SelfTradePrevention
  /**
   * Order will be matched against the resting orders on the other side of
   * the order book.
   */
  side: Side
  /**
   * Stop loss limit price. If set the stop loss will be a limit order.
   */
  stopLossLimitPrice?: string
  /**
   * Reference price that should trigger the stop loss order.
   */
  stopLossTriggerBy?: string
  /**
   * Stop loss price (price the stop loss order will be triggered at).
   */
  stopLossTriggerPrice?: string
  /**
   * The market for the order.
   */
  symbol: string
  /**
   * Take profit limit price. If set the take profit will be a limit order,
   */
  takeProfitLimitPrice?: string
  /**
   * Reference price that should trigger the take profit order.
   */
  takeProfitTriggerBy?: string
  /**
   * Take profit price (price the take profit order will be triggered at).
   */
  takeProfitTriggerPrice?: string
  /**
   * How long the order is good for.
   */
  timeInForce?: TimeInForce
  /**
   * Trigger by.
   */
  triggerBy?: string
  /**
   * Trigger price if this is a conditional order.
   */
  triggerPrice?: string
  /**
   * Trigger quantity type if this is a trigger order.
   */
  triggerQuantity?: string
}
