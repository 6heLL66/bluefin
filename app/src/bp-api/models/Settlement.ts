/* generated using openapi-typescript-codegen -- do not edit */

/* istanbul ignore file */

/* tslint:disable */

/* eslint-disable */
import type { SettlementSource } from './SettlementSource'

export type Settlement = {
  /**
   * Quantity of the settlement.
   */
  quantity: string
  /**
   * Source of the settlement.
   */
  source: SettlementSource
  /**
   * ID of the subaccount the event is associated with, if any.
   */
  subaccountId?: number
  /**
   * The timestamp of the settlement (UTC).
   */
  timestamp: string
  /**
   * User ID of the account the movement is associated with.
   */
  userId: number
}
