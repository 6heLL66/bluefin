/* generated using openapi-typescript-codegen -- do not edit */

/* istanbul ignore file */

/* tslint:disable */

/* eslint-disable */
import type { Asset } from './Asset'
import type { PaymentType } from './PaymentType'

export type InterestPayment = {
  /**
   * Type of payment.
   */
  paymentType: PaymentType
  /**
   * The rate of interest.
   */
  interestRate: string
  /**
   * The interval duration of the payment.
   */
  interval: number
  /**
   * The market symbol for which the interest payment can be attributed. For
   * interest payments corresponding to borrow lend positions, this is
   * the spot market symbol. For interest payments corresponding to
   * unrealized pnl on futures markets, this will be the futures market
   * symbol.
   */
  marketSymbol: string
  /**
   * ID of the borrow lend position the interest payment is for.
   */
  positionId: string
  /**
   * Amount of the payment.
   */
  quantity: string
  /**
   * The symbol of the market asset the payment is associated with.
   */
  symbol: Asset
  /**
   * The timestamp for the borrow lending interest payment (UTC).
   */
  timestamp: string
}
