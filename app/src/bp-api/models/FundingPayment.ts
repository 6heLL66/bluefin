/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type FundingPayment = {
  /**
   * User id of the account the payment is associated with.
   */
  userId: number
  /**
   * Id of the subaccount the payment is associated with, if any.
   */
  subaccountId?: number
  /**
   * The symbol of the market the payment is associated with.
   */
  symbol: string
  /**
   * Quantity of the payment. Positive if received, negative if paid.
   */
  quantity: string
  /**
   * The end of the funding interval for the payment.
   */
  intervalEndTimestamp: string
  /**
   * The funding rate for the payment.
   */
  fundingRate: string
}
