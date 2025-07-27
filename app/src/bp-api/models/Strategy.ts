/* generated using openapi-typescript-codegen -- do not edit */

/* istanbul ignore file */

/* tslint:disable */

/* eslint-disable */
import type { SelfTradePrevention } from './SelfTradePrevention'
import type { Side } from './Side'
import type { StrategyCrankCancelReason } from './StrategyCrankCancelReason'
import type { StrategyStatus } from './StrategyStatus'
import type { StrategyTypeEnum } from './StrategyTypeEnum'
import type { TimeInForce } from './TimeInForce'

export type Strategy = {
  /**
   * Unique ID of the strategy.
   */
  id: string
  /**
   * Time the strategy was created.
   */
  createdAt: string
  /**
   * Quantity of the strategy that has been filled.
   */
  executedQuantity?: string
  /**
   * Quote quantity of the strategy that has been filled.
   */
  executedQuoteQuantity?: string
  /**
   * Strategy cancel reason.
   */
  cancelReason?: StrategyCrankCancelReason
  /**
   * Type of strategy.
   */
  strategyType: StrategyTypeEnum
  /**
   * Quantity of the strategy.
   */
  quantity?: string
  /**
   * Self trade prevention setting of the strategy's orders.
   */
  selfTradePrevention: SelfTradePrevention
  /**
   * Status of the strategy.
   */
  status: StrategyStatus
  /**
   * Side of the strategy.
   */
  side: Side
  /**
   * Market symbol of the strategy.
   */
  symbol: string
  /**
   * Time in force of the strategy.
   */
  timeInForce: TimeInForce
  /**
   * Custom order strategy ID.
   */
  clientStrategyId?: number
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
  randomizedIntervalQuantity: boolean
}
