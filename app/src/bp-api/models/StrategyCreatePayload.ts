/* generated using openapi-typescript-codegen -- do not edit */

/* istanbul ignore file */

/* tslint:disable */

/* eslint-disable */
import type { SelfTradePrevention } from './SelfTradePrevention'
import type { Side } from './Side'
import type { StrategyTypeEnum } from './StrategyTypeEnum'
import type { TimeInForce } from './TimeInForce'

export type StrategyCreatePayload = {
  /**
   * If true then the strategy's orders can lend. Spot margin only.
   */
  autoLend?: boolean
  /**
   * If true then the strategy's orders can redeem a lend if required. Spot
   * margin only.
   */
  autoLendRedeem?: boolean
  /**
   * If true then the strategy's orders can borrow. Spot margin only.
   */
  autoBorrow?: boolean
  /**
   * If true then the strategy's orders can repay a borrow. Spot margin only.
   */
  autoBorrowRepay?: boolean
  /**
   * Custom client strategy id.
   */
  clientStrategyId?: number
  /**
   * Strategy type.
   */
  strategyType: StrategyTypeEnum
  /**
   * The strategy quantity.
   */
  quantity?: string
  /**
   * The strategy limit price.
   */
  price?: string
  /**
   * Only post liquidity, do not take liquidity.
   */
  postOnly?: boolean
  /**
   * If true then the strategy's orders can only reduce the position.
   * Futures only.
   */
  reduceOnly?: boolean
  /**
   * Action to take if the user crosses themselves in the order book.
   */
  selfTradePrevention?: SelfTradePrevention
  /**
   * The side of the strategy.
   */
  side: Side
  /**
   * The market for the strategy.
   */
  symbol: string
  /**
   * How long the strategy's orders are good for.
   */
  timeInForce?: TimeInForce
  /**
   * Duration of the strategy.
   */
  duration?: number
  /**
   * Interval of the strategy.
   */
  interval?: number
  /**
   * Randomized interval quantity for the strategy.
   */
  randomizedIntervalQuantity?: boolean
}
