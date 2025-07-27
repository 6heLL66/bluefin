/* generated using openapi-typescript-codegen -- do not edit */

/* istanbul ignore file */

/* tslint:disable */

/* eslint-disable */
import type { CancelOrderTypeEnum } from './CancelOrderTypeEnum'

export type OrderCancelAllPayload = {
  /**
   * Market to cancel orders for.
   */
  symbol: string
  /**
   * Type of orders to cancel.
   */
  orderType?: CancelOrderTypeEnum
}
