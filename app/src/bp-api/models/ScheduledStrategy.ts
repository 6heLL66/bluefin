/* generated using openapi-typescript-codegen -- do not edit */

/* istanbul ignore file */

/* tslint:disable */

/* eslint-disable */
import type { SelfTradePrevention } from './SelfTradePrevention'
import type { Side } from './Side'
import type { StrategyStatus } from './StrategyStatus'
import type { TimeInForce } from './TimeInForce'

export type ScheduledStrategy = {
  /**
   * ID of the strategy.
   */
  id: string
  /**
   * Custom client strategy ID.
   */
  clientStrategyId?: number
  /**
   * Time the strategey was created.
   */
  createdAt: number
  /**
   * Quantity that has been filled.
   */
  executedQuantity: string
  /**
   * Quote quantity that has been filled.
   */
  executedQuoteQuantity: string
  /**
   * Quantity to fill.
   */
  quantity: string
  /**
   * True if reducing a futures position.
   */
  reduceOnly?: boolean
  /**
   * Action to take in the event the user crosses themselves in the
   * order book.
   */
  selfTradePrevention: SelfTradePrevention
  /**
   * Status of the strategy.
   */
  status: StrategyStatus
  /**
   * The strategy side. The strategy's orders will be matched against the
   * resting orders on the other side of the order book.
   */
  side: Side
  /**
   * Market symbol.
   */
  symbol: string
  /**
   * How long the strategy's orders is good for.
   */
  timeInForce: TimeInForce
  /**
   * Duration of the strategy in milliseconds.
   */
  duration: number
  /**
   * Interval of the strategy in milliseconds.
   */
  interval: number
  /**
   * Determines whether the strategy will execute a randomized interval
   * quantity.
   */
  randomizedIntervalQuantity?: boolean
}
