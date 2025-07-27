/* generated using openapi-typescript-codegen -- do not edit */

/* istanbul ignore file */

/* tslint:disable */

/* eslint-disable */
import type { StrategyTypeEnum } from './StrategyTypeEnum'

export type StrategyCancelAllPayload = {
  /**
   * Market to cancel strategies for.
   */
  symbol: string
  /**
   * Type of strategies to cancel.
   */
  strategyType?: StrategyTypeEnum
}
